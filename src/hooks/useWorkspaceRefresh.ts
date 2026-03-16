import { useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { triggerGithubAnalysis, triggerGithubSync } from '@/lib/api/integrations'

export function useWorkspaceRefresh() {
  const { refresh: refreshAuth } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const runRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    setStatusMessage('Syncing GitHub metadata')

    try {
      await triggerGithubSync()
      await refreshAuth()
      setStatusMessage('Generating Developer Genome')
      await triggerGithubAnalysis()
      setStatusMessage('Workspace ready')
      return true
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to refresh your workspace right now.',
      )
      setStatusMessage(null)
      return false
    } finally {
      setIsRefreshing(false)
    }
  }

  return {
    error,
    isRefreshing,
    runRefresh,
    statusMessage,
  }
}
