import { AppError } from '../../http/errors';

/**
 * Server-side checks on an upload. The file's content decides what it is: the name and the
 * browser's stated type are both things the sender controls.
 *
 * There is no antivirus engine in this build. What protects people is that the types are few,
 * active content is refused, nothing is ever run or shown inline, and every download is sent
 * as an attachment with a generic type.
 */
export interface SniffedFile {
  mime: string;
  extensions: readonly string[];
}

const ALLOWED = {
  pdf: { mime: 'application/pdf', extensions: ['pdf'] },
  png: { mime: 'image/png', extensions: ['png'] },
  jpeg: { mime: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['docx'] },
} as const satisfies Record<string, SniffedFile>;

/** A zip claiming to unpack to more than this is treated as a zip bomb. */
const MAX_UNPACKED_BYTES = 200 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 5000;

function notAllowed(): AppError {
  return new AppError(415, 'file_type_not_allowed', 'We can only take PDF, Word (.docx), PNG or JPEG files.');
}

function unsafe(message: string): AppError {
  return new AppError(422, 'file_unsafe', message);
}

function startsWith(data: Buffer, bytes: readonly number[]): boolean {
  return data.length >= bytes.length && bytes.every((byte, index) => data[index] === byte);
}

interface ZipEntry {
  name: string;
  unpackedSize: number;
}

/** Reads a zip's central directory. Returns null when it isn't a well-formed zip. */
function zipEntries(data: Buffer): ZipEntry[] | null {
  // The end record sits within the last 64 KB, after an optional comment.
  const floor = Math.max(0, data.length - 65_557);
  let end = -1;
  for (let at = data.length - 22; at >= floor; at -= 1) {
    if (data.readUInt32LE(at) === 0x06054b50) {
      end = at;
      break;
    }
  }
  if (end === -1) return null;
  const count = data.readUInt16LE(end + 10);
  let at = data.readUInt32LE(end + 16);
  const entries: ZipEntry[] = [];
  for (let index = 0; index < count; index += 1) {
    if (at + 46 > data.length || data.readUInt32LE(at) !== 0x02014b50) return null;
    const unpackedSize = data.readUInt32LE(at + 24);
    const nameLength = data.readUInt16LE(at + 28);
    const extraLength = data.readUInt16LE(at + 30);
    const commentLength = data.readUInt16LE(at + 32);
    if (at + 46 + nameLength > data.length) return null;
    entries.push({ name: data.toString('utf8', at + 46, at + 46 + nameLength), unpackedSize });
    at += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function checkDocx(data: Buffer): SniffedFile {
  const entries = zipEntries(data);
  if (!entries) throw notAllowed();
  const names = new Set(entries.map((entry) => entry.name));
  if (!names.has('[Content_Types].xml') || !names.has('word/document.xml')) throw notAllowed();
  if (entries.length > MAX_ZIP_ENTRIES || entries.reduce((sum, entry) => sum + entry.unpackedSize, 0) > MAX_UNPACKED_BYTES) {
    throw unsafe('This file unpacks to something far too big, so we did not keep it.');
  }
  if ([...names].some((name) => /vbaproject\.bin$/i.test(name) || /\.(exe|dll|js|vbs|bat|cmd|ps1|scr)$/i.test(name) || name.startsWith('word/embeddings/'))) {
    throw unsafe('This file contains macros or embedded programs, so we did not keep it. Save a plain copy and try again.');
  }
  return ALLOWED.docx;
}

function checkPdf(data: Buffer): SniffedFile {
  // Scripts and launch actions have no place in a legal document.
  const text = data.toString('latin1');
  if (/\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia)\b/.test(text)) {
    throw unsafe('This PDF contains scripts or embedded files, so we did not keep it. Print it to a plain PDF and try again.');
  }
  return ALLOWED.pdf;
}

/** Says what a file really is, or refuses it. */
export function inspectFile(data: Buffer): SniffedFile {
  if (data.length === 0) throw new AppError(400, 'invalid_input', 'That file is empty.');
  // Executables first, whatever they're called.
  if (startsWith(data, [0x4d, 0x5a]) || startsWith(data, [0x7f, 0x45, 0x4c, 0x46]) || startsWith(data, [0xcf, 0xfa, 0xed, 0xfe])) {
    throw notAllowed();
  }
  if (startsWith(data, [0x25, 0x50, 0x44, 0x46, 0x2d])) return checkPdf(data);
  if (startsWith(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return ALLOWED.png;
  if (startsWith(data, [0xff, 0xd8, 0xff])) return ALLOWED.jpeg;
  if (startsWith(data, [0x50, 0x4b, 0x03, 0x04])) return checkDocx(data);
  throw notAllowed();
}

/** Text read from a connected repository. The upload route never takes text: only connections do. */
export const MAX_CONNECTED_TEXT_BYTES = 256 * 1024;

/**
 * For files from a connection only (GitHub's licence, notice and policy files). It must be
 * plain UTF-8 text with no NUL bytes, at most 256 KB. Anything else is refused.
 */
export function inspectTextFile(data: Buffer, fileName: string): SniffedFile {
  if (data.length === 0) throw new AppError(400, 'invalid_input', 'That file is empty.');
  if (data.length > MAX_CONNECTED_TEXT_BYTES) throw new AppError(413, 'payload_too_large', 'That file is too large.');
  if (data.includes(0)) throw notAllowed();
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(data);
  } catch {
    throw notAllowed();
  }
  return /\.md$/i.test(fileName) ? { mime: 'text/markdown', extensions: ['md'] } : { mime: 'text/plain', extensions: ['txt'] };
}

/** Control characters, and the ones that can make a name read differently from what it is. */
function isInvisible(code: number): boolean {
  return code < 0x20 || code === 0x7f || code === 0x200e || code === 0x200f || (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);
}

/**
 * Keeps a name fit to show, and nothing more. It is never used to build a storage path: the
 * key is random. Directory parts, control characters and direction overrides all go.
 */
export function cleanFileName(raw: string): string {
  const lastPart = raw.split(/[/\\]/).pop() ?? '';
  const cleaned = [...lastPart].filter((character) => !isInvisible(character.codePointAt(0) ?? 0)).join('').replace(/[<>:"|?*]/g, '').trim();
  const name = cleaned.replace(/^\.+/, '').slice(0, 200);
  if (!name) throw new AppError(400, 'invalid_input', 'That file name is not usable.');
  return name;
}

/** The name must agree with the content, so nobody is handed "contract.pdf.exe". */
export function assertExtensionMatches(fileName: string, file: SniffedFile): void {
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : undefined;
  if (!extension || !file.extensions.includes(extension)) {
    throw new AppError(415, 'file_type_not_allowed', "That file's name doesn't match what's inside it.");
  }
}
