import { apiError, apiSuccess, NotFoundError, requireAuth, requireGroupAccess, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { updateGroupSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * GET /api/v1/groups/[id]
 * Get group details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

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
			throw new NotFoundError('Group not found')
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
 * Update group name
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		await requireGroupAccess(session.user.id, id)

		const body = await request.json()
		const validation = validateInput(updateGroupSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
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
 * Delete a group (cascades to all related data)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		await requireGroupAccess(session.user.id, id)

		await prisma.group.delete({
			where: { id },
		})

		return apiSuccess({ deleted: true })
	} catch (error) {
		return apiError(error)
	}
}
