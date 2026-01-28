'use client'

import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface PageProps {
	params: Promise<{ id: string }>
}

interface ParticipantInput {
	id: string
	name: string
	whatsappNumber: string
}

const sanitizeWhatsAppNumber = (input: string): string => {
	const cleaned = input.replace(/\D/g, '')
	if (cleaned.startsWith('62')) {
		return '+' + cleaned
	} else if (cleaned.startsWith('0')) {
		return '+62' + cleaned.slice(1)
	} else if (cleaned.startsWith('628')) {
		return '+62' + cleaned.slice(2)
	} else {
		return '+' + cleaned
	}
}

export default function NewParticipantPage({ params }: PageProps) {
	const router = useRouter()
	const [groupId, setGroupId] = useState<string | null>(null)
	const [participants, setParticipants] = useState<ParticipantInput[]>([{ id: uuidv4(), name: '', whatsappNumber: '' }])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		params.then(({ id }) => setGroupId(id))
	}, [params])

	const addParticipantRow = () => {
		setParticipants([...participants, { id: uuidv4(), name: '', whatsappNumber: '' }])
	}

	const removeParticipantRow = (id: string) => {
		if (participants.length === 1) return
		setParticipants(participants.filter((p) => p.id !== id))
	}

	const updateParticipant = (id: string, field: 'name' | 'whatsappNumber', value: string) => {
		const sanitizedValue = field === 'whatsappNumber' ? sanitizeWhatsAppNumber(value) : value
		setParticipants(participants.map((p) => (p.id === id ? { ...p, [field]: sanitizedValue } : p)))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		// Filter out empty participants
		const validParticipants = participants.filter((p) => p.name.trim())

		if (validParticipants.length === 0) {
			setError('Tambahkan minimal satu peserta dengan nama')
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch(`/api/v1/groups/${groupId}/participants/bulk`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					participants: validParticipants.map((p) => ({
						name: p.name.trim(),
						whatsappNumber: p.whatsappNumber.trim() || null,
					})),
				}),
			})

			const data = await response.json()

			if (!data.success) {
				setError(data.error?.message || 'Failed to add participants')
				return
			}

			router.push(`/groups/${groupId}/participants`)
			router.refresh()
		} catch {
			setError('An unexpected error occurred')
		} finally {
			setIsLoading(false)
		}
	}

	if (!groupId) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-6 w-6 animate-spin text-primary' />
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center'>
			{/* Back Button */}
			<div className='w-full max-w-2xl mb-6'>
				<Link
					href={`/groups/${groupId}/participants`}
					className='inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground'>
					<ArrowLeft className='h-4 w-4' />
					Kembali ke Peserta
				</Link>
			</div>

			<div className='w-full max-w-2xl'>
				<h1 className='text-2xl font-semibold mb-2 text-center'>Tambah Peserta</h1>
				<p className='text-muted-foreground text-xl mb-6 text-center'>
					Tambahkan satu atau lebih anggota ke grup tilawah ini.
				</p>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Participant Rows */}
					<div className='space-y-4'>
						{participants.map((participant, index) => (
							<div key={participant.id} className='flex gap-3 items-start'>
								<div className='flex-1 space-y-3'>
									<div>
										<label htmlFor={`name-${participant.id}`} className='block text-xl font-medium mb-2'>
											Nama {index === 0 && <span className='text-destructive'>*</span>}
										</label>
										<input
											type='text'
											id={`name-${participant.id}`}
											value={participant.name}
											onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
											placeholder='contoh: Ahmad'
											className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
											disabled={isLoading}
											autoFocus={index === 0}
										/>
									</div>

									<div>
										<label htmlFor={`whatsapp-${participant.id}`} className='block text-xl font-medium mb-2'>
											WhatsApp <span className='text-muted-foreground text-sm'>(opsional)</span>
										</label>
										<input
											type='tel'
											id={`whatsapp-${participant.id}`}
											value={participant.whatsappNumber}
											onChange={(e) => updateParticipant(participant.id, 'whatsappNumber', e.target.value)}
											placeholder='contoh: +6281234567890'
											className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
											disabled={isLoading}
										/>
									</div>
								</div>

								{/* Remove Button */}
								{participants.length > 1 && (
									<button
										type='button'
										onClick={() => removeParticipantRow(participant.id)}
										disabled={isLoading}
										className='mt-8 p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition disabled:opacity-50'
										title='Remove'>
										<X className='h-5 w-5' />
									</button>
								)}
							</div>
						))}
					</div>

					{/* Add More Button */}
					<button
						type='button'
						onClick={addParticipantRow}
						disabled={isLoading}
						className='w-full rounded-lg border-2 border-dashed border-border px-4 py-3 text-xl font-medium text-muted-foreground hover:border-primary hover:text-primary transition disabled:opacity-50'>
						<Plus className='h-5 w-5 inline-block mr-2' />
						Tambah Peserta Lagi
					</button>

					{error && (
						<div className='rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3'>
							<p className='text-base text-destructive'>{error}</p>
						</div>
					)}

					{/* Submit Button */}
					<div className='pt-2'>
						<button
							type='submit'
							disabled={isLoading}
							className='w-full rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isLoading ? (
								<span className='inline-flex items-center gap-2'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Menambahkan Peserta...
								</span>
							) : (
								`Tambah ${participants.filter((p) => p.name.trim()).length || 1} Peserta`
							)}
						</button>
					</div>
				</form>

				<p className='mt-6 text-base text-muted-foreground text-center'>
					Jika ada periode aktif, peserta akan otomatis mendapat nomor juz yang tersedia.
				</p>
			</div>
		</div>
	)
}
