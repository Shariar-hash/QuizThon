# 🔧 Complete Environment Variables Guide

## Required .env Variables for QuizThon

Here are all the environment variables you need in your `.env` file:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://quizathon:quizathon@shariar.sggb68c.mongodb.net/quizthon?retryWrites=true&w=majority&appName=Shariar

# Security Configuration  
JWT_SECRET=QuizThon_Super_Secret_JWT_Key_2025_Very_Long_And_Complex_String_For_Security

# Server Configuration
PORT=3000

# Google OAuth Configuration (REQUIRED for Google Sign-In)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Application URLs
CLIENT_URL=http://localhost:3001
SERVER_URL=http://localhost:3000
```

## 🎯 How to Get Google OAuth Credentials

### Step 1: Get Google Client ID and Secret
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Go to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID
5. Copy both:
   - **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Update Your .env File
Replace these placeholders with your actual credentials:

```env
# Replace these with your actual Google OAuth credentials
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

## 📋 Variable Explanations

### Required Variables:
- **MONGODB_URI**: Your MongoDB connection string ✅ (Already configured)
- **JWT_SECRET**: Secret key for JWT token encryption ✅ (Already configured)  
- **PORT**: Port for your backend server ✅ (Already configured)

### Google OAuth Variables:
- **GOOGLE_CLIENT_ID**: Public identifier for your Google OAuth app ❌ (Needs your credentials)
- **GOOGLE_CLIENT_SECRET**: Private key for server-side verification ❌ (Needs your credentials)

### Optional Variables:
- **CLIENT_URL**: Frontend URL (for CORS and redirects)
- **SERVER_URL**: Backend URL (for API calls)

## 🚀 Quick Setup Steps

1. **Get Google Credentials** (5 minutes):
   - Follow the Google Cloud Console setup
   - Copy Client ID and Secret

2. **Update .env File**:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```

3. **Restart Your Server**:
   ```bash
   npm start
   ```

## 🔒 Security Notes

- **Never commit .env to Git** (it's already in .gitignore)
- **Keep Client Secret private** (only use on server-side)
- **Client ID is public** (can be used in frontend)
- **Use environment variables in production**

## ✅ What's Currently Working

- ✅ MongoDB connection
- ✅ JWT authentication  
- ✅ Email/password auth
- ✅ Demo mode Google OAuth
- ❌ Real Google OAuth (needs credentials)

## 🎮 Test Without Google OAuth

You can test everything without Google OAuth credentials:
1. Use email/password authentication
2. Use demo mode for Google OAuth simulation
3. All features work except real Google sign-in

## 📁 Files That Use These Variables

### Backend (server.js):
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Token signing
- `PORT` - Server port
- `GOOGLE_CLIENT_SECRET` - OAuth verification

### Frontend (script/main.js):
- Uses `GOOGLE_CLIENT_ID` directly in code
- `CLIENT_URL` and `SERVER_URL` for API calls

## 🔧 After Adding Credentials

Once you add the Google credentials:
1. Restart both servers
2. Test real Google OAuth
3. Users can sign in with actual Google accounts
4. Profile pictures will sync from Google

Your app will be fully functional with both email/password and Google authentication! 🚀
