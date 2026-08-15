import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const SEED_DATA = {
  projects: [
    {
      id: 'proj-001',
      name: 'Drone Fleet Deployment',
      customer: 'Skyline Logistics',
      owners: ['Priya Nair', 'Alex Chen'],
      description: 'Onboarding and deploying 12 autonomous delivery drones with real-time telemetry.',
      status: 'On Track',
      progress: 50,
      createdAt: '2026-05-12',
      startDate: '2026-05-12',
      dueDate: '2026-09-10',
      lastActivityAt: '2026-08-10T14:32:00Z',
    },
    {
      id: 'proj-002',
      name: 'Warehouse Automation',
      customer: 'Meridian Energy',
      owners: ['Rahul Verma'],
      description: 'Phase 2 rollout of indoor automated inspection drones for energy warehouses.',
      status: 'At Risk',
      progress: 33,
      createdAt: '2026-04-01',
      startDate: '2026-04-01',
      dueDate: '2026-07-20',
      lastActivityAt: '2026-07-02T09:15:00Z',
    },
    {
      id: 'proj-003',
      name: 'Autonomous Mapping',
      customer: 'Coastal Ports Authority',
      owners: ['Priya Nair', 'Sofia Martins'],
      description: 'Perimeter monitoring and 3D terrain mapping system for maritime port security.',
      status: 'On Track',
      progress: 33,
      createdAt: '2026-06-20',
      startDate: '2026-06-20',
      dueDate: '2026-09-01',
      lastActivityAt: '2026-08-13T16:00:00Z',
    },
  ],

  milestones: [
    { id: 'ms-001', projectId: 'proj-001', name: 'Kickoff & Requirements Gathering', status: 'done', dueDate: '2026-05-20' },
    { id: 'ms-002', projectId: 'proj-001', name: 'Fleet Hardware Provisioning', status: 'done', dueDate: '2026-06-15' },
    { id: 'ms-003', projectId: 'proj-001', name: 'Software Integration & Testing', status: 'open', dueDate: '2026-08-25' },
    { id: 'ms-004', projectId: 'proj-001', name: 'Go-Live', status: 'open', dueDate: '2026-09-10' },

    { id: 'ms-005', projectId: 'proj-002', name: 'Phase 1 Handover', status: 'done', dueDate: '2026-04-15' },
    { id: 'ms-006', projectId: 'proj-002', name: 'Additional Site Surveys', status: 'blocked', dueDate: '2026-07-01' },
    { id: 'ms-007', projectId: 'proj-002', name: 'Regulatory Approval', status: 'blocked', dueDate: '2026-07-20' },

    { id: 'ms-008', projectId: 'proj-003', name: 'Site Assessment', status: 'done', dueDate: '2026-06-30' },
    { id: 'ms-009', projectId: 'proj-003', name: 'Perimeter Sensor Deployment', status: 'open', dueDate: '2026-08-20' },
    { id: 'ms-010', projectId: 'proj-003', name: 'Dashboard Configuration', status: 'open', dueDate: '2026-09-01' },
  ],

  tasks: [
    { id: 'tsk-001', milestoneId: 'ms-003', name: 'Configure telemetry data sync', status: 'open', owner: 'Alex Chen' },
    { id: 'tsk-002', milestoneId: 'ms-003', name: 'Run integration test suite', status: 'open', owner: 'Priya Nair' },
    { id: 'tsk-003', milestoneId: 'ms-003', name: 'UAT sign-off with customer', status: 'open', owner: 'Alex Chen' },

    { id: 'tsk-004', milestoneId: 'ms-006', name: 'Schedule site survey team', status: 'blocked', owner: 'Rahul Verma' },
    { id: 'tsk-005', milestoneId: 'ms-007', name: 'Submit airspace clearance application', status: 'blocked', owner: 'Rahul Verma' },

    { id: 'tsk-006', milestoneId: 'ms-009', name: 'Install perimeter sensors - Zone A', status: 'done', owner: 'Sofia Martins' },
    { id: 'tsk-007', milestoneId: 'ms-009', name: 'Install perimeter sensors - Zone B', status: 'open', owner: 'Sofia Martins' },
    { id: 'tsk-008', milestoneId: 'ms-010', name: 'Set up alert thresholds', status: 'open', owner: 'Priya Nair' },
  ],

  issues: [
    { id: 'iss-001', projectId: 'proj-001', title: 'Telemetry sync drops packets under load', category: 'Bug', status: 'open' },
    { id: 'iss-002', projectId: 'proj-001', title: 'Request for custom flight-log export format', category: 'Feature Request', status: 'open' },
    { id: 'iss-003', projectId: 'proj-002', title: 'Clarify airspace clearance requirements for Zone C', category: 'Question', status: 'open' },
    { id: 'iss-004', projectId: 'proj-002', title: 'Site survey scheduling conflict', category: 'Support', status: 'open' },
    { id: 'iss-005', projectId: 'proj-003', title: 'Sensor firmware update needed for Zone B hardware', category: 'Implementation', status: 'open' },
  ],

  rawUpdates: [
    {
      id: 'upd-001',
      projectId: 'proj-001',
      channel: 'email',
      rawText: "Hi team, quick update - we finished provisioning all 12 drones for Skyline yesterday. Software integration testing kicked off this morning, Alex is running the telemetry sync config today and Priya will start the integration test suite tomorrow.",
      timestamp: '2026-08-10T14:32:00Z',
      parsed: {
        summary: 'Finished provisioning all 12 drones. Software integration testing under way.',
        milestoneName: 'Software Integration & Testing',
        inferredStatus: 'open',
      },
    },
    {
      id: 'upd-002',
      projectId: 'proj-002',
      channel: 'chat',
      rawText: "hey so meridian's regulatory approval is stuck again, the airspace clearance app got kicked back for missing zone C documentation. rahul is following up with legal but this is blocking both the site survey and approval milestones.",
      timestamp: '2026-07-02T09:15:00Z',
      parsed: {
        summary: 'Regulatory approval blocked by missing Zone C documentation.',
        milestoneName: 'Regulatory Approval',
        inferredStatus: 'blocked',
      },
    },
    {
      id: 'upd-003',
      projectId: 'proj-003',
      channel: 'call',
      rawText: "Call notes 8/13 - Coastal Ports check-in. Zone A sensor install complete and looking good. Zone B install in progress, Sofia expects to wrap by end of week.",
      timestamp: '2026-08-13T16:00:00Z',
      parsed: {
        summary: 'Zone A sensor installation complete. Zone B installation in progress.',
        milestoneName: 'Perimeter Sensor Deployment',
        inferredStatus: 'open',
      },
    },
  ],
}

