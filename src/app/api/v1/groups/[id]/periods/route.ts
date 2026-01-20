import { NextRequest } from "next/server";
import { prisma } from "@/components/lib/db";
import { requireAuth, requireGroupAccess, apiError, apiSuccess, NotFoundError } from "@/components/lib/auth-utils";

interface RouteParams {
	params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/groups/[id]/periods
 * List all periods for a group
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth();
		const { id: groupId } = await params;

		await requireGroupAccess(session.user.id, groupId);

		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get("limit") || "20");
		const includeArchived = url.searchParams.get("includeArchived") === "true";

		const periods = await prisma.period.findMany({
			where: {
				groupId,
				...(includeArchived ? {} : { isArchived: false }),
			},
			orderBy: { periodNumber: "desc" },
			take: limit,
			include: {
				_count: {
					select: { participantPeriods: true },
				},
			},
		});

		// Get summary stats for each period
		const periodsWithStats = await Promise.all(
			periods.map(async (period) => {
				const stats = await prisma.participantPeriod.groupBy({
					by: ["progressStatus"],
					where: { periodId: period.id },
					_count: { progressStatus: true },
				});

				const statusCounts = {
					finished: 0,
					not_finished: 0,
					missed: 0,
				};

				for (const s of stats) {
					statusCounts[s.progressStatus as keyof typeof statusCounts] = s._count.progressStatus;
				}

				return {
					...period,
					participantCount: period._count.participantPeriods,
					statusCounts,
				};
			})
		);

		return apiSuccess(periodsWithStats);
	} catch (error) {
		return apiError(error);
	}
}

/**
 * POST /api/v1/groups/[id]/periods
 * Create a new period
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth();
		const { id: groupId } = await params;

		await requireGroupAccess(session.user.id, groupId);

		const body = await request.json();
		const { startDate } = body;

		// Validate start date
		if (!startDate) {
			return apiError({
				name: "ValidationError",
				message: "Start date is required",
			});
		}

		const start = new Date(startDate);
		if (isNaN(start.getTime())) {
			return apiError({
				name: "ValidationError",
				message: "Invalid start date",
			});
		}

		// Check if start date is Sunday (0 = Sunday in JS)
		if (start.getDay() !== 0) {
			return apiError({
				name: "ValidationError",
				message: "Period must start on a Sunday",
			});
		}

		// Check if group exists
		const group = await prisma.group.findUnique({
			where: { id: groupId },
			include: {
				periods: {
					where: { status: "active" },
					take: 1,
				},
				participants: {
					where: { isActive: true },
				},
			},
		});

		if (!group) {
			throw new NotFoundError("Group not found");
		}

		// Check if there's already an active period
		if (group.periods.length > 0) {
			return apiError({
				name: "ValidationError",
				message: "There is already an active period. Lock it first before creating a new one.",
			});
		}

		// Check if there are active participants
		if (group.participants.length === 0) {
			return apiError({
				name: "ValidationError",
				message: "Add at least one participant before creating a period.",
			});
		}

		// Calculate end date (start + 6 days = 7 days total)
		const end = new Date(start);
		end.setDate(end.getDate() + 6);

		// Get the last period number
		const lastPeriod = await prisma.period.findFirst({
			where: { groupId },
			orderBy: { periodNumber: "desc" },
			include: {
				participantPeriods: true,
			},
		});

		const periodNumber = (lastPeriod?.periodNumber || 0) + 1;

		// Create period and participant periods in transaction
		const period = await prisma.$transaction(async (tx) => {
			// Create the period
			const newPeriod = await tx.period.create({
				data: {
					groupId,
					periodNumber,
					startDate: start,
					endDate: end,
					status: "active",
					isArchived: false,
				},
			});

			// Create participant periods with juz assignment
			if (lastPeriod && lastPeriod.participantPeriods.length > 0) {
				// Rotation: get previous juz and rotate N → N+1, 30 → 1
				const previousAssignments = new Map<string, number>();
				for (const pp of lastPeriod.participantPeriods) {
					previousAssignments.set(pp.participantId, pp.juzNumber);
				}

				// Create records for active participants
				for (const participant of group.participants) {
					const previousJuz = previousAssignments.get(participant.id);
					let newJuz: number;

					if (previousJuz !== undefined) {
						// Rotate: N → N+1, 30 → 1
						newJuz = previousJuz === 30 ? 1 : previousJuz + 1;
					} else {
						// New participant - find least assigned juz
						const juzCounts = await tx.participantPeriod.groupBy({
							by: ["juzNumber"],
							where: { periodId: newPeriod.id },
							_count: { juzNumber: true },
						});

						const countMap = new Map<number, number>();
						for (let i = 1; i <= 30; i++) {
							countMap.set(i, 0);
						}
						for (const jc of juzCounts) {
							countMap.set(jc.juzNumber, jc._count.juzNumber);
						}

						let minCount = Infinity;
						newJuz = 1;
						for (const [juz, count] of countMap) {
							if (count < minCount) {
								minCount = count;
								newJuz = juz;
							}
						}
					}

					await tx.participantPeriod.create({
						data: {
							participantId: participant.id,
							periodId: newPeriod.id,
							juzNumber: newJuz,
							progressStatus: "not_finished",
						},
					});
				}
			} else {
				// First period - evenly distribute across 30 juz
				const participants = group.participants;
				for (let i = 0; i < participants.length; i++) {
					const juzNumber = (i % 30) + 1;
					await tx.participantPeriod.create({
						data: {
							participantId: participants[i].id,
							periodId: newPeriod.id,
							juzNumber,
							progressStatus: "not_finished",
						},
					});
				}
			}

			return newPeriod;
		});

		return apiSuccess(
			{
				id: period.id,
				groupId: period.groupId,
				periodNumber: period.periodNumber,
				startDate: period.startDate,
				endDate: period.endDate,
				status: period.status,
				participantCount: group.participants.length,
			},
			201
		);
	} catch (error) {
		return apiError(error);
	}
}
