import { useState } from 'react';
import Header from './components/cleanpost/Header';
import HeroSection from './components/cleanpost/HeroSection';
import ProblemSection from './components/cleanpost/ProblemSection';
import HowItWorksSection from './components/cleanpost/HowItWorksSection';
import FeaturesSection from './components/cleanpost/FeaturesSection';
import TestimonialsSection from './components/cleanpost/TestimonialsSection';
import CTASection from './components/cleanpost/CTASection';
import FAQSection from './components/cleanpost/FAQSection';
import Footer from './components/cleanpost/Footer';
import SignupModal from './components/cleanpost/SignupModal';

export default function CleanPostLanding() {
  const [modal, setModal] = useState<'builder' | 'cleaner' | null>(null);

  return (
    <div dir="rtl" lang="he" className="font-sans">
      <Header onSignup={setModal} />
      <HeroSection onSignup={setModal} />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection onSignup={setModal} />
      <FAQSection />
      <Footer />
      {modal && <SignupModal defaultTab={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
