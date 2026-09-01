import { differenceInCalendarDays, startOfDay } from 'date-fns'

export type PeriodPhase = 'running' | 'awaiting_lock' | 'locked'

/**
 * A period's phase as a coordinator experiences it, which is finer than the `active`/`locked`
 * column in the database.
 *
 * Periods run Monday–Sunday, but locking happens on the following Monday: participants commonly
 * report finishing on that Monday, so the period is deliberately left editable past its end date
 * to give those late reports somewhere to land. A period sitting past its end date is therefore
 * normal, not an error — but it does need surfacing, because nothing else prompts the coordinator
 * to close it. See docs/product-concept.md.
 */
export function getPeriodPhase(period: { status: string; endDate: Date | string }, now: Date = new Date()): PeriodPhase {
	if (period.status !== 'active') return 'locked'
	const daysPastEnd = differenceInCalendarDays(startOfDay(now), startOfDay(new Date(period.endDate)))
	return daysPastEnd > 0 ? 'awaiting_lock' : 'running'
}

/** How many whole days ago the period ended. Zero or negative while it is still running. */
export function daysSinceEnd(endDate: Date | string, now: Date = new Date()): number {
	return differenceInCalendarDays(startOfDay(now), startOfDay(new Date(endDate)))
}

/** "kemarin" / "3 hari lalu" — used in the prompt that asks the coordinator to lock. */
export function describeDaysSinceEnd(endDate: Date | string, now: Date = new Date()): string {
	const days = daysSinceEnd(endDate, now)
	if (days <= 0) return 'hari ini'
	if (days === 1) return 'kemarin'
	return `${days} hari lalu`
}

export const PERIOD_PHASE_LABEL: Record<PeriodPhase, string> = {
	running: 'Aktif',
	awaiting_lock: 'Menunggu dikunci',
	locked: 'Terkunci',
}
