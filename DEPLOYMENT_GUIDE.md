# QuizThon Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Set up MongoDB Atlas database
- [ ] Configure Google OAuth credentials for production domain
- [ ] Generate secure JWT secret
- [ ] Set up environment variables (see PRODUCTION_ENV.md)

### 2. Domain & SSL
- [ ] Purchase and configure domain
- [ ] Set up SSL certificate (auto with most platforms)
- [ ] Update Google OAuth authorized domains

### 3. Code Preparation
- [ ] Remove all testing/debug files ✓
- [ ] Update robots.txt ✓
- [ ] Optimize package.json ✓
- [ ] Add security headers ✓

## Deployment Platforms

### Option 1: Heroku (Recommended)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set GOOGLE_CLIENT_ID=your-google-client-id

# Deploy
git add .
git commit -m "Production deployment"
git push heroku main
```

### Option 2: Vercel
1. Connect GitHub repository to Vercel
2. Add environment variables in dashboard
3. Deploy automatically on push

### Option 3: Railway
1. Connect GitHub repository to Railway
2. Add environment variables in dashboard
3. Deploy automatically

### Option 4: Render
1. Connect GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## Post-Deployment Steps

### 1. Test OAuth Flow
- [ ] Test Google login on production domain
- [ ] Verify user registration/login works
- [ ] Check profile page functionality

### 2. Performance Verification
- [ ] Test quiz loading and functionality
- [ ] Verify database connections
- [ ] Check response times

### 3. SEO Verification
- [ ] Submit sitemap to Google Search Console
- [ ] Verify meta tags are loading correctly
- [ ] Test social media sharing

### 4. Security Check
- [ ] Verify HTTPS is working
- [ ] Test CORS settings
- [ ] Check security headers

## Monitoring & Maintenance

### Set up monitoring:
1. Database monitoring (MongoDB Atlas)
2. Application monitoring (hosting platform)
3. Error tracking (consider Sentry)
4. Analytics (Google Analytics)

### Regular maintenance:
- Monitor user activity
- Update dependencies monthly
- Backup database regularly
- Review security logs

## Troubleshooting

### Common Issues:
1. **OAuth not working**: Check authorized domains in Google Console
2. **Database connection**: Verify MongoDB URI and whitelist
3. **Static files not loading**: Check file paths and CORS
4. **502/503 errors**: Check environment variables and logs

### Environment Variables Checklist:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
GOOGLE_CLIENT_ID=your-client-id
```

## Performance Optimization

### Already implemented:
- Static file caching
- Security headers
- CORS optimization
- JSON payload limits

### Additional optimizations:
- Consider CDN for static assets
- Enable gzip compression
- Implement rate limiting
- Add request logging
