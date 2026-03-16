export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
}

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseUrl = getApiBaseUrl()

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : 'Something went wrong while contacting DevGenome.'

    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

export function getBrowserApiUrl(path: string) {
  return buildUrl(path)
}
