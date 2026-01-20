import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ArrowLeft, Calendar, Users } from "lucide-react";

interface PageProps {
	params: Promise<{ id: string }>;
}

async function getGroupWithPeriods(userId: string, groupId: string) {
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
			periods: {
				where: { isArchived: false },
				orderBy: { periodNumber: "desc" },
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

export default async function PeriodsListPage({ params }: PageProps) {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/auth/signin");
	}

	const { id } = await params;
	const group = await getGroupWithPeriods(session.user.id, id);

	if (!group) {
		notFound();
	}

	// Get stats for each period
	const periodsWithStats = await Promise.all(
		group.periods.map(async (period) => {
			const stats = await prisma.participantPeriod.groupBy({
				by: ["progressStatus"],
				where: { periodId: period.id },
				_count: { progressStatus: true },
			});

			const statusCounts = { finished: 0, not_finished: 0, missed: 0 };
			for (const s of stats) {
				statusCounts[s.progressStatus as keyof typeof statusCounts] = s._count.progressStatus;
			}

			return { ...period, statusCounts };
		})
	);

	const activePeriod = periodsWithStats.find((p) => p.status === "active");
	const lockedPeriods = periodsWithStats.filter((p) => p.status === "locked");

	return (
		<div>
			{/* Back Button */}
			<Link
				href={`/groups/${group.id}`}
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4" />
				Kembali ke {group.name}
			</Link>

			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-semibold">Periode</h1>
					<p className="text-muted-foreground text-sm mt-1">{group.periods.length} total periode</p>
				</div>
			</div>

			{/* Active Period */}
			{activePeriod && (
				<div className="mb-6">
					<h2 className="text-lg font-medium mb-3">Periode Aktif</h2>
					<Link
						href={`/groups/${group.id}/periods/${activePeriod.id}`}
						className="block rounded-xl border-2 border-primary bg-primary/5 p-4 hover:bg-primary/10 transition"
					>
						<div className="flex items-start justify-between">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<span className="font-semibold text-lg">Periode #{activePeriod.periodNumber}</span>
									<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
										Aktif
									</span>
								</div>
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<span className="inline-flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										{new Date(activePeriod.startDate).toLocaleDateString("id-ID", { dateStyle: "medium" })} -{" "}
										{new Date(activePeriod.endDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
									</span>
									<span className="inline-flex items-center gap-1">
										<Users className="h-4 w-4" />
										{activePeriod._count.participantPeriods}
									</span>
								</div>
							</div>
							<div className="text-right">
								<p className="text-2xl font-semibold text-primary">
									{activePeriod.statusCounts.finished}/{activePeriod._count.participantPeriods}
								</p>
								<p className="text-xs text-muted-foreground">Selesai</p>
							</div>
						</div>
					</Link>
				</div>
			)}

			{/* Period History */}
			{lockedPeriods.length > 0 && (
				<div>
					<h2 className="text-lg font-medium mb-3">Riwayat</h2>
					<div className="space-y-3">
						{lockedPeriods.map((period) => (
							<Link
								key={period.id}
								href={`/groups/${group.id}/periods/${period.id}`}
								className="block rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition"
							>
								<div className="flex items-start justify-between">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium">Periode #{period.periodNumber}</span>
											<span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
												Terkunci
											</span>
										</div>
										<p className="text-sm text-muted-foreground">
											{new Date(period.startDate).toLocaleDateString("id-ID", { dateStyle: "medium" })} -{" "}
											{new Date(period.endDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
										</p>
									</div>
									<div className="flex items-center gap-4 text-sm">
										<span className="text-primary">👑 {period.statusCounts.finished}</span>
										<span className="text-destructive">💔 {period.statusCounts.missed}</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Empty State */}
			{group.periods.length === 0 && (
				<div className="rounded-xl border border-border bg-card p-8 text-center">
					<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<Calendar className="h-8 w-8 text-primary" />
					</div>
					<h2 className="text-lg font-medium mb-2">Belum ada periode</h2>
					<p className="text-muted-foreground text-sm mb-6">Mulai periode tilawah pertama Anda untuk melacak progress.</p>
					<Link
						href={`/groups/${group.id}/periods/new`}
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90"
					>
						Mulai Periode Pertama
					</Link>
				</div>
			)}
		</div>
	);
}
