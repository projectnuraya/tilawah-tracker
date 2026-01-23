import { apiError, apiSuccess, ForbiddenError, NotFoundError, requireAuth, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { updateParticipantSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * Helper to check coordinator has access to participant's group
 */
async function getParticipantWithAccess(coordinatorId: string, participantId: string) {
	const participant = await prisma.participant.findUnique({
		where: { id: participantId },
		include: {
			group: {
				include: {
					coordinatorGroups: {
						where: { coordinatorId },
					},
				},
			},
		},
	})

	if (!participant) {
		throw new NotFoundError('Participant not found')
	}

	if (participant.group.coordinatorGroups.length === 0) {
		throw new ForbiddenError("You don't have access to this participant")
	}

	return participant
}

/**
 * GET /api/v1/participants/[id]
 * Get participant details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		const participant = await getParticipantWithAccess(session.user.id, id)

		return apiSuccess({
			id: participant.id,
			groupId: participant.groupId,
			name: participant.name,
			whatsappNumber: participant.whatsappNumber,
			isActive: participant.isActive,
			createdAt: participant.createdAt,
			updatedAt: participant.updatedAt,
		})
	} catch (error) {
		return apiError(error)
	}
}

/**
 * PATCH /api/v1/participants/[id]
 * Update participant details
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		await getParticipantWithAccess(session.user.id, id)

		const body = await request.json()
		const validation = validateInput(updateParticipantSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
		}

		const { name, whatsappNumber, isActive } = validation.data

		const updateData: {
			name?: string
			whatsappNumber?: string | null
			isActive?: boolean
		} = {}

		// Set name if provided
		if (name !== undefined) {
			updateData.name = name.trim()
		}

		// Set WhatsApp number if provided
		if (whatsappNumber !== undefined) {
			if (whatsappNumber === null || whatsappNumber === '') {
				updateData.whatsappNumber = null
			} else {
				let cleaned = whatsappNumber.trim().replace(/[^\d+]/g, '')
				if (cleaned.length > 0 && !cleaned.startsWith('+')) {
					cleaned = '+' + cleaned
				}
				updateData.whatsappNumber = cleaned || null
			}
		}

		// Set isActive if provided
		if (isActive !== undefined) {
			updateData.isActive = isActive
		}

		const updated = await prisma.participant.update({
			where: { id },
			data: updateData,
		})

		return apiSuccess(updated)
	} catch (error) {
		return apiError(error)
	}
}

/**
 * DELETE /api/v1/participants/[id]
 * Deactivate participant (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		await getParticipantWithAccess(session.user.id, id)

		// Soft delete - mark as inactive
		await prisma.participant.update({
			where: { id },
			data: { isActive: false },
		})

		return apiSuccess({ deactivated: true })
	} catch (error) {
		return apiError(error)
	}
}
