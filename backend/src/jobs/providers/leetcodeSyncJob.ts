import { BackgroundJobTrigger } from '@prisma/client'

import { syncLeetcodeAccountForUserId } from '../../services/sync/leetcodeSyncService'
import { enqueueUserAnalysisJob } from '../jobQueueService'
import type { BackgroundJobProcessorResult, BackgroundJobRecord } from '../jobTypes'

export async function processLeetcodeSyncJob(
  job: BackgroundJobRecord,
): Promise<BackgroundJobProcessorResult> {
  const syncResult = await syncLeetcodeAccountForUserId(job.userId)
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
