# 🚀 Deployment & Local Operations Guide - FestOps (2026)

This document provides guidelines for deploying the **FestOps** portal to production cloud hosts (like Vercel and Netlify) and starting up local development nodes.

---

## 🛠️ Local Development & Quick Start

Our project provides simplified batch launch scripts and self-healing data routines to get you running in seconds.

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher.
- **Git**: Installed and configured.

### 2. Environment Variables
Create a file named `.env` inside the `backend/` directory:
```env
PORT=5000
JWT_SECRET=your_secure_2026_jwt_secret_key_change_in_production
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```
> [!NOTE]
> Never commit `.env` files to git repositories.

### 3. Startup Scripts (Local)
You can launch both server processes simultaneously or use our quick-start helpers:

- **Start backend (Express + WebSockets)**:
  ```bash
  cd backend
  npm install
  npm start
  ```
- **Start frontend (Vite client)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **Access Points**:
  - Client workspace: `http://localhost:3000`
  - Backend server API: `http://localhost:5000`

---

## ☁️ Production Deployment on Vercel

The **FestOps** architecture supports serverless deployments on Vercel out-of-the-box.

### 1. Unified Configuration (`vercel.json`)
The root workspace includes a custom `vercel.json` file configuring the static asset routing and mapping api routers to Serverless Node.js functions:
- Static build output directory set to `frontend/dist`.
- Directing `/api/*` and WebSocket sockets to `/api/index.js` serverless gateway.
- Relative API base urls parsed using `.env.production` definitions.

### 2. Ephemeral Data Considerations
Vercel serverless containers are stateless. The self-healing file utilities map `readData` and `writeData` requests to the writeable `/tmp` storage path automatically on Vercel cold starts.
- **Tip**: For high-volume production use cases, it is recommended to replace the [fileHandler.js](file:///d:/Semestar%204/DIT%20Lab/Volunteer-Organizer/backend/utils/fileHandler.js) functions with a persistent relational database like PostgreSQL or MongoDB.

### 3. Deploying Steps
1. **GitHub Import**:
   - Navigate to the [Vercel Dashboard](https://vercel.com).
   - Select "Add New Project" and import your `Volunteer-Organizer` repository.
2. **Environment Variables**:
   - Add `JWT_SECRET` (secure random string) and `GEMINI_API_KEY` (official Google developer token) inside Project Settings.
3. **Trigger Build**:
   - Vercel automatically reads workspace packages and deploys the production bundle.

---

## ⚡ Deployment Checklist & Verification Tests

After launching the live URL, verify the following core features:

1. **API Health check**: Navigate to `https://your-domain.vercel.app/api/health` to confirm the backend responded with `status: "OK"`.
2. **Institutional Signup**: Create a Volunteer account using a valid college domain email.
3. **Discovery Board**: Navigate to the left panel and click `"Apply"` on an event to verify the yellow optimistic badge displays.
4. **Contextual Checklists**: (Organizer) Create a task mapped to your event. (Volunteer) Click checkbox inside the event card to verify experience points and badge upgrades.
5. **Real-time Chats**: Verify the Socket chatbox opens and persists messages.
6. **PDF Certificate Download**: Conclude the event as an organizer, click `"Download PDF"` on the volunteer card vault, and verify that the A4 landscap sheet streams correctly to your local downloads folder.
7. **AI suggestions**: Request recommendations on the volunteer panel to check Gemini JSON parses cleanly.

---

## 🐛 Troubleshooting Common Issues

### 1. "SecretOrPrivateKey must have a value" error on login
- **Cause**: The server is unable to load your local `JWT_SECRET` value.
- **Solution**: Ensure your `backend/.env` file is present in your local folder and your cloud environment variables are configured in your Vercel/Netlify dashboard.

### 2. "Gemini API key is not configured" on recommendations
- **Cause**: The `GEMINI_API_KEY` environment parameter is missing.
- **Solution**: Set a valid key from Google AI Studio in your `.env` or cloud portal.

### 3. Deletions do not reflect instantly
- **Cause**: Client arrays are not being correctly filtered in the React local state hooks.
- **Solution**: Verify that your action triggers invoke `.filter(item => item.id !== targetId)` inside dashboard update hooks.

### 4. PDF download opens a new window with error
- **Cause**: The backend was unable to find matching certifications array elements inside `volunteers.json` for the requested ID.
- **Solution**: Ensure you are using the correct generated key (e.g. `CERT-XXXXYYYY`) as the parameter.
