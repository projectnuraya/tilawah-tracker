'use client'

import { logger } from '@/components/lib/logger'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
				router.refresh()
			}
		} catch (err) {
			logger.error({ err, periodId }, 'Failed to lock period')
		} finally {
			setIsLocking(false)
			setIsConfirming(false)
		}
	}

	if (isConfirming) {
		return (
			<div className='rounded-xl border border-red-200 bg-red-50 p-4'>
				<p className='text-base text-red-800 mb-3'>
					{notFinishedCount > 0 ? (
						<>
							<strong>{notFinishedCount} peserta</strong> akan ditandai sebagai <strong>Terlewat (💔)</strong>.
							Tindakan ini tidak dapat dibatalkan.
						</>
					) : (
						<>Apakah Anda yakin ingin mengunci periode ini? Tindakan ini tidak dapat dibatalkan.</>
					)}
				</p>
				<div className='flex items-center gap-2'>
					<button
						onClick={handleLock}
						disabled={isLocking}
						className='rounded-lg bg-red-600 px-4 py-2 text-base text-white font-medium hover:bg-red-700 disabled:opacity-50'>
						{isLocking ? (
							<span className='inline-flex items-center gap-2'>
								<Loader2 className='h-4 w-4 animate-spin' />
								Mengunci...
							</span>
						) : (
							'Ya, Kunci Periode'
						)}
					</button>
					<button
						onClick={() => setIsConfirming(false)}
						disabled={isLocking}
						className='rounded-lg border border-border px-4 py-2 text-base font-medium hover:bg-muted disabled:opacity-50'>
						Batal
					</button>
				</div>
			</div>
		)
	}

	return (
		<button
			onClick={() => setIsConfirming(true)}
			aria-label='Kunci periode untuk menandai peserta yang belum selesai sebagai terlewat'
			className='inline-flex items-center gap-2 rounded-lg border border-red-500/50 px-4 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 transition'>
			<Lock className='h-4 w-4' />
			Kunci Periode
		</button>
	)
}
