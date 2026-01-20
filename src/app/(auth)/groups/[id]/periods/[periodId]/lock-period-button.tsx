"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

interface LockPeriodButtonProps {
	periodId: string;
	notFinishedCount: number;
}

export function LockPeriodButton({ periodId, notFinishedCount }: LockPeriodButtonProps) {
	const router = useRouter();
	const [isConfirming, setIsConfirming] = useState(false);
	const [isLocking, setIsLocking] = useState(false);

	const handleLock = async () => {
		setIsLocking(true);

		try {
			const response = await fetch(`/api/v1/periods/${periodId}/lock`, {
				method: "POST",
			});

			if (response.ok) {
				router.refresh();
			}
		} catch (err) {
			console.error("Failed to lock period:", err);
		} finally {
			setIsLocking(false);
			setIsConfirming(false);
		}
	};

	if (isConfirming) {
		return (
			<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
				<p className="text-sm text-amber-800 mb-3">
					{notFinishedCount > 0 ? (
						<>
							<strong>{notFinishedCount} participant{notFinishedCount !== 1 ? "s" : ""}</strong> will be marked as{" "}
							<strong>Missed (💔)</strong>. This action cannot be undone.
						</>
					) : (
						<>Are you sure you want to lock this period? This action cannot be undone.</>
					)}
				</p>
				<div className="flex items-center gap-2">
					<button
						onClick={handleLock}
						disabled={isLocking}
						className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white font-medium hover:bg-amber-700 disabled:opacity-50"
					>
						{isLocking ? (
							<span className="inline-flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Locking...
							</span>
						) : (
							"Yes, Lock Period"
						)}
					</button>
					<button
						onClick={() => setIsConfirming(false)}
						disabled={isLocking}
						className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
					>
						Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<button
			onClick={() => setIsConfirming(true)}
			className="inline-flex items-center gap-2 rounded-lg border border-amber-500/50 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition"
		>
			<Lock className="h-4 w-4" />
			Lock Period
		</button>
	);
}
