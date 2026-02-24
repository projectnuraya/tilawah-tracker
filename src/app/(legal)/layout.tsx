import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-background font-sans text-foreground'>
			<Navbar />
			<main className='pt-24 pb-16'>{children}</main>
			<Footer />
		</div>
	)
}
