'use client'

import Link from 'next/link'
import { landingCopy } from './copy'

const { finalCta, hero, nav } = landingCopy

function buildMailtoLink() {
	const { email, subject, body } = hero.mailto
	const params = new URLSearchParams({ subject, body })
	return `mailto:${email}?${params.toString()}`
}

function GoogleIcon() {
	return (
		<svg aria-hidden='true' className='h-5 w-5' viewBox='0 0 24 24'>
			<path
				d='M23.49 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z'
				fill='#4285F4'
			/>
			<path
				d='M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.28 21.3 7.42 24 12 24Z'
				fill='#34A853'
			/>
			<path
				d='M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09Z'
				fill='#FBBC05'
			/>
			<path
				d='M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.42 0 3.28 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z'
				fill='#EA4335'
			/>
		</svg>
	)
}

export default function FinalCTA() {
	return (
		<section id='cta' className='py-24 bg-primary relative overflow-hidden'>
			{/* Islamic pattern overlay */}
			<div className='absolute inset-0 bg-islamic-pattern opacity-100' aria-hidden='true' />

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
