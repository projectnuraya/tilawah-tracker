"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function DummyLogin() {
	const { data: session } = useSession();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
			<h1 className="text-2xl font-bold">DUMMY Login Page</h1>

			{session ? (
				<div className="flex flex-col items-center gap-4 border p-6 rounded-lg bg-green-50 dark:bg-green-900/20">
					<p className="text-lg">
						Signed in as <span className="font-bold">{session.user?.email}</span>
					</p>
					{session.user?.image && <img src={session.user.image} alt="User Avatar" className="w-16 h-16 rounded-full" />}
					<button onClick={() => signOut()} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
						Sign out
					</button>
				</div>
			) : (
				<div className="flex flex-col items-center gap-4 border p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
					<p className="text-gray-500">Not signed in</p>
					<button
						onClick={() => signIn("google")}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
					>
						Sign in with Google
					</button>
				</div>
			)}
		</div>
	);
}
