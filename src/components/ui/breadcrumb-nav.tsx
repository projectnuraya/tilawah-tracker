'use client'

import { cn } from '@/components/lib/utils'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

export interface BreadcrumbItem {
	label: string
	href: string
	current?: boolean
}

interface BreadcrumbNavProps {
	items: BreadcrumbItem[]
	className?: string
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
	return (
		<nav aria-label='breadcrumb' className={cn('mb-6', className)}>
			<ol className='flex flex-wrap items-center gap-1 text-sm'>
				{items.map((item, index) => {
					const isFirst = index === 0

					if (item.current) {
						return (
							<motion.li
								key={`${item.label}-${index}`}
								initial={{ opacity: 0, x: -6 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.2, ease: 'easeOut' }}
								className='flex items-center gap-1'>
								{!isFirst && (
									<ChevronRight className='h-4 w-4 text-muted-foreground mx-1 shrink-0' aria-hidden='true' />
								)}
								<span className='font-medium text-foreground' aria-current='page'>
									{item.label}
								</span>
							</motion.li>
						)
					}

					return (
						<li key={`${item.label}-${index}`} className='flex items-center gap-1'>
							{!isFirst && (
								<ChevronRight className='h-4 w-4 text-muted-foreground mx-1 shrink-0' aria-hidden='true' />
							)}
							<Link href={item.href} className='text-muted-foreground hover:text-foreground transition-colors'>
								{item.label}
							</Link>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
