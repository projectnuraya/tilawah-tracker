import { describeDaysSinceEnd } from '@/components/lib/period-status'
import { ButtonLink } from '@/components/ui/button'
import { ArrowRight, CalendarCheck } from 'lucide-react'

interface LockPromptProps {
	periodNumber: number
	endDate: Date | string
	/** Where the coordinator goes to review and lock. Omitted when already on that page. */
	href?: string
}

/**
 * Shown when a period is past its end date but still unlocked.
 *
 * This is the one recurring action the whole app exists for — on Monday the coordinator records
 * late reports, locks last week, then starts the new week — and nothing previously surfaced it.
 * A period that ended yesterday and one that ended three weeks ago both just read "Aktif".
 */
export function LockPrompt({ periodNumber, endDate, href }: LockPromptProps) {
	return (
		<div className='rounded-xl border border-warning/30 bg-warning-bg p-4 mb-6'>
			<div className='flex gap-3'>
				<CalendarCheck className='h-5 w-5 shrink-0 mt-0.5 text-warning-bg-foreground' aria-hidden='true' />
				<div className='min-w-0 flex-1'>
					<p className='font-medium text-warning-bg-foreground'>
						Periode #{periodNumber} berakhir {describeDaysSinceEnd(endDate)}
					</p>
					<p className='text-base text-warning-bg-foreground/90 mt-1'>
						Catat dulu laporan susulan yang masuk, lalu kunci periode ini untuk menyimpannya sebagai riwayat. Setelah
						terkunci, Anda bisa memulai periode berikutnya.
					</p>
					{href && (
						<ButtonLink href={href} variant='outline' size='sm' className='mt-3 bg-card'>
							Tinjau &amp; kunci periode
							<ArrowRight className='h-4 w-4' aria-hidden='true' />
						</ButtonLink>
					)}
				</div>
			</div>
		</div>
	)
}
