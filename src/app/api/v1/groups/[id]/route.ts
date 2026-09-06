import {
	apiError,
	apiSuccess,
	NotFoundError,
	parseJsonBody,
	requireAuth,
	requireGroupAccess,
	ValidationError,
} from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { updateGroupSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * GET /api/v1/groups/[id]
 * Get group details including all coordinators and stats
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		// Rate limit: 100 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.read(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		await requireGroupAccess(session.user.id, id)

		const group = await prisma.group.findUnique({
			where: { id },
			include: {
				coordinatorGroups: {
					include: {
						coordinator: {
							select: {
								id: true,
								name: true,
								email: true,
								image: true,
							},
						},
					},
				},
				_count: {
					select: {
						participants: {
							where: { isActive: true },
						},
						periods: true,
					},
				},
				periods: {
					orderBy: { periodNumber: 'desc' },
					take: 1,
				},
			},
		})

		if (!group) {
			throw new NotFoundError('Grup tidak ditemukan.')
		}

		return apiSuccess({
			id: group.id,
			name: group.name,
			publicToken: group.publicToken,
			participantCount: group._count.participants,
			periodCount: group._count.periods,
			latestPeriod: group.periods[0] || null,
			coordinators: group.coordinatorGroups.map((cg) => cg.coordinator),
			createdAt: group.createdAt,
			updatedAt: group.updatedAt,
		})
	} catch (error) {
		return apiError(error)
	}
}

/**
 * PATCH /api/v1/groups/[id]
 * Update group name (only coordinator can update their group)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		// Rate limit: 30 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.write(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		await requireGroupAccess(session.user.id, id)

		const body = await parseJsonBody(request)
		const validation = validateInput(updateGroupSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message, validation.error.details)
		}

		const { name } = validation.data
		const group = await prisma.group.update({
			where: { id },
			data: { name: name?.trim() },
		})

		return apiSuccess({
			id: group.id,
			name: group.name,
			publicToken: group.publicToken,
			updatedAt: group.updatedAt,
		})
	} catch (error) {
		return apiError(error)
	}
}

/**
 * DELETE /api/v1/groups/[id]
 * Delete a group - cascades to periods, participants, and all related data
 * Prevents orphaned data in the database
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		// Rate limit: 30 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.write(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		await requireGroupAccess(session.user.id, id)

		await prisma.group.delete({
			where: { id },
		})

		return apiSuccess({ deleted: true })
	} catch (error) {
		return apiError(error)
	}
}
