'use client'

import { PROGRESS, PROGRESS_STATUS_VALUES } from '@/components/lib/status'
import { PROGRESS_STATUS } from '@/components/ui/status-badge'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProgressStatusDropdownProps {
	participantPeriodId: string
	currentStatus: string
	participantName: string
	whatsappNumber: string | null
}

// Wording and icons come from PROGRESS_STATUS, the same source the read-only rows use. This file
// used to carry its own copy, which is how "not_finished" ended up worded two different ways.
const STATUS_OPTIONS = PROGRESS_STATUS_VALUES.map((value) => ({ value, ...PROGRESS_STATUS[value] }))

export function ProgressStatusDropdown({
	participantPeriodId,
	currentStatus,
	participantName,
	whatsappNumber,
}: ProgressStatusDropdownProps) {
	const router = useRouter()
	const [status, setStatus] = useState(currentStatus)
	const [isSaving, setIsSaving] = useState(false)

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === status) return

		setIsSaving(true)
		setStatus(newStatus)

		try {
			const response = await fetch(`/api/v1/progress/${participantPeriodId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: newStatus }),
			})

			if (!response.ok) {
				// Revert on error
				setStatus(currentStatus)
				toast.error('Gagal menyimpan status', { description: `Status ${participantName} dikembalikan seperti semula.` })
			} else {
				toast.success('Status tersimpan')
				router.refresh()
			}
		} catch {
			setStatus(currentStatus)
			toast.error('Gagal menyimpan status', { description: 'Periksa koneksi internet Anda.' })
		} finally {
			setIsSaving(false)
		}
	}

	const whatsappLink = whatsappNumber
		? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
				`Assalamu'alaikum ${participantName}, ini pengingat untuk tilawah Anda.`,
			)}`
		: null

	const statusStyles =
		status === PROGRESS.finished
			? 'border-primary/30 bg-primary/10 text-primary'
			: status === PROGRESS.missed
				? 'border-destructive/30 bg-destructive/10 text-destructive'
				: 'border-border bg-background text-foreground'

	return (
		<div className='flex items-center gap-2'>
			{/* WhatsApp Reminder */}
			{whatsappLink && status === PROGRESS.notFinished && (
				<a
					href={whatsappLink}
					target='_blank'
					rel='noopener noreferrer'
					className='inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition'
					aria-label={`Ingatkan ${participantName} via WhatsApp`}>
					<MessageCircle className='h-5 w-5' aria-hidden='true' />
				</a>
			)}

			{/* Status Select — native so it gets the OS picker and full keyboard support for free */}
			<div className='relative'>
				<select
					value={status}
					onChange={(e) => handleStatusChange(e.target.value)}
					disabled={isSaving}
					aria-label={`Ubah status tilawah untuk ${participantName}`}
					className={`min-h-12 appearance-none rounded-lg border pl-3 pr-9 text-base font-medium transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${statusStyles}`}>
					{STATUS_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.icon} {option.label}
						</option>
					))}
				</select>
				<ChevronDown
					className='pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70'
					aria-hidden='true'
				/>
			</div>
		</div>
	)
}
