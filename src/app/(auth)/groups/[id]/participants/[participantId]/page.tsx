import { authOptions } from '@/components/lib/auth'
import { prisma } from '@/components/lib/db'
import { DeactivateButton } from '@/components/participants/deactivate-button'
import { EditParticipantForm } from '@/components/participants/edit-form'
import { ReactivateButton } from '@/components/participants/reactivate-button'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
	params: Promise<{ id: string; participantId: string }>
}

async function getParticipant(userId: string, groupId: string, participantId: string) {
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

	const participant = await prisma.participant.findUnique({
		where: { id: participantId, groupId },
		include: {
			group: {
				select: { id: true, name: true },
			},
			participantPeriods: {
				orderBy: { period: { periodNumber: 'desc' } },
				take: 5,
				include: {
					period: {
						select: {
							id: true,
							periodNumber: true,
							startDate: true,
							endDate: true,
							status: true,
						},
					},
				},
			},
		},
	})

	return participant
}

export default async function ParticipantDetailPage({ params }: PageProps) {
	const session = await getServerSession(authOptions)
	if (!session) {
		redirect('/auth/signin')
	}

	const { id, participantId } = await params
	const participant = await getParticipant(session.user.id, id, participantId)

	if (!participant) {
		notFound()
	}

	const whatsappLink = participant.whatsappNumber
		? `https://wa.me/${participant.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
				`Assalamu'alaikum ${participant.name}, ini pengingat untuk tilawah Anda.`,
			)}`
		: null

	return (
		<div className='max-w-2xl mx-auto'>
			{/* Back Button */}
			<Link
				href={`/groups/${participant.group.id}/participants`}
				className='inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground mb-6'>
				<ArrowLeft className='h-4 w-4' />
				Kembali ke Peserta
			</Link>

			<div className='max-w-md mx-auto'>
				{/* Header */}
				<div className='flex items-start justify-between mb-6'>
					<div>
						<h1 className='text-2xl font-semibold'>{participant.name}</h1>
						<p className='text-muted-foreground text-base mt-1'>
							{participant.isActive ? 'Peserta aktif' : 'Peserta tidak aktif'}
						</p>
					</div>
					{!participant.isActive && (
						<span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground'>
							Tidak Aktif
						</span>
					)}
				</div>

				{/* Edit Form */}
				<div className='rounded-xl border border-border bg-card p-4 mb-6'>
					<h2 className='font-medium mb-4'>Edit Detail</h2>
					<EditParticipantForm participant={participant} />
				</div>

				{/* WhatsApp Reminder */}
				{/* Disable for now */}
				{/* {participant.isActive && whatsappLink && (
					<div className='rounded-xl border border-border bg-card p-4 mb-6'>
						<h2 className='font-medium mb-2'>Aksi Cepat</h2>
						<a
							href={whatsappLink}
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white font-medium shadow-sm transition hover:bg-green-700'>
							<MessageCircle className='h-4 w-4' />
							Ingatkan via WhatsApp
						</a>
					</div>
				)} */}

				{/* Recent History */}
				{participant.participantPeriods.length > 0 && (
					<div className='rounded-xl border border-border bg-card p-4 mb-6'>
						<h2 className='font-medium mb-4'>Riwayat Terbaru</h2>
						<div className='space-y-3'>
							{participant.participantPeriods.map((pp) => (
								<div key={pp.id} className='flex items-center justify-between'>
									<div>
										<p className='text-xl font-medium'>Periode #{pp.period.periodNumber}</p>
										`` <p className='text-xl text-muted-foreground'>Juz {pp.juzNumber}</p>
									</div>
									<span
										className={`inline-flex items-center gap-1 text-xl ${
											pp.progressStatus === 'finished'
												? 'text-primary'
												: pp.progressStatus === 'missed'
													? 'text-destructive'
													: 'text-muted-foreground'
										}`}>
										{pp.progressStatus === 'finished' && '👑 Selesai'}
										{pp.progressStatus === 'missed' && '💔 Terlewat'}
										{pp.progressStatus === 'not_finished' && '⏳ Belum selesai'}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Deactivate / Reactivate */}
				<div className='rounded-xl border border-border bg-card p-4'>
					{participant.isActive ? (
						<>
							<h2 className='font-medium mb-2'>Nonaktifkan Peserta</h2>
							<p className='text-base text-muted-foreground mb-4'>
								Peserta yang dinonaktifkan tidak akan muncul di periode baru tetapi riwayatnya tetap tersimpan.
							</p>
							<DeactivateButton participantId={participant.id} groupId={participant.group.id} />
						</>
					) : (
						<>
							<h2 className='font-medium mb-2'>Aktifkan Kembali Peserta</h2>
							<p className='text-base text-muted-foreground mb-4'>
								Aktifkan kembali peserta ini untuk menyertakan mereka di periode mendatang.
							</p>
							<ReactivateButton participantId={participant.id} groupId={participant.group.id} />
						</>
					)}
				</div>
			</div>
		</div>
	)
}
