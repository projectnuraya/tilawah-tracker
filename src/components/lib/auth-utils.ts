import { authOptions } from '@/components/lib/auth'
import { logger } from '@/components/lib/logger'
import { prisma } from '@/components/lib/db'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export class UnauthorizedError extends Error {
	constructor(message = 'Unauthorized') {
		super(message)
		this.name = 'UnauthorizedError'
	}
}

export class ForbiddenError extends Error {
	constructor(message = 'Forbidden') {
		super(message)
		this.name = 'ForbiddenError'
	}
}

export class NotFoundError extends Error {
	constructor(message = 'Not Found') {
		super(message)
		this.name = 'NotFoundError'
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
	}
}

/**
 * Get authenticated session or throw UnauthorizedError
 */
export async function requireAuth() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		throw new UnauthorizedError()
	}
	return session
}

/**
 * Check if coordinator has access to a group
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
 * Standard API error response
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
	return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 })
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, status = 200) {
	return NextResponse.json({ success: true, data }, { status })
}
