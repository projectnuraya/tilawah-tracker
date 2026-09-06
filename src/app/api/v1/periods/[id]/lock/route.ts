import { apiError, apiSuccess, getPeriodWithAccess, requireAuth, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { countByStatus, PERIOD_STATUS, PROGRESS } from '@/components/lib/status'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * POST /api/v1/periods/[id]/lock
 * Lock a period - marks it as immutable and auto-marks all unfinished as "missed"
 * Once locked, no progress or juz changes can be made. Preserves historical data.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id } = await params

		// Rate limit: 30 requests per minute — locking is irreversible
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.write(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		const period = await getPeriodWithAccess(session.user.id, id)

		// Cannot lock an already locked period
		if (period.status === PERIOD_STATUS.locked) {
			throw new ValidationError('Periode ini sudah terkunci.')
		}

		// Lock period and auto-mark all incomplete as "missed" in a transaction
		// This ensures consistency and auto-calculates missed streaks
		const lockedPeriod = await prisma.$transaction(async (tx) => {
			// Auto-mark participants who didn't finish as "missed"
			// This is recorded in the missed streak for future period rotations
			await tx.participantPeriod.updateMany({
				where: {
					periodId: id,
					progressStatus: PROGRESS.notFinished,
				},
				data: {
					progressStatus: PROGRESS.missed,
				},
			})

			// Lock the period - no further updates allowed
			return tx.period.update({
				where: { id },
				data: {
					status: PERIOD_STATUS.locked,
					lockedAt: new Date(),
				},
			})
		})

		// Get updated stats for response
		const stats = await prisma.participantPeriod.groupBy({
			by: ['progressStatus'],
			where: { periodId: id },
			_count: { progressStatus: true },
		})
		const statusCounts = countByStatus(stats)

		return apiSuccess({
			id: lockedPeriod.id,
			status: lockedPeriod.status,
			lockedAt: lockedPeriod.lockedAt,
			statusCounts,
		})
	} catch (error) {
		return apiError(error)
	}
}
