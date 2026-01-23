import { apiError, apiSuccess } from '@/components/lib/auth-utils'
import { getPublicPeriodDetails } from '@/components/lib/public-utils'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ token: string; periodId: string }>
}

/**
 * GET /api/v1/public/[token]/periods/[periodId]
 * Public read-only access to period details with full progress breakdown
 * Returns all participant progress organized by juz assignment
 * No authentication required - token grants access
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { token, periodId } = await params

		const period = await getPublicPeriodDetails(token, periodId)

		// Organize participant-periods by juz for UI display
		const byJuz: Record<number, typeof period.participantPeriods> = {}
		for (let i = 1; i <= 30; i++) {
			byJuz[i] = []
		}
		for (const pp of period.participantPeriods) {
			byJuz[pp.juzNumber].push(pp)
		}

		// Calculate progress summary stats
		const stats = {
			total: period.participantPeriods.length,
			finished: period.participantPeriods.filter((pp) => pp.progressStatus === 'finished').length,
			not_finished: period.participantPeriods.filter((pp) => pp.progressStatus === 'not_finished').length,
			missed: period.participantPeriods.filter((pp) => pp.progressStatus === 'missed').length,
		}

		return apiSuccess({
			id: period.id,
			groupId: period.groupId,
			groupName: period.group.name,
			periodNumber: period.periodNumber,
			startDate: period.startDate,
			endDate: period.endDate,
			status: period.status,
			participantPeriods: period.participantPeriods,
			byJuz,
			stats,
		})
	} catch (error) {
		return apiError(error)
	}
}
