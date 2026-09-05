import { DashboardView } from '@/components/dashboard/dashboard-view'
import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { PERIOD_STATUS } from '@/components/lib/status'
import { PageHeader } from '@/components/ui/page-header'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

async function getGroups(userId: string) {
	const coordinatorGroups = await prisma.coordinatorGroup.findMany({
		where: {
			coordinatorId: userId,
		},
		include: {
			group: {
				include: {
					_count: {
						select: {
							participants: {
								where: { isActive: true },
							},
							periods: true,
						},
					},
					// Only the newest period is rendered, so don't drag the group's whole history
					// across the wire just to read its number and status.
					//
					// hasActivePeriod below reads this one row rather than scanning them all, which
					// holds because a group can only have one active period and a new one cannot be
					// started until the previous is locked — so an active period is always the newest.
					periods: {
						orderBy: { periodNumber: 'desc' },
						take: 1,
					},
				},
			},
		},
		orderBy: {
			joinedAt: 'desc',
		},
	})

	return coordinatorGroups.map((cg) => ({
		id: cg.group.id,
		name: cg.group.name,
		publicToken: cg.group.publicToken,
		participantCount: cg.group._count.participants,
		periodCount: cg.group._count.periods,
		hasActivePeriod: cg.group.periods[0]?.status === PERIOD_STATUS.active,
		latestPeriodNumber: cg.group.periods[0]?.periodNumber ?? 0,
	}))
}

export default async function DashboardPage() {
	const session = await getServerSession(authOptions)
	if (!session) {
		redirect('/auth/signin')
	}
	const groups = await getGroups(session.user.id)

	return (
		<div>
			<div className='mb-6'>
				<PageHeader title='Grup Saya' className='mb-4' />
			</div>
			<DashboardView groups={groups} />
		</div>
	)
}
