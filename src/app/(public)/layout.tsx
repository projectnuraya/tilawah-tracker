import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-background'>
			{/* Simple Header */}
			<header className='sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur'>
				<div className='container mx-auto flex h-14 max-w-3xl items-center justify-between px-4'>
					<Link href='/' className='font-semibold text-lg text-primary'>
						📖 Tilawah Tracker
					</Link>
					<Link href='/auth/signin' className='text-sm text-primary hover:underline'>
						Login
					</Link>
				</div>
			</header>

			{/* Main Content */}
			<main className='container mx-auto max-w-3xl px-4 py-6'>{children}</main>
		</div>
	)
}
