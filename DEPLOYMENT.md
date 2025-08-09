# 🚀 QuizThon Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Update `SERVER_BASE` in `script/main.js` with your production backend URL
- [ ] Set up production environment variables (.env)
- [ ] Test all features locally before deployment

### 2. Backend Deployment (Render/Railway/Heroku)
- [ ] Deploy backend to your chosen platform
- [ ] Set environment variables:
  - `MONGODB_URI` (production database)
  - `JWT_SECRET` (strong secret key)
  - `GOOGLE_CLIENT_ID` 
  - `GOOGLE_CLIENT_SECRET`
  - `CLIENT_URL` (your frontend domain)
  - `PORT` (usually set automatically)
- [ ] Test API endpoints
- [ ] Get your backend URL

### 3. Frontend Deployment (Vercel/Netlify)
- [ ] Update `SERVER_BASE` in main.js with backend URL
- [ ] Deploy frontend
- [ ] Test all functionality

### 4. Google OAuth Configuration
- [ ] Add production domains to Google Cloud Console:
  - `https://your-frontend-domain.com`
  - `https://your-backend-domain.com` (if needed)
- [ ] Test Google sign-in on production

### 5. DNS & Domain (Optional)
- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Update all URLs in code and OAuth settings

## 🔧 Quick Deploy Commands

### Backend (Example for Render)
```bash
# Push to GitHub
git add .
git commit -m "Production ready"
git push origin main

# Deploy will happen automatically via GitHub integration
```

### Frontend (Example for Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔍 Post-Deployment Testing

- [ ] Test user registration
- [ ] Test Google OAuth
- [ ] Test quiz functionality
- [ ] Test quiz history saving
- [ ] Test responsive design on mobile
- [ ] Check SEO with Google Search Console

## 📞 Support

If you encounter issues during deployment:
1. Check browser console for errors
2. Check server logs for backend issues
3. Verify all environment variables are set correctly
4. Test API endpoints individually
