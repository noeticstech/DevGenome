import { CommitBucket } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import type { NormalizedGithubActivitySummary } from '../github'
import type { GithubActivityPersistenceResult } from './githubSyncTypes'

function hasCommitSummaryChanged(
  currentSummary: {
    userId: string
    bucketEnd: Date
    commitCount: number
    additionCount: number
    deletionCount: number
    activeDays: number
  },
  nextSummary: {
    userId: string
    bucketEnd: Date
    commitCount: number
    additionCount: number
    deletionCount: number
    activeDays: number
  },
) {
  return (
    currentSummary.userId !== nextSummary.userId ||
    currentSummary.bucketEnd.toISOString() !== nextSummary.bucketEnd.toISOString() ||
    currentSummary.commitCount !== nextSummary.commitCount ||
    currentSummary.additionCount !== nextSummary.additionCount ||
    currentSummary.deletionCount !== nextSummary.deletionCount ||
    currentSummary.activeDays !== nextSummary.activeDays
  )
}

export async function persistGithubRepositoryActivitySummary(input: {
  userId: string
  repositoryId: string
  activitySummary: NormalizedGithubActivitySummary
  syncedAt: Date
}): Promise<GithubActivityPersistenceResult> {
  return prisma.$transaction(async (tx) => {
    const bucketStartDates = input.activitySummary.buckets.map((bucket) =>
      new Date(bucket.bucketStart),
    )

    const existingSummaries = await tx.commitSummary.findMany({
      where: {
        repositoryId: input.repositoryId,
        bucketType: CommitBucket.WEEK,
        bucketStart: {
          in: bucketStartDates,
        },
      },
      select: {
        bucketStart: true,
        userId: true,
        bucketEnd: true,
        commitCount: true,
        additionCount: true,
        deletionCount: true,
        activeDays: true,
      },
    })

    const existingSummaryByBucketStart = new Map(
      existingSummaries.map((summary) => [summary.bucketStart.toISOString(), summary]),
    )

    for (const bucket of input.activitySummary.buckets) {
      const bucketStart = new Date(bucket.bucketStart)
      const nextSummaryData = {
        userId: input.userId,
        bucketEnd: new Date(bucket.bucketEnd),
        commitCount: bucket.commitCount,
        additionCount: 0,
        deletionCount: 0,
        activeDays: bucket.activeDays,
        syncedAt: input.syncedAt,
      }

      const existingSummary = existingSummaryByBucketStart.get(bucketStart.toISOString())

      if (!existingSummary) {
        await tx.commitSummary.create({
          data: {
            repositoryId: input.repositoryId,
            bucketType: CommitBucket.WEEK,
            bucketStart,
            ...nextSummaryData,
          },
        })

        continue
      }

      if (
        hasCommitSummaryChanged(existingSummary, {
          userId: nextSummaryData.userId,
          bucketEnd: nextSummaryData.bucketEnd,
          commitCount: nextSummaryData.commitCount,
          additionCount: nextSummaryData.additionCount,
          deletionCount: nextSummaryData.deletionCount,
          activeDays: nextSummaryData.activeDays,
        })
      ) {
        await tx.commitSummary.update({
          where: {
            repositoryId_bucketType_bucketStart: {
              repositoryId: input.repositoryId,
              bucketType: CommitBucket.WEEK,
              bucketStart,
            },
          },
          data: nextSummaryData,
        })
      } else {
        await tx.commitSummary.update({
          where: {
            repositoryId_bucketType_bucketStart: {
              repositoryId: input.repositoryId,
              bucketType: CommitBucket.WEEK,
              bucketStart,
            },
          },
          data: {
            syncedAt: input.syncedAt,
          },
        })
      }
    }

    return {
      summariesSynced: 1,
      bucketRecordsSynced: input.activitySummary.buckets.length,
    }
  })
}
