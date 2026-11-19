const MAX_PAGES = 30;
/** Text stops here. Anything this long may not be the whole document. */
export const EXTRACT_MAX_CHARS = 200_000;
const MAX_CHARS = EXTRACT_MAX_CHARS;
const TIMEOUT_MS = 20_000;

export interface ExtractedPdf {
  text: string | null;
  pages: number | null;
}

/**
 * Reads the text layer of a PDF. Scripts are off and fonts aren't loaded. A file that can't be
 * read isn't an error here: it just has no text, and the person confirms what it is. The text
 * goes to the classifier and no further: it is never stored or logged.
 */
export async function extractPdfText(data: Buffer): Promise<ExtractedPdf> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: false,
    stopAtErrors: false,
    verbosity: 0,
  });
  const read = async (): Promise<ExtractedPdf> => {
    const document = await task.promise;
    let text = '';
    const pages = Math.min(document.numPages, MAX_PAGES);
    for (let number = 1; number <= pages && text.length < MAX_CHARS; number += 1) {
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if ('str' in item) text += `${item.str}${item.hasEOL ? '\n' : ' '}`;
      }
      text += '\n';
      page.cleanup();
    }
    return { text: text.trim() ? text.slice(0, MAX_CHARS) : null, pages: document.numPages };
  };
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<ExtractedPdf>((resolve) => {
    timer = setTimeout(() => resolve({ text: null, pages: null }), TIMEOUT_MS);
    timer.unref();
  });
  try {
    return await Promise.race([read(), timeout]);
  } catch {
    return { text: null, pages: null };
  } finally {
    clearTimeout(timer);
    await task.destroy().catch(() => undefined);
  }
}
