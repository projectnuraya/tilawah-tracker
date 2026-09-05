import type { Variants } from 'motion/react'

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.22, 1, 0.36, 1],
		},
	},
}

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: [0.22, 1, 0.36, 1],
		},
	},
}

export const scaleUp: Variants = {
	hidden: { opacity: 0, scale: 0.94 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.7,
			ease: [0.22, 1, 0.36, 1],
		},
	},
}

export const staggerContainer = (staggerTime = 0.1, delayTime = 0): Variants => ({
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: staggerTime,
			delayChildren: delayTime,
		},
	},
})

export const defaultViewport = {
	once: true,
	margin: '-50px',
}
