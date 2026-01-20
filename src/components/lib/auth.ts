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
			// Check if user email is pre-approved in the database
			if (!user.email) {
				console.error('Sign in attempt with no email')
				return false
			}

			const existingUser = await prisma.user.findUnique({
				where: {
					email: user.email,
				},
			})

			// Only allow sign in if user already exists in database
			if (!existingUser) {
				console.log(`Sign in rejected for unauthorized email: ${user.email}`)
				return false
			}

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
