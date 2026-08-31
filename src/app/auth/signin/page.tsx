'use client'

import { isDemoMode } from '@/components/lib/demo-auth'
import { GoogleIcon } from '@/components/ui/icons'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'

function SignInContent() {
	const [isLoading, setIsLoading] = useState(false)
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const searchParams = useSearchParams()
	const error = searchParams.get('error')

	useEffect(() => {
		if (error === 'AccessDenied') {
			toast.error('Akun ini belum terdaftar. Silakan hubungi admin grup Anda untuk mendapatkan akses.')
		}
	}, [error])

	const handleGoogleSignIn = async () => {
		setIsLoading(true)
		await signIn('google', { callbackUrl: '/dashboard' })
	}

	const handleDemoSignIn = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		await signIn('credentials', {
			username,
			password,
			callbackUrl: '/dashboard',
		})
		setIsLoading(false)
	}

	const isDemoModeEnabled = isDemoMode()

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-background px-4'>
			<div className='w-full max-w-sm space-y-8'>
				{/* Logo & Title */}
				<div className='text-center'>
					<h1 className='text-3xl font-semibold text-foreground flex items-center justify-center gap-2'>
						<Image src='/favicon.png' alt='Tilawah Tracker Logo' width={32} height={32} />
						Tilawah Tracker
					</h1>
					<p className='mt-2 text-muted-foreground'>Pantau progress tilawah Al-Qur&apos;an bersama</p>
				</div>

				{/* Sign-in Card */}
				<div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
					<h2 className='text-xl font-medium text-center mb-6'>
						{isDemoModeEnabled ? 'Demo Mode' : 'Masuk sebagai Koordinator'}
					</h2>

					{isDemoModeEnabled ? (
						<form onSubmit={handleDemoSignIn} className='space-y-4'>
							<div>
								<label htmlFor='username' className='block text-base font-medium text-foreground mb-1'>
									Username
								</label>
								<input
									id='username'
									type='text'
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className='w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
									placeholder='Enter username'
									required
								/>
							</div>
							<div>
								<label htmlFor='password' className='block text-base font-medium text-foreground mb-1'>
									Password
								</label>
								<input
									id='password'
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
									placeholder='Enter password'
									required
								/>
							</div>
							<button
								type='submit'
								disabled={isLoading}
								className='w-full rounded-lg bg-primary px-4 py-3 text-primary-foreground font-medium shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isLoading ? 'Sedang masuk...' : 'Masuk ke Demo'}
							</button>
						</form>
					) : (
						<>
							<button
								onClick={handleGoogleSignIn}
								disabled={isLoading}
								className='w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-foreground font-medium shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isLoading ? (
									<span>Sedang masuk...</span>
								) : (
									<>
										<GoogleIcon />
										<span>Masuk dengan Google</span>
									</>
								)}
							</button>

							<p className='mt-4 text-sm text-center text-muted-foreground'>
								Hanya koordinator yang terdaftar yang dapat masuk.
							</p>
						</>
					)}
				</div>

				{/* Footer */}
				<p className='text-center text-base text-muted-foreground'>Butuh akses? Hubungi admin grup Anda.</p>
			</div>
		</div>
	)
}

export default function SignInPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-background'>
					<div className='text-muted-foreground'>Memuat...</div>
				</div>
			}>
			<SignInContent />
		</Suspense>
	)
}
