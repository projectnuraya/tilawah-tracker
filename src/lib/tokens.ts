import { randomBytes } from "crypto";

/**
 * Generate a random public token for group access
 * Format: 32 characters, alphanumeric (0-9, a-z, A-Z)
 * Example: kJ8mP2nQ5rT9wX3yZ6aB4cD7eF1gH0iJ
 */
export function generatePublicToken(): string {
	const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const bytes = randomBytes(32);
	let token = "";

	for (let i = 0; i < 32; i++) {
		token += chars[bytes[i] % chars.length];
	}

	return token;
}
