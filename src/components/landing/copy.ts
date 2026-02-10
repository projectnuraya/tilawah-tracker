/**
 * Landing Page Copy Content
 *
 * All Indonesian text content for the landing page.
 * Reviewed and approved before implementation.
 */

export const landingCopy = {
	// ===========================
	// NAVBAR
	// ===========================
	nav: {
		brand: 'Tilawah Tracker',
		links: [
			{ label: 'Tentang', href: '#tentang' },
			{ label: 'Cara Kerja', href: '#cara-kerja' },
			{ label: 'Fitur', href: '#fitur' },
			{ label: 'Galeri', href: '#galeri' },
		],
		loginButton: 'Masuk',
		loginHref: '/auth/signin',
	},

	// ===========================
	// HERO SECTION
	// ===========================
	hero: {
		headline: 'Kelola Tilawah Kelompok, Tanpa Ribet',
		subheadline:
			'Platform digital untuk program satu minggu satu juz. Pantau progress anggota, bagikan ke WhatsApp, dan jaga komitmen kelompok — semua dalam satu tempat.',
		primaryCta: 'Minta Akses Koordinator',
		secondaryCta: 'Pelajari Lebih Lanjut',
		mailto: {
			email: 'hello@projectnuraya.id',
			subject: 'Permintaan Akses Koordinator',
			body: "Assalamu'alaikum,\n\nSaya ingin mendaftar sebagai koordinator di Tilawah Tracker.\n\nNama: \nEmail: \nNama Kelompok: \nJumlah Anggota: \n\nTerima kasih.",
		},
	},

	// ===========================
	// PROGRAM EXPLANATION
	// ===========================
	program: {
		sectionId: 'tentang',
		heading: 'Apa itu Satu Minggu Satu Juz?',
		description:
			"Satu Minggu Satu Juz adalah program tilawah berkelompok di mana setiap anggota membaca satu juz Al-Qur'an dalam waktu satu minggu. Dengan 30 juz yang digilir secara berurutan, setiap anggota memiliki tanggung jawab yang jelas. Sistem kelompok menciptakan semangat kebersamaan dan komitmen — ketika satu orang terlewat, yang lain bisa saling mengingatkan.",
		stats: [
			{
				value: '30',
				label: "Juz dalam Al-Qur'an",
				description: 'Digilir secara berurutan antar anggota setiap minggunya',
			},
			{
				value: '7',
				label: 'Hari per Periode',
				description: 'Senin sampai Ahad, satu siklus penuh setiap minggu',
			},
			{
				value: '∞',
				label: 'Rotasi Otomatis',
				description: 'Pembagian juz bergulir otomatis setiap periode baru',
			},
		],
	},

	// ===========================
	// PROBLEM vs SOLUTION
	// ===========================
	problemSolution: {
		heading: 'Dari Kerepotan ke Kemudahan',
		problem: {
			title: 'Cara Lama',
			items: [
				'Catatan progress hilang tenggelam di chat WhatsApp',
				'Lupa siapa dapat juz berapa minggu ini',
				'Update status satu per satu secara manual tiap minggu',
				'Tidak ada riwayat — siapa yang rajin, siapa yang sering terlewat?',
			],
		},
		solution: {
			title: 'Dengan Tilawah Tracker',
			items: [
				'Semua data tersimpan rapi dan bisa diakses kapan saja',
				'Pembagian juz jelas, otomatis bergilir setiap periode',
				'Update progress cukup sekali klik, langsung tersimpan',
				'Riwayat lengkap per periode — lihat perkembangan setiap anggota',
			],
		},
	},

	// ===========================
	// HOW IT WORKS
	// ===========================
	howItWorks: {
		sectionId: 'cara-kerja',
		heading: 'Cara Kerja',
		steps: [
			{
				title: 'Masuk dengan Google',
				description: 'Login cukup dengan akun Google. Tidak perlu buat akun baru atau hafal password tambahan.',
			},
			{
				title: 'Buat Grup & Tambah Anggota',
				description: 'Buat grup tilawah, tambahkan anggota, dan sistem akan otomatis membagi juz secara merata.',
			},
			{
				title: 'Mulai Periode & Pantau',
				description:
					'Buat periode mingguan, pantau progress anggota, dan bagikan hasilnya ke WhatsApp dengan sekali klik.',
			},
		],
	},

	// ===========================
	// FEATURES GRID
	// ===========================
	features: {
		sectionId: 'fitur',
		heading: 'Fitur Unggulan',
		items: [
			{
				title: 'Rotasi Juz Otomatis',
				description:
					'Juz bergilir otomatis setiap periode baru. Juz 1 ke Juz 2, Juz 30 kembali ke Juz 1. Tidak perlu atur manual lagi.',
			},
			{
				title: 'Integrasi WhatsApp',
				description:
					'Salin rangkuman progress dalam format rapi, lengkap dengan emoji 👑 dan 💔, langsung tempel ke grup WhatsApp.',
			},
			{
				title: 'Tampilan Publik',
				description:
					'Bagikan link khusus agar anggota bisa melihat progress kelompok sendiri tanpa perlu login. Cukup buka di browser.',
			},
			{
				title: 'Pelacakan Progress',
				description:
					'Lihat siapa yang sudah selesai 👑, siapa yang terlewat 💔, dan siapa yang masih belum selesai — semua real-time.',
			},
			{
				title: 'Penguncian Periode',
				description:
					'Kunci periode yang sudah berakhir agar tidak bisa diedit lagi. Status "belum selesai" otomatis jadi "terlewat 💔".',
			},
			{
				title: 'Streak Counter',
				description:
					'Lacak berapa kali berturut-turut seseorang melewatkan juz. Ditampilkan sebagai 💔×2, 💔×3, dan seterusnya.',
			},
		],
	},

	// ===========================
	// SCREENSHOT GALLERY
	// ===========================
	gallery: {
		sectionId: 'galeri',
		heading: 'Lihat Aplikasinya',
		subheading: 'Antarmuka sederhana yang mudah digunakan siapa saja',
		items: [
			{
				label: 'Dashboard Koordinator',
				caption: 'Kelola semua grup tilawah dari satu dashboard',
				type: 'desktop' as const,
			},
			{
				label: 'Tracking Periode',
				caption: 'Pantau progress mingguan dengan status real-time',
				type: 'mobile' as const,
			},
			{
				label: 'Bagikan ke WhatsApp',
				caption: 'Format berbagi ke WhatsApp dengan emoji 👑 dan 💔',
				type: 'mobile' as const,
			},
			{
				label: 'Tampilan Publik',
				caption: 'Tampilan publik untuk anggota kelompok tanpa login',
				type: 'tablet' as const,
			},
		],
	},

	// ===========================
	// TRUST BADGES
	// ===========================
	trust: {
		badges: [{ label: 'Aman dengan Google OAuth' }, { label: 'Data Tersimpan Aman' }, { label: 'Dibuat untuk Komunitas' }],
	},

	// ===========================
	// FINAL CTA
	// ===========================
	finalCta: {
		heading: 'Siap Mulai Kelola Tilawah Kelompok?',
		description:
			'Saat ini Tilawah Tracker dalam tahap public beta — siapa pun bisa mencoba dengan menghubungi kami. Kirim permintaan akses dan mulai kelola tilawah kelompok Anda secara digital.',
		buttonText: 'Kirim Permintaan Akses',
		note: 'Pendaftaran mandiri segera hadir ✨',
	},

	// ===========================
	// FOOTER
	// ===========================
	footer: {
		brand: 'Project Nuraya',
		tagline: 'Platform Tilawah Kelompok Digital',
		contactHeading: 'Kontak',
		contactEmail: 'hello@projectnuraya.id',
		linksHeading: 'Informasi',
		links: [
			{ label: 'Tentang', note: 'Coming Soon' },
			{ label: 'Privasi', note: 'Coming Soon' },
			{ label: 'Syarat & Ketentuan', note: 'Coming Soon' },
		],
		copyright: `© ${new Date().getFullYear()} PT Nuraya Digital Nusantara (Project Nuraya). Dibuat dengan ❤️ untuk komunitas Muslim.`,
	},

	// ===========================
	// META / SEO
	// ===========================
	meta: {
		title: 'Tilawah Tracker — Kelola Tilawah Kelompok Satu Minggu Satu Juz',
		description:
			'Platform digital untuk mengelola program tilawah kelompok satu minggu satu juz. Lacak progress, bagikan ke WhatsApp, dan tingkatkan komitmen bersama.',
		ogTitle: 'Tilawah Tracker — Kelola Tilawah Kelompok',
		ogDescription: 'Platform digital untuk program satu minggu satu juz. Mudah, cepat, dan transparan.',
		url: 'https://tilawah.projectnuraya.id',
	},
} as const
