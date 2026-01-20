import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ArrowLeft, Calendar } from "lucide-react";
import { ProgressStatusDropdown } from "./progress-dropdown";
import { LockPeriodButton } from "./lock-period-button";
import { ShareButton } from "./share-button";

interface PageProps {
	params: Promise<{ id: string; periodId: string }>;
}

async function getPeriod(userId: string, groupId: string, periodId: string) {
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

	const period = await prisma.period.findUnique({
		where: { id: periodId, groupId },
		include: {
			group: {
				select: { id: true, name: true, publicToken: true },
			},
			participantPeriods: {
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
			},
		},
	});

	return period;
}

export default async function PeriodDetailPage({ params }: PageProps) {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/auth/signin");
	}

	const { id, periodId } = await params;
	const period = await getPeriod(session.user.id, id, periodId);

	if (!period) {
		notFound();
	}

	// Group by juz
	const byJuz: Record<number, typeof period.participantPeriods> = {};
	for (let i = 1; i <= 30; i++) {
		byJuz[i] = [];
	}
	for (const pp of period.participantPeriods) {
		byJuz[pp.juzNumber].push(pp);
	}

	// Calculate stats
	const stats = {
		total: period.participantPeriods.length,
		finished: period.participantPeriods.filter((pp) => pp.progressStatus === "finished").length,
		not_finished: period.participantPeriods.filter((pp) => pp.progressStatus === "not_finished").length,
		missed: period.participantPeriods.filter((pp) => pp.progressStatus === "missed").length,
	};

	const isActive = period.status === "active";

	return (
		<div>
			{/* Back Button */}
			<Link
				href={`/groups/${period.group.id}/periods`}
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Periods
			</Link>

			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<div>
					<div className="flex items-center gap-3 mb-1">
						<h1 className="text-2xl font-semibold">Period #{period.periodNumber}</h1>
						<span
							className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
								isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
							}`}
						>
							{isActive ? "Active" : "Locked"}
						</span>
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						{new Date(period.startDate).toLocaleDateString("en-US", { dateStyle: "long" })} -{" "}
						{new Date(period.endDate).toLocaleDateString("en-US", { dateStyle: "long" })}
					</div>
				</div>
				<ShareButton period={period} groupName={period.group.name} />
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-3 gap-3 mb-6">
				<div className="rounded-lg border border-border bg-card p-3 text-center">
					<p className="text-2xl font-semibold text-primary">{stats.finished}</p>
					<p className="text-xs text-muted-foreground">👑 Finished</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-3 text-center">
					<p className="text-2xl font-semibold text-muted-foreground">{stats.not_finished}</p>
					<p className="text-xs text-muted-foreground">⏳ In Progress</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-3 text-center">
					<p className="text-2xl font-semibold text-destructive">{stats.missed}</p>
					<p className="text-xs text-muted-foreground">💔 Missed</p>
				</div>
			</div>

			{/* Lock Period Button (only for active periods) */}
			{isActive && (
				<div className="mb-6">
					<LockPeriodButton periodId={period.id} notFinishedCount={stats.not_finished} />
				</div>
			)}

			{/* Progress by Juz */}
			<div className="space-y-4">
				<h2 className="text-lg font-medium">Progress by Juz</h2>
				{Object.entries(byJuz).map(([juz, participants]) => {
					if (participants.length === 0) return null;

					return (
						<div key={juz} className="rounded-xl border border-border bg-card">
							<div className="bg-muted/50 px-4 py-2 border-b border-border">
								<h3 className="font-medium">Juz {juz}</h3>
							</div>
							<div className="divide-y divide-border overflow-hidden">
								{participants.map((pp) => (
									<div key={pp.id} className="flex items-center justify-between px-4 py-3">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
												<span className="text-primary text-sm font-medium">
													{pp.participant.name.charAt(0).toUpperCase()}
												</span>
											</div>
											<div>
												<p className="font-medium text-sm">{pp.participant.name}</p>
												{!pp.participant.isActive && (
													<p className="text-xs text-muted-foreground">Inactive</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											{isActive ? (
												<ProgressStatusDropdown
													participantPeriodId={pp.id}
													currentStatus={pp.progressStatus}
													participantName={pp.participant.name}
													whatsappNumber={pp.participant.whatsappNumber}
												/>
											) : (
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
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
