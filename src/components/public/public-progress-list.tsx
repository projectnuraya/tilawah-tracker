'use client'

import { Filter, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

type ProgressStatus = 'finished' | 'not_finished' | 'missed'

interface Participant {
	id: string
	name: string
	isActive: boolean
}

interface ParticipantPeriod {
	id: string
	juzNumber: number
	progressStatus: string
	missedStreak: number
	participant: Participant
}

interface PublicProgressListProps {
	participantPeriods: ParticipantPeriod[]
}

export function PublicProgressList({ participantPeriods }: PublicProgressListProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [filterJuz, setFilterJuz] = useState<number | null>(null)
	const [filterStatus, setFilterStatus] = useState<ProgressStatus | null>(null)

	// Filter and search participants
	const filteredParticipants = useMemo(() => {
		let filtered = participantPeriods

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
	}, [searchQuery, filterJuz, filterStatus, participantPeriods])

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
			{/* Search and Filters */}
			<div className="mb-6 space-y-3">
				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Cari peserta..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					/>
				</div>

				{/* Filters */}
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<Filter className="h-3.5 w-3.5" />
						<span>Filter:</span>
					</div>

					{/* Juz Filter */}
					<select
						value={filterJuz ?? ''}
						onChange={(e) => setFilterJuz(e.target.value ? Number(e.target.value) : null)}
						className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
						<option value="">Semua Juz</option>
						{Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
							<option key={juz} value={juz}>
								Juz {juz}
							</option>
						))}
					</select>

					{/* Status Filter */}
					<select
						value={filterStatus ?? ''}
						onChange={(e) => setFilterStatus((e.target.value as ProgressStatus) || null)}
						className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
						<option value="">Semua Status</option>
						<option value="finished">👑 Selesai</option>
						<option value="not_finished">⏳ Belum selesai</option>
						<option value="missed">💔 Terlewat</option>
					</select>

					{/* Reset Button */}
					{hasActiveFilters && (
						<button
							onClick={resetFilters}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-sm hover:bg-muted transition">
							<X className="h-3.5 w-3.5" />
							Reset
						</button>
					)}

					{/* Results Count */}
					<span className="text-sm text-muted-foreground ml-auto">
						{filteredParticipants.length} dari {participantPeriods.length} peserta
					</span>
				</div>
			</div>

			{/* Progress by Juz */}
			<div className="space-y-4">
				<h2 className="text-lg font-medium">Progress per Juz</h2>

				{filteredParticipants.length === 0 ? (
					<div className="rounded-xl border border-border bg-card p-8 text-center">
						<div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
							<Search className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-medium mb-2">Tidak ada hasil</h3>
						<p className="text-muted-foreground text-sm mb-4">
							Tidak ada peserta yang sesuai dengan filter Anda.
						</p>
						{hasActiveFilters && (
							<button
								onClick={resetFilters}
								className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition">
								<X className="h-4 w-4" />
								Reset Filter
							</button>
						)}
					</div>
				) : (
					Object.entries(byJuz).map(([juz, participants]) => {
						if (participants.length === 0) return null

						return (
							<div key={juz} className="rounded-xl border border-border bg-card">
								<div className="bg-muted/50 px-4 py-2 border-b border-border">
									<h3 className="font-medium">Juz {juz}</h3>
								</div>
								<div className="divide-y divide-border overflow-hidden">
									{participants.map((pp) => (
										<div key={pp.id} className="flex items-center justify-between px-4 py-3">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
													<span className="text-primary text-sm font-medium">
														{pp.participant.name.charAt(0).toUpperCase()}
													</span>
												</div>
												<div>
													<div className="flex items-center gap-2">
														<p className="font-medium text-sm">{pp.participant.name}</p>
														{pp.missedStreak > 0 && (
															<span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
																💔×{pp.missedStreak}
															</span>
														)}
													</div>
													{!pp.participant.isActive && <p className="text-xs text-muted-foreground">Tidak Aktif</p>}
												</div>
											</div>
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
