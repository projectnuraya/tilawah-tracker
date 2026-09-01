import { cn } from '@/components/lib/utils'
import * as React from 'react'

/** One field style for the whole app. Before this existed the same search box appeared with
 *  border-gray-300, border-gray-400 and border-border on three different pages. */
export const fieldClasses =
	'w-full min-h-11 rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground ' +
	'placeholder:text-muted-foreground transition-colors duration-150 ' +
	'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ' +
	'disabled:opacity-50 disabled:cursor-not-allowed'

export const fieldErrorClasses = 'border-destructive focus:ring-destructive'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	invalid?: boolean
}

export function Input({ className, invalid, ...props }: InputProps) {
	return <input className={cn(fieldClasses, invalid && fieldErrorClasses, className)} {...props} />
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	invalid?: boolean
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
	return <textarea className={cn(fieldClasses, 'resize-none', invalid && fieldErrorClasses, className)} {...props} />
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return <label className={cn('block text-base font-medium mb-2', className)} {...props} />
}
