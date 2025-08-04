# 🔧 Google OAuth Setup Guide for QuizThon

## Current Issue: "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"

This error occurs because your Google OAuth app is unverified and in testing mode. Here's how to fix it:

## 🚀 Quick Fix (Development/Testing)

### Option 1: Add Test Users
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > OAuth consent screen**
3. Scroll down to **Test users**
4. Click **Add users**
5. Add your email address (the one you want to test with)
6. Save the changes

### Option 2: Set to Internal (if G Workspace)
1. In OAuth consent screen, change **User Type** to **Internal**
2. This only works if you have a Google Workspace account

## 🔒 Production Fix (Full App Verification)

### Step 1: Complete OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Fill out ALL required fields:
   - App name: "QuizThon"
   - User support email: your email
   - App logo: upload a logo (120x120px)
   - App domain: your domain (for local testing, use localhost)
   - Developer contact email: your email

### Step 2: Add Required Information
Add these **required** URLs:
- **App privacy policy URL**: Create a privacy policy page
- **App terms of service URL**: Create a terms of service page
- **Authorized domains**: Add your domain

### Step 3: Configure Scopes
1. Go to **Scopes** section
2. Add these scopes:
   - `email`
   - `profile`
   - `openid`

### Step 4: Submit for Verification
1. Click **Publish App**
2. Submit for Google verification
3. Wait for approval (can take days/weeks)

## 🛠️ Alternative Solutions (For Development)

### 1. Use Email/Password Authentication
- Already implemented and working
- No Google verification needed
- Users can register with email/password

### 2. Continue Without Login
- Allows anonymous usage
- No authentication required
- Limited features but functional

### 3. Demo Mode
- Simulates Google OAuth
- For testing purposes only
- Shows how the app would work with real OAuth

## 📋 Current Project Status

✅ **Working Features:**
- Email/password registration/login
- Anonymous mode ("Continue without Login")
- Quiz functionality
- History tracking (when logged in)
- Demo mode for OAuth testing

⚠️ **Limited Features:**
- Google OAuth (requires verification)

## 🔧 Recommended Development Approach

1. **For Testing**: Use Email/Password login or anonymous mode
2. **For Demo**: Use the built-in demo mode
3. **For Production**: Complete Google verification process

## 📝 Test User Setup (Immediate Solution)

To test Google OAuth right now:

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services > OAuth consent screen**
4. Scroll to **Test users**
5. Add these emails:
   - Your personal Gmail
   - Any other emails you want to test with
6. Save changes
7. Now those users can sign in without the error

## 🎯 Quick Start for Users

Tell your users:
1. **Recommended**: Use "Sign Up" with email/password
2. **Alternative**: Click "Continue without Login"
3. **If you see Google errors**: This is normal for unverified apps

The app is fully functional with email authentication and anonymous mode!

---

*Note: This is a common issue with OAuth apps in development. The app works perfectly with alternative authentication methods.*
