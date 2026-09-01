import { PERIOD_PHASE_LABEL, type PeriodPhase } from '@/components/lib/period-status'
import { cn } from '@/components/lib/utils'

export type ProgressStatus = 'finished' | 'not_finished' | 'missed'

/** The single source of truth for how a progress status is worded and coloured.
 *  Before this existed, `not_finished` appeared as both "Dalam Proses" and "Belum selesai"
 *  depending on the page, and the same ternary was copy-pasted across five files. */
export const PROGRESS_STATUS: Record<ProgressStatus, { label: string; icon: string; text: string; badge: string }> = {
	finished: {
		label: 'Selesai',
		icon: '👑',
		text: 'text-primary',
		badge: 'bg-success-bg text-success-bg-foreground',
	},
	not_finished: {
		label: 'Belum selesai',
		icon: '⏳',
		text: 'text-muted-foreground',
		badge: 'bg-muted text-muted-foreground',
	},
	missed: {
		label: 'Terlewat',
		icon: '💔',
		text: 'text-destructive',
		badge: 'bg-error-bg text-error-bg-foreground',
	},
}

export const PROGRESS_STATUS_ORDER: ProgressStatus[] = ['not_finished', 'finished', 'missed']

function resolve(status: string) {
	return PROGRESS_STATUS[status as ProgressStatus] ?? PROGRESS_STATUS.not_finished
}

/** Icon + label in the status colour. Used for read-only rows in locked periods and public views. */
export function StatusText({ status, className }: { status: string; className?: string }) {
	const s = resolve(status)
	return (
		<span className={cn('inline-flex items-center gap-1 text-base', s.text, className)}>
			<span aria-hidden='true'>{s.icon}</span>
			{s.label}
		</span>
	)
}

/** Filled pill. Used where the status needs to read as a chip rather than a line of text. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
	const s = resolve(status)
	return (
		<span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium', s.badge, className)}>
			<span aria-hidden='true'>{s.icon}</span>
			{s.label}
		</span>
	)
}

/**
 * Pill for period state. Takes a phase rather than the raw status column so that a period sitting
 * past its end date but not yet locked reads as "Menunggu dikunci" instead of an indefinite
 * "Aktif" — see getPeriodPhase in lib/period-status.ts.
 */
export function PeriodBadge({ phase, className }: { phase: PeriodPhase; className?: string }) {
	const styles: Record<PeriodPhase, string> = {
		running: 'bg-primary-background text-primary',
		awaiting_lock: 'bg-warning-bg text-warning-bg-foreground',
		locked: 'bg-muted text-muted-foreground',
	}
	return (
		<span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium', styles[phase], className)}>
			{PERIOD_PHASE_LABEL[phase]}
		</span>
	)
}
