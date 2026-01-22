import Link from 'next/link'

export default function Header({ titleHref, rightContent }: { titleHref: string; rightContent: React.ReactNode }) {
	return (
		<header className='sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/60'>
			<div className='container mx-auto flex h-14 max-w-3xl items-center justify-between px-4'>
				<Link href={titleHref} className='font-semibold text-lg text-primary'>
					📖 Tilawah Tracker
				</Link>
				{rightContent}
			</div>
		</header>
	)
}
