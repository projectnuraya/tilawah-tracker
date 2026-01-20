'use client'

import { DeleteGroupButton } from '@/components/groups/delete-group-button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageProps {
	params: Promise<{ id: string }>
}

export default function EditGroupPage({ params }: PageProps) {
	const router = useRouter()
	const [groupId, setGroupId] = useState<string | null>(null)
	const [name, setName] = useState('')
	const [originalName, setOriginalName] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		params.then(({ id }) => {
			setGroupId(id)
			fetchGroup(id)
		})
	}, [params])

	const fetchGroup = async (id: string) => {
		try {
			const response = await fetch(`/api/v1/groups/${id}`)
			const data = await response.json()

			if (data.success) {
				setName(data.data.name)
				setOriginalName(data.data.name)
			} else {
				setError('Gagal memuat grup')
			}
		} catch {
			setError('Terjadi kesalahan yang tidak terduga')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (!name.trim()) {
			setError('Nama grup wajib diisi')
			return
		}

		if (name.trim() === originalName) {
			router.push(`/groups/${groupId}`)
			return
		}

		setIsSaving(true)

		try {
			const response = await fetch(`/api/v1/groups/${groupId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: name.trim() }),
			})

			const data = await response.json()

			if (!data.success) {
				setError(data.error?.message || 'Gagal memperbarui grup')
				return
			}

			router.push(`/groups/${groupId}`)
			router.refresh()
		} catch {
			setError('Terjadi kesalahan yang tidak terduga')
		} finally {
			setIsSaving(false)
		}
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-6 w-6 animate-spin text-primary' />
			</div>
		)
	}

	return (
		<div className='flex flex-col min-h-screen'>
			{/* Back Button */}
			<Link href={`/groups/${groupId}`} className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6'>
				<ArrowLeft className='h-4 w-4' />
				Kembali ke Grup
			</Link>

			<div className='max-w-md'>
				<h1 className='text-2xl font-semibold mb-2'>Edit Grup</h1>
				<p className='text-muted-foreground text-sm mb-6'>Perbarui pengaturan grup Anda.</p>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label htmlFor='name' className='block text-sm font-medium mb-2'>
							Nama Grup
						</label>
						<input
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='e.g., Keluarga Besar Bani Adam'
							className='w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
							disabled={isSaving}
							autoFocus
						/>
						{error && <p className='mt-2 text-sm text-destructive'>{error}</p>}
					</div>

					<div className='flex gap-3 pt-2'>
						<button
							type='submit'
							disabled={isSaving}
							className='flex-1 rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isSaving ? (
								<span className='inline-flex items-center justify-center gap-2'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Menyimpan...
								</span>
							) : (
								'Simpan Perubahan'
							)}
						</button>
						<Link
							href={`/groups/${groupId}`}
							className='rounded-lg border border-border px-4 py-3 font-medium hover:bg-muted transition text-center'>
							Batal
						</Link>
					</div>
				</form>
			</div>

			{groupId && originalName && (
				<div className='mt-auto rounded-xl border border-destructive/20 bg-destructive/5 p-4'>
					<h2 className='font-medium text-destructive mb-2'>Zona Berbahaya</h2>
					<p className='text-sm text-muted-foreground mb-4'>
						Menghapus grup ini akan menghapus permanen semua peserta, periode, dan data progress.
					</p>
					<DeleteGroupButton groupId={groupId} groupName={originalName} />
				</div>
			)}
		</div>
	)
}
