import { apiError, apiSuccess } from '@/components/lib/auth-utils'
import { getPublicGroupPeriods, getPublicGroupWithActivePeriod } from '@/components/lib/public-utils'
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
