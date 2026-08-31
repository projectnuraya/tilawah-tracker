'use client'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import Header from '@/components/ui/header'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [showLogoutModal, setShowLogoutModal] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/auth/signin')
		}
	}, [status, router])

	if (status === 'loading') {
		return (
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<p className='text-muted-foreground'>Memuat...</p>
			</div>
		)
	}

	if (!session) {
		return null
	}

	const handleLogout = async () => {
		setIsLoggingOut(true)
		await signOut({ callbackUrl: '/' })
	}

	return (
		<>
			<div className='min-h-screen bg-background'>
				{/* Header */}
				<Header
					titleHref='/dashboard'
					rightContent={
						<nav className='flex items-center gap-4'>
							<span className='text-base text-muted-foreground hidden sm:inline'>{session.user?.name}</span>
							<button
								onClick={() => setShowLogoutModal(true)}
								className='text-base text-destructive hover:underline'>
								Logout
							</button>
						</nav>
					}
				/>

				{/* Main Content */}
				<main className='container mx-auto max-w-3xl px-4 py-6'>{children}</main>

				{/* Mobile Bottom Navigation (placeholder for future) */}
				{/* <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card sm:hidden">
        Mobile nav items here
      </nav> */}
			</div>

			{/* Logout Confirmation */}
			<ConfirmDialog
				open={showLogoutModal}
				onOpenChange={setShowLogoutModal}
				title='Konfirmasi Logout'
				description='Yakin mau keluar dari aplikasi?'
				confirmLabel='Keluar'
				pendingLabel='Keluar...'
				isPending={isLoggingOut}
				onConfirm={handleLogout}
			/>
		</>
	)
}
