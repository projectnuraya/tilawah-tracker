import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/components/lib/auth";
import { prisma } from "@/components/lib/db";
import { ArrowLeft, Plus, Phone, UserX, User, Edit } from "lucide-react";
import { JuzDropdown } from "@/components/participants/juz-dropdown";

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
	let activeParticipants = group.participants.filter((p) => p.isActive);
	const inactiveParticipants = group.participants.filter((p) => !p.isActive);

	// Map participant to their juz and participantPeriodId in active period
	const participantDataMap = new Map<
		string,
		{ juzNumber: number; participantPeriodId: string }
	>();
	if (activePeriod) {
		for (const pp of activePeriod.participantPeriods) {
			participantDataMap.set(pp.participantId, {
				juzNumber: pp.juzNumber,
				participantPeriodId: pp.id,
			});
		}
		
		// Sort by Juz first, then by Name
		activeParticipants = activeParticipants.sort((a, b) => {
			const aData = participantDataMap.get(a.id);
			const bData = participantDataMap.get(b.id);
			
			// If both have juz assignments
			if (aData && bData) {
				if (aData.juzNumber !== bData.juzNumber) {
					return aData.juzNumber - bData.juzNumber;
				}
				return a.name.localeCompare(b.name);
			}
			
			// Participants without juz come last
			if (aData && !bData) return -1;
			if (!aData && bData) return 1;
			
			// Both without juz, sort by name
			return a.name.localeCompare(b.name);
		});
	}

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
					<h1 className="text-2xl font-semibold">Peserta</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{activeParticipants.length} peserta aktif
					</p>
				</div>
				<Link
					href={`/groups/${group.id}/participants/new`}
					className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-white font-medium shadow-sm transition hover:bg-primary/90"
				>
					<Plus className="h-4 w-4" />
					<span className="hidden sm:inline">Tambah</span>
				</Link>
			</div>

			{/* Active Participants */}
			{activeParticipants.length === 0 ? (
				<div className="rounded-xl border border-border bg-card p-8 text-center">
					<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<User className="h-8 w-8 text-primary" />
					</div>
					<h2 className="text-lg font-medium mb-2">Belum ada peserta</h2>
					<p className="text-muted-foreground text-sm mb-6">Tambahkan peserta untuk mulai melacak progress tilawah mereka.</p>
					<Link
						href={`/groups/${group.id}/participants/new`}
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90"
					>
						<Plus className="h-4 w-4" />
						Tambah Peserta Pertama
					</Link>
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card divide-y divide-border">
					{activeParticipants.map((participant) => {
						const participantData = participantDataMap.get(participant.id);
						return (
							<div
								key={participant.id}
								className="flex items-center justify-between p-4 hover:bg-muted/50 transition"
							>
								<Link
									href={`/groups/${group.id}/participants/${participant.id}`}
									className="flex items-center gap-3 flex-1"
								>
									<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
										<span className="text-primary font-medium">
											{participant.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<p className="font-medium">{participant.name}</p>
										{participant.whatsappNumber && (
											<p className="text-sm text-muted-foreground flex items-center gap-1">
												<Phone className="h-3 w-3" />
												{participant.whatsappNumber}
											</p>
										)}
									</div>
								</Link>
								<div className="flex items-center gap-3">
									{activePeriod && participantData && (
										<JuzDropdown
											participantPeriodId={participantData.participantPeriodId}
											currentJuz={participantData.juzNumber}
											participantName={participant.name}
										/>
									)}
									<Link
										href={`/groups/${group.id}/participants/${participant.id}`}
										className="p-2 rounded-lg hover:bg-muted transition"
										aria-label={`Edit ${participant.name}`}
									>
										<Edit className="h-4 w-4 text-muted-foreground" />
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Inactive Participants */}
			{inactiveParticipants.length > 0 && (
				<div className="mt-8">
					<h2 className="text-lg font-medium mb-4 flex items-center gap-2">
						<UserX className="h-5 w-5 text-muted-foreground" />
						Tidak Aktif ({inactiveParticipants.length})
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
										<p className="text-sm text-muted-foreground">Tidak Aktif</p>
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
