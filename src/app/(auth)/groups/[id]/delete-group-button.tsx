"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteGroupButtonProps {
	groupId: string;
	groupName: string;
}

export function DeleteGroupButton({ groupId, groupName }: DeleteGroupButtonProps) {
	const router = useRouter();
	const [isConfirming, setIsConfirming] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);

		try {
			const response = await fetch(`/api/v1/groups/${groupId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				router.push("/dashboard");
				router.refresh();
			}
		} catch (err) {
			console.error("Failed to delete:", err);
			setIsDeleting(false);
			setIsConfirming(false);
		}
	};

	if (isConfirming) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm text-destructive">Delete &quot;{groupName}&quot;?</span>
				<button
					onClick={handleDelete}
					disabled={isDeleting}
					className="rounded-lg bg-destructive px-3 py-1.5 text-sm text-white font-medium hover:bg-destructive/90 disabled:opacity-50"
				>
					{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete"}
				</button>
				<button
					onClick={() => setIsConfirming(false)}
					disabled={isDeleting}
					className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
				>
					Cancel
				</button>
			</div>
		);
	}

	return (
		<button
			onClick={() => setIsConfirming(true)}
			className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
		>
			<Trash2 className="h-4 w-4" />
			Delete Group
		</button>
	);
}
