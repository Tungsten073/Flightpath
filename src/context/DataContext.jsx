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

// Database Column Mapping Helpers
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
    created_at: p.createdAt || null,
    start_date: p.startDate || null,
    due_date: p.dueDate || null,
    last_activity_at: p.lastActivityAt || null,
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
    due_date: m.dueDate || null,
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
  const [data, setData] = useState({
    projects: [],
    milestones: [],
    tasks: [],
    issues: [],
    rawUpdates: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch initial state directly from Supabase PostgreSQL (NO localStorage for business data)
  const fetchFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setData(SEED_DATA)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [pRes, mRes, tRes, iRes, uRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('milestones').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('issues').select('*'),
        supabase.from('updates').select('*'),
      ])

      if (pRes.error) throw pRes.error
      if (mRes.error) throw mRes.error
      if (tRes.error) throw tRes.error
      if (iRes.error) throw iRes.error
      if (uRes.error) throw uRes.error

      if (pRes.data && pRes.data.length > 0) {
        setData({
          projects: pRes.data.map(fromDbProject),
          milestones: (mRes.data || []).map(fromDbMilestone),
          tasks: (tRes.data || []).map(fromDbTask),
          issues: (iRes.data || []).map(fromDbIssue),
          rawUpdates: (uRes.data || []).map(fromDbUpdate),
        })
      } else {
        // First run on Supabase: Seed PostgreSQL tables using upsert to avoid duplicate key conflicts
        console.log('Seeding Supabase PostgreSQL tables with 3 seed projects...')
        await supabase.from('projects').upsert(SEED_DATA.projects.map(toDbProject), { onConflict: 'id' })
        await supabase.from('milestones').upsert(SEED_DATA.milestones.map(toDbMilestone), { onConflict: 'id' })
        await supabase.from('tasks').upsert(SEED_DATA.tasks.map(toDbTask), { onConflict: 'id' })
        await supabase.from('issues').upsert(SEED_DATA.issues.map(toDbIssue), { onConflict: 'id' })
        await supabase.from('updates').upsert(SEED_DATA.rawUpdates.map(toDbUpdate), { onConflict: 'id' })

        // Refetch clean state
        const refetchedProjects = await supabase.from('projects').select('*')
        const refetchedMs = await supabase.from('milestones').select('*')
        const refetchedTsk = await supabase.from('tasks').select('*')
        const refetchedIss = await supabase.from('issues').select('*')
        const refetchedUpd = await supabase.from('updates').select('*')

        setData({
          projects: (refetchedProjects.data || SEED_DATA.projects).map(fromDbProject),
          milestones: (refetchedMs.data || SEED_DATA.milestones).map(fromDbMilestone),
          tasks: (refetchedTsk.data || SEED_DATA.tasks).map(fromDbTask),
          issues: (refetchedIss.data || SEED_DATA.issues).map(fromDbIssue),
          rawUpdates: (refetchedUpd.data || SEED_DATA.rawUpdates).map(fromDbUpdate),
        })
      }
    } catch (err) {
      console.error('Supabase PostgreSQL fetch error:', err)
      setError(`Supabase Error: ${err.message}`)
      setData(SEED_DATA)
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
      const { error: dbErr } = await supabase.from('projects').insert([toDbProject(newProject)])
      if (dbErr) {
        console.error('Failed to insert project to Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('projects').update(toDbProject(updatedProj)).eq('id', projectId)
      if (dbErr) {
        console.error('Failed to update project in Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('projects').delete().eq('id', projectId)
      if (dbErr) {
        console.error('Failed to delete project from Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('milestones').insert([toDbMilestone(newMs)])
      if (dbErr) {
        console.error('Failed to insert milestone to Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('milestones').update({ status: newStatus }).eq('id', milestoneId)
      if (dbErr) {
        console.error('Failed to update milestone status in Supabase:', dbErr)
        throw dbErr
      }
    }
  }

  const deleteMilestone = async (milestoneId) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== milestoneId),
      tasks: prev.tasks.filter((t) => t.milestoneId !== milestoneId),
    }))

    if (isSupabaseConfigured && supabase) {
      const { error: dbErr } = await supabase.from('milestones').delete().eq('id', milestoneId)
      if (dbErr) {
        console.error('Failed to delete milestone from Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('tasks').insert([toDbTask(newTask)])
      if (dbErr) {
        console.error('Failed to insert task to Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
      if (dbErr) {
        console.error('Failed to update task status in Supabase:', dbErr)
        throw dbErr
      }
    }
  }

  const deleteTask = async (taskId) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }))

    if (isSupabaseConfigured && supabase) {
      const { error: dbErr } = await supabase.from('tasks').delete().eq('id', taskId)
      if (dbErr) {
        console.error('Failed to delete task from Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('issues').insert([toDbIssue(newIssue)])
      if (dbErr) {
        console.error('Failed to insert issue to Supabase:', dbErr)
        throw dbErr
      }
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
      const { error: dbErr } = await supabase.from('issues').update({ status: newStatus }).eq('id', issueId)
      if (dbErr) {
        console.error('Failed to update issue status in Supabase:', dbErr)
        throw dbErr
      }
    }
  }

  const deleteIssue = async (issueId) => {
    setData((prev) => ({
      ...prev,
      issues: prev.issues.filter((i) => i.id !== issueId),
    }))

    if (isSupabaseConfigured && supabase) {
      const { error: dbErr } = await supabase.from('issues').delete().eq('id', issueId)
      if (dbErr) {
        console.error('Failed to delete issue from Supabase:', dbErr)
        throw dbErr
      }
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

    let createdTask = null
    let updatedMilestonesList = []
    let updatedTasksList = []

    setData((prev) => {
      // Find or fallback target milestone
      let targetMs = prev.milestones.find((m) => m.id === parsedResult.milestoneId)
      if (!targetMs) {
        targetMs = prev.milestones.find((m) => m.projectId === projectId)
      }

      const targetMsId = targetMs ? targetMs.id : null

      // Check if we should auto-create a task
      let newTasks = [...prev.tasks]
      if (parsedResult.taskName && targetMsId) {
        const existingTask = prev.tasks.find(
          (t) => t.milestoneId === targetMsId && t.name.toLowerCase() === parsedResult.taskName.toLowerCase()
        )
        if (!existingTask) {
          createdTask = {
            id: `tsk-${Date.now()}`,
            milestoneId: targetMsId,
            name: parsedResult.taskName,
            status: parsedResult.inferredStatus || 'open',
            owner: 'AI Update',
          }
          newTasks.push(createdTask)
        }
      }

      // Update milestone status if inferred
      let updatedMilestones = prev.milestones
      if (targetMsId && parsedResult.inferredStatus) {
        updatedMilestones = prev.milestones.map((m) =>
          m.id === targetMsId ? { ...m, status: parsedResult.inferredStatus } : m
        )
      }

      // Update task status if matched
      if (parsedResult.taskId && parsedResult.inferredStatus) {
        newTasks = newTasks.map((t) =>
          t.id === parsedResult.taskId ? { ...t, status: parsedResult.inferredStatus } : t
        )
      }

      // Update project lastActivityAt and status
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

      updatedMilestonesList = updatedMilestones
      updatedTasksList = newTasks

      return {
        ...prev,
        projects: updatedProjects,
        milestones: updatedMilestones,
        tasks: newTasks,
        rawUpdates: [newUpdate, ...prev.rawUpdates],
      }
    })

    // Sync mutations to Supabase PostgreSQL
    if (isSupabaseConfigured && supabase) {
      await supabase.from('updates').insert([toDbUpdate(newUpdate)])
      await supabase.from('projects').update({ last_activity_at: nowIso }).eq('id', projectId)

      if (parsedResult.milestoneId && parsedResult.inferredStatus) {
        await supabase.from('milestones').update({ status: parsedResult.inferredStatus }).eq('id', parsedResult.milestoneId)
      }

      if (parsedResult.taskId && parsedResult.inferredStatus) {
        await supabase.from('tasks').update({ status: parsedResult.inferredStatus }).eq('id', parsedResult.taskId)
      }

      if (createdTask) {
        await supabase.from('tasks').insert([toDbTask(createdTask)])
      }
    }

    return newUpdate
  }

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        error,
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
