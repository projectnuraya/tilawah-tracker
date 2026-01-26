'use client'

import { BackButton } from '@/components/ui/back-button'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageProps {
	params: Promise<{ id: string }>
}

function getNextMonday(): string {
	const today = new Date()
	const dayOfWeek = today.getDay()
	const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7
	const nextMonday = new Date(today)
	nextMonday.setDate(today.getDate() + daysUntilMonday)
	return nextMonday.toISOString().split('T')[0]
}

function isMonday(dateString: string): boolean {
	const date = new Date(dateString)
	return date.getDay() === 1
}

export default function NewPeriodPage({ params }: PageProps) {
	const router = useRouter()
	const [groupId, setGroupId] = useState<string | null>(null)
	const [startDate, setStartDate] = useState(getNextMonday())
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [dateError, setDateError] = useState('')

	useEffect(() => {
		params.then(({ id }) => setGroupId(id))
	}, [params])

	const handleDateChange = (value: string) => {
		setStartDate(value)
		if (value && !isMonday(value)) {
			setDateError('Periode harus dimulai pada hari Senin')
		} else {
			setDateError('')
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (!startDate) {
			setError('Tanggal mulai wajib diisi')
			return
		}

		if (!isMonday(startDate)) {
			setError('Periode harus dimulai pada hari Senin')
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch(`/api/v1/groups/${groupId}/periods`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ startDate }),
			})

			const data = await response.json()

			if (!data.success) {
				setError(data.error?.message || 'Gagal membuat periode')
				return
			}

			router.push(`/groups/${groupId}/periods/${data.data.id}`)
			router.refresh()
		} catch {
			setError('Terjadi kesalahan yang tidak terduga')
		} finally {
			setIsLoading(false)
		}
	}

	// Calculate end date
	const endDate = startDate
		? (() => {
				const end = new Date(startDate)
				end.setDate(end.getDate() + 6)
				return end.toISOString().split('T')[0]
			})()
		: ''

	if (!groupId) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-6 w-6 animate-spin text-primary' />
			</div>
		)
	}

	return (
		<div>
			{/* Breadcrumb Navigation - Note: groupName would need to be fetched or passed */}
			<BreadcrumbNav
				items={[
					{ label: 'Dashboard', href: '/dashboard' },
					{ label: 'Grup', href: `/groups/${groupId}` },
					{ label: 'Periode Baru', href: '#', current: true },
				]}
			/>

			{/* Enhanced Back Button */}
			<BackButton href={`/groups/${groupId}`} label='Kembali ke Grup' className='mb-6' />

			<div className='max-w-md'>
				<h1 className='text-2xl font-semibold mb-2'>Mulai Periode Baru</h1>
				<p className='text-muted-foreground text-base mb-6'>Buat periode tilawah mingguan baru untuk grup Anda.</p>

				{/* Info Card */}
				<div className='rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6'>
					<div className='flex gap-3'>
						<AlertCircle className='h-5 w-5 text-blue-600 shrink-0 mt-0.5' />
						<div className='text-base text-blue-800'>
							<p className='font-medium mb-1'>Aturan Periode</p>
							<ul className='list-disc list-inside space-y-1 text-blue-700'>
								<li>Harus dimulai pada hari Senin</li>
								<li>Berlangsung tepat 7 hari (Senin sampai Minggu)</li>
								<li>Pembagian juz otomatis bergilir dari periode sebelumnya</li>
							</ul>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label htmlFor='startDate' className='block text-base font-medium mb-2'>
							Tanggal Mulai (Senin)
						</label>
						<div className='relative'>
							<input
								type='date'
								id='startDate'
								value={startDate}
								onChange={(e) => handleDateChange(e.target.value)}
								className={`w-full rounded-lg border ${
									dateError ? 'border-destructive' : 'border-border'
								} bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
								disabled={isLoading}
							/>
						</div>
						{dateError && <p className='mt-2 text-base text-destructive'>{dateError}</p>}
					</div>

					{startDate && !dateError && (
						<div className='rounded-lg border border-border bg-muted/50 p-4'>
							<p className='text-base font-medium mb-2'>Durasi Periode</p>
							<p className='text-base text-muted-foreground'>
								{new Date(startDate).toLocaleDateString('id-ID', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
								{' → '}
								{new Date(endDate).toLocaleDateString('id-ID', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</p>
						</div>
					)}

					{error && (
						<div className='rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3'>
							<p className='text-base text-destructive'>{error}</p>
						</div>
					)}

					<div className='pt-2'>
						<button
							type='submit'
							disabled={isLoading || !!dateError}
							className='w-full rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isLoading ? (
								<span className='inline-flex items-center gap-2'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Membuat...
								</span>
							) : (
								'Mulai Periode'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
