'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CreatePeriodButtonProps {
	groupId: string
	hasActivePeriod: boolean
}

export function CreatePeriodButton({ groupId, hasActivePeriod }: CreatePeriodButtonProps) {
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (hasActivePeriod) {
			e.preventDefault()
			toast.warning('Periode aktif masih berlangsung', {
				description: 'Kunci periode aktif terlebih dahulu sebelum membuat periode baru.',
			})
		}
	}

	return (
		<Link
			href={`/groups/${groupId}/periods/new`}
			onClick={handleClick}
			className='flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3.5 text-white font-semibold shadow-sm transition hover:bg-primary/90 mb-6'>
			<Plus className='h-5 w-5' />
			<span>Tambah Periode Baru</span>
		</Link>
	)
}
