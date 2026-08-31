'use client'

import { BackButton } from '@/components/ui/back-button'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { PageHeader } from '@/components/ui/page-header'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewGroupPage() {
	const router = useRouter()
	const [name, setName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (!name.trim()) {
			setError('Group name is required')
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch('/api/v1/groups', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: name.trim() }),
			})

			let data
			try {
				data = await response.json()
			} catch (err) {
				console.error('Failed to parse JSON response:', err)
				setError('Invalid response from server')
				return
			}

			if (!data.success) {
				setError(data.error?.message || 'Failed to create group')
				return
			}

			router.replace(`/groups/${data.data.id}`)
		} catch {
			setError('An unexpected error occurred')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div>
			<BreadcrumbNav
				items={[
					{ label: 'Dashboard', href: '/dashboard' },
					{ label: 'Grup Baru', href: '#', current: true },
				]}
			/>

			<BackButton href='/dashboard' label='Kembali ke Dashboard' className='mb-6' />

			<div className='max-w-md'>
				<PageHeader title='Buat Grup Baru' description='Mulai grup tilawah baru untuk komunitas Anda.' />

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label htmlFor='name' className='block text-base font-medium mb-2'>
							Nama Grup
						</label>
						<input
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='contoh: Keluarga Besar Bani Adam'
							className='w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
							disabled={isLoading}
							autoFocus
						/>
						{error && <p className='mt-2 text-base text-destructive'>{error}</p>}
					</div>

					<div className='pt-2'>
						<button
							type='submit'
							disabled={isLoading}
							className='w-full rounded-lg bg-primary px-4 py-3 text-primary-foreground font-medium shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isLoading ? (
								<span className='inline-flex items-center gap-2'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Membuat...
								</span>
							) : (
								'Buat Grup'
							)}
						</button>
					</div>
				</form>

				<p className='mt-6 text-sm text-muted-foreground'>
					Link publik akan dibuat secara otomatis. Anda dapat membagikan link ini kepada peserta untuk akses baca saja.
				</p>
			</div>
		</div>
	)
}
