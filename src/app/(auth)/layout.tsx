'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
							<span className='text-sm text-muted-foreground hidden sm:inline'>{session.user?.name}</span>
							<button onClick={() => setShowLogoutModal(true)} className='text-sm text-destructive hover:underline'>
								Logout
							</button>
						</nav>
					}
				/>

				{/* Main Content */}
				<main className='container mx-auto max-w-3xl px-4 py-6'>{children}</main>

				{/* Mobile Bottom Navigation (placeholder for future) */}
				{/* <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface sm:hidden">
        Mobile nav items here
      </nav> */}
			</div>

			{/* Logout Confirmation Modal */}
			<Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Konfirmasi Logout</DialogTitle>
						<DialogDescription>Yakin mau keluar dari aplikasi?</DialogDescription>
					</DialogHeader>
					<DialogFooter className='flex-row gap-2 sm:gap-0'>
						<button
							onClick={() => setShowLogoutModal(false)}
							disabled={isLoggingOut}
							className='flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition disabled:opacity-50'>
							Batal
						</button>
						<button
							onClick={handleLogout}
							disabled={isLoggingOut}
							className='flex-1 sm:flex-none px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition disabled:opacity-50'>
							{isLoggingOut ? 'Keluar...' : 'Keluar'}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
