'use client'

import { cn } from '@/components/lib/utils'
import { ChevronRight } from 'lucide-react'
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
				{items.map((item, index) => (
					<li key={index} className='flex items-center gap-1'>
						{item.current ? (
							<span className='font-medium text-foreground' aria-current='page'>
								{item.label}
							</span>
						) : (
							<>
								<Link href={item.href} className='text-muted-foreground hover:text-foreground transition-colors'>
									{item.label}
								</Link>
								{index < items.length - 1 && (
									<ChevronRight className='h-4 w-4 text-muted-foreground mx-1' aria-hidden='true' />
								)}
							</>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}
