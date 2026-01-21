import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";
import {
	requireAuth,
	requireGroupAccess,
	apiSuccess,
	apiError,
	NotFoundError,
} from "@/components/lib/auth-utils";

// PATCH /api/v1/progress/[id] - Update progress status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await requireAuth();
		const { id } = await params;

		const body = await request.json();
		const { status } = body;

		// Validate status
		const validStatuses = ["not_finished", "finished", "missed"];
		if (!status || !validStatuses.includes(status)) {
			return NextResponse.json(
				{ success: false, error: { code: "BAD_REQUEST", message: "Invalid status. Must be: not_finished, finished, or missed" } },
				{ status: 400 }
			);
		}

		// Get the participant period with its relations
		const participantPeriod = await prisma.participantPeriod.findUnique({
			where: { id },
			include: {
				period: {
					include: {
						group: true,
					},
				},
			},
		});

		if (!participantPeriod) {
			throw new NotFoundError("Participant period not found");
		}

		// Check ownership via CoordinatorGroup
		await requireGroupAccess(session.user.id, participantPeriod.period.groupId);

		// Check if period is locked
		if (participantPeriod.period.status === "locked") {
			return NextResponse.json(
				{ success: false, error: { code: "BAD_REQUEST", message: "Cannot update progress for a locked period" } },
				{ status: 400 }
			);
		}

		// Update the status and reset streak if finished
		const updated = await prisma.participantPeriod.update({
			where: { id },
			data: {
				progressStatus: status,
				// Reset missed streak when marked as finished
				...(status === 'finished' && { missedStreak: 0 }),
			},
		});

		return apiSuccess(updated);
	} catch (error) {
		return apiError(error);
	}
}
