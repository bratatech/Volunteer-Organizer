# 🚀 Deployment Guide for Vercel

## ✅ Changes Made for Vercel Deployment

### 1. **Frontend API Configuration** (`frontend/src/utils/api.js`)
- Changed from hardcoded `http://localhost:5000/api` to environment-based URL
- Uses `VITE_API_BASE_URL` environment variable
- Defaults to `/api` for production (relative path)

### 2. **Environment Files Created**
- **`.env.development`**: Uses `http://localhost:5000/api` for local development
- **`.env.production`**: Uses `/api` for production (relative path)

### 3. **Backend Server** (`backend/server.js`)
- Modified to support both local development and Vercel serverless
- Only calls `app.listen()` when not in Vercel environment
- Exports the Express app for serverless deployment

### 4. **Vercel Serverless Entry Point** (`api/index.js`)
- Created new serverless entry point for Vercel
- Imports and configures all backend routes
- Exports Express app for Vercel's Node.js runtime

### 5. **File Storage** (`backend/utils/fileHandler.js`)
- Updated to use `/tmp` directory on Vercel (serverless writable location)
- Automatically creates data directory if it doesn't exist
- Falls back to local `data/` directory for development

### 6. **Vercel Configuration** (`vercel.json`)
- Configured to build frontend as static site
- Routes `/api/*` requests to serverless backend
- Routes all other requests to frontend

## 📋 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables (if needed):**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add `JWT_SECRET` with a secure value
   - Add any other backend environment variables from `backend/.env`

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables for Vercel

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `JWT_SECRET` | Your secure secret key | Production |
| `NODE_ENV` | `production` | Production |

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at `https://your-project.vercel.app`
- [ ] Health check works: `https://your-project.vercel.app/api/health`
- [ ] Volunteer signup works
- [ ] Volunteer login works
- [ ] Organizer signup works
- [ ] Organizer login works
- [ ] Dashboard loads after login
- [ ] Activities can be created (organizer)
- [ ] Activities can be joined (volunteer)

## 🐛 Troubleshooting

### Issue: API calls return 404
**Solution:** Check that `vercel.json` is properly configured and routes are correct.

### Issue: CORS errors
**Solution:** Backend already has CORS enabled. If issues persist, check Vercel logs.

### Issue: Data not persisting
**Note:** Vercel serverless functions use `/tmp` which is ephemeral. For production, consider:
- Using a database (MongoDB, PostgreSQL, etc.)
- Using Vercel KV or other persistent storage
- Current setup works but data resets on cold starts

### Issue: Environment variables not working
**Solution:** 
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

## 📊 Local Development Still Works

The changes maintain full local development support:

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access locally:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`
   - Vite proxy handles API routing in development

## 🔄 Updating Your Deployment

To update your deployed app:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically redeploy on push to main branch.

## 📝 Important Notes

1. **Data Persistence:** Current JSON file storage is ephemeral on Vercel. Consider migrating to a database for production use.

2. **Cold Starts:** Serverless functions may have cold start delays. First request after inactivity might be slower.

3. **File Uploads:** If you add file upload features, use Vercel Blob or external storage (S3, Cloudinary, etc.)

4. **Environment Variables:** Never commit `.env` files. Always use Vercel dashboard for production secrets.

## 🎉 Success!

Your app should now be fully functional at:
- **Production:** `https://fest-connect-virid.vercel.app`
- **Local:** `http://localhost:3000`

Both environments work seamlessly with the same codebase!
