import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	reactCompiler: true,
	headers: async () => [
		{
			source: '/(.*)',
			headers: [
				{ key: 'X-Content-Type-Options', value: 'nosniff' },
				{ key: 'X-Frame-Options', value: 'DENY' },
				// Public group links get pasted into WhatsApp; keep the unlisted token out of the
				// Referer header when someone follows an outbound link from those pages.
				{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
				{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
			],
		},
	],
}

export default nextConfig
