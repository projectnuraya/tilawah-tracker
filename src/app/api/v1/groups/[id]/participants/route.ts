import {
	apiError,
	apiSuccess,
	NotFoundError,
	requireAuth,
	requireGroupAccess,
	ValidationError,
} from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
import { logger } from '@/components/lib/logger'
import { getIdentifier, rateLimit } from '@/components/lib/rate-limit'
import { createRateLimitResponse } from '@/components/lib/rate-limit-middleware'
import { createParticipantSchema, listParticipantsSchema, validateInput } from '@/components/lib/validators'
import { NextRequest } from 'next/server'

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * GET /api/v1/groups/[id]/participants
 * List all participants for a group
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id: groupId } = await params

		// Rate limit: 100 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.read(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		await requireGroupAccess(session.user.id, groupId)

		const url = new URL(request.url)
		const queryValidation = validateInput(listParticipantsSchema, {
			includeInactive: url.searchParams.get('includeInactive'),
		})

		if (!queryValidation.success) {
			throw new ValidationError(queryValidation.error.message)
		}

		const { includeInactive } = queryValidation.data

		const participants = await prisma.participant.findMany({
			where: {
				groupId,
				...(includeInactive ? {} : { isActive: true }),
			},
			orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
		})

		return apiSuccess(participants)
	} catch (error) {
		return apiError(error)
	}
}

/**
 * POST /api/v1/groups/[id]/participants
 * Add a new participant to a group
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth()
		const { id: groupId } = await params

		// Rate limit: 60 requests per minute
		const identifier = getIdentifier(request, session.user.id)
		const rateLimitResult = await rateLimit.singleParticipant(identifier)

		if (!rateLimitResult.success) {
			return createRateLimitResponse(rateLimitResult)
		}

		await requireGroupAccess(session.user.id, groupId)

		let body
		try {
			body = await request.json()
		} catch (err) {
			logger.error({ err }, 'Failed to parse JSON in request body')
			throw new ValidationError('Invalid JSON in request body')
		}
		const validation = validateInput(createParticipantSchema, body)

		if (!validation.success) {
			throw new ValidationError(validation.error.message)
		}

		const { name, whatsappNumber } = validation.data

		// Normalize WhatsApp number: ensure it starts with + and contains only digits
		let cleanedWhatsapp: string | null = null
		if (whatsappNumber && whatsappNumber.trim().length > 0) {
			cleanedWhatsapp = whatsappNumber.trim().replace(/[^\d+]/g, '')
			if (cleanedWhatsapp.length > 0 && !cleanedWhatsapp.startsWith('+')) {
				cleanedWhatsapp = '+' + cleanedWhatsapp
			}
		}

		// Check if group exists and get active period if any
		const group = await prisma.group.findUnique({
			where: { id: groupId },
			include: {
				periods: {
					where: { status: 'active' },
					take: 1,
				},
				participants: {
					where: {
						name: {
							equals: name.trim(),
							mode: 'insensitive',
						},
					},
					take: 1,
				},
			},
		})

		if (!group) {
			throw new NotFoundError('Group not found')
		}

		if (group.participants.length > 0) {
			throw new ValidationError(`Peserta dengan nama "${name}" sudah ada di grup ini`)
		}

		// Create participant record
		const participant = await prisma.participant.create({
			data: {
				groupId,
				name: name.trim(),
				whatsappNumber: cleanedWhatsapp,
			},
		})

		// Auto-assign to the least-loaded juz if period is active
		// This balances the workload across participants for the current week
		const activePeriod = group.periods[0]
		if (activePeriod) {
			// Find the least assigned juz in this period
			const juzCounts = await prisma.participantPeriod.groupBy({
				by: ['juzNumber'],
				where: { periodId: activePeriod.id },
				_count: { juzNumber: true },
			})

			// Create a map of juz -> count
			const countMap = new Map<number, number>()
			for (let i = 1; i <= 30; i++) {
				countMap.set(i, 0)
			}
			for (const jc of juzCounts) {
				countMap.set(jc.juzNumber, jc._count.juzNumber)
			}

			// Find the juz with minimum count
			let minJuz = 1
			let minCount = Infinity
			for (const [juz, count] of countMap) {
				if (count < minCount) {
					minCount = count
					minJuz = juz
				}
			}

			// Create participant period record
			await prisma.participantPeriod.create({
				data: {
					participantId: participant.id,
					periodId: activePeriod.id,
					juzNumber: minJuz,
					progressStatus: 'not_finished',
				},
			})
		}

		return apiSuccess(participant, 201)
	} catch (error) {
		return apiError(error)
	}
}
