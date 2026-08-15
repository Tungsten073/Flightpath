import { createContext, useContext, useCallback } from 'react'
import { useData } from './DataContext'

const UpdatesContext = createContext(null)

export function UpdatesProvider({ children }) {
  const { rawUpdates, applyAIParsedUpdate } = useData()

  const addUpdate = useCallback(
    (projectId, rawText, parsed) => {
      return applyAIParsedUpdate(projectId, rawText, parsed)
    },
    [applyAIParsedUpdate]
  )

  const getUpdates = useCallback(
    (projectId) => {
      return rawUpdates.filter((u) => u.projectId === projectId)
    },
    [rawUpdates]
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
