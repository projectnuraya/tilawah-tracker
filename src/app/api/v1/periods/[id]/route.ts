import { apiError, apiSuccess, ForbiddenError, NotFoundError, requireAuth } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * Helper to verify coordinator has access to a period
 * Checks the period's group's coordinatorGroups relationship
 */
async function getPeriodWithAccess(coordinatorId: string, periodId: string) {
	const period = await prisma.period.findUnique({
		where: { id: periodId },
		include: {
			group: {
				include: {
					coordinatorGroups: {
						where: { coordinatorId },
					},
				},
			},
		},
	})

	if (!period) {
		throw new NotFoundError('Period not found')
	}

	if (period.group.coordinatorGroups.length === 0) {
		throw new ForbiddenError("You don't have access to this period")
	}

	return period
}

/**
 * GET /api/v1/periods/[id]
 * Get complete period details including all participant progress
 * Returns progress organized by juz and calculated summary stats
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		const period = await getPeriodWithAccess(session.user.id, id)

		// Get all participant-period records for this period
		const participantPeriods = await prisma.participantPeriod.findMany({
			where: { periodId: id },
			include: {
				participant: {
					select: {
						id: true,
						name: true,
						whatsappNumber: true,
						isActive: true,
					},
				},
			},
			orderBy: [{ juzNumber: 'asc' }, { participant: { name: 'asc' } }],
		})

		// Organize by juz for UI grouping (Juz 1-30)
		const byJuz: Record<number, typeof participantPeriods> = {}
		for (let i = 1; i <= 30; i++) {
			byJuz[i] = []
		}
		for (const pp of participantPeriods) {
			byJuz[pp.juzNumber].push(pp)
		}

		// Calculate progress stats
		const stats = {
			total: participantPeriods.length,
			finished: participantPeriods.filter((pp) => pp.progressStatus === 'finished').length,
			not_finished: participantPeriods.filter((pp) => pp.progressStatus === 'not_finished').length,
			missed: participantPeriods.filter((pp) => pp.progressStatus === 'missed').length,
		}

		return apiSuccess({
			id: period.id,
			groupId: period.groupId,
			groupName: period.group.name,
			periodNumber: period.periodNumber,
			startDate: period.startDate,
			endDate: period.endDate,
			status: period.status,
			isArchived: period.isArchived,
			lockedAt: period.lockedAt,
			participantPeriods,
			byJuz,
			stats,
		})
	} catch (error) {
		return apiError(error)
	}
}
