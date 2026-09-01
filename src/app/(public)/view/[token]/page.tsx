import { getPublicGroupPeriods, getPublicGroupWithActivePeriod } from '@/components/lib/public-utils'
import { PublicPeriodCard } from '@/components/public/public-period-card'
import { AlertCircle, Calendar } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	try {
		const { token } = await params
		const { group } = await getPublicGroupWithActivePeriod(token)
		return {
			title: `${group.name} - Tilawah Tracker`,
			description: `Progress tilawah grup ${group.name}`,
		}
	} catch {
		return {
			title: 'Grup Tidak Ditemukan - Tilawah Tracker',
		}
	}
}

export default async function PublicGroupPage({ params }: PageProps) {
	const { token } = await params

	// Fetch data and handle errors before JSX construction
	let group, activePeriod, periods
	try {
		const groupData = await getPublicGroupWithActivePeriod(token)
		const periodsData = await getPublicGroupPeriods(token)
		group = groupData.group
		activePeriod = groupData.activePeriod
		periods = periodsData.periods
	} catch {
		notFound()
	}

	const lockedPeriods = periods

	return (
		<div className='min-h-screen bg-background'>
			<div>
				{/* Header */}
				<div className='mb-8 text-center'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4'>
						<Calendar className='h-8 w-8 text-primary' />
					</div>
					<h1 className='text-3xl font-bold mb-2'>{group.name}</h1>
					<p className='text-muted-foreground'>Progress Tilawah Grup</p>
				</div>

				{/* Info Banner */}
				<div className='rounded-lg border border-info/30 bg-info-bg p-4 mb-6'>
					<div className='flex gap-3'>
						<AlertCircle className='h-5 w-5 text-info-bg-foreground shrink-0 mt-0.5' aria-hidden='true' />
						<div className='text-base text-info-bg-foreground'>
							<p className='font-medium mb-1'>Tampilan Publik</p>
							<p>
								Halaman ini menampilkan progress tilawah grup secara real-time. Hanya koordinator yang dapat
								mengedit data.
							</p>
						</div>
					</div>
				</div>

				{/* Active Period */}
				{activePeriod ? (
					<div className='mb-8'>
						<h2 className='text-xl font-semibold mb-4'>Periode Aktif</h2>
						<PublicPeriodCard period={activePeriod} token={token} />
					</div>
				) : (
					<div className='rounded-xl border border-border bg-card p-8 text-center mb-8'>
						<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
							<Calendar className='h-8 w-8 text-muted-foreground' />
						</div>
						<h2 className='text-xl font-medium mb-2'>Tidak Ada Periode Aktif</h2>
						<p className='text-muted-foreground text-sm'>Koordinator belum memulai periode tilawah untuk grup ini.</p>
					</div>
				)}

				{/* Period History */}
				{lockedPeriods.length > 0 && (
					<div>
						<h2 className='text-xl font-semibold mb-4'>Riwayat Periode</h2>
						<div className='space-y-3'>
							{lockedPeriods.map((period) => (
								<PublicPeriodCard key={period.id} period={period} token={token} />
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{!activePeriod && lockedPeriods.length === 0 && (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
							<Calendar className='h-8 w-8 text-muted-foreground' />
						</div>
						<h2 className='text-xl font-medium mb-2'>Belum Ada Periode</h2>
						<p className='text-muted-foreground text-base'>
							Koordinator belum membuat periode tilawah untuk grup ini.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
