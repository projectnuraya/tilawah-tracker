import Header from '@/components/ui/header'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-background'>
			{/* Simple Header */}
			<Header
				titleHref='/'
				rightContent={
					<Link href='/auth/signin' className='text-base text-primary hover:underline'>
						Login
					</Link>
				}
			/>

			{/* Main Content */}
			<main className='container mx-auto max-w-3xl px-6 py-6'>{children}</main>

			<footer className='container mx-auto max-w-3xl px-6 pb-10'>
				<div className='pt-6 border-t border-border text-center text-base text-muted-foreground'>
					<p>Tilawah Tracker - Sistem tracking tilawah grup</p>
					<p className='mt-1'>PT Nuraya Digital Nusantara</p>
				</div>
			</footer>
		</div>
	)
}
