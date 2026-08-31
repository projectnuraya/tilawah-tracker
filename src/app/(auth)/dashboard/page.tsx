import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { Calendar, ChevronRight, Plus, Users } from 'lucide-react'
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
						orderBy: { periodNumber: 'desc' },
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
		hasActivePeriod: cg.group.periods.some((p) => p.status === 'active'),
		latestPeriod: cg.group.periods[0] || null,
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
			<div className='mb-6'>
				<h1 className='text-4xl font-bold mb-4'>Grup Saya</h1>
				<Link
					href='/groups/new'
					className='flex min-h-12 items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3.5 text-primary-foreground font-semibold shadow-sm transition hover:bg-primary-hover'>
					<Plus className='h-5 w-5' />
					<span>Tambah Grup Baru</span>
				</Link>
			</div>

			{/* Groups List or Empty State */}
			{groups.length === 0 ? (
				<div className='rounded-xl border border-border bg-card p-8 text-center'>
					<div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
						<Users className='h-8 w-8 text-primary' />
					</div>
					<h2 className='text-2xl font-medium mb-2'>Belum ada grup</h2>
					<p className='text-muted-foreground text-base mb-6'>
						Buat grup tilawah pertama Anda untuk mulai melacak progress.
					</p>
					<Link
						href='/groups/new'
						className='inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium shadow-sm transition hover:bg-primary-hover'>
						<Plus className='h-4 w-4' />
						Buat Grup Baru
					</Link>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
					{groups.map((group) => (
						// Group Card
						<div
							key={group.id}
							className='flex flex-col rounded-md border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md overflow-hidden p-5'>
							{/* Status Badge */}
							<div>
								{group.hasActivePeriod ? (
									<span className='inline-flex items-center rounded-full bg-success-bg px-3 py-1 text-sm font-bold text-success-bg-foreground'>
										● SEDANG BERLANGSUNG
									</span>
								) : (
									<span className='inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground'>
										TIDAK ADA PERIODE AKTIF
									</span>
								)}
							</div>

							{/* Content */}
							<div className='flex-1 py-5'>
								<h3 className='font-bold text-xl mb-4 pb-4 border-b border-border leading-tight'>{group.name}</h3>

								{/* Stats - with icons */}
								<div className='flex items-center gap-8'>
									<div className='flex items-center gap-3'>
										<div className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary shrink-0'>
											<Users className='h-5 w-5 text-primary' />
										</div>
										<div className='flex flex-col gap-0'>
											<span className='text-sm font-bold text-muted-foreground tracking-wide'>ANGGOTA</span>
											<span className='text-base font-bold text-foreground'>
												{group.participantCount} Peserta
											</span>
										</div>
									</div>
									<div className='flex items-center gap-3'>
										<div className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary shrink-0'>
											<Calendar className='h-5 w-5 text-primary' />
										</div>
										<div className='flex flex-col gap-0'>
											<span className='text-sm font-bold text-muted-foreground tracking-wide'>PERIODE</span>
											<span className='text-base font-bold text-foreground'>
												Ke-{group.latestPeriod ? group.latestPeriod.periodNumber : 0}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Button */}
							<div>
								<Link
									href={`/groups/${group.id}`}
									className='flex items-center justify-center gap-2 w-full rounded-md bg-secondary text-secondary-foreground px-4 py-2.5 font-semibold transition hover:bg-secondary/90'>
									<span>Buka Grup</span>
									<ChevronRight className='h-5 w-5' />
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
