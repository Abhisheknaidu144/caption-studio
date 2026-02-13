import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('credits_remaining, subscription_plan')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }

      if (data) {
        setCredits(data.credits_remaining);
        setSubscriptionPlan(data.subscription_plan);
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: userId,
              email: user?.email,
              credits_remaining: 3,
              subscription_plan: 'free',
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          setCredits(3);
          setSubscriptionPlan('free');
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCredits = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/user/credits/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setCredits(data.credits);
        setSubscriptionPlan(data.subscription_plan);
      }
    } catch (error) {
      console.error('Failed to refresh credits:', error);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setCredits(0);
    setSubscriptionPlan('free');
  };

  const value = {
    user,
    session,
    isLoading,
    credits,
    subscriptionPlan,
    signIn,
    signUp,
    signOut,
    refreshCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
