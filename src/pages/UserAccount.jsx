import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, Calendar, Video, LogOut } from 'lucide-react';
import PricingModal from '@/components/dashboard/PricingModal';

export default function UserAccount() {
  const [user, setUser] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const handleSelectPlan = async (planId) => {
    setIsPricingModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const getPlanDetails = () => {
    const plan = user?.subscription_plan || 'free';
    if (plan === 'weekly_creator') {
      return { name: 'Weekly Creator', icon: <Crown className="w-5 h-5" />, gradient: 'from-purple-500 to-pink-500', totalCredits: 50 };
    } else if (plan === 'monthly_pro') {
      return { name: 'Monthly Pro', icon: <Crown className="w-5 h-5" />, gradient: 'from-blue-500 to-cyan-500', totalCredits: 200 };
    } else {
      return { name: 'Free Plan', icon: <Video className="w-5 h-5" />, gradient: 'from-green-500 to-emerald-500', totalCredits: 3 };
    }
  };

  const planDetails = getPlanDetails();
  const daysLeft = user?.plan_expiry_date 
    ? Math.ceil((new Date(user.plan_expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* User Profile Card */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {getInitials(user?.full_name)}
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{user?.full_name || 'User'}</p>
              <p className="text-gray-400 text-sm mt-1">Member since {new Date(user?.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Subscription</h2>
            <Button
              onClick={() => setIsPricingModalOpen(true)}
              className={`bg-gradient-to-r ${planDetails.gradient} hover:opacity-90 text-white`}
            >
              Upgrade Plan
            </Button>
          </div>

          {/* Plan Details */}
          <div className="space-y-4">
            {/* Current Plan */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${planDetails.gradient} flex items-center justify-center`}>
                  {planDetails.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Plan</p>
                  <p className="text-lg font-semibold">{planDetails.name}</p>
                </div>
              </div>
            </div>

            {/* Video Exports */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="text-sm text-gray-400">Video Exports Left</p>
                <p className="text-lg font-semibold">{user?.credits_remaining || 0} of {planDetails.totalCredits}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${planDetails.gradient}`}
                    style={{ width: `${((user?.credits_remaining || 0) / planDetails.totalCredits) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Expiry Date */}
            {user?.plan_expiry_date && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Plan Expires</p>
                    <p className="text-lg font-semibold">
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Stats */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="text-sm text-gray-400">Videos Created Today</p>
                <p className="text-lg font-semibold">{user?.daily_usage_count || 0} / 10</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="text-sm text-gray-400">Total Videos Created</p>
                <p className="text-lg font-semibold">{user?.total_videos_created || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlan={handleSelectPlan}
        user={user}
      />
    </div>
  );
}