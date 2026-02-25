import { Monitor, Smartphone } from 'lucide-react'
import Image from 'next/image'
import { landingCopy } from './copy'

const { gallery } = landingCopy

function LaptopMockup({
	label,
	image,
	browserUrl,
}: {
	label: string
	image: { src: string; alt: string; width: number; height: number }
	browserUrl: string
}) {
	return (
		<div className='bg-muted p-6 rounded-3xl border border-border h-full flex flex-col'>
			<div className='flex items-center gap-2 mb-4 shrink-0'>
				<Monitor className='w-5 h-5 text-muted-foreground' aria-hidden='true' />
				<span className='text-sm font-semibold text-muted-foreground'>{label}</span>
			</div>
			<div className='relative rounded-xl overflow-hidden shadow-sm border border-border flex-1 flex flex-col'>
				{/* Browser Chrome */}
				<div className='flex items-center gap-2 bg-card border-b border-border px-3 py-2 shrink-0'>
					<div className='flex gap-1' aria-hidden='true'>
						<div className='h-2 w-2 rounded-full bg-destructive/30' />
						<div className='h-2 w-2 rounded-full bg-accent' />
						<div className='h-2 w-2 rounded-full bg-success/30' />
					</div>
					<div className='mx-auto h-4 w-48 rounded bg-muted text-center text-[9px] leading-4 text-muted-foreground'>
						{browserUrl}
					</div>
				</div>
				<div className='relative flex-1 overflow-hidden'>
					<Image
						src={image.src}
						alt={image.alt}
						width={image.width}
						height={image.height}
						className='absolute inset-0 w-full h-full object-cover object-top'
					/>
				</div>
			</div>
		</div>
	)
}

function MobileMockup({ label, image }: { label: string; image?: { src: string; alt: string; width: number; height: number } }) {
	return (
		<div className='bg-muted p-3 rounded-3xl border border-border flex flex-col items-center'>
			<div className='flex items-center gap-2 mb-3 justify-center'>
				<Smartphone className='w-5 h-5 text-muted-foreground' aria-hidden='true' />
				<span className='text-sm font-semibold text-muted-foreground'>{label}</span>
			</div>
			{/* Samsung S24 Ultra frame — titanium flat frame, 9:19.5 (18:39) aspect ratio */}
			<div className='relative w-full aspect-[18/39] rounded-[1.2rem] bg-zinc-900 shadow-xl p-1.5 border border-zinc-700'>
				{/* Screen */}
				<div className='relative w-full h-full rounded-[1.1rem] bg-card overflow-hidden'>
					{image ? (
						<Image
							src={image.src}
							alt={image.alt}
							width={image.width}
							height={image.height}
							className='absolute inset-0 w-full h-full object-cover object-top'
						/>
					) : (
						<>
							<div className='h-12 bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium'>
								Tilawah Tracker
							</div>
							<div className='p-3 space-y-3'>
								<div className='h-20 rounded-lg bg-primary/5 border border-primary/10' />
								<div className='h-8 rounded bg-muted' />
								<div className='h-8 rounded bg-muted' />
							</div>
						</>
					)}
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
					<LaptopMockup
						label={gallery.items[0].label}
						image={gallery.items[0].image}
						browserUrl={gallery.items[0].browserUrl}
					/>
					{/* Mobile mockups side by side on right */}
					<div className='grid grid-cols-2 gap-4'>
						{gallery.items.slice(1).map((item) => (
							<MobileMockup key={item.label} label={item.label} image={item.image} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
