'use client'

import { Check, ChevronDown, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

interface ProgressStatusDropdownProps {
	participantPeriodId: string
	currentStatus: string
	participantName: string
	whatsappNumber: string | null
}

const STATUS_OPTIONS = [
	{ value: 'not_finished', label: 'Belum selesai', icon: '⏳' },
	{ value: 'finished', label: 'Selesai', icon: '👑' },
	{ value: 'missed', label: 'Terlewat', icon: '💔' },
]

export function ProgressStatusDropdown({ participantPeriodId, currentStatus, participantName, whatsappNumber }: ProgressStatusDropdownProps) {
	const router = useRouter()
	const [status, setStatus] = useState(currentStatus)
	const [isOpen, setIsOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
	const buttonRef = useRef<HTMLButtonElement>(null)

	const currentOption = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0]

	const handleOpenDropdown = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			setDropdownPos({
				top: rect.bottom + 8,
				left: rect.left,
			})
		}
		setIsOpen(!isOpen)
	}

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === status) {
			setIsOpen(false)
			return
		}

		setIsSaving(true)
		setStatus(newStatus)
		setIsOpen(false)

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
			} else {
				router.refresh()
			}
		} catch {
			setStatus(currentStatus)
		} finally {
			setIsSaving(false)
		}
	}

	const whatsappLink = whatsappNumber
		? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
				`Assalamu'alaikum ${participantName}, ini pengingat untuk tilawah Anda.`,
			)}`
		: null

	return (
		<div className='flex items-center gap-2'>
			{/* WhatsApp Reminder */}
			{whatsappLink && status === 'not_finished' && (
				<a
					href={whatsappLink}
					target='_blank'
					rel='noopener noreferrer'
					className='rounded-lg p-2 text-green-600 hover:bg-green-50 transition'
					title='Ingatkan via WhatsApp'>
					<MessageCircle className='h-4 w-4' />
				</a>
			)}

			{/* Status Dropdown */}
			<div className='relative'>
				<button
					ref={buttonRef}
					onClick={handleOpenDropdown}
					disabled={isSaving}
					className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
						status === 'finished'
							? 'border-primary/30 bg-primary/10 text-primary'
							: status === 'missed'
								? 'border-destructive/30 bg-destructive/10 text-destructive'
								: 'border-border bg-background text-foreground'
					} ${isSaving ? 'opacity-50' : 'hover:shadow-sm'}`}>
					<span>{currentOption.icon}</span>
					<span className='hidden sm:inline'>{currentOption.label}</span>
					<ChevronDown className='h-3 w-3' />
				</button>

				{isOpen && (
					<>
						<div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />
						<div
							className='fixed z-50 w-40 rounded-lg border border-border bg-card shadow-lg overflow-hidden'
							style={{
								top: `${dropdownPos.top}px`,
								left: `${dropdownPos.left}px`,
							}}>
							{STATUS_OPTIONS.map((option) => (
								<button
									key={option.value}
									onClick={() => handleStatusChange(option.value)}
									className='flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition'>
									<span className='flex items-center gap-2'>
										<span>{option.icon}</span>
										<span>{option.label}</span>
									</span>
									{status === option.value && <Check className='h-4 w-4 text-primary' />}
								</button>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
