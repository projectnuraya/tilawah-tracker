import { ButtonLink } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8'>
			<div className='w-full max-w-md text-center space-y-8'>
				{/* Error Code */}
				<div className='space-y-2'>
					<h1 className='text-6xl font-bold text-primary'>404</h1>
					<p className='text-2xl font-semibold text-foreground'>Halaman Tidak Ditemukan</p>
				</div>

				{/* Islamic Quote */}
				<div className='bg-primary/5 border-l-4 border-primary rounded-r-lg p-6 space-y-2'>
					<p className='text-base italic text-muted-foreground'>
						&quot;Dan Kami mudahkan bagimu jalan (untuk mengikuti kebenaran). Maka berilah peringatan apabila
						peringatan itu bermanfaat.&quot;
					</p>
					<p className='text-sm text-muted-foreground'>— QS. Al-A&apos;laa 87:8-9</p>
				</div>

				{/* Description */}
				<p className='text-lg text-muted-foreground leading-relaxed'>
					Sepertinya kita tidak dapat menemukan halaman yang Anda cari. Ini mungkin karena tautannya salah, atau
					halaman tersebut sudah dipindahkan.
				</p>

				{/*
				  Deliberately a link home rather than history.back(). The likeliest way to reach this page is
				  following a bad public group link from WhatsApp, where there is no history to go back to.
				*/}
				<div className='pt-4'>
					<ButtonLink href='/' size='lg'>
						<Home size={18} aria-hidden='true' />
						Kembali ke Beranda
					</ButtonLink>
				</div>
			</div>
		</div>
	)
}
