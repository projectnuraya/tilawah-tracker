'use client'

import { LayoutDashboard, Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { landingCopy } from './copy'

const { nav } = landingCopy

function AuthButton({
	onClick,
	className,
	isLoading,
	isLoggedIn,
}: {
	onClick?: () => void
	className: string
	isLoading: boolean
	isLoggedIn: boolean
}) {
	if (isLoading) {
		return <span className={`${className} animate-pulse bg-primary/20 rounded-lg`} aria-hidden='true' />
	}
	if (isLoggedIn) {
		return (
			<Link href='/dashboard' onClick={onClick} className={className}>
				<LayoutDashboard className='w-4 h-4' aria-hidden='true' />
				<span>Dashboard</span>
			</Link>
		)
	}
	return (
		<Link href={nav.loginHref} onClick={onClick} className={className}>
			{nav.loginButton}
		</Link>
	)
}

export default function Navbar() {
	const { status } = useSession()
	const isLoggedIn = status === 'authenticated'
	const isLoading = status === 'loading'

	const [scrolled, setScrolled] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20)
		handleScroll() // check on mount
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		document.body.style.overflow = mobileOpen ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [mobileOpen])

	const handleNavClick = useCallback(() => {
		setMobileOpen(false)
	}, [])

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled ? 'bg-card/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
			}`}>
			<div className='max-w-7xl mx-auto px-4 md:px-8'>
				<div className='flex items-center justify-between h-16'>
					{/* Logo */}
					<Link href='/' className='flex items-center gap-2 font-semibold text-lg text-foreground'>
						<Image src='/favicon.png' alt='Tilawah Tracker Icon' width={28} height={28} className='h-7 w-7' />
						<span>{nav.brand}</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden md:flex items-center gap-1' aria-label='Navigasi utama'>
						{nav.links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className='px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors duration-150'>
								{link.label}
							</a>
						))}
						<AuthButton
							isLoading={isLoading}
							isLoggedIn={isLoggedIn}
							className='ml-3 btn-primary px-5 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2'
						/>
					</nav>

					{/* Mobile Hamburger */}
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className='md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
						aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
						aria-expanded={mobileOpen}>
						{mobileOpen ? (
							<X className='w-6 h-6' aria-hidden='true' />
						) : (
							<Menu className='w-6 h-6' aria-hidden='true' />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu Overlay */}
			{mobileOpen && (
				<div className='md:hidden fixed inset-0 top-16 bg-card/98 backdrop-blur-sm z-40'>
					<nav className='flex flex-col p-6 gap-2' aria-label='Navigasi mobile'>
						{nav.links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={handleNavClick}
								className='px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors'>
								{link.label}
							</a>
						))}
						<div className='border-t border-border mt-4 pt-4'>
							<AuthButton
								isLoading={isLoading}
								isLoggedIn={isLoggedIn}
								onClick={handleNavClick}
								className='btn-primary px-5 py-3 rounded-lg text-base font-semibold inline-flex items-center justify-center gap-2 w-full'
							/>
						</div>
					</nav>
				</div>
			)}
		</header>
	)
}
