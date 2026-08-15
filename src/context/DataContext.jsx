import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'flightpath_app_state_v2'

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
      rawText: "Hi team, quick update - we finished provisioning all 12 drones for Skyline yesterday. Software integration testing kicked off this morning, Alex is running the telemetry sync config today and Priya will start the integration test suite tomorrow. We're on track for the Aug 25 milestone but flagging that we saw some packet drops during load testing, logged as a bug.",
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
      rawText: "hey so meridian's regulatory approval is stuck again, the airspace clearance app got kicked back for missing zone C documentation. rahul is following up with legal but this is blocking both the site survey and approval milestones. no new movement expected before next week at earliest",
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
      rawText: "Call notes 8/13 - Coastal Ports check-in. Zone A sensor install complete and looking good. Zone B install in progress, Sofia expects to wrap by end of week pending a firmware update on the new hardware batch. Customer asked about dashboard alert thresholds, told them we'll configure those once Zone B is done. Overall still tracking to the Sept 1 dashboard config milestone.",
      timestamp: '2026-08-13T16:00:00Z',
      parsed: {
        summary: 'Zone A sensor installation complete. Zone B installation in progress.',
        milestoneName: 'Perimeter Sensor Deployment',
        inferredStatus: 'open',
      },
    },
  ],
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Could not read flightpath_app_state_v2 from localStorage:', err)
    }
    return SEED_DATA
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('Could not save flightpath_app_state_v2 to localStorage:', err)
    }
  }, [data])

  // --- Project Actions ---
  const addProject = (projectFields) => {
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
    return newProject
  }

  const editProject = (projectId, fields) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          ...fields,
          progress: fields.progress !== undefined
            ? Math.min(100, Math.max(0, Number(fields.progress)))
            : p.progress,
          owners: fields.owners !== undefined
            ? (Array.isArray(fields.owners) ? fields.owners : String(fields.owners).split(',').map((o) => o.trim()).filter(Boolean))
            : p.owners,
        }
      }),
    }))
  }

  const deleteProject = (projectId) => {
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
  }

  // --- Milestone Actions ---
  const addMilestone = (projectId, milestoneFields) => {
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
    return newMs
  }

  const updateMilestoneStatus = (milestoneId, newStatus) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId ? { ...m, status: newStatus } : m
      ),
    }))
  }

  const deleteMilestone = (milestoneId) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== milestoneId),
      tasks: prev.tasks.filter((t) => t.milestoneId !== milestoneId),
    }))
  }

  // --- Task Actions ---
  const addTask = (milestoneId, taskFields) => {
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
    return newTask
  }

  const updateTaskStatus = (taskId, newStatus) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }))
  }

  const deleteTask = (taskId) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }))
  }

  // --- Issue Actions ---
  const addIssue = (projectId, issueFields) => {
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
    return newIssue
  }

  const updateIssueStatus = (issueId, newStatus) => {
    setData((prev) => ({
      ...prev,
      issues: prev.issues.map((i) =>
        i.id === issueId ? { ...i, status: newStatus } : i
      ),
    }))
  }

  const deleteIssue = (issueId) => {
    setData((prev) => ({
      ...prev,
      issues: prev.issues.filter((i) => i.id !== issueId),
    }))
  }

  // --- AI & Raw Updates ---
  const applyAIParsedUpdate = (projectId, rawText, parsedResult) => {
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
      // 1. Update project's lastActivityAt to reset inactivity days count
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

      // 2. If milestone matched, update milestone status if inferred
      let updatedMilestones = prev.milestones
      if (parsedResult.matchedMilestoneId && parsedResult.inferredStatus) {
        updatedMilestones = prev.milestones.map((m) =>
          m.id === parsedResult.matchedMilestoneId
            ? { ...m, status: parsedResult.inferredStatus }
            : m
        )
      }

      // 3. If task matched, update task status if inferred
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

    return newUpdate
  }

  const resetToDefaultSeed = () => {
    setData(SEED_DATA)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <DataContext.Provider
      value={{
        data,
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
        resetToDefaultSeed,
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
