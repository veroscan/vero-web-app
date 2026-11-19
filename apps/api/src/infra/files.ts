import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Config, SpacesConfig } from '../config';
import { safeEqual, type Secrets } from '../lib/crypto';

/** Signed links are short-lived. Nothing may ask for longer than this. */
export const MAX_SIGNED_URL_SECONDS = 900;

export interface FileStore {
  put(key: string, body: Buffer, options?: { contentType?: string }): Promise<void>;
  /** Returns null when the file does not exist. */
  get(key: string): Promise<Buffer | null>;
  /** Deleting a file that is already gone is not an error. */
  delete(key: string): Promise<void>;
  signedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/;

function assertValidKey(key: string): void {
  if (key.length > 512 || !KEY_PATTERN.test(key) || key.includes('..')) {
    throw new Error('Invalid file key');
  }
}

function clampTtl(expiresInSeconds: number): number {
  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds <= 0) throw new Error('Invalid link lifetime');
  return Math.min(expiresInSeconds, MAX_SIGNED_URL_SECONDS);
}

/** Development: AES-256-GCM files on local disk, with HMAC-signed links served by the API. */
export class LocalEncryptedFileStore implements FileStore {
  private readonly root: string;

  constructor(
    root: string,
    private readonly secrets: Secrets,
    private readonly apiBaseUrl: string,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.root = resolve(root);
  }

  private path(key: string): string {
    assertValidKey(key);
    const full = resolve(this.root, key);
    if (!full.startsWith(this.root + sep)) throw new Error('Invalid file key');
    return full;
  }

  async put(key: string, body: Buffer): Promise<void> {
    const full = this.path(key);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, this.secrets.encryptBytes('file', body));
  }

  async get(key: string): Promise<Buffer | null> {
    let sealed: Buffer;
    try {
      sealed = await readFile(this.path(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    return this.secrets.decryptBytes('file', sealed);
  }

  async delete(key: string): Promise<void> {
    await rm(this.path(key), { force: true });
  }

  private signature(key: string, expires: number): string {
    return this.secrets.hmac('file-link', `${key}|${expires}`);
  }

  signedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    // Inside the executor, so bad input rejects the promise instead of throwing at the caller.
    return new Promise((resolve) => {
      assertValidKey(key);
      const expires = Math.floor(this.now().getTime() / 1000) + clampTtl(expiresInSeconds);
      const query = new URLSearchParams({ key, exp: String(expires), sig: this.signature(key, expires) });
      resolve(`${this.apiBaseUrl}/v1/files/local?${query.toString()}`);
    });
  }

  /** True when the link was signed by us, for this key, and has not expired. */
  verifySignedUrl(key: string, expires: number, signature: string): boolean {
    if (!Number.isInteger(expires) || expires < this.now().getTime() / 1000) return false;
    return safeEqual(this.signature(key, expires), signature);
  }
}

/** S3-compatible storage (DigitalOcean Spaces). The provider encrypts at rest. */
export class S3FileStore implements FileStore {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(spaces: SpacesConfig) {
    this.bucket = spaces.bucket;
    this.client = new S3Client({
      endpoint: spaces.endpoint,
      region: spaces.region,
      forcePathStyle: spaces.forcePathStyle ?? false,
      credentials: { accessKeyId: spaces.accessKeyId, secretAccessKey: spaces.secretAccessKey },
      // Spaces does not accept the SDK's newer default integrity headers.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async put(key: string, body: Buffer, options: { contentType?: string } = {}): Promise<void> {
    assertValidKey(key);
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: options.contentType, ACL: 'private' }),
    );
  }

  async get(key: string): Promise<Buffer | null> {
    assertValidKey(key);
    try {
      const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      if (!result.Body) return null;
      return Buffer.from(await result.Body.transformToByteArray());
    } catch (error) {
      if ((error as { name?: string }).name === 'NoSuchKey') return null;
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    assertValidKey(key);
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async signedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    assertValidKey(key);
    // Whatever a file claims to be, it comes back as a download and is never shown in a browser.
    return await getSignedUrl(this.client, new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: 'attachment',
      ResponseContentType: 'application/octet-stream',
    }), {
      expiresIn: clampTtl(expiresInSeconds),
    });
  }
}

export function createFileStore(
  config: Pick<Config, 'spaces' | 'localFileDir' | 'apiBaseUrl'>,
  secrets: Secrets,
): FileStore {
  return config.spaces
    ? new S3FileStore(config.spaces)
    : new LocalEncryptedFileStore(config.localFileDir, secrets, config.apiBaseUrl);
}
