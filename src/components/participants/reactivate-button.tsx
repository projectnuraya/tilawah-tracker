"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

interface ReactivateButtonProps {
	participantId: string;
	groupId: string;
}

export function ReactivateButton({ participantId, groupId }: ReactivateButtonProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleReactivate = async () => {
		setIsLoading(true);

		try {
			const response = await fetch(`/api/v1/participants/${participantId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ isActive: true }),
			});

			if (response.ok) {
				router.push(`/groups/${groupId}/participants`);
				router.refresh();
			}
		} catch (err) {
			console.error("Failed to reactivate:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleReactivate}
			disabled={isLoading}
			className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-white font-medium shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<>
					<UserPlus className="h-4 w-4" />
					Aktifkan Kembali
				</>
			)}
		</button>
	);
}
