import { randomBytes } from 'crypto'

/**
 * Generate a readable public token for group access sharing
 *
 * Format: 2 Qur'an-themed words (separated by '-') + random alphanumeric suffix = 32 chars total
 * Examples: hikmah-nur-aB3k9xY7p2WFD32, sabar-taqwa-X1p2K9qZ5wL8vM3n
 */
export function generatePublicToken(): string {
	const quranWords = [
		'hikmah',
		'nur',
		'sabar',
		'iman',
		'taqwa',
		'rahman',
		'sholat',
		'zakat',
		'haji',
		'jihad',
		'quran',
		'sunnah',
		'doa',
		'ayat',
		'surat',
		'khusyu',
		'tauhid',
		'berkah',
		'rahim',
		'alim',
		'hakim',
		'muhsin',
		'muhajir',
		'ansar',
		'muhajirin',
		'muhajirat',
		'muslimin',
		'muslimat',
		'akhlak',
		'amal',
		'dzikir',
		'fardhu',
		'halal',
		'haram',
		'ibadah',
		'istiqamah',
		'qiyam',
		'taubat',
		'jannah',
		'syukur',
		'ikhlas',
		'ridho',
		'tawakal',
		'ukhuwah',
		'ikhwan',
		'akhwat',
		'sedekah',
		'shaum',
		'tahajud',
		'tilawah',
		'murottal',
		'sholawat',
		'ramadhan',
		'fajar',
	]

	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

	// Pick two random words and ensure total length fits in 32 chars
	let word1: string, word2: string, base: string, randomLength: number
	do {
		word1 = quranWords[Math.floor(Math.random() * quranWords.length)]
		word2 = quranWords[Math.floor(Math.random() * quranWords.length)]
		base = `${word1}-${word2}-`
		randomLength = 32 - base.length
	} while (randomLength <= 0)

	// Generate random suffix using cryptographically secure bytes
	const bytes = randomBytes(randomLength)
	let randomPart = ''
	for (let i = 0; i < randomLength; i++) {
		randomPart += chars[bytes[i] % chars.length]
	}

	return base + randomPart
}
