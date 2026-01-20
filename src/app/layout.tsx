import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Tilawah Tracker",
	description: "Track group tilawah progress for One Week One Juz programs",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
