-- ============================================================
-- FLIGHTPATH DASHBOARD SUPABASE POSTGRESQL SCHEMA
-- Paste this script into your Supabase SQL Editor to create tables.
-- ============================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  customer TEXT NOT NULL,
  owners TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'On Track',
  progress INTEGER DEFAULT 0,
  created_at TEXT,
  start_date TEXT,
  due_date TEXT,
  last_activity_at TEXT
);

-- 2. Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  due_date TEXT
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  milestone_id TEXT REFERENCES public.milestones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  owner TEXT
);

-- 4. Issues Table
CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Implementation',
  status TEXT DEFAULT 'open'
);

-- 5. Updates Table
CREATE TABLE IF NOT EXISTS public.updates (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'web_ai',
  raw_text TEXT,
  timestamp TEXT,
  parsed JSONB
);

-- Disable RLS for easy anonymous dashboard access or enable public policies
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates DISABLE ROW LEVEL SECURITY;
