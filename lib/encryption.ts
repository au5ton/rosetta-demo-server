import crypto from 'crypto'

export const computeSHA512Hash = (text: string) => crypto.createHash('sha512').update(Buffer.from(text)).digest('hex');

const key = Buffer.from(process.env.ENCRYPTION_KEY ?? '', 'hex');
const iv = Buffer.from(process.env.ENCRYPTION_KEY_IV ?? '', 'hex');

export function encrypt(plaintext: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = cipher.update(plaintext);
  return Buffer.concat([encrypted, cipher.final()]).toString('hex');
}

export function decrypt(ciphertext: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = decipher.update(Buffer.from(ciphertext, 'hex'))
  return Buffer.concat([decrypted, decipher.final()]).toString();
}