// Helpers for Database Column Mapping
function fromDbProject(p) {
  return {
    id: p.id,
    name: p.name,
    customer: p.customer,
    owners: p.owners || [],
    description: p.description || '',
    status: p.status || 'On Track',
    progress: p.progress !== undefined ? p.progress : 0,
    createdAt: p.created_at,
    startDate: p.start_date,
    dueDate: p.due_date,
    lastActivityAt: p.last_activity_at,
  }
}

function toDbProject(p) {
  return {
    id: p.id,
    name: p.name,
    customer: p.customer,
    owners: p.owners,
    description: p.description,
    status: p.status,
    progress: p.progress,
    created_at: p.createdAt,
    start_date: p.startDate,
    due_date: p.dueDate,
    last_activity_at: p.lastActivityAt,
  }
}

function fromDbMilestone(m) {
  return {
    id: m.id,
    projectId: m.project_id,
    name: m.name,
    status: m.status,
    dueDate: m.due_date,
  }
}

function toDbMilestone(m) {
  return {
    id: m.id,
    project_id: m.projectId,
    name: m.name,
    status: m.status,
    due_date: m.dueDate,
  }
}

function fromDbTask(t) {
  return {
    id: t.id,
    milestoneId: t.milestone_id,
    name: t.name,
    status: t.status,
    owner: t.owner,
  }
}

function toDbTask(t) {
  return {
    id: t.id,
    milestone_id: t.milestoneId,
    name: t.name,
    status: t.status,
    owner: t.owner,
  }
}

function fromDbIssue(i) {
  return {
    id: i.id,
    projectId: i.project_id,
    title: i.title,
    category: i.category,
    status: i.status,
  }
}

function toDbIssue(i) {
  return {
    id: i.id,
    project_id: i.projectId,
    title: i.title,
    category: i.category,
    status: i.status,
  }
}

function fromDbUpdate(u) {
  return {
    id: u.id,
    projectId: u.project_id,
    channel: u.channel,
    rawText: u.raw_text,
    timestamp: u.timestamp,
    parsed: u.parsed,
  }
}

