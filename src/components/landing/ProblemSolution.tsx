import { CheckCircle, CloudOff, HelpCircle, MessageSquareWarning, TimerOff } from 'lucide-react'
import { landingCopy } from './copy'

const { painPoints, solutions } = landingCopy

const painIcons = [
	<MessageSquareWarning key='chat' className='w-6 h-6' aria-hidden='true' />,
	<CloudOff key='folder' className='w-6 h-6' aria-hidden='true' />,
	<HelpCircle key='event' className='w-6 h-6' aria-hidden='true' />,
	<TimerOff key='receipt' className='w-6 h-6' aria-hidden='true' />,
]

export default function ProblemSolution() {
	return (
		<>
			{/* Pain Points Section */}
			<section id={painPoints.sectionId} className='py-16 md:py-24 bg-card'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
					<div className='mb-12 text-center md:mb-16'>
						<h2 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>{painPoints.heading}</h2>
						<p className='mt-4 text-lg text-muted-foreground max-w-2xl mx-auto'>{painPoints.subheading}</p>
					</div>
					<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
						{painPoints.items.map((item, i) => (
							<div
								key={item.title}
								className='group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/5'>
								<div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-error-bg text-destructive'>
									{painIcons[i]}
								</div>
								<h3 className='mb-2 text-lg font-bold text-foreground'>{item.title}</h3>
								<p className='text-sm text-muted-foreground leading-relaxed'>{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Solutions Section */}
			<section className='py-16 md:py-24 bg-muted'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
					<div className='mb-12 text-center md:mb-16'>
						<span className='mb-2 inline-block font-semibold text-primary uppercase tracking-wider text-sm'>
							{solutions.label}
						</span>
						<h2 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>{solutions.heading}</h2>
					</div>
					<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
						{solutions.items.map((item) => (
							<div
								key={item.title}
								className='group flex flex-col rounded-2xl bg-card p-6 shadow-sm border border-border transition-all hover:shadow-md hover:border-primary/30'>
								<div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
									<CheckCircle className='w-6 h-6' aria-hidden='true' />
								</div>
								<h3 className='mb-2 text-lg font-bold text-foreground'>{item.title}</h3>
								<p className='text-sm text-muted-foreground'>{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	)
}
