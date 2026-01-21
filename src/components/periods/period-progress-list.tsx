'use client'

import { LockPeriodButton } from '@/components/periods/lock-period-button'
import { ProgressStatusDropdown } from '@/components/periods/progress-dropdown'
import { ShareButton } from '@/components/periods/share-button'
import { Filter, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

type ProgressStatus = 'finished' | 'not_finished' | 'missed'

interface Participant {
	id: string
	name: string
	whatsappNumber: string | null
	isActive: boolean
}

interface ParticipantPeriod {
	id: string
	juzNumber: number
	progressStatus: ProgressStatus
	participant: Participant
}

interface Period {
	id: string
	periodNumber: number
	startDate: Date
	endDate: Date
	status: string
	group: {
		id: string
		name: string
		publicToken: string
	}
	participantPeriods: ParticipantPeriod[]
}

interface PeriodProgressListProps {
	period: Period
	isActive: boolean
	notFinishedCount: number
}

export function PeriodProgressList({ period, isActive, notFinishedCount }: PeriodProgressListProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [filterJuz, setFilterJuz] = useState<number | null>(null)
	const [filterStatus, setFilterStatus] = useState<ProgressStatus | null>(null)

	// Filter and search participants
	const filteredParticipants = useMemo(() => {
		let filtered = period.participantPeriods

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter((pp) => pp.participant.name.toLowerCase().includes(query))
		}

		// Apply Juz filter
		if (filterJuz !== null) {
			filtered = filtered.filter((pp) => pp.juzNumber === filterJuz)
		}

		// Apply status filter
		if (filterStatus !== null) {
			filtered = filtered.filter((pp) => pp.progressStatus === filterStatus)
		}

		return filtered
	}, [searchQuery, filterJuz, filterStatus, period.participantPeriods])

	// Group by juz for display
	const byJuz: Record<number, ParticipantPeriod[]> = useMemo(() => {
		const grouped: Record<number, ParticipantPeriod[]> = {}
		for (let i = 1; i <= 30; i++) {
			grouped[i] = []
		}
		for (const pp of filteredParticipants) {
			grouped[pp.juzNumber].push(pp)
		}
		return grouped
	}, [filteredParticipants])

	const hasActiveFilters = searchQuery.trim() || filterJuz !== null || filterStatus !== null

	const resetFilters = () => {
		setSearchQuery('')
		setFilterJuz(null)
		setFilterStatus(null)
	}

	return (
		<div>
			{/* Lock Period and Share Buttons */}
			<div className='mb-6 flex items-center justify-between gap-4'>
				<div>{isActive && <LockPeriodButton periodId={period.id} notFinishedCount={notFinishedCount} />}</div>
				<ShareButton period={period} groupName={period.group.name} publicToken={period.group.publicToken} />
			</div>

			{/* Search and Filters */}
			<div className='mb-6 space-y-3'>
				{/* Search Bar */}
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
					<input
						type='text'
						placeholder='Cari nama peserta...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition'
					/>
				</div>

				{/* Filter Row */}
				<div className='flex flex-wrap items-center gap-3'>
					<div className='flex items-center gap-2 text-sm text-muted-foreground'>
						<Filter className='h-4 w-4' />
						<span>Filter:</span>
					</div>

					{/* Juz Filter */}
					<select
						value={filterJuz ?? ''}
						onChange={(e) => setFilterJuz(e.target.value ? Number(e.target.value) : null)}
						className='px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition'>
						<option value=''>Semua Juz</option>
						{Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
							<option key={juz} value={juz}>
								Juz {juz}
							</option>
						))}
					</select>

					{/* Status Filter */}
					<select
						value={filterStatus ?? ''}
						onChange={(e) => setFilterStatus(e.target.value ? (e.target.value as ProgressStatus) : null)}
						className='px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition'>
						<option value=''>Semua Status</option>
						<option value='finished'>👑 Selesai</option>
						<option value='not_finished'>⏳ Dalam Proses</option>
						<option value='missed'>💔 Terlewat</option>
					</select>

					{/* Reset Button */}
					{hasActiveFilters && (
						<button
							onClick={resetFilters}
							className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-sm hover:bg-muted transition'>
							<X className='h-3.5 w-3.5' />
							Reset
						</button>
					)}

					{/* Results Count */}
					<span className='text-sm text-muted-foreground ml-auto'>
						{filteredParticipants.length} dari {period.participantPeriods.length} peserta
					</span>
				</div>
			</div>

			{/* Progress by Juz */}
			<div className='space-y-4'>
				<h2 className='text-lg font-medium'>Progress per Juz</h2>

				{filteredParticipants.length === 0 ? (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
							<Search className='h-8 w-8 text-muted-foreground' />
						</div>
						<h3 className='text-lg font-medium mb-2'>Tidak ada hasil</h3>
						<p className='text-muted-foreground text-sm mb-4'>
							Tidak ditemukan peserta yang sesuai dengan filter yang dipilih.
						</p>
						{hasActiveFilters && (
							<button
								onClick={resetFilters}
								className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition'>
								<X className='h-4 w-4' />
								Reset Filter
							</button>
						)}
					</div>
				) : (
					Object.entries(byJuz).map(([juz, participants]) => {
						if (participants.length === 0) return null

						return (
							<div key={juz} className='rounded-xl border border-border bg-card'>
								<div className='bg-muted/50 px-4 py-2 border-b border-border'>
									<h3 className='font-medium'>Juz {juz}</h3>
								</div>
								<div className='divide-y divide-border overflow-hidden'>
									{participants.map((pp) => (
										<div key={pp.id} className='flex items-center justify-between px-4 py-3'>
											<div className='flex items-center gap-3'>
												<div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
													<span className='text-primary text-sm font-medium'>
														{pp.participant.name.charAt(0).toUpperCase()}
													</span>
												</div>
												<div>
													<p className='font-medium text-sm'>{pp.participant.name}</p>
													{!pp.participant.isActive && (
														<p className='text-xs text-muted-foreground'>Tidak Aktif</p>
													)}
												</div>
											</div>
											<div className='flex items-center gap-2'>
												{isActive ? (
													<ProgressStatusDropdown
														participantPeriodId={pp.id}
														currentStatus={pp.progressStatus}
														participantName={pp.participant.name}
														whatsappNumber={pp.participant.whatsappNumber}
													/>
												) : (
													<span
														className={`inline-flex items-center gap-1 text-sm ${
															pp.progressStatus === 'finished'
																? 'text-primary'
																: pp.progressStatus === 'missed'
																	? 'text-destructive'
																	: 'text-muted-foreground'
														}`}>
														{pp.progressStatus === 'finished' && '👑 Selesai'}
														{pp.progressStatus === 'missed' && '💔 Terlewat'}
														{pp.progressStatus === 'not_finished' && '⏳ Belum selesai'}
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
