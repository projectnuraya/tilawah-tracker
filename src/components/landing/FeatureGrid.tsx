import { Activity, Eye, Flame, Lock, MessageCircle, RefreshCw } from 'lucide-react'
import { landingCopy } from './copy'

const { features } = landingCopy

const featureIcons = [
	<RefreshCw key='refresh' className='w-full h-full' aria-hidden='true' />,
	<MessageCircle key='message' className='w-full h-full' aria-hidden='true' />,
	<Eye key='eye' className='w-full h-full' aria-hidden='true' />,
	<Activity key='activity' className='w-full h-full' aria-hidden='true' />,
	<Lock key='lock' className='w-full h-full' aria-hidden='true' />,
	<Flame key='flame' className='w-full h-full' aria-hidden='true' />,
]

export default function FeaturesGrid() {
	return (
		<section id={features.sectionId} className='bg-muted py-16 md:py-24 px-4 md:px-8'>
			<div className='max-w-7xl mx-auto'>
				<h2 className='text-3xl md:text-4xl font-bold text-center text-foreground mb-12'>{features.heading}</h2>

				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
					{features.items.map((item, i) => (
						<div
							key={item.title}
							className='bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow duration-300'>
							<div className='w-12 h-12 mb-4 p-3 bg-primary-background rounded-lg text-primary'>
								{featureIcons[i]}
							</div>
							<h3 className='text-lg font-semibold text-foreground mb-2'>{item.title}</h3>
							<p className='text-sm text-muted-foreground leading-relaxed'>{item.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
