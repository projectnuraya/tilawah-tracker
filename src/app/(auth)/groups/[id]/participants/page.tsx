import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { ParticipantsList } from '@/components/participants/participants-list'
import { ArrowLeft, Plus } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
	params: Promise<{ id: string }>
}

async function getGroupWithParticipants(userId: string, groupId: string) {
	const access = await prisma.coordinatorGroup.findUnique({
		where: {
			coordinatorId_groupId: {
				coordinatorId: userId,
				groupId,
			},
		},
	})

	if (!access) {
		return null
	}

	const group = await prisma.group.findUnique({
		where: { id: groupId },
		include: {
			participants: {
				orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
			},
			periods: {
				where: { status: 'active' },
				take: 1,
				include: {
					participantPeriods: true,
				},
			},
		},
	})

	return group
}

export default async function ParticipantsPage({ params }: PageProps) {
	const session = await getServerSession(authOptions)
	if (!session) {
		redirect('/auth/signin')
	}

	const { id } = await params
	const group = await getGroupWithParticipants(session.user.id, id)

	if (!group) {
		notFound()
	}

	const activePeriod = group.periods[0]
	let activeParticipants = group.participants.filter((p) => p.isActive)
	const inactiveParticipants = group.participants.filter((p) => !p.isActive)

	// Map participant to their juz and participantPeriodId in active period
	const participantDataMap = new Map<string, { juzNumber: number; participantPeriodId: string }>()
	if (activePeriod) {
		for (const pp of activePeriod.participantPeriods) {
			participantDataMap.set(pp.participantId, {
				juzNumber: pp.juzNumber,
				participantPeriodId: pp.id,
			})
		}

		// Sort by Juz first, then by Name
		activeParticipants = activeParticipants.sort((a, b) => {
			const aData = participantDataMap.get(a.id)
			const bData = participantDataMap.get(b.id)

			// If both have juz assignments
			if (aData && bData) {
				if (aData.juzNumber !== bData.juzNumber) {
					return aData.juzNumber - bData.juzNumber
				}
				return a.name.localeCompare(b.name)
			}

			// Participants without juz come last
			if (aData && !bData) return -1
			if (!aData && bData) return 1

			// Both without juz, sort by name
			return a.name.localeCompare(b.name)
		})
	}

	return (
		<div>
			{/* Back Button */}
			<Link
				href={`/groups/${group.id}`}
				className='inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground mb-6'>
				<ArrowLeft className='h-4 w-4' />
				Kembali ke {group.name}
			</Link>

			{/* Header */}
			<div className='mb-6'>
				<div>
					<h1 className='text-2xl font-semibold'>Peserta</h1>
					<p className='text-muted-foreground text-base mt-1'>{activeParticipants.length} peserta aktif</p>
				</div>
			</div>

			{/* Add Participant Button */}
			<Link
				href={`/groups/${group.id}/participants/new`}
				className='flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3.5 text-white font-semibold shadow-sm transition hover:bg-primary/90 mb-6'>
				<Plus className='h-5 w-5' />
				<span>Tambah Peserta</span>
			</Link>

			<ParticipantsList
				groupId={group.id}
				activeParticipants={activeParticipants}
				inactiveParticipants={inactiveParticipants}
				activePeriod={!!activePeriod}
				participantDataMap={participantDataMap}
			/>
		</div>
	)
}
