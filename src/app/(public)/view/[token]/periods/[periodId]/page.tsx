import { formatPeriodRange, getPeriodPhase } from '@/components/lib/period-status'
import { getPublicPeriodDetails } from '@/components/lib/public-utils'
import { countByStatus, PERIOD_STATUS } from '@/components/lib/status'
import { PeriodStats } from '@/components/periods/period-stats'
import { ProgressSummary } from '@/components/periods/progress-summary'
import { PublicProgressList } from '@/components/public/public-progress-list'
import { BackButton } from '@/components/ui/back-button'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { PageEntrance } from '@/components/ui/page-entrance'
import { PageHeader } from '@/components/ui/page-header'
import { PeriodBadge } from '@/components/ui/status-badge'
import { Calendar } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ token: string; periodId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	try {
		const { token, periodId } = await params
		const period = await getPublicPeriodDetails(token, periodId)
		return {
			title: `Periode #${period.periodNumber} - ${period.group.name}`,
			description: `Progress tilawah periode #${period.periodNumber}`,
		}
	} catch {
		return {
			title: 'Periode Tidak Ditemukan - Tilawah Tracker',
		}
	}
}

export default async function PublicPeriodDetailPage({ params }: PageProps) {
	const { token, periodId } = await params

	// Fetch data and handle errors before JSX construction
	let period
	try {
		period = await getPublicPeriodDetails(token, periodId)
	} catch {
		notFound()
	}

	// Calculate stats
	// Three passes over the same array, written out twice — countByStatus does it in one
	const counts = countByStatus(period.participantPeriods)
	const total = period.participantPeriods.length

	const isActive = period.status === PERIOD_STATUS.active
	const phase = getPeriodPhase(period)

	return (
		<>
			<BreadcrumbNav
				items={[
					{ label: period.group.name, href: `/view/${token}` },
					{ label: `Periode #${period.periodNumber}`, href: '#', current: true },
				]}
			/>

			<PageEntrance>
				<div>
					<BackButton href={`/view/${token}`} label={`Kembali ke ${period.group.name}`} className='mb-6' />

				<PageHeader
					title={`Periode #${period.periodNumber}`}
					badge={<PeriodBadge phase={phase} />}
					description={
						<>
							<p className='mb-1'>{period.group.name}</p>
							<span className='flex items-center gap-2'>
								<Calendar className='h-4 w-4' aria-hidden='true' />
								{formatPeriodRange(period.startDate, period.endDate, { dateStyle: 'long' })}
							</span>
						</>
					}
				/>

				<PeriodStats
					finished={counts.finished}
					notFinished={counts.not_finished}
					missed={counts.missed}
					showMissed={!isActive}
				/>

				<ProgressSummary finished={counts.finished} total={total} />

				{/* Progress List */}
				{period.participantPeriods.length > 0 ? (
					<PublicProgressList participantPeriods={period.participantPeriods} isActive={isActive} />
				) : (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
							<Calendar className='h-8 w-8 text-muted-foreground' />
						</div>
						<h2 className='text-xl font-medium mb-2'>Tidak Ada Peserta</h2>
						<p className='text-muted-foreground text-sm'>Periode ini belum memiliki peserta.</p>
					</div>
				)}
				</div>
			</PageEntrance>
		</>
	)
}
