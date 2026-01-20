import { z } from "zod";

/**
 * Validation schemas for API endpoints
 * Based on TRD Section 8.1 - Input Validation
 */

// ==================== Groups ====================

export const createGroupSchema = z.object({
	name: z
		.string()
		.min(3, "Nama grup minimal 3 karakter")
		.max(255, "Nama grup maksimal 255 karakter"),
});

export const updateGroupSchema = z.object({
	name: z
		.string()
		.min(3, "Nama grup minimal 3 karakter")
		.max(255, "Nama grup maksimal 255 karakter")
		.optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

// ==================== Participants ====================

export const createParticipantSchema = z.object({
	name: z
		.string()
		.min(2, "Nama peserta minimal 2 karakter")
		.max(255, "Nama peserta maksimal 255 karakter"),
	whatsappNumber: z
		.string()
		.regex(/^\+\d{10,15}$/, "Format nomor WhatsApp tidak valid (contoh: +6281234567890)")
		.optional()
		.nullable(),
});

export const createParticipantBulkSchema = z.object({
	participants: z
		.array(createParticipantSchema)
		.min(1, "Minimal 1 peserta harus ditambahkan")
		.max(100, "Maksimal 100 peserta per batch"),
});

export const updateParticipantSchema = z.object({
	name: z
		.string()
		.min(2, "Nama peserta minimal 2 karakter")
		.max(255, "Nama peserta maksimal 255 karakter")
		.optional(),
	whatsappNumber: z
		.string()
		.regex(/^\+\d{10,15}$/, "Format nomor WhatsApp tidak valid (contoh: +6281234567890)")
		.optional()
		.nullable(),
	isActive: z.boolean().optional(),
});

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type CreateParticipantBulkInput = z.infer<typeof createParticipantBulkSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;

// ==================== Periods ====================

export const createPeriodSchema = z.object({
	startDate: z
		.string()
		.refine(
			(date) => {
				const d = new Date(date);
				return !isNaN(d.getTime());
			},
			{ message: "Tanggal tidak valid" }
		)
		.refine(
			(date) => {
				const d = new Date(date);
				return d.getDay() === 0; // Sunday
			},
			{ message: "Periode harus dimulai pada hari Minggu" }
		),
});

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;

// ==================== Progress ====================

export const updateProgressSchema = z.object({
	status: z.enum(["not_finished", "finished", "missed"], {
		message: "Status tidak valid",
	}),
});

export const updateJuzSchema = z.object({
	juzNumber: z
		.number()
		.int("Nomor juz harus bilangan bulat")
		.min(1, "Nomor juz minimal 1")
		.max(30, "Nomor juz maksimal 30"),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type UpdateJuzInput = z.infer<typeof updateJuzSchema>;

// ==================== WhatsApp Share ====================

export const generateShareSchema = z.object({
	customMessage: z.string().max(500, "Pesan kustom maksimal 500 karakter").optional(),
});

export type GenerateShareInput = z.infer<typeof generateShareSchema>;

// ==================== Helper function ====================

/**
 * Validate input and return formatted error response if invalid
 */
export function validateInput<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; error: { code: string; message: string; details: ReturnType<z.ZodError["flatten"]> } } {
	const result = schema.safeParse(data);

	if (!result.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Input tidak valid",
				details: result.error.flatten(),
			},
		};
	}

	return { success: true, data: result.data };
}
