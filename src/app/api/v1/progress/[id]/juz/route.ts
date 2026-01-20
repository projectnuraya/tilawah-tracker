import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";
import {
	requireAuth,
	requireGroupAccess,
	apiSuccess,
	apiError,
	NotFoundError,
} from "@/components/lib/auth-utils";

// PATCH /api/v1/progress/[id]/juz - Update juz assignment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await requireAuth();
		const { id } = await params;

		const body = await request.json();
		const { juzNumber } = body;

		// Validate juzNumber
		if (!juzNumber || typeof juzNumber !== "number" || juzNumber < 1 || juzNumber > 30) {
			return NextResponse.json(
				{ success: false, error: { code: "BAD_REQUEST", message: "Invalid juz number. Must be between 1 and 30" } },
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
				{ success: false, error: { code: "BAD_REQUEST", message: "Cannot update juz for a locked period" } },
				{ status: 400 }
			);
		}

		// Update the juz assignment
		const updated = await prisma.participantPeriod.update({
			where: { id },
			data: { juzNumber },
		});

		return apiSuccess(updated);
	} catch (error) {
		return apiError(error);
	}
}
