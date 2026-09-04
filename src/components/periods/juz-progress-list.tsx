'use client'

import { groupByJuz } from '@/components/lib/juz'
import { PROGRESS } from '@/components/lib/status'
import { cn } from '@/components/lib/utils'
import { ProgressStatusDropdown } from '@/components/periods/progress-dropdown'
import { fieldClasses } from '@/components/ui/input'
import { PROGRESS_STATUS, type ProgressStatus, StatusText } from '@/components/ui/status-badge'
import { ChevronDown, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface Participant {
	id: string
	name: string
	isActive: boolean
	/** Coordinator-only. Never selected on public paths, so it is optional here. */
	whatsappNumber?: string | null
}

export interface JuzParticipantPeriod {
	id: string
	juzNumber: number
	progressStatus: string
	missedStreak: number
	participant: Participant
}

interface JuzProgressListProps {
	participantPeriods: JuzParticipantPeriod[]
	/** Coordinators editing an unlocked period get status dropdowns; everyone else gets plain text. */
	editable?: boolean
	/** Locked periods have a meaningful "missed" count, so the filter only appears for them. */
	showMissedFilter?: boolean
	/** Rendered above the filters — the share and lock actions on the coordinator side. */
	actions?: React.ReactNode
}

const JUZ_GROUPS = [
	{ label: 'Juz 1-5', juzNumbers: [1, 2, 3, 4, 5] },
	{ label: 'Juz 6-10', juzNumbers: [6, 7, 8, 9, 10] },
	{ label: 'Juz 11-15', juzNumbers: [11, 12, 13, 14, 15] },
	{ label: 'Juz 16-20', juzNumbers: [16, 17, 18, 19, 20] },
	{ label: 'Juz 21-25', juzNumbers: [21, 22, 23, 24, 25] },
	{ label: 'Juz 26-30', juzNumbers: [26, 27, 28, 29, 30] },
]

const FILTERS: { value: ProgressStatus | null; label: string; icon?: string; on: string; off: string }[] = [
	{
		value: null,
		label: 'Semua Status',
		on: 'bg-primary text-primary-foreground shadow-sm',
		off: 'border-2 border-border bg-background text-foreground hover:bg-muted',
	},
	{
		value: PROGRESS.finished,
		label: PROGRESS_STATUS.finished.label,
		icon: PROGRESS_STATUS.finished.icon,
		on: 'bg-success text-success-foreground shadow-sm',
		off: 'border-2 border-success bg-success-bg text-success-bg-foreground',
	},
	{
		value: PROGRESS.notFinished,
		label: PROGRESS_STATUS.not_finished.label,
		icon: PROGRESS_STATUS.not_finished.icon,
		on: 'bg-warning text-warning-foreground shadow-sm',
		off: 'border-2 border-warning bg-warning-bg text-warning-bg-foreground',
	},
	{
		value: PROGRESS.missed,
		label: PROGRESS_STATUS.missed.label,
		icon: PROGRESS_STATUS.missed.icon,
		on: 'bg-destructive text-destructive-foreground shadow-sm',
		off: 'border-2 border-destructive bg-error-bg text-error-bg-foreground',
	},
]

/**
 * Progress grouped by juz, with search and status filters.
 *
 * Replaces two near-identical components that had drifted apart: the coordinator's copy collapsed
 * every juz group by default (six extra taps just to see the list, against the "minimal
 * interactions" goal in docs/product-concept.md) while the public copy was always expanded, and
 * their empty-state buttons had different styles. Sections now start open on both sides and can
 * still be collapsed.
 */
export function JuzProgressList({
	participantPeriods,
	editable = false,
	showMissedFilter = false,
	actions,
}: JuzProgressListProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [filterStatus, setFilterStatus] = useState<ProgressStatus | null>(null)
	const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})

	const filtered = useMemo(() => {
		let rows = participantPeriods
		const query = searchQuery.trim().toLowerCase()
		if (query) rows = rows.filter((pp) => pp.participant.name.toLowerCase().includes(query))
		if (filterStatus !== null) rows = rows.filter((pp) => pp.progressStatus === filterStatus)
		return rows
	}, [searchQuery, filterStatus, participantPeriods])

	const byJuz = useMemo(() => groupByJuz(filtered), [filtered])

	const hasActiveFilters = searchQuery.trim() !== '' || filterStatus !== null

	const resetFilters = () => {
		setSearchQuery('')
		setFilterStatus(null)
		setCollapsed({})
	}

	const visibleFilters = FILTERS.filter((f) => f.value !== PROGRESS.missed || showMissedFilter)

	return (
		<div>
			{actions && <div className='mb-6 flex items-center justify-between gap-4'>{actions}</div>}

			<div className='mb-6 space-y-3'>
				<div className='relative'>
					<Search
						className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none'
						aria-hidden='true'
					/>
					<input
						type='search'
						placeholder='Cari nama peserta...'
						aria-label='Cari nama peserta'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={cn(fieldClasses, 'pl-10')}
					/>
				</div>

				<div className='flex items-center justify-between gap-3'>
					<span className='text-base text-muted-foreground'>
						{filtered.length} dari {participantPeriods.length} peserta
					</span>
					<button
						onClick={resetFilters}
						disabled={!hasActiveFilters}
						className={cn(
							'inline-flex min-h-11 items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-base transition',
							hasActiveFilters ? 'hover:bg-muted cursor-pointer' : 'opacity-50 cursor-not-allowed',
						)}>
						<X className='h-3.5 w-3.5' aria-hidden='true' />
						Reset
					</button>
				</div>

				<fieldset className='space-y-2'>
					<legend className='text-base font-medium text-foreground mb-2'>Filter Status:</legend>
					<div className='flex flex-wrap gap-3 sm:grid sm:grid-cols-2 lg:flex lg:flex-nowrap'>
						{visibleFilters.map((f) => (
							<button
								key={f.label}
								onClick={() => setFilterStatus(f.value)}
								aria-pressed={filterStatus === f.value}
								className={cn(
									'flex-1 min-h-12 px-4 py-3 rounded-lg font-medium text-base transition-colors',
									filterStatus === f.value ? f.on : f.off,
								)}>
								{f.icon && (
									<span className='mr-2' aria-hidden='true'>
										{f.icon}
									</span>
								)}
								{f.label}
							</button>
						))}
					</div>
				</fieldset>
			</div>

			<div className='space-y-4'>
				<h2 className='text-xl font-medium'>Progress per Juz</h2>

				{filtered.length === 0 ? (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
							<Search className='h-8 w-8 text-muted-foreground' aria-hidden='true' />
						</div>
						<h3 className='text-xl font-medium mb-2'>Tidak ada hasil</h3>
						<p className='text-muted-foreground text-base mb-4'>
							Tidak ditemukan peserta yang sesuai dengan filter yang dipilih.
						</p>
						{hasActiveFilters && (
							<button
								onClick={resetFilters}
								className='inline-flex min-h-11 items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-base font-medium hover:bg-primary-hover transition'>
								<X className='h-4 w-4' aria-hidden='true' />
								Reset Filter
							</button>
						)}
					</div>
				) : (
					JUZ_GROUPS.map((group, index) => {
						const rows = group.juzNumbers.flatMap((juz) => byJuz[juz] ?? [])
						if (rows.length === 0) return null
						const isOpen = !collapsed[index]

						return (
							<div key={group.label} className='rounded-xl border border-border bg-card overflow-hidden'>
								<button
									onClick={() => setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }))}
									className='w-full hover:bg-muted/80 px-4 py-3 border-b-2 border-b-accent flex items-center justify-between transition-colors cursor-pointer'
									aria-expanded={isOpen}>
									<h3 className='font-medium text-left'>{group.label}</h3>
									<div className='flex items-center gap-2'>
										<span className='text-base text-muted-foreground'>{rows.length} peserta</span>
										<ChevronDown
											className={cn(
												'h-4 w-4 text-muted-foreground transition-transform duration-200',
												isOpen && 'rotate-180',
											)}
											aria-hidden='true'
										/>
									</div>
								</button>

								{isOpen && (
									<div className='divide-y divide-border'>
										{rows.map((pp) => (
											<div key={pp.id} className='flex items-center justify-between gap-3 px-4 py-3'>
												<div className='flex items-center gap-3 min-w-0'>
													<div className='w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center'>
														<span className='text-primary font-medium text-base'>
															{pp.participant.name.charAt(0).toUpperCase()}
														</span>
													</div>
													<div className='min-w-0'>
														<div className='flex items-center gap-2'>
															<p className='font-medium text-base truncate'>
																{pp.participant.name}
															</p>
															{pp.missedStreak > 0 && (
																<span
																	className='inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-sm font-medium bg-error-bg text-error-bg-foreground'
																	title={`Terlewat ${pp.missedStreak} periode berturut-turut`}>
																	💔×{pp.missedStreak}
																</span>
															)}
														</div>
														<p className='text-sm text-muted-foreground'>
															Juz {pp.juzNumber}
															{!pp.participant.isActive && ' · Tidak Aktif'}
														</p>
													</div>
												</div>
												<div className='shrink-0'>
													{editable ? (
														<ProgressStatusDropdown
															participantPeriodId={pp.id}
															currentStatus={pp.progressStatus}
															participantName={pp.participant.name}
															whatsappNumber={pp.participant.whatsappNumber ?? null}
														/>
													) : (
														<StatusText status={pp.progressStatus} />
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
