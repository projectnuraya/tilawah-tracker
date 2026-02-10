import { LayoutDashboard, Smartphone, Tablet } from 'lucide-react'
import { landingCopy } from './copy'

const { gallery } = landingCopy

export default function ScreenshotGallery() {
	return (
		<section id={gallery.sectionId} className='bg-card py-16 md:py-24 px-4 md:px-8'>
			<div className='max-w-7xl mx-auto'>
				<div className='text-center mb-12'>
					<h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>{gallery.heading}</h2>
					<p className='text-lg text-muted-foreground'>{gallery.subheading}</p>
				</div>

				<div className='grid md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
					{gallery.items.map((item) => (
						<div key={item.label} className='flex flex-col gap-4'>
							{/* Placeholder Container */}
							<div
								className={`
									bg-muted rounded-xl border border-border flex flex-col items-center justify-center text-muted-foreground/50
									aspect-4/3 relative overflow-hidden group
								`}>
								{/* Icon representing device type */}
								<div className='w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300'>
									{item.type === 'mobile' ? (
										<Smartphone className='w-8 h-8' />
									) : item.type === 'tablet' ? (
										<Tablet className='w-8 h-8' />
									) : (
										<LayoutDashboard className='w-8 h-8' />
									)}
								</div>
								<p className='font-medium text-sm'>{item.label}</p>
								<p className='text-xs mt-1 opacity-70'>Screenshot Placeholder</p>

								{/* Decorative corner accent */}
								<div className='absolute top-0 right-0 p-4 opacity-50'>
									<div className='flex gap-1.5'>
										<div className='w-2 h-2 rounded-full bg-border' />
										<div className='w-2 h-2 rounded-full bg-border' />
									</div>
								</div>
							</div>

							<div className='text-center px-4'>
								<h3 className='font-semibold text-foreground mb-1'>{item.label}</h3>
								<p className='text-sm text-muted-foreground'>{item.caption}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
