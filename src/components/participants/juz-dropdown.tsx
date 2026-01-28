'use client'

import { ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface JuzDropdownProps {
	participantPeriodId: string
	currentJuz: number
	participantName: string
}

export function JuzDropdown({ participantPeriodId, currentJuz, participantName }: JuzDropdownProps) {
	const router = useRouter()
	const [selectedJuz, setSelectedJuz] = useState(currentJuz)
	const [isUpdating, setIsUpdating] = useState(false)
	const [error, setError] = useState('')

	const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newJuz = parseInt(e.target.value, 10)
		if (newJuz === selectedJuz) return

		setIsUpdating(true)
		setError('')

		// Optimistic update
		setSelectedJuz(newJuz)

		try {
			const response = await fetch(`/api/v1/progress/${participantPeriodId}/juz`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ juzNumber: newJuz }),
			})

			let data
			try {
				data = await response.json()
			} catch (err) {
				setSelectedJuz(currentJuz)
				console.error('Failed to parse JSON response:', err)
				setError('Invalid response from server')
				return
			}

			if (!data.success) {
				// Rollback on error
				setSelectedJuz(currentJuz)
				setError(data.error?.message || 'Gagal memperbarui juz')
				return
			}

			// Refresh the page data
			router.refresh()
		} catch {
			// Rollback on error
			setSelectedJuz(currentJuz)
			setError('Terjadi kesalahan')
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<div className='relative' onClick={(e) => e.preventDefault()}>
			<select
				value={selectedJuz}
				onChange={handleChange}
				disabled={isUpdating}
				className='appearance-none bg-transparent border border-border rounded-lg px-3 py-1.5 pr-8 text-base font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
				aria-label={`Ubah juz untuk ${participantName}`}>
				{Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
					<option key={juz} value={juz}>
						Juz {juz}
					</option>
				))}
			</select>
			<ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none' />
			{error && (
				<div className='absolute top-full mt-1 left-0 right-0 text-base text-destructive bg-background border border-destructive rounded px-2 py-1 shadow-sm whitespace-nowrap'>
					{error}
				</div>
			)}
		</div>
	)
}
