'use client'

import { logger } from '@/components/lib/logger'
import { Loader2, UserMinus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeactivateButtonProps {
	participantId: string
	groupId: string
}

export function DeactivateButton({ participantId, groupId }: DeactivateButtonProps) {
	const router = useRouter()
	const [isConfirming, setIsConfirming] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handleDeactivate = async () => {
		setIsLoading(true)

		try {
			const response = await fetch(`/api/v1/participants/${participantId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				// Navigating away, so state is intentionally left as-is to avoid a flash of the idle button
				router.push(`/groups/${groupId}/participants`)
				router.refresh()
			} else {
				toast.error('Gagal menonaktifkan peserta', { description: 'Silakan coba lagi.' })
				setIsLoading(false)
				setIsConfirming(false)
			}
		} catch (err) {
			logger.error({ err, participantId }, 'Failed to deactivate participant')
			toast.error('Gagal menonaktifkan peserta', { description: 'Periksa koneksi internet Anda.' })
			setIsLoading(false)
			setIsConfirming(false)
		}
	}

	if (isConfirming) {
		return (
			<div className='flex items-center gap-2'>
				<button
					onClick={handleDeactivate}
					disabled={isLoading}
					className='min-h-11 rounded-lg bg-destructive px-3 py-2 text-base text-destructive-foreground font-medium hover:bg-destructive/90 disabled:opacity-50'>
					{isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Ya, Nonaktifkan'}
				</button>
				<button
					onClick={() => setIsConfirming(false)}
					disabled={isLoading}
					className='min-h-11 rounded-lg border border-border px-3 py-2 text-base font-medium hover:bg-muted disabled:opacity-50'>
					Batal
				</button>
			</div>
		)
	}

	return (
		<button
			onClick={() => setIsConfirming(true)}
			className='inline-flex min-h-11 items-center gap-2 rounded-lg border border-warning/50 px-3 py-2 text-base font-medium text-warning hover:bg-warning-bg transition'>
			<UserMinus className='h-4 w-4' />
			Nonaktifkan
		</button>
	)
}
