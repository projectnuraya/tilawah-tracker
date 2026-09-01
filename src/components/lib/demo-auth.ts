import { prisma } from '@/components/lib/db'
import { DEMO_EMAIL } from '@/components/lib/demo-mode'
import { logger } from '@/components/lib/logger'

/**
 * Handles demo user authentication and database setup
 * @param email - The email of the user attempting to sign in
 * @returns Promise<boolean> - Whether the demo sign in is allowed
 */
export async function handleDemoSignIn(email: string): Promise<boolean> {
	// Only allow demo sign in for the demo email
	if (email !== DEMO_EMAIL) {
		return false
	}

	try {
		// Check if demo user already exists
		let demoUser = await prisma.user.findUnique({
			where: { email: DEMO_EMAIL },
		})

		if (!demoUser) {
			// Create demo user if it doesn't exist
			demoUser = await prisma.user.create({
				data: {
					email: DEMO_EMAIL,
					name: 'Demo Coordinator',
				},
			})
			logger.info('Created demo user in database')
		}

		logger.info('Demo sign in allowed')
		return true
	} catch (error) {
		logger.error({ err: error }, 'Error handling demo sign in')
		return false
	}
}
