import { prisma } from '@/components/lib/db'
import { logger } from '@/components/lib/logger'

/**
 * Handles demo user authentication and database setup
 * @param email - The email of the user attempting to sign in
 * @returns Promise<boolean> - Whether the demo sign in is allowed
 */
export async function handleDemoSignIn(email: string): Promise<boolean> {
	// Only allow demo sign in for the demo email
	if (email !== 'demo@example.com') {
		return false
	}

	try {
		// Check if demo user already exists
		let demoUser = await prisma.user.findUnique({
			where: { email: 'demo@example.com' },
		})

		if (!demoUser) {
			// Create demo user if it doesn't exist
			demoUser = await prisma.user.create({
				data: {
					email: 'demo@example.com',
					name: 'Demo Coordinator',
				},
			})
			logger.info('Created demo user in database')
		}

		logger.info('Demo sign in allowed')
		return true
	} catch (error) {
		logger.error(`Error handling demo sign in: ${String(error)}`)
		return false
	}
}

/**
 * Checks if demo mode is enabled
 * @returns boolean - Whether demo mode is active
 */
export function isDemoMode(): boolean {
	return process.env.NEXT_PUBLIC_IS_DEMO === 'true'
}
