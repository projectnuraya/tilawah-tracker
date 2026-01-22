import { prisma } from '@/components/lib/db'
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
			// Check if user email is pre-approved in the coordinators table
			if (!user.email || !account) {
				console.error('Sign in attempt with no email or account')
				return false
			}

			const existingUser = await prisma.user.findUnique({
				where: {
					email: user.email,
				},
			})

			// Only allow sign in if email exists in coordinators table
			if (!existingUser) {
				console.log(`Sign in rejected for unauthorized email: ${user.email}`)
				return false
			}

			// Manually create Account record if it doesn't exist
			// This prevents the OAuthAccountNotLinked error
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
				console.log(`Created Account record for coordinator: ${user.email}`)
			}

			console.log(`Sign in allowed for coordinator: ${user.email}`)
			return true
		},
		async session({ token, session }) {
			if (token) {
				session.user.id = token.id as string
				session.user.name = token.name
				session.user.email = token.email
				session.user.image = token.picture
			}

			return session
		},
		async jwt({ token, user }) {
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

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
			}
		},
	},
}
