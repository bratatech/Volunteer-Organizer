# College Fest - Volunteer & Organizer Management System

A comprehensive web application for managing volunteers and organizers for college fest events. Built with React, Tailwind CSS, Express.js, and JSON-based storage.

## 🎯 Features

### For Volunteers
- Sign up with college email, roll number, and phone number
- Browse available activities and events
- Join activities and track participation
- View personalized dashboard with activity statistics
- Secure password hashing with bcrypt

### For Organizers
- Simple registration with email and password
- Create and manage fest activities
- Track volunteer participation
- View comprehensive dashboard with event statistics
- Monitor volunteer engagement

## 🏗️ Project Structure

```
Volunteer-Organizer/
├── backend/
│   ├── data/                    # JSON database files
│   │   ├── volunteers.json      # Volunteer data
│   │   ├── organizers.json      # Organizer data
│   │   └── activities.json      # Activity data
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── activities.js        # Activity management routes
│   ├── utils/
│   │   └── fileHandler.js       # JSON file operations
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/          # Reusable components
    │   │   ├── ActivityCard.jsx
    │   │   ├── StatsCard.jsx
    │   │   └── Navbar.jsx
    │   ├── pages/               # Page components
    │   │   ├── Landing.jsx
    │   │   ├── VolunteerSignup.jsx
    │   │   ├── VolunteerLogin.jsx
    │   │   ├── VolunteerDashboard.jsx
    │   │   ├── OrganizerSignup.jsx
    │   │   ├── OrganizerLogin.jsx
    │   │   └── OrganizerDashboard.jsx
    │   ├── utils/
    │   │   └── api.js           # API utility functions
    │   ├── App.jsx              # Main app with routing
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Update the `.env` file if needed (default values are provided):
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📋 API Endpoints

### Authentication Routes

#### Volunteer
- `POST /api/auth/volunteer/signup` - Register new volunteer
  - Body: `{ email, password, rollNo, phoneNo }`
- `POST /api/auth/volunteer/login` - Volunteer login
  - Body: `{ email, password }`

#### Organizer
- `POST /api/auth/organizer/signup` - Register new organizer
  - Body: `{ email, password }`
- `POST /api/auth/organizer/login` - Organizer login
  - Body: `{ email, password }`

### Activity Routes (Protected)

- `GET /api/activities` - Get all activities
- `GET /api/activities/my-activities` - Get user's activities
- `POST /api/activities` - Create activity (Organizer only)
  - Body: `{ title, description, date, location, volunteersNeeded }`
- `POST /api/activities/:id/join` - Join activity (Volunteer only)

## 🎨 Frontend Routes

- `/` - Landing page
- `/volunteer/signup` - Volunteer registration
- `/volunteer/login` - Volunteer login
- `/volunteer/dashboard` - Volunteer dashboard (protected)
- `/organizer/signup` - Organizer registration
- `/organizer/login` - Organizer login
- `/organizer/dashboard` - Organizer dashboard (protected)

## 🔐 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected routes with middleware
- Role-based access control
- Token expiration (24 hours)

## 🎨 Design Features

- Modern, responsive UI with Tailwind CSS
- Gradient backgrounds and smooth transitions
- Card-based layouts for better organization
- Color-coded stats and status indicators
- Mobile-friendly design
- Intuitive navigation

## 📊 Data Storage

The application uses JSON files for data persistence:
- `volunteers.json` - Stores volunteer information
- `organizers.json` - Stores organizer information
- `activities.json` - Stores activity/event information

## 🛠️ Technologies Used

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- Vite

### Backend
- Express.js
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- cors
- dotenv

## 📝 Usage Tips

1. **For Volunteers:**
   - Use a valid college email during signup
   - Browse available activities on your dashboard
   - Join activities that interest you
   - Track your participation in the "My Activities" tab

2. **For Organizers:**
   - Create activities with clear descriptions
   - Set volunteer requirements for each activity
   - Monitor volunteer participation
   - Track all your created events in one place

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Acknowledgments

Built for college fest management to streamline volunteer coordination and event organization.
