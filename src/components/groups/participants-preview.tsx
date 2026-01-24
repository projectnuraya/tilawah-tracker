'use client'

import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Participant {
	id: string
	name: string
	whatsappNumber: string | null
}

interface ParticipantsPreviewProps {
	participants: Participant[]
	groupId: string
}

export function ParticipantsPreview({ participants, groupId }: ParticipantsPreviewProps) {
	const [expanded, setExpanded] = useState(false)

	const displayCount = expanded ? participants.length : 15
	const hasMore = participants.length > 15
	const hiddenCount = participants.length - 15

	if (participants.length === 0) {
		return (
			<div className='text-center py-4'>
				<p className='text-xl text-muted-foreground mb-3'>Belum ada peserta.</p>
				<Link
					href={`/groups/${groupId}/participants/new`}
					className='inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xl font-medium text-primary-foreground hover:bg-primary/90 transition'>
					<Plus className='h-4 w-4' />
					Tambah Peserta
				</Link>
			</div>
		)
	}

	return (
		<div>
			<div className='flex flex-wrap gap-2'>
				{participants.slice(0, displayCount).map((p) => (
					<div
						key={p.id}
						className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xl text-primary'>
						<span>{p.name}</span>
						{p.whatsappNumber && <span className='text-sm'>📱</span>}
					</div>
				))}
				{hasMore && !expanded && (
					<button
						onClick={() => setExpanded(true)}
						className='inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xl text-muted-foreground hover:bg-muted/80 transition cursor-pointer'>
						<span>+{hiddenCount} lainnya</span>
						<ChevronDown className='h-4 w-4' />
					</button>
				)}
				{expanded && hasMore && (
					<button
						onClick={() => setExpanded(false)}
						className='inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xl text-muted-foreground hover:bg-muted/80 transition cursor-pointer'>
						<span>Tampilkan Lebih Sedikit</span>
						<ChevronUp className='h-4 w-4' />
					</button>
				)}
			</div>
		</div>
	)
}
