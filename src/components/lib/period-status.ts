import { PERIOD_STATUS } from '@/components/lib/status'
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
	if (period.status !== PERIOD_STATUS.active) return 'locked'
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

/**
 * Period start/end are `@db.Date` columns, so Prisma hands them back as midnight **UTC**. Rendering
 * them with the viewer's timezone shifts the whole week: west of UTC "Senin 5 Jan" reads as
 * "Minggu 4 Jan". These helpers pin the calendar to UTC so a period reads the same on the server,
 * in the browser, and inside the copied WhatsApp text.
 *
 * Only for period dates. Real timestamps (`createdAt`, `lockedAt`) are instants and should keep
 * rendering in the viewer's own timezone.
 */
const PERIOD_DATE_TZ = 'UTC'

export function formatPeriodDate(date: Date | string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
	return new Date(date).toLocaleDateString('id-ID', { ...options, timeZone: PERIOD_DATE_TZ })
}

/** "5 Jan 2026 - 11 Jan 2026". The separator matches what the pages already rendered by hand. */
export function formatPeriodRange(
	start: Date | string,
	end: Date | string,
	options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
	return `${formatPeriodDate(start, options)} - ${formatPeriodDate(end, options)}`
}

export const PERIOD_PHASE_LABEL: Record<PeriodPhase, string> = {
	running: 'Aktif',
	awaiting_lock: 'Menunggu dikunci',
	locked: 'Terkunci',
}
