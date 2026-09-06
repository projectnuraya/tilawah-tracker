import { NextRequest } from 'next/server'

/**
 * Simple in-memory rate limiter using Map
 * For production with multiple instances, consider Redis or Upstash
 */

type RateLimitConfig = {
	interval: number // milliseconds
}

type TokenBucket = {
	count: number
	resetTime: number
}

class RateLimiter {
	private cache: Map<string, TokenBucket>
	private interval: number

	constructor(config: RateLimitConfig) {
		this.cache = new Map()
		this.interval = config.interval

		// Cleanup expired entries every minute. unref() so this timer never keeps the process alive.
		setInterval(() => this.cleanup(), 60 * 1000).unref()
	}

	private cleanup() {
		const now = Date.now()
		for (const [key, bucket] of this.cache.entries()) {
			if (bucket.resetTime < now) {
				this.cache.delete(key)
			}
		}
	}

	async check(identifier: string, limit: number) {
		const now = Date.now()
		const bucket = this.cache.get(identifier)

		// No bucket or expired - create new one
		if (!bucket || bucket.resetTime < now) {
			this.cache.set(identifier, {
				count: 1,
				resetTime: now + this.interval,
			})

			return {
				success: true,
				limit,
				remaining: limit - 1,
				reset: now + this.interval,
			}
		}

		// Increment count
		bucket.count += 1

		// Check if over limit
		const isRateLimited = bucket.count > limit

		return {
			success: !isRateLimited,
			limit,
			remaining: Math.max(0, limit - bucket.count),
			reset: bucket.resetTime,
		}
	}
}

// One limiter instance per policy, never shared.
//
// `singleParticipant`, `progress` and `write` used to share a single limiter, whose Map is keyed
// by identifier alone. Each caller passed its own limit into that one shared bucket, so 31
// progress updates in a minute would push the coordinator's next `write` (create a group, start a
// period) past its limit of 30 and return 429 — three policies quietly spending one budget.
const rateLimiters = {
	bulkParticipant: new RateLimiter({ interval: 5 * 60 * 1000 }), // 5 min
	singleParticipant: new RateLimiter({ interval: 60 * 1000 }), // 1 min
	progress: new RateLimiter({ interval: 60 * 1000 }), // 1 min
	write: new RateLimiter({ interval: 60 * 1000 }), // 1 min
	read: new RateLimiter({ interval: 60 * 1000 }), // 1 min
}

/**
 * Get unique identifier for rate limiting
 *
 * Every remaining endpoint runs behind requireAuth(), so in practice this always keys on the
 * coordinator id. The IP fallback is kept as a backstop for a caller that has no session yet.
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
	if (userId) return `user:${userId}`

	// Get IP from various headers (Vercel, Cloudflare, etc.)
	const forwarded = request.headers.get('x-forwarded-for')
	const realIp = request.headers.get('x-real-ip')
	const cfIp = request.headers.get('cf-connecting-ip')

	const ip = cfIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : 'unknown')
	return `ip:${ip}`
}

/**
 * Rate limit checkers for different endpoint types
 */
export const rateLimit = {
	// Bulk participant operations: 5 requests per 5 minutes (500 participants max)
	bulkParticipant: (identifier: string) => rateLimiters.bulkParticipant.check(identifier, 5),

	// Single participant operations: 60 requests per minute
	singleParticipant: (identifier: string) => rateLimiters.singleParticipant.check(identifier, 60),

	// Progress updates: 100 requests per minute (active tracking sessions)
	progress: (identifier: string) => rateLimiters.progress.check(identifier, 100),

	// General write operations: 30 requests per minute
	write: (identifier: string) => rateLimiters.write.check(identifier, 30),

	// Read operations: 100 requests per minute
	read: (identifier: string) => rateLimiters.read.check(identifier, 100),
}

/**
 * Rate limit result type
 */
export type RateLimitResult = {
	success: boolean
	limit: number
	remaining: number
	reset: number
}
