'use client'

import { logger } from '@/components/lib/logger'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
	const { data: session } = useSession()

	useEffect(() => {
		// Log the error details
		logger.error({ error, digest: error.digest }, 'Page error occurred')
	}, [error])

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8'>
			<div className='w-full max-w-md text-center space-y-8'>
				{/* Error Icon & Code */}
				<div className='space-y-2'>
					<div className='flex justify-center mb-4'>
						<div className='bg-destructive/10 p-4 rounded-full'>
							<AlertCircle className='text-destructive' size={48} />
						</div>
					</div>
					<h1 className='text-4xl font-bold text-destructive'>500</h1>
					<p className='text-2xl font-semibold text-foreground'>Kesalahan Server</p>
				</div>

				{/* Islamic Quote */}
				<div className='bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-lg p-6 space-y-2'>
					<p className='text-base italic text-muted-foreground'>
						&quot;Maka sesungguhnya beserta kesulitan ada kemudahan, sesungguhnya beserta kesulitan itu ada
						kemudahan.&quot;
					</p>
					<p className='text-sm text-muted-foreground'>— QS. Al-Insyirah 94:5-6</p>
				</div>

				{/* Description */}
				<p className='text-lg text-muted-foreground leading-relaxed'>
					Maaf, terjadi kesalahan tak terduga di server. Tim kami sedang bekerja untuk memperbaikinya. Silakan coba lagi
					dalam beberapa saat.
				</p>

				{/* Action Buttons */}
				<div className='flex flex-col sm:flex-row gap-3 pt-4'>
					<button
						onClick={reset}
						className='inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90'>
						<RefreshCw size={18} />
						Coba Lagi
					</button>

					<Link
						href='/'
						className='inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 py-3 text-base font-medium text-primary transition hover:bg-primary/10'>
						<Home size={18} />
						Beranda
					</Link>
				</div>

				{/* Dashboard Link for Authenticated Users */}
				{session && (
					<Link
						href='/dashboard'
						className='text-primary hover:text-primary/90 font-medium text-base underline underline-offset-2 transition block pt-2'>
						Kembali ke Dasbor
					</Link>
				)}

				{/* Error Details (Development Only) */}
				{process.env.NODE_ENV === 'development' && error?.message && (
					<details className='pt-4 border-t border-border'>
						<summary className='text-sm text-muted-foreground cursor-pointer font-medium hover:text-foreground'>
							Detail Teknis (Development Only)
						</summary>
						<pre className='text-left text-sm bg-muted p-3 rounded mt-2 overflow-auto max-h-32 text-muted-foreground'>
							{error.message}
						</pre>
					</details>
				)}
			</div>
		</div>
	)
}
