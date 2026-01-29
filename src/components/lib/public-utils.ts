import { NotFoundError } from './auth-utils'
import { prisma } from './db'

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
 * Get group overview with its current active period (if any)
 * Used to display the main progress view for public token access
 */
export async function getPublicGroupWithActivePeriod(token: string) {
	const group = await validatePublicToken(token)

	// Get current active period if exists
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

	// Calculate progress stats for active period
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
 * Get all past periods for a public group with progress stats
 * Shows historical data of completed weeks (limited to last 52 weeks)
 */
export async function getPublicGroupPeriods(token: string) {
	const group = await validatePublicToken(token)

	const periods = await prisma.period.findMany({
		where: {
			groupId: group.id,
			status: 'locked',
		},
		include: {
			_count: {
				select: { participantPeriods: true },
			},
		},
		orderBy: { periodNumber: 'desc' },
		take: 52,
	})

	// Attach stats to each period
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
