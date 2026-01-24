'use client'

import { JuzDropdown } from '@/components/participants/juz-dropdown'
import { Edit, Phone, Search, UserX } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface Participant {
	id: string
	name: string
	whatsappNumber?: string | null
	isActive: boolean
}

interface ParticipantData {
	juzNumber: number
	participantPeriodId: string
}

interface ParticipantsListProps {
	groupId: string
	activeParticipants: Participant[]
	inactiveParticipants: Participant[]
	activePeriod: boolean
	participantDataMap: Map<string, ParticipantData>
}

export function ParticipantsList({
	groupId,
	activeParticipants,
	inactiveParticipants,
	activePeriod,
	participantDataMap,
}: ParticipantsListProps) {
	const [searchQuery, setSearchQuery] = useState('')

	// Filter participants based on search query
	const filteredActiveParticipants = useMemo(() => {
		if (!searchQuery.trim()) return activeParticipants

		const query = searchQuery.toLowerCase()
		return activeParticipants.filter((participant) => {
			const matchesName = participant.name.toLowerCase().includes(query)
			const matchesPhone = participant.whatsappNumber?.toLowerCase().includes(query)
			return matchesName || matchesPhone
		})
	}, [searchQuery, activeParticipants])

	const filteredInactiveParticipants = useMemo(() => {
		if (!searchQuery.trim()) return inactiveParticipants

		const query = searchQuery.toLowerCase()
		return inactiveParticipants.filter((participant) => {
			const matchesName = participant.name.toLowerCase().includes(query)
			const matchesPhone = participant.whatsappNumber?.toLowerCase().includes(query)
			return matchesName || matchesPhone
		})
	}, [searchQuery, inactiveParticipants])

	return (
		<div>
			{/* Search Bar */}
			{(activeParticipants.length > 0 || inactiveParticipants.length > 0) && (
				<div className='mb-6'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
						<input
							type='text'
							placeholder='Cari nama atau nomor WA...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition'
						/>
					</div>
				</div>
			)}

			{/* Active Participants */}
			{activeParticipants.length === 0 ? (
				<div className='rounded-xl border border-border bg-card p-8 text-center'>
					<div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
						<Search className='h-8 w-8 text-primary' />
					</div>
					<h2 className='text-xl font-medium mb-2'>Belum ada peserta</h2>
					<p className='text-muted-foreground text-base mb-6'>
						Tambahkan peserta untuk mulai melacak progress tilawah mereka.
					</p>
					<Link
						href={`/groups/${groupId}/participants/new`}
						className='inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90'>
						<span>Tambah Peserta Pertama</span>
					</Link>
				</div>
			) : filteredActiveParticipants.length === 0 && searchQuery ? (
				<div className='rounded-xl border border-border bg-card p-8 text-center'>
					<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
						<Search className='h-8 w-8 text-muted-foreground' />
					</div>
					<h2 className='text-xl font-medium mb-2'>Tidak ada hasil</h2>
					<p className='text-muted-foreground text-sm'>
						Tidak ditemukan peserta yang sesuai dengan pencarian &quot;{searchQuery}&quot;.
					</p>
				</div>
			) : (
				<div className='rounded-xl border border-border bg-card divide-y divide-border'>
					{filteredActiveParticipants.map((participant) => {
						const participantData = participantDataMap.get(participant.id)
						return (
							<div
								key={participant.id}
								className='flex items-center justify-between p-4 hover:bg-muted/50 transition'>
								<Link
									href={`/groups/${groupId}/participants/${participant.id}`}
									className='flex items-center gap-3 flex-1'>
									<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
										<span className='text-primary font-medium'>
											{participant.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<p className='font-medium'>{participant.name}</p>
										{participant.whatsappNumber && (
											<p className='text-base text-muted-foreground flex items-center gap-1'>
												<Phone className='h-3 w-3' />
												{participant.whatsappNumber}
											</p>
										)}
									</div>
								</Link>
								<div className='flex items-center gap-3'>
									{activePeriod && participantData && (
										<JuzDropdown
											participantPeriodId={participantData.participantPeriodId}
											currentJuz={participantData.juzNumber}
											participantName={participant.name}
										/>
									)}
									<Link
										href={`/groups/${groupId}/participants/${participant.id}`}
										className='p-2 rounded-lg hover:bg-muted transition'
										aria-label={`Edit ${participant.name}`}>
										<Edit className='h-4 w-4 text-muted-foreground' />
									</Link>
								</div>
							</div>
						)
					})}
				</div>
			)}

			{/* Inactive Participants */}
			{inactiveParticipants.length > 0 && (
				<div className='mt-8'>
					<h2 className='text-xl font-medium mb-4 flex items-center gap-2'>
						<UserX className='h-5 w-5 text-muted-foreground' />
						Tidak Aktif ({filteredInactiveParticipants.length})
					</h2>
					{filteredInactiveParticipants.length === 0 && searchQuery ? (
						<div className='rounded-xl border border-border bg-card/50 p-8 text-center'>
							<p className='text-muted-foreground text-base'>
								Tidak ditemukan peserta tidak aktif yang sesuai dengan pencarian.
							</p>
						</div>
					) : (
						<div className='rounded-xl border border-border bg-card/50 divide-y divide-border'>
							{filteredInactiveParticipants.map((participant) => (
								<Link
									key={participant.id}
									href={`/groups/${groupId}/participants/${participant.id}`}
									className='flex items-center justify-between p-4 hover:bg-muted/50 transition opacity-60'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
											<span className='text-muted-foreground font-medium'>
												{participant.name.charAt(0).toUpperCase()}
											</span>
										</div>
										<div>
											<p className='font-medium'>{participant.name}</p>
											<p className='text-base text-muted-foreground'>Tidak Aktif</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
