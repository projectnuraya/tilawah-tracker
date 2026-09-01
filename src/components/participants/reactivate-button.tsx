'use client'

import { logger } from '@/components/lib/logger'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReactivateButtonProps {
	participantId: string
	groupId: string
}

export function ReactivateButton({ participantId, groupId }: ReactivateButtonProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const handleReactivate = async () => {
		setIsLoading(true)

		try {
			const response = await fetch(`/api/v1/participants/${participantId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ isActive: true }),
			})

			if (response.ok) {
				router.push(`/groups/${groupId}/participants`)
				router.refresh()
			} else {
				toast.error('Gagal mengaktifkan peserta', { description: 'Silakan coba lagi.' })
			}
		} catch (err) {
			logger.error({ err, participantId }, 'Failed to reactivate participant')
			toast.error('Gagal mengaktifkan peserta', { description: 'Periksa koneksi internet Anda.' })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Button onClick={handleReactivate} disabled={isLoading}>
			{isLoading ? (
				<>
					<Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
					Mengaktifkan...
				</>
			) : (
				<>
					<UserPlus className='h-4 w-4' aria-hidden='true' />
					Aktifkan Kembali
				</>
			)}
		</Button>
	)
}
