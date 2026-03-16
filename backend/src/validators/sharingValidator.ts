import { z } from 'zod'

import { AppError } from '../utils/app-error'

const publicProfileShareTokenSchema = z
  .string()
  .trim()
  .min(12)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/)

export function validatePublicProfileShareToken(input: unknown) {
  const parsedInput = publicProfileShareTokenSchema.safeParse(input)

  if (!parsedInput.success) {
    throw new AppError(400, 'Invalid shared profile token')
  }

  return parsedInput.data
}
