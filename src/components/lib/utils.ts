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

/**
 * Normalise a typed WhatsApp number to the E.164-ish shape `createParticipantSchema` accepts.
 *
 * Indonesians write the same number three ways — `0812…`, `62812…`, `+62812…` — and often just
 * `812…`. That last case used to fall through to a bare `'+' + digits`, producing `+81234567890`:
 * a valid-looking Japanese number that passed `/^\+\d{10,15}$/` and got saved. A `628…` branch sat
 * below `62…` and was therefore unreachable.
 *
 * Runs on every keystroke, so an empty field must stay empty rather than becoming a lone `+`.
 */
export const sanitizeWhatsAppNumber = (input: string): string => {
	const digits = input.replace(/\D/g, '')
	if (!digits) return ''
	if (digits.startsWith('62')) return `+${digits}`
	if (digits.startsWith('0')) return `+62${digits.slice(1)}`
	if (digits.startsWith('8')) return `+62${digits}`
	return `+${digits}`
}
