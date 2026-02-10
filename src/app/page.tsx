import FeaturesGrid from '@/components/landing/FeatureGrid'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import Navbar from '@/components/landing/Navbar'
import ProblemSolution from '@/components/landing/ProblemSolution'
import ProgramExplanation from '@/components/landing/ProgramExplanation'
import ScreenshotGallery from '@/components/landing/ScreenshotGallery'
import TrustBadges from '@/components/landing/TrustBadges'

export default function HomePage() {
	return (
		<div className='min-h-screen bg-background font-sans text-foreground'>
			<Navbar />
			<main className='flex flex-col'>
				<HeroSection />
				<ProgramExplanation />
				<ProblemSolution />
				<HowItWorks />
				<FeaturesGrid />
				<ScreenshotGallery />
				<TrustBadges />
				<FinalCTA />
			</main>
			<Footer />
		</div>
	)
}
