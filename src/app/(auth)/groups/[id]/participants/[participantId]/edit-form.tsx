"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Participant {
	id: string;
	name: string;
	whatsappNumber: string | null;
	groupId: string;
}

interface EditParticipantFormProps {
	participant: Participant;
}

export function EditParticipantForm({ participant }: EditParticipantFormProps) {
	const router = useRouter();
	const [name, setName] = useState(participant.name);
	const [whatsappNumber, setWhatsappNumber] = useState(participant.whatsappNumber || "");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (!name.trim()) {
			setError("Name is required");
			return;
		}

		setIsSaving(true);

		try {
			const response = await fetch(`/api/v1/participants/${participant.id}`, {
				method: "PATCH",
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
				setError(data.error?.message || "Failed to update");
				return;
			}

			setSuccess(true);
			router.refresh();
			setTimeout(() => setSuccess(false), 2000);
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="name" className="block text-sm font-medium mb-2">
					Name
				</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					disabled={isSaving}
				/>
			</div>

			<div>
				<label htmlFor="whatsapp" className="block text-sm font-medium mb-2">
					WhatsApp Number
				</label>
				<input
					type="tel"
					id="whatsapp"
					value={whatsappNumber}
					onChange={(e) => setWhatsappNumber(e.target.value)}
					placeholder="+6281234567890"
					className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					disabled={isSaving}
				/>
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && <p className="text-sm text-primary">Saved successfully!</p>}

			<button
				type="submit"
				disabled={isSaving}
				className="w-full rounded-lg bg-primary px-4 py-2.5 text-white font-medium shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isSaving ? (
					<span className="inline-flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						Saving...
					</span>
				) : (
					"Save Changes"
				)}
			</button>
		</form>
	);
}
