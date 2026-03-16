import crypto from 'node:crypto'

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

export function createSignedToken<T extends object>(payload: T, secret: string) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

export function verifySignedToken<T extends { exp: number }>(
  token: string,
  secret: string,
): T | null {
  const [encodedPayload, providedSignature, ...extraParts] = token.split('.')

  if (!encodedPayload || !providedSignature || extraParts.length > 0) {
    return null
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url')

  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null
  }

  let payload: T

  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as T
  } catch {
    return null
  }

  if (payload.exp * 1000 < Date.now()) {
    return null
  }

  return payload
}
