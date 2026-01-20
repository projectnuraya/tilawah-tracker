import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, apiError, apiSuccess, NotFoundError, ForbiddenError } from "@/lib/auth-utils";

interface RouteParams {
	params: Promise<{ id: string }>;
}

/**
 * Helper to check coordinator has access to period's group
 */
async function getPeriodWithAccess(coordinatorId: string, periodId: string) {
	const period = await prisma.period.findUnique({
		where: { id: periodId },
		include: {
			group: {
				include: {
					coordinatorGroups: {
						where: { coordinatorId },
					},
				},
			},
		},
	});

	if (!period) {
		throw new NotFoundError("Period not found");
	}

	if (period.group.coordinatorGroups.length === 0) {
		throw new ForbiddenError("You don't have access to this period");
	}

	return period;
}

/**
 * GET /api/v1/periods/[id]
 * Get period details with all participant progress
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth();
		const { id } = await params;

		const period = await getPeriodWithAccess(session.user.id, id);

		const participantPeriods = await prisma.participantPeriod.findMany({
			where: { periodId: id },
			include: {
				participant: {
					select: {
						id: true,
						name: true,
						whatsappNumber: true,
						isActive: true,
					},
				},
			},
			orderBy: [{ juzNumber: "asc" }, { participant: { name: "asc" } }],
		});

		// Group by juz for easier display
		const byJuz: Record<number, typeof participantPeriods> = {};
		for (let i = 1; i <= 30; i++) {
			byJuz[i] = [];
		}
		for (const pp of participantPeriods) {
			byJuz[pp.juzNumber].push(pp);
		}

		// Calculate stats
		const stats = {
			total: participantPeriods.length,
			finished: participantPeriods.filter((pp) => pp.progressStatus === "finished").length,
			not_finished: participantPeriods.filter((pp) => pp.progressStatus === "not_finished").length,
			missed: participantPeriods.filter((pp) => pp.progressStatus === "missed").length,
		};

		return apiSuccess({
			id: period.id,
			groupId: period.groupId,
			groupName: period.group.name,
			periodNumber: period.periodNumber,
			startDate: period.startDate,
			endDate: period.endDate,
			status: period.status,
			isArchived: period.isArchived,
			lockedAt: period.lockedAt,
			participantPeriods,
			byJuz,
			stats,
		});
	} catch (error) {
		return apiError(error);
	}
}
