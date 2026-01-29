import { apiError, apiSuccess, ForbiddenError, NotFoundError, requireAuth, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { logger } from '@/components/lib/logger'
import { updateParticipantSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * Helper to verify coordinator has access to a participant
 * Checks the participant's group's coordinatorGroups relationship
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
 * Update participant details (name, WhatsApp number, active status)
 * Coordinator can edit and deactivate participants here or via DELETE
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		await getParticipantWithAccess(session.user.id, id)

		let body
		try {
			body = await request.json()
		} catch (err) {
			logger.error({ err }, 'Failed to parse JSON in request body')
			throw new ValidationError('Invalid JSON in request body')
		}
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

		// Update name if provided
		if (name !== undefined) {
			const trimmedName = name.trim()
			// Check if another participant in the same group has the same name
			const currentParticipant = await prisma.participant.findUnique({
				where: { id },
				select: { groupId: true },
			})

			if (currentParticipant) {
				const existing = await prisma.participant.findFirst({
					where: {
						groupId: currentParticipant.groupId,
						name: {
							equals: trimmedName,
							mode: 'insensitive',
						},
						id: { not: id }, // Exclude current participant
					},
					select: { id: true },
				})

				if (existing) {
					throw new ValidationError(`Peserta dengan nama "${trimmedName}" sudah ada di grup ini`)
				}
			}

			updateData.name = trimmedName
		}

		// Normalize and update WhatsApp number if provided
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

		// Update active status if provided
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
 * Deactivate participant (soft delete via isActive flag)
 * Preserves historical data (periods, progress) for reporting
 * Can be reactivated via PATCH if needed
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		await getParticipantWithAccess(session.user.id, id)

		// Soft delete - mark as inactive instead of hard delete
		// This preserves historical data for archived periods
		await prisma.participant.update({
			where: { id },
			data: { isActive: false },
		})

		return apiSuccess({ deactivated: true })
	} catch (error) {
		return apiError(error)
	}
}
