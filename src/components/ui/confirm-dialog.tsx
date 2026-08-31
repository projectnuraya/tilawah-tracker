'use client'

import { Button, type ButtonVariant } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	/** Accepts nodes so callers can bold the part that matters, e.g. how many people get marked missed. */
	description: React.ReactNode
	confirmLabel: string
	pendingLabel?: string
	cancelLabel?: string
	confirmVariant?: ButtonVariant
	isPending?: boolean
	onConfirm: () => void
}

/**
 * The one way to confirm an irreversible action. Replaces three earlier patterns that had drifted
 * apart: a modal for logout, a red inline card for locking a period, and an inline row for deleting
 * a group or deactivating a participant. Being a real dialog also means Escape, focus trapping and
 * scroll locking come from Radix rather than being reimplemented per call site.
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	pendingLabel,
	cancelLabel = 'Batal',
	confirmVariant = 'destructive',
	isPending = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className='flex-row gap-2 sm:gap-2'>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isPending} className='flex-1 sm:flex-none'>
						{cancelLabel}
					</Button>
					<Button variant={confirmVariant} onClick={onConfirm} disabled={isPending} className='flex-1 sm:flex-none'>
						{isPending ? (
							<>
								<Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
								{pendingLabel ?? confirmLabel}
							</>
						) : (
							confirmLabel
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
