import type {
  BackgroundJob,
  BackgroundJobStatus,
  BackgroundJobTrigger,
  BackgroundJobType,
} from '@prisma/client'
import type {
  BackgroundJobEnqueueResponse,
  BackgroundJobFailureResponse,
  BackgroundJobListResponse,
  BackgroundJobSnapshotResponse,
  BackgroundJobStatusResponse,
} from '../types/api/jobs'

export type BackgroundJobRecord = BackgroundJob

export interface BackgroundJobProcessorResult {
  result?: unknown
  followUpJobId?: string | null
}

export interface EnqueueBackgroundJobInput {
  userId: string
  connectedAccountId?: string | null
  type: BackgroundJobType
  trigger: BackgroundJobTrigger
  dedupeKey: string
  payload?: Record<string, unknown> | null
  sourceJobId?: string | null
  maxAttempts?: number
  scheduledFor?: Date
}

export interface EnqueueBackgroundJobResult {
  created: boolean
  response: BackgroundJobEnqueueResponse
}

export interface BackgroundJobProcessor {
  (job: BackgroundJobRecord): Promise<BackgroundJobProcessorResult>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function extractBackgroundJobFailure(
  result: unknown,
): BackgroundJobFailureResponse | null {
  if (!isPlainObject(result) || !isPlainObject(result.error)) {
    return null
  }

  const error = result.error

  return {
    message: typeof error.message === 'string' ? error.message : 'Background job failed',
    category: typeof error.category === 'string' ? error.category : null,
    code: typeof error.code === 'string' ? error.code : null,
    retryable: typeof error.retryable === 'boolean' ? error.retryable : null,
    occurredAt: typeof error.occurredAt === 'string' ? error.occurredAt : null,
  }
}

export function toBackgroundJobSnapshotResponse(
  job: Pick<
    BackgroundJob,
    | 'id'
    | 'type'
    | 'status'
    | 'trigger'
    | 'userId'
    | 'connectedAccountId'
    | 'attempts'
    | 'maxAttempts'
    | 'scheduledFor'
    | 'startedAt'
    | 'completedAt'
    | 'failedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'lastError'
    | 'sourceJobId'
    | 'payload'
    | 'result'
  >,
): BackgroundJobSnapshotResponse {
  const failure = extractBackgroundJobFailure(job.result)

  return {
    id: job.id,
    type: job.type,
    status: job.status,
    trigger: job.trigger,
    userId: job.userId,
    connectedAccountId: job.connectedAccountId,
    sourceJobId: job.sourceJobId,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    scheduledFor: job.scheduledFor.toISOString(),
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    failedAt: job.failedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    lastError: job.lastError,
    lastErrorCategory: failure?.category ?? null,
    lastErrorCode: failure?.code ?? null,
    payloadPresent: job.payload !== null,
    resultPresent: job.result !== null,
  }
}

export function buildEnqueueResponse(input: {
  created: boolean
  job: BackgroundJobRecord
}): BackgroundJobEnqueueResponse {
  return {
    success: true,
    status: input.created ? 'queued' : 'already_queued',
    message: input.created
      ? 'Background job queued successfully.'
      : 'A matching background job is already queued or running.',
    job: toBackgroundJobSnapshotResponse(input.job),
  }
}

export function buildJobStatusResponse(job: BackgroundJobRecord): BackgroundJobStatusResponse {
  return {
    job: toBackgroundJobSnapshotResponse(job),
    result: job.result,
    failure: extractBackgroundJobFailure(job.result),
  }
}

export function buildJobListResponse(
  jobs: BackgroundJobRecord[],
): BackgroundJobListResponse {
  return {
    jobs: jobs.map(buildJobStatusResponse),
  }
}
