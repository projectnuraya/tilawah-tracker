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
	constructor(message = 'Unauthorized') {
		super(message)
		this.name = 'UnauthorizedError'
	}
}

/**
 * Custom error: Authenticated but insufficient permissions
 * Maps to HTTP 403 Forbidden
 */
export class ForbiddenError extends Error {
	constructor(message = 'Forbidden') {
		super(message)
		this.name = 'ForbiddenError'
	}
}

/**
 * Custom error: Requested resource does not exist
 * Maps to HTTP 404 Not Found
 */
export class NotFoundError extends Error {
	constructor(message = 'Not Found') {
		super(message)
		this.name = 'NotFoundError'
	}
}

/**
 * Custom error: Invalid input data failed validation
 * Maps to HTTP 400 Bad Request with validation details
 */
export class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
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
		throw new ForbiddenError("You don't have access to this group")
	}

	return access
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
		return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } }, { status: 400 })
	}

	logger.error({ error }, 'API Error')
	return NextResponse.json(
		{ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
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
