import { apiError, apiSuccess, requireAuth, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { logger } from '@/components/lib/logger'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { generatePublicToken } from '@/components/lib/tokens'
import { createGroupSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

/**
 * GET /api/v1/groups
 * List all groups for the authenticated coordinator
 */
export async function GET(request: NextRequest) {
	try {
		const session = await requireAuth()

		// Rate limit: 100 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.read(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		const coordinatorGroups = await prisma.coordinatorGroup.findMany({
			where: {
				coordinatorId: session.user.id,
			},
			include: {
				group: {
					include: {
						_count: {
							select: {
								participants: {
									where: { isActive: true },
								},
								periods: true,
							},
						},
						periods: {
							where: { status: 'active' },
							take: 1,
						},
					},
				},
			},
			orderBy: {
				joinedAt: 'desc',
			},
		})

		const groups = coordinatorGroups.map((cg) => ({
			id: cg.group.id,
			name: cg.group.name,
			publicToken: cg.group.publicToken,
			participantCount: cg.group._count.participants,
			periodCount: cg.group._count.periods,
			hasActivePeriod: cg.group.periods.length > 0,
			joinedAt: cg.joinedAt,
			createdAt: cg.group.createdAt,
		}))

		return apiSuccess(groups)
	} catch (error) {
		return apiError(error)
	}
}

/**
 * POST /api/v1/groups
 * Create a new group
 */
export async function POST(request: NextRequest) {
	try {
		const session = await requireAuth()

		// Rate limit: 30 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.write(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		let body
		try {
			body = await request.json()
		} catch (err) {
			logger.error({ err }, 'Failed to parse JSON in request body')
			throw new ValidationError('Invalid JSON in request body')
		}
		const validation = validateInput(createGroupSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
		}

		const { name } = validation.data

		// Generate unique public token for group access
		let publicToken = generatePublicToken()

		// Retry up to 5 times in case of rare token collision
		let attempts = 0
		while (attempts < 5) {
			const existing = await prisma.group.findUnique({
				where: { publicToken },
			})
			if (!existing) break
			publicToken = generatePublicToken()
			attempts++
		}
		if (attempts >= 5) {
			throw new Error('Failed to generate unique public token after multiple attempts')
		}

		// Create group and coordinator-group relationship atomically
		// This ensures both records are created together or neither
		const group = await prisma.$transaction(async (tx) => {
			const newGroup = await tx.group.create({
				data: {
					name: name.trim(),
					publicToken,
				},
			})

			await tx.coordinatorGroup.create({
				data: {
					coordinatorId: session.user.id,
					groupId: newGroup.id,
				},
			})

			return newGroup
		})

		return apiSuccess(
			{
				id: group.id,
				name: group.name,
				publicToken: group.publicToken,
				createdAt: group.createdAt,
			},
			201,
		)
	} catch (error) {
		return apiError(error)
	}
}
