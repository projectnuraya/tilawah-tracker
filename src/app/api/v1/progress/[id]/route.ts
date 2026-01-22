import {
	apiError,
	apiSuccess,
	NotFoundError,
	requireAuth,
	requireGroupAccess,
	ValidationError,
} from "@/components/lib/auth-utils";
import { prisma } from "@/components/lib/db";
import { NextRequest } from "next/server";

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
			throw new ValidationError("Invalid status. Must be: not_finished, finished, or missed");
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
			throw new ValidationError("Cannot update progress for a locked period");
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
