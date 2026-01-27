import { NextRequest } from 'next/server'

/**
 * Simple in-memory rate limiter using Map
 * For production with multiple instances, consider Redis or Upstash
 */

type RateLimitConfig = {
	interval: number // milliseconds
	uniqueTokenPerInterval: number
}

type TokenBucket = {
	count: number
	resetTime: number
}

class RateLimiter {
	private cache: Map<string, TokenBucket>
	private interval: number
	private maxTokens: number

	constructor(config: RateLimitConfig) {
		this.cache = new Map()
		this.interval = config.interval
		this.maxTokens = config.uniqueTokenPerInterval

		// Cleanup expired entries every minute
		setInterval(() => this.cleanup(), 60 * 1000)
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

// Create different rate limiters for different time windows
const rateLimiters = {
	auth: new RateLimiter({ interval: 15 * 60 * 1000, uniqueTokenPerInterval: 500 }), // 15 min
	bulkWrite: new RateLimiter({ interval: 5 * 60 * 1000, uniqueTokenPerInterval: 500 }), // 5 min
	write: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 500 }), // 1 min
	read: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 500 }), // 1 min
	public: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 }), // 1 min
}

/**
 * Get unique identifier for rate limiting
 * Prefers user ID for authenticated requests, falls back to IP for public endpoints
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
	// Authentication endpoints: 5 requests per 15 minutes
	auth: (identifier: string) => rateLimiters.auth.check(identifier, 5),

	// Bulk participant operations: 5 requests per 5 minutes (500 participants max)
	bulkParticipant: (identifier: string) => rateLimiters.bulkWrite.check(identifier, 5),

	// Single participant operations: 60 requests per minute
	singleParticipant: (identifier: string) => rateLimiters.write.check(identifier, 60),

	// Progress updates: 100 requests per minute (active tracking sessions)
	progress: (identifier: string) => rateLimiters.write.check(identifier, 100),

	// General write operations: 30 requests per minute
	write: (identifier: string) => rateLimiters.write.check(identifier, 30),

	// Read operations: 100 requests per minute
	read: (identifier: string) => rateLimiters.read.check(identifier, 100),

	// Public endpoints: 60 requests per minute
	public: (identifier: string) => rateLimiters.public.check(identifier, 60),
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
