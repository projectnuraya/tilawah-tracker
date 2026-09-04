import {
	apiError,
	apiSuccess,
	NotFoundError,
	requireAuth,
	requireGroupAccess,
	ValidationError,
} from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { juzTally, newAssignment, nextJuz, takeLeastUsedJuz, TOTAL_JUZ } from '@/components/lib/juz'
import { logger } from '@/components/lib/logger'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { PERIOD_STATUS, PROGRESS } from '@/components/lib/status'
import { createPeriodSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * POST /api/v1/groups/[id]/periods
 * Create a new period
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id: groupId } = await params

		// Rate limit: 30 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.write(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		await requireGroupAccess(session.user.id, groupId)

		let body
		try {
			body = await request.json()
		} catch (err) {
			logger.error({ err }, 'Failed to parse JSON in request body')
			throw new ValidationError('Isi permintaan tidak valid.')
		}
		const validation = validateInput(createPeriodSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message, validation.error.details)
		}

		const { startDate } = validation.data

		// Check if group exists
		const group = await prisma.group.findUnique({
			where: { id: groupId },
			include: {
				periods: {
					where: { status: PERIOD_STATUS.active },
					take: 1,
				},
				participants: {
					where: { isActive: true },
				},
			},
		})

		if (!group) {
			throw new NotFoundError('Grup tidak ditemukan.')
		}

		// These two are the most common outcomes of the Monday flow, so they must reach the
		// coordinator as readable 400s. They used to be passed to apiError() as plain object
		// literals, and apiError dispatches on `instanceof` — so both fell through to the 500
		// branch and surfaced as "An unexpected error occurred".
		if (group.periods.length > 0) {
			throw new ValidationError('Masih ada periode aktif. Kunci periode itu dulu sebelum memulai yang baru.')
		}

		if (group.participants.length === 0) {
			throw new ValidationError('Tambahkan minimal satu peserta sebelum memulai periode.')
		}

		// Period runs Monday–Sunday, and both columns are `@db.Date`, so the arithmetic has to stay
		// on the UTC calendar the date-only string parsed into. The previous
		// `end.setDate(end.getDate() + 6)` mutated *local* fields instead, which lands on the wrong
		// day in zones whose DST shift is not a whole hour (Australia/Lord_Howe, Pacific/Chatham):
		// startDate 2024-09-30 stored an end date of 10-05 rather than 10-06.
		//
		// date-fns is the house convention, but its addDays is local-field arithmetic too and fails
		// identically, so this one stays explicitly UTC.
		const start = new Date(startDate)
		const end = new Date(start)
		end.setUTCDate(end.getUTCDate() + 6)

		// Get the last period number
		const lastPeriod = await prisma.period.findFirst({
			where: { groupId },
			orderBy: { periodNumber: 'desc' },
			include: {
				participantPeriods: true,
			},
		})

		const periodNumber = (lastPeriod?.periodNumber || 0) + 1

		// Create period and participant periods in transaction
		// Key logic: auto-rotate juz for returning participants, keep missed juz, assign new participants
		const period = await prisma.$transaction(async (tx) => {
			// Create the period record
			const newPeriod = await tx.period.create({
				data: {
					groupId,
					periodNumber,
					startDate: start,
					endDate: end,
					status: PERIOD_STATUS.active,
					isArchived: false,
				},
			})

			// Create participant periods with juz assignment logic
			if (lastPeriod && lastPeriod.participantPeriods.length > 0) {
				// Previous assignments, so returning participants can rotate off what they had
				const previous = new Map(lastPeriod.participantPeriods.map((pp) => [pp.participantId, pp]))

				// Running tally of the new period's juz load. This used to be re-queried with a
				// groupBy inside the loop — one round trip per new participant — and the tally was
				// stale anyway, since rows created earlier in the same transaction were counted only
				// after the next query. Counting in memory is both correct and a single pass.
				const tally = juzTally()
				const rows = []

				for (const participant of group.participants) {
					const last = previous.get(participant.id)

					if (last) {
						// Returning participant: advance one juz, and carry the missed streak forward
						const juz = nextJuz(last.juzNumber)
						tally.set(juz, (tally.get(juz) ?? 0) + 1)
						const streak = last.progressStatus === PROGRESS.missed ? last.missedStreak + 1 : 0
						rows.push(newAssignment(participant.id, newPeriod.id, juz, streak))
					} else {
						// New participant: take whichever juz is carrying the fewest people
						rows.push(newAssignment(participant.id, newPeriod.id, takeLeastUsedJuz(tally)))
					}
				}

				await tx.participantPeriod.createMany({ data: rows })
			} else {
				// First period for this group: spread everyone round-robin across juz 1–30
				await tx.participantPeriod.createMany({
					data: group.participants.map((participant, i) =>
						newAssignment(participant.id, newPeriod.id, (i % TOTAL_JUZ) + 1),
					),
				})
			}

			return newPeriod
		})

		return apiSuccess(
			{
				id: period.id,
				groupId: period.groupId,
				periodNumber: period.periodNumber,
				startDate: period.startDate,
				endDate: period.endDate,
				status: period.status,
				participantCount: group.participants.length,
			},
			201,
		)
	} catch (error) {
		return apiError(error)
	}
}
