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
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const { user } = useAuth();

  const handleSelectPlan = (planName) => {
    const planMapping = {
      'Weekly Creator': 'weekly_creator',
      'Monthly Pro': 'monthly_pro'
    };
    const planId = planMapping[planName];

    if (user) {
      setSelectedPlanId(planId);
      setIsPricingModalOpen(true);
    } else {
      setSelectedPlanId(planId);
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (selectedPlanId) {
      setIsPricingModalOpen(true);
    }
  };

  const handlePlanComplete = () => {
    setIsPricingModalOpen(false);
    setSelectedPlanId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <HeroSection onTryFree={() => setIsAuthModalOpen(true)} />
      <FeaturesSection />
      <PricingSection onSelectPlan={handleSelectPlan} />
      <Footer />

      <AuthModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlan={handlePlanComplete}
        user={user}
        reason="upgrade"
        autoSelectPlanId={selectedPlanId}
      />
    </div>
  );
}