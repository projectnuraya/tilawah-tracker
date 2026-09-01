import { PROGRESS_STATUS } from '@/components/ui/status-badge'

interface PeriodStatsProps {
	finished: number
	notFinished: number
	missed: number
	/** "Missed" only carries meaning once a period is locked, so the tile is hidden while running. */
	showMissed: boolean
}

/**
 * The three count tiles above a period's progress list. Shared so the coordinator and public views
 * stop diverging: they previously used different type scales and called the same status
 * "Dalam Proses" on one side and "Belum selesai" on the other.
 */
export function PeriodStats({ finished, notFinished, missed, showMissed }: PeriodStatsProps) {
	const tiles = [
		{ count: finished, status: PROGRESS_STATUS.finished, tone: 'text-primary' },
		{ count: notFinished, status: PROGRESS_STATUS.not_finished, tone: 'text-muted-foreground' },
		...(showMissed ? [{ count: missed, status: PROGRESS_STATUS.missed, tone: 'text-destructive' }] : []),
	]

	return (
		<div className={`grid gap-3 mb-6 ${showMissed ? 'grid-cols-3' : 'grid-cols-2'}`}>
			{tiles.map((tile) => (
				<div key={tile.status.label} className='rounded-lg border border-border bg-card p-3 text-center'>
					<p className={`text-2xl font-semibold ${tile.tone}`}>{tile.count}</p>
					<p className='text-base text-muted-foreground'>
						<span aria-hidden='true'>{tile.status.icon}</span> {tile.status.label}
					</p>
				</div>
			))}
		</div>
	)
}
