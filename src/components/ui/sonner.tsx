'use client'

import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			// Pinned: the app has no dark mode, so a system-dark toast would be the only dark surface.
			theme='light'
			richColors
			className='toaster group'
			icons={{
				success: <CircleCheck className='h-4 w-4' />,
				info: <Info className='h-4 w-4' />,
				warning: <TriangleAlert className='h-4 w-4' />,
				error: <OctagonX className='h-4 w-4' />,
				loading: <LoaderCircle className='h-4 w-4 animate-spin' />,
			}}
			toastOptions={{
				classNames: {
					toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
					description: 'group-[.toast]:text-muted-foreground',
					actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
					cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
					error: 'group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground group-[.toast]:border-destructive',
				},
			}}
			{...props}
		/>
	)
}

export { Toaster }
