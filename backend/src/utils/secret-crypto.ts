import crypto from 'node:crypto'

const SECRET_FORMAT_VERSION = 'v1'

function createEncryptionKey(secret: string) {
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptSecret(value: string, secret: string) {
  const iv = crypto.randomBytes(12)
  const key = createEncryptionKey(secret)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [
    SECRET_FORMAT_VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.')
}

export function decryptSecret(value: string, secret: string) {
  const parts = value.split('.')
  const [ivPart, authTagPart, encryptedPart] =
    parts.length === 4 && parts[0] === SECRET_FORMAT_VERSION
      ? parts.slice(1)
      : parts

  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error('Encrypted secret has invalid format')
  }

  const key = createEncryptionKey(secret)
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivPart, 'base64url'),
  )

  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}
