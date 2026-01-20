import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, apiError, apiSuccess, NotFoundError, ForbiddenError } from "@/lib/auth-utils";

interface RouteParams {
	params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/periods/[id]/lock
 * Lock a period - changes all "not_finished" to "missed"
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await requireAuth();
		const { id } = await params;

		// Get period with access check
		const period = await prisma.period.findUnique({
			where: { id },
			include: {
				group: {
					include: {
						coordinatorGroups: {
							where: { coordinatorId: session.user.id },
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

		// Check if already locked
		if (period.status === "locked") {
			return apiError({
				name: "ValidationError",
				message: "This period is already locked",
			});
		}

		// Lock period and update all "not_finished" to "missed" in transaction
		const lockedPeriod = await prisma.$transaction(async (tx) => {
			// Update all not_finished to missed
			await tx.participantPeriod.updateMany({
				where: {
					periodId: id,
					progressStatus: "not_finished",
				},
				data: {
					progressStatus: "missed",
				},
			});

			// Lock the period
			return tx.period.update({
				where: { id },
				data: {
					status: "locked",
					lockedAt: new Date(),
				},
			});
		});

		// Get updated stats
		const stats = await prisma.participantPeriod.groupBy({
			by: ["progressStatus"],
			where: { periodId: id },
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

		return apiSuccess({
			id: lockedPeriod.id,
			status: lockedPeriod.status,
			lockedAt: lockedPeriod.lockedAt,
			statusCounts,
		});
	} catch (error) {
		return apiError(error);
	}
}
