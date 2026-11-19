import { describe, expect, it } from 'vitest';
import type { RawResponse, Transport } from '../src/safe-fetch.js';
import {
  analysePolicy,
  detectLanguage,
  extractLinks,
  foldText,
  guessLanguage,
  htmlToText,
  identifiersOf,
  namedAuthorities,
  normaliseLanguageTag,
  readLocalisedLastUpdated,
  showsIdentifier,
  showsRegistrationNumber,
  wordCount,
} from '../src/sources/policy-scan.js';
import { LINK_VOCABULARY, NOTICE_VOCABULARY, SUPPORTED_LANGUAGES } from '../src/sources/policy-vocabulary.js';
import { CONNECTOR_FACT_KEYS, createPolicyScanConnector, type CompanyRef, type SourceResult } from '../src/index.js';
import { factMap, NOW, sample } from './helpers.js';

const P = 'web.policy';
const UA = 'VeroScanBot/1.0 (admin@example.com)';

type Pages = Record<string, Partial<RawResponse> & { body?: string }>;

function site(pages: Pages): Transport & { seen: string[] } {
  const seen: string[] = [];
  const transport = (async (url: URL) => {
    seen.push(url.pathname);
    const page = pages[url.pathname];
    return page ? { status: page.status ?? 200, headers: page.headers ?? {}, body: page.body ?? '' } : { status: 404, headers: {}, body: '' };
  }) as unknown as Transport & { seen: string[] };
  transport.seen = seen;
  return transport;
}

const robots = { '/robots.txt': { body: 'User-agent: *\nAllow: /\n' } };

function scan(transport: Transport, ref: Partial<CompanyRef> & { name: string; jurisdiction: string }, url = 'https://example-company.example/'): Promise<SourceResult> {
  return createPolicyScanConnector({ env: { WEB_SCAN_USER_AGENT: UA }, transport, now: NOW }).lookup({ website_url: url, ...ref });
}

/** Facts that may be false whatever the language: they don't depend on reading words. */
const WORDLESS = new Set([`${P}.cmp_detected`, `${P}.security_txt_found`, `${P}.language_supported`, `${P}.footer_links_found`]);

function falseFacts(result: SourceResult): string[] {
  return result.facts.filter((f) => f.value === false && !WORDLESS.has(f.key)).map((f) => f.key);
}

describe('page language', () => {
  it('reads the html lang attribute, then Content-Language, then the words', () => {
    expect(detectLanguage('<html lang="fr-FR"><body>x</body></html>', {}, 'x')).toEqual({ code: 'fr', supported: true, source: 'html' });
    expect(detectLanguage('<html><body>x</body></html>', { 'content-language': 'de-AT, en' }, 'x')).toEqual({ code: 'de', supported: true, source: 'header' });
    const dutch = 'Wij zijn een bakkerij en wij bakken elke dag vers brood voor de winkels in de buurt. Het brood is van ons en de winkel is ook van ons.';
    expect(detectLanguage('<html><body></body></html>', {}, dutch)).toMatchObject({ code: 'nl', supported: true, source: 'text' });
    expect(detectLanguage('<html><body>Hello</body></html>', {}, 'Hello')).toEqual({ code: null, supported: false, source: null });
  });

  it('maps Norwegian Bokmål and Nynorsk to Norwegian', () => {
    expect(normaliseLanguageTag('nb-NO')).toBe('no');
    expect(normaliseLanguageTag('nn')).toBe('no');
    expect(normaliseLanguageTag('12-ab')).toBeNull();
  });

  it('knows a language it does not read, and says so', () => {
    expect(detectLanguage('<html lang="ja">', {}, 'こんにちは')).toEqual({ code: 'ja', supported: false, source: 'html' });
    expect(guessLanguage('当社は、お客様の個人情報を適切に取り扱い、安全に管理します。')).toEqual({ code: 'ja', strong: true });
    expect(guessLanguage('Компания обрабатывает персональные данные клиентов в соответствии с законом.')?.code).toBe('und-Cyrl');
  });

  it('believes the text over a template lang attribute that is plainly wrong', () => {
    const french = 'Nous sommes une entreprise familiale et nous vendons des fromages. Vous trouverez sur notre site les produits de la ferme, avec les prix et les horaires. Les commandes sont livrées dans la journée pour les clients de la région, et nous sommes ouverts du lundi au samedi.';
    expect(detectLanguage('<html lang="en-US"><body></body></html>', {}, french)).toMatchObject({ code: 'fr', source: 'text' });
    // A few words are not enough to overrule the page.
    expect(detectLanguage('<html lang="en"><body></body></html>', {}, 'Bienvenue chez nous')).toMatchObject({ code: 'en', source: 'html' });
  });

  it('guesses Danish, Norwegian or Swedish within the family, without needing to be sure which', () => {
    const swedish = 'Vi är ett litet företag och vi har sålt kaffe sedan länge. Det är viktigt för oss att du som kund är nöjd, och vi kan hjälpa dig med din beställning om du har frågor.';
    expect(guessLanguage(swedish)?.code).toBe('sv');
  });

  it('counts Japanese text by characters, so a full notice is not taken for a stub', () => {
    expect(wordCount(htmlToText(sample('site-ja-privacy.html')))).toBeGreaterThan(300);
    expect(wordCount('one two three')).toBe(3);
  });
});

