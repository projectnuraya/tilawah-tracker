'use client'

import { RefreshCw } from 'lucide-react'
import { motion } from 'motion/react'
import { landingCopy } from './copy'
import { defaultViewport, fadeInUp, staggerContainer } from './motion-variants'

const { program } = landingCopy

export default function ProgramExplanation() {
	return (
		<section className='py-16 bg-primary text-primary-foreground relative overflow-hidden'>
			{/* Islamic pattern overlay */}
			<div className='absolute inset-0 bg-islamic-pattern' aria-hidden='true' />

			<motion.div
				variants={staggerContainer(0.15)}
				initial='hidden'
				whileInView='visible'
				viewport={defaultViewport}
				className='relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-8 text-center'>
				<motion.h2 variants={fadeInUp} className='text-3xl font-bold tracking-tight sm:text-4xl mb-6'>
					{program.heading}
				</motion.h2>
				<motion.p variants={fadeInUp} className='text-primary-foreground/80 max-w-2xl mx-auto mb-12 text-lg'>
					{program.description}
				</motion.p>

				<motion.div variants={staggerContainer(0.1)} className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
					{program.stats.map((stat) => (
						<motion.div
							key={stat.label}
							variants={fadeInUp}
							whileHover={{ y: -4 }}
							transition={{ duration: 0.2 }}
							className='rounded-2xl bg-white/10 backdrop-blur-sm p-8 border border-white/20 shadow-lg shadow-black/5'>
							{stat.value === '∞' ? (
								<div className='flex items-center justify-center gap-2 mb-2'>
									<RefreshCw className='w-10 h-10' aria-hidden='true' />
								</div>
							) : (
								<div className='text-4xl font-extrabold mb-2'>{stat.value}</div>
							)}
							<div className='text-primary-foreground/80 font-medium'>{stat.label}</div>
						</motion.div>
					))}
				</motion.div>
			</motion.div>
		</section>
	)
}
