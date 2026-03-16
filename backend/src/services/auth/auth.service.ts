import { AccountProvider, Prisma } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import type { AuthenticatedUserResponse, GitHubIdentity, SessionPayload } from '../../types/auth'
import { AppError } from '../../utils/app-error'
import { decryptSecret, encryptSecret } from '../../utils/secret-crypto'
import { invalidateUserRuntimeCache } from '../cache'
import {
  exchangeCodeForAccessToken,
  fetchGitHubIdentity,
} from '../github/github-oauth.service'
import { env } from '../../config/env'

const authenticatedUserInclude = {
  connectedAccounts: {
    where: {
      disconnectedAt: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.UserInclude

type AuthenticatedUserRecord = Prisma.UserGetPayload<{
  include: typeof authenticatedUserInclude
}>

export interface AuthenticatedGitHubAccountContext {
  userId: string
  connectedAccountId: string
  providerUserId: string
  username: string
  accessToken: string
}

function toAuthenticatedUserResponse(
  user: AuthenticatedUserRecord,
): AuthenticatedUserResponse {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    connectedAccounts: user.connectedAccounts.map((account) => ({
      id: account.id,
      provider: account.provider,
      username: account.username,
      profileUrl: account.profileUrl,
      avatarUrl: account.avatarUrl,
      lastSyncedAt: account.lastSyncedAt?.toISOString() ?? null,
    })),
  }
}

function buildUserCreateData(identity: GitHubIdentity): Prisma.UserCreateInput {
  return {
    email: identity.email,
    displayName: identity.displayName,
    username: identity.username,
    avatarUrl: identity.avatarUrl,
    bio: identity.bio,
    preference: {
      create: {},
    },
  }
}

function buildUserUpdateData(
  existingUser: {
    email: string | null
    displayName: string | null
    username: string | null
    avatarUrl: string | null
    bio: string | null
  },
  identity: GitHubIdentity,
): Prisma.UserUpdateInput {
  return {
    email:
      identity.email && (!existingUser.email || existingUser.email === identity.email)
        ? identity.email
        : existingUser.email,
    displayName: identity.displayName ?? existingUser.displayName,
    username: identity.username,
    avatarUrl: identity.avatarUrl ?? existingUser.avatarUrl,
    bio: identity.bio ?? existingUser.bio,
  }
}

async function resolveUserForIdentity(tx: Prisma.TransactionClient, identity: GitHubIdentity) {
  const existingAccount = await tx.connectedAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: identity.provider,
        providerUserId: identity.providerUserId,
      },
    },
    include: {
      user: true,
    },
  })

  if (existingAccount) {
    return tx.user.update({
      where: { id: existingAccount.userId },
      data: buildUserUpdateData(existingAccount.user, identity),
    })
  }

  if (identity.email) {
    const existingUser = await tx.user.findUnique({
      where: { email: identity.email },
    })

    if (existingUser) {
      return tx.user.update({
        where: { id: existingUser.id },
        data: buildUserUpdateData(existingUser, identity),
      })
    }
  }

  return tx.user.create({
    data: buildUserCreateData(identity),
  })
}

