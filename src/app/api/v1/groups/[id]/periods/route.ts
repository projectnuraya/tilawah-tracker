import {
	apiError,
	apiSuccess,
	NotFoundError,
	requireAuth,
	requireGroupAccess,
	ValidationError,
} from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { createPeriodSchema, listPeriodsSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * GET /api/v1/groups/[id]/periods
 * List all periods for a group
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id: groupId } = await params

		await requireGroupAccess(session.user.id, groupId)

		const url = new URL(request.url)
		const queryValidation = validateInput(listPeriodsSchema, {
			limit: url.searchParams.get('limit'),
			includeArchived: url.searchParams.get('includeArchived'),
		})

		if (!queryValidation.success) {
			throw new ValidationError(queryValidation.error.message)
		}

		const { limit, includeArchived } = queryValidation.data

		const periods = await prisma.period.findMany({
			where: {
				groupId,
				...(includeArchived ? {} : { isArchived: false }),
			},
			orderBy: { periodNumber: 'desc' },
			take: limit,
			include: {
				_count: {
					select: { participantPeriods: true },
				},
			},
		})

		// Get summary stats for each period
		const periodsWithStats = await Promise.all(
			periods.map(async (period) => {
				const stats = await prisma.participantPeriod.groupBy({
					by: ['progressStatus'],
					where: { periodId: period.id },
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

				return {
					...period,
					participantCount: period._count.participantPeriods,
					statusCounts,
				}
			}),
		)

		return apiSuccess(periodsWithStats)
	} catch (error) {
		return apiError(error)
	}
}

/**
 * POST /api/v1/groups/[id]/periods
 * Create a new period
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id: groupId } = await params

		await requireGroupAccess(session.user.id, groupId)

		const body = await request.json()
		const validation = validateInput(createPeriodSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
		}

		const { startDate } = validation.data

		// Check if group exists
		const group = await prisma.group.findUnique({
			where: { id: groupId },
			include: {
				periods: {
					where: { status: 'active' },
					take: 1,
				},
				participants: {
					where: { isActive: true },
				},
			},
		})

		if (!group) {
			throw new NotFoundError('Group not found')
		}

		// Check if there's already an active period
		if (group.periods.length > 0) {
			return apiError({
				name: 'ValidationError',
				message: 'There is already an active period. Lock it first before creating a new one.',
			})
		}

		// Check if there are active participants
		if (group.participants.length === 0) {
			return apiError({
				name: 'ValidationError',
				message: 'Add at least one participant before creating a period.',
			})
		}

		// Calculate end date (start + 6 days = 7 days total)
		const start = new Date(startDate)
		const end = new Date(start)
		end.setDate(end.getDate() + 6)

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
					status: 'active',
					isArchived: false,
				},
			})

			// Create participant periods with juz assignment logic
			if (lastPeriod && lastPeriod.participantPeriods.length > 0) {
				// Build map of previous assignments for existing participants
				const previousAssignments = new Map<string, { juzNumber: number; status: string; missedStreak: number }>()
				for (const pp of lastPeriod.participantPeriods) {
					previousAssignments.set(pp.participantId, {
						juzNumber: pp.juzNumber,
						status: pp.progressStatus,
						missedStreak: pp.missedStreak,
					})
				}

				// Assign juz for each active participant in the new period
				for (const participant of group.participants) {
					const previous = previousAssignments.get(participant.id)
					let newJuz: number
					let newMissedStreak = 0

					if (previous !== undefined) {
						// Existing participant: check previous status
						if (previous.status === 'missed') {
							// Keep same juz to retry and track missed streak
							newJuz = previous.juzNumber
							newMissedStreak = previous.missedStreak + 1
						} else {
							// Rotate to next juz: 1→2, 2→3, ..., 30→1
							newJuz = previous.juzNumber === 30 ? 1 : previous.juzNumber + 1
							newMissedStreak = 0
						}
					} else {
						// New participant: find least-assigned juz for load balancing
						const juzCounts = await tx.participantPeriod.groupBy({
							by: ['juzNumber'],
							where: { periodId: newPeriod.id },
							_count: { juzNumber: true },
						})

						const countMap = new Map<number, number>()
						for (let i = 1; i <= 30; i++) {
							countMap.set(i, 0)
						}
						for (const jc of juzCounts) {
							countMap.set(jc.juzNumber, jc._count.juzNumber)
						}

						let minCount = Infinity
						newJuz = 1
						for (const [juz, count] of countMap) {
							if (count < minCount) {
								minCount = count
								newJuz = juz
							}
						}
					}

					// Create the participant-period record
					await tx.participantPeriod.create({
						data: {
							participantId: participant.id,
							periodId: newPeriod.id,
							juzNumber: newJuz,
							progressStatus: 'not_finished',
							missedStreak: newMissedStreak,
						},
					})
				}
			} else {
				// First period: evenly distribute participants across 30 juz
				const participants = group.participants
				for (let i = 0; i < participants.length; i++) {
					const juzNumber = (i % 30) + 1
					await tx.participantPeriod.create({
						data: {
							participantId: participants[i].id,
							periodId: newPeriod.id,
							juzNumber,
							progressStatus: 'not_finished',
							missedStreak: 0,
						},
					})
				}
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
