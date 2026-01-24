import { ParticipantsPreview } from '@/components/groups/participants-preview'
import { ShareFab } from '@/components/groups/share-fab'
import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BackButton } from '@/components/ui/back-button'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { Calendar, Plus, Settings, Users } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
	params: Promise<{ id: string }>
}

async function getGroup(userId: string, groupId: string) {
	// Check access
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

	const group = await prisma.group.findUnique({
		where: { id: groupId },
		include: {
			coordinatorGroups: {
				include: {
					coordinator: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
				},
			},
			participants: {
				where: { isActive: true },
				orderBy: { name: 'asc' },
			},
			periods: {
				orderBy: { periodNumber: 'desc' },
				take: 5,
				include: {
					_count: {
						select: { participantPeriods: true },
					},
				},
			},
		},
	})

	return group
}

export default async function GroupDetailPage({ params }: PageProps) {
	const session = await getServerSession(authOptions)
	if (!session) {
		redirect('/auth/signin')
	}

	const { id } = await params
	const group = await getGroup(session.user.id, id)

	if (!group) {
		notFound()
	}

	const activePeriod = group.periods.find((p) => p.status === 'active')
	const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/view/${group.publicToken}`

	return (
		<div>
			{/* Breadcrumb Navigation */}
			<BreadcrumbNav
				items={[
					{ label: 'Dashboard', href: '/dashboard' },
					{ label: group.name, href: '#', current: true },
				]}
			/>

			{/* Enhanced Back Button */}
			<BackButton href='/dashboard' label='Kembali ke Dashboard' className='mb-6' />

			{/* Group Header */}
			<div className='flex items-start justify-between gap-4 mb-6'>
				<div>
					<h1 className='text-2xl font-semibold'>{group.name}</h1>
					<p className='text-muted-foreground text-base mt-1'>
						Dibuat {new Date(group.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
					</p>
				</div>
				<Link
					href={`/groups/${group.id}/edit`}
					className='inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-base font-medium hover:bg-muted transition'>
					<Settings className='h-4 w-4' />
					Ubah
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-2 gap-4 mb-6'>
				<Link
					href={`/groups/${group.id}/participants`}
					className='block rounded-xl border border-border bg-card p-4 hover:bg-muted transition'>
					<div className='flex items-center gap-3'>
						<div className='rounded-full bg-primary/10 p-2'>
							<Users className='h-5 w-5 text-primary' />
						</div>
						<div>
							<p className='text-2xl font-semibold'>{group.participants.length}</p>
							<p className='text-base text-muted-foreground'>Peserta</p>
						</div>
					</div>
				</Link>
				<Link
					href={`/groups/${group.id}/periods`}
					className='block rounded-xl border border-border bg-card p-4 hover:bg-muted transition'>
					<div className='flex items-center gap-3'>
						<div className='rounded-full bg-amber-500/10 p-2'>
							<Calendar className='h-5 w-5 text-amber-500' />
						</div>
						<div>
							<p className='text-2xl font-semibold'>{group.periods.length}</p>
							<p className='text-base text-muted-foreground'>Periode</p>
						</div>
					</div>
				</Link>
			</div>

			{/* Active Period or Start New */}
			<div className='rounded-xl border border-border bg-card p-4 mb-6'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='font-medium'>Periode Aktif</h2>
					{!activePeriod && group.participants.length > 0 && (
						<Link
							href={`/groups/${group.id}/periods/new`}
							className='inline-flex items-center gap-1 text-base text-primary hover:underline'>
							<Plus className='h-4 w-4' />
							Mulai Periode Baru
						</Link>
					)}
				</div>
				{activePeriod ? (
					<Link
						href={`/groups/${group.id}/periods/${activePeriod.id}`}
						className='block rounded-lg border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='font-medium'>Periode #{activePeriod.periodNumber}</p>
								<p className='text-base text-muted-foreground'>
									{new Date(activePeriod.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })} -{' '}
									{new Date(activePeriod.endDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
								</p>
							</div>
							<span className='inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary'>
								Aktif
							</span>
						</div>
					</Link>
				) : (
					<p className='text-base text-muted-foreground'>
						{group.participants.length === 0
							? 'Tambahkan peserta terlebih dahulu sebelum memulai periode.'
							: 'Tidak ada periode aktif. Mulai yang baru untuk melacak progress.'}
					</p>
				)}
			</div>

			{/* Mudabbir */}
			<div className='rounded-xl border border-border bg-card p-4 mb-6'>
				<h2 className='font-medium mb-2'>Mudabbir</h2>
				<p className='text-base text-muted-foreground mb-3'>Koordinator yang mengelola kelompok ini.</p>
				<div className='flex gap-3 overflow-x-auto'>
					{group.coordinatorGroups.map((cg) => (
						<div key={cg.coordinator.id} className='flex flex-col items-center gap-1 shrink-0'>
							<Avatar className='h-10 w-10'>
								<AvatarImage src={cg.coordinator.image || undefined} alt={cg.coordinator.name || 'Coordinator'} />
								<AvatarFallback>{cg.coordinator.name?.charAt(0) || 'U'}</AvatarFallback>
							</Avatar>
							<span className='text-base text-center'>{cg.coordinator.name || 'Unknown'}</span>
						</div>
					))}
				</div>
			</div>

			{/* Participants Quick View */}
			<div className='rounded-xl border border-border bg-card p-4 mb-6'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='font-medium'>Peserta</h2>
					<Link href={`/groups/${group.id}/participants`} className='text-xl text-primary hover:underline'>
						Kelola
					</Link>
				</div>
				<ParticipantsPreview participants={group.participants} groupId={group.id} />
			</div>

			{/* Recent Periods */}
			{group.periods.length > 0 && (
				<div className='rounded-xl border border-border bg-card p-4 mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<h2 className='font-medium'>Periode Terbaru</h2>
						<Link href={`/groups/${group.id}/periods`} className='text-xl text-primary hover:underline'>
							Lihat Semua
						</Link>
					</div>
					<div className='space-y-2'>
						{group.periods.map((period) => (
							<Link
								key={period.id}
								href={`/groups/${group.id}/periods/${period.id}`}
								className='flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition'>
								<div>
									<span className='text-xl font-medium'>Periode #{period.periodNumber}</span>
									<p className='text-base text-muted-foreground'>
										{new Date(period.startDate).toLocaleDateString('id-ID', { dateStyle: 'short' })}
									</p>
								</div>
								<span
									className={`inline-flex items-center rounded-full px-2 py-0.5 text-base font-medium ${
										period.status === 'active'
											? 'bg-primary/10 text-primary'
											: 'bg-muted text-muted-foreground'
									}`}>
									{period.status === 'active' ? 'Aktif' : 'Terkunci'}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}
			<ShareFab publicUrl={publicUrl} publicToken={group.publicToken} />
		</div>
	)
}
