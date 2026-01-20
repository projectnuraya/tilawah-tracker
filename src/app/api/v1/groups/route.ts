import { apiError, apiSuccess, requireAuth } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { generatePublicToken } from '@/components/lib/tokens'
import { NextRequest } from 'next/server'

/**
 * GET /api/v1/groups
 * List all groups for the authenticated coordinator
 */
export async function GET() {
	try {
		const session = await requireAuth()

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

		const body = await request.json()
		const { name } = body

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return apiError({
				name: 'ValidationError',
				message: 'Group name is required',
			})
		}

		if (name.trim().length > 255) {
			return apiError({
				name: 'ValidationError',
				message: 'Group name must be less than 255 characters',
			})
		}

		// Generate unique public token
		let publicToken = generatePublicToken()

		// Ensure token is unique (extremely rare collision case)
		let attempts = 0
		while (attempts < 5) {
			const existing = await prisma.group.findUnique({
				where: { publicToken },
			})
			if (!existing) break
			publicToken = generatePublicToken()
			attempts++
		}

		// Create group and coordinator-group relationship in transaction
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
