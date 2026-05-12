# 🚀 Quick Start Guide

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies

Open two terminal windows in the project root directory.

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Start the Servers

**Terminal 1 - Start Backend (Port 5000):**
```bash
cd backend
npm start
```

You should see: `Server is running on port 5000`

**Terminal 2 - Start Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```

You should see: `Local: http://localhost:3000`

### Step 3: Open the Application

Open your browser and go to: **http://localhost:3000**

## 🎯 Testing the Application

### Test as Volunteer:

1. Click "Join as Volunteer" on the landing page
2. Fill in the signup form:
   - Email: `student@college.edu` (must contain college/university or end with .edu)
   - Roll No: `CS2024001`
   - Phone: `+1234567890`
   - Password: `password123`
3. Login with your credentials
4. Explore the volunteer dashboard
5. Browse and join available activities

### Test as Organizer:

1. Click "Register as Organizer" on the landing page
2. Fill in the signup form:
   - Email: `organizer@example.com`
   - Password: `password123`
3. Login with your credentials
4. Create a new activity:
   - Title: `Registration Desk Management`
   - Description: `Help manage the registration process`
   - Date: Select any future date
   - Location: `Main Auditorium`
   - Volunteers Needed: `10`
5. View your created activities on the dashboard

## 📁 Project Structure Overview

```
Volunteer-Organizer/
├── backend/          # Express.js API server
│   ├── data/        # JSON database files
│   ├── routes/      # API endpoints
│   └── server.js    # Main server file
│
└── frontend/        # React + Tailwind UI
    ├── src/
    │   ├── pages/   # All page components
    │   ├── components/  # Reusable components
    │   └── App.jsx  # Main routing
    └── package.json
```

## 🔑 Key Features to Test

### Volunteer Dashboard:
- ✅ View profile information
- ✅ See activity statistics
- ✅ Browse available activities
- ✅ Join activities
- ✅ View joined activities

### Organizer Dashboard:
- ✅ View profile information
- ✅ See event statistics
- ✅ Create new activities
- ✅ View all created activities
- ✅ Track volunteer participation

## 🛠️ Troubleshooting

### Backend won't start:
- Make sure port 5000 is not in use
- Check if Node.js is installed: `node --version`
- Verify all dependencies are installed: `cd backend && npm install`

### Frontend won't start:
- Make sure port 3000 is not in use
- Check if Node.js is installed: `node --version`
- Verify all dependencies are installed: `cd frontend && npm install`

### Can't login:
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify you've signed up first before logging in

### Activities not showing:
- Make sure you're logged in
- Check if backend is running
- Try refreshing the page

## 📝 Default Configuration

- **Backend Port:** 5000
- **Frontend Port:** 3000
- **JWT Expiration:** 24 hours
- **Database:** JSON files in `backend/data/`

## 🎨 Customization

### Change Colors:
Edit `frontend/tailwind.config.js` to modify the color scheme.

### Change Ports:
- Backend: Edit `backend/.env` file
- Frontend: Edit `frontend/vite.config.js` file

### Add Features:
- Backend routes: `backend/routes/`
- Frontend pages: `frontend/src/pages/`
- Components: `frontend/src/components/`

## 📚 Next Steps

1. Explore the codebase
2. Customize the design
3. Add more features
4. Deploy to production

Enjoy building your college fest management system! 🎉
