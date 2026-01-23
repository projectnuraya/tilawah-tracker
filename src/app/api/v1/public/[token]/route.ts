import { apiError, apiSuccess } from '@/components/lib/auth-utils'
import { getPublicGroupPeriods, getPublicGroupWithActivePeriod } from '@/components/lib/public-utils'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ token: string }>
}

/**
 * GET /api/v1/public/[token]
 * Get public group overview with active period and all periods
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { token } = await params

		// Get group with active period
		const { group, activePeriod } = await getPublicGroupWithActivePeriod(token)

		// Get all periods
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
