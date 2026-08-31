'use client'

import { JuzProgressList, type JuzParticipantPeriod } from '@/components/periods/juz-progress-list'

interface PublicProgressListProps {
	participantPeriods: JuzParticipantPeriod[]
	isActive: boolean
}

/** Public view: the same juz list, read-only. WhatsApp numbers never reach this path. */
export function PublicProgressList({ participantPeriods, isActive }: PublicProgressListProps) {
	return <JuzProgressList participantPeriods={participantPeriods} showMissedFilter={!isActive} />
}
