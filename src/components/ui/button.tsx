import { cn } from '@/components/lib/utils'
import Link from 'next/link'
import * as React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

/** All variants pair a background with its matching foreground token, so every combination clears
 *  WCAG AA. Never hand-roll `bg-* text-white` on a button — use a variant. */
const VARIANTS: Record<ButtonVariant, string> = {
	primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
	secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90',
	outline: 'border border-border bg-card text-foreground hover:bg-muted',
	destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
	ghost: 'text-foreground hover:bg-muted',
}

/** Heights honour the 44px minimum touch target from docs/ui-theme.md. */
const SIZES: Record<ButtonSize, string> = {
	sm: 'min-h-11 px-3 py-2 text-base gap-1.5',
	md: 'min-h-11 px-4 py-2.5 text-base gap-2',
	lg: 'min-h-12 px-6 py-3 text-base gap-2',
}

const BASE =
	'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 ' +
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
	'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

export function buttonClasses({
	variant = 'primary',
	size = 'md',
	fullWidth = false,
	className,
}: {
	variant?: ButtonVariant
	size?: ButtonSize
	fullWidth?: boolean
	className?: string
} = {}) {
	return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	fullWidth?: boolean
}

export function Button({ variant, size, fullWidth, className, ...props }: ButtonProps) {
	return <button className={buttonClasses({ variant, size, fullWidth, className })} {...props} />
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
	variant?: ButtonVariant
	size?: ButtonSize
	fullWidth?: boolean
}

/** Same look as Button, for navigation. Keeps anchors as anchors so they stay right-clickable. */
export function ButtonLink({ variant, size, fullWidth, className, ...props }: ButtonLinkProps) {
	return <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props} />
}
