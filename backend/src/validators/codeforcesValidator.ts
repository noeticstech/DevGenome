import { z } from 'zod'

import { AppError } from '../utils/app-error'

const codeforcesLinkSchema = z
  .object({
    handle: z
      .string()
      .trim()
      .min(1, 'Codeforces handle is required')
      .max(60, 'Codeforces handle must be 60 characters or fewer')
      .regex(/^[A-Za-z0-9_.-]+$/, 'Codeforces handle contains unsupported characters'),
  })
  .strict()

export function validateCodeforcesLinkInput(input: unknown) {
  const parsedInput = codeforcesLinkSchema.safeParse(input)

  if (!parsedInput.success) {
    const firstIssue = parsedInput.error.issues[0]
    throw new AppError(400, firstIssue?.message ?? 'Invalid Codeforces link payload')
  }

  return parsedInput.data
}
