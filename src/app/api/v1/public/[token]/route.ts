import { apiError, apiSuccess } from '@/components/lib/auth-utils'
import { getPublicGroupPeriods, getPublicGroupWithActivePeriod } from '@/components/lib/public-utils'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ token: string }>
}

/**
 * GET /api/v1/public/[token]
 * Public read-only access to group overview
 * Returns group info, current active period progress, and list of all periods
 * No authentication required - token grants access
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { token } = await params

		// Rate limit: 60 requests per minute (IP-based for public endpoints)
		const identifier = getIdentifier(request)
		const rateLimitResult = await rateLimit.public(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		// Get group with active period using helper
		const { group, activePeriod } = await getPublicGroupWithActivePeriod(token)

		// Get all periods for the group
		const { periods } = await getPublicGroupPeriods(token)

		return apiSuccess({
			group,
			activePeriod,
			periods,
		})
	} catch (error) {
		return apiError(error)
	}
}
