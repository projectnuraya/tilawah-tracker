import Link from "next/link";

export default function HomePage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
			<div className="w-full max-w-md text-center space-y-6">
				<h1 className="text-4xl font-semibold text-foreground">📖 Tilawah Tracker</h1>
				<p className="text-lg text-muted-foreground">Track group Qur&apos;an reading progress for &quot;One Week One Juz&quot; programs.</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
					<Link
						href="/auth/signin"
						className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90"
					>
						Coordinator Login
					</Link>
				</div>

				<p className="text-sm text-muted-foreground mt-8">Have a public link? Paste it directly in your browser to view group progress.</p>
			</div>
		</div>
	);
}
