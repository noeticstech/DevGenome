import { Prisma, PrismaClient } from '@prisma/client'

import { logger } from './logger'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

type PrismaEventClient = PrismaClient<{
  log: [
    { emit: 'event'; level: 'warn' },
    { emit: 'event'; level: 'error' },
  ]
}>

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  })

const prismaEventClient = prisma as PrismaEventClient

prismaEventClient.$on('warn', (event: Prisma.LogEvent) => {
  logger.warn('Prisma warning', {
    target: event.target,
    message: event.message,
  })
})

prismaEventClient.$on('error', (event: Prisma.LogEvent) => {
  logger.error('Prisma error', {
    target: event.target,
    message: event.message,
  })
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
