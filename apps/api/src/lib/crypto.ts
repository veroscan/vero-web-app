import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

/** A 256-bit random token, URL-safe. Used for session cookies, sign-in and invitation links. */
export function randomToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Tokens are stored as SHA-256. They have 256 bits of entropy, so a fast unsalted hash is
 * the right tool: a database leak still gives nobody a working link or session.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * AES-256-GCM and HMAC under keys derived from APP_ENCRYPTION_KEY, one per purpose, so a
 * ciphertext made for one use cannot be replayed as another.
 */
export class Secrets {
  private readonly master: Buffer;

  constructor(base64Key: string) {
    this.master = Buffer.from(base64Key, 'base64');
    if (this.master.length !== 32) throw new Error('Encryption key must be 32 bytes');
  }

  private key(purpose: string): Buffer {
    return Buffer.from(hkdfSync('sha256', this.master, Buffer.alloc(0), `vero:${purpose}`, 32));
  }

  encryptBytes(purpose: string, plain: Buffer): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(purpose), iv);
    const body = Buffer.concat([cipher.update(plain), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), body]);
  }

  /** Throws if the data was changed, or was encrypted for another purpose or key. */
  decryptBytes(purpose: string, sealed: Buffer): Buffer {
    const decipher = createDecipheriv('aes-256-gcm', this.key(purpose), sealed.subarray(0, 12));
    decipher.setAuthTag(sealed.subarray(12, 28));
    return Buffer.concat([decipher.update(sealed.subarray(28)), decipher.final()]);
  }

  encryptString(purpose: string, plain: string): string {
    return this.encryptBytes(purpose, Buffer.from(plain, 'utf8')).toString('base64');
  }

  decryptString(purpose: string, sealed: string): string {
    return this.decryptBytes(purpose, Buffer.from(sealed, 'base64')).toString('utf8');
  }

  /** Keyed hash, so stored values such as email fingerprints cannot be reversed by guessing. */
  hmac(purpose: string, value: string): string {
    return createHmac('sha256', this.key(`hmac:${purpose}`)).update(value).digest('hex');
  }
}
