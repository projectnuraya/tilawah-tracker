import { Database, Heart, Shield } from 'lucide-react'
import { landingCopy } from './copy'

const { trust } = landingCopy

const trustIcons = [
	<Shield key='shield' className='w-4 h-4' aria-hidden='true' />,
	<Database key='db' className='w-4 h-4' aria-hidden='true' />,
	<Heart key='heart' className='w-4 h-4' aria-hidden='true' />,
]

export default function TrustBadges() {
	return (
		<section className='bg-primary-background py-12 px-4 border-y border-primary/10'>
			<div className='max-w-7xl mx-auto'>
				<div className='flex flex-wrap justify-center items-center gap-4 md:gap-8'>
					{trust.badges.map((badge, i) => (
						<div
							key={badge.label}
							className='bg-card border border-primary/20 text-primary-hover px-6 py-3 rounded-full inline-flex items-center gap-2 text-sm font-medium shadow-sm'>
							{trustIcons[i]}
							<span>{badge.label}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
