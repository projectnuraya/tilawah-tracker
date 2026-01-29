import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes without conflicts
 * Combines clsx for conditional classes with twMerge to resolve conflicting utilities
 * Used throughout components for dynamic class composition
 *
 * Example: cn("px-2", "px-4") → "px-4" (latter wins)
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const sanitizeWhatsAppNumber = (input: string): string => {
	const cleaned = input.replace(/\D/g, '')
	if (cleaned.startsWith('62')) {
		return '+' + cleaned
	} else if (cleaned.startsWith('0')) {
		return '+62' + cleaned.slice(1)
	} else if (cleaned.startsWith('628')) {
		return '+62' + cleaned.slice(2)
	} else {
		return '+' + cleaned
	}
}
