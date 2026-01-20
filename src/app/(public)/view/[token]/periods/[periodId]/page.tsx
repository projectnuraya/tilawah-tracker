import { PublicProgressList } from '@/components/public/public-progress-list'
import { getPublicPeriodDetails } from '@/components/lib/public-utils'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
	params: Promise<{ token: string; periodId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	try {
		const { token, periodId } = await params
		const period = await getPublicPeriodDetails(token, periodId)
		return {
			title: `Periode #${period.periodNumber} - ${period.group.name}`,
			description: `Progress tilawah periode #${period.periodNumber}`,
		}
	} catch {
		return {
			title: 'Periode Tidak Ditemukan - Tilawah Tracker',
		}
	}
}

export default async function PublicPeriodDetailPage({ params }: PageProps) {
	const { token, periodId } = await params
	
	// Fetch data and handle errors before JSX construction
	let period
	try {
		period = await getPublicPeriodDetails(token, periodId)
	} catch (error) {
		notFound()
	}

	// Calculate stats
	const stats = {
		total: period.participantPeriods.length,
		finished: period.participantPeriods.filter((pp) => pp.progressStatus === 'finished').length,
		not_finished: period.participantPeriods.filter((pp) => pp.progressStatus === 'not_finished').length,
		missed: period.participantPeriods.filter((pp) => pp.progressStatus === 'missed').length,
	}

	const isActive = period.status === 'active'

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link
					href={`/view/${token}`}
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
					<ArrowLeft className="h-4 w-4" />
					Kembali ke Grup
				</Link>

				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-2xl font-semibold">Periode #{period.periodNumber}</h1>
						<span
							className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
								isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
							}`}>
							{isActive ? 'Aktif' : 'Terkunci'}
						</span>
					</div>
					<p className="text-muted-foreground text-sm mb-1">{period.group.name}</p>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						{new Date(period.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} -{' '}
						{new Date(period.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-3 gap-3 mb-8">
					<div className="rounded-lg border border-border bg-card p-4 text-center">
						<p className="text-3xl font-semibold text-primary mb-1">{stats.finished}</p>
						<p className="text-xs text-muted-foreground">👑 Selesai</p>
					</div>
					<div className="rounded-lg border border-border bg-card p-4 text-center">
						<p className="text-3xl font-semibold text-muted-foreground mb-1">{stats.not_finished}</p>
						<p className="text-xs text-muted-foreground">⏳ Dalam Proses</p>
					</div>
					<div className="rounded-lg border border-border bg-card p-4 text-center">
						<p className="text-3xl font-semibold text-destructive mb-1">{stats.missed}</p>
						<p className="text-xs text-muted-foreground">💔 Terlewat</p>
					</div>
				</div>

				{/* Progress Summary */}
				<div className="rounded-lg border border-border bg-card p-4 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">Progress Keseluruhan</p>
							<p className="text-2xl font-semibold">
								{stats.finished}/{stats.total}
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-muted-foreground mb-1">Persentase</p>
							<p className="text-2xl font-semibold text-primary">
								{stats.total > 0 ? Math.round((stats.finished / stats.total) * 100) : 0}%
							</p>
						</div>
					</div>
					{stats.total > 0 && (
						<div className="mt-4">
							<div className="w-full bg-muted rounded-full h-2.5">
								<div
									className="bg-primary h-2.5 rounded-full transition-all"
									style={{ width: `${(stats.finished / stats.total) * 100}%` }}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Progress List */}
				{period.participantPeriods.length > 0 ? (
					<PublicProgressList participantPeriods={period.participantPeriods} />
				) : (
					<div className="rounded-xl border border-border bg-card p-8 text-center">
						<div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
							<Calendar className="h-8 w-8 text-muted-foreground" />
						</div>
						<h2 className="text-lg font-medium mb-2">Tidak Ada Peserta</h2>
						<p className="text-muted-foreground text-sm">Periode ini belum memiliki peserta.</p>
					</div>
				)}

				{/* Footer */}
				<div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
					<p>Tilawah Tracker - Sistem tracking tilawah grup</p>
					<p className="mt-1">PT Nuraya Digital Nusantara</p>
				</div>
			</div>
		</div>
	)
}
