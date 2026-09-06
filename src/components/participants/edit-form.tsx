'use client'

import { sanitizeWhatsAppNumber } from '@/components/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Participant {
	id: string
	name: string
	whatsappNumber: string | null
	groupId: string
}

interface EditParticipantFormProps {
	participant: Participant
}

export function EditParticipantForm({ participant }: EditParticipantFormProps) {
	const router = useRouter()
	const [name, setName] = useState(participant.name)
	const [whatsappNumber, setWhatsappNumber] = useState(participant.whatsappNumber || '')
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (!name.trim()) {
			setError('Nama wajib diisi')
			return
		}

		setIsSaving(true)

		try {
			const response = await fetch(`/api/v1/participants/${participant.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: name.trim(),
					whatsappNumber: whatsappNumber.trim() || null,
				}),
			})

			let data
			try {
				data = await response.json()
			} catch (err) {
				console.error('Failed to parse JSON response:', err)
				setError('Respons dari server tidak valid')
				return
			}

			if (!data.success) {
				setError(data.error?.message || 'Gagal memperbarui')
				return
			}

			toast.success('Perubahan berhasil disimpan')
			router.push(`/groups/${participant.groupId}/participants`)
			router.refresh()
		} catch {
			setError('Terjadi kesalahan yang tidak terduga')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div>
				<Label htmlFor='name'>Nama</Label>
				<Input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
			</div>

			<div>
				<Label htmlFor='whatsapp'>Nomor WhatsApp</Label>
				<Input
					type='tel'
					id='whatsapp'
					value={whatsappNumber}
					onChange={(e) => setWhatsappNumber(sanitizeWhatsAppNumber(e.target.value))}
					placeholder='+6281234567890'
					disabled={isSaving}
				/>
			</div>

			{error && <p className='text-base text-destructive'>{error}</p>}

			<motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
				<Button type='submit' disabled={isSaving} fullWidth className='cursor-pointer'>
					{isSaving ? (
						<>
							<Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
							Menyimpan...
						</>
					) : (
						'Simpan Perubahan'
					)}
				</Button>
			</motion.div>
		</form>
	)
}
