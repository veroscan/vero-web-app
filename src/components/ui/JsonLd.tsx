import type { JsonLdValue } from "@/lib/jsonld";

/** Structured data for search engines. The one place (besides the boot script) that injects raw text. */
export function JsonLd({ data, shell = false }: { data: JsonLdValue; shell?: boolean }) {
  const json = JSON.stringify(data).replace(/</g, "\u003c");
  return <script type="application/ld+json" data-shell={shell ? "" : undefined} dangerouslySetInnerHTML={{ __html: json }} />;
}
