"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyTokenButtonProps {
	url: string;
}

export function CopyTokenButton({ url }: CopyTokenButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<button
			onClick={handleCopy}
			className="rounded-lg border border-border p-2 hover:bg-muted transition"
			title={copied ? "Copied!" : "Copy link"}
		>
			{copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
		</button>
	);
}
