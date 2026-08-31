'use client'

import { logger } from '@/components/lib/logger'
import { Loader2, Trash2 } from 'lucide-react'
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

	if (isConfirming) {
		return (
			<div className='flex items-center gap-2'>
				<span className='text-base text-destructive'>Hapus &quot;{groupName}&quot;?</span>
				<button
					onClick={handleDelete}
					disabled={isDeleting}
					className='min-h-11 rounded-lg bg-destructive px-3 py-1.5 text-base text-destructive-foreground font-medium hover:bg-destructive/90 disabled:opacity-50'>
					{isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Ya, Hapus'}
				</button>
				<button
					onClick={() => setIsConfirming(false)}
					disabled={isDeleting}
					className='min-h-11 rounded-lg border border-border px-3 py-1.5 text-base font-medium hover:bg-muted disabled:opacity-50'>
					Batal
				</button>
			</div>
		)
	}

	return (
		<button
			onClick={() => setIsConfirming(true)}
			className='inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10 transition'>
			<Trash2 className='h-4 w-4' />
			Hapus Grup
		</button>
	)
}
