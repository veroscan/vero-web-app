import type { RegistrySearchResponse } from '@vero/shared';

type Candidate = RegistrySearchResponse['candidates'][number];

/** Carried in the address from search to confirm: public register details, nothing private. */
/** `adding`: the team already has a company and is adding another; it carries through every step. */
export function confirmHref(country: string, candidate: Candidate, search: Pick<RegistrySearchResponse, 'sourceName' | 'sampleData'>, adding = false): string {
  const params = new URLSearchParams({ country, name: candidate.name, source: search.sourceName });
  if (adding) params.set('add', '1');
  if (candidate.registrationNumber) params.set('number', candidate.registrationNumber);
  if (candidate.registeredAgent) params.set('agent', candidate.registeredAgent);
  if (candidate.entityType) params.set('type', candidate.entityType);
  if (candidate.incorporatedOn) params.set('formed', candidate.incorporatedOn);
  if (search.sampleData) params.set('sample', '1');
  return `/onboarding/confirm?${params.toString()}`;
}

/** For when the register can't answer: the person types the details instead. */
export function manualHref(country: string, name: string, adding = false): string {
  return `/onboarding/confirm?${new URLSearchParams({ country, name, manual: '1', ...(adding ? { add: '1' } : {}) }).toString()}`;
}

export function notFoundHref(country: string, query: string, sourceName?: string, adding = false): string {
  const params = new URLSearchParams({ country, q: query });
  if (adding) params.set('add', '1');
  if (sourceName) params.set('source', sourceName);
  return `/onboarding/not-found?${params.toString()}`;
}
