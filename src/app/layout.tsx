import { Providers } from '@/components/Providers'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
})

export const metadata: Metadata = {
	title: 'Tilawah Tracker',
	description: 'Lacak kemajuan tilawah kelompok untuk program Satu Minggu Satu Juz',
	icons: {
		icon: '/favicon.png',
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
			</body>
		</html>
	)
}
