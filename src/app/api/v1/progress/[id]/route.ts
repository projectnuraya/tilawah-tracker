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
import { updateProgressSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

/**
 * PATCH /api/v1/progress/[id]
 * Update participant's progress for a juz (finished, not_finished, or missed)
 * Automatically resets missed streak when participant completes their juz
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await requireAuth()
		const { id } = await params

		// Rate limit: 100 requests per minute (active tracking sessions)
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.progress(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		let body
		try {
			body = await request.json()
		} catch (err) {
			logger.error({ err }, 'Failed to parse JSON in update progress request body')
			throw new ValidationError('Invalid JSON in update progress request body')
		}
		const validation = validateInput(updateProgressSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
		}

		const { status } = validation.data

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

		// Cannot update progress for locked periods (immutable)
		if (participantPeriod.period.status === 'locked') {
			throw new ValidationError('Cannot update progress for a locked period')
		}

		// Update progress status and reset streak if completed
		// Streak tracks consecutive missed weeks - resets to 0 when participant finishes
		const updated = await prisma.participantPeriod.update({
			where: { id },
			data: {
				progressStatus: status,
				...(status === 'finished' && { missedStreak: 0 }),
			},
		})

		return apiSuccess(updated)
	} catch (error) {
		return apiError(error)
	}
}
