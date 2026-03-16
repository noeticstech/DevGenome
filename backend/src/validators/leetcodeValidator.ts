import { z } from 'zod'

import { AppError } from '../utils/app-error'

const leetcodeLinkSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'LeetCode username is required')
      .max(60, 'LeetCode username must be 60 characters or fewer')
      .regex(/^[A-Za-z0-9_.-]+$/, 'LeetCode username contains unsupported characters'),
  })
  .strict()

export function validateLeetcodeLinkInput(input: unknown) {
  const parsedInput = leetcodeLinkSchema.safeParse(input)

  if (!parsedInput.success) {
    const firstIssue = parsedInput.error.issues[0]
    throw new AppError(400, firstIssue?.message ?? 'Invalid LeetCode link payload')
  }

  return parsedInput.data
}
