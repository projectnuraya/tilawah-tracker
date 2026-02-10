import { ArrowRight, Send, UserPlus, Users } from 'lucide-react'
import { landingCopy } from './copy'

const { howItWorks } = landingCopy

const stepIcons = [
	<UserPlus key='user' className='w-full h-full' aria-hidden='true' />,
	<Users key='users' className='w-full h-full' aria-hidden='true' />,
	<Send key='send' className='w-full h-full' aria-hidden='true' />,
]

export default function HowItWorks() {
	return (
		<section id={howItWorks.sectionId} className='bg-card py-16 md:py-24 px-4 md:px-8'>
			<div className='max-w-7xl mx-auto'>
				<h2 className='text-3xl md:text-4xl font-bold text-center text-foreground mb-12'>{howItWorks.heading}</h2>

				<div className='flex flex-col md:flex-row gap-6 md:gap-4 max-w-5xl mx-auto items-stretch'>
					{howItWorks.steps.map((step, i) => (
						<div key={step.title} className='contents'>
							{/* Step Card */}
							<div className='flex-1 bg-primary-background rounded-xl p-8 relative'>
								{/* Number Badge */}
								<div className='absolute -top-4 -left-4 w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-lg font-bold shadow-md'>
									{i + 1}
								</div>

								{/* Icon */}
								<div className='w-14 h-14 mx-auto mb-4 p-3.5 bg-card rounded-full text-primary'>
									{stepIcons[i]}
								</div>

								<h3 className='text-lg font-bold text-center text-foreground mb-3'>{step.title}</h3>
								<p className='text-center text-muted-foreground text-sm leading-relaxed'>{step.description}</p>
							</div>

							{/* Arrow Divider (between cards, hidden on mobile) */}
							{i < howItWorks.steps.length - 1 && (
								<div className='hidden md:flex items-center justify-center text-primary/30 shrink-0'>
									<ArrowRight className='w-6 h-6' aria-hidden='true' />
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
