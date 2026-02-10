import { BookOpen, Calendar, RefreshCw } from 'lucide-react'
import { landingCopy } from './copy'

const { program } = landingCopy

const statIcons = [
	<BookOpen key='book' className='w-full h-full' aria-hidden='true' />,
	<Calendar key='cal' className='w-full h-full' aria-hidden='true' />,
	<RefreshCw key='refresh' className='w-full h-full' aria-hidden='true' />,
]

export default function ProgramExplanation() {
	return (
		<section id={program.sectionId} className='bg-card py-16 md:py-24 px-4 md:px-8'>
			<div className='max-w-7xl mx-auto'>
				<h2 className='text-3xl md:text-4xl font-bold text-center text-foreground mb-6'>{program.heading}</h2>

				<p className='max-w-3xl mx-auto text-center text-lg text-muted-foreground mb-12 leading-relaxed'>
					{program.description}
				</p>

				{/* Stat Cards */}
				<div className='grid md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
					{program.stats.map((stat, i) => (
						<div
							key={stat.label}
							className='bg-background rounded-xl border border-border p-6 text-center card-hover'>
							<div className='w-12 h-12 mx-auto mb-4 text-primary'>{statIcons[i]}</div>
							<div className='text-4xl font-bold text-foreground mb-2'>{stat.value}</div>
							<div className='text-sm font-medium text-foreground mb-1'>{stat.label}</div>
							<div className='text-xs text-muted-foreground'>{stat.description}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
