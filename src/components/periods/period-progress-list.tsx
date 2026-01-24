'use client'

import { LockPeriodButton } from '@/components/periods/lock-period-button'
import { ProgressStatusDropdown } from '@/components/periods/progress-dropdown'
import { ShareButton } from '@/components/periods/share-button'
import { ChevronDown, Search, X } from 'lucide-react'
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
	missedStreak: number
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
		coordinatorGroups: Array<{
			coordinator: {
				id: string
				name: string | null
			}
		}>
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
	const [filterStatus, setFilterStatus] = useState<ProgressStatus | null>(null)
	const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({})

	// Define Juz groups
	const juzGroups = [
		{ label: 'Juz 1-5', juzNumbers: [1, 2, 3, 4, 5] },
		{ label: 'Juz 6-10', juzNumbers: [6, 7, 8, 9, 10] },
		{ label: 'Juz 11-15', juzNumbers: [11, 12, 13, 14, 15] },
		{ label: 'Juz 16-20', juzNumbers: [16, 17, 18, 19, 20] },
		{ label: 'Juz 21-25', juzNumbers: [21, 22, 23, 24, 25] },
		{ label: 'Juz 26-30', juzNumbers: [26, 27, 28, 29, 30] },
	]

	// Filter and search participants
	const filteredParticipants = useMemo(() => {
		let filtered = period.participantPeriods

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter((pp) => pp.participant.name.toLowerCase().includes(query))
		}

		// Apply status filter
		if (filterStatus !== null) {
			filtered = filtered.filter((pp) => pp.progressStatus === filterStatus)
		}

		return filtered
	}, [searchQuery, filterStatus, period.participantPeriods])

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

	const hasActiveFilters = searchQuery.trim() || filterStatus !== null

	const resetFilters = () => {
		setSearchQuery('')
		setFilterStatus(null)
		setExpandedGroups({})
	}

	const toggleGroupExpanded = (groupIndex: number) => {
		setExpandedGroups((prev) => ({
			...prev,
			[groupIndex]: !prev[groupIndex],
		}))
	}

	const isGroupExpanded = (groupIndex: number, group: { label: string; juzNumbers: number[] }) => {
		// Auto-expand if searching and this group has matching participants
		if (searchQuery.trim()) {
			const participantsInGroup = group.juzNumbers.flatMap((juz) => byJuz[juz] || [])
			if (participantsInGroup.length > 0) return true
		}
		return expandedGroups[groupIndex] || false
	}

	return (
		<div>
			{/* Lock Period and Share Buttons */}
			<div className='mb-6 flex items-center justify-between gap-4'>
				<div>{isActive && <LockPeriodButton periodId={period.id} notFinishedCount={notFinishedCount} />}</div>
				<ShareButton
					period={period}
					groupName={period.group.name}
					publicToken={period.group.publicToken}
					coordinators={period.group.coordinatorGroups.map((cg) => cg.coordinator)}
				/>
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
						onChange={(e) => {
							const newValue = e.target.value
							setSearchQuery(newValue)
							// Clear expanded state when search is cleared
							if (!newValue.trim()) {
								setExpandedGroups({})
							}
						}}
						className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition'
					/>
				</div>

				{/* Filter Actions Row */}
				<div className='flex items-center justify-between gap-3'>
					{hasActiveFilters && (
						<button
							onClick={resetFilters}
							className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-base hover:bg-muted transition'>
							<X className='h-3.5 w-3.5' />
							Reset
						</button>
					)}

					{/* Results Count */}
					<span className='text-base text-muted-foreground'>
						{filteredParticipants.length} dari {period.participantPeriods.length} peserta
					</span>
				</div>

				{/* Status Filter Button Group */}
				<div className='space-y-2'>
					<label className='text-base font-medium text-foreground'>Filter Status:</label>
					<div className='flex flex-wrap gap-3 sm:flex-nowrap sm:grid sm:grid-cols-2 lg:flex lg:flex-nowrap'>
						{/* All Status Button */}
						<button
							onClick={() => setFilterStatus(null)}
							className={`flex-1 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
								filterStatus === null
									? 'bg-primary text-white shadow-sm'
									: 'border-2 bg-background text-foreground hover:bg-muted'
							}`}
							style={filterStatus === null ? {} : { borderColor: 'hsl(var(--border))' }}>
							Semua Status
						</button>

						{/* Finished Button */}
						<button
							onClick={() => setFilterStatus('finished')}
							className={`flex-1 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
								filterStatus === 'finished' ? 'text-white shadow-sm' : 'border-2 bg-background text-foreground'
							}`}
							style={
								filterStatus === 'finished'
									? { backgroundColor: 'hsl(var(--success))' }
									: {
											borderColor: 'hsl(var(--success))',
											backgroundColor: 'hsl(var(--success-bg))',
										}
							}>
							<span className='mr-2'>👑</span>Selesai
						</button>

						{/* In Progress Button */}
						<button
							onClick={() => setFilterStatus('not_finished')}
							className={`flex-1 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
								filterStatus === 'not_finished'
									? 'text-white shadow-sm'
									: 'border-2 bg-background text-foreground'
							}`}
							style={
								filterStatus === 'not_finished'
									? { backgroundColor: 'hsl(var(--warning))' }
									: {
											borderColor: 'hsl(var(--warning))',
											backgroundColor: 'hsl(var(--warning-bg))',
										}
							}>
							<span className='mr-2'>⏳</span>Dalam Proses
						</button>

						{/* Missed Button */}
						<button
							onClick={() => setFilterStatus('missed')}
							className={`flex-1 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
								filterStatus === 'missed' ? 'text-white shadow-sm' : 'border-2 bg-background text-foreground'
							}`}
							style={
								filterStatus === 'missed'
									? { backgroundColor: 'hsl(var(--destructive))' }
									: {
											borderColor: 'hsl(var(--destructive))',
											backgroundColor: 'hsl(var(--error-bg))',
										}
							}>
							<span className='mr-2'>💔</span>Terlewat
						</button>
					</div>
				</div>
			</div>

			{/* Progress by Juz */}
			<div className='space-y-4'>
				<h2 className='text-xl font-medium'>Progress per Juz</h2>

				{filteredParticipants.length === 0 ? (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
							<Search className='h-8 w-8 text-muted-foreground' />
						</div>
						<h3 className='text-xl font-medium mb-2'>Tidak ada hasil</h3>
						<p className='text-muted-foreground text-base mb-4'>
							Tidak ditemukan peserta yang sesuai dengan filter yang dipilih.
						</p>
						{hasActiveFilters && (
							<button
								onClick={resetFilters}
								className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-base font-medium hover:bg-primary/90 transition'>
								<X className='h-4 w-4' />
								Reset Filter
							</button>
						)}
					</div>
				) : (
					juzGroups.map((group, index) => {
						const participantsInGroup = group.juzNumbers.flatMap((juz) => byJuz[juz] || [])
						if (participantsInGroup.length === 0) return null
						const isExpanded = isGroupExpanded(index, group)

						return (
							<div key={index} className='rounded-xl border border-border bg-card overflow-hidden'>
								{/* Accordion Header */}
								<button
									onClick={() => toggleGroupExpanded(index)}
									className='w-full hover:bg-muted/80 px-4 py-3 border-b-2 border-b-accent flex items-center justify-between transition-colors cursor-pointer'
									aria-expanded={isExpanded}>
									<h3 className='font-medium text-left'>{group.label}</h3>
									<div className='flex items-center gap-2'>
										<span className='text-base text-muted-foreground'>
											{participantsInGroup.length} peserta
										</span>
										<ChevronDown
											className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
												isExpanded ? 'rotate-180' : ''
											}`}
										/>
									</div>
								</button>

								{/* Accordion Content */}
								{isExpanded && (
									<div className='divide-y divide-border'>
										{participantsInGroup.map((pp) => (
											<div key={pp.id} className='flex items-center justify-between px-4 py-3'>
												<div className='flex items-center gap-3'>
													<div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
														<span className='text-primary font-medium text-base'>
															{pp.participant.name.charAt(0).toUpperCase()}
														</span>
													</div>
													<div>
														<div className='flex items-center gap-2'>
															<p className='font-medium text-base'>{pp.participant.name}</p>
															{pp.missedStreak > 0 && (
																<span className='inline-flex items-center px-1.5 py-0.5 rounded text-sm font-medium bg-destructive/10 text-destructive'>
																	💔×{pp.missedStreak}
																</span>
															)}
														</div>
														<p className='text-sm text-muted-foreground'>Juz {pp.juzNumber}</p>
														{!pp.participant.isActive && (
															<p className='text-sm text-muted-foreground'>Tidak Aktif</p>
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
															className={`inline-flex items-center gap-1 text-base ${
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
								)}
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
