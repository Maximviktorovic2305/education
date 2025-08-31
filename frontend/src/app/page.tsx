import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import LevelsSection from '@/components/home/LevelsSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <LevelsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
