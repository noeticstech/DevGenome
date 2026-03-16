import type { Request } from 'express'

export function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.cookie

  if (!cookieHeader) {
    return null
  }

  const cookies = cookieHeader.split(';')

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=')

    if (rawName === name) {
      return decodeURIComponent(rawValueParts.join('='))
    }
  }

  return null
}
