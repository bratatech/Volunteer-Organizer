# ✅ Vercel Deployment Checklist & Fixes

## 🔧 Changes Made to Fix 500 Error

### 1. **Created `/api/index.js` with Error Handling**
- Added try-catch blocks for each route import
- Better error logging for debugging
- Proper error handler middleware
- Health check endpoint for testing

### 2. **Created `/api/package.json`**
- Ensures Vercel installs all required dependencies
- Includes all backend dependencies

### 3. **Updated `vercel.json`**
- Added `includeFiles: ["backend/**"]` to ensure backend code is available
- Set `NODE_ENV` to production
- Proper routing configuration

### 4. **Environment Variables Setup**
- Frontend uses relative `/api` path in production
- Backend uses `/tmp` for file storage on Vercel

## 📋 Deployment Steps

### Step 1: Commit All Changes
```bash
git add .
git commit -m "Fix Vercel deployment with proper serverless configuration"
git push origin main
```

### Step 2: Configure Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables

Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `JWT_SECRET` | `your-secure-secret-key-here` | Production |
| `NODE_ENV` | `production` | Production |
| `GEMINI_API_KEY` | `your-gemini-api-key` (optional) | Production |

**Important:** Use a strong, random JWT_SECRET. You can generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Redeploy

After setting environment variables:
1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

OR push a new commit to trigger automatic deployment.

## 🧪 Testing Your Deployment

### Test 1: Health Check
Visit: `https://fest-connect-virid.vercel.app/api/health`

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2024-...",
  "environment": "production"
}
```

### Test 2: Frontend Loads
Visit: `https://fest-connect-virid.vercel.app`

Should see the landing page.

### Test 3: Signup & Login
1. Click "Join as Volunteer"
2. Fill the form and submit
3. Login with credentials
4. Should redirect to dashboard

### Test 4: Create Activity (Organizer)
1. Register as organizer
2. Login
3. Create a new activity
4. Should appear in dashboard

## 🐛 Troubleshooting

### Issue: Still getting 500 error on /api/health

**Check Vercel Logs:**
1. Go to your project in Vercel
2. Click on "Deployments"
3. Click on the latest deployment
4. Click "View Function Logs"
5. Look for error messages

**Common causes:**
- Missing environment variables (JWT_SECRET)
- Module import errors
- File path issues

### Issue: Frontend loads but API calls fail

**Check:**
1. Browser console for errors
2. Network tab to see actual API URLs being called
3. Ensure frontend is using `/api` not `http://localhost:5000/api`

**Fix:**
```bash
# In frontend folder
cat .env.production
# Should show: VITE_API_BASE_URL=/api
```

### Issue: Data not persisting

**This is expected!** Vercel serverless functions use `/tmp` which is ephemeral.

**Solutions:**
1. **For testing:** Data will reset on cold starts (expected behavior)
2. **For production:** Migrate to a database:
   - MongoDB Atlas (free tier)
   - Vercel Postgres
   - Supabase
   - PlanetScale

### Issue: Module not found errors

**Check:**
1. Ensure `api/package.json` exists with all dependencies
2. Ensure `vercel.json` has `includeFiles: ["backend/**"]`
3. Redeploy after adding these files

## 📊 Vercel Configuration Explained

### vercel.json Structure
```json
{
  "builds": [
    {
      "src": "frontend/package.json",  // Build frontend
      "use": "@vercel/static-build"
    },
    {
      "src": "api/index.js",           // Build serverless API
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["backend/**"]  // Include backend code
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",              // Route /api/* to serverless
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",                  // Route everything else to frontend
      "dest": "/frontend/$1"
    }
  ]
}
```

### How It Works

1. **Frontend Build:**
   - Vite builds React app to `frontend/dist`
   - Static files served by Vercel CDN

2. **Backend (Serverless):**
   - `api/index.js` becomes a serverless function
   - Imports routes from `backend/` folder
   - Runs on-demand when API is called

3. **Routing:**
   - `/api/*` → Serverless function
   - `/*` → Static frontend files

## ✅ Success Indicators

Your deployment is successful when:

- ✅ `/api/health` returns 200 OK
- ✅ Landing page loads
- ✅ Can signup as volunteer
- ✅ Can login as volunteer
- ✅ Can signup as organizer
- ✅ Can login as organizer
- ✅ Dashboard loads after login
- ✅ Can create activities (organizer)
- ✅ Can join activities (volunteer)

## 🚀 Next Steps After Successful Deployment

1. **Add a Database:**
   - Replace JSON file storage with MongoDB/PostgreSQL
   - Update `backend/utils/fileHandler.js` to use database

2. **Add Environment-Specific Features:**
   - Email notifications
   - File uploads (use Vercel Blob)
   - Real-time updates (WebSockets)

3. **Monitor Performance:**
   - Use Vercel Analytics
   - Set up error tracking (Sentry)
   - Monitor API response times

4. **Security Enhancements:**
   - Rate limiting
   - Input sanitization
   - HTTPS enforcement (automatic on Vercel)

## 📞 Need Help?

If you're still experiencing issues:

1. Check Vercel function logs
2. Test locally first: `npm run dev` in both frontend and backend
3. Ensure all files are committed and pushed
4. Verify environment variables are set in Vercel dashboard

## 🎉 Deployment Complete!

Once all tests pass, your app is live at:
**https://fest-connect-virid.vercel.app**

Share it with your team and start managing volunteers! 🎊
