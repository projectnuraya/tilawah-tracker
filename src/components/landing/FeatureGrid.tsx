import { Activity, Eye, Flame, Lock, MessageCircle, RefreshCw } from 'lucide-react'
import { landingCopy } from './copy'

const { features } = landingCopy

const featureIcons = [
	<RefreshCw key='refresh' className='w-6 h-6' aria-hidden='true' />,
	<MessageCircle key='message' className='w-6 h-6' aria-hidden='true' />,
	<Eye key='eye' className='w-6 h-6' aria-hidden='true' />,
	<Activity key='activity' className='w-6 h-6' aria-hidden='true' />,
	<Lock key='lock' className='w-6 h-6' aria-hidden='true' />,
	<Flame key='flame' className='w-6 h-6' aria-hidden='true' />,
]

export default function FeaturesGrid() {
	return (
		<section id={features.sectionId} className='py-20 bg-muted'>
			<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
				<div className='text-center mb-16'>
					<h2 className='text-3xl font-bold text-foreground sm:text-4xl'>{features.heading}</h2>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{features.items.map((item, i) => (
						<div
							key={item.title}
							className='bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow duration-300'>
							<div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6'>
								{featureIcons[i]}
							</div>
							<h3 className='text-xl font-bold text-foreground mb-3'>{item.title}</h3>
							<p className='text-muted-foreground'>{item.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
