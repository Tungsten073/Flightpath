# 🛸 FLIGHTPATH — Autonomous Delivery Operations Dashboard

> **Submission-Ready Project Delivery & Customer Transparency Engine**  
> Built for FlytBase autonomous delivery operations with live **Supabase PostgreSQL** persistence, **Google Gemini AI** update parsing, and a high-impact **Neo-Brutalist UI**.

---

## ⚡ Overview

**Flightpath** is an enterprise-grade delivery dashboard designed to streamline autonomous drone & robotics project deployments. It provides **dual-view visibility** for engineering teams and external enterprise customers:

1. **Internal Delivery View**: Comprehensive engineering operational hub for managing milestones, task execution, issue taxonomy, raw updates, and Gemini AI update parsing.
2. **Customer View**: A clean, privacy-conscious portal that strips internal jargon, confidential engineering notes, and sensitive owner details—presenting a curated timeline, progress metrics, and milestone status.

---

## ✨ Key Features

- **📊 3 Curated Baseline Delivery Projects**:
  - `Drone Fleet Deployment` (*Skyline Logistics*) — Onboarding 12 autonomous delivery drones with real-time telemetry.
  - `Warehouse Automation` (*Meridian Energy*) — Phase 2 rollout of indoor inspection drones.
  - `Autonomous Mapping` (*Coastal Ports Authority*) — Perimeter security & 3D terrain mapping.
- **🤖 Multi-Entity Gemini AI Parser**:
  - Accepts unstructured team updates (emails, Slack messages, call notes) and decodes them in real time across **Milestones**, **Tasks**, **Issues**, and **Project Statuses**.
  - Auto-creates tasks and mutates statuses (`OPEN`, `BLOCKED`, `DONE`) dynamically across panels.
- **🛡️ Customer Privacy & Jargon Filtering**:
  - Automatically filters internal developer notes, raw update feeds, and owner names when switching to the Customer View.
- **⏱ Inactivity Detection Engine**:
  - Flags projects inactive for $21+$ days with prominent warning badges (`⚠️ 43d no activity`).
- **🗄️ Supabase PostgreSQL Single Source of Truth**:
  - All business state (`projects`, `milestones`, `tasks`, `issues`, `updates`) persists strictly to PostgreSQL tables with zero `localStorage` dependency.
- **🎨 Neo-Brutalist Design System**:
  - Warm craft paper canvas (`#E2DECF`), terminal green (`#005C2B`), warning gold (`#F5C710`), 8-bit typography (`Silkscreen`), hard 3D drop shadows (`box-shadow: 4px 4px 0px #000`), and dark backdrop modals.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | High-performance SPA with fast module reloading |
| **Database & Auth** | Supabase PostgreSQL | Direct PostgreSQL persistence via `@supabase/supabase-js` |
| **AI Intelligence** | Google Gemini REST API | `gemini-1.5-flash` with strict JSON mode & smart fallback rule parser |
| **Styling** | Vanilla CSS | Custom Neo-Brutalist Design System with HSL tokens |
| **Icons & Fonts** | Google Fonts | `Silkscreen`, `JetBrains Mono`, `Outfit` |

---

## 🗄️ Database Schema (`supabase_schema.sql`)

The application runs on 5 PostgreSQL tables in Supabase:

```sql
-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  customer TEXT NOT NULL,
  owners TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'On Track',
  progress INT DEFAULT 0,
  created_at DATE DEFAULT CURRENT_DATE,
  start_date DATE,
  due_date DATE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  due_date DATE
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  owner TEXT
);

-- 4. Issues Table
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Implementation',
  status TEXT DEFAULT 'open'
);

-- 5. Updates Table
CREATE TABLE IF NOT EXISTS updates (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'web_ai',
  raw_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  parsed JSONB DEFAULT '{}'::jsonb
);
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+`
- **npm**: `v9+`

### 2. Installation & Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/Tungsten073/Flightpath.git
cd delivery-dashboard
npm install
```

### 3. Environment Configuration (`.env`)

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://xexmfeqdowbhsuilymyy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> **Note**: Never expose your Supabase Service Role key in frontend code. Use the public `anon` key only.

### 4. Running Locally

Start the local dev server:

```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 5. Production Build

Build for production verification:

```bash
npm run build
```

The output bundle will be generated in `dist/`.

---

## 🎬 Live Judge & Demo Verification Flow

Follow this exact sequence to demonstrate full end-to-end functionality:

1. **Load Dashboard**:
   - Confirm header shows `⚡ SUPABASE POSTGRESQL CONNECTED`.
   - Confirm the 3 baseline projects appear (`Drone Fleet Deployment`, `Warehouse Automation`, `Autonomous Mapping`).
2. **Create a Custom Project**:
   - Click `+ Add Project`.
   - Enter `Airport Drone Deployment`, Customer `Skyline Logistics`, Owner `Aditya`, Progress `75%`.
   - Click `+ Create Project`. Confirm it saves directly to Supabase and renders on the overview grid.
3. **AI Update & Multi-Entity Parsing**:
   - Open `Warehouse Automation` internal view.
   - Paste raw update: *"hey so meridian's regulatory approval is stuck again, airspace clearance missing zone C doc."*
   - Click `Parse & Add Update`. Confirm `Regulatory Approval` milestone updates to `BLOCKED`, issue is logged, and project status badge updates to `BLOCKED`.
4. **Customer Transparency View**:
   - Click `CUSTOMER VIEW` tab.
   - Verify raw developer notes, internal updates form, and owner chips are hidden, displaying a clean customer progress card.

---

## 📄 License

This project is submitted for the **FlytBase Flightpath Project Delivery Dashboard** challenge. All rights reserved.
