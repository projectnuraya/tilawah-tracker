import { landingCopy } from '@/components/landing/copy'
import type { Metadata } from 'next'
import Link from 'next/link'

const {
	appName: APP_NAME,
	appUrl: APP_URL,
	company: COMPANY,
	contactEmail: CONTACT_EMAIL,
	lastUpdated: LAST_UPDATED,
} = landingCopy.legal

export const metadata: Metadata = {
	title: 'Kebijakan Privasi — Tilawah Tracker',
	description: 'Kebijakan privasi Tilawah Tracker: bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.',
}

export default function PrivacyPolicyPage() {
	return (
		<div className='max-w-3xl mx-auto px-4 md:px-8'>
			{/* Header */}
			<div className='mb-12'>
				<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-background text-primary text-xs font-semibold uppercase tracking-wider mb-4'>
					Legal
				</div>
				<h1 className='text-3xl md:text-4xl font-bold text-foreground mb-3'>Kebijakan Privasi</h1>
				<p className='text-muted-foreground text-sm'>
					Terakhir diperbarui: <span className='font-medium text-foreground'>{LAST_UPDATED}</span>
				</p>
			</div>

			<div className='prose prose-stone max-w-none space-y-10'>
				{/* 1. Pendahuluan */}
				<Section title='1. Pendahuluan'>
					<p>
						Selamat datang di <strong>{APP_NAME}</strong>. Kebijakan Privasi ini menjelaskan bagaimana{' '}
						<strong>{COMPANY}</strong> (&quot;kami&quot;, &quot;milik kami&quot;) mengumpulkan, menggunakan, dan
						melindungi informasi Anda saat Anda menggunakan layanan {APP_NAME} yang tersedia di{' '}
						<a href={APP_URL} className='text-primary hover:underline'>
							{APP_URL}
						</a>
						.
					</p>
					<p>Dengan menggunakan layanan kami, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.</p>
				</Section>

				{/* 2. Data yang Kami Kumpulkan */}
				<Section title='2. Data yang Kami Kumpulkan'>
					<p>Kami hanya mengumpulkan data yang diperlukan untuk mengoperasikan layanan:</p>

					<Subsection title='2.1 Data Akun Koordinator (Google OAuth)'>
						<p>Ketika Anda masuk menggunakan akun Google, kami menerima dari Google informasi berikut:</p>
						<ul>
							<li>
								<strong>Nama lengkap</strong> — untuk mengidentifikasi akun koordinator
							</li>
							<li>
								<strong>Alamat email Google</strong> — sebagai identitas unik akun Anda
							</li>
							<li>
								<strong>Foto profil Google</strong> — ditampilkan di antarmuka koordinator
							</li>
						</ul>
						<p>
							Kami tidak menyimpan kata sandi Anda. Autentikasi sepenuhnya dikelola oleh Google melalui protokol
							OAuth 2.0.
						</p>
					</Subsection>

					<Subsection title='2.2 Data Anggota Kelompok'>
						<p>Koordinator memasukkan data anggota kelompok tilawah secara manual. Data ini meliputi:</p>
						<ul>
							<li>
								<strong>Nama anggota</strong> — wajib, digunakan untuk identifikasi dalam kelompok
							</li>
							<li>
								<strong>Nomor WhatsApp</strong> — opsional, hanya terlihat oleh koordinator, digunakan untuk fitur
								pengingat via link <code className='bg-muted px-1 rounded text-sm'>wa.me</code>
							</li>
						</ul>
						<p>
							<strong>Nomor WhatsApp tidak pernah ditampilkan di halaman publik</strong> dan hanya dapat diakses
							oleh koordinator yang sudah terautentikasi.
						</p>
					</Subsection>

					<Subsection title='2.3 Data Penggunaan Teknis'>
						<p>
							Kami menggunakan <strong>Google Analytics</strong> untuk memahami penggunaan aplikasi secara agregat
							(misalnya, jumlah pengunjung, halaman yang dikunjungi). Google Analytics mengumpulkan data anonim
							melalui cookie. Anda dapat menonaktifkan ini melalui pengaturan browser atau ekstensi pemblokir
							analytics.
						</p>
					</Subsection>
				</Section>

				{/* 3. Cara Kami Menggunakan Data */}
				<Section title='3. Cara Kami Menggunakan Data'>
					<p>Data yang kami kumpulkan digunakan semata-mata untuk:</p>
					<ul>
						<li>Mengautentikasi dan mengidentifikasi akun koordinator</li>
						<li>Mengoperasikan fitur pelacakan tilawah (kelompok, anggota, periode, progress)</li>
						<li>Menghasilkan link pengingat WhatsApp untuk koordinator</li>
						<li>Menampilkan progress kelompok di halaman publik (tanpa data pribadi)</li>
						<li>Memahami cara penggunaan aplikasi untuk peningkatan layanan</li>
					</ul>
					<p>
						<strong>Kami tidak menjual, menyewakan, atau berbagi data Anda</strong> dengan pihak ketiga untuk tujuan
						komersial.
					</p>
				</Section>

				{/* 4. Berbagi Data dengan Pihak Ketiga */}
				<Section title='4. Berbagi Data dengan Pihak Ketiga'>
					<p>Kami berbagi data hanya dengan penyedia layanan teknis berikut:</p>
					<ul>
						<li>
							<strong>Google (OAuth & Analytics)</strong> — untuk autentikasi dan analitik anonim. Kebijakan privasi
							Google berlaku:{' '}
							<a
								href='https://policies.google.com/privacy'
								target='_blank'
								rel='noopener noreferrer'
								className='text-primary hover:underline'>
								policies.google.com/privacy
							</a>
						</li>
						<li>
							<strong>Penyedia hosting & database</strong> — server tempat data aplikasi disimpan, dengan perjanjian
							keamanan data yang sesuai
						</li>
					</ul>
				</Section>

				{/* 5. Penyimpanan & Keamanan */}
				<Section title='5. Penyimpanan & Keamanan'>
					<ul>
						<li>Data disimpan di server yang dikelola oleh tim pengembang</li>
						<li>Koneksi ke aplikasi menggunakan HTTPS/TLS untuk enkripsi data dalam transit</li>
						<li>Akses ke data terproteksi oleh sistem autentikasi (hanya koordinator yang login)</li>
						<li>
							Halaman publik kelompok dilindungi oleh <em>unlisted token</em> yang unik dan permanen — hanya orang
							yang memiliki link yang dapat mengaksesnya
						</li>
					</ul>
					<p>
						Meskipun kami menerapkan langkah keamanan yang wajar, tidak ada sistem yang 100% aman. Kami mendorong Anda
						untuk tidak membagikan link publik kelompok secara sembarangan.
					</p>
				</Section>

				{/* 6. Hak Pengguna */}
				<Section title='6. Hak Pengguna'>
					<p>Sebagai koordinator, Anda berhak untuk:</p>
					<ul>
						<li>
							<strong>Mengakses</strong> data yang tersimpan tentang akun dan kelompok Anda
						</li>
						<li>
							<strong>Memperbarui atau menghapus</strong> data anggota kelompok melalui antarmuka aplikasi
						</li>
						<li>
							<strong>Meminta penghapusan akun</strong> — hubungi kami melalui email di bawah ini dan kami akan
							menghapus data akun Anda dalam 30 hari kerja
						</li>
					</ul>
				</Section>

				{/* 7. Anak-Anak */}
				<Section title='7. Pengguna di Bawah Umur'>
					<p>
						Layanan ini ditujukan untuk koordinator dewasa. Kami tidak secara sengaja mengumpulkan data pribadi dari
						anak-anak di bawah 13 tahun sebagai pengguna terautentikasi. Data anggota kelompok (nama) yang dimasukkan
						oleh koordinator adalah tanggung jawab koordinator tersebut.
					</p>
				</Section>

				{/* 8. Perubahan Kebijakan */}
				<Section title='8. Perubahan Kebijakan'>
					<p>
						Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Jika ada perubahan material, kami akan
						memperbarui tanggal &quot;Terakhir diperbarui&quot; di bagian atas halaman ini. Penggunaan layanan yang
						terus-menerus setelah perubahan dianggap sebagai persetujuan Anda.
					</p>
				</Section>

				{/* 9. Kontak */}
				<Section title='9. Hubungi Kami'>
					<p>
						Jika Anda memiliki pertanyaan atau permintaan terkait kebijakan privasi atau data Anda, silakan hubungi
						kami di:
					</p>
					<div className='bg-muted rounded-lg p-4 mt-2'>
						<p className='font-semibold text-foreground'>{COMPANY}</p>
						<a href={`mailto:${CONTACT_EMAIL}`} className='text-primary hover:underline'>
							{CONTACT_EMAIL}
						</a>
					</div>
				</Section>

				{/* Divider */}
				<div className='border-t border-border pt-8'>
					<p className='text-sm text-muted-foreground'>
						Dengan menggunakan {APP_NAME}, Anda menyatakan telah membaca, memahami, dan menyetujui Kebijakan Privasi
						ini. Lihat juga{' '}
						<Link href='/terms-of-service' className='text-primary hover:underline'>
							Syarat & Ketentuan
						</Link>{' '}
						kami.
					</p>
				</div>
			</div>
		</div>
	)
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section>
			<h2 className='text-xl font-bold text-foreground mb-4 pb-2 border-b border-border'>{title}</h2>
			<div className='space-y-3 text-muted-foreground leading-relaxed'>{children}</div>
		</section>
	)
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className='mt-5'>
			<h3 className='text-base font-semibold text-foreground mb-2'>{title}</h3>
			<div className='space-y-2'>{children}</div>
		</div>
	)
}
