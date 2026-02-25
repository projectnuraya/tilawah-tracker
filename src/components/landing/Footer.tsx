import { Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { landingCopy } from './copy'

const { footer } = landingCopy

export default function Footer() {
	return (
		<footer className='bg-foreground text-muted py-12 border-t border-foreground/80'>
			<div className='mx-auto max-w-7xl px-6 sm:px-8 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
					{/* Branding */}
					<div className='space-y-4'>
						<div className='flex items-center gap-2 text-background'>
							<Image src='/favicon.png' alt='Tilawah Tracker' width={28} height={28} className='rounded-md' />
							<span className='text-xl font-bold'>{footer.brand}</span>
						</div>
						<p className='text-sm leading-relaxed max-w-xs text-muted-foreground'>{footer.tagline}</p>
					</div>

					{/* Links */}
					<div>
						<h3 className='text-sm font-semibold text-background uppercase tracking-wider mb-4'>
							{footer.linksHeading}
						</h3>
						<ul className='space-y-3'>
							{footer.links.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className='text-muted-foreground hover:text-background transition-colors'>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h3 className='text-sm font-semibold text-background uppercase tracking-wider mb-4'>
							{footer.contactHeading}
						</h3>
						<ul className='space-y-3'>
							<li className='flex items-center gap-2'>
								<Mail className='w-4 h-4 text-muted-foreground' aria-hidden='true' />
								<a
									href={`mailto:${footer.contactEmail}`}
									className='text-muted-foreground hover:text-background transition-colors'>
									{footer.contactEmail}
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className='border-t border-background/10 mt-12 pt-8 text-center text-sm'>
					<p className='text-muted-foreground'>{footer.copyright}</p>
				</div>
			</div>
		</footer>
	)
}
