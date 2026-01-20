import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { EditParticipantForm } from "./edit-form";
import { DeactivateButton } from "./deactivate-button";
import { ReactivateButton } from "./reactivate-button";

interface PageProps {
	params: Promise<{ id: string; participantId: string }>;
}

async function getParticipant(userId: string, groupId: string, participantId: string) {
	const access = await prisma.coordinatorGroup.findUnique({
		where: {
			coordinatorId_groupId: {
				coordinatorId: userId,
				groupId,
			},
		},
	});

	if (!access) {
		return null;
	}

	const participant = await prisma.participant.findUnique({
		where: { id: participantId, groupId },
		include: {
			group: {
				select: { id: true, name: true },
			},
			participantPeriods: {
				orderBy: { period: { periodNumber: "desc" } },
				take: 5,
				include: {
					period: {
						select: {
							id: true,
							periodNumber: true,
							startDate: true,
							endDate: true,
							status: true,
						},
					},
				},
			},
		},
	});

	return participant;
}

export default async function ParticipantDetailPage({ params }: PageProps) {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/auth/signin");
	}

	const { id, participantId } = await params;
	const participant = await getParticipant(session.user.id, id, participantId);

	if (!participant) {
		notFound();
	}

	const whatsappLink = participant.whatsappNumber
		? `https://wa.me/${participant.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
				`Assalamu'alaikum ${participant.name}, this is a reminder for your tilawah.`
		  )}`
		: null;

	return (
		<div>
			{/* Back Button */}
			<Link
				href={`/groups/${participant.group.id}/participants`}
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Participants
			</Link>

			<div className="max-w-md">
				{/* Header */}
				<div className="flex items-start justify-between mb-6">
					<div>
						<h1 className="text-2xl font-semibold">{participant.name}</h1>
						<p className="text-muted-foreground text-sm mt-1">
							{participant.isActive ? "Active participant" : "Inactive participant"}
						</p>
					</div>
					{!participant.isActive && (
						<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
							Inactive
						</span>
					)}
				</div>

				{/* WhatsApp Reminder */}
				{participant.isActive && whatsappLink && (
					<div className="rounded-xl border border-border bg-card p-4 mb-6">
						<h2 className="font-medium mb-2">Quick Actions</h2>
						<a
							href={whatsappLink}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white font-medium shadow-sm transition hover:bg-green-700"
						>
							<MessageCircle className="h-4 w-4" />
							Remind via WhatsApp
						</a>
					</div>
				)}

				{/* Edit Form */}
				<div className="rounded-xl border border-border bg-card p-4 mb-6">
					<h2 className="font-medium mb-4">Edit Details</h2>
					<EditParticipantForm participant={participant} />
				</div>

				{/* Recent History */}
				{participant.participantPeriods.length > 0 && (
					<div className="rounded-xl border border-border bg-card p-4 mb-6">
						<h2 className="font-medium mb-4">Recent History</h2>
						<div className="space-y-3">
							{participant.participantPeriods.map((pp) => (
								<div key={pp.id} className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Period #{pp.period.periodNumber}</p>
										<p className="text-xs text-muted-foreground">Juz {pp.juzNumber}</p>
									</div>
									<span
										className={`inline-flex items-center gap-1 text-sm ${
											pp.progressStatus === "finished"
												? "text-primary"
												: pp.progressStatus === "missed"
												? "text-destructive"
												: "text-muted-foreground"
										}`}
									>
										{pp.progressStatus === "finished" && "👑 Finished"}
										{pp.progressStatus === "missed" && "💔 Missed"}
										{pp.progressStatus === "not_finished" && "⏳ Not finished"}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Deactivate / Reactivate */}
				<div className="rounded-xl border border-border bg-card p-4">
					{participant.isActive ? (
						<>
							<h2 className="font-medium mb-2">Deactivate Participant</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Deactivated participants won&apos;t appear in new periods but their history is preserved.
							</p>
							<DeactivateButton participantId={participant.id} groupId={participant.group.id} />
						</>
					) : (
						<>
							<h2 className="font-medium mb-2">Reactivate Participant</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Reactivate this participant to include them in future periods.
							</p>
							<ReactivateButton participantId={participant.id} groupId={participant.group.id} />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
