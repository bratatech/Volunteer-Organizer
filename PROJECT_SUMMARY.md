# 📋 Project Summary - FestOps (Dynamic Fest Management & Certification Portal)

## 🎯 Project Overview
**FestOps** is an enterprise-grade full-stack portal designed to mobilize student workforces, simplify task execution checklists, host real-time collaboration chats, and issue formal, secure digital credentials for college festival celebrations. It provides two highly-tuned, glassmorphic workspace layouts custom-designed for volunteers and organizers with secure role-based controls.

---

## ✨ Features Completed

### 🔐 Authentication & Session Security
- **Separate Client Onboarding**: Distinct sign-up and log-in pages featuring input validation rules.
- **Institutional Validations**: Volunteer accounts require verified academic emails (e.g. ending in college domain).
- **Hashed Credentials**: Bcrypt hashing using 10 salt rounds.
- **Protected REST API Headers**: JWT-based session checks (24-hour expiration) with standard Authorization Bearer header formats.
- **Robust Crash Logging**: All authentication streams are wrapped inside explicit catch blocks with console trace logging to prevent server failures.

### 🎓 Volunteer Workspace
- **Opportunity Discovery Board**: A beautiful glass tab display listing open, unapplied festival events and unassigned micro-tasks.
- **Dynamic Optimistic UI**: Registering for an event or claiming a task instantly transforms buttons to disabled yellow `⏳ Pending Approval` or green `Claimed!` tags with local array rollbacks on server failure.
- **Integrated Team Chats**: Once approved, volunteers get access to dedicated event chat rooms utilizing Socket.io real-time streaming.
- **Context-driven Task Checklist**: Complete checklists contextually inside event cards, immediately triggering experience progress points and badge awards.
- **Accolades & Credentials Vault**: Features LinkedIn copy-ready certification clippers and interactive formal digital certificates.
- **High-Fidelity PDF Downloads**: Programs on-the-fly certificate downloads using `pdfkit` to yield gorgeous A4 landscape sheets.

### 👥 Organizer Control Console
- **Workforce Analytics Table**: Searchable student roster tracking names, 2026 roll numbers, active events, dynamic color-coded task progress bars, and badges.
- **Contextual Task Creation**: Link checklists contextually to fests during task creation using integrated select menus.
- **Inbound Applicant Manager**: Recruiter review console with full skills tag profiles, allowing green `✅ Accept & Assign` or red `❌ Reject` workflows with immediate local state cleanups.
- **Cascade Purges**: Deleting a fest automatically cleans activities, associated tasks, chat histories, applicant lists, and dashboard arrays to prevent orphaned records.
- **Smart Conclude & Certify**: Ends active fests, evaluates volunteer checklists, pre-checks top performers automatically, and issues certified credential keys (`CERT-XXXXYYYY`).

### 🧠 Gemini AI Area Advisor
- **Structured JSON Recommendations**: Employs the official `@google/generative-ai` SDK (`gemini-2.5-flash`) utilizing `responseSchema` options to suggest matching activities in structured JSON format.
- **Local Skill Gap Analyzer**: High-speed, organizer-only local intersection comparator matching candidate skills to event demands with zero API latency.

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18, Vite (fast HMR), Axios (unified client hooks), Vanilla CSS (premium Glassmorphism tokens).
- **Backend**: Express.js, Socket.io (WebSocket chat rooms), PDFKit (programmatic drawing engine), @google/generative-ai (Gemini structured recommender).
- **Database**: Ephemeral Self-Healing JSON storage files with automatic startup database structure format validation checks.

---

## 🗄️ Unified Data Models (2026)

### Volunteer Schema (`volunteers.json`)
```json
[
  {
    "id": "1779107277738",
    "email": "raj.kumar@student.edu.in",
    "password": "$2b$10$hashed_password...",
    "rollNo": "CS2026045",
    "phoneNo": "+919876543210",
    "role": "volunteer",
    "skills": ["React", "Graphic Design", "Social Media"],
    "interests": ["Tech Fest", "Cultural Operations"],
    "activities": [
      { "activityId": "act_001", "status": "approved" }
    ],
    "certifications": [
      {
        "id": "CERT-2D8F9A4C",
        "activityId": "act_001",
        "activityName": "National Tech Fest 2026",
        "role": "Team Lead",
        "dateIssued": "2026-05-18",
        "issuingOrganizer": "FestOps Recruiter"
      }
    ],
    "badges": ["First Step", "Task Master"],
    "points": 120,
    "createdAt": "2026-05-18T12:00:00Z"
  }
]
```

### Activity Schema (`activities.json`)
```json
[
  {
    "id": "act_001",
    "title": "National Tech Fest 2026",
    "description": "Annual campus technology celebration and hackathons.",
    "date": "2026-05-24",
    "location": "Main Campus Auditorium",
    "volunteersNeeded": 15,
    "organizerId": "org_110",
    "status": "upcoming",
    "volunteers": [
      { "volunteerId": "1779107277738", "status": "approved" }
    ],
    "createdAt": "2026-05-18T11:00:00Z"
  }
]
```

### Task Schema (`tasks.json`)
```json
[
  {
    "id": "task_992",
    "activityId": "act_001",
    "title": "Hackathon Lab Setup",
    "description": "Coordinate networking cables and seat arrangements.",
    "assignedTo": "1779107277738",
    "status": "completed",
    "points": 50,
    "createdAt": "2026-05-18T11:30:00Z"
  }
]
```

---

## 🎨 UI Component Architecture
1. **Landing.jsx**: Bold dark-mode glassmorphic hero page showcasing real-time dashboards and certification timelines.
2. **OpportunityBoard.jsx**: Responsive dual-tab discovery grid with dynamic Optimistic UI feedback states.
3. **ApplicationManager.jsx**: Context-driven recruiter review grid featuring accept/reject transitions.
4. **VolunteerActivityTracker.jsx**: High-density Workforce Tracker table displaying live student progress bars, badges, and filters.
5. **CertificateVault.jsx**: Double-bordered credential badges, copy clippers, and landscape A4 PDF download triggers.
6. **Chatroom.jsx**: Sticky sidebar real-time group chatroom widget.

---

## ✅ Completed Roadmap Checklist
- [x] Secure auth registries with institutional email validation constraints.
- [x] Multi-layered JWT authorization middlewares.
- [x] Self-Healing JSON storage database checkers.
- [x] Dynamic Opportunity Discovery Board with Optimistic UI filters.
- [x] Cascade deletion hooks for clean event removals.
- [x] Contextual nested checklists inside expandable activity panels.
- [x] Real-time Socket.io chatrooms with persisted history.
- [x] Searchable Organizer Workforce Analytics Progress grid.
- [x] Smart Event Conclusion & Certification modal triggers.
- [x] Programmatic PDFKit landscape certificate download streams.
- [x] Structured JSON Recommender using Gemini SDK configuration.
- [x] Local case-insensitive Organizer Skill-Gap Analyzer.

---

## 🎉 Conclusion
The **FestOps** portal represents a complete, secure, and production-ready college fests mobilization dashboard. With interactive chat systems, high-fidelity PDF documents, structured AI advice, and responsive glass panels, it delivers a state-of-the-art administrative portal calibrated for 2026 campus operations.
