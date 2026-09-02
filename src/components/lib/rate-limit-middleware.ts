import { NextResponse } from 'next/server'
import { RateLimitResult } from './rate-limit'

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
				message: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.',
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
