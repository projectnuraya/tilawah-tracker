import { landingCopy } from './copy'

const { footer } = landingCopy

export default function Footer() {
	return (
		<footer className='bg-foreground text-background py-16 px-4 md:px-8'>
			<div className='max-w-7xl mx-auto'>
				<div className='grid md:grid-cols-3 gap-12 mb-16'>
					{/* Brand Column */}
					<div className='space-y-4'>
						<h3 className='font-bold text-xl tracking-tight'>{footer.brand}</h3>
						<p className='text-muted-foreground text-sm max-w-xs'>{footer.tagline}</p>
					</div>

					{/* Contact Column */}
					<div>
						<h4 className='font-semibold mb-6 text-lg'>{footer.contactHeading}</h4>
						<a
							href={`mailto:${footer.contactEmail}`}
							className='text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2'>
							{footer.contactEmail}
						</a>
					</div>

					{/* Links Column */}
					<div>
						<h4 className='font-semibold mb-6 text-lg'>{footer.linksHeading}</h4>
						<ul className='space-y-4 text-sm text-muted-foreground'>
							{footer.links.map((link) => (
								<li key={link.label} className='flex items-center gap-2'>
									<span>{link.label}</span>
									<span className='px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase font-medium tracking-wider text-muted-foreground/80'>
										{link.note}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className='border-t border-white/10 pt-8 text-center'>
					<p className='text-sm text-muted-foreground'>{footer.copyright}</p>
				</div>
			</div>
		</footer>
	)
}
