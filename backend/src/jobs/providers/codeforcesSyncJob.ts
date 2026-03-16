import { BackgroundJobTrigger } from '@prisma/client'

import { syncCodeforcesAccountForUserId } from '../../services/sync/codeforcesSyncService'
import { enqueueUserAnalysisJob } from '../jobQueueService'
import type { BackgroundJobProcessorResult, BackgroundJobRecord } from '../jobTypes'

export async function processCodeforcesSyncJob(
  job: BackgroundJobRecord,
): Promise<BackgroundJobProcessorResult> {
  const syncResult = await syncCodeforcesAccountForUserId(job.userId)
  const analysisJob = await enqueueUserAnalysisJob({
    userId: job.userId,
    trigger: BackgroundJobTrigger.CHAINED,
    sourceJobId: job.id,
  })

  return {
    result: {
      sync: syncResult,
      followUpAnalysisJob: analysisJob.response.job,
      followUpAnalysisStatus: analysisJob.response.status,
    },
    followUpJobId: analysisJob.response.job.id,
  }
}
