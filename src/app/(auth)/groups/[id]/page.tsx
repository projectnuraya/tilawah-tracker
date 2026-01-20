import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ArrowLeft, Users, Calendar, Copy, Settings, ExternalLink, Plus } from "lucide-react";
import { CopyTokenButton } from "./copy-token-button";
import { DeleteGroupButton } from "./delete-group-button";

interface PageProps {
	params: Promise<{ id: string }>;
}

async function getGroup(userId: string, groupId: string) {
	// Check access
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
			coordinatorGroups: {
				include: {
					coordinator: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
				},
			},
			participants: {
				where: { isActive: true },
				orderBy: { name: "asc" },
			},
			periods: {
				orderBy: { periodNumber: "desc" },
				take: 5,
				include: {
					_count: {
						select: { participantPeriods: true },
					},
				},
			},
		},
	});

	return group;
}

export default async function GroupDetailPage({ params }: PageProps) {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/auth/signin");
	}

	const { id } = await params;
	const group = await getGroup(session.user.id, id);

	if (!group) {
		notFound();
	}

	const activePeriod = group.periods.find((p) => p.status === "active");
	const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/public/${group.publicToken}`;

	return (
		<div>
			{/* Back Button */}
			<Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
				<ArrowLeft className="h-4 w-4" />
				Back to Dashboard
			</Link>

			{/* Group Header */}
			<div className="flex items-start justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-semibold">{group.name}</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Created {new Date(group.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
					</p>
				</div>
				<Link
					href={`/groups/${group.id}/edit`}
					className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition"
				>
					<Settings className="h-4 w-4" />
					Edit
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 gap-4 mb-6">
				<div className="rounded-xl border border-border bg-card p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-primary/10 p-2">
							<Users className="h-5 w-5 text-primary" />
						</div>
						<div>
							<p className="text-2xl font-semibold">{group.participants.length}</p>
							<p className="text-sm text-muted-foreground">Participants</p>
						</div>
					</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-amber-500/10 p-2">
							<Calendar className="h-5 w-5 text-amber-500" />
						</div>
						<div>
							<p className="text-2xl font-semibold">{group.periods.length}</p>
							<p className="text-sm text-muted-foreground">Periods</p>
						</div>
					</div>
				</div>
			</div>

			{/* Public Link */}
			<div className="rounded-xl border border-border bg-card p-4 mb-6">
				<h2 className="font-medium mb-2">Public Link</h2>
				<p className="text-xs text-muted-foreground mb-3">Share this link with participants for read-only access.</p>
				<div className="flex items-center gap-2">
					<input
						type="text"
						value={publicUrl}
						readOnly
						className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
					/>
					<CopyTokenButton url={publicUrl} />
					<Link
						href={`/public/${group.publicToken}`}
						target="_blank"
						className="rounded-lg border border-border p-2 hover:bg-muted transition"
						title="Open public view"
					>
						<ExternalLink className="h-4 w-4" />
					</Link>
				</div>
			</div>

			{/* Active Period or Start New */}
			<div className="rounded-xl border border-border bg-card p-4 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-medium">Active Period</h2>
					{!activePeriod && group.participants.length > 0 && (
						<Link
							href={`/groups/${group.id}/periods/new`}
							className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
						>
							<Plus className="h-4 w-4" />
							Start New Period
						</Link>
					)}
				</div>
				{activePeriod ? (
					<Link
						href={`/groups/${group.id}/periods/${activePeriod.id}`}
						className="block rounded-lg border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Period #{activePeriod.periodNumber}</p>
								<p className="text-sm text-muted-foreground">
									{new Date(activePeriod.startDate).toLocaleDateString("en-US", { dateStyle: "medium" })} -{" "}
									{new Date(activePeriod.endDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
								</p>
							</div>
							<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
								Active
							</span>
						</div>
					</Link>
				) : (
					<p className="text-sm text-muted-foreground">
						{group.participants.length === 0
							? "Add participants first before starting a period."
							: "No active period. Start a new one to begin tracking."}
					</p>
				)}
			</div>

			{/* Participants Quick View */}
			<div className="rounded-xl border border-border bg-card p-4 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-medium">Participants</h2>
					<Link href={`/groups/${group.id}/participants`} className="text-sm text-primary hover:underline">
						Manage
					</Link>
				</div>
				{group.participants.length === 0 ? (
					<div className="text-center py-4">
						<p className="text-sm text-muted-foreground mb-3">No participants yet.</p>
						<Link
							href={`/groups/${group.id}/participants/new`}
							className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
						>
							<Plus className="h-4 w-4" />
							Add Participant
						</Link>
					</div>
				) : (
					<div className="space-y-2">
						{group.participants.slice(0, 5).map((p) => (
							<div key={p.id} className="flex items-center justify-between py-1">
								<span className="text-sm">{p.name}</span>
								{p.whatsappNumber && <span className="text-xs text-muted-foreground">📱</span>}
							</div>
						))}
						{group.participants.length > 5 && (
							<p className="text-sm text-muted-foreground">+{group.participants.length - 5} more</p>
						)}
					</div>
				)}
			</div>

			{/* Recent Periods */}
			{group.periods.length > 0 && (
				<div className="rounded-xl border border-border bg-card p-4 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-medium">Recent Periods</h2>
						<Link href={`/groups/${group.id}/periods`} className="text-sm text-primary hover:underline">
							View All
						</Link>
					</div>
					<div className="space-y-2">
						{group.periods.map((period) => (
							<Link
								key={period.id}
								href={`/groups/${group.id}/periods/${period.id}`}
								className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition"
							>
								<div>
									<span className="text-sm font-medium">Period #{period.periodNumber}</span>
									<p className="text-xs text-muted-foreground">
										{new Date(period.startDate).toLocaleDateString("en-US", { dateStyle: "short" })}
									</p>
								</div>
								<span
									className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
										period.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
									}`}
								>
									{period.status === "active" ? "Active" : "Locked"}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Danger Zone */}
			<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
				<h2 className="font-medium text-destructive mb-2">Danger Zone</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Deleting this group will permanently remove all participants, periods, and progress data.
				</p>
				<DeleteGroupButton groupId={group.id} groupName={group.name} />
			</div>
		</div>
	);
}
