import { AppError } from '../../http/errors';
import { cleanFileName, inspectFile, inspectTextFile, MAX_CONNECTED_TEXT_BYTES } from '../vault/files';

/**
 * What a picked file may become in the vault: PDF, PNG, JPEG or plain text, the same four kinds
 * forwarding by email takes. A Google Doc, Sheet or Slides file is asked for as a PDF instead.
 * Word files and everything else are refused with a plain reason. The provider's word for the
 * type is only a first filter: the content, checked with the upload checks, decides.
 */
export type PickedKind = 'pdf' | 'png' | 'jpeg' | 'text';
const EXTENSION: Record<PickedKind, string> = { pdf: 'pdf', png: 'png', jpeg: 'jpg', text: 'txt' };
export const PICKED_MIME: Record<PickedKind, string> = { pdf: 'application/pdf', png: 'image/png', jpeg: 'image/jpeg', text: 'text/plain' };

export const TYPE_REFUSED = 'We can take PDF, PNG, JPEG and plain text files from here. Upload Word and other files from your computer instead.';

/** The kind the provider says a file is, from its type and then its name. */
export function claimedKind(mime: string | null, name: string | null): PickedKind | null {
  const type = mime?.split(';')[0]?.trim().toLowerCase() ?? '';
  const extension = name?.includes('.') ? (name.split('.').pop()?.toLowerCase() ?? '') : '';
  if (type === 'application/pdf' || (!type && extension === 'pdf')) return 'pdf';
  if (type === 'image/png' || (!type && extension === 'png')) return 'png';
  if (type === 'image/jpeg' || type === 'image/jpg' || (!type && (extension === 'jpg' || extension === 'jpeg'))) return 'jpeg';
  if (type === 'text/plain' || (!type && extension === 'txt')) return 'text';
  return null;
}

/** The most bytes we read for a kind: plain text is 256 KB, everything else the upload limit. */
export function limitFor(kind: PickedKind, maxUploadBytes: number): number {
  return kind === 'text' ? Math.min(MAX_CONNECTED_TEXT_BYTES, maxUploadBytes) : maxUploadBytes;
}

/** The content's own answer: the claimed kind if the bytes agree and pass the upload checks, otherwise null. */
export function actualKind(data: Buffer, claimed: PickedKind): PickedKind | null {
  try {
    if (claimed === 'text') return inspectTextFile(data, 'picked.txt').mime === 'text/plain' ? 'text' : null;
    const mime = inspectFile(data).mime;
    const found: PickedKind | null = mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : mime === 'image/jpeg' ? 'jpeg' : null;
    return found === claimed ? found : null;
  } catch (error) {
    if (error instanceof AppError) return null;
    throw error;
  }
}

/** The provider's file name, cleaned to show, with an extension that matches the content. */
export function pickedFileName(raw: string | null, kind: PickedKind, fallback: string): string {
  let name: string;
  try {
    name = raw ? cleanFileName(raw) : '';
  } catch {
    name = '';
  }
  if (!name) name = fallback;
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;
  const fits = kind === 'jpeg' ? extension === 'jpg' || extension === 'jpeg' : extension === EXTENSION[kind];
  return fits ? name : `${name.slice(0, 190)}.${EXTENSION[kind]}`;
}
