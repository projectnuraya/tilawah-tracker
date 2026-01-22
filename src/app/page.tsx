import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-background px-4'>
			<div className='w-full max-w-md text-center space-y-6'>
				<h1 className='text-4xl font-semibold text-foreground flex items-center justify-center gap-2'>
					<Image src='/favicon.png' alt='Tilawah Tracker Logo' width={40} height={40} />
					Tilawah Tracker
				</h1>
				<p className='text-lg text-muted-foreground'>
					Lacak kemajuan membaca Al-Qur&apos;an kelompok untuk program &quot;Satu Minggu Satu Juz&quot;.
				</p>

				<div className='flex flex-col sm:flex-row gap-4 justify-center mt-8'>
					<Link
						href='/auth/signin'
						className='inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-sm transition hover:bg-primary/90'>
						Masuk Koordinator
					</Link>
				</div>

				<p className='text-sm text-muted-foreground mt-8'>
					Punya tautan publik? Tempelkan langsung di browser Anda untuk melihat kemajuan kelompok.
				</p>
			</div>
		</div>
	)
}
