import { apiError, apiSuccess, NotFoundError, requireAuth, requireGroupAccess, ValidationError } from '@/components/lib/auth-utils'
import { prisma } from '@/components/lib/db'
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

		await requireGroupAccess(session.user.id, groupId)

		const url = new URL(request.url)
		const includeInactive = url.searchParams.get('includeInactive') === 'true'

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

		await requireGroupAccess(session.user.id, groupId)

		const body = await request.json()
		const { name, whatsappNumber } = body

		// Validate name
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			throw new ValidationError('Participant name is required')
		}

		if (name.trim().length > 255) {
			throw new ValidationError('Name must be less than 255 characters')
		}

		// Validate WhatsApp number if provided
		let cleanedWhatsapp: string | null = null
		if (whatsappNumber && typeof whatsappNumber === 'string' && whatsappNumber.trim().length > 0) {
			// Basic validation: remove non-numeric except + at start
			cleanedWhatsapp = whatsappNumber.trim().replace(/[^\d+]/g, '')
			if (cleanedWhatsapp.length > 0 && !cleanedWhatsapp.startsWith('+')) {
				cleanedWhatsapp = '+' + cleanedWhatsapp
			}
			if (cleanedWhatsapp.length > 20) {
				throw new ValidationError('WhatsApp number is too long')
			}
		}

		// Check if group exists
		const group = await prisma.group.findUnique({
			where: { id: groupId },
			include: {
				periods: {
					where: { status: 'active' },
					take: 1,
				},
			},
		})

		if (!group) {
			throw new NotFoundError('Group not found')
		}

		// Create participant
		const participant = await prisma.participant.create({
			data: {
				groupId,
				name: name.trim(),
				whatsappNumber: cleanedWhatsapp,
			},
		})

		// If there's an active period, auto-assign a juz
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
