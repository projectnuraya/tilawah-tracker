import { landingCopy } from '@/components/landing/copy'
import { Providers } from '@/components/Providers'
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
})

const { meta } = landingCopy

export const metadata: Metadata = {
	metadataBase: new URL(meta.url),
	title: meta.title,
	description: meta.description,
	icons: {
		icon: '/favicon.png',
	},
	openGraph: {
		title: meta.ogTitle,
		description: meta.ogDescription,
		url: meta.url,
		type: 'website',
		images: [
			{
				url: '/favicon.png', // Fallback to favicon for now
				width: 512,
				height: 512,
				alt: 'Tilawah Tracker Logo',
			},
		],
	},
	twitter: {
		card: 'summary',
		title: meta.ogTitle,
		description: meta.ogDescription,
		images: ['/favicon.png'],
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='id'>
			<body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
				<Providers>{children}</Providers>
				<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
			</body>
		</html>
	)
}
