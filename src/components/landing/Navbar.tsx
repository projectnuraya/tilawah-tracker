'use client'

import { LayoutDashboard, Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { landingCopy } from './copy'

const { nav, hero } = landingCopy

function buildMailtoLink() {
	const { email, subject, body } = hero.mailto
	const params = new URLSearchParams({ subject, body })
	return `mailto:${email}?${params.toString()}`
}

export default function Navbar() {
	const { status } = useSession()
	const isLoggedIn = status === 'authenticated'
	const isLoading = status === 'loading'

	const [scrolled, setScrolled] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20)
		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

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
		<>
			<header
				className={`fixed top-0 z-50 w-full transition-all duration-300 ${
					scrolled ? 'bg-card/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
				}`}>
				<div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-8'>
					{/* Logo */}
					<Link href='/' className='flex items-center gap-2'>
						<Image src='/favicon.png' alt='Tilawah Tracker' width={32} height={32} className='rounded-lg' />
						<span className='text-lg font-bold tracking-tight text-foreground'>{nav.brand}</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden md:flex items-center gap-8' aria-label='Navigasi utama'>
						{nav.links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>
								{link.label}
							</a>
						))}
					</nav>

					{/* Desktop Auth Buttons */}
					<div className='hidden md:flex items-center gap-3'>
						{isLoading ? (
							<span className='animate-pulse bg-primary/20 rounded-lg h-9 w-20' role='status' aria-live='polite'>
								<span className='sr-only'>Checking authentication status…</span>
							</span>
						) : isLoggedIn ? (
							<Link
								href='/dashboard'
								className='inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-all gap-2'>
								<LayoutDashboard className='w-4 h-4' aria-hidden='true' />
								Dashboard
							</Link>
						) : (
							<>
								<Link
									href={nav.loginHref}
									className='text-sm font-semibold text-foreground hover:text-primary transition-colors'>
									{nav.loginButton}
								</Link>
								<a
									href={buildMailtoLink()}
									className='inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-all focus-visible:outline-offset-2 focus-visible:outline-primary'>
									{nav.requestAccess}
								</a>
							</>
						)}
					</div>

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
			</header>

			{/* Mobile Menu Overlay — sibling to header to escape backdrop-blur containing block */}
			{mobileOpen && (
				<div className='md:hidden fixed inset-x-0 top-16 bottom-0 bg-background z-40 overflow-y-auto'>
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
						<div className='border-t border-border mt-4 pt-4 flex flex-col gap-3'>
							{isLoading ? (
								<span className='animate-pulse bg-primary/20 rounded-lg h-12 w-full' />
							) : isLoggedIn ? (
								<Link
									href='/dashboard'
									onClick={handleNavClick}
									className='btn-primary px-5 py-3 rounded-lg text-base font-semibold inline-flex items-center justify-center gap-2 w-full'>
									<LayoutDashboard className='w-4 h-4' aria-hidden='true' />
									Dashboard
								</Link>
							) : (
								<>
									<Link
										href={nav.loginHref}
										onClick={handleNavClick}
										className='px-5 py-3 rounded-lg text-base font-semibold text-foreground hover:bg-muted text-center transition-colors'>
										{nav.loginButton}
									</Link>
									<a
										href={buildMailtoLink()}
										onClick={handleNavClick}
										className='bg-primary text-primary-foreground px-5 py-3 rounded-lg text-base font-semibold inline-flex items-center justify-center gap-2 w-full'>
										{nav.requestAccess}
									</a>
								</>
							)}
						</div>
					</nav>
				</div>
			)}
		</>
	)
}
