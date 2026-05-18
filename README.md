# 🚀 FestOps - College Fest Volunteer Management & Dynamic Certification Portal (2026)

A premium, full-stack, enterprise-grade college festival operation management portal. **FestOps** streamlines volunteer recruitment, real-time team coordination, task checklists, programmatic credential generation, and intelligent AI-guided recommendations with a gorgeous, high-fidelity responsive interface.

---

## 🎯 Key Capabilities

### 🎓 For Volunteers
- **Secure Signup & Validation**: Secure registration using institutional college emails, phone numbers, and unique 2026 roll numbers (`CS2026XXX`) backed by `bcrypt` password hashes.
- **Opportunity Discovery Board**: A fluid, glassmorphic discovery board displaying open activities and unclaimed tasks with dynamic **Optimistic UI feedback** (applying transforms buttons instantly into yellow `⏳ Pending Approval` tags).
- **Contextual Tasks Checklist**: Complete assigned micro-tasks directly inside individual event card drop-downs. Checks off accomplishments in real-time, triggering progress points and badges.
- **Real-Time Team Chats**: Built-in instant messaging channels for approved volunteers to align on tasks with team members and organizers in real-time.
- **Verified Credentials Vault**: Displays dynamic earned digital accolades, quick LinkedIn code clippers, and interactive modals displaying formal **Certificates of Excellence**.
- **Instant A4 PDF Downloads**: Programmatic download pipeline streaming landscape A4-size high-fidelity certificate sheets directly from the backend with zero-latency.

### 👥 For Organizers (Recruiters)
- **Recruitment Dashboard**: Track event metrics, creation checklists, and live application queues in a central glass panel.
- **Recruiter Application Manager**: Visual inbound applicant grids displaying detailed skills tags, college roll numbers, and one-click green `✅ Accept & Assign` or red `❌ Reject` workflows.
- **Associated Task Creation**: Spawn activities and bind micro-tasks to them using relational select menus on creation.
- **Workforce Analytics Table**: A high-density, searchable roster tracking active volunteers, dynamic multi-colored task completion progress bars, and lists of earned badges.
- **Cascade Deletion**: Safely clean up events using a secure cascade trigger which removes activities while scrubbing associated tasks, Socket.io chats, and volunteer application arrays to prevent orphaned data anomalies.
- **Event Concluding & Certification**: Conclude activities contextually, query volunteer tasks completion rates, pre-check top performers, and award verified credential keys (`CERT-XXXXYYYY`) automatically.
- **Local Skill Gap Analyzer**: A fast local evaluator matching volunteer skills against activity demands, returning overlapping competencies and missing required skills instantly.

### 🧠 Intelligent AI Area Advisor
- **Structured JSON Recommendations**: Queries volunteer profiles securely by verified JWT identity and leverages the official `@google/generative-ai` SDK (`gemini-2.5-flash`) utilizing `responseSchema` options to return structured matching fests activities.
- **Input & Output Safeguards**: Sanitizes student inputs to prevent prompt injections, blocks profanity, and prevents safety bypasses.

---

## 🏗️ Technical Architecture & Project Structure

