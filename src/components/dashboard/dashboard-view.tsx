'use client'

import { Calendar, ChevronRight, Plus, Users } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

export type DashboardGroupItem = {
	id: string
	name: string
	publicToken: string
	participantCount: number
	periodCount: number
	hasActivePeriod: boolean
	latestPeriodNumber: number
}

interface DashboardViewProps {
	groups: DashboardGroupItem[]
}

export function DashboardView({ groups }: DashboardViewProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: 'easeOut' }}>
			{/* Action Header Button */}
			<div className='mb-6'>
				<motion.div whileTap={{ scale: 0.98 }}>
					<Link
						href='/groups/new'
						className='flex min-h-12 items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3.5 text-primary-foreground font-semibold shadow-sm hover:bg-primary-hover transition-colors'>
						<Plus className='h-5 w-5' />
						<span>Tambah Grup Baru</span>
					</Link>
				</motion.div>
			</div>

			{/* Groups List or Empty State */}
			{groups.length === 0 ? (
				<div className='rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-sm'>
					<div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
						<Users className='h-8 w-8 text-primary' />
					</div>
					<h2 className='text-2xl font-medium mb-2 text-foreground'>Belum ada grup</h2>
					<p className='text-muted-foreground text-base mb-6 max-w-sm mx-auto'>
						Buat grup tilawah pertama Anda untuk mulai melacak progress tilawah bersama.
					</p>
					<motion.div whileTap={{ scale: 0.98 }} className='inline-block'>
						<Link
							href='/groups/new'
							className='inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-medium shadow-sm hover:bg-primary-hover transition-colors'>
							<Plus className='h-4 w-4' />
							Buat Grup Baru
						</Link>
					</motion.div>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
					{groups.map((group) => (
						<motion.div
							key={group.id}
							whileHover={{ y: -3 }}
							transition={{ duration: 0.15 }}
							className='flex flex-col rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all overflow-hidden p-5 group'>
							{/* Status Badge */}
							<div>
								{group.hasActivePeriod ? (
									<span className='inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-bold text-success-bg-foreground'>
										<span className='h-2 w-2 rounded-full bg-success animate-pulse' aria-hidden='true' />
										SEDANG BERLANGSUNG
									</span>
								) : (
									<span className='inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground'>
										TIDAK ADA PERIODE AKTIF
									</span>
								)}
							</div>

							{/* Content */}
							<div className='flex-1 py-5'>
								<h3 className='font-bold text-xl mb-4 pb-4 border-b border-border leading-tight text-foreground group-hover:text-primary transition-colors'>
									{group.name}
								</h3>

								{/* Stats - with icons */}
								<div className='flex items-center gap-8'>
									<div className='flex items-center gap-3'>
										<div className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/5 shrink-0 group-hover:border-primary transition-colors'>
											<Users className='h-5 w-5 text-primary' />
										</div>
										<div className='flex flex-col gap-0'>
											<span className='text-xs font-bold text-muted-foreground tracking-wide'>ANGGOTA</span>
											<span className='text-base font-bold text-foreground'>
												{group.participantCount} Peserta
											</span>
										</div>
									</div>
									<div className='flex items-center gap-3'>
										<div className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/5 shrink-0 group-hover:border-primary transition-colors'>
											<Calendar className='h-5 w-5 text-primary' />
										</div>
										<div className='flex flex-col gap-0'>
											<span className='text-xs font-bold text-muted-foreground tracking-wide'>PERIODE</span>
											<span className='text-base font-bold text-foreground'>
												Ke-{group.latestPeriodNumber}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Button */}
							<div>
								<motion.div whileTap={{ scale: 0.98 }}>
									<Link
										href={`/groups/${group.id}`}
										className='flex items-center justify-center gap-2 w-full rounded-lg bg-secondary text-secondary-foreground px-4 py-2.5 font-semibold hover:bg-secondary/90 transition-all group/btn'>
										<span>Buka Grup</span>
										<ChevronRight className='h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-1' />
									</Link>
								</motion.div>
							</div>
						</motion.div>
					))}
				</div>
			)}
		</motion.div>
	)
}
