import { Mail } from 'lucide-react'
import { landingCopy } from './copy'

const { finalCta, hero } = landingCopy // reusing mailto from hero

function buildMailtoLink() {
	const { email, subject, body } = hero.mailto
	const params = new URLSearchParams({ subject, body })
	return `mailto:${email}?${params.toString()}`
}

export default function FinalCTA() {
	return (
		<section id='cta' className='bg-primary text-primary-foreground py-16 md:py-24 px-4 text-center'>
			<div className='max-w-4xl mx-auto'>
				<h2 className='text-3xl md:text-4xl font-bold mb-6'>{finalCta.heading}</h2>

				<p className='text-primary-foreground/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed'>
					{finalCta.description}
				</p>

				<div className='flex flex-col items-center gap-4'>
					<a
						href={buildMailtoLink()}
						className='bg-white text-primary hover:bg-white/90 px-10 py-5 rounded-lg font-bold text-lg inline-flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95'>
						<Mail className='w-5 h-5' aria-hidden='true' />
						<span>{finalCta.buttonText}</span>
					</a>

					<p className='text-primary-foreground/80 text-sm font-medium backdrop-blur-sm px-4 py-1 rounded-full bg-black/10 border border-white/10'>
						{finalCta.note}
					</p>
				</div>
			</div>
		</section>
	)
}
