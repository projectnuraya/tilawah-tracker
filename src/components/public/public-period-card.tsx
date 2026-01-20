import { Calendar, Users } from 'lucide-react'
import Link from 'next/link'

interface Period {
	id: string
	periodNumber: number
	startDate: Date | string
	endDate: Date | string
	status: string
	statusCounts: {
		finished: number
		not_finished: number
		missed: number
	}
	_count: {
		participantPeriods: number
	}
}

interface PublicPeriodCardProps {
	period: Period
	token: string
}

export function PublicPeriodCard({ period, token }: PublicPeriodCardProps) {
	const isActive = period.status === 'active'
	const total = period._count.participantPeriods

	return (
		<Link
			href={`/view/${token}/periods/${period.id}`}
			className="block rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition">
			<div className="flex items-start justify-between mb-3">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="font-medium">Periode #{period.periodNumber}</span>
						{isActive && (
							<span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
								Aktif
							</span>
						)}
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-3.5 w-3.5" />
						<span>
							{new Date(period.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })} -{' '}
							{new Date(period.endDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 text-sm">
					<span className="inline-flex items-center gap-1">
						<Users className="h-3.5 w-3.5" />
						{total}
					</span>
					<span className="text-primary">👑 {period.statusCounts.finished}</span>
					<span className="text-destructive">💔 {period.statusCounts.missed}</span>
				</div>
				<div className="text-right">
					<p className="text-lg font-semibold text-primary">
						{period.statusCounts.finished}/{total}
					</p>
					<p className="text-xs text-muted-foreground">Selesai</p>
				</div>
			</div>
		</Link>
	)
}
