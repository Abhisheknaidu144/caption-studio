import React, { useState } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';
import AuthModal from '@/components/dashboard/AuthModal';
import PricingModal from '@/components/dashboard/PricingModal';
import { useAuth } from '@/lib/SupabaseAuthContext';

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const { user } = useAuth();

  const handleSelectPlan = () => {
    setIsPricingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <HeroSection onTryFree={() => setIsAuthModalOpen(true)} />
      <FeaturesSection />
      <PricingSection onSelectPlan={(planId) => {
        if (user) {
          setIsPricingModalOpen(true);
        } else {
          setIsAuthModalOpen(true);
        }
      }} />
      <Footer />

      <AuthModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlan={handleSelectPlan}
        user={user}
        reason="upgrade"
      />
    </div>
  );
}