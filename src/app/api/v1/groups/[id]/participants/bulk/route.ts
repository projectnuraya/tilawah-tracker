import { apiError, apiSuccess, requireAuth, requireGroupAccess, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { juzTally, newAssignment, takeLeastUsedJuz } from '@/components/lib/juz'
import { logger } from '@/components/lib/logger'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { PERIOD_STATUS } from '@/components/lib/status'
import { createParticipantBulkSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * POST /api/v1/groups/[id]/participants/bulk
 * Bulk create participants
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id: groupId } = await params

		// Rate limit: 5 requests per 5 minutes (500 participants max)
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.bulkParticipant(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		await requireGroupAccess(session.user.id, groupId)

		let body
		try {
			body = await request.json()
		} catch (err) {
			logger.error({ err }, 'Failed to parse JSON in request body')
			throw new ValidationError('Isi permintaan tidak valid.')
		}
		const validation = validateInput(createParticipantBulkSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message, validation.error.details)
		}

		const { participants } = validation.data

		// Check for duplicate names in the group
		const newNames = participants.map((p: { name: string }) => p.name.trim())
		const existingParticipants = await prisma.participant.findMany({
			where: {
				groupId,
				name: {
					in: newNames,
					mode: 'insensitive',
				},
			},
			select: { name: true },
		})

		if (existingParticipants.length > 0) {
			const duplicateNames = existingParticipants.map((p) => p.name).join(', ')
			throw new ValidationError(`Peserta berikut sudah ada di grup ini: ${duplicateNames}`)
		}

		// Also check for duplicates within the request itself
		const uniqueNamesInRequest = new Set(newNames.map((n: string) => n.toLowerCase()))
		if (uniqueNamesInRequest.size !== newNames.length) {
			throw new ValidationError('Terdapat nama duplikat di dalam daftar yang Anda masukkan')
		}

		// Get active period if exists - participants will be auto-assigned to juz
		const activePeriod = await prisma.period.findFirst({
			where: {
				groupId,
				status: PERIOD_STATUS.active,
			},
			include: {
				participantPeriods: true,
			},
		})

		// Create participants and assign juz in a single transaction
		// This ensures consistency: either all participants are added or none
		const createdParticipants = await prisma.$transaction(async (tx) => {
			const newParticipants = await Promise.all(
				participants.map((participant: { name: string; whatsappNumber?: string | null }) =>
					tx.participant.create({
						data: {
							groupId,
							name: participant.name.trim(),
							whatsappNumber: participant.whatsappNumber?.trim() || null,
							isActive: true,
						},
					}),
				),
			)

			// Slot the new people into the running period, spreading them over whichever juz are
			// carrying the fewest readers. takeLeastUsedJuz records each pick, so a batch fans out
			// instead of piling onto one juz.
			if (activePeriod) {
				const tally = juzTally(activePeriod.participantPeriods)
				await tx.participantPeriod.createMany({
					data: newParticipants.map((participant) =>
						newAssignment(participant.id, activePeriod.id, takeLeastUsedJuz(tally)),
					),
				})
			}

			return newParticipants
		})

		return apiSuccess({
			participants: createdParticipants,
			count: createdParticipants.length,
		})
	} catch (error) {
		return apiError(error)
	}
}
