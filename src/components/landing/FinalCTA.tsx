'use client'

import { GoogleIcon } from '@/components/ui/icons'
import { motion } from 'motion/react'
import Link from 'next/link'
import { landingCopy } from './copy'
import { defaultViewport, fadeInUp, staggerContainer } from './motion-variants'
import { buildMailtoLink } from './utils'

const { finalCta, nav } = landingCopy

export default function FinalCTA() {
	return (
		<section id='cta' className='py-24 bg-primary relative overflow-hidden'>
			{/* Islamic pattern overlay */}
			<div className='absolute inset-0 bg-islamic-pattern' aria-hidden='true' />

			<motion.div
				variants={staggerContainer(0.12)}
				initial='hidden'
				whileInView='visible'
				viewport={defaultViewport}
				className='relative mx-auto max-w-4xl px-6 sm:px-8 text-center'>
				<motion.h2
					variants={fadeInUp}
					className='text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl mb-6'>
					{finalCta.heading}
				</motion.h2>

				<motion.p variants={fadeInUp} className='text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto'>
					{finalCta.description}
				</motion.p>

				<motion.div
					variants={fadeInUp}
					className='flex flex-col sm:flex-row items-center justify-center gap-4'>
					<motion.a
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						href={buildMailtoLink()}
						className='w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl bg-card px-8 text-lg font-bold text-primary shadow-xl hover:bg-muted transition-colors'>
						{finalCta.primaryButton}
					</motion.a>
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='w-full sm:w-auto'>
						<Link
							href={nav.loginHref}
							className='w-full inline-flex h-14 items-center justify-center rounded-xl border-2 border-white bg-white/15 px-8 text-lg font-bold text-primary-foreground hover:bg-white/25 transition-all gap-2'>
							<GoogleIcon />
							{finalCta.secondaryButton}
						</Link>
					</motion.div>
				</motion.div>

				<motion.p variants={fadeInUp} className='text-primary-foreground/70 text-sm mt-6 font-medium'>
					{finalCta.note}
				</motion.p>
			</motion.div>
		</section>
	)
}
