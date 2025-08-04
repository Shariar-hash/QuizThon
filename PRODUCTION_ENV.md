# Production Environment Variables

## Required Environment Variables for Deployment

Copy this template and set these environment variables in your production hosting platform:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quizthon

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secure-jwt-secret-here-minimum-32-characters

# Google OAuth (From Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Server Configuration
NODE_ENV=production
PORT=3000

# App Configuration
APP_URL=https://your-domain.com
```

## Security Notes

1. **JWT_SECRET**: Generate a strong random string (minimum 32 characters)
   ```bash
   # Generate using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **MongoDB URI**: Use MongoDB Atlas for production with proper authentication
3. **Google OAuth**: Update authorized domains in Google Cloud Console
4. **HTTPS**: Ensure your domain uses HTTPS for OAuth to work properly

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Update Google OAuth authorized domains
- [ ] Configure MongoDB Atlas whitelist
- [ ] Set up domain with HTTPS
- [ ] Test OAuth flow in production
- [ ] Verify database connection
- [ ] Test all quiz features

## Common Hosting Platforms

### Heroku
```bash
heroku config:set MONGODB_URI=your-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set GOOGLE_CLIENT_ID=your-client-id
```

### Vercel
Add to `vercel.json` or dashboard environment variables

### Railway
Add to dashboard environment variables

### Render
Add to dashboard environment variables
