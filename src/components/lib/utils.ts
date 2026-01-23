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
