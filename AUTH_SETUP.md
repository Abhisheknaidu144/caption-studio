# Authentication Setup Guide

## What Changed

I've added a complete authentication system with a login modal. You'll no longer see an alert - instead, a proper login/signup modal will appear.

## New Features

### 1. Login Modal
When you try to upload a video without being logged in, a beautiful login modal will appear instead of an alert.

**Features:**
- Email/password authentication
- Sign up for new accounts (gets 3 free credits automatically)
- Switch between login and signup
- Clear error messages

### 2. User Info in Header
The header now shows:
- **When Logged Out**: "Sign In" button
- **When Logged In**:
  - Credit balance (purple badge with coin icon)
  - "Sign Out" button

### 3. Automatic Credit Assignment
New users automatically get:
- 3 free video exports
- "free" subscription plan
- Entry in the database

## How to Use

### First Time Users

1. **Visit the Dashboard**
   - Go to your app URL

2. **Try to Upload a Video**
   - Click "Upload New" button
   - Select a video file

3. **Login Modal Appears**
   - You'll see a modal asking you to sign in
   - Click "Don't have an account? Sign up"

4. **Create Account**
   - Enter your email
   - Enter a password (minimum 6 characters)
   - Click "Create Account"

5. **Success!**
   - You're now logged in
   - You'll see your credit balance (3 credits)
   - You can now upload videos

### Existing Users

1. **Click "Sign In"** in the header
2. **Enter credentials** and login
3. **Start creating** captions immediately

## Test Accounts

For testing, you can create any account. In development mode, email verification is usually disabled in Supabase.

**Example Test Account:**
- Email: test@example.com
- Password: test123

## Backend Connection

The authentication works with:
- **Frontend**: Supabase Auth (email/password)
- **Backend**: Automatic user profile creation in `user_profiles` table
- **Credits**: Automatically set to 3 for new users

## Troubleshooting

### "Invalid login credentials" error
**Solution**: Make sure you're using the correct email and password. If signing up, the account is created immediately.

### Modal doesn't appear
**Solution**: Check browser console for errors. Make sure you're running both frontend and backend.

### Can't sign out
**Solution**: Click the "Sign Out" button in the header. It will log you out and redirect.

### Credits not showing
**Solution**: The credits are fetched when you log in. If they don't show, refresh the page.

## What Happens After Login

1. ✅ User session is stored (persists across page reloads)
2. ✅ Credit balance is fetched from database
3. ✅ User ID is sent with all API requests
4. ✅ Upload and export buttons become active
5. ✅ Credits are deducted after successful exports

## Sign Out

Click the "Sign Out" button in the header (top right) to log out. This will:
- Clear your session
- Reset credit balance display
- Show "Sign In" button again

---

**Status**: Authentication fully functional! Users can now sign up, log in, and manage their credits properly.
