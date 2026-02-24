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
	title: 'Syarat & Ketentuan — Tilawah Tracker',
	description: 'Syarat dan ketentuan penggunaan Tilawah Tracker. Baca sebelum menggunakan layanan kami.',
}

export default function TermsOfServicePage() {
	return (
		<div className='max-w-3xl mx-auto px-4 md:px-8'>
			{/* Header */}
			<div className='mb-12'>
				<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-background text-primary text-xs font-semibold uppercase tracking-wider mb-4'>
					Legal
				</div>
				<h1 className='text-3xl md:text-4xl font-bold text-foreground mb-3'>Syarat & Ketentuan</h1>
				<p className='text-muted-foreground text-sm'>
					Terakhir diperbarui: <span className='font-medium text-foreground'>{LAST_UPDATED}</span>
				</p>
			</div>

			<div className='prose prose-stone max-w-none space-y-10'>
				{/* 1. Penerimaan */}
				<Section title='1. Penerimaan Syarat'>
					<p>
						Dengan mengakses atau menggunakan <strong>{APP_NAME}</strong> yang tersedia di{' '}
						<a href={APP_URL} className='text-primary hover:underline'>
							{APP_URL}
						</a>
						, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan salah satu
						bagian dari syarat ini, Anda tidak diizinkan untuk menggunakan layanan ini.
					</p>
					<p>
						Layanan disediakan oleh <strong>{COMPANY}</strong> (&quot;kami&quot;, &quot;Pengelola&quot;).
					</p>
				</Section>

				{/* 2. Deskripsi Layanan */}
				<Section title='2. Deskripsi Layanan'>
					<p>
						{APP_NAME} adalah platform web untuk membantu koordinator mengelola program tilawah Al-Qur&apos;an
						berkelompok, termasuk pelacakan progress per anggota, pembagian juz otomatis, dan berbagi hasil ke
						WhatsApp.
					</p>
					<p>Terdapat dua jenis pengguna:</p>
					<ul>
						<li>
							<strong>Koordinator</strong> — pengguna terautentikasi yang mengelola kelompok, anggota, dan periode
							tilawah
						</li>
						<li>
							<strong>Penonton Publik</strong> — siapa pun yang memiliki link kelompok, dapat melihat progress tanpa
							login
						</li>
					</ul>
				</Section>

				{/* 3. Penggunaan yang Diizinkan */}
				<Section title='3. Penggunaan yang Diizinkan'>
					<p>Anda boleh menggunakan {APP_NAME} untuk:</p>
					<ul>
						<li>Mengelola program tilawah Al-Qur&apos;an kelompok secara internal</li>
						<li>Berbagi progress tilawah anggota kelompok melalui link publik atau WhatsApp</li>
						<li>Keperluan komunitas atau kegiatan keagamaan non-komersial</li>
					</ul>
					<p>
						Anda <strong>dilarang</strong> menggunakan layanan untuk:
					</p>
					<ul>
						<li>
							Menyimpan data pribadi anggota yang tidak relevan dengan program tilawah (misalnya, nomor rekening,
							KTP, dll.)
						</li>
						<li>Menggunakan layanan untuk tujuan komersial tanpa izin tertulis dari Pengelola</li>
						<li>Melakukan rekayasa balik, scraping, atau mengeksploitasi kerentanan sistem</li>
						<li>Memberikan akses akun koordinator kepada pihak yang tidak berwenang</li>
						<li>Melanggar hak privasi anggota kelompok Anda</li>
					</ul>
				</Section>

				{/* 4. Akun Koordinator */}
				<Section title='4. Akun Koordinator & Tanggung Jawab Pengguna'>
					<p>
						Akun koordinator diberikan secara manual oleh tim Pengelola. Sebagai koordinator, Anda bertanggung jawab
						untuk:
					</p>
					<ul>
						<li>Menjaga kerahasiaan sesi login Anda dan tidak membagikan akses ke pihak lain</li>
						<li>
							Memastikan data anggota yang Anda masukkan (nama, nomor WhatsApp) telah mendapat persetujuan dari
							anggota yang bersangkutan
						</li>
						<li>
							Menggunakan link publik kelompok secara bertanggung jawab — hanya bagikan kepada orang yang memang
							ingin melihat progress kelompok
						</li>
						<li>Segera melaporkan kepada kami jika terdapat akses tidak sah ke akun Anda</li>
					</ul>
					<p>
						Pengelola berhak menangguhkan atau menghapus akun koordinator yang melanggar ketentuan ini tanpa
						pemberitahuan sebelumnya.
					</p>
				</Section>

				{/* 5. Konten & Data */}
				<Section title='5. Konten & Data Pengguna'>
					<p>
						Anda mempertahankan kepemilikan atas data yang Anda masukkan ke dalam sistem (nama anggota, progress,
						dll.). Dengan menggunakan layanan ini, Anda memberikan kami lisensi terbatas untuk menyimpan dan memproses
						data tersebut semata-mata untuk mengoperasikan layanan.
					</p>
					<p>
						Kami tidak menggunakan data anggota kelompok Anda untuk tujuan lain selain operasional layanan,
						sebagaimana dijelaskan dalam{' '}
						<Link href='/privacy-policy' className='text-primary hover:underline'>
							Kebijakan Privasi
						</Link>{' '}
						kami.
					</p>
				</Section>

				{/* 6. Ketersediaan Layanan */}
				<Section title='6. Ketersediaan Layanan'>
					<p>
						Kami berupaya menjaga ketersediaan layanan secara berkelanjutan, namun tidak dapat menjamin uptime 100%.
						Pengelola berhak untuk:
					</p>
					<ul>
						<li>Melakukan pemeliharaan yang dapat menyebabkan gangguan sementara</li>
						<li>Memodifikasi, menunda, atau menghentikan layanan — dengan atau tanpa pemberitahuan</li>
						<li>Membatasi penggunaan jika layanan mengalami penyalahgunaan</li>
					</ul>
					<p>
						Saat ini {APP_NAME} berada dalam fase <em>public beta</em>. Fitur dan tampilan dapat berubah
						sewaktu-waktu.
					</p>
				</Section>

				{/* 7. Pembatasan Tanggung Jawab */}
				<Section title='7. Pembatasan Tanggung Jawab'>
					<p>
						Layanan ini disediakan <strong>&quot;sebagaimana adanya&quot;</strong> tanpa garansi apapun. Sejauh yang
						diizinkan oleh hukum yang berlaku, Pengelola tidak bertanggung jawab atas:
					</p>
					<ul>
						<li>Kehilangan data akibat kegagalan teknis di luar kendali wajar kami</li>
						<li>Penggunaan data anggota oleh koordinator yang tidak sesuai dengan persetujuan anggota</li>
						<li>Kerugian tidak langsung yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan</li>
					</ul>
				</Section>

				{/* 8. Hak Kekayaan Intelektual */}
				<Section title='8. Hak Kekayaan Intelektual'>
					<p>
						Seluruh kode, desain, merek, dan konten yang dikembangkan oleh Pengelola — termasuk nama &quot;Tilawah
						Tracker&quot; dan &quot;Project Nuraya&quot; — adalah milik eksklusif <strong>{COMPANY}</strong>. Anda
						tidak diizinkan menyalin, memodifikasi, atau mendistribusikan ulang bagian mana pun dari layanan ini tanpa
						izin tertulis.
					</p>
				</Section>

				{/* 9. Perubahan Syarat */}
				<Section title='9. Perubahan Syarat & Ketentuan'>
					<p>
						Kami berhak mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif saat
						dipublikasikan di halaman ini dengan tanggal pembaruan yang baru. Penggunaan layanan yang berlanjut
						setelah perubahan merupakan penerimaan Anda atas syarat yang diperbarui.
					</p>
				</Section>

				{/* 10. Hukum yang Berlaku */}
				<Section title='10. Hukum yang Berlaku'>
					<p>
						Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa
						yang timbul akan diselesaikan melalui musyawarah terlebih dahulu, dan jika diperlukan, melalui pengadilan
						yang berwenang di Indonesia.
					</p>
				</Section>

				{/* 11. Kontak */}
				<Section title='11. Hubungi Kami'>
					<p>Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami:</p>
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
						Dengan menggunakan {APP_NAME}, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan
						ini. Lihat juga{' '}
						<Link href='/privacy-policy' className='text-primary hover:underline'>
							Kebijakan Privasi
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
