import Header from '@/components/ui/header'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-background'>
			{/* Simple Header */}
			<Header
				titleHref='/'
				rightContent={
					<Link href='/auth/signin' className='text-sm text-primary hover:underline'>
						Login
					</Link>
				}
			/>

			{/* Main Content */}
			<main className='container mx-auto max-w-3xl px-4 py-6'>{children}</main>
		</div>
	)
}
