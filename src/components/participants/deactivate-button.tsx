'use client'

import { logger } from '@/components/lib/logger'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { UserMinus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeactivateButtonProps {
	participantId: string
	groupId: string
	participantName: string
}

export function DeactivateButton({ participantId, groupId, participantName }: DeactivateButtonProps) {
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

	return (
		<>
			<Button
				variant='outline'
				onClick={() => setIsConfirming(true)}
				className='border-warning/50 text-warning hover:bg-warning-bg'>
				<UserMinus className='h-4 w-4' aria-hidden='true' />
				Nonaktifkan
			</Button>

			<ConfirmDialog
				open={isConfirming}
				onOpenChange={setIsConfirming}
				title={`Nonaktifkan ${participantName}?`}
				description='Peserta ini tidak akan disertakan di periode baru, tetapi riwayat tilawahnya tetap tersimpan. Anda bisa mengaktifkannya kembali kapan saja.'
				confirmLabel='Ya, Nonaktifkan'
				pendingLabel='Menonaktifkan...'
				isPending={isLoading}
				onConfirm={handleDeactivate}
			/>
		</>
	)
}
