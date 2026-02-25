import { Monitor, Smartphone } from 'lucide-react'
import Image from 'next/image'
import { landingCopy } from './copy'

const { gallery } = landingCopy

function LaptopMockup({ label }: { label: string }) {
	return (
		<div className='bg-muted p-6 rounded-3xl border border-border'>
			<div className='flex items-center gap-2 mb-4'>
				<Monitor className='w-5 h-5 text-muted-foreground' aria-hidden='true' />
				<span className='text-sm font-semibold text-muted-foreground'>{label}</span>
			</div>
			<div className='relative rounded-xl overflow-hidden shadow-sm border border-border'>
				{/* Browser Chrome */}
				<div className='flex items-center gap-2 bg-card border-b border-border px-3 py-2'>
					<div className='flex gap-1' aria-hidden='true'>
						<div className='h-2 w-2 rounded-full bg-destructive/30' />
						<div className='h-2 w-2 rounded-full bg-accent' />
						<div className='h-2 w-2 rounded-full bg-success/30' />
					</div>
					<div className='mx-auto h-4 w-48 rounded bg-muted text-center text-[9px] leading-4 text-muted-foreground'>
						tilawah.projectnuraya.id/dashboard
					</div>
				</div>
				<Image
					src='/dashboard-screen.png'
					alt='Tilawah Tracker admin dashboard'
					width={2048}
					height={795}
					className='w-full h-auto'
				/>
			</div>
		</div>
	)
}

function MobileMockup({ label }: { label: string }) {
	return (
		<div className='bg-muted p-4 rounded-3xl border border-border'>
			<div className='flex items-center gap-2 mb-4 justify-center'>
				<Smartphone className='w-5 h-5 text-muted-foreground' aria-hidden='true' />
				<span className='text-sm font-semibold text-muted-foreground'>{label}</span>
			</div>
			<div className='relative aspect-9/16 rounded-xl bg-foreground overflow-hidden shadow-lg mx-auto max-w-45 border-4 border-foreground/80'>
				<div className='absolute inset-0 bg-card'>
					<div className='h-14 bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium'>
						Tilawah Tracker
					</div>
					<div className='p-4 space-y-3'>
						<div className='h-24 rounded-lg bg-primary/5 border border-primary/10' />
						<div className='h-10 rounded bg-muted' />
						<div className='h-10 rounded bg-muted' />
					</div>
				</div>
			</div>
		</div>
	)
}

export default function ScreenshotGallery() {
	return (
		<section id={gallery.sectionId} className='py-20 bg-card overflow-hidden'>
			<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
				<div className='text-center mb-16'>
					<h2 className='text-3xl font-bold text-foreground sm:text-4xl'>{gallery.heading}</h2>
					<p className='mt-4 text-muted-foreground'>{gallery.subheading}</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
					{/* Desktop mockup takes full width on left */}
					<LaptopMockup label={gallery.items[0].label} />

					{/* Mobile mockups side by side on right */}
					<div className='grid grid-cols-2 gap-4'>
						{gallery.items.slice(1).map((item) => (
							<MobileMockup key={item.label} label={item.label} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
