import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { logger } from '@/components/lib/logger'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

/**
 * Custom error: No valid authenticated session
 * Maps to HTTP 401 Unauthorized
 */
export class UnauthorizedError extends Error {
	constructor(message = 'Sesi Anda sudah berakhir. Silakan masuk kembali.') {
		super(message)
		this.name = 'UnauthorizedError'
	}
}

/**
 * Custom error: Authenticated but insufficient permissions
 * Maps to HTTP 403 Forbidden
 */
export class ForbiddenError extends Error {
	constructor(message = 'Anda tidak punya akses ke data ini.') {
		super(message)
		this.name = 'ForbiddenError'
	}
}

/**
 * Custom error: Requested resource does not exist
 * Maps to HTTP 404 Not Found
 */
export class NotFoundError extends Error {
	constructor(message = 'Data tidak ditemukan.') {
		super(message)
		this.name = 'NotFoundError'
	}
}

/**
 * Custom error: Invalid input data failed validation
 * Maps to HTTP 400 Bad Request with validation details
 *
 * `message` is shown to the coordinator verbatim, so it must be Indonesian. `details` carries the
 * flattened Zod error for debugging and is optional — errors raised by hand rarely have one.
 */
export class ValidationError extends Error {
	readonly details?: unknown

	constructor(message: string, details?: unknown) {
		super(message)
		this.name = 'ValidationError'
		this.details = details
	}
}

/**
 * Get authenticated session - throws UnauthorizedError if no valid session
 */
export async function requireAuth() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		throw new UnauthorizedError()
	}
	return session
}

/**
 * Check if coordinator has access to a specific group
 * Verifies the coordinatorId-groupId relationship in the database
 */
export async function requireGroupAccess(coordinatorId: string, groupId: string) {
	const access = await prisma.coordinatorGroup.findUnique({
		where: {
			coordinatorId_groupId: {
				coordinatorId,
				groupId,
			},
		},
	})

	if (!access) {
		throw new ForbiddenError('Anda tidak punya akses ke grup ini.')
	}

	return access
}

/**
 * Read and parse a JSON request body.
 *
 * Every mutating route repeated this same try/catch, seven copies of it, purely so a malformed
 * body surfaced as a 400 rather than an unhandled 500.
 */
export async function parseJsonBody(request: Request): Promise<unknown> {
	try {
		return await request.json()
	} catch (err) {
		logger.error({ err }, 'Failed to parse JSON in request body')
		throw new ValidationError('Isi permintaan tidak valid.')
	}
}

/**
 * Non-throwing variant of requireGroupAccess, for server components.
 *
 * Pages want to fall through to notFound() rather than surface a 403 that tells the visitor the
 * group exists. Five of them wrote this Prisma call out by hand.
 */
export async function hasGroupAccess(coordinatorId: string, groupId: string): Promise<boolean> {
	const access = await prisma.coordinatorGroup.findUnique({
		where: { coordinatorId_groupId: { coordinatorId, groupId } },
		select: { id: true },
	})
	return access !== null
}

/**
 * Load a participant, checking the caller coordinates its group.
 *
 * @throws NotFoundError when it does not exist, ForbiddenError when it is someone else's
 */
export async function getParticipantWithAccess(coordinatorId: string, participantId: string) {
	const participant = await prisma.participant.findUnique({
		where: { id: participantId },
		include: { group: { include: { coordinatorGroups: { where: { coordinatorId } } } } },
	})

	if (!participant) {
		throw new NotFoundError('Peserta tidak ditemukan.')
	}
	if (participant.group.coordinatorGroups.length === 0) {
		throw new ForbiddenError('Anda tidak punya akses ke peserta ini.')
	}
	return participant
}

/**
 * Load a period, checking the caller coordinates its group.
 *
 * @throws NotFoundError when it does not exist, ForbiddenError when it is someone else's
 */
export async function getPeriodWithAccess(coordinatorId: string, periodId: string) {
	const period = await prisma.period.findUnique({
		where: { id: periodId },
		include: { group: { include: { coordinatorGroups: { where: { coordinatorId } } } } },
	})

	if (!period) {
		throw new NotFoundError('Periode tidak ditemukan.')
	}
	if (period.group.coordinatorGroups.length === 0) {
		throw new ForbiddenError('Anda tidak punya akses ke periode ini.')
	}
	return period
}

/**
 * Format error into standard API response
 * Maps custom error types to appropriate HTTP status codes
 */
export function apiError(error: unknown) {
	if (error instanceof UnauthorizedError) {
		return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 })
	}

	if (error instanceof ForbiddenError) {
		return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: error.message } }, { status: 403 })
	}

	if (error instanceof NotFoundError) {
		return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: error.message } }, { status: 404 })
	}

	if (error instanceof ValidationError) {
		return NextResponse.json(
			{
				success: false,
				error: { code: 'VALIDATION_ERROR', message: error.message, ...(error.details ? { details: error.details } : {}) },
			},
			{ status: 400 },
		)
	}

	logger.error({ err: error }, 'API Error')
	return NextResponse.json(
		{ success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan di server. Silakan coba lagi.' } },
		{ status: 500 },
	)
}

/**
 * Format success response with data
 * @param data Response payload
 * @param status HTTP status code (defaults to 200)
 */
export function apiSuccess<T>(data: T, status = 200) {
	return NextResponse.json({ success: true, data }, { status })
}
