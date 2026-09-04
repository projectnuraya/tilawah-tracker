/**
 * The status values `Period.status` and `ParticipantPeriod.progressStatus` can hold.
 *
 * Both columns are plain `String` in schema.prisma, so nothing stops a typo reaching the database
 * — and these literals were spelled out by hand in twenty files. Import from here instead, so a
 * misspelling fails to compile and the set has one place to change.
 */

export const PERIOD_STATUS = {
	/** Running, or past its end date and awaiting lock. See getPeriodPhase in period-status.ts. */
	active: 'active',
	/** Immutable history. Progress and juz updates are refused. */
	locked: 'locked',
} as const

export type PeriodStatus = (typeof PERIOD_STATUS)[keyof typeof PERIOD_STATUS]

export const PROGRESS_STATUS_VALUES = ['not_finished', 'finished', 'missed'] as const

export type ProgressStatus = (typeof PROGRESS_STATUS_VALUES)[number]

export const PROGRESS = {
	notFinished: 'not_finished',
	finished: 'finished',
	missed: 'missed',
} as const satisfies Record<string, ProgressStatus>

/** Zero-filled counts, the shape every "how did this period go" summary uses. */
export type StatusCounts = Record<ProgressStatus, number>

export function emptyStatusCounts(): StatusCounts {
	// Key order matches what the hand-written counters produced, so serialized API responses
	// keep the field order they had.
	return { finished: 0, not_finished: 0, missed: 0 }
}

/**
 * Tally progress statuses.
 *
 * Accepts either rows carrying a `progressStatus`, or the result of a Prisma
 * `groupBy({ by: ['progressStatus'], _count: { progressStatus: true } })` — the two shapes this
 * count was being written out by hand for, in four different files.
 */
export function countByStatus(
	rows: readonly ({ progressStatus: string } | { progressStatus: string; _count: { progressStatus: number } })[],
): StatusCounts {
	const counts = emptyStatusCounts()
	for (const row of rows) {
		if (!isProgressStatus(row.progressStatus)) continue
		const n = '_count' in row ? row._count.progressStatus : 1
		counts[row.progressStatus] += n
	}
	return counts
}

export function isProgressStatus(value: string): value is ProgressStatus {
	return (PROGRESS_STATUS_VALUES as readonly string[]).includes(value)
}
