import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const KEY_LENGTH = 32

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET_KEY as string
  return crypto.scryptSync(secret, "salt", KEY_LENGTH)
}

export function encryptPassword(password: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(password, "utf8", "hex")
  encrypted += cipher.final("hex")

  const tag = cipher.getAuthTag()

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`
}

export function decryptPassword(encryptedData: string): string {
  const key = getEncryptionKey()
  const parts = encryptedData.split(":")

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format")
  }

  const [ivHex, tagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

