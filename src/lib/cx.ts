/** Joins class names, skipping empty ones. Returns `undefined` when nothing is left, so no empty `class` attribute is rendered. */
export function cx(...names: readonly (string | false | null | undefined)[]): string | undefined {
  return names.filter(Boolean).join(" ") || undefined;
}
