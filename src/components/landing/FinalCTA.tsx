'use client'

import Link from 'next/link'
import { GoogleIcon } from '@/components/ui/icons'
import { landingCopy } from './copy'
import { buildMailtoLink } from './utils'

const { finalCta, nav } = landingCopy

export default function FinalCTA() {
	return (
		<section id='cta' className='py-24 bg-primary relative overflow-hidden'>
			{/* Islamic pattern overlay */}
			<div className='absolute inset-0 bg-islamic-pattern' aria-hidden='true' />

			<div className='relative mx-auto max-w-4xl px-6 sm:px-8 text-center'>
				<h2 className='text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl mb-6'>
					{finalCta.heading}
				</h2>

				<p className='text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto'>{finalCta.description}</p>

				<div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
					<a
						href={buildMailtoLink()}
						className='w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl bg-card px-8 text-lg font-bold text-primary shadow-xl hover:bg-muted transition-all'>
						{finalCta.primaryButton}
					</a>
					<Link
						href={nav.loginHref}
						className='w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl border-2 border-white bg-white/15 px-8 text-lg font-bold text-primary-foreground hover:bg-white/25 transition-all gap-2'>
						<GoogleIcon />
						{finalCta.secondaryButton}
					</Link>
				</div>

				<p className='text-primary-foreground/70 text-sm mt-6 font-medium'>{finalCta.note}</p>
			</div>
		</section>
	)
}
