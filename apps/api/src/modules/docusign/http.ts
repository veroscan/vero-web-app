/** Small helpers shared by the DocuSign and Resend clients. */

export class TooLargeError extends Error {
  override name = 'TooLargeError';
  constructor() {
    super('That file is too large.');
  }
}

/** Reads a response body, stopping as soon as it passes `maxBytes`. */
export async function readCapped(response: Response, maxBytes: number): Promise<Buffer> {
  const declared = Number(response.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > maxBytes) {
    await response.body?.cancel().catch(() => undefined);
    throw new TooLargeError();
  }
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  for (;;) {
    const result: unknown = await reader.read();
    const { done, value } = result as { done: boolean; value?: Uint8Array };
    if (done || !value) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new TooLargeError();
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function str(value: unknown, max = 2000): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= max ? value : null;
}
