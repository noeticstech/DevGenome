import { z } from 'zod'

import { env, isGeminiConfigured } from '../../config/env'
import { logger } from '../../lib/logger'
import { AppError } from '../../utils/app-error'

type GeminiFetch = typeof fetch

interface GeminiGenerateStructuredOptions<T> {
  prompt: string
  systemInstruction: string
  responseSchema: Record<string, unknown>
  validator: z.ZodType<T>
  temperature?: number
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    finishReason?: string
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  promptFeedback?: {
    blockReason?: string
  }
}

function sanitizeJsonText(value: string) {
  const trimmed = value.trim()

  if (!trimmed.startsWith('```')) {
    return trimmed
  }

  return trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
}

function buildProviderErrorMessage(statusCode: number) {
  if (statusCode === 400) {
    return 'Gemini rejected the insight request'
  }

  if (statusCode === 401 || statusCode === 403) {
    return 'Gemini authentication failed'
  }

  if (statusCode === 429) {
    return 'Gemini rate limit reached'
  }

  return 'Gemini request failed'
}

export class GeminiClient {
  private readonly fetchImpl: GeminiFetch

  constructor(input: { fetchImpl?: GeminiFetch } = {}) {
    this.fetchImpl = input.fetchImpl ?? fetch
  }

  isConfigured() {
    return isGeminiConfigured()
  }

  async generateStructuredContent<T>(
    input: GeminiGenerateStructuredOptions<T>,
  ): Promise<T> {
    if (!env.GEMINI_API_KEY) {
      throw new AppError(503, 'Gemini insight generation is not configured', {
        category: 'ai',
        code: 'GEMINI_NOT_CONFIGURED',
      })
    }

    const requestUrl =
      `${env.GEMINI_API_BASE_URL}/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`

    try {
      const response = await this.fetchImpl(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            role: 'system',
            parts: [{ text: input.systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: input.prompt }],
            },
          ],
          generationConfig: {
            temperature: input.temperature ?? 0.2,
            responseMimeType: 'application/json',
            responseSchema: input.responseSchema,
            maxOutputTokens: 2_048,
          },
        }),
        signal: AbortSignal.timeout(env.GEMINI_TIMEOUT_MS),
      })

      if (!response.ok) {
        const providerMessage = await response.text()

        logger.warn('Gemini API request failed', {
          statusCode: response.status,
          providerMessage: providerMessage.slice(0, 300),
        })

        throw new AppError(
          response.status === 429 ? 503 : 502,
          buildProviderErrorMessage(response.status),
          {
            category: 'ai',
            code:
              response.status === 429
                ? 'GEMINI_RATE_LIMITED'
                : response.status === 401 || response.status === 403
                  ? 'GEMINI_AUTH_FAILED'
                  : 'GEMINI_REQUEST_FAILED',
            retryable: response.status >= 500 || response.status === 429,
          },
        )
      }

      const payload = (await response.json()) as GeminiGenerateContentResponse
      const candidate = payload.candidates?.[0]
      const text = candidate?.content?.parts?.find((part) => typeof part.text === 'string')?.text

      if (!text) {
        logger.warn('Gemini returned no structured text', {
          finishReason: candidate?.finishReason ?? null,
          blockReason: payload.promptFeedback?.blockReason ?? null,
        })

        throw new AppError(502, 'Gemini returned no usable insight content', {
          category: 'ai',
          code: 'GEMINI_EMPTY_RESPONSE',
        })
      }

      const parsedJson = JSON.parse(sanitizeJsonText(text)) as unknown

      try {
        return input.validator.parse(parsedJson)
      } catch (error) {
        logger.warn('Gemini returned invalid structured content', {
          issues: error instanceof z.ZodError ? error.issues : 'unknown',
        })

        throw new AppError(502, 'Gemini returned an invalid insight response', {
          category: 'ai',
          code: 'GEMINI_INVALID_RESPONSE',
        })
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new AppError(504, 'Gemini request timed out', {
          category: 'ai',
          code: 'GEMINI_TIMEOUT',
          retryable: true,
        })
      }

      logger.error('Gemini communication failure', {
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      throw new AppError(502, 'Unable to communicate with Gemini', {
        category: 'ai',
        code: 'GEMINI_UNREACHABLE',
        retryable: true,
        cause: error,
      })
    }
  }
}
