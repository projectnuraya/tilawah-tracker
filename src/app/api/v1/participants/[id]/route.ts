import { apiError, apiSuccess, ForbiddenError, NotFoundError, requireAuth, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { juzTally, newAssignment, takeLeastUsedJuz } from '@/components/lib/juz'
import { logger } from '@/components/lib/logger'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { PERIOD_STATUS } from '@/components/lib/status'
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
		throw new NotFoundError('Peserta tidak ditemukan.')
	}

	if (participant.group.coordinatorGroups.length === 0) {
		throw new ForbiddenError('Anda tidak punya akses ke peserta ini.')
	}

	return participant
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

		// Rate limit: 60 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.singleParticipant(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		const participant = await getParticipantWithAccess(session.user.id, id)

		let body
		try {
			body = await request.json()
		} catch (err) {
			logger.error({ err }, 'Failed to parse JSON in request body')
			throw new ValidationError('Isi permintaan tidak valid.')
		}
		const validation = validateInput(updateParticipantSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message, validation.error.details)
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
			const existing = await prisma.participant.findFirst({
				where: {
					groupId: participant.groupId,
					name: {
						equals: trimmedName,
						mode: 'insensitive',
					},
					id: { not: id }, // Exclude current participant
				},
				select: { id: true },
			})

			if (existing) {
				throw new ValidationError(`Peserta dengan nama "${trimmedName}" sudah ada di grup ini.`)
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

		const reactivating = isActive === true && !participant.isActive

		const updated = await prisma.$transaction(async (tx) => {
			const row = await tx.participant.update({
				where: { id },
				data: updateData,
			})

			// Adding a *new* participant during an active period assigns them a juz straight away.
			// Reactivating one did not, so they stayed invisible for the rest of the running week —
			// absent from the progress list, the stats and the WhatsApp share text — until the next
			// period rolled over. Give them the same treatment.
			if (reactivating) {
				const activePeriod = await tx.period.findFirst({
					where: { groupId: participant.groupId, status: PERIOD_STATUS.active },
					select: { id: true },
				})

				if (activePeriod) {
					const alreadyAssigned = await tx.participantPeriod.findUnique({
						where: { participantId_periodId: { participantId: id, periodId: activePeriod.id } },
						select: { id: true },
					})

					// Deactivating leaves the row in place, so someone toggled off and on again inside
					// the same period keeps their original juz rather than being reassigned.
					if (!alreadyAssigned) {
						const juzCounts = await tx.participantPeriod.groupBy({
							by: ['juzNumber'],
							where: { periodId: activePeriod.id },
							_count: { juzNumber: true },
						})

						await tx.participantPeriod.create({
							data: newAssignment(id, activePeriod.id, takeLeastUsedJuz(juzTally(juzCounts))),
						})
					}
				}
			}

			return row
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

		// Rate limit: 60 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.singleParticipant(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

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
