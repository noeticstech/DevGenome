import {
  BackgroundJobStatus,
  BackgroundJobType,
  Prisma,
} from '@prisma/client'

import { env } from '../config/env'
import { logger } from '../lib/logger'
import { prisma } from '../lib/prisma'
import { normalizeError, serializeErrorForLogging } from '../utils/app-error'
import type { BackgroundJobProcessor, BackgroundJobProcessorResult, BackgroundJobRecord } from './jobTypes'
import { processUserAnalysisJob } from './analysis/analysisJob'
import { processCodeforcesSyncJob } from './providers/codeforcesSyncJob'
import { processGithubSyncJob } from './providers/githubSyncJob'
import { processLeetcodeSyncJob } from './providers/leetcodeSyncJob'

const JOB_PROCESSORS: Record<BackgroundJobType, BackgroundJobProcessor> = {
  GITHUB_SYNC: processGithubSyncJob,
  LEETCODE_SYNC: processLeetcodeSyncJob,
  CODEFORCES_SYNC: processCodeforcesSyncJob,
  USER_ANALYSIS: processUserAnalysisJob,
}

function normalizeResult(result: unknown) {
  if (result === undefined) {
    return undefined
  }

  return JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue
}

function getRetryDelayMs(attempts: number) {
  return env.JOB_RETRY_BASE_DELAY_MS * Math.max(attempts, 1)
}

function shouldRetryJob(error: unknown) {
  return normalizeError(error).retryable
}

function getErrorMessage(error: unknown) {
  return normalizeError(error).message
}

function buildFailureResultPayload(input: {
  job: BackgroundJobRecord
  error: unknown
  retryScheduledFor?: Date | null
}) {
  const normalized = normalizeError(input.error)

  return normalizeResult({
    error: {
      message: normalized.message,
      category: normalized.category,
      code: normalized.code,
      statusCode: normalized.statusCode,
      retryable: normalized.retryable,
      occurredAt: new Date().toISOString(),
      attempt: input.job.attempts,
      maxAttempts: input.job.maxAttempts,
      retryScheduledFor: input.retryScheduledFor?.toISOString() ?? null,
    },
  })
}

async function claimNextQueuedJob(): Promise<BackgroundJobRecord | null> {
  const [job] = await prisma.$queryRaw<BackgroundJobRecord[]>(Prisma.sql`
    WITH candidate AS (
      SELECT "id"
      FROM "BackgroundJob"
      WHERE
        "status" = ${BackgroundJobStatus.QUEUED}::"BackgroundJobStatus"
        AND "scheduledFor" <= NOW()
      ORDER BY "scheduledFor" ASC, "createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    UPDATE "BackgroundJob" AS job
    SET
      "status" = ${BackgroundJobStatus.RUNNING}::"BackgroundJobStatus",
      "startedAt" = NOW(),
      "attempts" = job."attempts" + 1,
      "failedAt" = NULL,
      "lastError" = NULL,
      "updatedAt" = NOW()
    FROM candidate
    WHERE job."id" = candidate."id"
    RETURNING job.*
  `)

  return job ?? null
}

async function markJobSucceeded(
  jobId: string,
  result: BackgroundJobProcessorResult,
) {
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: BackgroundJobStatus.SUCCEEDED,
      completedAt: new Date(),
      failedAt: null,
      lastError: null,
      result: normalizeResult(result.result),
    },
  })
}

async function markJobFailedOrRetry(job: BackgroundJobRecord, error: unknown) {
  const lastError = getErrorMessage(error)
  const normalizedError = normalizeError(error)
  const retryable = shouldRetryJob(error)
  const canRetry = retryable && job.attempts < job.maxAttempts

  if (canRetry) {
    const retryScheduledFor = new Date(Date.now() + getRetryDelayMs(job.attempts))

    await prisma.backgroundJob.update({
      where: { id: job.id },
      data: {
        status: BackgroundJobStatus.QUEUED,
        scheduledFor: retryScheduledFor,
        startedAt: null,
        completedAt: null,
        failedAt: null,
        lastError,
        result: buildFailureResultPayload({
          job,
          error,
          retryScheduledFor,
        }),
      },
    })

    logger.warn('Background job scheduled for retry', {
      jobId: job.id,
      type: job.type,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      userId: job.userId,
      lastError,
      category: normalizedError.category,
      code: normalizedError.code,
      retryable: normalizedError.retryable,
      retryScheduledFor,
    })

    return
  }

  await prisma.backgroundJob.update({
    where: { id: job.id },
    data: {
      status: BackgroundJobStatus.FAILED,
      completedAt: null,
      failedAt: new Date(),
      lastError,
      result: buildFailureResultPayload({
        job,
        error,
      }),
    },
  })

  logger.error('Background job failed', {
    jobId: job.id,
    type: job.type,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    userId: job.userId,
    lastError,
    error: serializeErrorForLogging(error),
  })
}

async function processJob(job: BackgroundJobRecord) {
  const processor = JOB_PROCESSORS[job.type]

  logger.info('Background job started', {
    jobId: job.id,
    type: job.type,
    userId: job.userId,
    attempts: job.attempts,
  })

  try {
    const result = await processor(job)
    await markJobSucceeded(job.id, result)

    logger.info('Background job completed', {
      jobId: job.id,
      type: job.type,
      userId: job.userId,
      followUpJobId: result.followUpJobId ?? null,
    })
  } catch (error) {
    await markJobFailedOrRetry(job, error)
  }
}

export function startBackgroundJobWorker() {
  if (!env.JOB_WORKER_ENABLED) {
    logger.info('Background job worker disabled by configuration')
    return {
      stop() {
        return
      },
    }
  }

  let activeJobs = 0
  let stopped = false

  const tick = async () => {
    if (stopped) {
      return
    }

    while (activeJobs < env.JOB_CONCURRENCY) {
      const job = await claimNextQueuedJob()

      if (!job) {
        break
      }

      activeJobs += 1

      void processJob(job).finally(() => {
        activeJobs -= 1
      })
    }
  }

  const interval = setInterval(() => {
    void tick()
  }, env.JOB_POLL_INTERVAL_MS)

  void tick()

  logger.info('Background job worker started', {
    concurrency: env.JOB_CONCURRENCY,
    pollIntervalMs: env.JOB_POLL_INTERVAL_MS,
  })

  return {
    stop() {
      stopped = true
      clearInterval(interval)
      logger.info('Background job worker stopped')
    },
  }
}
