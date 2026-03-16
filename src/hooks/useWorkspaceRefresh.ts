import { useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { triggerGithubAnalysis, triggerGithubSync } from '@/lib/api/integrations'
import { waitForBackgroundJobCompletion } from '@/lib/jobPolling'

export function useWorkspaceRefresh() {
  const { refresh: refreshAuth } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const runRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    setStatusMessage('Queueing GitHub sync')

    try {
      const syncJob = await triggerGithubSync()
      setStatusMessage('Syncing GitHub metadata')

      const syncResult = await waitForBackgroundJobCompletion({
        jobId: syncJob.job.id,
        onStatus: (status) => {
          setStatusMessage(
            status === 'QUEUED'
              ? 'Waiting for GitHub sync worker'
              : 'Syncing GitHub metadata',
          )
        },
      })

      if (syncResult.outcome === 'failed') {
        setError(
          syncResult.response.failure?.message ??
            syncResult.response.job.lastError ??
            'GitHub sync failed before analysis could start.',
        )
        setStatusMessage(null)
        return false
      }

      if (syncResult.outcome === 'timed_out') {
        setError(
          'GitHub sync is still running in the background. Give it a moment, then refresh the page.',
        )
        setStatusMessage(null)
        return false
      }

      await refreshAuth()

      const analysisJob = await triggerGithubAnalysis()
      setStatusMessage('Generating Developer Genome')

      const analysisResult = await waitForBackgroundJobCompletion({
        jobId: analysisJob.job.id,
        onStatus: (status) => {
          setStatusMessage(
            status === 'QUEUED'
              ? 'Waiting for analysis worker'
              : 'Generating Developer Genome',
          )
        },
      })

      if (analysisResult.outcome === 'failed') {
        setError(
          analysisResult.response.failure?.message ??
            analysisResult.response.job.lastError ??
            'Analysis generation failed after the sync finished.',
        )
        setStatusMessage(null)
        return false
      }

      if (analysisResult.outcome === 'timed_out') {
        setError(
          'Analysis is still running in the background. Check back in a moment for refreshed results.',
        )
        setStatusMessage(null)
        return false
      }

      await refreshAuth()
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
