'use client'

import { logger } from '@/components/lib/logger'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteGroupButtonProps {
	groupId: string
	groupName: string
}

export function DeleteGroupButton({ groupId, groupName }: DeleteGroupButtonProps) {
	const router = useRouter()
	const [isConfirming, setIsConfirming] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		setIsDeleting(true)

		try {
			const response = await fetch(`/api/v1/groups/${groupId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				// Navigating away, so state is intentionally left as-is to avoid a flash of the idle button
				router.push('/dashboard')
				router.refresh()
			} else {
				toast.error('Gagal menghapus grup', { description: 'Silakan coba lagi.' })
				setIsDeleting(false)
				setIsConfirming(false)
			}
		} catch (err) {
			logger.error({ err, groupId }, 'Failed to delete group')
			toast.error('Gagal menghapus grup', { description: 'Periksa koneksi internet Anda.' })
			setIsDeleting(false)
			setIsConfirming(false)
		}
	}

	return (
		<>
			<Button
				variant='outline'
				onClick={() => setIsConfirming(true)}
				className='border-destructive/50 text-destructive hover:bg-error-bg'>
				<Trash2 className='h-4 w-4' aria-hidden='true' />
				Hapus Grup
			</Button>

			<ConfirmDialog
				open={isConfirming}
				onOpenChange={setIsConfirming}
				title={`Hapus "${groupName}"?`}
				description='Semua peserta, periode, dan data progress grup ini akan ikut terhapus permanen. Tindakan ini tidak dapat dibatalkan.'
				confirmLabel='Ya, Hapus'
				pendingLabel='Menghapus...'
				isPending={isDeleting}
				onConfirm={handleDelete}
			/>
		</>
	)
}
