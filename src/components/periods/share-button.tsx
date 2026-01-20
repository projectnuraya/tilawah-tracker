'use client'

import { Check, Copy, Share2, X } from 'lucide-react'
import { useState } from 'react'

interface Period {
	id: string
	periodNumber: number
	startDate: Date | string
	endDate: Date | string
	participantPeriods: Array<{
		id: string
		juzNumber: number
		progressStatus: string
		participant: {
			id: string
			name: string
		}
	}>
}

interface ShareButtonProps {
	period: Period
	groupName: string
}

export function ShareButton({ period, groupName }: ShareButtonProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [customMessage, setCustomMessage] = useState('')
	const [copied, setCopied] = useState(false)

	const generateShareText = () => {
		const startDate = new Date(period.startDate).toLocaleDateString('id-ID', {
			dateStyle: 'medium',
		})
		const endDate = new Date(period.endDate).toLocaleDateString('id-ID', {
			dateStyle: 'medium',
		})

		// Group participants by juz
		const byJuz: Record<number, typeof period.participantPeriods> = {}
		for (const pp of period.participantPeriods) {
			if (!byJuz[pp.juzNumber]) {
				byJuz[pp.juzNumber] = []
			}
			byJuz[pp.juzNumber].push(pp)
		}

		let text = `📖 *Grup Tilawah: ${groupName}*\n`
		text += `🗓️ Periode ${period.periodNumber}: ${startDate} - ${endDate}\n\n`

		for (let juz = 1; juz <= 30; juz++) {
			const participants = byJuz[juz]
			if (!participants || participants.length === 0) continue

			text += `*Juz ${juz}:*\n`
			for (const pp of participants) {
				const statusIcon = pp.progressStatus === 'finished' ? '👑' : pp.progressStatus === 'missed' ? '💔' : ''
				text += `- ${pp.participant.name}${statusIcon ? ' ' + statusIcon : ''}\n`
			}
			text += '\n'
		}

		if (customMessage.trim()) {
			text += `---\n${customMessage.trim()}`
		}

		return text
	}

	const handleCopy = async () => {
		const text = generateShareText()
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition'>
				<Share2 className='h-4 w-4' />
				Bagikan
			</button>

			{isOpen && (
				<>
					{/* Backdrop */}
					<div className='fixed inset-0 bg-black/50 z-40' onClick={() => setIsOpen(false)} />

					{/* Modal */}
					<div className='fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md rounded-xl bg-card border border-border shadow-xl'>
						<div className='flex items-center justify-between px-4 py-3 border-b border-border'>
							<h2 className='font-semibold'>Bagikan ke WhatsApp</h2>
							<button onClick={() => setIsOpen(false)} className='p-1 hover:bg-muted rounded-lg transition'>
								<X className='h-5 w-5' />
							</button>
						</div>

						<div className='p-4 space-y-4'>
							{/* Custom Message Input */}
							<div>
								<label htmlFor='customMessage' className='block text-sm font-medium mb-2'>
									Pesan Kustom (opsional)
								</label>
								<textarea
									id='customMessage'
									value={customMessage}
									onChange={(e) => setCustomMessage(e.target.value)}
									placeholder='e.g., Semangat semua! Mari kita lanjutkan tilawah minggu ini...'
									rows={3}
									className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none'
								/>
							</div>

							{/* Preview */}
							<div>
								<p className='text-sm font-medium mb-2'>Pratinjau</p>
								<div className='max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/50 p-3'>
									<pre className='text-xs whitespace-pre-wrap font-sans'>{generateShareText()}</pre>
								</div>
							</div>

							{/* Copy Button */}
							<button
								onClick={handleCopy}
								className='w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90'>
								{copied ? (
									<>
										<Check className='h-4 w-4' />
										Tersalin!
									</>
								) : (
									<>
										<Copy className='h-4 w-4' />
										Salin ke Clipboard
									</>
								)}
							</button>

							<p className='text-xs text-center text-muted-foreground'>Tempel teks yang disalin ke grup WhatsApp Anda.</p>
						</div>
					</div>
				</>
			)}
		</>
	)
}
