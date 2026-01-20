import { prisma } from './db'
import { NotFoundError } from './auth-utils'

/**
 * Validate a public token and return the associated group
 * Throws NotFoundError if token is invalid
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
 * Get group with active period for public view
 */
export async function getPublicGroupWithActivePeriod(token: string) {
	const group = await validatePublicToken(token)

	const activePeriod = await prisma.period.findFirst({
		where: {
			groupId: group.id,
			status: 'active',
		},
		include: {
			_count: {
				select: { participantPeriods: true },
			},
		},
		orderBy: { periodNumber: 'desc' },
	})

	// Get stats for active period if exists
	let activeWithStats = null
	if (activePeriod) {
		const stats = await prisma.participantPeriod.groupBy({
			by: ['progressStatus'],
			where: { periodId: activePeriod.id },
			_count: { progressStatus: true },
		})

		const statusCounts = { finished: 0, not_finished: 0, missed: 0 }
		for (const s of stats) {
			statusCounts[s.progressStatus as keyof typeof statusCounts] = s._count.progressStatus
		}

		activeWithStats = { ...activePeriod, statusCounts }
	}

	return { group, activePeriod: activeWithStats }
}

/**
 * Get all periods for a public group
 */
export async function getPublicGroupPeriods(token: string) {
	const group = await validatePublicToken(token)

	const periods = await prisma.period.findMany({
		where: { groupId: group.id },
		include: {
			_count: {
				select: { participantPeriods: true },
			},
		},
		orderBy: { periodNumber: 'desc' },
	})

	// Get stats for each period
	const periodsWithStats = await Promise.all(
		periods.map(async (period) => {
			const stats = await prisma.participantPeriod.groupBy({
				by: ['progressStatus'],
				where: { periodId: period.id },
				_count: { progressStatus: true },
			})

			const statusCounts = { finished: 0, not_finished: 0, missed: 0 }
			for (const s of stats) {
				statusCounts[s.progressStatus as keyof typeof statusCounts] = s._count.progressStatus
			}

			return { ...period, statusCounts }
		}),
	)

	return { group, periods: periodsWithStats }
}

/**
 * Get period details for public view
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
