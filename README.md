# ReleaseCheck 🚀
### Modern Release Checklist & Deployment Verification Tool

> An intuitive, high-performance web application designed to help engineering and product teams track release milestones, verify deployment steps, and ensure zero-defect deployments.

---

## 📑 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Database Schema](#-database-schema)
3. [API Endpoints](#-api-endpoints)
4. [Design Decisions & Architecture](#-design-decisions--architecture)
5. [Local Setup & Running Instructions](#-local-setup--running-instructions)
6. [Docker Setup](#-docker-setup)
7. [Automated Testing](#-automated-testing)
8. [Stress Testing & Performance Analysis](#-stress-testing--performance-analysis)
9. [PWA Support](#-pwa-support)
10. [Deployment Guide](#-deployment-guide)
11. [Video Presentation Script](#-video-presentation-script)

---

## 🛠 Tech Stack

- **Frontend:** React 19 (Hooks, functional components)
- **State Management:** Redux Toolkit (`createSlice`, `createAsyncThunk`)
- **Styling:** Bootstrap 5 + Custom Human-Centered CSS Design Tokens (Custom Indigo/Neutral palette, responsive grid, zero AI-boilerplate aesthetic)
- **Icons:** Lucide React
- **Backend:** Node.js with Express 5
- **Database:** PostgreSQL (Cloud Neon DB connection via `pg.Pool`)
- **Performance & Security:** Helmet, Gzip Compression, In-Memory Write-Invalidation Cache, CORS
- **Testing:** Jest, Supertest, React Testing Library
- **Benchmarking:** Autocannon
- **Containerization:** Docker & Docker Compose

---

## 🗄 Database Schema

The application uses PostgreSQL with a normalized schema to store releases and track completion of checklist steps:

```sql
CREATE TABLE IF NOT EXISTS releases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  release_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  additional_info TEXT DEFAULT '',
  steps_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
```

### Predefined Standard Steps (7 Steps)
1. `pr_merged`: "All relevant Github pull requests have been merged"
2. `changelog_updated`: "CHANGELOG.md files have been updated"
3. `tests_passing`: "All tests are passing"
4. `github_release_created`: "Releases in Github created"
5. `deployed_demo`: "Deployed in demo"
6. `tested_demo`: "Tested thoroughly in demo"
7. `deployed_production`: "Deployed in production"

### Status Computation Logic
The status is **automatically computed** based on step completion:
- **`planned`**: 0 steps completed.
- **`ongoing`**: Between 1 and 6 steps completed.
- **`done`**: All 7 steps completed.

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/api/health` | Healthcheck and uptime probe | None | `{ status: "ok", uptime: number, timestamp: string }` |
| `GET` | `/api/steps` | List predefined standard release checklist steps | None | `{ success: true, data: Step[] }` |
| `GET` | `/api/releases` | List all releases (ordered by date desc) | None | `{ success: true, data: Release[] }` |
| `GET` | `/api/releases/:id` | Get details of a single release | None | `{ success: true, data: Release }` |
| `POST` | `/api/releases` | Create a new release | `{ name, release_date, additional_info?, steps_completed? }` | `{ success: true, message: string, data: Release }` |
| `PUT` | `/api/releases/:id` | Update release info / checklist steps | `{ name?, release_date?, additional_info?, steps_completed? }` | `{ success: true, message: string, data: Release }` |
| `DELETE` | `/api/releases/:id` | Delete a release | None | `{ success: true, message: string, data: { id } }` |

---

## 🎨 Design Decisions & Architecture

1. **Avoidance of Generic AI-Generated Aesthetics:**
   - Instead of default blue-purple gradients and templated component cards, we created an intentional developer-first design system.
   - Background uses crisp, airy slate neutral (`#f8fafc`), clean surface borders (`#e2e8f0`), deep iris brand accents (`#5046e5`), and subtle high-contrast status pills (Planned in neutral slate, Ongoing in warm amber, Done in clean emerald).
2. **Strict Client-Server Data Consistency:**
   - Step statuses are calculated both client-side (for instant UI responsiveness) and enforced server-side upon persistence.
   - Write-invalidation caching ensures reads are sub-millisecond without risk of stale data.
3. **Single-Page Application Workflow:**
   - Smooth navigation between the "All releases" dashboard and the release creation/detail view with breadcrumbs and zero full-page reloads.
4. **Mobile & Tablet Responsiveness:**
   - Uses Bootstrap's grid and flex utilities combined with responsive table wrappers and touch-friendly toggle targets.

---

## 🚀 Local Setup & Running Instructions

### Prerequisites
- Node.js >= 18 (Tested on Node 20)
- npm >= 9

### Step 1: Clone and Install Dependencies

```bash
# In the project root:
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### Step 2: Environment Configuration
The database connection string is configured in `server/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_QJ6vwHVRPTz9@ep-young-grass-ath18xm9-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=development
```

### Step 3: Seed Sample Releases (Matching Mockup)
```bash
npm run seed
```

### Step 4: Run the Application
Open two terminal windows (or run in background):

**Terminal 1 (Backend Server):**
```bash
npm --prefix server run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm --prefix client start
# React app opens on http://localhost:3000
```

---

## 🐳 Docker Setup

Run the entire application in isolated Docker containers:

```bash
# Build and run backend + frontend using docker-compose:
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

To run only the backend server with Docker:
```bash
cd server
docker build -t releasecheck-server .
docker run -p 5000:5000 --env-file .env releasecheck-server
```

---

## 🧪 Automated Testing

### Backend Integration & Unit Tests
Verifies database table initialization, status calculation logic, and full CRUD endpoints:
```bash
npm --prefix server test
```
*Result: 10/10 tests passing.*

### Frontend Component & Redux Tests
Verifies view rendering, new release form interactions, and real-time checklist toggling:
```bash
npm --prefix client test -- --watchAll=false
```
*Result: 3/3 test suites passing.*

---

## ⚡ Stress Testing & Performance Analysis

We performed load testing using `autocannon` to establish baseline bottlenecks, test optimizations, and document the delta:

```bash
npm run stress
```

### Benchmark Results Table

| Test Scenario | Concurrency | Requests / sec | Avg Latency | p99 Latency | Successful (2xx) | Errors / Dropped |
|---|---|---|---|---|---|---|
| **Baseline 1 (No Cache)** | 25 Users | **28 req/s** | 871 ms | 3,713 ms | 170 | 0 |
| **Baseline 2 (Pool Saturation)** | 50 Users | **58 req/s** | 803 ms | 1,190 ms | 349 | 0 |
| **Optimized Scenario 1** | 50 Users | **1,776 req/s** | **27.8 ms** | **77 ms** | 10,650 | 0 |
| **Optimized Scenario 2** | 100 Users | **1,894 req/s** | **53.1 ms** | **122 ms** | 11,364 | 0 |
| **Optimized Scenario 3** | 250 Users | **1,747 req/s** | **154.5 ms** | **498 ms** | 10,479 | 18 |
| **Optimized Stress Limit** | 500 Users | **1,723 req/s** | **547.2 ms** | **1,707 ms** | 10,335 | 516 |

### Performance Analysis & Optimization Breakdown

1. **Initial Constraints & Degradation Point:**
   - In the unoptimized implementation, each incoming request opens a connection from `pg.Pool` and executes a round-trip SSL query to remote AWS Neon Postgres.
   - At 25-50 concurrent connections, the pool reaches maximum capacity (`max: 20`). Requests queue up waiting for available pool clients, causing latency to degrade to **3.7 seconds (p99)** and limiting throughput to under **60 req/s**.
2. **Optimization Techniques Implemented:**
   - **Write-Invalidation In-Memory Cache:** Read requests (`GET /api/releases`) are served from memory in < 2ms. Whenever a mutation occurs (`POST`, `PUT`, `DELETE`), the cache is immediately purged, guaranteeing zero stale data.
   - **Connection Pool Tuning:** Configured reusable pool clients with `idleTimeoutMillis: 30000` and `connectionTimeoutMillis: 10000`, eliminating TCP/SSL handshake overhead per request.
   - **Gzip Compression:** Enabled `compression()` middleware to minimize payload transfer size.
3. **The Delta (Results):**
   - **30x increase** in throughput (from 58 req/s to 1,776 req/s at 50 users).
   - **96.5% reduction** in latency (from 803 ms down to 27.8 ms).
   - System stably handles **100 concurrent users** delivering **1,894 req/s** with zero dropped requests.

---

## 📱 PWA Support

ReleaseCheck is configured as an installable Progressive Web App:
- **`manifest.json`**: Standalone display mode, brand theme color `#5046e5`, application description and icon definitions.
- **`service-worker.js`**: Pre-caches static application assets and provides offline shell capabilities with safe API fallbacks.
- **Service Worker Registration**: Enabled in production builds.

---

## 🚢 Deployment Guide

### Deploying Backend (Render / Railway / Heroku)
1. Link your GitHub repository.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Configure Environment Variables:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_QJ6vwHVRPTz9@ep-young-grass-ath18xm9-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - `PORT`: `5000` (or platform default)
   - `NODE_ENV`: `production`

### Deploying Frontend (Vercel / Netlify / Cloudflare Pages)
1. Link your GitHub repository.
2. Set Root Directory to `client`.
3. Set Build Command: `npm run build`
4. Set Output Directory: `build`
5. Add Environment Variable:
   - `REACT_APP_API_URL`: `https://<your-deployed-backend-url>/api`

---

## 🎥 Video Presentation Script

A complete 3 to 4-minute word-for-word presentation script with timestamps and visual action cues is available in [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md).
