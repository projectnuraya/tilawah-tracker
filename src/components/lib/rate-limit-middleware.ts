import { NextRequest, NextResponse } from 'next/server'
import { getIdentifier, RateLimitResult } from './rate-limit'

/**
 * Helper to create rate limit response with proper headers
 */
export function createRateLimitResponse(result: RateLimitResult) {
	const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

	return NextResponse.json(
		{
			success: false,
			error: {
				code: 'RATE_LIMIT_EXCEEDED',
				message: 'Too many requests. Please try again later.',
			},
		},
		{
			status: 429,
			headers: {
				'X-RateLimit-Limit': result.limit.toString(),
				'X-RateLimit-Remaining': '0',
				'X-RateLimit-Reset': result.reset.toString(),
				'Retry-After': retryAfter.toString(),
			},
		},
	)
}

/**
 * Add rate limit headers to successful responses
 */
export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult) {
	response.headers.set('X-RateLimit-Limit', result.limit.toString())
	response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
	response.headers.set('X-RateLimit-Reset', result.reset.toString())
	return response
}

/**
 * Wrapper to apply rate limiting to an API route handler
 */
export function withRateLimit<T extends (...args: any[]) => Promise<NextResponse>>(
	handler: T,
	rateLimitFn: (identifier: string) => Promise<RateLimitResult>,
	getUserId?: (request: NextRequest) => Promise<string | undefined>,
): T {
	return (async (...args: any[]) => {
		const request = args[0] as NextRequest

		// Get user ID if available
		const userId = getUserId ? await getUserId(request) : undefined
		const identifier = getIdentifier(request, userId)

		// Check rate limit
		const result = await rateLimitFn(identifier)

		if (!result.success) {
			return createRateLimitResponse(result)
		}

		// Call original handler
		const response = await handler(...args)

		// Add rate limit headers to response
		return addRateLimitHeaders(response, result)
	}) as T
}
