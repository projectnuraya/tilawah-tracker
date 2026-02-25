import { LogIn, Play, UserPlus } from 'lucide-react'
import { landingCopy } from './copy'

const { howItWorks } = landingCopy

const stepIcons = [
	<LogIn key='login' className='w-10 h-10' aria-hidden='true' />,
	<UserPlus key='group' className='w-10 h-10' aria-hidden='true' />,
	<Play key='play' className='w-10 h-10' aria-hidden='true' />,
]

export default function HowItWorks() {
	return (
		<section id={howItWorks.sectionId} className='py-20 bg-card'>
			<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
				<div className='text-center mb-16'>
					<h2 className='text-3xl font-bold text-foreground sm:text-4xl'>{howItWorks.heading}</h2>
					<p className='mt-4 text-muted-foreground'>{howItWorks.subheading}</p>
				</div>

				<div className='relative grid gap-8 md:grid-cols-3'>
					{/* Connecting Line (Desktop) */}
					<div
						className='hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10'
						aria-hidden='true'
					/>

					{howItWorks.steps.map((step, i) => (
						<div key={step.title} className='relative flex flex-col items-center text-center group'>
							<div className='flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-muted shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300 text-muted-foreground group-hover:text-primary'>
								{stepIcons[i]}
							</div>
							<h3 className='text-xl font-bold text-foreground mb-2'>{step.title}</h3>
							<p className='text-sm text-muted-foreground px-4'>{step.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
