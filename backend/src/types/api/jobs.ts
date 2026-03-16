import type {
  BackgroundJobStatus,
  BackgroundJobTrigger,
  BackgroundJobType,
} from '@prisma/client'

export interface BackgroundJobSnapshotResponse {
  id: string
  type: BackgroundJobType
  status: BackgroundJobStatus
  trigger: BackgroundJobTrigger
  userId: string
  connectedAccountId: string | null
  sourceJobId: string | null
  attempts: number
  maxAttempts: number
  scheduledFor: string
  startedAt: string | null
  completedAt: string | null
  failedAt: string | null
  createdAt: string
  updatedAt: string
  lastError: string | null
  lastErrorCategory: string | null
  lastErrorCode: string | null
  payloadPresent: boolean
  resultPresent: boolean
}

export interface BackgroundJobFailureResponse {
  message: string
  category: string | null
  code: string | null
  retryable: boolean | null
  occurredAt: string | null
}

export interface BackgroundJobEnqueueResponse {
  success: true
  status: 'queued' | 'already_queued'
  message: string
  job: BackgroundJobSnapshotResponse
}

export interface BackgroundJobStatusResponse {
  job: BackgroundJobSnapshotResponse
  result: unknown | null
  failure: BackgroundJobFailureResponse | null
}

export interface BackgroundJobListResponse {
  jobs: BackgroundJobStatusResponse[]
}
