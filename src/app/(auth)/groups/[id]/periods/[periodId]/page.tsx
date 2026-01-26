import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { PeriodProgressList } from '@/components/periods/period-progress-list'
import { BackButton } from '@/components/ui/back-button'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
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
			<div className='flex items-start justify-between mb-4'>
				<div>
					<div className='flex items-center gap-3 mb-1'>
						<h1 className='text-2xl font-semibold'>Periode #{period.periodNumber}</h1>
						<span
							className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
								isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
							}`}>
							{isActive ? 'Aktif' : 'Terkunci'}
						</span>
					</div>
					<div className='flex items-center gap-2 text-base text-muted-foreground'>
						<Calendar className='h-4 w-4' />
						{new Date(period.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} -{' '}
						{new Date(period.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className={`grid gap-3 mb-6 ${!isActive ? 'grid-cols-3' : 'grid-cols-2'}`}>
				<div className='rounded-lg border border-border bg-card p-3 text-center'>
					<p className='text-2xl font-semibold text-primary'>{stats.finished}</p>
					<p className='text-base text-muted-foreground'>👑 Selesai</p>
				</div>
				<div className='rounded-lg border border-border bg-card p-3 text-center'>
					<p className='text-2xl font-semibold text-muted-foreground'>{stats.not_finished}</p>
					<p className='text-base text-muted-foreground'>⏳ Dalam Proses</p>
				</div>
				{!isActive && (
					<div className='rounded-lg border border-border bg-card p-3 text-center'>
						<p className='text-2xl font-semibold text-destructive'>{stats.missed}</p>
						<p className='text-base text-muted-foreground'>💔 Terlewat</p>
					</div>
				)}
			</div>

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
