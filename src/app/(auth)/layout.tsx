import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/components/lib/auth";
import Link from "next/link";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/auth/signin");
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
				<div className="container mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
					<Link href="/dashboard" className="font-semibold text-lg text-primary">
						📖 Tilawah Tracker
					</Link>
					<nav className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground hidden sm:inline">{session.user?.name}</span>
						<Link href="/api/auth/signout" className="text-sm text-destructive hover:underline">
							Logout
						</Link>
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto max-w-3xl px-4 py-6">{children}</main>

			{/* Mobile Bottom Navigation (placeholder for future) */}
			{/* <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface sm:hidden">
        Mobile nav items here
      </nav> */}
		</div>
	);
}
