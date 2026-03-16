import type { AiInsightsResponse } from '../../types/api/insights'
import { env } from '../../config/env'
import {
  buildCacheTimestamp,
  createUserScopedCacheKey,
  getOrSetRuntimeCacheValue,
} from '../cache'
import { GeminiClient } from './geminiClient'
import { buildGeminiInsightSourceData } from './geminiInputBuilder'
import {
  buildGeminiInsightPrompt,
  buildGeminiSystemInstruction,
  getGeminiInsightResponseSchema,
} from './geminiPromptBuilder'
import { GeminiInsightModelOutputSchema } from './geminiTypes'

const geminiClient = new GeminiClient()

function createEmptyInsightsResponse(input: {
  state: AiInsightsResponse['meta']['state']
  availability: AiInsightsResponse['meta']['availability']
  aiConfigured: boolean
  basedOnAnalysisAt: Date | null
  emptyMessage: string | null
  warnings: string[]
}): AiInsightsResponse {
  return {
    meta: {
      state: input.state,
      availability: input.availability,
      provider: input.aiConfigured ? 'gemini' : null,
      aiConfigured: input.aiConfigured,
      generated: false,
      model: input.aiConfigured ? env.GEMINI_MODEL : null,
      source: 'on_demand',
      generatedAt: null,
      basedOnAnalysisAt: input.basedOnAnalysisAt?.toISOString() ?? null,
    },
    emptyMessage: input.emptyMessage,
    insights: {
      summary: null,
      genome: {
        narrativeSummary: null,
        whyThisScore: null,
        strengths: [],
        growthEdges: [],
      },
      skillGap: {
        targetRole: null,
        explanation: null,
        priorities: [],
        recommendations: [],
      },
      careerFit: {
        primaryFit: null,
        explanation: null,
        supportingSignals: [],
      },
      evolution: {
        narrative: null,
        growthSignal: null,
        nextMilestone: null,
        recommendations: [],
      },
      report: {
        title: null,
        overview: null,
        highlights: [],
        watchouts: [],
        nextSteps: [],
      },
    },
    warnings: input.warnings,
  }
}

export async function getGeminiInsightsResponse(
  userId: string,
): Promise<AiInsightsResponse> {
  const sourceData = await buildGeminiInsightSourceData(userId)
  const aiConfigured = geminiClient.isConfigured()

  if (!aiConfigured) {
    return createEmptyInsightsResponse({
      state: sourceData.state,
      availability: 'disabled',
      aiConfigured,
      basedOnAnalysisAt: sourceData.basedOnAnalysisAt,
      emptyMessage: 'Gemini insight generation is not configured on this backend yet.',
      warnings: [
        ...sourceData.warnings,
        'Set GEMINI_API_KEY on the backend to enable AI explanations.',
      ],
    })
  }

  if (sourceData.availability !== 'ready' || !sourceData.input) {
    return createEmptyInsightsResponse({
      state: sourceData.state,
      availability: sourceData.availability,
      aiConfigured,
      basedOnAnalysisAt: sourceData.basedOnAnalysisAt,
      emptyMessage: sourceData.emptyMessage,
      warnings: sourceData.warnings,
    })
  }

  const insightInput = sourceData.input

  const cacheKey = createUserScopedCacheKey({
    scope: 'ai_insights',
    userId,
    parts: [
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
      const modelOutput = await geminiClient.generateStructuredContent({
        prompt: buildGeminiInsightPrompt(insightInput),
        systemInstruction: buildGeminiSystemInstruction(),
        responseSchema: getGeminiInsightResponseSchema(),
        validator: GeminiInsightModelOutputSchema,
        temperature: 0.2,
      })

      return {
        meta: {
          state: sourceData.state,
          availability: 'ready',
          provider: 'gemini',
          aiConfigured: true,
          generated: true,
          model: env.GEMINI_MODEL,
          source: 'on_demand',
          generatedAt: new Date().toISOString(),
          basedOnAnalysisAt: sourceData.basedOnAnalysisAt?.toISOString() ?? null,
        },
        emptyMessage: null,
        insights: {
          summary: modelOutput.summary,
          genome: modelOutput.genome,
          skillGap: modelOutput.skillGap,
          careerFit: modelOutput.careerFit,
          evolution: modelOutput.evolution,
          report: modelOutput.report,
        },
        warnings: sourceData.warnings,
      } satisfies AiInsightsResponse
    },
  })
}
