/**
 * Route key of a pathname or `.html` link: `/product.html` and `/product` -> `product`,
 * `/` and `/index.html` -> `` (empty). Mirrors the key the template's page-transition code derives.
 */
export function routeKey(pathOrHref: string): string {
  return pathOrHref
    .replace(/\.html$/, "")
    .replace(/(^|\/)index$/, "")
    .replace(/^\/+|\/+$/g, "");
}
