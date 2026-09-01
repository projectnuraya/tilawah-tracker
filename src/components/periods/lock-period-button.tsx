'use client'

import { logger } from '@/components/lib/logger'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface LockPeriodButtonProps {
	periodId: string
	notFinishedCount: number
}

export function LockPeriodButton({ periodId, notFinishedCount }: LockPeriodButtonProps) {
	const router = useRouter()
	const [isConfirming, setIsConfirming] = useState(false)
	const [isLocking, setIsLocking] = useState(false)

	const handleLock = async () => {
		setIsLocking(true)

		try {
			const response = await fetch(`/api/v1/periods/${periodId}/lock`, {
				method: 'POST',
			})

			if (response.ok) {
				toast.success('Periode berhasil dikunci')
				router.refresh()
			} else {
				toast.error('Gagal mengunci periode', { description: 'Silakan coba lagi.' })
			}
		} catch (err) {
			logger.error({ err, periodId }, 'Failed to lock period')
			toast.error('Gagal mengunci periode', { description: 'Periksa koneksi internet Anda.' })
		} finally {
			setIsLocking(false)
			setIsConfirming(false)
		}
	}

	return (
		<>
			<Button
				variant='outline'
				onClick={() => setIsConfirming(true)}
				aria-label='Kunci periode untuk menandai peserta yang belum selesai sebagai terlewat'
				className='border-destructive/50 text-destructive hover:bg-error-bg'>
				<Lock className='h-4 w-4' aria-hidden='true' />
				Kunci Periode
			</Button>

			<ConfirmDialog
				open={isConfirming}
				onOpenChange={setIsConfirming}
				title='Kunci periode ini?'
				description={
					notFinishedCount > 0 ? (
						<>
							<strong>{notFinishedCount} peserta</strong> yang belum selesai akan ditandai{' '}
							<strong>Terlewat (💔)</strong>. Setelah dikunci, laporan susulan tidak bisa dicatat lagi dan tindakan
							ini tidak dapat dibatalkan.
						</>
					) : (
						<>Setelah dikunci, laporan susulan tidak bisa dicatat lagi dan tindakan ini tidak dapat dibatalkan.</>
					)
				}
				confirmLabel='Ya, Kunci Periode'
				pendingLabel='Mengunci...'
				isPending={isLocking}
				onConfirm={handleLock}
			/>
		</>
	)
}
