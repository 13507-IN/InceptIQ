# Deployment Guide

## Frontend Deployment (Render, Vercel, or Netlify)

### Option 1: Deploy to Render (Recommended)

1. **Build the frontend**:
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Frontend enhancements"
   git push origin main
   ```

3. **Create Static Site on Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/build`
   - Deploy

4. **Configure Environment Variables**:
   - In Render Dashboard → Environment
   - Add: `REACT_APP_API_URL=https://your-backend-url.onrender.com/api`

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   cd client
   npm run build
   netlify deploy --prod --dir=build
   ```

3. **Configure Build Settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `build`

### Option 3: Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd client
   vercel --prod
   ```

---

## Backend Deployment (Render)

1. **Create a Web Service on Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set build command: `cd server && npm install`
   - Set start command: `node server.js`
   - Select Node.js environment

2. **Set Environment Variables**:
   ```env
   PORT=5000
   NODE_ENV=production
   GEMINI_API_KEY=your_google_gemini_api_key
   CLIENT_URL=https://your-frontend-url.netlify.app (or .vercel.app)
   ALLOWED_ORIGINS=https://your-frontend-url.netlify.app,https://your-frontend-url.vercel.app
   DATABASE_URL=your_mongodb_url (if using MongoDB)
   ```

3. **Enable Auto-Deploy**:
   - Render will automatically redeploy on GitHub push

---

## Verification Checklist

- [ ] Frontend builds without errors: `npm run build`
- [ ] No TypeScript errors: `npm test`
- [ ] Environment variables configured for production
- [ ] CORS origins updated in backend
- [ ] API URL points to production backend
- [ ] Backend accepts requests from production frontend origin
- [ ] PDF generation works in production
- [ ] Database connectivity verified (if using database)
- [ ] SSL/HTTPS enabled
- [ ] Error logging configured

---

## Testing Deployment

### Test API Connectivity
```bash
curl -X GET https://your-backend-url.onrender.com/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "API Server is running"
}
```

### Test Full Analysis Flow
1. Navigate to https://your-frontend-url
2. Click "Start Free Analysis"
3. Fill in startup details
4. Submit for analysis
5. Wait for results
6. Download PDF report

---

## Performance Optimization Tips

1. **Frontend**:
   - Enable gzip compression in web server
   - Use CDN for static assets
   - Implement lazy loading for components

2. **Backend**:
   - Enable response caching
   - Use database indexing
   - Monitor API response times

3. **General**:
   - Enable HTTP/2
   - Set appropriate cache headers
   - Monitor error rates and performance metrics

---

## Troubleshooting

### "CORS Error" in Browser Console
- Check that `ALLOWED_ORIGINS` in backend includes your frontend URL
- Ensure frontend URL matches exactly (protocol, domain, port)

### "Cannot reach API" Error
- Verify backend is deployed and running
- Check `REACT_APP_API_URL` in frontend environment
- Test backend health endpoint

### "PDF Download Fails"
- Ensure backend has write permissions to `/reports` directory
- Check disk space on server
- Verify `pdfkit` library is installed in backend

### Build Fails
- Clear `node_modules` and `package-lock.json`
- Run `npm install` again
- Check for peer dependency warnings
- Review build logs for specific errors

---

## Monitoring & Maintenance

1. **Set Up Error Tracking** (Sentry, LogRocket):
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: "production"
   });
   ```

2. **Monitor API Response Times**:
   - Use Render analytics dashboard
   - Set up alerts for slow API responses

3. **Regular Backups**:
   - Schedule database backups daily
   - Store backups in secure location
   - Test restore procedures

4. **Keep Dependencies Updated**:
   - Monthly security audits
   - Update packages: `npm audit fix`
   - Test thoroughly before deploying updates
