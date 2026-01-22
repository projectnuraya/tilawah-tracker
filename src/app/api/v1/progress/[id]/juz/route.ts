import { apiError, apiSuccess, NotFoundError, requireAuth, requireGroupAccess, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/v1/progress/[id]/juz - Update juz assignment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await requireAuth()
		const { id } = await params

		const body = await request.json()
		const { juzNumber } = body

		// Validate juzNumber
		if (!juzNumber || typeof juzNumber !== 'number' || juzNumber < 1 || juzNumber > 30) {
			throw new ValidationError('Invalid juz number. Must be between 1 and 30')
		}

		// Get the participant period with its relations
		const participantPeriod = await prisma.participantPeriod.findUnique({
			where: { id },
			include: {
				period: {
					include: {
						group: true,
					},
				},
			},
		})

		if (!participantPeriod) {
			throw new NotFoundError('Participant period not found')
		}

		// Check ownership via CoordinatorGroup
		await requireGroupAccess(session.user.id, participantPeriod.period.groupId)

		// Check if period is locked
		if (participantPeriod.period.status === 'locked') {
			throw new ValidationError('Cannot update juz for a locked period')
		}

		// Update the juz assignment
		const updated = await prisma.participantPeriod.update({
			where: { id },
			data: { juzNumber },
		})

		return apiSuccess(updated)
	} catch (error) {
		return apiError(error)
	}
}
