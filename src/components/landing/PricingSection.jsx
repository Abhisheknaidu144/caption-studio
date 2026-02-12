import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const plans = [
  {
    name: 'Weekly Creator',
    price: '₹99',
    period: 'per week',
    description: 'Perfect for consistent posting',
    icon: Zap,
    features: [
      '7 Video Credits',
      'Valid for 7 Days',
      '1080p HD Export',
      'All caption styles',
      'Full editing controls',
    ],
    cta: 'Start Weekly',
    popular: false
  },
  {
    name: 'Monthly Pro',
    price: '₹199',
    period: 'per month',
    description: 'Best value for serious creators',
    icon: Crown,
    features: [
      '30 Video Credits',
      'Valid for 30 Days',
      'Priority processing',
      '1080p HD Export',
      'All caption styles',
      'Full editing controls',
    ],
    cta: 'Go Pro',
    popular: true
  }
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent" />
      
      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400">
            Choose the plan that fits your content schedule.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-purple-600/20 to-purple-600/5 border-2 border-purple-500/30' 
                  : 'bg-white/[0.02] border border-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-xl ${plan.popular ? 'bg-purple-600' : 'bg-white/10'} flex items-center justify-center mb-6`}>
                <plan.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link to={createPageUrl('Dashboard')}>
                <Button 
                  className={`w-full py-6 rounded-xl ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}