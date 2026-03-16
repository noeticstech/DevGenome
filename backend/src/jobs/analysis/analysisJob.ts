import { generateAndPersistUserAnalysis } from '../../services/analysis'
import type { BackgroundJobProcessorResult, BackgroundJobRecord } from '../jobTypes'

export async function processUserAnalysisJob(
  job: BackgroundJobRecord,
): Promise<BackgroundJobProcessorResult> {
  const analysisResult = await generateAndPersistUserAnalysis(job.userId)

  return {
    result: analysisResult,
  }
}
