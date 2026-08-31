'use client'

import { logger } from '@/components/lib/logger'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import { Check, Copy, Share2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Period {
	id: string
	periodNumber: number
	startDate: Date | string
	endDate: Date | string
	participantPeriods: Array<{
		id: string
		juzNumber: number
		progressStatus: string
		missedStreak: number
		participant: {
			id: string
			name: string
		}
	}>
}

interface ShareButtonProps {
	period: Period
	groupName: string
	publicToken: string
	coordinators: Array<{
		id: string
		name: string | null
	}>
}

export function ShareButton({ period, groupName, publicToken, coordinators }: ShareButtonProps) {
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

		let text = `Bismillahirrahmanirrahim\n`
		text += `_One Week One Juz_\n\n`
		text += `📖 *Grup Tilawah: ${groupName}*\n`
		text += `🗓️ Periode ${period.periodNumber}: ${startDate} - ${endDate}\n\n`

		// add mudabbir info from server
		text += `Mudabbir: ${coordinators
			.map((c) => c.name)
			.filter(Boolean)
			.join(', ')}\n\n`

		for (let juz = 1; juz <= 30; juz++) {
			const participants = byJuz[juz]
			if (!participants || participants.length === 0) continue

			text += `*Juz ${juz}:*\n`
			for (const pp of participants) {
				const statusIcon =
					pp.progressStatus === 'finished'
						? '👑'
						: pp.progressStatus === 'missed'
							? '💔'
							: pp.progressStatus === 'not_finished'
								? '⏳'
								: ''
				const streakText = pp.missedStreak > 0 ? ` 💔×${pp.missedStreak}` : ''
				text += `- ${pp.participant.name}${statusIcon ? ' ' + statusIcon : ''}${streakText}\n`
			}
		}

		text += `\nBagi yang sudah selesai, segera berkabar ya! 🙏🏼\n`
		text += `*Yang mendapat Juz 30 membaca doa khotmil Quran secara mandiri*\n`
		text += `Semoga barokah di kehidupan dunia dan akhirat. Aamiin ya Rabbal 'Alamin.\n`

		if (customMessage.trim()) {
			text += `---\n${customMessage.trim()}`
		}

		text += `\n\nanda bisa melihat progress secara real-time pada tautan berikut: ${typeof window !== 'undefined' ? window.location.origin : ''}/view/${publicToken}/periods/${period.id}`

		return text
	}

	const handleCopy = async () => {
		const text = generateShareText()
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(text)
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			} else {
				// Fallback for older browsers or non-HTTPS
				const textArea = document.createElement('textarea')
				textArea.value = text
				document.body.appendChild(textArea)
				textArea.select()
				document.execCommand('copy')
				document.body.removeChild(textArea)
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			}
		} catch (err) {
			logger.error({ err }, 'Failed to copy share text to clipboard')
			toast.error('Gagal menyalin teks', {
				description: 'Peramban memblokir akses clipboard. Salin manual dari kotak pratinjau.',
			})
		}
	}

	return (
		<>
			<Button variant='outline' size='sm' onClick={() => setIsOpen(true)} aria-label='Bagikan progress periode ke WhatsApp'>
				<Share2 className='h-4 w-4' aria-hidden='true' />
				Bagikan
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Bagikan ke WhatsApp</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						<div>
							<Label htmlFor='customMessage'>Pesan Kustom (opsional)</Label>
							<Textarea
								id='customMessage'
								value={customMessage}
								onChange={(e) => setCustomMessage(e.target.value)}
								placeholder='contoh: Semangat semua! Mari kita lanjutkan tilawah minggu ini...'
								rows={3}
							/>
						</div>

						<div>
							<p className='text-base font-medium mb-2'>Pratinjau</p>
							{/* Monospace so the preview lines up the way the pasted WhatsApp message will */}
							<div className='max-h-48 overflow-y-auto rounded-lg border border-border bg-muted p-4'>
								<pre className='text-sm whitespace-pre-wrap font-mono'>{generateShareText()}</pre>
							</div>
						</div>

						<Button onClick={handleCopy} fullWidth size='lg'>
							{copied ? (
								<>
									<Check className='h-4 w-4' aria-hidden='true' />
									Tersalin!
								</>
							) : (
								<>
									<Copy className='h-4 w-4' aria-hidden='true' />
									Salin ke Clipboard
								</>
							)}
						</Button>

						<p className='text-base text-center text-muted-foreground'>
							Tempel teks yang disalin ke grup WhatsApp Anda.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
