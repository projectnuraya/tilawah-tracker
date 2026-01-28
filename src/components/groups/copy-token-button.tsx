'use client'

import { logger } from '@/components/lib/logger'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface CopyTokenButtonProps {
	url: string
}

export function CopyTokenButton({ url }: CopyTokenButtonProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			// If URL doesn't start with http, prepend window.location.origin
			const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
			await navigator.clipboard.writeText(fullUrl)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			logger.error({ err }, 'Failed to copy URL to clipboard')
		}
	}

	return (
		<button
			onClick={handleCopy}
			className='rounded-lg border border-border p-2 hover:bg-muted transition'
			title={copied ? 'Tersalin!' : 'Salin tautan'}>
			{copied ? <Check className='h-4 w-4 text-primary' /> : <Copy className='h-4 w-4' />}
		</button>
	)
}
