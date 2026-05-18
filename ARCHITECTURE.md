# 🏛️ System Architecture - FestOps (2026)

## 📊 High-Level Component Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT BROWSER (React)                           │
│                            (http://localhost:3000)                          │
│                                                                             │
│    ┌───────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───┐    │
│    │  Dashboards   │     │ Opportunity  │     │ Credentials  │     │ C │    │
│    │  (Vol/Org)    │     │ Board (Tabs) │     │ Vault (PDFs) │     │ h │    │
│    └───────┬───────┘     └──────┬───────┘     └──────┬───────┘     │ a │    │
│            │                    │                    │           │ t │    │
│            └────────────────────┼────────────────────┼───────────►   ◄────┤
│                                 │                    │           └───┘    │
│                                 ▼                    │             ▲      │
│                            Axios Hooks               │             │      │
│                      (api.js - JWT Headers)          │             │      │
└─────────────────────────────────┬────────────────────┼─────────────┼──────┘
                                  │                    │             │
                             REST │                    │ GET         │ Socket.io
                             APIs │                    │ /download   │ Websockets
                                  ▼                    ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS.JS BACKEND                               │
│                            (http://localhost:5000)                          │
│                                                                             │
│    ┌─────────────────┐ ┌──────────────────┐ ┌────────────────┐ ┌─────────┐  │
│    │ auth.js (JWT)   │ │ activities.js    │ │ chat.js (Logs) │ │ Socket  │  │
│    └────────┬────────┘ └────────┬─────────┘ └───────┬────────┘ │ Gateway │  │
│             │                   │                   │          └────┬────┘  │
│             │                   ▼                   │               │       │
│             │            ┌──────────────┐           │               │       │
│             │            │  tasks.js    │           │               │       │
│             │            └──────┬───────┘           │               │       │
│             ▼                   ▼                   ▼               ▼       │
│      ┌─────────────┐     ┌──────────────┐    ┌─────────────┐ ┌───────────┐  │
│      │ ai.js       │     │ certificates │    │ fileHandler │ │ socket.io │  │
│      │ (Gemini AI) │     │ (pdfkit A4)  │    │ (I/O Safe)  │ │   Rooms   │  │
│      └──────┬──────┘     └──────┬───────┘    └──────┬──────┘ └─────┬─────┘  │
└─────────────┼───────────────────┼───────────────────┼──────────────┼────────┘
              │                   │                   │              │
              │                   │                   ▼ File I/O     │
              │                   │            ┌─────────────┐       │
              │                   │            │ JSON Files  │       │
              │                   │            │ volunteers  │       │
              │                   │            │ activities  │◄──────┘
              │                   │            │ tasks       │
              └───────────────────┴───────────►│ messages    │
                                               └─────────────┘
```

---

## 🔄 Technical Flow Diagrams

### 1. Unified Real-Time Socket Chat Flow

```
Volunteer (Approved)                      Socket.io Gateway                    JSON Database
        │                                         │                                  │
        │ 1. Mount Chatroom.jsx                   │                                  │
        │ 2. emit("joinRoom", { activityId })     │                                  │
        ├────────────────────────────────────────►│                                  │
        │                                         │ 3. Bind to Room ID               │
        │                                         │                                  │
        │ 4. Type & Send Message                  │                                  │
        ├────────────────────────────────────────►│                                  │
        │                                         │ 5. readData("messages.json")     │
        │                                         │ 6. Push message context          │
        │                                         │ 7. writeData("messages.json")    │
        │                                         │─────────────────────────────────►│
        │                                         │                                  │
        │                                         │ 8. Broadcast to Room Members     │
        │                                         │    emit("newMessage")            │
        │◄────────────────────────────────────────│                                  │
```

### 2. Automated High-Fidelity PDF Certificate Download Flow

```
Volunteer (Vault)                       certificates.js (GET)                   PDFKit Engine
        │                                         │                                  │
        │ 1. Click "Download PDF"                 │                                  │
        ├────────────────────────────────────────►│                                  │
        │                                         │ 2. Find volunteer & cert ID      │
        │                                         │ 3. Parse student name & role     │
        │                                         │ 4. Instantiate PDFDocument       │
        │                                         ├─────────────────────────────────►│
        │                                         │                                  │
        │                                         │ 5. Draw Borders & Corner Brackets│
        │                                         │ 6. Fill Gold Star Accent Graphic │
        │                                         │ 7. Add Underlined Student Name   │
        │                                         │ 8. Render Verified Stamp Seal    │
        │                                         │◄─────────────────────────────────┤
        │                                         │                                  │
        │                                         │ 9. Set HTTP Headers:             │
        │                                         │    Content-Type: application/pdf │
        │                                         │ 10. Pipe doc stream directly     │
        │◄────────────────────────────────────────│                                  │
│ Stream complete / PDF saves successfully │
```

### 3. Structured JSON AI Recommendations Flow

```
Volunteer (Dashboard)                        ai.js (GET)                        Gemini SDK
        │                                         │                                  │
        │ 1. Click "Get AI Recommendations"       │                                  │
        ├────────────────────────────────────────►│                                  │
        │                                         │ 2. Fetch profile from JSON       │
        │                                         │ 3. Filter "upcoming" fests       │
        │                                         │ 4. Setup responseSchema OBJECT   │
        │                                         ├─────────────────────────────────►│
        │                                         │                                  │
        │                                         │ 5. Align skills via model        │
        │                                         │ 6. Populate activityId, title,   │
        │                                         │    and aiReasoning fields        │
        │                                         │◄─────────────────────────────────┤
        │                                         │                                  │
        │                                         │ 7. Parse response string         │
        │◄────────────────────────────────────────│                                  │
│ Renders premium suggestions cards grid │
```

---

## 🗄️ Unified Entity Relationship & JSON Databases

### 1. `volunteers.json` (Volunteer Schema)
Holds volunteer profiles, status tracking indexes, earned digital credentials, and point scores:
- `id` (String): Unique timestamp string.
- `email` (String): Valid institutional email address.
- `password` (String): Bcrypt hashed string.
- `rollNo` (String): 2026 format student roll number (`CS2026XXX`).
- `phoneNo` (String): Phone string.
- `skills` (Array): Custom tags added via `<SkillBuilder />`.
- `interests` (Array): Event type alignment categories.
- `activities` (Array): Event application arrays containing `{ activityId, status: "pending" | "approved" | "rejected" }`.
- `certifications` (Array): Credentials awarded: `{ id, activityId, activityName, role, dateIssued, issuingOrganizer }`.
- `points` (Number): Dynamic gamified activity score.
- `badges` (Array): Dynamic accolade titles.

### 2. `activities.json` (Fests Activity Schema)
Represents fests events created by coordinators:
- `id` (String): Unique event ID.
- `title` (String): Activity title.
- `description` (String): Description context.
- `date` (String): Date context calibrated to 2026 fests cycles.
- `location` (String): Location venue.
- `volunteersNeeded` (Number): Maximum workforce slots.
- `organizerId` (String): Creator organizer key.
- `status` (String): `"upcoming" | "ended"`.
- `volunteers` (Array): Registered volunteers list: `{ volunteerId, status: "pending" | "approved" | "rejected", taskId }`.

### 3. `tasks.json` (Checklists Schema)
Stores micro-tasks contextually mapped inside events:
- `id` (String): Unique task key.
- `activityId` (String): Contextual parent event ID.
- `title` (String): Task title.
- `description` (String): Description.
- `assignedTo` (String): Target volunteer ID (null if unassigned).
- `status` (String): `"unassigned" | "assigned" | "completed"`.
- `points` (Number): Experience points awarded on completion.

---

## 🔌 API Route Hierarchy

### Auth Gateway
- `/api/auth`
  - `POST /volunteer/signup` -> Register volunteer
  - `POST /volunteer/login` -> Authenticate volunteer
  - `PUT /volunteer/profile` -> Update skills & socials profile
  - `POST /organizer/signup` -> Register organizer
  - `POST /organizer/login` -> Authenticate organizer

### Fests Operations
- `/api/activities`
  - `GET /` -> List all activities (Auto-embeds matching tasks)
  - `GET /explore` -> List upcoming unapplied events and open tasks
  - `GET /my-activities` -> List joined events
  - `POST /` -> Create event (Organizer only)
  - `POST /:id/apply` -> Join activity or apply for specific tasks
  - `PATCH /:id/applications/:volunteerId` -> Coordinator recruitment decisions (`approve` / `reject`)
  - `POST /:id/conclude` -> Conclude fest and issue credentials
  - `DELETE /:id` -> Destructive cascade deletion (Wipes tasks, chats, and references)

### Tasks Operations
- `/api/tasks`
  - `POST /` -> Create task (Organizer only)
  - `PATCH /:id/status` -> Toggle status & evaluate badges
  - `POST /:id/claim` -> Instant volunteer task self-assignment
  - `DELETE /:id` -> Purge task

### AI Advisor
- `/api/ai`
  - `GET /recommendations` -> Structured JSON Gemini recommenders
  - `POST /skill-gap` -> Fast local skill gap analyzers

### Real-Time Chat
- `/api/chat`
  - `GET /:activityId` -> Fetch room discussions log

### Programmatic Certificate Downloads
- `/api/certificates`
  - `GET /:certId/download` -> Stream A4 landscape pdfkit downloads

---

## 🔐 Multi-Tier Security Specifications

1. **Role-Based Guards**: Every controller checks token payloads using the `authenticateToken` middleware and asserts `req.user.role` constraints.
2. **Safe JSON Stream Handlers**: All reads and writes to files are guarded against corruption by `verifyAndInitializeDatabases` and try-catch fallback parsers inside [fileHandler.js](file:///d:/Semestar%204/DIT%20Lab/Volunteer-Organizer/backend/utils/fileHandler.js).
3. **AI Guardrails**: Inputs are scanned by `containsInappropriateContent` to prevent prompt bypasses, and output generation utilizes strict type schema constraints directly inside Gemini SDK configurations.
4. **Cascade Cleanup Integrity**: Deleting fests wipes matching data rows across all JSON files simultaneously, preventing dangling pointer/referential errors.
