import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { getPeriodPhase } from '@/components/lib/period-status'
import { LockPrompt } from '@/components/periods/lock-prompt'
import { PeriodProgressList } from '@/components/periods/period-progress-list'
import { PeriodStats } from '@/components/periods/period-stats'
import { ProgressSummary } from '@/components/periods/progress-summary'
import { BackButton } from '@/components/ui/back-button'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { PageHeader } from '@/components/ui/page-header'
import { PeriodBadge } from '@/components/ui/status-badge'
import { Calendar } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
	params: Promise<{ id: string; periodId: string }>
}

async function getPeriod(userId: string, groupId: string, periodId: string) {
	const access = await prisma.coordinatorGroup.findUnique({
		where: {
			coordinatorId_groupId: {
				coordinatorId: userId,
				groupId,
			},
		},
	})

	if (!access) {
		return null
	}

	const period = await prisma.period.findUnique({
		where: { id: periodId, groupId },
		include: {
			group: {
				select: {
					id: true,
					name: true,
					publicToken: true,
					coordinatorGroups: {
						include: {
							coordinator: {
								select: { id: true, name: true },
							},
						},
					},
				},
			},
			participantPeriods: {
				include: {
					participant: {
						select: {
							id: true,
							name: true,
							whatsappNumber: true,
							isActive: true,
						},
					},
				},
				orderBy: [{ juzNumber: 'asc' }, { participant: { name: 'asc' } }],
			},
		},
	})

	return period
}

export default async function PeriodDetailPage({ params }: PageProps) {
	const session = await getServerSession(authOptions)
	if (!session) {
		redirect('/auth/signin')
	}

	const { id, periodId } = await params
	const period = await getPeriod(session.user.id, id, periodId)

	if (!period) {
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
		<div>
			{/* Breadcrumb Navigation */}
			<BreadcrumbNav
				items={[
					{ label: 'Dashboard', href: '/dashboard' },
					{ label: period.group.name, href: `/groups/${period.group.id}` },
					{ label: 'Periode', href: `/groups/${period.group.id}/periods` },
					{ label: `Periode #${period.periodNumber}`, href: '#', current: true },
				]}
			/>

			{/* Enhanced Back Button */}
			<BackButton href={`/groups/${period.group.id}/periods`} label='Kembali ke Periode' className='mb-6' />

			{/* Header */}
			<PageHeader
				title={`Periode #${period.periodNumber}`}
				badge={<PeriodBadge phase={phase} />}
				description={
					<span className='flex items-center gap-2'>
						<Calendar className='h-4 w-4' aria-hidden='true' />
						{new Date(period.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} -{' '}
						{new Date(period.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
					</span>
				}
			/>

			{phase === 'awaiting_lock' && <LockPrompt periodNumber={period.periodNumber} endDate={period.endDate} />}

			<PeriodStats
				finished={stats.finished}
				notFinished={stats.not_finished}
				missed={stats.missed}
				showMissed={!isActive}
			/>

			<ProgressSummary finished={stats.finished} total={stats.total} />

			{/* Period Progress List with Search and Filters */}
			<PeriodProgressList
				period={{
					...period,
					participantPeriods: period.participantPeriods.map((pp) => ({
						...pp,
						progressStatus: pp.progressStatus as 'finished' | 'not_finished' | 'missed',
						missedStreak: pp.missedStreak,
					})),
				}}
				isActive={isActive}
				notFinishedCount={stats.not_finished}
			/>
		</div>
	)
}
