'use client'

import { PROGRESS, PROGRESS_STATUS_VALUES } from '@/components/lib/status'
import { PROGRESS_STATUS } from '@/components/ui/status-badge'
import { Check, ChevronDown, Loader2, MessageCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface ProgressStatusDropdownProps {
	participantPeriodId: string
	currentStatus: string
	participantName: string
	whatsappNumber: string | null
}

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
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Sync state when currentStatus prop updates from the server
	useEffect(() => {
		setStatus(currentStatus)
	}, [currentStatus])

	// Close on click outside or Escape
	useEffect(() => {
		if (!isOpen) return

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen])

	const handleStatusChange = async (newStatus: string) => {
		setIsOpen(false)
		if (newStatus === status) return

		const previousStatus = status
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
				setStatus(previousStatus)
				toast.error('Gagal menyimpan status', {
					description: `Status ${participantName} dikembalikan seperti semula.`,
				})
			} else {
				toast.success('Status tersimpan')
				router.refresh()
			}
		} catch {
			setStatus(previousStatus)
			toast.error('Gagal menyimpan status', { description: 'Periksa koneksi internet Anda.' })
		} finally {
			setIsSaving(false)
		}
	}

	const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0]

	const whatsappLink = whatsappNumber
		? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
				`Assalamu'alaikum ${participantName}, ini pengingat untuk tilawah Anda.`,
			)}`
		: null

	const triggerStatusStyles =
		status === PROGRESS.finished
			? 'border-success/40 bg-success-bg text-success-bg-foreground hover:bg-success-bg/80'
			: status === PROGRESS.missed
				? 'border-destructive/40 bg-error-bg text-destructive hover:bg-error-bg/80'
				: 'border-border bg-card text-foreground hover:bg-muted'

	return (
		<div className='flex items-center gap-2'>
			{/* WhatsApp Reminder Button */}
			{whatsappLink && status === PROGRESS.notFinished && (
				<motion.a
					href={whatsappLink}
					target='_blank'
					rel='noopener noreferrer'
					whileHover={{ scale: 1.08 }}
					whileTap={{ scale: 0.94 }}
					className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/15 transition-colors shadow-xs'
					aria-label={`Ingatkan ${participantName} via WhatsApp`}>
					<MessageCircle className='h-4 w-4' aria-hidden='true' />
				</motion.a>
			)}

			{/* Animated Pill Dropdown */}
			<div ref={dropdownRef} className='relative'>
				<motion.button
					type='button'
					onClick={() => !isSaving && setIsOpen((prev) => !prev)}
					disabled={isSaving}
					whileHover={{ y: -1 }}
					whileTap={{ scale: 0.97 }}
					aria-haspopup='listbox'
					aria-expanded={isOpen}
					aria-label={`Ubah status tilawah untuk ${participantName}`}
					className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${triggerStatusStyles}`}>
					{isSaving ? (
						<Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden='true' />
					) : (
						<motion.span
							key={status}
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 500, damping: 25 }}
							className='text-base leading-none'
							aria-hidden='true'>
							{currentOption.icon}
						</motion.span>
					)}
					<span>{currentOption.label}</span>
					<motion.div
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
						className='shrink-0 opacity-60'>
						<ChevronDown className='h-3.5 w-3.5' aria-hidden='true' />
					</motion.div>
				</motion.button>

				{/* Floating Popover Menu */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							role='listbox'
							initial={{ opacity: 0, scale: 0.95, y: -4 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -4 }}
							transition={{ duration: 0.15, ease: 'easeOut' }}
							className='absolute right-0 top-full mt-1.5 z-30 min-w-[175px] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl'>
							{STATUS_OPTIONS.map((option) => {
								const isSelected = option.value === status
								return (
									<motion.button
										key={option.value}
										role='option'
										type='button'
										aria-selected={isSelected}
										onClick={() => handleStatusChange(option.value)}
										whileHover={{ x: 2 }}
										whileTap={{ scale: 0.98 }}
										className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer ${
											isSelected
												? 'bg-primary/10 text-primary font-semibold'
												: 'text-foreground hover:bg-muted'
										}`}>
										<span className='flex items-center gap-2'>
											<span className='text-base leading-none' aria-hidden='true'>
												{option.icon}
											</span>
											<span>{option.label}</span>
										</span>
										{isSelected && (
											<Check className='h-4 w-4 text-primary shrink-0' aria-hidden='true' />
										)}
									</motion.button>
								)
							})}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
