'use client'

import { type JuzParticipantPeriod, JuzProgressList } from '@/components/periods/juz-progress-list'
import { LockPeriodButton } from '@/components/periods/lock-period-button'
import { ShareButton } from '@/components/periods/share-button'

interface Period {
	id: string
	periodNumber: number
	startDate: Date
	endDate: Date
	status: string
	group: {
		id: string
		name: string
		publicToken: string
		coordinatorGroups: Array<{
			coordinator: {
				id: string
				name: string | null
			}
		}>
	}
	participantPeriods: JuzParticipantPeriod[]
}

interface PeriodProgressListProps {
	period: Period
	isActive: boolean
	notFinishedCount: number
}

/** Coordinator view: the shared juz list plus the share and lock actions. */
export function PeriodProgressList({ period, isActive, notFinishedCount }: PeriodProgressListProps) {
	return (
		<JuzProgressList
			participantPeriods={period.participantPeriods}
			editable={isActive}
			showMissedFilter={!isActive}
			actions={
				<>
					<ShareButton
						period={period}
						groupName={period.group.name}
						publicToken={period.group.publicToken}
						coordinators={period.group.coordinatorGroups.map((cg) => cg.coordinator)}
					/>
					<div>{isActive && <LockPeriodButton periodId={period.id} notFinishedCount={notFinishedCount} />}</div>
				</>
			}
		/>
	)
}
