'use client'

import { ChevronDown, Mail, Monitor } from 'lucide-react'
import { landingCopy } from './copy'

const { hero } = landingCopy

function buildMailtoLink() {
	const { email, subject, body } = hero.mailto
	const params = new URLSearchParams({ subject, body })
	return `mailto:${email}?${params.toString()}`
}

export default function HeroSection() {
	return (
		<section id='hero' className='relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 md:px-8'>
			{/* Background gradient */}
			<div className='absolute inset-0 bg-linear-to-b from-primary-background to-background -z-10' aria-hidden='true' />

			<div className='max-w-7xl mx-auto'>
				<div className='grid md:grid-cols-2 gap-12 items-center'>
					{/* Left Column: Text Content */}
					<div className='max-w-xl'>
						<h1 className='text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight'>{hero.headline}</h1>
						<p className='text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed'>{hero.subheadline}</p>

						{/* CTAs */}
						<div className='flex flex-col sm:flex-row gap-4'>
							<a
								href={buildMailtoLink()}
								className='btn-primary px-8 py-4 rounded-lg font-semibold shadow-lg inline-flex items-center justify-center gap-2 text-base'>
								<Mail className='w-5 h-5' aria-hidden='true' />
								<span>{hero.primaryCta}</span>
							</a>

							<button
								onClick={() => {
									document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })
								}}
								className='btn-secondary px-8 py-4 rounded-lg font-semibold inline-flex items-center justify-center gap-2 text-base'
								aria-label='Scroll ke bagian tentang program'>
								<ChevronDown className='w-5 h-5' aria-hidden='true' />
								<span>{hero.secondaryCta}</span>
							</button>
						</div>
					</div>

					{/* Right Column: Hero Visual Placeholder */}
					<div className='relative'>
						<div className='bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8 aspect-4/3 flex flex-col items-center justify-center gap-4'>
							<div className='w-16 h-16 rounded-2xl bg-primary-background flex items-center justify-center'>
								<Monitor className='w-8 h-8 text-primary' aria-hidden='true' />
							</div>
							<div className='text-center'>
								<p className='text-sm font-medium text-muted-foreground'>Preview Dashboard</p>
								<p className='text-xs text-muted-foreground/70 mt-1'>Screenshot segera hadir</p>
							</div>
							{/* Decorative dots */}
							<div className='absolute top-4 left-4 flex gap-1.5' aria-hidden='true'>
								<div className='w-3 h-3 rounded-full bg-destructive/30' />
								<div className='w-3 h-3 rounded-full bg-accent' />
								<div className='w-3 h-3 rounded-full bg-success/30' />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
