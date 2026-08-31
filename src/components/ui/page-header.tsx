import { cn } from '@/components/lib/utils'

interface PageHeaderProps {
	title: React.ReactNode
	description?: React.ReactNode
	/** Rendered to the right of the title on wide screens, below it on phones. */
	action?: React.ReactNode
	/** Sits between title and description, e.g. an "Aktif" / "Terkunci" pill. */
	badge?: React.ReactNode
	className?: string
}

/**
 * The single page-title treatment. Page headings previously ranged across seven sizes
 * (text-xl through text-6xl, semibold and bold), so `text-2xl font-semibold` is adopted here
 * because it was already what most pages used.
 */
export function PageHeader({ title, description, action, badge, className }: PageHeaderProps) {
	return (
		<div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4', className)}>
			<div className='min-w-0'>
				<div className='flex flex-wrap items-center gap-3'>
					<h1 className='text-2xl font-semibold'>{title}</h1>
					{badge}
				</div>
				{description && <div className='text-muted-foreground text-base mt-1'>{description}</div>}
			</div>
			{action && <div className='shrink-0'>{action}</div>}
		</div>
	)
}
