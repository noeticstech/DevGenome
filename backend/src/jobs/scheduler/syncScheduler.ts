import { AccountProvider, BackgroundJobTrigger } from '@prisma/client'

import { env } from '../../config/env'
import { logger } from '../../lib/logger'
import { prisma } from '../../lib/prisma'
import {
  enqueueCodeforcesSyncJob,
  enqueueGithubSyncJob,
  enqueueLeetcodeSyncJob,
} from '../jobQueueService'

function getProviderSyncIntervalMs(provider: AccountProvider) {
  switch (provider) {
    case AccountProvider.GITHUB:
      return env.GITHUB_SYNC_INTERVAL_MINUTES * 60_000
    case AccountProvider.LEETCODE:
      return env.LEETCODE_SYNC_INTERVAL_MINUTES * 60_000
    case AccountProvider.CODEFORCES:
      return env.CODEFORCES_SYNC_INTERVAL_MINUTES * 60_000
    default:
      return env.GITHUB_SYNC_INTERVAL_MINUTES * 60_000
  }
}

function isAccountDueForSync(input: {
  provider: AccountProvider
  lastSyncedAt: Date | null
  accessTokenEncrypted: string | null
  now: Date
}) {
  if (input.provider === AccountProvider.GITHUB && !input.accessTokenEncrypted) {
    return false
  }

  if (!input.lastSyncedAt) {
    return true
  }

  return (
    input.now.getTime() - input.lastSyncedAt.getTime() >=
    getProviderSyncIntervalMs(input.provider)
  )
}

export async function runScheduledSyncSweep() {
  const now = new Date()
  const accounts = await prisma.connectedAccount.findMany({
    where: {
      disconnectedAt: null,
      provider: {
        in: [
          AccountProvider.GITHUB,
          AccountProvider.LEETCODE,
          AccountProvider.CODEFORCES,
        ],
      },
    },
    select: {
      id: true,
      userId: true,
      provider: true,
      lastSyncedAt: true,
      accessTokenEncrypted: true,
    },
  })

  let jobsQueued = 0

  for (const account of accounts) {
    if (
      !isAccountDueForSync({
        provider: account.provider,
        lastSyncedAt: account.lastSyncedAt,
        accessTokenEncrypted: account.accessTokenEncrypted,
        now,
      })
    ) {
      continue
    }

    let result:
      | Awaited<ReturnType<typeof enqueueGithubSyncJob>>
      | Awaited<ReturnType<typeof enqueueLeetcodeSyncJob>>
      | Awaited<ReturnType<typeof enqueueCodeforcesSyncJob>>

    if (account.provider === AccountProvider.GITHUB) {
      result = await enqueueGithubSyncJob({
        userId: account.userId,
        trigger: BackgroundJobTrigger.SCHEDULED,
      })
    } else if (account.provider === AccountProvider.LEETCODE) {
      result = await enqueueLeetcodeSyncJob({
        userId: account.userId,
        trigger: BackgroundJobTrigger.SCHEDULED,
      })
    } else {
      result = await enqueueCodeforcesSyncJob({
        userId: account.userId,
        trigger: BackgroundJobTrigger.SCHEDULED,
      })
    }

    if (result.created) {
      jobsQueued += 1
    }
  }

  logger.info('Scheduled sync sweep completed', {
    connectedAccountsScanned: accounts.length,
    jobsQueued,
  })
}

export function startScheduledSyncRunner() {
  if (!env.JOB_SCHEDULER_ENABLED) {
    logger.info('Scheduled sync runner disabled by configuration')
    return {
      stop() {
        return
      },
    }
  }

  let running = false
  let stopped = false

  const tick = async () => {
    if (running || stopped) {
      return
    }

    running = true

    try {
      await runScheduledSyncSweep()
    } catch (error) {
      logger.error('Scheduled sync sweep failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      running = false
    }
  }

  const interval = setInterval(() => {
    void tick()
  }, env.JOB_SCHEDULER_INTERVAL_MS)

  void tick()

  logger.info('Scheduled sync runner started', {
    intervalMs: env.JOB_SCHEDULER_INTERVAL_MS,
    githubIntervalMinutes: env.GITHUB_SYNC_INTERVAL_MINUTES,
    leetcodeIntervalMinutes: env.LEETCODE_SYNC_INTERVAL_MINUTES,
    codeforcesIntervalMinutes: env.CODEFORCES_SYNC_INTERVAL_MINUTES,
  })

  return {
    stop() {
      stopped = true
      clearInterval(interval)
      logger.info('Scheduled sync runner stopped')
    },
  }
}
