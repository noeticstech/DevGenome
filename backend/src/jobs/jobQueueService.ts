import {
  AccountProvider,
  BackgroundJobStatus,
  BackgroundJobTrigger,
  BackgroundJobType,
  Prisma,
} from '@prisma/client'

import { prisma } from '../lib/prisma'
import { AppError } from '../utils/app-error'
import type {
  BackgroundJobListResponse,
  BackgroundJobStatusResponse,
} from '../types/api/jobs'
import {
  buildEnqueueResponse,
  buildJobListResponse,
  buildJobStatusResponse,
  type EnqueueBackgroundJobInput,
  type EnqueueBackgroundJobResult,
} from './jobTypes'

const ACTIVE_JOB_STATUSES = [BackgroundJobStatus.QUEUED, BackgroundJobStatus.RUNNING]
const DEFAULT_JOB_MAX_ATTEMPTS = 3

function normalizeJsonPayload(value: Record<string, unknown> | null | undefined) {
  if (!value) {
    return undefined
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

async function requireLinkedAccount(input: {
  userId: string
  provider: AccountProvider
  missingMessage: string
  requireAccessToken?: boolean
}) {
  const account = await prisma.connectedAccount.findFirst({
    where: {
      userId: input.userId,
      provider: input.provider,
      disconnectedAt: null,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      accessTokenEncrypted: true,
    },
  })

  if (!account || (input.requireAccessToken && !account.accessTokenEncrypted)) {
    throw new AppError(400, input.missingMessage, {
      category: 'sync',
      code: 'SYNC_ACCOUNT_NOT_LINKED',
    })
  }

  return account
}

export async function enqueueBackgroundJob(
  input: EnqueueBackgroundJobInput,
): Promise<EnqueueBackgroundJobResult> {
  const job = await prisma.$transaction(async (tx) => {
    const existingJob = await tx.backgroundJob.findFirst({
      where: {
        userId: input.userId,
        dedupeKey: input.dedupeKey,
        status: {
          in: ACTIVE_JOB_STATUSES,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingJob) {
      return {
        created: false,
        job: existingJob,
      }
    }

    const createdJob = await tx.backgroundJob.create({
      data: {
        userId: input.userId,
        connectedAccountId: input.connectedAccountId ?? null,
        type: input.type,
        trigger: input.trigger,
        dedupeKey: input.dedupeKey,
        payload: normalizeJsonPayload(input.payload),
        sourceJobId: input.sourceJobId ?? null,
        maxAttempts: input.maxAttempts ?? DEFAULT_JOB_MAX_ATTEMPTS,
        scheduledFor: input.scheduledFor ?? new Date(),
      },
    })

    return {
      created: true,
      job: createdJob,
    }
  })

  return {
    created: job.created,
    response: buildEnqueueResponse(job),
  }
}

export async function enqueueGithubSyncJob(input: {
  userId: string
  trigger: BackgroundJobTrigger
  sourceJobId?: string | null
  scheduledFor?: Date
}) {
  const account = await requireLinkedAccount({
    userId: input.userId,
    provider: AccountProvider.GITHUB,
    missingMessage: 'Connect GitHub before starting GitHub sync',
    requireAccessToken: true,
  })

  return enqueueBackgroundJob({
    userId: input.userId,
    connectedAccountId: account.id,
    type: BackgroundJobType.GITHUB_SYNC,
    trigger: input.trigger,
    dedupeKey: `github-sync:${input.userId}`,
    sourceJobId: input.sourceJobId ?? null,
    scheduledFor: input.scheduledFor,
  })
}

export async function enqueueLeetcodeSyncJob(input: {
  userId: string
  trigger: BackgroundJobTrigger
  sourceJobId?: string | null
  scheduledFor?: Date
}) {
  const account = await requireLinkedAccount({
    userId: input.userId,
    provider: AccountProvider.LEETCODE,
    missingMessage: 'Link a LeetCode handle before starting LeetCode sync',
  })

  return enqueueBackgroundJob({
    userId: input.userId,
    connectedAccountId: account.id,
    type: BackgroundJobType.LEETCODE_SYNC,
    trigger: input.trigger,
    dedupeKey: `leetcode-sync:${input.userId}`,
    sourceJobId: input.sourceJobId ?? null,
    scheduledFor: input.scheduledFor,
  })
}

export async function enqueueCodeforcesSyncJob(input: {
  userId: string
  trigger: BackgroundJobTrigger
  sourceJobId?: string | null
  scheduledFor?: Date
}) {
  const account = await requireLinkedAccount({
    userId: input.userId,
    provider: AccountProvider.CODEFORCES,
    missingMessage: 'Link a Codeforces handle before starting Codeforces sync',
  })

  return enqueueBackgroundJob({
    userId: input.userId,
    connectedAccountId: account.id,
    type: BackgroundJobType.CODEFORCES_SYNC,
    trigger: input.trigger,
    dedupeKey: `codeforces-sync:${input.userId}`,
    sourceJobId: input.sourceJobId ?? null,
    scheduledFor: input.scheduledFor,
  })
}

export async function enqueueUserAnalysisJob(input: {
  userId: string
  trigger: BackgroundJobTrigger
  sourceJobId?: string | null
  scheduledFor?: Date
}) {
  return enqueueBackgroundJob({
    userId: input.userId,
    type: BackgroundJobType.USER_ANALYSIS,
    trigger: input.trigger,
    dedupeKey: `user-analysis:${input.userId}`,
    sourceJobId: input.sourceJobId ?? null,
    scheduledFor: input.scheduledFor,
    maxAttempts: 2,
  })
}

export async function getBackgroundJobStatusForUser(
  userId: string,
  jobId: string,
): Promise<BackgroundJobStatusResponse> {
  const job = await prisma.backgroundJob.findFirst({
    where: {
      id: jobId,
      userId,
    },
  })

  if (!job) {
    throw new AppError(404, 'Background job not found', {
      category: 'job',
      code: 'BACKGROUND_JOB_NOT_FOUND',
    })
  }

  return buildJobStatusResponse(job)
}

export async function listRecentBackgroundJobsForUser(
  userId: string,
): Promise<BackgroundJobListResponse> {
  const jobs = await prisma.backgroundJob.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  return buildJobListResponse(jobs)
}