export async function completeGitHubAuthentication(input: {
  code: string
}): Promise<{
  session: {
    userId: string
    connectedAccountId: string
    provider: AccountProvider
  }
  user: AuthenticatedUserResponse
}> {
  const tokenResponse = await exchangeCodeForAccessToken(input.code)
  const identity = await fetchGitHubIdentity(tokenResponse.access_token)
  const encryptedAccessToken = encryptSecret(tokenResponse.access_token, env.SESSION_SECRET)
  const encryptedRefreshToken = tokenResponse.refresh_token
    ? encryptSecret(tokenResponse.refresh_token, env.SESSION_SECRET)
    : null

  const result = await prisma.$transaction(async (tx) => {
    const user = await resolveUserForIdentity(tx, identity)

    const connectedAccount = await tx.connectedAccount.upsert({
      where: {
        provider_providerUserId: {
          provider: identity.provider,
          providerUserId: identity.providerUserId,
        },
      },
      update: {
        userId: user.id,
        username: identity.username,
        profileUrl: identity.profileUrl,
        avatarUrl: identity.avatarUrl,
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        tokenExpiresAt: tokenResponse.expires_in
          ? new Date(Date.now() + tokenResponse.expires_in * 1000)
          : null,
        scope: tokenResponse.scope || null,
        lastSyncedAt: new Date(),
        disconnectedAt: null,
      },
      create: {
        userId: user.id,
        provider: AccountProvider.GITHUB,
        providerUserId: identity.providerUserId,
        username: identity.username,
        profileUrl: identity.profileUrl,
        avatarUrl: identity.avatarUrl,
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        tokenExpiresAt: tokenResponse.expires_in
          ? new Date(Date.now() + tokenResponse.expires_in * 1000)
          : null,
        scope: tokenResponse.scope || null,
        lastSyncedAt: new Date(),
      },
    })

    const hydratedUser = await tx.user.findUnique({
      where: { id: user.id },
      include: authenticatedUserInclude,
    })

    if (!hydratedUser) {
      throw new AppError(500, 'Unable to load authenticated user', {
        category: 'auth',
        code: 'AUTH_USER_LOAD_FAILED',
        exposeMessage: false,
      })
    }

    return {
      connectedAccount,
      user: hydratedUser,
    }
  })

  invalidateUserRuntimeCache(result.user.id)

  return {
    session: {
      userId: result.user.id,
      connectedAccountId: result.connectedAccount.id,
      provider: result.connectedAccount.provider,
    },
    user: toAuthenticatedUserResponse(result.user),
  }
}

export async function getAuthenticatedUser(session: SessionPayload | null) {
  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: authenticatedUserInclude,
  })

  if (!user) {
    return null
  }

  return toAuthenticatedUserResponse(user)
}

export async function getAuthenticatedGitHubAccountContext(
  session: SessionPayload | null,
): Promise<AuthenticatedGitHubAccountContext | null> {
  if (!session || session.provider !== AccountProvider.GITHUB) {
    return null
  }

  const connectedAccount = await prisma.connectedAccount.findFirst({
    where: {
      id: session.connectedAccountId,
      userId: session.userId,
      provider: AccountProvider.GITHUB,
      disconnectedAt: null,
    },
    select: {
      id: true,
      userId: true,
      providerUserId: true,
      username: true,
      accessTokenEncrypted: true,
    },
  })

  if (!connectedAccount?.accessTokenEncrypted) {
    return null
  }

  return {
    userId: connectedAccount.userId,
    connectedAccountId: connectedAccount.id,
    providerUserId: connectedAccount.providerUserId,
    username: connectedAccount.username,
    accessToken: decryptSecret(connectedAccount.accessTokenEncrypted, env.SESSION_SECRET),
  }
}

export async function getGitHubAccountContextForUserId(
  userId: string,
): Promise<AuthenticatedGitHubAccountContext | null> {
  const connectedAccount = await prisma.connectedAccount.findFirst({
    where: {
      userId,
      provider: AccountProvider.GITHUB,
      disconnectedAt: null,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      userId: true,
      providerUserId: true,
      username: true,
      accessTokenEncrypted: true,
    },
  })

  if (!connectedAccount?.accessTokenEncrypted) {
    return null
  }

  return {
    userId: connectedAccount.userId,
    connectedAccountId: connectedAccount.id,
    providerUserId: connectedAccount.providerUserId,
    username: connectedAccount.username,
    accessToken: decryptSecret(connectedAccount.accessTokenEncrypted, env.SESSION_SECRET),
  }
}

export async function requireAuthenticatedGitHubAccountContext(
  session: SessionPayload | null,
): Promise<AuthenticatedGitHubAccountContext> {
  const accountContext = await getAuthenticatedGitHubAccountContext(session)

  if (!accountContext) {
    throw new AppError(401, 'GitHub authentication is required', {
      category: 'auth',
      code: 'GITHUB_AUTH_REQUIRED',
    })
  }

  return accountContext
}

export async function requireGitHubAccountContextForUserId(
  userId: string,
): Promise<AuthenticatedGitHubAccountContext> {
  const accountContext = await getGitHubAccountContextForUserId(userId)

  if (!accountContext) {
    throw new AppError(400, 'Connect GitHub before starting GitHub sync', {
      category: 'sync',
      code: 'GITHUB_SYNC_ACCOUNT_NOT_LINKED',
    })
  }

  return accountContext
}
