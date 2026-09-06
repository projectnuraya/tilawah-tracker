import { NotFoundError } from './auth-utils'
import { prisma } from './db'
import { countByPeriod } from './periods'
import { PERIOD_STATUS } from './status'

/**
 * Validate a public token and return the associated group
 * Public tokens are permanent and allow read-only access to group progress
 *
 * @throws NotFoundError if token is invalid or group doesn't exist
 */
export async function validatePublicToken(token: string) {
	const group = await prisma.group.findUnique({
		where: { publicToken: token },
		select: {
			id: true,
			name: true,
			publicToken: true,
			createdAt: true,
		},
	})

	if (!group) {
		throw new NotFoundError('Grup tidak ditemukan. Token tidak valid.')
	}

	return group
}

/**
 * Everything the public group page renders: the group, its running period, and its locked history.
 *
 * One function because the page needs all three at once. It used to call two helpers that each
 * re-validated the token, so every page load looked the token up twice.
 */
export async function getPublicGroupOverview(token: string) {
	const group = await validatePublicToken(token)

	const [activePeriod, lockedPeriods] = await Promise.all([
		prisma.period.findFirst({
			where: { groupId: group.id, status: PERIOD_STATUS.active },
			include: { _count: { select: { participantPeriods: true } } },
			orderBy: { periodNumber: 'desc' },
		}),
		prisma.period.findMany({
			where: { groupId: group.id, status: PERIOD_STATUS.locked },
			include: { _count: { select: { participantPeriods: true } } },
			orderBy: { periodNumber: 'desc' },
			take: 52, // roughly a year of history
		}),
	])

	const counts = await countByPeriod([...(activePeriod ? [activePeriod.id] : []), ...lockedPeriods.map((p) => p.id)])

	return {
		group,
		activePeriod: activePeriod ? { ...activePeriod, statusCounts: counts.get(activePeriod.id)! } : null,
		periods: lockedPeriods.map((period) => ({ ...period, statusCounts: counts.get(period.id)! })),
	}
}

/**
 * Get full details of a specific period including all participant progress
 * Returns participant-period records grouped by juz for display
 */
export async function getPublicPeriodDetails(token: string, periodId: string) {
	const group = await validatePublicToken(token)

	const period = await prisma.period.findUnique({
		where: {
			id: periodId,
			groupId: group.id,
		},
		include: {
			group: {
				select: { id: true, name: true, publicToken: true },
			},
			participantPeriods: {
				include: {
					participant: {
						select: {
							id: true,
							name: true,
							isActive: true,
						},
					},
				},
				orderBy: [{ juzNumber: 'asc' }, { participant: { name: 'asc' } }],
			},
		},
	})

	if (!period) {
		throw new NotFoundError('Periode tidak ditemukan.')
	}

	return period
}
