interface ProgressSummaryProps {
	finished: number
	total: number
}

/**
 * Overall "X/Y finished" with a bar. This used to exist only on the public period page, so the
 * coordinator — the person docs/user-journeys.md describes reviewing exactly this figure — saw
 * less than the participants did.
 */
export function ProgressSummary({ finished, total }: ProgressSummaryProps) {
	const percent = total > 0 ? Math.round((finished / total) * 100) : 0

	return (
		<div className='rounded-lg border border-border bg-card p-4 mb-6'>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-base text-muted-foreground mb-1'>Progress Keseluruhan</p>
					<p className='text-2xl font-semibold'>
						{finished}/{total}
					</p>
				</div>
				<div className='text-right'>
					<p className='text-base text-muted-foreground mb-1'>Persentase</p>
					<p className='text-2xl font-semibold text-primary'>{percent}%</p>
				</div>
			</div>
			{total > 0 && (
				<div
					className='mt-4 w-full bg-muted rounded-full h-2.5'
					role='progressbar'
					aria-valuenow={percent}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={`${finished} dari ${total} peserta selesai`}>
					<div className='bg-primary h-2.5 rounded-full transition-all' style={{ width: `${percent}%` }} />
				</div>
			)}
		</div>
	)
}
