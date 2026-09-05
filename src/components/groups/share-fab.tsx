'use client'

import { CopyTokenButton } from '@/components/groups/copy-token-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExternalLink, Share2 } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

interface ShareFabProps {
	publicUrl: string
	publicToken: string
}

export function ShareFab({ publicUrl, publicToken }: ShareFabProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<motion.button
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.2 }}
					whileHover={{ scale: 1.08 }}
					whileTap={{ scale: 0.92 }}
					className='fixed bottom-5 right-5 rounded-full bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors'
					aria-label='Bagikan tautan publik'>
					<Share2 className='h-6 w-6' />
				</motion.button>
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
						aria-label='Buka tampilan publik'>
						<ExternalLink className='h-4 w-4' />
					</Link>
				</div>
			</DialogContent>
		</Dialog>
	)
}
