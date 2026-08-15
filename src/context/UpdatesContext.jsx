import { createContext, useContext, useState, useCallback } from 'react'

/**
 * UpdatesContext — holds AI-parsed updates per project in memory for the session.
 *
 * Shape of each entry in the updates array:
 * {
 *   id:        string          — unique "ai-<timestamp>"
 *   projectId: string
 *   timestamp: string          — ISO string, current time at submission
 *   rawText:   string          — original user input
 *   parsed: {
 *     milestoneId:    string | null
 *     milestoneName:  string | null
 *     taskId:         string | null
 *     taskName:       string | null
 *     summary:        string          — customer-safe one-liner
 *     inferredStatus: 'open'|'blocked'|'done'|null
 *     confidence:     'high'|'medium'|'low'
 *   }
 * }
 */

const UpdatesContext = createContext(null)

export function UpdatesProvider({ children }) {
  // { [projectId]: entry[] }  — newest first
  const [updatesByProject, setUpdatesByProject] = useState({})

  const addUpdate = useCallback((projectId, rawText, parsed) => {
    const entry = {
      id: `ai-${Date.now()}`,
      projectId,
      timestamp: new Date().toISOString(),
      rawText,
      parsed,
    }
    setUpdatesByProject((prev) => ({
      ...prev,
      [projectId]: [entry, ...(prev[projectId] ?? [])],
    }))
    return entry
  }, [])

  const getUpdates = useCallback(
    (projectId) => updatesByProject[projectId] ?? [],
    [updatesByProject]
  )

  return (
    <UpdatesContext.Provider value={{ addUpdate, getUpdates }}>
      {children}
    </UpdatesContext.Provider>
  )
}

export function useUpdates() {
  const ctx = useContext(UpdatesContext)
  if (!ctx) throw new Error('useUpdates must be used inside <UpdatesProvider>')
  return ctx
}
