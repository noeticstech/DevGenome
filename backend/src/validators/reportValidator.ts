import { AppError } from '../utils/app-error'
import { DeveloperReportTypeSchema } from '../services/reports'

export function validateDeveloperReportType(input: unknown) {
  const parsedInput = DeveloperReportTypeSchema.safeParse(input)

  if (!parsedInput.success) {
    throw new AppError(400, 'Unsupported report type')
  }

  return parsedInput.data
}
