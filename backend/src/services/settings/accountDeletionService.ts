import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import { invalidateUserRuntimeCache } from '../cache'

export async function deleteUserAccount(userId: string) {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new AppError(404, 'Authenticated user not found')
    }

    await tx.user.delete({
      where: { id: userId },
    })
  })

  invalidateUserRuntimeCache(userId)
}
