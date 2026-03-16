import crypto from 'node:crypto'

function createEncryptionKey(secret: string) {
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptSecret(value: string, secret: string) {
  const iv = crypto.randomBytes(12)
  const key = createEncryptionKey(secret)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [iv.toString('base64url'), authTag.toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptSecret(value: string, secret: string) {
  const [ivPart, authTagPart, encryptedPart] = value.split('.')

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
