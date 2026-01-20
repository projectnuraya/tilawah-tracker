"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Calendar, AlertCircle } from "lucide-react";

interface PageProps {
	params: Promise<{ id: string }>;
}

function getNextSunday(): string {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
	const nextSunday = new Date(today);
	nextSunday.setDate(today.getDate() + daysUntilSunday);
	return nextSunday.toISOString().split("T")[0];
}

function isSunday(dateString: string): boolean {
	const date = new Date(dateString);
	return date.getDay() === 0;
}

export default function NewPeriodPage({ params }: PageProps) {
	const router = useRouter();
	const [groupId, setGroupId] = useState<string | null>(null);
	const [startDate, setStartDate] = useState(getNextSunday());
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [dateError, setDateError] = useState("");

	useEffect(() => {
		params.then(({ id }) => setGroupId(id));
	}, [params]);

	const handleDateChange = (value: string) => {
		setStartDate(value);
		if (value && !isSunday(value)) {
			setDateError("Periode harus dimulai pada hari Ahad");
		} else {
			setDateError("");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!startDate) {
			setError("Tanggal mulai wajib diisi");
			return;
		}

		if (!isSunday(startDate)) {
			setError("Periode harus dimulai pada hari Ahad");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`/api/v1/groups/${groupId}/periods`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ startDate }),
			});

			const data = await response.json();

			if (!data.success) {
				setError(data.error?.message || "Gagal membuat periode");
				return;
			}

			router.push(`/groups/${groupId}/periods/${data.data.id}`);
			router.refresh();
		} catch {
			setError("Terjadi kesalahan yang tidak terduga");
		} finally {
			setIsLoading(false);
		}
	};

	// Calculate end date
	const endDate = startDate
		? (() => {
				const end = new Date(startDate);
				end.setDate(end.getDate() + 6);
				return end.toISOString().split("T")[0];
		  })()
		: "";

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
				href={`/groups/${groupId}`}
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4" />
				Kembali ke Grup
			</Link>

			<div className="max-w-md">
				<h1 className="text-2xl font-semibold mb-2">Mulai Periode Baru</h1>
				<p className="text-muted-foreground text-sm mb-6">Buat periode tilawah mingguan baru untuk grup Anda.</p>

				{/* Info Card */}
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
					<div className="flex gap-3">
						<AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-blue-800">
							<p className="font-medium mb-1">Aturan Periode</p>
							<ul className="list-disc list-inside space-y-1 text-blue-700">
								<li>Harus dimulai pada hari Ahad</li>
								<li>Berlangsung tepat 7 hari (Ahad sampai Sabtu)</li>
								<li>Pembagian juz otomatis bergilir dari periode sebelumnya</li>
							</ul>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="startDate" className="block text-sm font-medium mb-2">
							Tanggal Mulai (Ahad)
						</label>
						<div className="relative">
							<input
								type="date"
								id="startDate"
								value={startDate}
								onChange={(e) => handleDateChange(e.target.value)}
								className={`w-full rounded-lg border ${
									dateError ? "border-destructive" : "border-border"
								} bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
								disabled={isLoading}
							/>
							<Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
						</div>
						{dateError && <p className="mt-2 text-sm text-destructive">{dateError}</p>}
					</div>

					{startDate && !dateError && (
						<div className="rounded-lg border border-border bg-muted/50 p-4">
							<p className="text-sm font-medium mb-2">Durasi Periode</p>
							<p className="text-sm text-muted-foreground">
								{new Date(startDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
								{" → "}
								{new Date(endDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
							</p>
						</div>
					)}

					{error && (
						<div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					<div className="pt-2">
						<button
							type="submit"
							disabled={isLoading || !!dateError}
							className="w-full rounded-lg bg-primary px-4 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Membuat...
								</span>
							) : (
								"Mulai Periode"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
