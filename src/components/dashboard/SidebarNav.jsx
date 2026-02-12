import React, { useState } from 'react';
import { Folder, Layout, Type, Sparkles, Video, Crown, LogOut, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const navItems = [
  { id: 'captions', icon: Folder, label: 'Captions' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'animate', icon: Sparkles, label: 'Animate' },
  { id: 'templates', icon: Layout, label: 'Templates', disabled: true },
];

export default function SidebarNav({ activeTab, setActiveTab, user, onOpenPricing }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPlanDetails = () => {
    const plan = user?.subscription_plan || 'free';
    if (plan === 'weekly_creator') {
      return { name: 'Weekly Creator', icon: <Crown className="w-4 h-4" />, gradient: 'from-purple-500 to-pink-500', totalCredits: 50 };
    } else if (plan === 'monthly_pro') {
      return { name: 'Monthly Pro', icon: <Crown className="w-4 h-4" />, gradient: 'from-blue-500 to-cyan-500', totalCredits: 30 };
    } else {
      return { name: 'Free Plan', icon: <Video className="w-4 h-4" />, gradient: 'from-blue-500 to-cyan-500', totalCredits: 30 };
    }
  };

  const planDetails = getPlanDetails();
  const creditsLeft = user?.credits_remaining || 0;
  const isFreePlan = (user?.subscription_plan || 'free') === 'free';
  
  // Show upgrade prompt if free plan has 0 credits (or low?)
  // User asked: "if free plan hits limit it should show user the upgrade plan"
  // The screenshot shows "Upgrade Plan" button regardless.

  return (
    <div className="w-[72px] bg-black border-r border-white/5 flex flex-col items-center py-4 gap-1 h-full">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        const isDisabled = item.disabled;
        
        return (
          <button
            key={item.id}
            onClick={() => !isDisabled && setActiveTab(item.id)}
            disabled={isDisabled}
            className={`w-full flex flex-col items-center justify-center py-3 px-2 transition-colors relative ${
              isActive 
                ? 'text-purple-400' 
                : isDisabled
                  ? 'text-gray-700 cursor-not-allowed opacity-50'
                  : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r" />
            )}
            <Icon className="w-5 h-5 mb-1.5" />
            <span className="text-[10px] text-center leading-tight">{item.label}</span>
          </button>
        );
      })}

      <div className="flex-1" />

      {/* User Account Section */}
      {user && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs hover:opacity-90 transition-opacity mb-2">
              {getInitials(user.full_name)}
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-64 bg-zinc-900 border-white/10 p-0 ml-4 mb-2">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-400">{planDetails.name}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Video Exports Used</span>
                    <span className="text-white">{planDetails.totalCredits - creditsLeft} of {planDetails.totalCredits}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                     onOpenPricing();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-3">
              <Link
                to={createPageUrl('UserAccount')}
                className="flex items-center gap-2 px-2 py-2 mb-1 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Crown className="w-4 h-4" />
                Manage Account
              </Link>
              <div className="flex items-center gap-3 px-2 py-1 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(user.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                </div>
              </div>
              
              <button
                onClick={() => base44.auth.logout()}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}