```
Volunteer-Organizer/
├── backend/
│   ├── data/                    # Self-Healing JSON Database Files
│   │   ├── volunteers.json      # Volunteers schema registries
│   │   ├── organizers.json      # Recruiter profiles
│   │   ├── activities.json      # Event & contextual task context
│   │   └── messages.json        # Persisted Socket.io chat history
│   ├── middleware/
│   │   └── auth.js              # JWT auth & role validation middleware
│   ├── routes/
│   │   ├── auth.js              # Password hashes & login routes
│   │   ├── activities.js        # Dynamic explore, apply, & conclude routes
│   │   ├── tasks.js             # Task status toggles & claims endpoints
│   │   ├── chat.js              # Room history fetchers
│   │   ├── organizers.js        # Recruiter workforce analytics
│   │   ├── ai.js                # Gemini JSON recomendations & skill gap analyzers
│   │   └── certificates.js      # pdfkit landscape drawing download engine
│   ├── utils/
│   │   └── fileHandler.js       # Safe fs read/write & database self-healers
│   ├── .env                     # Secure local env (JWT keys, ports)
│   ├── server.js                # Socket.io & Express server configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/          # Reusable Glassmorphic Components
    │   │   ├── SkillBuilder.jsx         # Volunteer profile skills input
    │   │   ├── BadgeShowcase.jsx        # Accolades & rewards roster
    │   │   ├── TodoList.jsx             # Contextual task checklist
    │   │   ├── OpportunityBoard.jsx     # Discoverable fests event grid
    │   │   ├── ApplicationManager.jsx   # Inbound applicant review console
    │   │   ├── SkillFilter.jsx          # Live volunteer search filter
    │   │   ├── CertificateVault.jsx     # Digital credentials & PDF downloads
    │   │   ├── Chatroom.jsx             # Real-time WebSocket discussion room
    │   │   ├── Navbar.jsx               # Branded navigation utility
    │   │   └── StatsCard.jsx            # Dynamic analytics counter
    │   ├── pages/                   # Main Page Views
    │   │   ├── Landing.jsx              # Rebranded marketing welcome screen
    │   │   ├── VolunteerSignup.jsx      # Volunteer onboarding
    │   │   ├── VolunteerLogin.jsx       # Volunteer credentials entry
    │   │   ├── VolunteerDashboard.jsx   # Volunteer interactive workspace
    │   │   ├── OrganizerSignup.jsx      # Organizer signups
    │   │   ├── OrganizerLogin.jsx       # Organizer login
    │   │   └── OrganizerDashboard.jsx   # Recruiter manager workspace
    │   ├── utils/
    │   │   └── api.js                   # Unified Axios API connectors
    │   ├── App.jsx                      # React router configuration
    │   ├── main.jsx                     # Vite entry script
    │   └── index.css                    # Global animations & CSS tokens
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Database Initialization
Our server features **Self-Healing Datastores**. On boot, the server checks the `backend/data/` folder and automatically formats missing or empty files with correct JSON structures (`[]`), ensuring the app never crashes on a clean deploy!

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install all required dependencies (including `pdfkit` and `@google/generative-ai`):
   ```bash
   npm install
   ```
3. Configure the `.env` file with your credentials:
   ```env
   PORT=5000
   JWT_SECRET=your_secure_2026_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_credential_here
   ```
4. Spin up the server:
   ```bash
   npm start
   ```
   The API and Socket server will listen at `http://localhost:5000`

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend packages (including `socket.io-client`):
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
   The client interface will open at `http://localhost:3000`

---

## 🔌 API Endpoints Reference

### 🔐 Authentication
- `POST /api/auth/volunteer/signup` - Register volunteer (Validates college domain emails)
- `POST /api/auth/volunteer/login` - Volunteer JWT log in
- `PUT /api/auth/volunteer/profile` - Update skills and socials in profile
- `POST /api/auth/organizer/signup` - Register event coordinator
- `POST /api/auth/organizer/login` - Organizer JWT log in

### 🎪 Activities & Application Loop
- `GET /api/activities` - Fetch all activities (automatically embeds task checklists)
- `GET /api/activities/explore` - Fetch active activities the volunteer hasn't applied to
- `GET /api/activities/my-activities` - Fetch joined activities (with contextual checklists)
- `POST /api/activities` - Create activity (Organizer only; maps optional associated task checklist)
- `POST /api/activities/:id/apply` - Submit activity/task join application
- `PATCH /api/activities/:id/applications/:volunteerId` - Recruiter application decision (`approve` / `reject`)
- `DELETE /api/activities/:id` - Destructive cascade purge (scans and cleans tasks, chats, and applications)

### 📋 Checklists & Micro-Tasks
- `POST /api/tasks` - Create task associated with event (Organizer only)
- `PATCH /api/tasks/:id/status` - Toggle completion status (handles badge/experience triggers)
- `POST /api/tasks/:id/claim` - Instant volunteer self-assignment for open tasks
- `DELETE /api/tasks/:id` - Destructive task purge

### 🗣️ Socket & Team Chat
- `GET /api/chat/:activityId` - Fetch persisted chat logs
- WebSocket room joins triggered on client component load (`joinRoom`)

### 📊 Recruiter Workforce Analytics
- `GET /api/organizers/volunteer-overview` - Retrieve comprehensive student search indexes, dynamic completion rates, and earned badges

### 🎓 Academic Credentials & PDF Generator
- `POST /api/activities/:id/conclude` - Conclude event, tag leader roles, generate credential IDs
- `GET /api/certificates/:certId/download` - Programmatic high-fidelity landscape A4 certificate streaming download

### 🧠 Gemini AI Router
- `GET /api/ai/recommendations` - Structured JSON suggestion engine based on volunteer profile
- `POST /api/ai/skill-gap` - Instant volunteer-event case-insensitive skill comparison comparator

---

## 🛡️ Security Features
- **Bcrypt Hashing**: Password arrays stored as secured hashes.
- **JWT Authorization Headers**: REST interfaces strictly guarded with session validation filters.
- **Input Profanity Filter**: Rejects malicious prompts and safety bypass attempts.
- **Cascade Purging**: Cleans linked dependencies to prevent SQL/JSON anomalies.

---

## 🎉 Acknowledgments
Designed for fests operations to streamline workforce mobilization and official academic credentials. **FestOps 2026** - Streamlining Tomorrow's Campus Celebrations!
