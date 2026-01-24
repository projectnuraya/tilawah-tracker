'use client'

import { cn } from '@/components/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BackButtonProps {
	href: string
	label: string
	className?: string
}

export function BackButton({ href, label, className }: BackButtonProps) {
	return (
		<Link
			href={href}
			className={cn(
				'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
				'text-base font-medium',
				'text-foreground bg-white border-2 border-border',
				'hover:bg-muted hover:border-foreground/20',
				'transition-all duration-150 ease-in-out',
				'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
				'active:bg-muted/70',
				'min-h-11',
				'shadow-sm',
				className,
			)}>
			<ArrowLeft className='h-5 w-5 shrink-0' aria-hidden='true' />
			<span>{label}</span>
		</Link>
	)
}
