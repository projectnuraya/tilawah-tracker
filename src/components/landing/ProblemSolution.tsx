import { CheckCircle, XCircle } from 'lucide-react'
import { landingCopy } from './copy'

const { problemSolution } = landingCopy

export default function ProblemSolution() {
	return (
		<section id='problem-solution' className='bg-muted py-16 md:py-24 px-4 md:px-8'>
			<div className='max-w-7xl mx-auto'>
				<h2 className='text-3xl md:text-4xl font-bold text-center text-foreground mb-12'>{problemSolution.heading}</h2>

				<div className='grid md:grid-cols-2 gap-8 max-w-5xl mx-auto'>
					{/* Problem Card */}
					<div className='bg-card rounded-xl border-2 border-destructive/20 p-8'>
						<h3 className='text-2xl font-bold text-destructive mb-6 flex items-center gap-2'>
							<XCircle className='w-6 h-6 shrink-0' aria-hidden='true' />
							{problemSolution.problem.title}
						</h3>
						<ul className='space-y-3'>
							{problemSolution.problem.items.map((item) => (
								<li key={item} className='flex items-start gap-3'>
									<XCircle className='w-5 h-5 text-destructive/60 shrink-0 mt-0.5' aria-hidden='true' />
									<span className='text-muted-foreground'>{item}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Solution Card */}
					<div className='bg-card rounded-xl border-2 border-primary/20 p-8'>
						<h3 className='text-2xl font-bold text-primary mb-6 flex items-center gap-2'>
							<CheckCircle className='w-6 h-6 shrink-0' aria-hidden='true' />
							{problemSolution.solution.title}
						</h3>
						<ul className='space-y-3'>
							{problemSolution.solution.items.map((item) => (
								<li key={item} className='flex items-start gap-3'>
									<CheckCircle className='w-5 h-5 text-primary shrink-0 mt-0.5' aria-hidden='true' />
									<span className='text-muted-foreground'>{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	)
}
