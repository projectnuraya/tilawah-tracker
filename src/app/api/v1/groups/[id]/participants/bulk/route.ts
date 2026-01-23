import { apiError, apiSuccess, requireAuth, requireGroupAccess, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
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

		await requireGroupAccess(session.user.id, groupId)

		const body = await request.json()
		const validation = validateInput(createParticipantBulkSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
		}

		const { participants } = validation.data

		// Get active period if exists
		const activePeriod = await prisma.period.findFirst({
			where: {
				groupId,
				status: 'active',
			},
			include: {
				participantPeriods: true,
			},
		})

		// Create participants and assign juz if active period exists
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

			// If active period exists, auto-assign juz
			if (activePeriod) {
				// Count current assignments per juz
				const juzCounts = new Map<number, number>()
				for (let i = 1; i <= 30; i++) {
					juzCounts.set(i, 0)
				}

				for (const pp of activePeriod.participantPeriods) {
					juzCounts.set(pp.juzNumber, (juzCounts.get(pp.juzNumber) || 0) + 1)
				}

				// Assign each new participant to the juz with least assignments
				for (const participant of newParticipants) {
					// Find juz with minimum count
					let minJuz = 1
					let minCount = juzCounts.get(1) || 0

					for (let juz = 2; juz <= 30; juz++) {
						const count = juzCounts.get(juz) || 0
						if (count < minCount) {
							minCount = count
							minJuz = juz
						}
					}

					// Create participant period
					await tx.participantPeriod.create({
						data: {
							participantId: participant.id,
							periodId: activePeriod.id,
							juzNumber: minJuz,
							progressStatus: 'not_finished',
						},
					})

					// Update count
					juzCounts.set(minJuz, minCount + 1)
				}
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
