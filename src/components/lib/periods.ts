import { prisma } from '@/components/lib/db'
import { emptyStatusCounts, isProgressStatus, type StatusCounts } from '@/components/lib/status'

/**
 * Counts for a set of periods in one query.
 *
 * The public overview and the coordinator's period list both used to run a groupBy per period
 * inside a Promise.all — up to 52 round trips to render one page. Grouping by periodId as well
 * collapses that into a single query.
 */
export async function countByPeriod(periodIds: string[]): Promise<Map<string, StatusCounts>> {
	const byPeriod = new Map<string, StatusCounts>(periodIds.map((id) => [id, emptyStatusCounts()]))
	if (periodIds.length === 0) return byPeriod

	const rows = await prisma.participantPeriod.groupBy({
		by: ['periodId', 'progressStatus'],
		where: { periodId: { in: periodIds } },
		_count: { progressStatus: true },
	})

	for (const row of rows) {
		const counts = byPeriod.get(row.periodId)
		if (counts && isProgressStatus(row.progressStatus)) {
			counts[row.progressStatus] += row._count.progressStatus
		}
	}
	return byPeriod
}
