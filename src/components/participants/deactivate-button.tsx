'use client'

import { Loader2, UserMinus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
				router.push(`/groups/${groupId}/participants`)
				router.refresh()
			}
		} catch (err) {
			console.error('Failed to deactivate:', err)
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
					className='rounded-lg bg-destructive px-3 py-2 text-base text-white font-medium hover:bg-destructive/90 disabled:opacity-50'>
					{isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Ya, Nonaktifkan'}
				</button>
				<button
					onClick={() => setIsConfirming(false)}
					disabled={isLoading}
					className='rounded-lg border border-border px-3 py-2 text-base font-medium hover:bg-muted disabled:opacity-50'>
					Batal
				</button>
			</div>
		)
	}

	return (
		<button
			onClick={() => setIsConfirming(true)}
			className='inline-flex items-center gap-2 rounded-lg border border-amber-500/50 px-3 py-2 text-base font-medium text-amber-600 hover:bg-amber-50 transition'>
			<UserMinus className='h-4 w-4' />
			Nonaktifkan
		</button>
	)
}
