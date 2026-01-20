import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ArrowLeft, Plus, Phone, UserX, User } from "lucide-react";

interface PageProps {
	params: Promise<{ id: string }>;
}

async function getGroupWithParticipants(userId: string, groupId: string) {
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

	const group = await prisma.group.findUnique({
		where: { id: groupId },
		include: {
			participants: {
				orderBy: [{ isActive: "desc" }, { name: "asc" }],
			},
			periods: {
				where: { status: "active" },
				take: 1,
				include: {
					participantPeriods: true,
				},
			},
		},
	});

	return group;
}

export default async function ParticipantsPage({ params }: PageProps) {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/auth/signin");
	}

	const { id } = await params;
	const group = await getGroupWithParticipants(session.user.id, id);

	if (!group) {
		notFound();
	}

	const activePeriod = group.periods[0];
	const activeParticipants = group.participants.filter((p) => p.isActive);
	const inactiveParticipants = group.participants.filter((p) => !p.isActive);

	// Map participant to their juz in active period
	const participantJuzMap = new Map<string, number>();
	if (activePeriod) {
		for (const pp of activePeriod.participantPeriods) {
			participantJuzMap.set(pp.participantId, pp.juzNumber);
		}
	}

	return (
		<div>
			{/* Back Button */}
			<Link
				href={`/groups/${group.id}`}
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to {group.name}
			</Link>

			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-semibold">Participants</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{activeParticipants.length} active participant{activeParticipants.length !== 1 ? "s" : ""}
					</p>
				</div>
				<Link
					href={`/groups/${group.id}/participants/new`}
					className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-white font-medium shadow-sm transition hover:bg-primary/90"
				>
					<Plus className="h-4 w-4" />
					<span className="hidden sm:inline">Add</span>
				</Link>
			</div>

			{/* Active Participants */}
			{activeParticipants.length === 0 ? (
				<div className="rounded-xl border border-border bg-card p-8 text-center">
					<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<User className="h-8 w-8 text-primary" />
					</div>
					<h2 className="text-lg font-medium mb-2">No participants yet</h2>
					<p className="text-muted-foreground text-sm mb-6">Add participants to start tracking their tilawah progress.</p>
					<Link
						href={`/groups/${group.id}/participants/new`}
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90"
					>
						<Plus className="h-4 w-4" />
						Add First Participant
					</Link>
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card divide-y divide-border">
					{activeParticipants.map((participant) => (
						<Link
							key={participant.id}
							href={`/groups/${group.id}/participants/${participant.id}`}
							className="flex items-center justify-between p-4 hover:bg-muted/50 transition"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
									<span className="text-primary font-medium">{participant.name.charAt(0).toUpperCase()}</span>
								</div>
								<div>
									<p className="font-medium">{participant.name}</p>
									{activePeriod && participantJuzMap.has(participant.id) && (
										<p className="text-sm text-muted-foreground">Juz {participantJuzMap.get(participant.id)}</p>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2">
								{participant.whatsappNumber && <Phone className="h-4 w-4 text-muted-foreground" />}
							</div>
						</Link>
					))}
				</div>
			)}

			{/* Inactive Participants */}
			{inactiveParticipants.length > 0 && (
				<div className="mt-8">
					<h2 className="text-lg font-medium mb-4 flex items-center gap-2">
						<UserX className="h-5 w-5 text-muted-foreground" />
						Inactive ({inactiveParticipants.length})
					</h2>
					<div className="rounded-xl border border-border bg-card/50 divide-y divide-border">
						{inactiveParticipants.map((participant) => (
							<Link
								key={participant.id}
								href={`/groups/${group.id}/participants/${participant.id}`}
								className="flex items-center justify-between p-4 hover:bg-muted/50 transition opacity-60"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
										<span className="text-muted-foreground font-medium">{participant.name.charAt(0).toUpperCase()}</span>
									</div>
									<div>
										<p className="font-medium">{participant.name}</p>
										<p className="text-sm text-muted-foreground">Inactive</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
