import { randomBytes } from 'crypto'

/**
 * Generate a more readable public token for group access
 * Format: 2 Qur'an-themed words in Bahasa Indonesia + '-' + random fill to 32 characters total
 * Random part alphanumeric (0-9, a-z, A-Z)
 * Example: hikmah-nur-aB3k9xY7p2WFD32
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
	]

	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

	// Keep regenerating until we get a pair that fits within 32 chars
	let word1: string, word2: string, base: string, randomLength: number
	do {
		word1 = quranWords[Math.floor(Math.random() * quranWords.length)]
		word2 = quranWords[Math.floor(Math.random() * quranWords.length)]
		base = `${word1}-${word2}-`
		randomLength = 32 - base.length
	} while (randomLength <= 0)

	const bytes = randomBytes(randomLength)
	let randomPart = ''
	for (let i = 0; i < randomLength; i++) {
		randomPart += chars[bytes[i] % chars.length]
	}

	return base + randomPart
}
