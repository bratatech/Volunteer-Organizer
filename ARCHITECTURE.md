# 🏛️ System Architecture

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                     (http://localhost:3000)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    REACT FRONTEND (Vite)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  App.jsx (React Router)                             │   │
│  │  ├── Landing Page                                   │   │
│  │  ├── Volunteer Routes                               │   │
│  │  │   ├── Signup                                     │   │
│  │  │   ├── Login                                      │   │
│  │  │   └── Dashboard                                  │   │
│  │  └── Organizer Routes                               │   │
│  │      ├── Signup                                     │   │
│  │      ├── Login                                      │   │
│  │      └── Dashboard                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────┐     │
│  │  API Utils (Axios)                                 │     │
│  │  - Authentication APIs                             │     │
│  │  - Activity APIs                                   │     │
│  │  - JWT Token Management                            │     │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ REST API Calls
                            │ (http://localhost:5000/api)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   EXPRESS.JS BACKEND                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  server.js                                          │   │
│  │  ├── CORS Middleware                                │   │
│  │  ├── JSON Parser                                    │   │
│  │  └── Route Handlers                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────┐     │
│  │  Routes                                            │     │
│  │  ├── /api/auth/*                                   │     │
│  │  │   ├── POST /volunteer/signup                    │     │
│  │  │   ├── POST /volunteer/login                     │     │
│  │  │   ├── POST /organizer/signup                    │     │
│  │  │   └── POST /organizer/login                     │     │
│  │  │                                                  │     │
│  │  └── /api/activities/*                             │     │
│  │      ├── GET /                                      │     │
│  │      ├── GET /my-activities                        │     │
│  │      ├── POST /                                     │     │
│  │      └── POST /:id/join                            │     │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────┐     │
│  │  Middleware                                        │     │
│  │  ├── authenticateToken (JWT Verification)          │     │
│  │  └── authorizeRole (Role-based Access)             │     │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────┐     │
│  │  Utils                                             │     │
│  │  ├── readData (Read JSON files)                    │     │
│  │  └── writeData (Write JSON files)                  │     │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ File I/O
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    JSON DATABASE (File System)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  data/                                              │   │
│  │  ├── volunteers.json                                │   │
│  │  ├── organizers.json                                │   │
│  │  └── activities.json                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagrams

### 1. Volunteer Registration Flow

```
User (Browser)
    │
    │ 1. Fill signup form
    │    (email, password, rollNo, phoneNo)
    ▼
VolunteerSignup.jsx
    │
    │ 2. POST /api/auth/volunteer/signup
    ▼
Backend: auth.js
    │
    │ 3. Validate input
    │ 4. Check if email exists
    │ 5. Hash password (bcrypt)
    │ 6. Create volunteer object
    ▼
fileHandler.js
    │
    │ 7. Read volunteers.json
    │ 8. Add new volunteer
    │ 9. Write to volunteers.json
    ▼
volunteers.json (Updated)
    │
    │ 10. Success response
    ▼
User redirected to login
```

### 2. Login & Authentication Flow

```
User (Browser)
    │
    │ 1. Enter credentials
    ▼
VolunteerLogin.jsx / OrganizerLogin.jsx
    │
    │ 2. POST /api/auth/volunteer/login
    ▼
Backend: auth.js
    │
    │ 3. Find user by email
    │ 4. Compare password (bcrypt)
    │ 5. Generate JWT token
    │ 6. Return token + user data
    ▼
Frontend: api.js
    │
    │ 7. Store token in localStorage
    │ 8. Store user data in localStorage
    │ 9. Update App state
    ▼
User redirected to dashboard
    │
    │ All subsequent requests include:
    │ Authorization: Bearer <token>
    ▼
Protected Routes (Dashboard)
```

### 3. Activity Creation Flow (Organizer)

```
Organizer (Dashboard)
    │
    │ 1. Click "Create Activity"
    │ 2. Fill form (title, description, date, etc.)
    ▼
OrganizerDashboard.jsx
    │
    │ 3. POST /api/activities
    │    Headers: Authorization: Bearer <token>
    ▼
Backend: activities.js
    │
    │ 4. authenticateToken middleware
    │    - Verify JWT
    │    - Extract user info
    │
    │ 5. Check if user is organizer
    │ 6. Create activity object
    ▼
fileHandler.js
    │
    │ 7. Read activities.json
    │ 8. Add new activity
    │ 9. Write to activities.json
    │
    │ 10. Update organizer's eventsCreated
    ▼
activities.json & organizers.json (Updated)
    │
    │ 11. Return new activity
    ▼
Dashboard refreshes with new activity
```

### 4. Join Activity Flow (Volunteer)

```
Volunteer (Dashboard)
    │
    │ 1. Browse available activities
    │ 2. Click "Join Activity"
    ▼
VolunteerDashboard.jsx
    │
    │ 3. POST /api/activities/:id/join
    │    Headers: Authorization: Bearer <token>
    ▼
Backend: activities.js
    │
    │ 4. authenticateToken middleware
    │ 5. Check if user is volunteer
    │ 6. Find activity by ID
    │ 7. Check if already joined
    │ 8. Add volunteer ID to activity
    ▼
fileHandler.js
    │
    │ 9. Update activities.json
    │ 10. Update volunteers.json
    ▼
Both files updated
    │
    │ 11. Return success
    ▼
Dashboard refreshes
    │
    │ Activity moves from "Available"
    │ to "My Activities" tab
    ▼
Updated UI
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Input Validation                              │
│  ├── Frontend form validation                           │
│  ├── Required field checks                              │
│  └── Email format validation                            │
│                                                          │
│  Layer 2: Password Security                             │
│  ├── Minimum length requirement (6 chars)               │
│  ├── Bcrypt hashing (10 salt rounds)                    │
│  └── No plain text storage                              │
│                                                          │
│  Layer 3: Authentication                                │
│  ├── JWT token generation                               │
│  ├── Token expiration (24 hours)                        │
│  ├── Token stored in localStorage                       │
│  └── Token sent in Authorization header                 │
│                                                          │
│  Layer 4: Authorization                                 │
│  ├── authenticateToken middleware                       │
│  ├── Role-based access control                          │
│  ├── Volunteer-only endpoints                           │
│  └── Organizer-only endpoints                           │
│                                                          │
│  Layer 5: Route Protection                              │
│  ├── Protected frontend routes                          │
│  ├── Redirect if not authenticated                      │
│  └── Role-specific redirects                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📦 Component Hierarchy

```
App.jsx
│
├── Router
│   │
│   ├── Landing.jsx (Public)
│   │
│   ├── Volunteer Routes
│   │   ├── VolunteerSignup.jsx (Public)
│   │   ├── VolunteerLogin.jsx (Public)
│   │   │   └── Uses: api.js → volunteerLogin()
│   │   │
│   │   └── VolunteerDashboard.jsx (Protected)
│   │       ├── Navbar.jsx
│   │       ├── StatsCard.jsx (x3)
│   │       └── ActivityCard.jsx (multiple)
│   │           └── Uses: api.js → getAllActivities()
│   │                              getMyActivities()
│   │                              joinActivity()
│   │
│   └── Organizer Routes
│       ├── OrganizerSignup.jsx (Public)
│       ├── OrganizerLogin.jsx (Public)
│       │   └── Uses: api.js → organizerLogin()
│       │
│       └── OrganizerDashboard.jsx (Protected)
│           ├── Navbar.jsx
│           ├── StatsCard.jsx (x3)
│           ├── Create Activity Form
│           │   └── Uses: api.js → createActivity()
│           │
│           └── ActivityCard.jsx (multiple)
│               └── Uses: api.js → getMyActivities()
│
└── Global State
    ├── user (from localStorage)
    └── token (from localStorage)
```

## 🗄️ Database Schema

```
volunteers.json
[
  {
    id: string (timestamp)
    email: string (unique)
    password: string (hashed)
    rollNo: string
    phoneNo: string
    role: "volunteer"
    createdAt: ISO timestamp
    activities: [activity_ids]
  }
]

organizers.json
[
  {
    id: string (timestamp)
    email: string (unique)
    password: string (hashed)
    role: "organizer"
    createdAt: ISO timestamp
    eventsCreated: [activity_ids]
  }
]

activities.json
[
  {
    id: string (timestamp)
    title: string
    description: string
    date: ISO timestamp
    location: string
    volunteersNeeded: number
    organizerId: string
    volunteers: [volunteer_ids]
    status: "upcoming" | "completed"
    createdAt: ISO timestamp
  }
]
```

## 🎨 UI Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                        Navbar                            │
│  Logo | User Email | Role Badge | Logout Button         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Dashboard Header                      │
│  Welcome Message | Action Button                        │
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────────────────┐
│  StatsCard   │  StatsCard   │  StatsCard               │
│  Icon        │  Icon        │  Icon                    │
│  Title       │  Title       │  Title                   │
│  Value       │  Value       │  Value                   │
└──────────────┴──────────────┴──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Profile Section                       │
│  Email | Roll No | Phone | Role                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Tab Navigation                        │
│  Available Activities | My Activities                   │
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────────────────┐
│ ActivityCard │ ActivityCard │ ActivityCard             │
│ Title        │ Title        │ Title                    │
│ Description  │ Description  │ Description              │
│ Date         │ Date         │ Date                     │
│ Location     │ Location     │ Location                 │
│ Volunteers   │ Volunteers   │ Volunteers               │
│ [Join Button]│ [Join Button]│ [Join Button]            │
└──────────────┴──────────────┴──────────────────────────┘
```

This architecture provides a clear, scalable foundation for the volunteer and organizer management system!
