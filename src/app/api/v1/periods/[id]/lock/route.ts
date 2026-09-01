import { apiError, apiSuccess, ForbiddenError, NotFoundError, requireAuth, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * POST /api/v1/periods/[id]/lock
 * Lock a period - marks it as immutable and auto-marks all unfinished as "missed"
 * Once locked, no progress or juz changes can be made. Preserves historical data.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		// Rate limit: 30 requests per minute — locking is irreversible
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.write(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		// Get period with access check via coordinator-group relationship
		const period = await prisma.period.findUnique({
			where: { id },
			include: {
				group: {
					include: {
						coordinatorGroups: {
							where: { coordinatorId: session.user.id },
						},
					},
				},
			},
		})

		if (!period) {
			throw new NotFoundError('Periode tidak ditemukan.')
		}

		if (period.group.coordinatorGroups.length === 0) {
			throw new ForbiddenError('Anda tidak punya akses ke periode ini.')
		}

		// Cannot lock an already locked period
		if (period.status === 'locked') {
			throw new ValidationError('Periode ini sudah terkunci.')
		}

		// Lock period and auto-mark all incomplete as "missed" in a transaction
		// This ensures consistency and auto-calculates missed streaks
		const lockedPeriod = await prisma.$transaction(async (tx) => {
			// Auto-mark participants who didn't finish as "missed"
			// This is recorded in the missed streak for future period rotations
			await tx.participantPeriod.updateMany({
				where: {
					periodId: id,
					progressStatus: 'not_finished',
				},
				data: {
					progressStatus: 'missed',
				},
			})

			// Lock the period - no further updates allowed
			return tx.period.update({
				where: { id },
				data: {
					status: 'locked',
					lockedAt: new Date(),
				},
			})
		})

		// Get updated stats for response
		const stats = await prisma.participantPeriod.groupBy({
			by: ['progressStatus'],
			where: { periodId: id },
			_count: { progressStatus: true },
		})

		const statusCounts = {
			finished: 0,
			not_finished: 0,
			missed: 0,
		}

		for (const s of stats) {
			statusCounts[s.progressStatus as keyof typeof statusCounts] = s._count.progressStatus
		}

		return apiSuccess({
			id: lockedPeriod.id,
			status: lockedPeriod.status,
			lockedAt: lockedPeriod.lockedAt,
			statusCounts,
		})
	} catch (error) {
		return apiError(error)
	}
}
