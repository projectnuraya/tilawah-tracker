/**
 * Demo-mode flag, deliberately kept in its own module with no imports.
 *
 * The sign-in page is a client component and needs this check. It used to import it from
 * `demo-auth.ts`, which imports `db.ts` (constructing a `PrismaClient` at module scope) and the
 * Pino logger — so both were pulled into the browser bundle. Anything imported from a
 * `'use client'` file must be able to run in a browser; keep this file free of server imports.
 */
export function isDemoMode(): boolean {
	return process.env.NEXT_PUBLIC_IS_DEMO === 'true'
}

/** The single account demo mode signs in as. */
export const DEMO_EMAIL = 'demo@example.com'
