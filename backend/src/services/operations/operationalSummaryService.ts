import { BackgroundJobStatus } from '@prisma/client'

import { env } from '../../config/env'
import { prisma } from '../../lib/prisma'
import { logger } from '../../lib/logger'

const FAILED_JOB_WINDOW_HOURS = 24
const STALE_QUEUED_JOB_THRESHOLD_MS = 15 * 60 * 1000

type OperationalStatus = 'ok' | 'degraded'

interface DatabaseHealthSummary {
  status: 'ok' | 'error'
  latencyMs: number | null
  error: string | null
}

interface JobsHealthSummary {
  status: OperationalStatus | 'disabled'
  queueCounts: {
    queued: number
    running: number
    succeeded: number
    failed: number
  }
  failedLast24Hours: number
  oldestQueuedAt: string | null
  oldestQueuedAgeSeconds: number | null
  latestFailureAt: string | null
  workerEnabled: boolean
  schedulerEnabled: boolean
}

export interface OperationalSummary {
  status: OperationalStatus
  database: DatabaseHealthSummary
  jobs: JobsHealthSummary
  warnings: string[]
}

async function getDatabaseHealthSummary(): Promise<DatabaseHealthSummary> {
  const startedAt = process.hrtime.bigint()

  try {
    await prisma.$queryRaw`SELECT 1`

    return {
      status: 'ok',
      latencyMs: Number(
        (
          Number(process.hrtime.bigint() - startedAt) / 1_000_000
        ).toFixed(1),
      ),
      error: null,
    }
  } catch (error) {
    logger.error('Database health check failed', {
      message: error instanceof Error ? error.message : 'Unknown database health error',
    })

    return {
      status: 'error',
      latencyMs: null,
      error: 'Database health check failed',
    }
  }
}

function buildQueueCounts(
  groups: Array<{ status: BackgroundJobStatus; _count: { _all: number } }>,
) {
  const counts = {
    queued: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
  }

  for (const group of groups) {
    if (group.status === BackgroundJobStatus.QUEUED) {
      counts.queued = group._count._all
    }

    if (group.status === BackgroundJobStatus.RUNNING) {
      counts.running = group._count._all
    }

    if (group.status === BackgroundJobStatus.SUCCEEDED) {
      counts.succeeded = group._count._all
    }

    if (group.status === BackgroundJobStatus.FAILED) {
      counts.failed = group._count._all
    }
  }

  return counts
}

export async function getOperationalSummary(): Promise<OperationalSummary> {
  const database = await getDatabaseHealthSummary()

  if (database.status === 'error') {
    return {
      status: 'degraded',
      database,
      jobs: {
        status: env.JOB_WORKER_ENABLED ? 'degraded' : 'disabled',
        queueCounts: {
          queued: 0,
          running: 0,
          succeeded: 0,
          failed: 0,
        },
        failedLast24Hours: 0,
        oldestQueuedAt: null,
        oldestQueuedAgeSeconds: null,
        latestFailureAt: null,
        workerEnabled: env.JOB_WORKER_ENABLED,
        schedulerEnabled: env.JOB_SCHEDULER_ENABLED,
      },
      warnings: ['Database connectivity is degraded.'],
    }
  }

  const now = Date.now()
  const failedSince = new Date(now - FAILED_JOB_WINDOW_HOURS * 60 * 60 * 1000)

  const [jobStatusGroups, oldestQueuedJob, latestFailedJob, failedLast24Hours] =
    await Promise.all([
      prisma.backgroundJob.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),
      prisma.backgroundJob.findFirst({
        where: {
          status: BackgroundJobStatus.QUEUED,
          scheduledFor: {
            lte: new Date(),
          },
        },
        orderBy: {
          scheduledFor: 'asc',
        },
        select: {
          scheduledFor: true,
        },
      }),
      prisma.backgroundJob.findFirst({
        where: {
          status: BackgroundJobStatus.FAILED,
        },
        orderBy: {
          failedAt: 'desc',
        },
        select: {
          failedAt: true,
        },
      }),
      prisma.backgroundJob.count({
        where: {
          status: BackgroundJobStatus.FAILED,
          failedAt: {
            gte: failedSince,
          },
        },
      }),
    ])

  const queueCounts = buildQueueCounts(jobStatusGroups)
  const oldestQueuedAgeMs = oldestQueuedJob
    ? now - oldestQueuedJob.scheduledFor.getTime()
    : null
  const warnings: string[] = []

  if (env.JOB_WORKER_ENABLED && oldestQueuedAgeMs !== null && oldestQueuedAgeMs > STALE_QUEUED_JOB_THRESHOLD_MS) {
    warnings.push(
      'Background job queue has due jobs that have been waiting longer than expected.',
    )
  }

  if (failedLast24Hours > 0) {
    warnings.push(
      `${failedLast24Hours} background job${failedLast24Hours === 1 ? '' : 's'} failed in the last 24 hours.`,
    )
  }

  const jobsStatus: JobsHealthSummary['status'] =
    !env.JOB_WORKER_ENABLED
      ? 'disabled'
      : warnings.length > 0
        ? 'degraded'
        : 'ok'

  return {
    status: warnings.length > 0 ? 'degraded' : 'ok',
    database,
    jobs: {
      status: jobsStatus,
      queueCounts,
      failedLast24Hours,
      oldestQueuedAt: oldestQueuedJob?.scheduledFor.toISOString() ?? null,
      oldestQueuedAgeSeconds:
        oldestQueuedAgeMs === null ? null : Math.floor(oldestQueuedAgeMs / 1000),
      latestFailureAt: latestFailedJob?.failedAt?.toISOString() ?? null,
      workerEnabled: env.JOB_WORKER_ENABLED,
      schedulerEnabled: env.JOB_SCHEDULER_ENABLED,
    },
    warnings,
  }
}
