'use client'

import { motion } from 'motion/react'

interface PageEntranceProps {
	children: React.ReactNode
	className?: string
}

export function PageEntrance({ children, className }: PageEntranceProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: 'easeOut' }}
			className={className}>
			{children}
		</motion.div>
	)
}
