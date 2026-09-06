import { PROGRESS } from '@/components/lib/status'

/** The Qur'an's 30 juz — one participant reads one per week. */
export const TOTAL_JUZ = 30

export const JUZ_NUMBERS: readonly number[] = Array.from({ length: TOTAL_JUZ }, (_, i) => i + 1)

/** How many participants currently sit on each juz. Always covers 1–30, zero-filled. */
export type JuzTally = Map<number, number>

/**
 * Build a tally from existing assignments.
 *
 * Takes either raw `participantPeriod` rows or the result of a Prisma
 * `groupBy({ by: ['juzNumber'], _count: { juzNumber: true } })`, because the three call sites that
 * balanced juz load were each handed a different one of those.
 */
export function juzTally(
	rows: readonly ({ juzNumber: number } | { juzNumber: number; _count: { juzNumber: number } })[] = [],
): JuzTally {
	const tally: JuzTally = new Map()
	for (const juz of JUZ_NUMBERS) tally.set(juz, 0)
	for (const row of rows) {
		const n = '_count' in row ? row._count.juzNumber : 1
		tally.set(row.juzNumber, (tally.get(row.juzNumber) ?? 0) + n)
	}
	return tally
}

/**
 * Claim the least-loaded juz and record it, so a caller assigning several participants in a row
 * spreads them out instead of stacking everyone on the same juz.
 *
 * Ties go to the lowest juz number, which keeps assignment deterministic and matches what the
 * hand-written loops did.
 */
export function takeLeastUsedJuz(tally: JuzTally): number {
	let best = 1
	let bestCount = Infinity
	for (const juz of JUZ_NUMBERS) {
		const count = tally.get(juz) ?? 0
		if (count < bestCount) {
			bestCount = count
			best = juz
		}
	}
	tally.set(best, bestCount + 1)
	return best
}

/** The next juz in the rotation; 30 wraps back to 1. */
export function nextJuz(juz: number): number {
	return juz === TOTAL_JUZ ? 1 : juz + 1
}

/** Group rows into buckets for juz 1–30, including the empty ones so the UI can render a full grid. */
export function groupByJuz<T extends { juzNumber: number }>(rows: readonly T[]): Record<number, T[]> {
	const grouped: Record<number, T[]> = {}
	for (const juz of JUZ_NUMBERS) grouped[juz] = []
	for (const row of rows) grouped[row.juzNumber]?.push(row)
	return grouped
}

/** A fresh participant-period row, ready to hand to Prisma. */
export function newAssignment(participantId: string, periodId: string, juzNumber: number, missedStreak = 0) {
	return { participantId, periodId, juzNumber, progressStatus: PROGRESS.notFinished, missedStreak }
}