function toDbUpdate(u) {
  return {
    id: u.id,
    project_id: u.projectId,
    channel: u.channel,
    raw_text: u.rawText,
    timestamp: u.timestamp,
    parsed: u.parsed,
  }
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(SEED_DATA)
  const [loading, setLoading] = useState(true)

  // Fetch initial state from Supabase PostgreSQL
  const fetchFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    try {
      const [pRes, mRes, tRes, iRes, uRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('milestones').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('issues').select('*'),
        supabase.from('updates').select('*'),
      ])

      if (pRes.data && pRes.data.length > 0) {
        setData({
          projects: pRes.data.map(fromDbProject),
          milestones: (mRes.data || []).map(fromDbMilestone),
          tasks: (tRes.data || []).map(fromDbTask),
          issues: (iRes.data || []).map(fromDbIssue),
          rawUpdates: (uRes.data || []).map(fromDbUpdate),
        })
      } else {
        // First run on Supabase: Seed PostgreSQL tables with 3 seed projects
        console.log('Seeding Supabase PostgreSQL tables with 3 seed projects...')
        await Promise.all([
          supabase.from('projects').insert(SEED_DATA.projects.map(toDbProject)),
          supabase.from('milestones').insert(SEED_DATA.milestones.map(toDbMilestone)),
          supabase.from('tasks').insert(SEED_DATA.tasks.map(toDbTask)),
          supabase.from('issues').insert(SEED_DATA.issues.map(toDbIssue)),
          supabase.from('updates').insert(SEED_DATA.rawUpdates.map(toDbUpdate)),
        ])
      }
    } catch (err) {
      console.warn('Supabase fetch error, using in-memory state:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFromSupabase()
  }, [fetchFromSupabase])

  // --- Project Actions ---
  const addProject = async (projectFields) => {
    const newId = `proj-${Date.now()}`
    const newProject = {
      id: newId,
      name: projectFields.name,
      customer: projectFields.customer,
      owners: Array.isArray(projectFields.owners)
        ? projectFields.owners
        : (projectFields.owners || '').split(',').map((o) => o.trim()).filter(Boolean),
      description: projectFields.description || '',
      status: projectFields.status || 'On Track',
      progress: Math.min(100, Math.max(0, Number(projectFields.progress) || 0)),
      createdAt: new Date().toISOString().split('T')[0],
      startDate: projectFields.startDate || new Date().toISOString().split('T')[0],
      dueDate: projectFields.dueDate || '',
      lastActivityAt: new Date().toISOString(),
    }

    setData((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').insert([toDbProject(newProject)])
    }
    return newProject
  }

  const editProject = async (projectId, fields) => {
    let updatedProj = null
    setData((prev) => {
      const nextProjects = prev.projects.map((p) => {
        if (p.id !== projectId) return p
        updatedProj = {
          ...p,
          ...fields,
          progress: fields.progress !== undefined
            ? Math.min(100, Math.max(0, Number(fields.progress)))
            : p.progress,
          owners: fields.owners !== undefined
            ? (Array.isArray(fields.owners) ? fields.owners : String(fields.owners).split(',').map((o) => o.trim()).filter(Boolean))
            : p.owners,
        }
        return updatedProj
      })
      return { ...prev, projects: nextProjects }
    })

    if (isSupabaseConfigured && supabase && updatedProj) {
      await supabase.from('projects').update(toDbProject(updatedProj)).eq('id', projectId)
    }
  }

  const deleteProject = async (projectId) => {
    setData((prev) => {
      const remainingProjects = prev.projects.filter((p) => p.id !== projectId)
      const projectMilestones = prev.milestones.filter((m) => m.projectId === projectId)
      const milestoneIds = new Set(projectMilestones.map((m) => m.id))
      return {
        ...prev,
        projects: remainingProjects,
        milestones: prev.milestones.filter((m) => m.projectId !== projectId),
        tasks: prev.tasks.filter((t) => !milestoneIds.has(t.milestoneId)),
        issues: prev.issues.filter((i) => i.projectId !== projectId),
        rawUpdates: prev.rawUpdates.filter((u) => u.projectId !== projectId),
      }
    })

    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').delete().eq('id', projectId)
    }
  }

  // --- Milestone Actions ---
  const addMilestone = async (projectId, milestoneFields) => {
    const newMs = {
      id: `ms-${Date.now()}`,
      projectId,
      name: milestoneFields.name,
      status: milestoneFields.status || 'open',
      dueDate: milestoneFields.dueDate || '',
    }

    setData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMs],
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('milestones').insert([toDbMilestone(newMs)])
    }
    return newMs
  }

  const updateMilestoneStatus = async (milestoneId, newStatus) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId ? { ...m, status: newStatus } : m
      ),
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('milestones').update({ status: newStatus }).eq('id', milestoneId)
    }
  }

  const deleteMilestone = async (milestoneId) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== milestoneId),
      tasks: prev.tasks.filter((t) => t.milestoneId !== milestoneId),
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('milestones').delete().eq('id', milestoneId)
    }
  }

  // --- Task Actions ---
  const addTask = async (milestoneId, taskFields) => {
    const newTask = {
      id: `tsk-${Date.now()}`,
      milestoneId,
      name: taskFields.name,
      owner: taskFields.owner || '',
      status: taskFields.status || 'open',
    }

    setData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('tasks').insert([toDbTask(newTask)])
    }
    return newTask
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    }
  }

  const deleteTask = async (taskId) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('tasks').delete().eq('id', taskId)
    }
  }

  // --- Issue Actions ---
  const addIssue = async (projectId, issueFields) => {
    const newIssue = {
      id: `iss-${Date.now()}`,
      projectId,
      title: issueFields.title,
      category: issueFields.category || 'Implementation',
      status: issueFields.status || 'open',
    }

    setData((prev) => ({
      ...prev,
      issues: [...prev.issues, newIssue],
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('issues').insert([toDbIssue(newIssue)])
    }
    return newIssue
  }

  const updateIssueStatus = async (issueId, newStatus) => {
    setData((prev) => ({
      ...prev,
      issues: prev.issues.map((i) =>
        i.id === issueId ? { ...i, status: newStatus } : i
      ),
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('issues').update({ status: newStatus }).eq('id', issueId)
    }
  }

  const deleteIssue = async (issueId) => {
    setData((prev) => ({
      ...prev,
      issues: prev.issues.filter((i) => i.id !== issueId),
    }))

    if (isSupabaseConfigured && supabase) {
      await supabase.from('issues').delete().eq('id', issueId)
    }
  }

  // --- AI & Raw Updates ---
  const applyAIParsedUpdate = async (projectId, rawText, parsedResult) => {
    const nowIso = new Date().toISOString()
    const newUpdate = {
      id: `upd-${Date.now()}`,
      projectId,
      channel: 'web_ai',
      rawText,
      timestamp: nowIso,
      parsed: parsedResult,
    }

    setData((prev) => {
      let updatedProjects = prev.projects.map((p) => {
        if (p.id !== projectId) return p
        let newStatus = p.status
        if (parsedResult.inferredStatus === 'blocked') newStatus = 'Blocked'
        else if (parsedResult.inferredStatus === 'done' && p.status === 'Blocked') newStatus = 'On Track'

        return {
          ...p,
          lastActivityAt: nowIso,
          status: newStatus,
        }
      })

      let updatedMilestones = prev.milestones
      if (parsedResult.matchedMilestoneId && parsedResult.inferredStatus) {
        updatedMilestones = prev.milestones.map((m) =>
          m.id === parsedResult.matchedMilestoneId
            ? { ...m, status: parsedResult.inferredStatus }
            : m
        )
      }

      let updatedTasks = prev.tasks
      if (parsedResult.matchedTaskId && parsedResult.inferredStatus) {
        updatedTasks = prev.tasks.map((t) =>
          t.id === parsedResult.matchedTaskId
            ? { ...t, status: parsedResult.inferredStatus }
            : t
        )
      }

      return {
        ...prev,
        projects: updatedProjects,
        milestones: updatedMilestones,
        tasks: updatedTasks,
        rawUpdates: [newUpdate, ...prev.rawUpdates],
      }
    })

    if (isSupabaseConfigured && supabase) {
      await supabase.from('updates').insert([toDbUpdate(newUpdate)])
      await supabase.from('projects').update({ last_activity_at: nowIso }).eq('id', projectId)
    }

    return newUpdate
  }

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        isSupabaseConfigured,
        projects: data.projects,
        milestones: data.milestones,
        tasks: data.tasks,
        issues: data.issues,
        rawUpdates: data.rawUpdates,

        addProject,
        editProject,
        deleteProject,
        addMilestone,
        updateMilestoneStatus,
        deleteMilestone,
        addTask,
        updateTaskStatus,
        deleteTask,
        addIssue,
        updateIssueStatus,
        deleteIssue,
        applyAIParsedUpdate,
        refetch: fetchFromSupabase,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
