import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Loader2, AlertCircle } from 'lucide-react';
import { initiateRazorpayPayment } from './RazorpayPayment';
import { supabase } from '@/lib/SupabaseAuthContext';

const plans = [
  {
    id: 'free_plan',
    name: 'Free Plan',
    price: '₹0',
    priceInPaise: 0,
    duration: '30 days',
    credits: 3,
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-500',
    features: [
      '3 Video Credits',
      'Valid for 30 Days',
      '1080p HD Export',
      'Downloadable .SRT Files',
      '60 Caption Styles'
    ]
  },
  {
    id: 'weekly_creator',
    name: 'Weekly Creator',
    price: '₹99',
    priceInPaise: 9900,
    duration: '7 days',
    credits: 7,
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      '7 Video Credits',
      'Valid for 7 Days',
      'Up to 10 Videos/Day',
      '1080p HD Export',
      'Downloadable .SRT Files',
      '60 Caption Styles'
    ]
  },
  {
    id: 'monthly_pro',
    name: 'Monthly Pro',
    price: '₹199',
    priceInPaise: 19900,
    duration: '30 days',
    credits: 30,
    icon: <Crown className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      '30 Video Credits',
      'Valid for 30 Days',
      'Up to 10 Videos/Day',
      '1080p HD Export',
      'Downloadable .SRT Files',
      '60 Caption Styles',
      'Priority Processing'
    ]
  }
];

export default function PricingModal({ isOpen, onClose, onSelectPlan, user, reason = 'upgrade' }) {
  const [processingPlan, setProcessingPlan] = useState(null);

  const mapPlanIdToDbValue = (planId) => {
    const mapping = {
      'free_plan': 'free',
      'weekly_creator': 'weekly',
      'monthly_pro': 'monthly'
    };
    return mapping[planId] || 'free';
  };

  const handlePayment = async (plan) => {
    setProcessingPlan(plan.id);

    try {
      // For free plan, skip Razorpay and directly activate
      if (plan.priceInPaise === 0) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            subscription_plan: mapPlanIdToDbValue(plan.id),
            credits_remaining: plan.credits,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          alert(`Error activating plan: ${updateError.message}`);
          setProcessingPlan(null);
          return;
        }

        alert(`✅ Free plan activated! You now have ${plan.credits} credits.`);
        setProcessingPlan(null);
        onSelectPlan(plan.id);
        onClose();
        window.location.reload();
        return;
      }

      // For paid plans, use Razorpay
      initiateRazorpayPayment({
        amount: plan.priceInPaise,
        planName: plan.name,
        planId: plan.id,
        userEmail: user?.email,
        userName: user?.full_name,
        onSuccess: async (paymentData) => {
          try {
            const { data: currentProfile } = await supabase
              .from('user_profiles')
              .select('total_credits_purchased')
              .eq('id', user.id)
              .single();

            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                subscription_plan: mapPlanIdToDbValue(plan.id),
                credits_remaining: plan.credits,
                total_credits_purchased: (currentProfile?.total_credits_purchased || 0) + plan.credits,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);

            if (updateError) {
              console.error('Error updating subscription:', updateError);
              alert('Payment received but failed to update subscription. Please contact support.');
              setProcessingPlan(null);
              return;
            }

            const dbPlanType = mapPlanIdToDbValue(plan.id);
            if (dbPlanType !== 'free') {
              await supabase.from('payment_transactions').insert({
                user_id: user.id,
                razorpay_payment_id: paymentData?.razorpay_payment_id,
                razorpay_order_id: paymentData?.razorpay_order_id,
                razorpay_signature: paymentData?.razorpay_signature,
                amount: plan.priceInPaise / 100,
                status: 'success',
                plan_type: dbPlanType,
                credits_added: plan.credits
              });
            }

            alert(`✅ Payment successful! You now have ${plan.credits} credits.`);
            setProcessingPlan(null);
            onSelectPlan(plan.id);
            onClose();
            window.location.reload();
          } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Payment received but failed to update subscription. Please contact support.');
            setProcessingPlan(null);
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          alert(`❌ Payment ${error || 'cancelled'}`);
          setProcessingPlan(null);
        }
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert(`Error: ${error.message}`);
      setProcessingPlan(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a plan that fits your content creation needs
          </DialogDescription>
        </DialogHeader>

        {reason === 'credits_exhausted' && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">You've reached your free limit</p>
              <p className="text-gray-300 text-sm">
                To continue creating videos, upgrade your plan and get more credits.
              </p>
            </div>
          </div>
        )}

        <div className={`grid ${reason === 'credits_exhausted' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mt-6`}>
          {plans.filter(plan => reason !== 'credits_exhausted' || plan.id !== 'free_plan').map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-xl border ${
                plan.popular ? 'border-purple-500' : 'border-white/10'
              } bg-zinc-900/50 p-6 transition-all hover:border-white/20`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-4`}>
                {plan.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 ml-2">/ {plan.duration}</span>
              </div>

              <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-white/5">
                <span className="text-2xl font-bold text-white">{plan.credits}</span>
                <span className="text-sm text-gray-400">Video Credits</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePayment(plan)}
                disabled={processingPlan === plan.id}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    : 'bg-white/10 hover:bg-white/20'
                } text-white`}
              >
                {processingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Select ${plan.name}`
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> Credits reset/expire based on plan duration. Max 10 videos per day for all paid users. Credits are deducted only after successful video rendering.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}