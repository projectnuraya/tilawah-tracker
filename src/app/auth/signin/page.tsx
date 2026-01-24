'use client'

import { isDemoMode } from '@/components/lib/demo-auth'
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
			toast.error('Akun ini belum terdaftar. Silakan hubungi admin grup Anda untuk mendapatkan akses.', {
				className: 'bg-[#dc2626] text-white border-[#dc2626]',
			})
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
									className='w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
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
									className='w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
									placeholder='Enter password'
									required
								/>
							</div>
							<button
								type='submit'
								disabled={isLoading}
								className='w-full rounded-lg bg-primary px-4 py-3 text-primary-foreground font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isLoading ? 'Sedang masuk...' : 'Masuk ke Demo'}
							</button>
							<p className='mt-4 text-sm text-center text-muted-foreground'>Demo credentials: demo / demopass123</p>
						</form>
					) : (
						<>
							<button
								onClick={handleGoogleSignIn}
								disabled={isLoading}
								className='w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-foreground font-medium shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
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

function GoogleIcon() {
	return (
		<svg className='h-5 w-5' viewBox='0 0 24 24'>
			<path
				fill='#4285F4'
				d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
			/>
			<path
				fill='#34A853'
				d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
			/>
			<path
				fill='#FBBC05'
				d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
			/>
			<path
				fill='#EA4335'
				d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
			/>
		</svg>
	)
}
