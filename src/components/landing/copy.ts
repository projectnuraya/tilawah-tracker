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
		requestAccess: 'Minta Akses',
	},

	// ===========================
	// HERO SECTION
	// ===========================
	hero: {
		badge: 'Solusi Modern Komunitas Mengaji',
		headline: 'Kelola Tilawah Kelompok,',
		headlineAccent: 'Tanpa Ribet',
		subheadline:
			'Pantau progres tilawah satu minggu satu juz. Atur jadwal rotasi otomatis dan fokus ibadah tanpa pusing administrasi manual.',
		primaryCta: 'Minta Akses Sekarang',
		secondaryCta: 'Masuk dengan Google',
		mailto: {
			email: 'hello@projectnuraya.id',
			subject: 'Permintaan Akses Koordinator',
			body: "Assalamu'alaikum,\n\nSaya ingin mendaftar sebagai koordinator di Tilawah Tracker.\n\nNama: \nEmail: \nNama Kelompok: \nJumlah Anggota: \n\nTerima kasih.",
		},
		trustItems: [{ label: 'Data Aman & Terenkripsi' }, { label: 'Setup Cepat' }],
	},

	// ===========================
	// PAIN POINTS
	// ===========================
	painPoints: {
		sectionId: 'tentang',
		heading: 'Masih Pakai Cara Lama?',
		subheading: 'Jangan biarkan masalah administrasi menghambat kekhusyukan ibadah kelompok Anda.',
		items: [
			{
				title: 'Laporan di WA',
				description: 'Chat grup tenggelam, koordinator harus scroll jauh ke atas untuk merekap satu per satu.',
			},
			{
				title: 'Data Tercecer',
				description:
					'Tidak ada riwayat tilawah yang tersimpan rapi. Siapa yang rajin, siapa yang bolong, tidak terlacak.',
			},
			{
				title: 'Lupa Giliran Juz',
				description: 'Peserta sering bertanya "Minggu ini saya Juz berapa?" karena tidak ada dashboard terpusat.',
			},
			{
				title: 'Koordinator Pusing',
				description: 'Menghabiskan waktu berjam-jam tiap pekan hanya untuk mencatat setoran manual.',
			},
		],
	},

	// ===========================
	// SOLUTIONS
	// ===========================
	solutions: {
		heading: 'Ada Cara yang Lebih Baik',
		label: 'Solusi Cerdas',
		items: [
			{
				title: 'Data Tersimpan Aman',
				description: 'Semua data tersimpan rapi di cloud dan bisa diakses kapan saja oleh koordinator.',
			},
			{
				title: 'Pembagian Jelas',
				description: 'Setiap anggota tahu persis juz-nya melalui dashboard. Pembagian otomatis bergilir setiap periode.',
			},
			{
				title: 'Update Satu Klik',
				description: 'Update progress semudah memilih status. Langsung tersimpan dan terupdate real-time.',
			},
			{
				title: 'Rotasi Otomatis',
				description: 'Sistem mengurutkan pembagian juz periode berikutnya secara otomatis. Juz 30 kembali ke Juz 1.',
			},
		],
	},

	// ===========================
	// PROGRAM EXPLANATION
	// ===========================
	program: {
		heading: 'Program Satu Minggu Satu Juz',
		description:
			"Metode efektif untuk menjaga konsistensi tilawah secara berjamaah. Setiap anggota membaca satu juz Al-Qur'an dalam satu minggu, dengan 30 juz yang digilir secara berurutan.",
		stats: [
			{ value: '30', label: "Juz Al-Qur'an" },
			{ value: '7', label: 'Hari dalam Seminggu' },
			{ value: '∞', label: 'Rotasi Otomatis' },
		],
	},

	// ===========================
	// HOW IT WORKS
	// ===========================
	howItWorks: {
		sectionId: 'cara-kerja',
		heading: 'Cara Kerja Sederhana',
		subheading: 'Mulai dalam hitungan menit, bukan jam.',
		steps: [
			{
				title: '1. Masuk & Daftar',
				description: 'Login menggunakan akun Google Anda. Cepat dan aman tanpa perlu ingat password baru.',
			},
			{
				title: '2. Buat Kelompok',
				description: 'Buat grup baru, tambahkan anggota, dan sistem akan otomatis membagi juz secara merata.',
			},
			{
				title: '3. Mulai Tilawah',
				description: 'Sistem membagikan juz secara otomatis. Pantau progress dan bagikan hasilnya ke WhatsApp.',
			},
		],
	},

	// ===========================
	// FEATURES GRID
	// ===========================
	features: {
		sectionId: 'fitur',
		heading: 'Fitur Lengkap',
		items: [
			{
				title: 'Rotasi Juz Pintar',
				description:
					'Juz bergilir otomatis setiap periode baru. Juz 1 ke Juz 2, Juz 30 kembali ke Juz 1. Tidak perlu atur manual.',
			},
			{
				title: 'Integrasi WhatsApp',
				description:
					'Salin rekap laporan dengan satu klik — format teks rapi dengan emoji 👑 dan 💔, siap paste ke grup WhatsApp.',
			},
			{
				title: 'Tampilan Publik',
				description:
					'Bagikan link "Lihat Saja" agar anggota bisa memantau progress kelompok tanpa perlu login. Cukup buka di browser.',
			},
			{
				title: 'Pelacakan Progress',
				description:
					'Lihat siapa yang sudah selesai 👑, siapa yang terlewat 💔, dan siapa yang belum selesai — semua real-time.',
			},
			{
				title: 'Penguncian Periode',
				description:
					'Kunci periode yang sudah berakhir agar tidak bisa diedit lagi. Status "belum selesai" otomatis jadi "terlewat 💔".',
			},
			{
				title: 'Streak Counter',
				description: 'Lacak berapa kali berturut-turut seseorang melewatkan juz. Ditampilkan sebagai 💔×2, 💔×3, dst.',
			},
		],
	},

	// ===========================
	// SCREENSHOT GALLERY
	// ===========================
	gallery: {
		sectionId: 'galeri',
		heading: 'Tampilan Aplikasi',
		subheading: 'Simpel, bersih, dan fokus pada ibadah.',
		items: [
			{
				label: 'Dashboard Admin',
				type: 'desktop' as const,
			},
			{
				label: 'Mobile View',
				type: 'mobile' as const,
			},
			{
				label: 'Progress Grup',
				type: 'mobile' as const,
			},
		],
	},

	// ===========================
	// FINAL CTA
	// ===========================
	finalCta: {
		heading: 'Siap Mulai Kelola Tilawah Kelompok?',
		description:
			'Saat ini Tilawah Tracker dalam tahap public beta — siapa pun bisa mencoba dengan menghubungi kami. Kirim permintaan akses dan mulai kelola tilawah kelompok Anda secara digital.',
		primaryButton: 'Minta Akses Sekarang',
		secondaryButton: 'Masuk dengan Google',
		note: 'Pendaftaran mandiri segera hadir ✨',
	},

	// ===========================
	// FOOTER
	// ===========================
	footer: {
		brand: 'Tilawah Tracker',
		tagline:
			"Platform manajemen tilawah digital untuk memudahkan komunitas Muslim menjaga istiqomah dalam berinteraksi dengan Al-Qur'an.",
		contactHeading: 'Hubungi Kami',
		contactEmail: 'hello@projectnuraya.id',
		linksHeading: 'Menu',
		links: [
			{ label: 'Tentang', href: '/about' },
			{ label: 'Privasi', href: '/privacy-policy' },
			{ label: 'Syarat & Ketentuan', href: '/terms-of-service' },
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

	// ===========================
	// LEGAL (shared across legal pages)
	// ===========================
	legal: {
		appName: 'Tilawah Tracker',
		appUrl: 'https://tilawah.projectnuraya.id',
		company: 'PT Nuraya Digital Nusantara (Project Nuraya)',
		contactEmail: 'hello@projectnuraya.id',
		lastUpdated: '24 Februari 2026',
	},
} as const