describe('vocabulary', () => {
  // One common link label per language for the privacy notice, terms and legal notice.
  const labels: Record<string, [string, string, string]> = {
    en: ['Privacy policy', 'Terms of use', 'Legal notice'],
    fr: ['Politique de confidentialité', 'Conditions générales de vente', 'Mentions légales'],
    de: ['Datenschutzerklärung', 'Allgemeine Geschäftsbedingungen', 'Impressum'],
    es: ['Política de privacidad', 'Términos y condiciones', 'Aviso legal'],
    it: ['Informativa privacy', 'Termini e condizioni', 'Note legali'],
    pt: ['Política de privacidade', 'Termos de uso', 'Aviso legal'],
    nl: ['Privacyverklaring', 'Algemene voorwaarden', 'Colofon'],
    da: ['Privatlivspolitik', 'Handelsbetingelser', 'Virksomhedsoplysninger'],
    no: ['Personvernerklæring', 'Salgsvilkår', 'Selskapsinformasjon'],
    sv: ['Integritetspolicy', 'Köpvillkor', 'Företagsinformation'],
    fi: ['Tietosuojaseloste', 'Käyttöehdot', 'Yritystiedot'],
    pl: ['Polityka prywatności', 'Regulamin', 'Nota prawna'],
    cs: ['Ochrana osobních údajů', 'Obchodní podmínky', 'Právní informace'],
    sk: ['Ochrana osobných údajov', 'Obchodné podmienky', 'Právne informácie'],
    hu: ['Adatkezelési tájékoztató', 'Általános szerződési feltételek', 'Impresszum'],
    ro: ['Politica de confidențialitate', 'Termeni și condiții', 'Informații legale'],
  };

  it('has a label for every supported language', () => {
    expect(Object.keys(labels).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
  });

  it.each(Object.entries(labels))('%s: finds the privacy notice, terms and legal notice links', async (language, [privacy, terms, legal]) => {
    const home = `<html lang="${language}"><body><a href="/a">${privacy}</a> <a href="/b">${terms}</a> <a href="/c">${legal}</a></body></html>`;
    const result = await scan(site({ ...robots, '/': { body: home } }), { name: 'X', jurisdiction: 'DE' });
    const facts = factMap(result);
    expect(facts[`${P}.language`]).toBe(language);
    expect(facts[`${P}.terms_found`], terms).toBe(true);
    expect(facts[`${P}.legal_notice_present`], legal).toBe(true);
    expect(facts[`${P}.legal_notice_url`]).toBe('https://example-company.example/c');
    // The privacy link was followed (its page is missing here, so the next places are tried).
    expect(facts[`${P}.privacy_notice_found`]).toBe(false);
  });

  it('matches link addresses too, umlauts spelt out included, but never the host name', async () => {
    const home = '<html lang="de"><body><a href="/allgemeine-geschaeftsbedingungen">mehr</a> <a href="https://www.datenschutz-berlin.de/">Berliner Beauftragte</a></body></html>';
    const facts = factMap(await scan(site({ ...robots, '/': { body: home } }), { name: 'X', jurisdiction: 'DE' }));
    expect(facts[`${P}.terms_found`]).toBe(true);
    // The regulator's website is not the company's own privacy notice.
    expect(facts[`${P}.privacy_notice_found`]).toBe(false);
  });

  it('needs capitals for short capital terms in text, and reads web addresses in any case', () => {
    expect(showsRegistrationNumber('Wir sind ein 2026 gegründetes Team', ['de'])).toBe(false);
    expect(showsRegistrationNumber('Amtsgericht München HRB 6684', ['de'])).toBe(true);
    expect(showsRegistrationNumber('hrb 6684', ['de'])).toBe(false);
  });

  it('has every notice check written for every supported language', () => {
    for (const [key, vocabulary] of Object.entries(NOTICE_VOCABULARY)) {
      for (const language of SUPPORTED_LANGUAGES) expect(vocabulary.terms[language], `${key} ${language}`).toBeDefined();
    }
    for (const key of ['privacy', 'terms_found', 'refund_policy_found', 'complaints_policy_found', 'accessibility_found', 'legal_notice'] as const) {
      for (const language of SUPPORTED_LANGUAGES) expect(LINK_VOCABULARY[key].terms[language], `${key} ${language}`).toBeDefined();
    }
  });

  it('folds accents and special letters', () => {
    expect(foldText('Łódź Straße Ærø Confidentialité')).toBe('Lodz Strasse AEro Confidentialite');
  });
});

describe('notice dates in other languages', () => {
  it.each([
    ['fr', 'Dernière mise à jour : 2 mars 2026', '2026-03-02'],
    ['de', 'Stand: 01.03.2026', '2026-03-01'],
    ['de', 'Zuletzt aktualisiert am 1. März 2026', '2026-03-01'],
    ['es', 'Última actualización: 2 de marzo de 2026', '2026-03-02'],
    ['it', 'Ultimo aggiornamento: 2 marzo 2026', '2026-03-02'],
    ['pt', 'Última atualização: 2026-03-02', '2026-03-02'],
    ['nl', 'Laatst bijgewerkt op 2 maart 2026', '2026-03-02'],
    ['sv', 'Senast uppdaterad 2 mars 2026', '2026-03-02'],
    ['fi', 'Päivitetty 2.3.2026', '2026-03-02'],
    ['pl', 'Ostatnia aktualizacja: 15 stycznia 2026', '2026-01-15'],
    ['cs', 'Poslední aktualizace: 2. března 2026', '2026-03-02'],
    ['hu', 'Utolsó frissítés: 2026. március 2.', '2026-03-02'],
  ] as const)('%s: %s', (language, text, iso) => {
    expect(readLocalisedLastUpdated(`Intro. ${text}. More text.`, [language])).toBe(iso);
  });

  it('ignores a label with no date after it, and an impossible date', () => {
    expect(readLocalisedLastUpdated('Stand der Technik ist wichtig.', ['de'])).toBeNull();
    expect(readLocalisedLastUpdated('Stand: 31.02.2026', ['de'])).toBeNull();
  });
});

describe('data protection authorities', () => {
  it.each([
    ["Vous pouvez saisir la Commission nationale de l'informatique et des libertés.", ['FR']],
    ['Beschwerde beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA) möglich.', ['DE']],
    ['Reclamación ante la Agencia Española de Protección de Datos.', ['ES']],
    ['Reclamo al Garante per la protezione dei dati personali.', ['IT']],
    ['Klacht bij de Autoriteit Persoonsgegevens indienen.', ['NL']],
    ['Du kan klage til Datatilsynet.', ['DK', 'NO']],
    ['Du kan klaga till Integritetsskyddsmyndigheten (IMY).', ['SE']],
    ['Voit tehdä valituksen tietosuojavaltuutetun toimistolle.', ['FI']],
    ['Skarga do Prezesa Urzędu Ochrony Danych Osobowych.', ['PL']],
    ['Stížnost u Úřadu pro ochranu osobních údajů.', ['CZ']],
    ['You can complain to the Office of the Australian Information Commissioner.', ['AU']],
    ['You may complain to the Nigeria Data Protection Commission.', ['NG']],
    ['See https://www.edoeb.admin.ch for details.', ['CH']],
    ['苦情は個人情報保護委員会に申し立てることができます。', ['JP']],
  ] as const)('%s', (text, countries) => {
    expect(namedAuthorities(text)).toEqual({ named: true, countries: [...countries] });
  });

  it('takes the longest name first, so one authority is not read as another', () => {
    expect(namedAuthorities('Complaints go to the Nigeria Data Protection Commission.').countries).toEqual(['NG']);
    expect(namedAuthorities('Office of the Privacy Commissioner of Canada').countries).toEqual(['CA']);
  });

  it('does not count a generic "supervisory authority" or a lowercase lookalike', () => {
    expect(namedAuthorities('Sie können sich bei einer Aufsichtsbehörde beschweren.').named).toBe(false);
    expect(namedAuthorities('You may complain to a supervisory authority.').named).toBe(false);
    expect(namedAuthorities('the ico logo').named).toBe(false);
  });

  it('spots a regulator by its website in a link', () => {
    expect(namedAuthorities('Plainte possible.', ['https://www.cnil.fr/fr/plaintes'])).toEqual({ named: true, countries: ['FR'] });
  });
});

describe('company numbers', () => {
  it('finds the company own number, spaced or not, inside a SIRET or a VAT number', () => {
    expect(showsIdentifier('RCS Lyon 512 345 678', '512345678')).toBe(true);
    expect(showsIdentifier('SIRET 512 345 678 00012', '512345678')).toBe(true);
    expect(showsIdentifier('TVA FR 72 512345678', '512345678')).toBe(true);
    expect(showsIdentifier('Handelsregister HRB 999999 B', 'HRB 999999 B')).toBe(true);
    expect(showsIdentifier('Tel. 0512 345 678 9', '512345678')).toBe(false);
    expect(showsIdentifier('RCS Lyon 512 345 679', '512345678')).toBe(false);
  });

  it('only compares numbers long enough to be honest', () => {
    expect(identifiersOf({ name: 'X', jurisdiction: 'DE', registry_number: 'HRB 99', company_number: '01234567', siren: '512345678' })).toEqual(['01234567', '512345678']);
  });
});

describe('web.policy_scan in French: everything present', () => {
  const pages: Pages = {
    ...robots,
    '/': { body: sample('site-fr-home.html') },
    '/politique-de-confidentialite': { body: sample('site-fr-privacy.html') },
    '/mentions-legales': { body: sample('site-fr-legal.html') },
  };
  const ref = { name: 'Fromagerie Belle Rive SAS', jurisdiction: 'FR', siren: '512345678' };

  it('reads the notice, the legal notice and the company number', async () => {
    const result = await scan(site(pages), ref);
    expect(result.status).toBe('found');
    expect(result.message).toBeUndefined();
    expect(factMap(result)).toMatchObject({
      [`${P}.language`]: 'fr',
      [`${P}.language_supported`]: true,
      [`${P}.privacy_notice_found`]: true,
      [`${P}.privacy_notice_url`]: 'https://example-company.example/politique-de-confidentialite',
      [`${P}.names_company`]: true,
      [`${P}.rights_section`]: true,
      [`${P}.retention_statement`]: true,
      [`${P}.transfers_section`]: true,
      [`${P}.dpo_contact`]: true,
      [`${P}.children_section`]: true,
      [`${P}.dpa_named`]: true,
      [`${P}.dpa_countries`]: ['FR'],
      [`${P}.complaint_route_ico`]: false,
      [`${P}.last_updated`]: '2026-03-02',
      [`${P}.ai_disclosure_found`]: true,
      [`${P}.terms_found`]: true,
      [`${P}.complaints_policy_found`]: true,
      [`${P}.accessibility_found`]: true,
      [`${P}.refund_policy_found`]: false,
      [`${P}.legal_notice_present`]: true,
      [`${P}.legal_notice_url`]: 'https://example-company.example/mentions-legales',
      [`${P}.registration_number_shown`]: true,
      [`${P}.registration_number_matches`]: true,
    });
  });

  it('does not take a "cookie settings" button for a cookie policy', async () => {
    expect(factMap(await scan(site(pages), ref))[`${P}.cookie_policy_found`]).toBe(false);
  });

  it('says when the number on the site is not the company own', async () => {
    const facts = factMap(await scan(site(pages), { ...ref, siren: '999999999' }));
    expect(facts[`${P}.registration_number_shown`]).toBe(true);
    expect(facts[`${P}.registration_number_matches`]).toBe(false);
  });

  it('never stores page text', async () => {
    const text = JSON.stringify(await scan(site(pages), ref));
    expect(text).not.toContain('<html');
    expect(text).not.toContain('loyale et transparente');
  });

  it('respects robots.txt for the legal notice, and then claims no missing number', async () => {
    const transport = site({ ...pages, '/robots.txt': { body: 'User-agent: *\nDisallow: /mentions-legales\n' } });
    const facts = factMap(await scan(transport, ref));
    expect(transport.seen).not.toContain('/mentions-legales');
    expect(facts[`${P}.legal_notice_present`]).toBe(true);
    expect(facts[`${P}.registration_number_shown`]).toBeUndefined();
    expect(facts[`${P}.registration_number_matches`]).toBeUndefined();
  });
});

describe('web.policy_scan in French: things missing', () => {
  it('reports the gaps, because it reads French', async () => {
    const home = '<html lang="fr"><body><p>Bienvenue sur notre site.</p><a href="/cgu">CGU</a></body></html>';
    const result = await scan(site({ ...robots, '/': { body: home } }), { name: 'Fromagerie Belle Rive SAS', jurisdiction: 'FR', siren: '512345678' });
    expect(result.status).toBe('not_found');
    expect(result.message).toContain("couldn't find a privacy notice");
    expect(factMap(result)).toMatchObject({
      [`${P}.terms_found`]: true,
      [`${P}.privacy_notice_found`]: false,
      [`${P}.rights_section`]: false,
      [`${P}.dpa_named`]: false,
      [`${P}.legal_notice_present`]: false,
      [`${P}.registration_number_shown`]: false,
      [`${P}.registration_number_matches`]: false,
    });
  });

  it('tries the usual French addresses for the notice', async () => {
    const transport = site({ ...robots, '/': { body: '<html lang="fr"><body>Bonjour</body></html>' }, '/confidentialite': { body: sample('site-fr-privacy.html') } });
    const facts = factMap(await scan(transport, { name: 'Fromagerie Belle Rive SAS', jurisdiction: 'FR' }));
    expect(transport.seen).toContain('/politique-de-confidentialite');
    expect(facts[`${P}.privacy_notice_url`]).toBe('https://example-company.example/confidentialite');
  });
});

describe('web.policy_scan in German: present and missing', () => {
  const pages: Pages = {
    ...robots,
    '/': { body: sample('site-de-home.html') },
    '/datenschutz': { body: sample('site-de-privacy.html') },
    '/impressum': { body: sample('site-de-impressum.html') },
  };

  it('finds the Impressum and the notice, and reports what the notice leaves out', async () => {
    const result = await scan(site(pages), { name: 'Nordlicht Software GmbH', jurisdiction: 'DE', registry_number: 'HRB 999999 B' });
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({
      [`${P}.language`]: 'de',
      [`${P}.legal_notice_present`]: true,
      [`${P}.legal_notice_url`]: 'https://example-company.example/impressum',
      [`${P}.registration_number_shown`]: true,
      [`${P}.registration_number_matches`]: true,
      [`${P}.terms_found`]: true,
      [`${P}.refund_policy_found`]: true,
      [`${P}.cookie_policy_found`]: true,
      [`${P}.accessibility_found`]: true,
      [`${P}.complaints_policy_found`]: false,
      [`${P}.privacy_notice_found`]: true,
      [`${P}.names_company`]: true,
      [`${P}.rights_section`]: true,
      [`${P}.transfers_section`]: true,
      [`${P}.last_updated`]: '2026-03-01',
      // Missing from the notice, and reported as missing because we read German.
      [`${P}.retention_statement`]: false,
      [`${P}.dpo_contact`]: false,
      [`${P}.children_section`]: false,
      // "eine Aufsichtsbehörde" names no authority.
      [`${P}.dpa_named`]: false,
    });
  });
});

describe('web.policy_scan in Dutch: no notice, particulars in the footer', () => {
  it('reports the missing notice and finds the KvK number', async () => {
    const transport = site({ ...robots, '/': { body: sample('site-nl-home.html') } });
    const result = await scan(transport, { name: 'Bakkerij De Molen B.V.', jurisdiction: 'NL', registry_number: '99999999' });
    expect(result.status).toBe('not_found');
    // The Dutch addresses are tried before the English ones.
    expect(transport.seen.slice(0, 4)).toEqual(['/robots.txt', '/', '/privacyverklaring', '/privacybeleid']);
    expect(factMap(result)).toMatchObject({
      [`${P}.language`]: 'nl',
      [`${P}.privacy_notice_found`]: false,
      [`${P}.rights_section`]: false,
      [`${P}.terms_found`]: true,
      [`${P}.legal_notice_present`]: true,
      [`${P}.registration_number_shown`]: true,
      [`${P}.registration_number_matches`]: true,
    });
    expect(factMap(result)[`${P}.legal_notice_url`]).toBeUndefined();
  });
});

describe('web.policy_scan in Polish: language guessed from the words', () => {
  it('reads a page with no lang attribute', async () => {
    const pages: Pages = { ...robots, '/': { body: sample('site-pl-home.html') }, '/polityka-prywatnosci': { body: sample('site-pl-privacy.html') } };
    const result = await scan(site(pages), { name: 'Przykładowa Spółka z o.o.', jurisdiction: 'PL', registry_number: '0000999999' });
    expect(factMap(result)).toMatchObject({
      [`${P}.language`]: 'pl',
      [`${P}.language_supported`]: true,
      [`${P}.privacy_notice_found`]: true,
      [`${P}.names_company`]: true,
      [`${P}.rights_section`]: true,
      [`${P}.retention_statement`]: true,
      [`${P}.transfers_section`]: true,
      [`${P}.dpo_contact`]: true,
      [`${P}.children_section`]: true,
      [`${P}.dpa_named`]: true,
      [`${P}.dpa_countries`]: ['PL'],
      [`${P}.last_updated`]: '2026-01-15',
      [`${P}.terms_found`]: true,
      [`${P}.cookie_policy_found`]: true,
      [`${P}.legal_notice_present`]: true,
      [`${P}.registration_number_shown`]: true,
      [`${P}.registration_number_matches`]: true,
    });
  });
});

describe('web.policy_scan in Japanese: a language we do not read', () => {
  const pages: Pages = { ...robots, '/': { body: sample('site-ja-home.html') }, '/privacy': { body: sample('site-ja-privacy.html') } };

  it('reports what it finds, and never claims anything is missing', async () => {
    const result = await scan(site(pages), { name: 'サンプル株式会社', jurisdiction: 'JP' });
    expect(result.status).toBe('found');
    expect(result.message).toContain('Japanese');
    const facts = factMap(result);
    expect(facts).toMatchObject({
      [`${P}.language`]: 'ja',
      [`${P}.language_supported`]: false,
      [`${P}.privacy_notice_found`]: true,
      [`${P}.terms_found`]: true,
      [`${P}.dpa_named`]: true,
      [`${P}.dpa_countries`]: ['JP'],
    });
    expect(falseFacts(result)).toEqual([]);
    expect(facts[`${P}.rights_section`]).toBeUndefined();
    expect(facts[`${P}.legal_notice_present`]).toBeUndefined();
  });

  it('with no notice found, says it could not tell, and claims no gap', async () => {
    const result = await scan(site({ ...pages, '/privacy': { status: 404 } }), { name: 'サンプル株式会社', jurisdiction: 'JP' });
    expect(result.status).toBe('not_found');
    expect(result.message).toContain("couldn't tell whether it has a privacy notice");
    expect(factMap(result)[`${P}.privacy_notice_found`]).toBeUndefined();
    expect(falseFacts(result)).toEqual([]);
  });

  it('a page whose language we cannot tell claims no gap either', async () => {
    const result = await scan(site({ ...robots, '/': { body: '<html><body>OK</body></html>' } }), { name: 'X', jurisdiction: 'KE' });
    expect(result.message).toContain("couldn't tell which language");
    expect(factMap(result)[`${P}.language_supported`]).toBe(false);
    expect(falseFacts(result)).toEqual([]);
  });
});

describe('web.policy_scan when the footer is added by JavaScript', () => {
  it('claims nothing link-based is missing when no footer link is in the page', async () => {
    const home = '<html lang="de"><body><a href="#main">Zum Inhalt</a><a href="/produkte">Produkte</a><script src="/footer.js"></script></body></html>';
    const result = await scan(site({ ...robots, '/': { body: home } }), { name: 'X', jurisdiction: 'DE', registry_number: 'HRB 999999 B' });
    expect(result.status).toBe('not_found');
    expect(result.message).toContain('JavaScript');
    expect(factMap(result)).toMatchObject({ [`${P}.footer_links_found`]: false, [`${P}.language`]: 'de', [`${P}.language_supported`]: true });
    expect(falseFacts(result)).toEqual([]);
  });

  it('still reads a notice found at a usual address', async () => {
    const home = '<html lang="de"><body><a href="/produkte">Produkte</a></body></html>';
    const result = await scan(site({ ...robots, '/': { body: home }, '/datenschutz': { body: sample('site-de-privacy.html') } }), { name: 'Nordlicht Software GmbH', jurisdiction: 'DE' });
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({ [`${P}.privacy_notice_found`]: true, [`${P}.retention_statement`]: false, [`${P}.rights_section`]: true });
    expect(factMap(result)[`${P}.terms_found`]).toBeUndefined();
  });
});

describe('reading a notice directly', () => {
  it('reports nothing missing for an unknown language', () => {
    const facts = analysePolicy(htmlToText(sample('site-ja-privacy.html')), 'サンプル株式会社', { language: 'ja' });
    expect(facts.filter((f) => f.value === false)).toEqual([]);
  });

  it('finds the notice links in a page', () => {
    expect(extractLinks(sample('site-fr-home.html')).map((l) => l.href)).toContain('/mentions-legales');
  });
});

describe('fact keys', () => {
  it('every fact the scan can publish is a published key', async () => {
    const keys = new Set<string>(CONNECTOR_FACT_KEYS);
    const runs = [
      scan(site({ ...robots, '/': { body: sample('site-fr-home.html') }, '/politique-de-confidentialite': { body: sample('site-fr-privacy.html') }, '/mentions-legales': { body: sample('site-fr-legal.html') } }), { name: 'Fromagerie Belle Rive SAS', jurisdiction: 'FR', siren: '512345678' }),
      scan(site({ ...robots, '/': { body: sample('site-nl-home.html') } }), { name: 'X', jurisdiction: 'NL', registry_number: '99999999' }),
    ];
    for (const result of await Promise.all(runs)) {
      for (const f of result.facts) expect(keys.has(f.key), f.key).toBe(true);
    }
  });
});
