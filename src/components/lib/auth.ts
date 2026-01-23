import { prisma } from '@/components/lib/db'
import { logger } from '@/components/lib/logger'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/auth/signin',
		error: '/auth/signin',
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			httpOptions: {
				timeout: 10000, // Increase to 10 seconds
			},
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			// Verify user has email and OAuth account data
			if (!user.email || !account) {
				logger.error('Sign in attempt with no email or account')
				return false
			}

			// Pre-approval check: coordinator must be registered in the users table first
			// This prevents unauthorized signups - only invited coordinators can access the app
			const existingUser = await prisma.user.findUnique({
				where: {
					email: user.email,
				},
			})

			if (!existingUser) {
				logger.warn('Sign in rejected for unauthorized coordinator')
				return false
			}

			// Manually create Account record if OAuth account is new
			// Prevents "OAuthAccountNotLinked" error when linking Google to existing user
			const existingAccount = await prisma.account.findUnique({
				where: {
					provider_providerAccountId: {
						provider: account.provider,
						providerAccountId: account.providerAccountId,
					},
				},
			})

			if (!existingAccount) {
				await prisma.account.create({
					data: {
						userId: existingUser.id,
						type: account.type,
						provider: account.provider,
						providerAccountId: account.providerAccountId,
						refresh_token: account.refresh_token,
						access_token: account.access_token,
						expires_at: account.expires_at,
						token_type: account.token_type,
						scope: account.scope,
						id_token: account.id_token,
						session_state: account.session_state,
					},
				})
				logger.info('Created Account record for coordinator')
			}

			logger.info('Sign in allowed for coordinator')
			return true
		},
		async session({ token, session }) {
			// Inject user id from JWT token into session for client-side access
			if (token) {
				session.user.id = token.id as string
				session.user.name = token.name
				session.user.email = token.email
				session.user.image = token.picture
			}

			return session
		},
		async jwt({ token, user }) {
			// Populate JWT token with user data from database
			// Called on first sign in and on each token refresh
			const dbUser = await prisma.user.findFirst({
				where: {
					email: token.email,
				},
			})

			if (!dbUser) {
				if (user) {
					token.id = user.id
				}
				return token
			}

			// Return token with user data for session injection
			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
			}
		},
	},
}
