import { z } from 'zod'

/**
 * Validation schemas for API endpoints
 * Based on TRD Section 8.1 - Input Validation
 */

// ==================== Groups ====================

export const createGroupSchema = z.object({
	name: z.string().min(3, 'Nama grup minimal 3 karakter').max(255, 'Nama grup maksimal 255 karakter'),
})

export const updateGroupSchema = z.object({
	name: z.string().min(3, 'Nama grup minimal 3 karakter').max(255, 'Nama grup maksimal 255 karakter'),
})

// ==================== Participants ====================

export const createParticipantSchema = z.object({
	name: z.string().min(2, 'Nama peserta minimal 2 karakter').max(255, 'Nama peserta maksimal 255 karakter'),
	whatsappNumber: z
		.string()
		.regex(/^\+\d{10,15}$/, 'Format nomor WhatsApp tidak valid (contoh: +6281234567890)')
		.optional()
		.nullable(),
})

export const createParticipantBulkSchema = z.object({
	participants: z
		.array(createParticipantSchema)
		.min(1, 'Minimal 1 peserta harus ditambahkan')
		.max(100, 'Maksimal 100 peserta per batch'),
})

export const updateParticipantSchema = z.object({
	name: z.string().min(2, 'Nama peserta minimal 2 karakter').max(255, 'Nama peserta maksimal 255 karakter').optional(),
	whatsappNumber: z
		.string()
		.regex(/^\+\d{10,15}$/, 'Format nomor WhatsApp tidak valid (contoh: +6281234567890)')
		.optional()
		.nullable(),
	isActive: z.boolean().optional(),
})

// ==================== Periods ====================

export const createPeriodSchema = z.object({
	startDate: z
		.string()
		.refine(
			(date) => {
				const d = new Date(date)
				return !isNaN(d.getTime())
			},
			{ message: 'Tanggal tidak valid' },
		)
		.refine(
			(date) => {
				const d = new Date(date + 'T00:00:00Z') // Treat as UTC to avoid timezone issues
				return d.getUTCDay() === 1 // Monday — must read in UTC too, or the server's own timezone shifts it
			},
			{ message: 'Periode harus dimulai pada hari Senin' },
		),
})

// ==================== Progress ====================

export const updateProgressSchema = z.object({
	status: z.enum(['not_finished', 'finished', 'missed'], {
		message: 'Status tidak valid',
	}),
})

export const updateJuzSchema = z.object({
	juzNumber: z.number().int('Nomor juz harus bilangan bulat').min(1, 'Nomor juz minimal 1').max(30, 'Nomor juz maksimal 30'),
})

/**
 * The message a coordinator should actually read.
 *
 * `message` used to be the constant 'Input tidak valid', and every route surfaces exactly that
 * field to the browser — so the Indonesian per-field messages written above ("Nama grup minimal 3
 * karakter", "Periode harus dimulai pada hari Senin") were defined but never shown to anyone.
 * Zod orders issues as encountered, so the first one is the field the coordinator hit first.
 */
function firstIssueMessage(error: z.ZodError): string {
	return error.issues[0]?.message ?? 'Input tidak valid'
}

/**
 * Validate input against schema and return typed result with error details
 * Used throughout API routes for consistent input validation
 *
 * @returns success + data on valid input, or success: false + error details if invalid
 */
export function validateInput<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
):
	| { success: true; data: T }
	| { success: false; error: { code: string; message: string; details: ReturnType<z.ZodError['flatten']> } } {
	const result = schema.safeParse(data)

	if (!result.success) {
		return {
			success: false,
			error: {
				code: 'VALIDATION_ERROR',
				message: firstIssueMessage(result.error),
				details: result.error.flatten(),
			},
		}
	}

	return { success: true, data: result.data }
}
