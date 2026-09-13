# AAA Tech Solutions - Deployment Guide (Vercel & Render)

This guide walks you through deploying the **Frontend to Vercel** and the **Backend to Render**, and connecting them together with your database (TiDB Cloud / MySQL).

---

## 🏗️ Architecture Overview

| Component | Platform | Technology | Configuration File |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | React 19 + Vite | [`vercel.json`](./vercel.json) & [`frontend/vercel.json`](./frontend/vercel.json) |
| **Backend** | **Render** | Node.js + Express + MySQL/TiDB | [`render.yaml`](./render.yaml) & [`backend/package.json`](./backend/package.json) |
| **Database** | **TiDB Cloud / MySQL** | MySQL 8.0+ Compatible | Managed Serverless Cloud DB |

---

## 🚀 Step 1: Deploy the Backend to Render

### Option A: Using Render Blueprints (Recommended - 1-Click)

1. Push your latest code with [`render.yaml`](./render.yaml) to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **"New +"** in the top navigation and select **"Blueprint"**.
4. Connect your GitHub repository (`AAA-TECH-SOLUTIONS` / `Website AAA`).
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name:** `aaa-tech-backend`
   - **Runtime:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
6. Fill in the required environment variables prompted by Render:
   - `DB_HOST`: Your TiDB Cloud / MySQL host
   - `DB_USER`: Your database username
   - `DB_PASSWORD`: Your database password
   - `ADMIN_PASSWORD`: Password for your initial administrator
7. Click **"Apply"** to deploy.

---

### Option B: Manual Web Service Setup on Render

If you prefer to configure manually without Blueprint:

1. In [Render Dashboard](https://dashboard.render.com/), click **"New +"** -> **"Web Service"**.
2. Select **"Build and deploy from a Git repository"** and connect your repo.
3. Configure settings:
   - **Name:** `aaa-tech-backend` (or your choice)
   - **Region:** Choose closest to your database (e.g., *Oregon (US West)* or *Singapore*)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Expand **"Advanced"** and set **Health Check Path** to `/health`.
5. Under **"Environment Variables"**, add:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Port (Render assigns automatically if omitted) |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (can update after Step 2) |
   | `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | TiDB Cloud or MySQL Host |
   | `DB_PORT` | `4000` | `4000` for TiDB Cloud, `3306` for standard MySQL |
   | `DB_USER` | `xxxxxx.root` | Database username |
   | `DB_PASSWORD` | `your_secure_password` | Database password |
   | `DB_NAME` | `aaa_tech_solutions` | Database name |
   | `DB_SSL` | `true` | `true` required for TiDB Cloud |
   | `JWT_SECRET` | `generate-random-secret-key-64-chars` | Random secure string for auth tokens |
   | `ADMIN_EMAIL` | `admin@gmail.com` | Default admin email |
   | `ADMIN_PASSWORD` | `YourAdminSecret123!` | Default admin password |
6. Click **"Deploy Web Service"**.
7. Copy your backend URL once live:
   `https://aaa-tech-backend.onrender.com`

---

## 🗄️ Step 2: Initialize / Seed the Database (One-time)

If your cloud database is new, run the seed script to create all tables and initial admin user:

### Method 1: Using Render Shell (Easiest)
1. Go to your backend service in Render dashboard.
2. Open the **"Shell"** tab.
3. Run:
   ```bash
   npm run seed
   ```
4. You will see:
   `✅ Database seeded successfully!`

### Method 2: From Local Machine
1. In your local `backend/.env`, set the TiDB Cloud credentials.
2. Run:
   ```bash
   cd backend
   npm run seed
   ```

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Log into [Vercel](https://vercel.com/) and click **"Add New..."** -> **"Project"**.
2. Select your GitHub repository.
3. In the **"Configure Project"** screen:
   - **Framework Preset:** `Vite` (automatically detected)
   - **Root Directory:** Click **Edit** and choose `frontend` *(recommended)*.
     *(Note: If you leave it as `./`, the included root `vercel.json` will handle it automatically!)*
4. Expand **"Environment Variables"** and add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://aaa-tech-backend.onrender.com/api` | Your Render backend URL + `/api` |
5. Click **"Deploy"**.
6. Vercel will build and deploy your site in ~30 seconds, giving you a production URL:
   `https://aaa-tech-solutions.vercel.app`

---

## 🔗 Step 4: Final Connection (CORS Setup)

1. Copy your new Vercel frontend URL (e.g. `https://aaa-tech-solutions.vercel.app`).
2. Go back to your **Render Dashboard** -> **aaa-tech-backend** -> **Environment**.
3. Edit or add `CORS_ORIGIN`:
   ```env
   CORS_ORIGIN=https://aaa-tech-solutions.vercel.app
   ```
   *(Note: The backend automatically handles wildcard previews `*.vercel.app` if any Vercel domain is present).*
4. Render will automatically redeploy with the updated CORS setting.

---

## 🔍 Verification & Testing

- **Backend Health Check:** Open `https://aaa-tech-backend.onrender.com/health` in your browser. You should see `{"status":"ok","database":"MySQL",...}`.
- **Backend API Check:** Open `https://aaa-tech-backend.onrender.com/api` in your browser. You should see `{"name":"AAA Tech Solutions API",...}`.
- **Frontend Check:** Visit your Vercel URL.
- **Client-Side Routing Test:** Directly visit or refresh `https://your-app.vercel.app/courses` or `/about` (verifies SPA rewrite in `vercel.json`).
- **Admin Login:** Visit `/admin/login` and log in with your configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

---

## 💡 Pro-Tips for Render Free Tier

1. **Cold Starts:** Render's free tier spins down the backend after 15 minutes of inactivity. The first request takes ~30-40 seconds to spin up.
   - The frontend API client is configured with a 45-second timeout and friendly status messaging to prevent false timeout aborts.
2. **Uptime Monitoring (Optional):** You can use a free service like [UptimeRobot](https://uptimerobot.com/) or [Cron-Job.org](https://cron-job.org/) to ping `https://your-backend.onrender.com/health` every 10 minutes to keep your Render instance awake.
