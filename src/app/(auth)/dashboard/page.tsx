import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { Calendar, ExternalLink, Plus, Users } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getGroups(userId: string) {
	const coordinatorGroups = await prisma.coordinatorGroup.findMany({
		where: {
			coordinatorId: userId,
		},
		include: {
			group: {
				include: {
					_count: {
						select: {
							participants: {
								where: { isActive: true },
							},
							periods: true,
						},
					},
					periods: {
						where: { status: 'active' },
						take: 1,
					},
				},
			},
		},
		orderBy: {
			joinedAt: 'desc',
		},
	})

	return coordinatorGroups.map((cg) => ({
		id: cg.group.id,
		name: cg.group.name,
		publicToken: cg.group.publicToken,
		participantCount: cg.group._count.participants,
		periodCount: cg.group._count.periods,
		hasActivePeriod: cg.group.periods.length > 0,
		activePeriod: cg.group.periods[0] || null,
	}))
}

export default async function DashboardPage() {
	const session = await getServerSession(authOptions)
	if (!session) {
		redirect('/auth/signin')
	}
	const groups = await getGroups(session.user.id)

	return (
		<div>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-2xl font-semibold'>Grup Saya</h1>
					<p className='text-muted-foreground text-sm mt-1'>Kelola grup tilawah Anda</p>
				</div>
				<Link
					href='/groups/new'
					className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-white font-medium shadow-sm transition hover:bg-primary/90'>
					<Plus className='h-4 w-4' />
					<span className='hidden sm:inline'>Grup Baru</span>
				</Link>
			</div>

			{/* Groups List or Empty State */}
			{groups.length === 0 ? (
				<div className='rounded-xl border border-border bg-card p-8 text-center'>
					<div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
						<Users className='h-8 w-8 text-primary' />
					</div>
					<h2 className='text-lg font-medium mb-2'>Belum ada grup</h2>
					<p className='text-muted-foreground text-sm mb-6'>
						Buat grup tilawah pertama Anda untuk mulai melacak progress.
					</p>
					<Link
						href='/groups/new'
						className='inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90'>
						<Plus className='h-4 w-4' />
						Buat Grup Baru
					</Link>
				</div>
			) : (
				<div className='space-y-4'>
					{groups.map((group) => (
						<Link
							key={group.id}
							href={`/groups/${group.id}`}
							className='block rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/50 hover:shadow-md'>
							<div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
								<div className='flex-1 min-w-0'>
									<h3 className='font-semibold text-lg truncate'>{group.name}</h3>
									<div className='flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground'>
										<span className='inline-flex items-center gap-1'>
											<Users className='h-4 w-4' />
											{group.participantCount} peserta
										</span>
										<span className='inline-flex items-center gap-1'>
											<Calendar className='h-4 w-4' />
											{group.periodCount} periode
										</span>
									</div>
								</div>
								<div className='flex items-center justify-between md:flex-col md:items-end gap-2'>
									{group.hasActivePeriod ? (
										<span className='inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
											Aktif
										</span>
									) : (
										<span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
											Tidak ada periode aktif
										</span>
									)}
									<ExternalLink className='h-4 w-4 text-muted-foreground' />
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
