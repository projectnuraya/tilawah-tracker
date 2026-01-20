"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function NewParticipantPage({ params }: PageProps) {
	const router = useRouter();
	const [groupId, setGroupId] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [whatsappNumber, setWhatsappNumber] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		params.then(({ id }) => setGroupId(id));
	}, [params]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name.trim()) {
			setError("Participant name is required");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`/api/v1/groups/${groupId}/participants`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: name.trim(),
					whatsappNumber: whatsappNumber.trim() || null,
				}),
			});

			const data = await response.json();

			if (!data.success) {
				setError(data.error?.message || "Failed to add participant");
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
		<div>
			{/* Back Button */}
			<Link
				href={`/groups/${groupId}/participants`}
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Participants
			</Link>

			<div className="max-w-md">
				<h1 className="text-2xl font-semibold mb-2">Add Participant</h1>
				<p className="text-muted-foreground text-sm mb-6">Add a new member to this tilawah group.</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium mb-2">
							Name <span className="text-destructive">*</span>
						</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Ahmad"
							className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							disabled={isLoading}
							autoFocus
						/>
					</div>

					<div>
						<label htmlFor="whatsapp" className="block text-sm font-medium mb-2">
							WhatsApp Number <span className="text-muted-foreground text-xs">(optional)</span>
						</label>
						<input
							type="tel"
							id="whatsapp"
							value={whatsappNumber}
							onChange={(e) => setWhatsappNumber(e.target.value)}
							placeholder="e.g., +6281234567890"
							className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							disabled={isLoading}
						/>
						<p className="mt-1 text-xs text-muted-foreground">Used for WhatsApp reminder feature.</p>
					</div>

					{error && (
						<div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					<div className="pt-2">
						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Adding...
								</span>
							) : (
								"Add Participant"
							)}
						</button>
					</div>
				</form>

				<p className="mt-6 text-xs text-muted-foreground">
					If there&apos;s an active period, the participant will be automatically assigned an available juz.
				</p>
			</div>
		</div>
	);
}
