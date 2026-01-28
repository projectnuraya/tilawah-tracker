import {
	apiError,
	apiSuccess,
	NotFoundError,
	requireAuth,
	requireGroupAccess,
	ValidationError,
} from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { logger } from '@/components/lib/logger'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { updateJuzSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

/**
 * PATCH /api/v1/progress/[id]/juz
 * Change the juz assignment for a participant in an active period
 * Only allowed for active (non-locked) periods
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await requireAuth()
		const { id } = await params

		// Rate limit: 100 requests per minute (same as progress updates)
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.progress(identifier)

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
		const validation = validateInput(updateJuzSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
		}

		const { juzNumber } = validation.data

		// Get the participant period record with period and group info for access check
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

		// Verify coordinator access to the group
		await requireGroupAccess(session.user.id, participantPeriod.period.groupId)

		// Cannot change juz for locked periods (immutable history)
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
