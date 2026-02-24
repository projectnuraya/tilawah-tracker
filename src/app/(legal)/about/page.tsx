import { landingCopy } from '@/components/landing/copy'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const { appName: APP_NAME, company: COMPANY, contactEmail: CONTACT_EMAIL } = landingCopy.legal

export const metadata: Metadata = {
	title: 'Tentang — Tilawah Tracker',
	description: 'Tentang Tilawah Tracker: platform digital untuk mengelola program tilawah kelompok satu minggu satu juz.',
}

export default function AboutPage() {
	return (
		<div className='max-w-3xl mx-auto px-4 md:px-8'>
			{/* Header */}
			<div className='mb-12'>
				<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-background text-primary text-xs font-semibold uppercase tracking-wider mb-4'>
					Tentang
				</div>
				<h1 className='text-3xl md:text-4xl font-bold text-foreground mb-3'>Tentang {APP_NAME}</h1>
				<p className='text-muted-foreground text-lg leading-relaxed'>
					Platform digital untuk membantu koordinator mengelola program tilawah Al-Qur&apos;an berkelompok — lebih
					mudah, lebih rapi, lebih transparan.
				</p>
			</div>

			<div className='space-y-10'>
				{/* Apa itu Tilawah Tracker? */}
				<Section title='Apa itu Tilawah Tracker?'>
					<p>
						<strong>{APP_NAME}</strong> adalah aplikasi web yang dirancang khusus untuk program{' '}
						<em>&quot;Satu Minggu Satu Juz&quot;</em> — sebuah program tilawah berkelompok di mana setiap anggota
						membaca satu juz Al-Qur&apos;an dalam waktu satu minggu.
					</p>
					<p>
						Dengan 30 juz yang digilir secara berurutan setiap minggunya, koordinator seringkali kesulitan mencatat
						progress, membagi juz, dan mengingatkan anggota secara manual melalui WhatsApp. {APP_NAME} hadir untuk
						menyelesaikan masalah itu.
					</p>
				</Section>

				{/* Mengapa Kami Membuat Ini? */}
				<Section title='Mengapa Kami Membuat Ini?'>
					<p>
						Banyak kelompok tilawah masih menggunakan catatan manual di chat WhatsApp — progress tercampur dengan
						pesan lain, pembagian juz mudah terlupa, dan tidak ada riwayat yang tersimpan rapi.
					</p>
					<p>
						Kami percaya bahwa teknologi sederhana bisa membantu menjaga komitmen ibadah bersama. {APP_NAME} dibuat
						agar koordinator bisa fokus pada yang penting: menjaga semangat tilawah kelompok — bukan mengurus
						administrasi.
					</p>
				</Section>

				{/* Fitur Utama */}
				<Section title='Apa yang Bisa Dilakukan?'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<FeatureCard emoji='🔄' title='Rotasi Juz Otomatis'>
							Pembagian juz bergilir otomatis setiap periode baru. Tidak perlu atur manual lagi.
						</FeatureCard>
						<FeatureCard emoji='📱' title='Bagikan ke WhatsApp'>
							Salin rangkuman progress dengan format rapi, lengkap dengan emoji 👑 dan 💔.
						</FeatureCard>
						<FeatureCard emoji='🔗' title='Link Publik'>
							Anggota bisa melihat progress kelompok sendiri tanpa perlu login.
						</FeatureCard>
						<FeatureCard emoji='📊' title='Pelacakan Real-Time'>
							Lihat siapa yang sudah selesai, siapa yang terlewat — semua terupdate langsung.
						</FeatureCard>
						<FeatureCard emoji='🔒' title='Penguncian Periode'>
							Kunci periode yang sudah berakhir agar riwayat tetap akurat dan tidak bisa diubah.
						</FeatureCard>
						<FeatureCard emoji='🔥' title='Streak Counter'>
							Lacak berapa kali berturut-turut seseorang melewatkan juz.
						</FeatureCard>
					</div>
				</Section>

				{/* Untuk Siapa? */}
				<Section title='Untuk Siapa?'>
					<p>
						{APP_NAME} dirancang untuk <strong>koordinator kelompok tilawah</strong> — biasanya berusia 40–50 tahun —
						yang membutuhkan alat sederhana, cepat, dan mudah digunakan. Tidak perlu mahir teknologi, cukup tahu cara
						buka browser dan klik tombol.
					</p>
					<div className='bg-muted rounded-lg p-5 mt-4'>
						<p className='text-sm text-muted-foreground italic'>
							&quot;Kalau bisa dipakai ibu-ibu pengajian tanpa perlu diajarin lama, berarti sudah berhasil.&quot;
						</p>
					</div>
				</Section>

				{/* Teknologi */}
				<Section title='Dibangun dengan Teknologi Modern'>
					<p>
						Meskipun tampilannya sederhana, {APP_NAME} dibangun dengan teknologi web modern untuk memastikan kecepatan
						dan keamanan:
					</p>
					<ul>
						<li>
							<strong>Next.js</strong> — framework React untuk performa dan SEO
						</li>
						<li>
							<strong>PostgreSQL</strong> — database yang handal dan terbukti
						</li>
						<li>
							<strong>Google OAuth</strong> — login aman tanpa perlu buat akun baru
						</li>
						<li>
							<strong>Mobile-first</strong> — dioptimalkan untuk penggunaan di ponsel
						</li>
					</ul>
				</Section>

				{/* Status Saat Ini */}
				<Section title='Status Saat Ini'>
					<div className='bg-primary-background rounded-lg p-5 border border-primary/20'>
						<p className='text-primary font-semibold mb-2'>🚀 Public Beta</p>
						<p className='text-sm text-muted-foreground'>
							{APP_NAME} saat ini dalam tahap <em>public beta</em>. Siapa pun bisa mencoba dengan menghubungi kami
							untuk mendapatkan akses koordinator. Pendaftaran mandiri akan segera hadir.
						</p>
					</div>
				</Section>

				{/* Tim */}
				<Section title='Siapa di Balik Ini?'>
					<div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
						<div className='bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-center shrink-0'>
							<Image
								src='/nuraya-logo.png'
								alt='Project Nuraya Logo'
								width={160}
								height={44}
								className='object-contain h-8 w-auto'
							/>
						</div>
						<div>
							<p className='font-semibold text-foreground text-lg'>{COMPANY}</p>
							<p className='text-muted-foreground mt-1'>
								Dibuat dengan ❤️ untuk komunitas Muslim Indonesia. Kami percaya bahwa teknologi yang tepat bisa
								membantu menjaga istiqomah dalam beribadah.
							</p>
						</div>
					</div>
				</Section>

				{/* Kontak */}
				<Section title='Hubungi Kami'>
					<p>Punya pertanyaan, saran, atau ingin mendaftar sebagai koordinator? Jangan ragu untuk menghubungi kami:</p>
					<div className='bg-muted rounded-lg p-4 mt-2'>
						<p className='font-semibold text-foreground'>{COMPANY}</p>
						<a href={`mailto:${CONTACT_EMAIL}`} className='text-primary hover:underline'>
							{CONTACT_EMAIL}
						</a>
					</div>
				</Section>

				{/* Links */}
				<div className='border-t border-border pt-8'>
					<p className='text-sm text-muted-foreground'>
						Lihat juga{' '}
						<Link href='/privacy-policy' className='text-primary hover:underline'>
							Kebijakan Privasi
						</Link>{' '}
						dan{' '}
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

function FeatureCard({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
	return (
		<div className='bg-card border border-border rounded-lg p-4 space-y-2'>
			<div className='flex items-center gap-2'>
				<span className='text-xl'>{emoji}</span>
				<h3 className='font-semibold text-foreground text-sm'>{title}</h3>
			</div>
			<p className='text-sm text-muted-foreground'>{children}</p>
		</div>
	)
}
