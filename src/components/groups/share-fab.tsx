'use client'

import { CopyTokenButton } from '@/components/groups/copy-token-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExternalLink, Share2 } from 'lucide-react'
import Link from 'next/link'

interface ShareFabProps {
	publicUrl: string
	publicToken: string
}

export function ShareFab({ publicUrl, publicToken }: ShareFabProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					className='fixed bottom-4 right-4 rounded-full bg-primary p-4 text-primary-foreground shadow-lg hover:bg-primary/90 transition'
					title='Share public link'>
					<Share2 className='h-8 w-8' />
				</button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Link Publik</DialogTitle>
				</DialogHeader>
				<p className='text-base text-muted-foreground mb-3'>Bagikan link ini kepada peserta untuk akses baca saja.</p>
				<div className='flex items-center gap-2'>
					<input
						type='text'
						value={publicUrl}
						readOnly
						className='flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-base text-muted-foreground'
					/>
					<CopyTokenButton url={publicUrl} />
					<Link
						href={`/view/${publicToken}`}
						target='_blank'
						className='rounded-lg border border-border p-2 hover:bg-muted transition'
						title='Open public view'>
						<ExternalLink className='h-4 w-4' />
					</Link>
				</div>
			</DialogContent>
		</Dialog>
	)
}
