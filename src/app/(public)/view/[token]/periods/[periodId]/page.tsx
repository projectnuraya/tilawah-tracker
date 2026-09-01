import { getPeriodPhase } from '@/components/lib/period-status'
import { getPublicPeriodDetails } from '@/components/lib/public-utils'
import { PeriodStats } from '@/components/periods/period-stats'
import { ProgressSummary } from '@/components/periods/progress-summary'
import { PublicProgressList } from '@/components/public/public-progress-list'
import { BackButton } from '@/components/ui/back-button'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
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
	const stats = {
		total: period.participantPeriods.length,
		finished: period.participantPeriods.filter((pp) => pp.progressStatus === 'finished').length,
		not_finished: period.participantPeriods.filter((pp) => pp.progressStatus === 'not_finished').length,
		missed: period.participantPeriods.filter((pp) => pp.progressStatus === 'missed').length,
	}

	const isActive = period.status === 'active'
	const phase = getPeriodPhase(period)

	return (
		<div className='min-h-screen bg-background'>
			<div>
				<BreadcrumbNav
					items={[
						{ label: period.group.name, href: `/view/${token}` },
						{ label: `Periode #${period.periodNumber}`, href: '#', current: true },
					]}
				/>

				<BackButton href={`/view/${token}`} label={`Kembali ke ${period.group.name}`} className='mb-6' />

				<PageHeader
					title={`Periode #${period.periodNumber}`}
					badge={<PeriodBadge phase={phase} />}
					description={
						<>
							<p className='mb-1'>{period.group.name}</p>
							<span className='flex items-center gap-2'>
								<Calendar className='h-4 w-4' aria-hidden='true' />
								{new Date(period.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} -{' '}
								{new Date(period.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
							</span>
						</>
					}
				/>

				<PeriodStats
					finished={stats.finished}
					notFinished={stats.not_finished}
					missed={stats.missed}
					showMissed={!isActive}
				/>

				<ProgressSummary finished={stats.finished} total={stats.total} />

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
		</div>
	)
}
