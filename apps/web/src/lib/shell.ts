import { countryName, type Company, type ScoreView } from '@vero/shared';
import { entityWords } from './format';

/** "Delaware corporation", "Private limited company, United Kingdom". */
export function companyLine(company: Pick<Company, 'entityType' | 'incorporationCountry' | 'incorporationState'>): string {
  const code = company.incorporationState && !company.incorporationCountry.includes('-') ? `${company.incorporationCountry}-${company.incorporationState}` : company.incorporationCountry;
  const place = countryName(code);
  const kind = entityWords(company.entityType);
  if (!kind) return place;
  return /corporation|llc/i.test(kind) && company.incorporationState ? `${place} ${kind.toLowerCase()}` : `${kind}, ${place}`;
}

/** A score as the sidebar shows it: the number, a range on Free, or a dash before a result. */
export function scoreText(score: ScoreView): string {
  if (score.kind === 'exact') return String(score.value);
  if (score.kind === 'approximate') return `${score.low}-${score.high}`;
  return '-';
}
