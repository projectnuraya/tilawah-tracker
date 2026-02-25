'use client'

import { ShieldCheck, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { landingCopy } from './copy'

const { hero, nav } = landingCopy

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

function DashboardMockup() {
	return (
		<div className='relative rounded-2xl bg-card shadow-2xl border border-border overflow-hidden'>
			{/* Browser Chrome Header */}
			<div className='flex items-center gap-2 border-b border-border bg-muted px-4 py-3'>
				<div className='flex gap-1.5' aria-hidden='true'>
					<div className='h-3 w-3 rounded-full bg-destructive/30' />
					<div className='h-3 w-3 rounded-full bg-accent' />
					<div className='h-3 w-3 rounded-full bg-success/30' />
				</div>
				<div className='mx-auto h-6 w-64 rounded-md bg-card text-center text-[10px] leading-6 text-muted-foreground shadow-sm'>
					tilawah.projectnuraya.id/dashboard
				</div>
			</div>
			{/* Actual Screenshot */}
			<Image
				src='/dashboard-screen.png'
				alt='Tilawah Tracker dashboard showing group management interface'
				width={1440}
				height={900}
				className='w-full h-auto'
				priority
			/>
		</div>
	)
}

export default function HeroSection() {
	return (
		<section id='hero' className='relative overflow-hidden pt-12 pb-16 lg:pt-24 lg:pb-32 bg-islamic-pattern'>
			<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
				<div className='grid gap-12 lg:grid-cols-2 lg:gap-8 items-center'>
					{/* Left Column: Text Content */}
					<div className='flex flex-col items-start gap-6'>
						{/* Badge */}
						<div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary-hover'>
							<span
								className='mr-1.5 inline-block h-2 w-2 rounded-full bg-primary animate-pulse'
								aria-hidden='true'
							/>
							{hero.badge}
						</div>

						<h1 className='text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-tight'>
							{hero.headline} <span className='text-gradient'>{hero.headlineAccent}</span>
						</h1>

						<p className='text-lg text-muted-foreground leading-relaxed max-w-lg'>{hero.subheadline}</p>

						{/* CTAs */}
						<div className='flex flex-wrap items-center gap-4 w-full'>
							<a
								href={buildMailtoLink()}
								className='inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all'>
								{hero.primaryCta}
							</a>
							<Link
								href={nav.loginHref}
								className='inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-base font-semibold text-foreground hover:bg-muted hover:border-muted-foreground/20 transition-all gap-2'>
								<GoogleIcon />
								{hero.secondaryCta}
							</Link>
						</div>

						{/* Trust Indicators */}
						<div className='flex items-center gap-6 text-sm text-muted-foreground pt-2'>
							<div className='flex items-center gap-1.5'>
								<ShieldCheck className='w-5 h-5 text-primary' aria-hidden='true' />
								<span>{hero.trustItems[0].label}</span>
							</div>
							<div className='flex items-center gap-1.5'>
								<Zap className='w-5 h-5 text-primary' aria-hidden='true' />
								<span>{hero.trustItems[1].label}</span>
							</div>
						</div>
					</div>

					{/* Right Column: Dashboard Mockup */}
					<div className='relative lg:ml-auto w-full'>
						{/* Decorative blurs */}
						<div
							className='absolute -top-10 -right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl'
							aria-hidden='true'
						/>
						<div
							className='absolute top-20 left-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl'
							aria-hidden='true'
						/>
						<DashboardMockup />
					</div>
				</div>
			</div>
		</section>
	)
}
