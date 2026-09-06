'use client'

import { GoogleIcon } from '@/components/ui/icons'
import { ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { landingCopy } from './copy'
import { fadeInUp, scaleUp, staggerContainer } from './motion-variants'
import { buildMailtoLink } from './utils'

const { hero, nav } = landingCopy

function DashboardMockup() {
	const { image, browserUrl } = hero.mockup
	return (
		<div className='relative rounded-2xl bg-card shadow-2xl border border-border overflow-hidden transition-shadow duration-300 hover:shadow-primary/5'>
			{/* Browser Chrome Header */}
			<div className='flex items-center gap-2 border-b border-border bg-muted px-4 py-3'>
				<div className='flex gap-1.5' aria-hidden='true'>
					<div className='h-3 w-3 rounded-full bg-destructive/30' />
					<div className='h-3 w-3 rounded-full bg-accent' />
					<div className='h-3 w-3 rounded-full bg-success/30' />
				</div>
				<div className='mx-auto h-6 w-64 rounded-md bg-card text-center text-[10px] leading-6 text-muted-foreground shadow-sm'>
					{browserUrl}
				</div>
			</div>
			{/* Actual Screenshot */}
			<Image src={image.src} alt={image.alt} width={image.width} height={image.height} className='w-full h-auto' priority />
		</div>
	)
}

export default function HeroSection() {
	return (
		<section id='hero' className='relative overflow-hidden pt-12 pb-16 lg:pt-24 lg:pb-32 bg-islamic-pattern'>
			<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
				<div className='grid gap-12 lg:grid-cols-2 lg:gap-8 items-center'>
					{/* Left Column: Text Content */}
					<motion.div
						variants={staggerContainer(0.12, 0.15)}
						initial='hidden'
						animate='visible'
						className='flex flex-col items-start gap-6'>
						{/* Badge */}
						<motion.div
							variants={fadeInUp}
							className='inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary-hover'>
							<span
								className='mr-1.5 inline-block h-2 w-2 rounded-full bg-primary animate-pulse'
								aria-hidden='true'
							/>
							{hero.badge}
						</motion.div>

						<motion.h1
							variants={fadeInUp}
							className='text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-tight'>
							{hero.headline} <span className='text-gradient'>{hero.headlineAccent}</span>
						</motion.h1>

						<motion.p variants={fadeInUp} className='text-lg text-muted-foreground leading-relaxed max-w-lg'>
							{hero.subheadline}
						</motion.p>

						{/* CTAs */}
						<motion.div variants={fadeInUp} className='flex flex-col sm:flex-row items-center gap-4 w-full'>
							<motion.a
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								href={buildMailtoLink()}
								className='w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors'>
								{hero.primaryCta}
							</motion.a>
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='w-full sm:w-auto'>
								<Link
									href={nav.loginHref}
									className='w-full inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-8 text-base font-semibold text-foreground hover:bg-muted hover:border-muted-foreground/20 transition-all gap-2'>
									<GoogleIcon />
									{hero.secondaryCta}
								</Link>
							</motion.div>
						</motion.div>

						{/* Trust Indicators */}
						<motion.div variants={fadeInUp} className='flex items-center gap-6 text-sm text-muted-foreground pt-2'>
							<div className='flex items-center gap-1.5'>
								<ShieldCheck className='w-5 h-5 text-primary' aria-hidden='true' />
								<span>{hero.trustItems[0].label}</span>
							</div>
							<div className='flex items-center gap-1.5'>
								<Zap className='w-5 h-5 text-primary' aria-hidden='true' />
								<span>{hero.trustItems[1].label}</span>
							</div>
						</motion.div>
					</motion.div>

					{/* Right Column: Dashboard Mockup */}
					<motion.div
						variants={scaleUp}
						initial='hidden'
						animate='visible'
						transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
						className='relative lg:ml-auto w-full'>
						{/* Decorative blurs */}
						<div
							className='absolute -top-10 -right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl transition-opacity duration-1000'
							aria-hidden='true'
						/>
						<div
							className='absolute top-20 left-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl transition-opacity duration-1000'
							aria-hidden='true'
						/>
						<DashboardMockup />
					</motion.div>
				</div>
			</div>
		</section>
	)
}
