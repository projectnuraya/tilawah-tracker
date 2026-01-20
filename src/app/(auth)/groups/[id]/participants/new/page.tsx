"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";

interface PageProps {
	params: Promise<{ id: string }>;
}

interface ParticipantInput {
	id: string;
	name: string;
	whatsappNumber: string;
}

export default function NewParticipantPage({ params }: PageProps) {
	const router = useRouter();
	const [groupId, setGroupId] = useState<string | null>(null);
	const [participants, setParticipants] = useState<ParticipantInput[]>([
		{ id: crypto.randomUUID(), name: "", whatsappNumber: "" },
	]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		params.then(({ id }) => setGroupId(id));
	}, [params]);

	const addParticipantRow = () => {
		setParticipants([...participants, { id: crypto.randomUUID(), name: "", whatsappNumber: "" }]);
	};

	const removeParticipantRow = (id: string) => {
		if (participants.length === 1) return;
		setParticipants(participants.filter((p) => p.id !== id));
	};

	const updateParticipant = (id: string, field: "name" | "whatsappNumber", value: string) => {
		setParticipants(participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Filter out empty participants
		const validParticipants = participants.filter((p) => p.name.trim());

		if (validParticipants.length === 0) {
			setError("Add at least one participant with a name");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`/api/v1/groups/${groupId}/participants/bulk`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					participants: validParticipants.map((p) => ({
						name: p.name.trim(),
						whatsappNumber: p.whatsappNumber.trim() || null,
					})),
				}),
			});

			const data = await response.json();

			if (!data.success) {
				setError(data.error?.message || "Failed to add participants");
				return;
			}

			router.push(`/groups/${groupId}/participants`);
			router.refresh();
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (!groupId) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center">
			{/* Back Button */}
			<div className="w-full max-w-2xl mb-6">
				<Link
					href={`/groups/${groupId}/participants`}
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Participants
				</Link>
			</div>

			<div className="w-full max-w-2xl">
				<h1 className="text-2xl font-semibold mb-2 text-center">Add Participants</h1>
				<p className="text-muted-foreground text-sm mb-6 text-center">
					Add one or more members to this tilawah group.
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Participant Rows */}
					<div className="space-y-4">
						{participants.map((participant, index) => (
							<div key={participant.id} className="flex gap-3 items-start">
								<div className="flex-1 space-y-3">
									<div>
										<label htmlFor={`name-${participant.id}`} className="block text-sm font-medium mb-2">
											Name {index === 0 && <span className="text-destructive">*</span>}
										</label>
										<input
											type="text"
											id={`name-${participant.id}`}
											value={participant.name}
											onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
											placeholder="e.g., Ahmad"
											className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
											disabled={isLoading}
											autoFocus={index === 0}
										/>
									</div>

									<div>
										<label htmlFor={`whatsapp-${participant.id}`} className="block text-sm font-medium mb-2">
											WhatsApp <span className="text-muted-foreground text-xs">(optional)</span>
										</label>
										<input
											type="tel"
											id={`whatsapp-${participant.id}`}
											value={participant.whatsappNumber}
											onChange={(e) => updateParticipant(participant.id, "whatsappNumber", e.target.value)}
											placeholder="e.g., +6281234567890"
											className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
											disabled={isLoading}
										/>
									</div>
								</div>

								{/* Remove Button */}
								{participants.length > 1 && (
									<button
										type="button"
										onClick={() => removeParticipantRow(participant.id)}
										disabled={isLoading}
										className="mt-8 p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition disabled:opacity-50"
										title="Remove"
									>
										<X className="h-5 w-5" />
									</button>
								)}
							</div>
						))}
					</div>

					{/* Add More Button */}
					<button
						type="button"
						onClick={addParticipantRow}
						disabled={isLoading}
						className="w-full rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition disabled:opacity-50"
					>
						<Plus className="h-4 w-4 inline-block mr-2" />
						Add Another Participant
					</button>

					{error && (
						<div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					{/* Submit Button */}
					<div className="pt-2">
						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Adding Participants...
								</span>
							) : (
								`Add ${participants.filter((p) => p.name.trim()).length || 1} Participant${
									participants.filter((p) => p.name.trim()).length !== 1 ? "s" : ""
								}`
							)}
						</button>
					</div>
				</form>

				<p className="mt-6 text-xs text-muted-foreground text-center">
					If there&apos;s an active period, participants will be automatically assigned available juz numbers.
				</p>
			</div>
		</div>
	);
}
