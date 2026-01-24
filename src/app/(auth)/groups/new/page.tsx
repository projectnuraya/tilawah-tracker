'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
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

			const data = await response.json()

			if (!data.success) {
				setError(data.error?.message || 'Failed to create group')
				return
			}

			router.push(`/groups/${data.data.id}`)
		} catch {
			setError('An unexpected error occurred')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div>
			{/* Back Button */}
			<Link
				href='/dashboard'
				className='inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground mb-6'>
				<ArrowLeft className='h-4 w-4' />
				Kembali ke Dashboard
			</Link>

			<div className='max-w-md'>
				<h1 className='text-2xl font-semibold mb-2'>Buat Grup Baru</h1>
				<p className='text-muted-foreground text-base mb-6'>Mulai grup tilawah baru untuk komunitas Anda.</p>

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
							className='w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
							disabled={isLoading}
							autoFocus
						/>
						{error && <p className='mt-2 text-base text-destructive'>{error}</p>}
					</div>

					<div className='pt-2'>
						<button
							type='submit'
							disabled={isLoading}
							className='w-full rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
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
