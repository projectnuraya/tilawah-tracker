import { RefreshCw } from 'lucide-react'
import { landingCopy } from './copy'

const { program } = landingCopy

export default function ProgramExplanation() {
	return (
		<section className='py-16 bg-primary text-primary-foreground relative overflow-hidden'>
			{/* Islamic pattern overlay */}
			<div className='absolute inset-0 bg-islamic-pattern' aria-hidden='true' />

			<div className='relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-8 text-center'>
				<h2 className='text-3xl font-bold tracking-tight sm:text-4xl mb-6'>{program.heading}</h2>
				<p className='text-primary-foreground/80 max-w-2xl mx-auto mb-12 text-lg'>{program.description}</p>

				<div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
					{program.stats.map((stat) => (
						<div key={stat.label} className='rounded-2xl bg-white/10 backdrop-blur-sm p-8 border border-white/20'>
							{stat.value === '∞' ? (
								<div className='flex items-center justify-center gap-2 mb-2'>
									<RefreshCw className='w-10 h-10' aria-hidden='true' />
								</div>
							) : (
								<div className='text-4xl font-extrabold mb-2'>{stat.value}</div>
							)}
							<div className='text-primary-foreground/80 font-medium'>{stat.label}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
