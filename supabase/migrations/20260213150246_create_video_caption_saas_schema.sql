/*
  # Video Caption SaaS - Complete Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `subscription_plan` (text) - 'free', 'weekly', 'monthly'
      - `credits_remaining` (integer) - Number of video exports left
      - `total_credits_purchased` (integer) - Lifetime credits bought
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payment_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `razorpay_payment_id` (text, unique)
      - `razorpay_order_id` (text)
      - `razorpay_signature` (text)
      - `amount` (numeric) - Amount in INR
      - `currency` (text) - 'INR'
      - `status` (text) - 'pending', 'success', 'failed'
      - `plan_type` (text) - 'weekly', 'monthly'
      - `credits_added` (integer) - Credits given for this payment
      - `created_at` (timestamptz)
    
    - `video_exports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `file_id` (text) - Unique identifier for the video
      - `original_filename` (text)
      - `video_duration` (numeric) - Duration in seconds
      - `target_language` (text) - Translation language
      - `caption_count` (integer) - Number of captions generated
      - `export_quality` (text) - '720p', '1080p', '4k'
      - `export_status` (text) - 'processing', 'completed', 'failed'
      - `credits_used` (integer) - Credits deducted (1 for basic, more for HD/4K)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `user_billing_info`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles, unique)
      - `razorpay_customer_id` (text)
      - `phone` (text)
      - `address` (jsonb) - Store full address as JSON
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for service role to manage all data

  3. Indexes
    - Add indexes on foreign keys and frequently queried columns
    - Add index on razorpay_payment_id for fast payment verification

  4. Important Notes
    - Free plan users start with 3 credits
    - Weekly plan gives 7 credits for ₹99
    - Monthly plan gives 30 credits for ₹299
    - Regional language translation costs 1 credit
    - HD/4K exports cost 1 additional credit (total 2 credits)
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  subscription_plan text NOT NULL DEFAULT 'free',
  credits_remaining integer NOT NULL DEFAULT 3,
  total_credits_purchased integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT subscription_plan_check CHECK (subscription_plan IN ('free', 'weekly', 'monthly'))
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  razorpay_payment_id text UNIQUE,
  razorpay_order_id text,
  razorpay_signature text,
  amount numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  plan_type text NOT NULL,
  credits_added integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('pending', 'success', 'failed')),
  CONSTRAINT plan_type_check CHECK (plan_type IN ('weekly', 'monthly'))
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create video_exports table
CREATE TABLE IF NOT EXISTS video_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_id text NOT NULL,
  original_filename text,
  video_duration numeric(10, 2),
  target_language text NOT NULL DEFAULT 'English',
  caption_count integer DEFAULT 0,
  export_quality text NOT NULL DEFAULT '1080p',
  export_status text NOT NULL DEFAULT 'processing',
  credits_used integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT export_status_check CHECK (export_status IN ('processing', 'completed', 'failed')),
  CONSTRAINT export_quality_check CHECK (export_quality IN ('720p', '1080p', '4k'))
);

ALTER TABLE video_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exports"
  ON video_exports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports"
  ON video_exports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exports"
  ON video_exports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_billing_info table
CREATE TABLE IF NOT EXISTS user_billing_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  razorpay_customer_id text,
  phone text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_billing_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own billing info"
  ON user_billing_info FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own billing info"
  ON user_billing_info FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing info"
  ON user_billing_info FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_video_exports_user_id ON video_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_video_exports_file_id ON video_exports(file_id);
CREATE INDEX IF NOT EXISTS idx_video_exports_created_at ON video_exports(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_billing_info_updated_at
  BEFORE UPDATE ON user_billing_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();