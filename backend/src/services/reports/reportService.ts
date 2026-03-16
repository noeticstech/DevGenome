import { env } from '../../config/env'
import type { DeveloperReportResponse, DeveloperReportType } from '../../types/api/reports'
import { GeminiClient } from '../ai/geminiClient'
import {
  buildCacheTimestamp,
  createUserScopedCacheKey,
  getOrSetRuntimeCacheValue,
} from '../cache'
import { buildDeveloperReportSourceData } from './reportBuilder'
import { developerReportDeliveryStrategy, loadPersistedDeveloperReport, storeGeneratedDeveloperReport } from './reportPersistence'
import { buildDeveloperReportPrompt, buildDeveloperReportSystemInstruction, getDeveloperReportResponseSchema } from './reportPromptBuilder'
import { DeveloperReportModelOutputSchema } from './reportTypes'

const geminiClient = new GeminiClient()

function createEmptyDeveloperReportResponse(input: {
  reportType: DeveloperReportType
  state: DeveloperReportResponse['meta']['state']
  availability: DeveloperReportResponse['meta']['availability']
  aiConfigured: boolean
  basedOnAnalysisAt: Date | null
  basedOnSyncAt: Date | null
  emptyMessage: string | null
  warnings: string[]
}): DeveloperReportResponse {
  return {
    meta: {
      state: input.state,
      availability: input.availability,
      reportType: input.reportType,
      provider: input.aiConfigured ? 'gemini' : null,
      aiConfigured: input.aiConfigured,
      generated: false,
      model: input.aiConfigured ? env.GEMINI_MODEL : null,
      source: developerReportDeliveryStrategy.source,
      generatedAt: null,
      basedOnAnalysisAt: input.basedOnAnalysisAt?.toISOString() ?? null,
      basedOnSyncAt: input.basedOnSyncAt?.toISOString() ?? null,
    },
    emptyMessage: input.emptyMessage,
    report: {
      type: input.reportType,
      title: null,
      subtitle: null,
      summary: null,
      strengths: [],
      weakPoints: [],
      changesOverTime: [],
      nextSteps: [],
      metrics: [],
      sections: [],
    },
    warnings: input.warnings,
  }
}

export async function getDeveloperReportResponse(
  userId: string,
  reportType: DeveloperReportType,
): Promise<DeveloperReportResponse> {
  const sourceData = await buildDeveloperReportSourceData(userId, reportType)
  const aiConfigured = geminiClient.isConfigured()

  if (!aiConfigured) {
    return createEmptyDeveloperReportResponse({
      reportType,
      state: sourceData.state,
      availability: 'disabled',
      aiConfigured,
      basedOnAnalysisAt: sourceData.basedOnAnalysisAt,
      basedOnSyncAt: sourceData.basedOnSyncAt,
      emptyMessage: 'Gemini report generation is not configured on this backend yet.',
      warnings: [
        ...sourceData.warnings,
        'Set GEMINI_API_KEY on the backend to enable AI report generation.',
      ],
    })
  }

  if (sourceData.availability !== 'ready' || !sourceData.input) {
    return createEmptyDeveloperReportResponse({
      reportType,
      state: sourceData.state,
      availability: sourceData.availability,
      aiConfigured,
      basedOnAnalysisAt: sourceData.basedOnAnalysisAt,
      basedOnSyncAt: sourceData.basedOnSyncAt,
      emptyMessage: sourceData.emptyMessage,
      warnings: sourceData.warnings,
    })
  }

  const reportInput = sourceData.input

  const cacheKey = createUserScopedCacheKey({
    scope: 'ai_report',
    userId,
    parts: [
      reportType,
      sourceData.state,
      buildCacheTimestamp(sourceData.basedOnAnalysisAt),
      buildCacheTimestamp(sourceData.basedOnSyncAt),
      sourceData.input.user.targetRole,
    ],
  })

  return getOrSetRuntimeCacheValue({
    key: cacheKey,
    userId,
    ttlMs: env.AI_RESPONSE_CACHE_TTL_MS,
    loader: async () => {
      const persistedReport = await loadPersistedDeveloperReport(userId, reportType)

      if (persistedReport) {
        return {
          meta: {
            state: sourceData.state,
            availability: 'ready',
            reportType,
            provider: 'gemini',
            aiConfigured: true,
            generated: true,
            model: env.GEMINI_MODEL,
            source: developerReportDeliveryStrategy.source,
            generatedAt: new Date().toISOString(),
            basedOnAnalysisAt: sourceData.basedOnAnalysisAt?.toISOString() ?? null,
            basedOnSyncAt: sourceData.basedOnSyncAt?.toISOString() ?? null,
          },
          emptyMessage: null,
          report: {
            type: reportType,
            ...persistedReport,
            metrics: persistedReport.metrics.map((metric) => ({
              ...metric,
              context: metric.context ?? null,
            })),
          },
          warnings: sourceData.warnings,
        } satisfies DeveloperReportResponse
      }

      const modelOutput = await geminiClient.generateStructuredContent({
        prompt: buildDeveloperReportPrompt(reportInput),
        systemInstruction: buildDeveloperReportSystemInstruction(),
        responseSchema: getDeveloperReportResponseSchema(),
        validator: DeveloperReportModelOutputSchema,
        temperature: 0.25,
      })

      await storeGeneratedDeveloperReport({
        userId,
        reportType,
        report: modelOutput,
      })

      return {
        meta: {
          state: sourceData.state,
          availability: 'ready',
          reportType,
          provider: 'gemini',
          aiConfigured: true,
          generated: true,
          model: env.GEMINI_MODEL,
          source: developerReportDeliveryStrategy.source,
          generatedAt: new Date().toISOString(),
          basedOnAnalysisAt: sourceData.basedOnAnalysisAt?.toISOString() ?? null,
          basedOnSyncAt: sourceData.basedOnSyncAt?.toISOString() ?? null,
        },
        emptyMessage: null,
        report: {
          type: reportType,
          ...modelOutput,
          metrics: modelOutput.metrics.map((metric) => ({
            ...metric,
            context: metric.context ?? null,
          })),
        },
        warnings: sourceData.warnings,
      } satisfies DeveloperReportResponse
    },
  })
}
