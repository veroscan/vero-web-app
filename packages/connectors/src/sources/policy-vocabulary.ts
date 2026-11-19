/**
 * Words the website scan (`web.policy_scan`, policy-scan.ts) looks for, per language. This file
 * is data only: a word can be added, removed or corrected here without touching the logic.
 *
 * How a word (a "term") is matched:
 * - Case and accents don't matter: "Confidentialité", "confidentialite" and "CONFIDENTIALITE"
 *   are the same. Write words in their natural spelling, accents included. German umlauts and
 *   Nordic letters also match their two-letter spellings in web addresses ("Geschäft" matches
 *   "geschaeft", "ø" matches "oe", "å" matches "aa").
 * - Spaces, hyphens, slashes and apostrophes between words may be anything that isn't a letter,
 *   or nothing: "mentions légales" matches "Mentions légales", "/mentions-legales" and
 *   "mentionslegales".
 * - A term matches whole words only. A `*` at the end of a word lets that word run on
 *   ("Datenschutz*" matches "Datenschutzerklärung"); a `*` at the start lets the first word
 *   start anywhere ("*bedingungen" matches "Nutzungsbedingungen").
 * - A short term written all in capitals ("AGB", "HRB", "ICO": three letters or fewer) must
 *   be in capitals in the page's text, so the German word "ein" could never be read as "EIN".
 *   In web addresses case never matters. Write a short term in lower case to match any case.
 * - Link words are checked against the link's text and its address (path only, never the
 *   host name, so a link to a regulator's website isn't taken for the company's own page).
 * - English keeps the regular expressions the scan has always used (`RegExp` entries), so
 *   English results don't change. They are tested against the original text.
 *
 * What a missing word means: a "not found" (false) fact is only ever published when the page
 * is in a language listed in SUPPORTED_LANGUAGES and that fact has a word list for the
 * language here (or `everyLanguage`). Otherwise the fact is left out, and the rules read it as
 * unknown. So a language with no list for a fact can never produce a false gap. Add a list
 * here only when you are confident it covers how sites in that language say it.
 */

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'da', 'no', 'sv', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Language tags that mean one of ours (`nb` and `nn` are written Norwegian). */
export const LANGUAGE_ALIASES: Readonly<Record<string, Language>> = { nb: 'no', nn: 'no' };

/**
 * Languages close enough that a page in one is read with the others' words too, so a
 * Norwegian page taken for Danish (they share most short words) still gets every check.
 */
export const LANGUAGE_FAMILIES: readonly (readonly Language[])[] = [['da', 'no', 'sv'], ['cs', 'sk'], ['es', 'pt']];

/**
 * Common short words, used to guess a page's language when it doesn't say. Only words that
 * are frequent in the language and rare elsewhere are useful here.
 */
export const STOPWORDS: Readonly<Record<Language, readonly string[]>> = {
  en: ['the', 'and', 'of', 'to', 'with', 'your', 'our', 'we', 'you', 'for', 'this', 'that', 'is', 'are', 'which', 'will', 'from', 'have', 'by'],
  fr: ['le', 'les', 'des', 'et', 'est', 'une', 'du', 'pour', 'vous', 'nous', 'avec', 'dans', 'sur', 'qui', 'aux', 'ce', 'vos', 'nos', 'sont', 'votre', 'notre'],
  de: ['der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'von', 'sie', 'wir', 'ihre', 'für', 'auf', 'den', 'dem', 'eine', 'zu', 'werden', 'oder', 'auch', 'sich'],
  es: ['el', 'los', 'las', 'del', 'y', 'para', 'con', 'por', 'una', 'sus', 'usted', 'nuestro', 'nuestra', 'este', 'esta', 'como', 'pero', 'más', 'también', 'puede'],
  it: ['il', 'gli', 'della', 'delle', 'dei', 'di', 'che', 'per', 'sono', 'non', 'alla', 'nel', 'questo', 'nostro', 'nostri', 'vostri', 'tuoi', 'dati', 'essere', 'anche'],
  pt: ['os', 'das', 'dos', 'em', 'um', 'uma', 'para', 'com', 'você', 'seus', 'sua', 'não', 'são', 'ao', 'pelo', 'pela', 'também', 'nossa', 'nosso', 'mais'],
  nl: ['het', 'een', 'en', 'van', 'voor', 'zijn', 'wij', 'uw', 'jouw', 'niet', 'op', 'dat', 'deze', 'ook', 'worden', 'naar', 'bij', 'om', 'wordt', 'je'],
  da: ['og', 'er', 'til', 'af', 'det', 'med', 'vi', 'din', 'dine', 'ikke', 'som', 'på', 'hvis', 'eller', 'vores', 'jeres', 'hvad', 'kan', 'har', 'jer'],
  no: ['og', 'er', 'til', 'av', 'det', 'med', 'vi', 'din', 'dine', 'ikke', 'som', 'på', 'hvis', 'eller', 'våre', 'deg', 'hva', 'kan', 'har', 'ditt'],
  sv: ['och', 'att', 'det', 'som', 'är', 'av', 'för', 'med', 'till', 'vi', 'dina', 'inte', 'eller', 'om', 'har', 'våra', 'vår', 'du', 'dig', 'kan'],
  fi: ['ja', 'on', 'tai', 'sekä', 'että', 'joka', 'jos', 'ovat', 'tietoja', 'meidän', 'sinun', 'kanssa', 'voit', 'mukaan', 'myös', 'tämä', 'ei', 'olla', 'sinua'],
  pl: ['w', 'z', 'na', 'jest', 'się', 'do', 'nie', 'oraz', 'lub', 'dla', 'przez', 'ze', 'są', 'które', 'jak', 'od', 'po', 'danych', 'twoje'],
  cs: ['je', 'se', 'na', 'v', 'z', 'pro', 'jsou', 'nebo', 'které', 'jak', 'podle', 'vám', 'vás', 'naše', 'také', 'byl', 'jako', 'jsme', 'už'],
  sk: ['je', 'sa', 'na', 'v', 'z', 'pre', 'sú', 'alebo', 'ktoré', 'ako', 'podľa', 'vám', 'vás', 'naše', 'tiež', 'bol', 'sme', 'aj', 'už'],
  hu: ['a', 'az', 'és', 'hogy', 'nem', 'egy', 'van', 'meg', 'vagy', 'ezt', 'mint', 'csak', 'ön', 'önnek', 'adatok', 'amely', 'kell', 'lehet', 'szerint'],
  ro: ['și', 'de', 'la', 'în', 'cu', 'pentru', 'care', 'este', 'sau', 'nu', 'sunt', 'dumneavoastră', 'noastre', 'datele', 'ale', 'să', 'pe', 'din', 'vă'],
};

export type Terms = readonly (string | RegExp)[];

export interface Vocabulary {
  /**
   * Words per language. An empty list means "the English expression already covers this
   * language" (for example "cookie" in "politique de cookies"), so a miss can be reported.
   */
  terms: Partial<Record<Language, Terms>>;
  /** The English words are how this is said on every site, whatever its language (US "Do Not Sell" links). */
  everyLanguage?: true;
}

/** Links on the home page (text or address). Keys are the facts' own names. */
export const LINK_VOCABULARY = {
  privacy: {
    terms: {
      en: [/privacy/i],
      fr: ['confidentialité*', 'données personnelles', 'données à caractère personnel', 'protection des données', 'vie privée', 'RGPD'],
      de: ['Datenschutz*', 'Privatsphäre*', 'DSGVO'],
      es: ['privacidad', 'aviso de privacidad', 'protección de datos', 'datos personales'],
      it: ['informativa privacy', 'riservatezza', 'protezione dei dati', 'dati personali', 'trattamento dei dati'],
      pt: ['privacidade', 'proteção de dados', 'dados pessoais', 'LGPD', 'RGPD'],
      nl: ['gegevensbescherming', 'persoonsgegevens', 'AVG'],
      da: ['privatliv*', 'persondata*', 'databeskyttelse*'],
      no: ['personvern*', 'personopplysning*'],
      sv: ['integritet*', 'personuppgift*', 'dataskydd*', 'GDPR'],
      fi: ['tietosuoja*', 'yksityisyy*', 'henkilötie*'],
      pl: ['prywatnoś*', 'ochrona danych', 'ochrony danych', 'RODO', 'dane osobowe', 'danych osobowych'],
      cs: ['ochrana osobních údajů', 'osobní údaje', 'osobních údajů', 'soukromí', 'GDPR'],
      sk: ['ochrana osobných údajov', 'osobné údaje', 'osobných údajov', 'súkromi*', 'GDPR'],
      hu: ['adatvédel*', 'adatkezel*', 'személyes adat*'],
      ro: ['confidențialitate*', 'protecția datelor', 'date personale', 'datelor cu caracter personal', 'GDPR'],
    },
  },
  cookie_policy_found: {
    everyLanguage: true,
    terms: {
      en: [/cookie/i],
      fr: ['traceurs'],
      fi: ['eväste*'],
      no: ['informasjonskapsl*'],
      sv: ['kakor', 'kakpolicy'],
      pl: ['ciasteczk*'],
      hu: ['süti*'],
    },
  },
  terms_found: {
    terms: {
      en: [/terms|conditions|\btos\b/i],
      fr: ['conditions générales*', 'CGU', 'CGV'],
      de: ['AGB', '*bedingungen'],
      es: ['términos*', 'condiciones*'],
      it: ['termini*', 'condizioni*'],
      pt: ['termos*', 'condições*'],
      nl: ['*voorwaarden'],
      da: ['*vilkår*', '*betingelser'],
      no: ['*vilkår*', '*betingelser'],
      sv: ['*villkor*'],
      fi: ['*ehdot'],
      pl: ['regulamin*', 'warunki*'],
      cs: ['*podmínky', 'VOP'],
      sk: ['*podmienky', 'VOP'],
      hu: ['ÁSZF', '*feltételek'],
      ro: ['termeni*', 'condiții*'],
    },
  },
  refund_policy_found: {
    terms: {
      en: [/refund|cancellation|returns/i],
      fr: ['remboursement*', 'rétractation', 'droit de rétractation', 'retours', 'politique de retour*', 'annulation*'],
      de: ['Widerruf*', 'Rückgabe*', 'Rücksendung*', 'Erstattung*', 'Rückerstattung*', 'Stornierung*'],
      es: ['reembolso*', 'devoluci*', 'desistimiento', 'cancelaci*'],
      it: ['rimborso', 'rimborsi', 'resi', 'reso', 'recesso', 'diritto di recesso', 'annullamento'],
      pt: ['reembolso*', 'devoluç*', 'trocas', 'cancelamento*', 'livre resolução', 'arrependimento'],
      nl: ['retour*', 'terugbetaling*', 'herroeping*', 'annuler*'],
      da: ['retur*', 'fortrydelse*', 'refusion*', 'annullering*'],
      no: ['retur*', 'angrerett*', 'refusjon*', 'avbestilling*'],
      sv: ['retur*', 'ångerrätt*', 'återbetalning*', 'avbokning*'],
      fi: ['palautu*', 'palautus*', 'peruutus*', 'hyvitys*'],
      pl: ['zwrot*', 'odstąpieni*'],
      cs: ['vrácení*', 'odstoupení*', 'storno*'],
      sk: ['vrátenie*', 'odstúpenie*', 'storno*'],
      hu: ['visszatérítés*', 'elállás*', 'visszaküldés*'],
      ro: ['rambursar*', 'retur*', 'returnar*', 'anular*'],
    },
  },
  complaints_policy_found: {
    terms: {
      en: [/complaint/i],
      fr: ['réclamation*', 'plainte*'],
      de: ['Beschwerde*', 'Reklamation*'],
      es: ['reclamaci*', 'queja*'],
      it: ['reclami', 'reclamo', 'reclamazion*'],
      pt: ['reclamaç*', 'queixa*'],
      nl: ['klacht*'],
      da: ['klage*'],
      no: ['klage*'],
      sv: ['klagomål*', 'reklamation*'],
      fi: ['reklamaatio*', 'valitus*'],
      pl: ['reklamacj*', 'skarg*'],
      cs: ['reklamac*', 'stížnost*'],
      sk: ['reklamác*', 'sťažnos*'],
      hu: ['panasz*'],
      ro: ['reclamați*', 'plângeri*'],
    },
  },
  acceptable_use_found: {
    terms: {
      en: [/acceptable.?use/i],
      fr: ['utilisation acceptable', "charte d'utilisation", "règles d'utilisation"],
      de: ['Nutzungsrichtlinie*', 'zulässige Nutzung', 'akzeptable Nutzung'],
      es: ['uso aceptable'],
      it: ['uso accettabile', 'utilizzo accettabile'],
      pt: ['uso aceitável', 'utilização aceitável'],
      nl: ['aanvaardbaar gebruik', 'acceptabel gebruik'],
      da: ['acceptabel brug'],
      no: ['akseptabel bruk'],
      sv: ['acceptabel användning'],
      fi: ['hyväksyttävä käyttö', 'hyväksyttävän käytön'],
      pl: ['dopuszczalne użytkowanie'],
      cs: ['přijatelné použití', 'zásady používání'],
    },
  },
  accessibility_found: {
    terms: {
      en: [/accessib/i],
      fr: [],
      it: [],
      de: ['Barrierefreiheit*', 'barrierefrei*'],
      es: ['accesibilidad'],
      pt: ['acessibilidade'],
      nl: ['toegankelijkheid*'],
      da: ['tilgængelighed*'],
      no: ['tilgjengelighet*'],
      sv: ['tillgänglighet*'],
      fi: ['saavutettavuus*'],
      pl: ['dostępnoś*'],
      cs: ['přístupnost*'],
      sk: ['prístupnos*'],
      hu: ['akadálymentes*'],
      ro: ['accesibilitate'],
    },
  },
  eula_found: {
    terms: {
      en: [/\beula\b|end.?user|licen[cs]e agreement/i],
      fr: ['contrat de licence*', "licence d'utilisateur final", 'CLUF'],
      de: ['Endbenutzer*', 'Lizenzvertrag*', 'Lizenzbedingungen', 'Lizenzvereinbarung*'],
      es: ['acuerdo de licencia', 'contrato de licencia'],
      it: ['contratto di licenza', 'accordo di licenza'],
      pt: ['contrato de licença', 'acordo de licença'],
      nl: ['licentieovereenkomst*', 'eindgebruiker*'],
      da: ['licensaftale*', 'slutbruger*'],
      no: ['lisensavtale*', 'sluttbruker*'],
      sv: ['licensavtal*', 'slutanvändar*'],
      fi: ['käyttöoikeussopimu*', 'lisenssisopimu*', 'loppukäyttäj*'],
      pl: ['umowa licencyjna', 'umowy licencyjnej'],
      cs: ['licenční smlouva', 'licenční ujednání'],
      sk: ['licenčná zmluva'],
      hu: ['licencszerződés*', 'végfelhasználói*'],
      ro: ['acord de licență', 'contract de licență'],
    },
  },
  takedown_policy_found: {
    terms: {
      en: [/takedown|take.?down|content (policy|moderation)|community guidelines/i],
      fr: ['signaler un contenu', 'contenus illicites', 'contenu illicite', 'règles de la communauté', 'modération*'],
      de: ['Inhalte melden', 'rechtswidrige Inhalte', 'Community-Richtlinien', 'Gemeinschaftsrichtlinien', 'Meldeverfahren'],
      es: ['normas de la comunidad', 'denunciar contenido', 'contenido ilícito', 'moderación de contenido*'],
      it: ['linee guida della community', 'segnala contenuti', 'segnalazione contenuti', 'contenuti illeciti', 'moderazione*'],
      pt: ['diretrizes da comunidade', 'denunciar conteúdo', 'conteúdo ilegal', 'moderação de conteúdo*'],
      nl: ['communityrichtlijnen', 'inhoud melden', 'illegale inhoud', 'moderatie*'],
      da: ['retningslinjer for fællesskabet', 'ulovligt indhold', 'anmeld indhold'],
      no: ['retningslinjer for fellesskapet', 'ulovlig innhold', 'rapporter innhold'],
      sv: ['communityriktlinjer', 'olagligt innehåll', 'anmäl innehåll'],
      fi: ['yhteisön säännöt', 'yhteisöohjeet', 'laiton sisältö', 'ilmoita sisällöstä'],
      pl: ['zasady społeczności', 'nielegalne treści', 'zgłoś treść', 'zgłaszanie treści'],
      cs: ['zásady komunity', 'nezákonný obsah', 'nahlásit obsah'],
    },
  },
  opt_out_link: {
    everyLanguage: true,
    terms: {
      en: [/opt.?out|do not sell|your privacy choices/i],
      fr: ['ne pas vendre mes'],
      es: ['no vender mi*', 'no vendan mi*'],
    },
  },
  ccpa_links: {
    everyLanguage: true,
    terms: { en: [/do not sell|your privacy choices/i] },
  },
  ai_disclosure_found: {
    terms: {
      en: [/\bai\b|artificial intelligence/i],
      fr: ['intelligence artificielle', 'IA'],
      de: ['künstliche Intelligenz', 'KI'],
      es: ['inteligencia artificial', 'IA'],
      it: ['intelligenza artificiale'],
      pt: ['inteligência artificial', 'IA'],
      nl: ['kunstmatige intelligentie'],
      da: ['kunstig intelligens'],
      no: ['kunstig intelligens', 'KI'],
      sv: ['artificiell intelligens'],
      fi: ['tekoäly*'],
      pl: ['sztuczna inteligencja', 'sztucznej inteligencji'],
      cs: ['umělá inteligence', 'umělé inteligence'],
      sk: ['umelá inteligencia', 'umelej inteligencie'],
      hu: ['mesterséges intelligencia'],
      ro: ['inteligență artificială', 'inteligența artificială'],
    },
  },
  /** The legal notice: mentions légales, Impressum and their equivalents. */
  legal_notice: {
    terms: {
      en: ['legal notice*', 'legal information', 'legal disclosure*', 'legal mentions', 'imprint', 'site notice', 'company information', 'company details', 'Impressum'],
      fr: ['mentions légales', 'mention légale', 'informations légales'],
      de: ['Impressum', 'Anbieterkennzeichnung', 'Offenlegung*'],
      es: ['aviso legal', 'información legal', 'nota legal'],
      it: ['note legali', 'informazioni legali', 'dati societari', 'colophon'],
      pt: ['aviso legal', 'informação legal', 'informações legais', 'nota legal'],
      nl: ['colofon', 'juridische informatie', 'bedrijfsgegevens', 'Impressum'],
      da: ['kolofon', 'virksomhedsoplysninger', 'Impressum'],
      no: ['kolofon', 'juridisk informasjon', 'selskapsinformasjon', 'Impressum'],
      sv: ['juridisk information', 'företagsinformation', 'Impressum'],
      fi: ['oikeudelliset tiedot', 'yritystiedot', 'Impressum'],
      pl: ['nota prawna', 'informacje prawne', 'dane firmy', 'dane spółki', 'Impressum'],
      cs: ['právní informace', 'právní upozornění', 'tiráž', 'Impressum'],
      sk: ['právne informácie', 'tiráž', 'Impressum'],
      hu: ['impresszum', 'jogi nyilatkozat', 'jogi információk'],
      ro: ['informații legale', 'mențiuni legale', 'date de identificare', 'Impressum'],
    },
  },
} as const satisfies Record<string, Vocabulary>;

export type LinkCheck = keyof typeof LINK_VOCABULARY;

/**
 * Words on a cookie link that only opens the consent tool ("Cookie settings"). Such a link
 * (one that leads to no page) isn't counted as a cookie policy. Any language: a word here
 * only stops a link counting, it never reports anything missing.
 */
export const COOKIE_SETTINGS_WORDS: Terms = [
  'settings', 'preferences', 'manage*', 'paramètres', 'gérer', 'préférences', 'Einstellungen', 'verwalten', 'instellingen', 'voorkeuren',
  'configuración', 'preferencias', 'gestionar', 'impostazioni', 'preferenze', 'gestisci', 'configurações', 'preferências', 'gerir',
  'indstillinger', 'innstillinger', 'inställningar', 'asetukset', 'ustawienia', 'nastavení', 'nastavenia', 'beállítások', 'setări',
];

/** Where a notice usually lives when the home page has no link, tried after the English paths. At most two each, to keep requests few. */
export const PRIVACY_PATHS: Partial<Record<Language, readonly string[]>> = {
  fr: ['/politique-de-confidentialite', '/confidentialite'],
  de: ['/datenschutz', '/datenschutzerklaerung'],
  es: ['/politica-de-privacidad', '/privacidad'],
  it: ['/informativa-privacy', '/privacy-policy'],
  pt: ['/politica-de-privacidade', '/privacidade'],
  nl: ['/privacyverklaring', '/privacybeleid'],
  da: ['/privatlivspolitik', '/persondatapolitik'],
  no: ['/personvern', '/personvernerklaering'],
  sv: ['/integritetspolicy', '/personuppgiftspolicy'],
  fi: ['/tietosuojaseloste', '/tietosuoja'],
  pl: ['/polityka-prywatnosci'],
  cs: ['/ochrana-osobnich-udaju', '/zasady-ochrany-osobnich-udaju'],
  sk: ['/ochrana-osobnych-udajov'],
  hu: ['/adatvedelem', '/adatkezelesi-tajekoztato'],
  ro: ['/politica-de-confidentialitate'],
};

/** What the privacy notice itself says. */
export const NOTICE_VOCABULARY = {
  rights_section: {
    terms: {
      en: [/your (data protection |privacy )?rights|right to (access|erasure|delete|object|rectif|correct)/i],
      fr: ['vos droits', "droit d'accès", 'droit de rectification', "droit à l'effacement", "droit d'opposition"],
      de: ['Ihre Rechte', 'deine Rechte', 'Betroffenenrecht*', 'Recht auf Auskunft', 'Auskunftsrecht*', 'Recht auf Löschung', 'Widerspruchsrecht*'],
      es: ['sus derechos', 'tus derechos', 'derecho de acceso', 'derecho de supresión', 'derechos ARCO', 'derecho de oposición'],
      it: ['i tuoi diritti', 'i suoi diritti', "diritti dell'interessato", 'diritto di accesso', 'diritto alla cancellazione', 'diritto di opposizione'],
      pt: ['os seus direitos', 'seus direitos', 'direito de acesso', 'direito ao apagamento', 'direito de oposição', 'direitos do titular'],
      nl: ['uw rechten', 'jouw rechten', 'je rechten', 'recht op inzage', 'recht op verwijdering', 'recht van bezwaar', 'recht op bezwaar'],
      da: ['dine rettigheder', 'ret til indsigt', 'ret til sletning', 'ret til berigtigelse'],
      no: ['dine rettigheter', 'rett til innsyn', 'rett til sletting', 'rett til retting'],
      sv: ['dina rättigheter', 'rätt till tillgång', 'rätt till radering', 'registerutdrag'],
      fi: ['rekisteröidyn oikeudet', 'oikeutesi', 'tarkastusoikeus', 'oikeus tarkastaa', 'oikeus saada tiedot', 'oikeus vaatia'],
      pl: ['twoje prawa', 'prawo dostępu', 'prawo do usunięcia', 'prawo do sprzeciwu', 'przysługujące prawa', 'przysługują prawa'],
      cs: ['vaše práva', 'právo na přístup', 'právo na výmaz', 'práva subjektu údajů', 'právo vznést námitku'],
      sk: ['vaše práva', 'právo na prístup', 'právo na vymazanie', 'práva dotknutej osoby', 'právo namietať'],
      hu: ['az ön jogai', 'érintett jogai', 'hozzáférési jog*', 'törléshez való jog', 'tiltakozáshoz való jog'],
      ro: ['drepturile dumneavoastră', 'drepturile tale', 'dreptul de acces', 'dreptul la ștergere', 'dreptul de opoziție'],
    },
  },
  retention_statement: {
    terms: {
      en: [/retention|retain |how long we keep|we keep your/i],
      fr: ['durée de conservation', 'durées de conservation', 'conservons', 'conservées', 'conservés', 'conservation des données'],
      de: ['Speicherdauer', 'Aufbewahrung*', 'Dauer der Speicherung', 'Löschfrist*', 'speichern wir', 'gespeichert, solange', 'wie lange'],
      es: ['plazo de conservación', 'plazos de conservación', 'periodo de conservación', 'período de conservación', 'conservaremos', 'conservarán', 'durante cuánto tiempo'],
      it: ['periodo di conservazione', 'tempi di conservazione', 'conservazione dei dati', 'conserveremo', 'conservati per'],
      pt: ['prazo de conservação', 'período de conservação', 'conservação dos dados', 'retenção', 'por quanto tempo', 'conservaremos'],
      nl: ['bewaartermijn*', 'bewaren', 'bewaard', 'hoe lang'],
      da: ['opbevaring*', 'opbevarer', 'opbevares', 'slettes'],
      no: ['lagringstid', 'oppbevaring*', 'lagrer', 'lagres', 'slettes'],
      sv: ['lagringstid', 'sparar', 'sparas', 'lagras', 'hur länge', 'gallras'],
      fi: ['säilytysaika', 'säilytämme', 'säilytetään', 'säilyttäminen'],
      pl: ['okres przechowywania', 'przechowujemy', 'przechowywane', 'przez jaki czas'],
      cs: ['doba uchovávání', 'uchováváme', 'uchovávány', 'po dobu'],
      sk: ['doba uchovávania', 'uchovávame', 'uchovávané', 'po dobu'],
      hu: ['megőrzési idő*', 'tároljuk', 'megőrizzük', 'adatkezelés időtartama'],
      ro: ['perioada de stocare', 'perioada de păstrare', 'păstrăm', 'stocăm'],
    },
  },
  transfers_section: {
    terms: {
      en: [/international transfer|transfer(red)? outside|outside (of )?(the )?(uk|eea|nigeria|united kingdom|united states)|cross-border/i],
      fr: ['transfert*', "hors de l'Union européenne", "en dehors de l'Union européenne", "hors de l'UE", 'hors UE', "hors de l'EEE", 'pays tiers'],
      de: ['Drittland', 'Drittländer*', 'Drittstaat*', 'außerhalb der EU', 'außerhalb des EWR', 'außerhalb der Europäischen'],
      es: ['transferencia internacional', 'transferencias internacionales', 'terceros países', 'fuera del EEE', 'fuera de la UE', 'fuera de la Unión'],
      it: ['trasferimento', 'trasferimenti', 'paesi terzi', "al di fuori dell'UE", "al di fuori dello Spazio", 'extra UE', 'extra-UE'],
      pt: ['transferência internacional', 'transferências internacionais', 'países terceiros', 'fora do EEE', 'fora da UE', 'fora da União'],
      nl: ['doorgifte', 'derde landen', 'buiten de EER', 'buiten de EU', 'buiten de Europese'],
      da: ['overførsel*', 'tredjelande', 'uden for EU', 'uden for EØS'],
      no: ['overføring*', 'tredjeland', 'utenfor EU', 'utenfor EØS'],
      sv: ['överföring*', 'tredjeland', 'utanför EU', 'utanför EES'],
      fi: ['kolmansiin maihin', 'kolmanteen maahan', 'EU:n ulkopuolelle', 'ETA:n ulkopuolelle', 'tietojen siirto*'],
      pl: ['przekazywanie danych', 'państw trzecich', 'państwa trzeciego', 'poza EOG', 'poza UE', 'poza Europejski'],
      cs: ['předávání', 'třetích zemí', 'třetí země', 'mimo EU', 'mimo EHP'],
      sk: ['prenos*', 'tretích krajín', 'tretej krajiny', 'mimo EÚ', 'mimo EHP'],
      hu: ['harmadik ország*', 'EGT-n kívül', 'EU-n kívül', 'adattovábbítás*'],
      ro: ['transfer*', 'țări terțe', 'în afara UE', 'în afara SEE', 'în afara Uniunii'],
    },
  },
  dpo_contact: {
    terms: {
      en: [/data protection officer|\bdpo\b/i],
      fr: ['délégué à la protection des données', 'déléguée à la protection des données', 'responsable de la protection des données', 'DPD'],
      de: ['Datenschutzbeauftragt*'],
      es: ['delegado de protección de datos', 'DPD'],
      it: ['responsabile della protezione dei dati', 'RPD'],
      pt: ['encarregado da proteção de dados', 'encarregado de proteção de dados', 'encarregado de dados', 'encarregado pelo tratamento'],
      nl: ['functionaris voor de gegevensbescherming', 'functionaris gegevensbescherming', 'privacy officer'],
      da: ['databeskyttelsesrådgiver*'],
      no: ['personvernombud*'],
      sv: ['dataskyddsombud*'],
      fi: ['tietosuojavastaava*'],
      pl: ['inspektor* ochrony danych', 'IOD'],
      cs: ['pověřenec*'],
      sk: ['zodpovedná osoba', 'zodpovednej osoby', 'zodpovednú osobu'],
      hu: ['adatvédelmi tisztviselő*'],
      ro: ['responsabil cu protecția datelor', 'responsabilul cu protecția datelor'],
    },
  },
  children_section: {
    terms: {
      en: [/children|under (the age of )?1[368]\b/i],
      fr: ['enfant*', 'mineur*', 'moins de 15 ans', 'moins de 16 ans', 'moins de 18 ans'],
      de: ['Kinder*', 'minderjährig*', 'unter 16 Jahren', 'unter 18 Jahren'],
      es: ['menores', 'niños', 'menores de edad'],
      it: ['minori', 'bambini'],
      pt: ['menores', 'crianças'],
      nl: ['kinderen', 'minderjarig*'],
      da: ['børn', 'mindreårig*'],
      no: ['barn', 'mindreårig*'],
      sv: ['barn', 'minderårig*'],
      fi: ['lapset', 'lasten', 'alaikäi*'],
      pl: ['dzieci', 'małoletni*', 'nieletni*'],
      cs: ['děti', 'dětí', 'nezletil*'],
      sk: ['deti', 'detí', 'maloletý*', 'neplnoletý*'],
      hu: ['gyermek*', 'kiskorú*'],
      ro: ['copii', 'copiilor', 'minori', 'minorilor'],
    },
  },
  /** Counts toward `ai_disclosure_found`, read from the notice. */
  automated_decisions: {
    terms: {
      en: [/artificial intelligence|automated decision/i],
      fr: ['décision automatisée', 'décisions automatisées', 'décision individuelle automatisée', 'intelligence artificielle'],
      de: ['automatisierte Entscheidung*', 'künstliche Intelligenz', 'künstlicher Intelligenz'],
      es: ['decisiones automatizadas', 'decisión automatizada', 'decisiones individuales automatizadas', 'inteligencia artificial'],
      it: ['decisioni automatizzate', 'decisione automatizzata', 'processo decisionale automatizzato', 'intelligenza artificiale'],
      pt: ['decisões automatizadas', 'decisão automatizada', 'decisões individuais automatizadas', 'inteligência artificial'],
      nl: ['geautomatiseerde besluitvorming', 'geautomatiseerde besluiten', 'kunstmatige intelligentie'],
      da: ['automatiske afgørelser', 'automatisk afgørelse', 'kunstig intelligens'],
      no: ['automatiserte avgjørelser', 'automatisert avgjørelse', 'kunstig intelligens'],
      sv: ['automatiserat beslutsfattande', 'automatiserade beslut', 'artificiell intelligens'],
      fi: ['automaattinen päätöksenteko', 'automaattista päätöksentekoa', 'automatisoitu päätöksenteko', 'tekoäly*'],
      pl: ['zautomatyzowane podejmowanie decyzji', 'zautomatyzowanym podejmowaniu decyzji', 'sztuczna inteligencja', 'sztucznej inteligencji'],
      cs: ['automatizované rozhodování', 'automatizovanému rozhodování', 'umělá inteligence', 'umělé inteligence'],
      sk: ['automatizované rozhodovanie', 'automatizovanom rozhodovaní', 'umelá inteligencia', 'umelej inteligencie'],
      hu: ['automatizált döntéshozatal', 'automatizált döntés*', 'mesterséges intelligencia'],
      ro: ['decizii automatizate', 'decizie automatizată', 'decizii individuale automatizate', 'inteligență artificială'],
    },
  },
} as const satisfies Record<string, Vocabulary>;

export type NoticeCheck = keyof typeof NOTICE_VOCABULARY;

/**
 * Representatives and points of contact (added 18 Nov 2026), read from the privacy notice, the
 * legal notice, a Digital Services Act page and the home page:
 * - `eu_representative_named`: an EU representative under GDPR art 27 (art 13(1)(a) puts the
 *   representative's identity and contact details in the notice);
 * - `uk_representative_named`: a UK representative under UK GDPR art 27;
 * - `dsa_contact_point_named`: a single point of contact under DSA art 11 or 12;
 * - `dsa_legal_representative_named`: a legal representative under DSA art 13.
 * Phrases only, never a lone "representative" or "point of contact": those words are common in
 * notices for other things. The phrases are how notices usually put it, not copied from each
 * official translation, so a miss here is weaker than for the notice checks above. A miss is only
 * reported on the conditions in policy-scan.ts (every page found was read, in a supported language).
 */
export const REPRESENTATIVE_VOCABULARY = {
  eu_representative_named: {
    terms: {
      en: ['EU representative', 'EU GDPR representative', 'GDPR representative', 'representative in the EU', 'representative in the European Union', 'representative within the EU', 'representative within the European Union', 'representative in the Union', 'EEA representative', 'representative in the EEA', 'European representative', 'Art* 27 representative', 'representative under Art* 27', 'representative pursuant to Art* 27'],
      fr: ["représentant dans l'Union", "représentant dans l'UE", "représentant au sein de l'Union", "représentant au sein de l'UE", 'représentant européen', 'représentant UE', "représentant de l'UE", 'représentant RGPD', "représentant au titre de l'article 27"],
      de: ['EU-Vertreter*', 'Vertreter in der Union', 'Vertreter in der EU', 'Vertreter in der Europäischen Union', 'Vertreter nach Art* 27', 'Vertreter gemäß Art* 27', 'EU-Datenschutzvertreter*', 'Datenschutzvertreter*'],
      es: ['representante en la Unión', 'representante en la UE', 'representante en la Unión Europea', 'representante de la UE', 'representante europeo', 'representante en el EEE'],
      it: ["rappresentante nell'Unione", "rappresentante nell'UE", "rappresentante nell'Unione europea", 'rappresentante UE', 'rappresentante europeo', "rappresentante designato ai sensi dell'articolo 27"],
      pt: ['representante na União', 'representante na UE', 'representante na União Europeia', 'representante da UE', 'representante europeu'],
      nl: ['vertegenwoordiger in de Unie', 'vertegenwoordiger in de EU', 'vertegenwoordiger in de Europese Unie', 'EU-vertegenwoordiger*'],
      da: ['repræsentant i EU', 'repræsentant i Unionen', 'EU-repræsentant*'],
      no: ['representant i EU', 'representant i EØS', 'representant i Unionen', 'EU-representant*'],
      sv: ['företrädare i unionen', 'företrädare i EU', 'EU-företrädare', 'representant i EU'],
      fi: ['edustaja unionissa', 'edustaja EU:ssa', 'EU-edustaja*'],
      pl: ['przedstawiciel w Unii', 'przedstawiciel w UE', 'przedstawiciela w Unii', 'przedstawiciela w UE', 'przedstawiciel w Unii Europejskiej'],
      cs: ['zástupce v Unii', 'zástupce v EU', 'zástupce v Evropské unii'],
      sk: ['zástupca v Únii', 'zástupca v EÚ', 'zástupcu v Únii', 'zástupcu v EÚ'],
      hu: ['uniós képviselő*', 'EU-képviselő*', 'képviselő az Unióban', 'képviselője az Unióban'],
      ro: ['reprezentant în Uniune', 'reprezentant în UE', 'reprezentantul în Uniune', 'reprezentantul în UE', 'reprezentantul nostru în UE'],
    },
  },
  uk_representative_named: {
    terms: {
      en: ['UK representative', 'UK GDPR representative', 'representative in the UK', 'representative in the United Kingdom', 'representative within the UK', 'United Kingdom representative', 'UK Art* 27 representative'],
      fr: ['représentant au Royaume-Uni', 'représentant britannique'],
      de: ['Vertreter im Vereinigten Königreich', 'Vertreter in Großbritannien', 'UK-Vertreter*'],
      es: ['representante en el Reino Unido'],
      it: ['rappresentante nel Regno Unito'],
      pt: ['representante no Reino Unido'],
      nl: ['vertegenwoordiger in het Verenigd Koninkrijk', 'UK-vertegenwoordiger*'],
      da: ['repræsentant i Storbritannien', 'repræsentant i Det Forenede Kongerige', 'repræsentant i UK'],
      no: ['representant i Storbritannia', 'representant i Det forente kongerike', 'representant i UK'],
      sv: ['företrädare i Storbritannien', 'företrädare i Förenade kungariket', 'representant i Storbritannien'],
      fi: ['edustaja Yhdistyneessä kuningaskunnassa', 'edustaja Isossa-Britanniassa'],
      pl: ['przedstawiciel w Wielkiej Brytanii', 'przedstawiciel w Zjednoczonym Królestwie', 'przedstawiciela w Wielkiej Brytanii'],
      cs: ['zástupce ve Spojeném království', 'zástupce ve Velké Británii'],
      sk: ['zástupca v Spojenom kráľovstve', 'zástupca vo Veľkej Británii'],
      hu: ['képviselő az Egyesült Királyságban', 'képviselője az Egyesült Királyságban'],
      ro: ['reprezentant în Regatul Unit', 'reprezentantul în Regatul Unit'],
    },
  },
  dsa_contact_point_named: {
    terms: {
      en: ['single point of contact', 'single points of contact', 'single contact point', 'DSA point of contact', 'DSA contact point', 'point of contact under the Digital Services Act', 'point of contact under the DSA', 'points of contact under the DSA', 'contact point under the Digital Services Act', 'point of contact for Member State authorities', 'point of contact for recipients of the service'],
      fr: ['point de contact unique', 'points de contact uniques', 'point de contact DSA', 'point de contact au titre du DSA', 'point de contact pour les autorités', 'point de contact pour les destinataires du service'],
      de: ['zentrale Kontaktstelle*', 'einheitliche Kontaktstelle*', 'Kontaktstelle für Behörden', 'Kontaktstelle für Nutzer*', 'Kontaktstelle für die Nutzer*', 'Kontaktstelle für Empfänger*', 'DSA-Kontaktstelle*', 'Kontaktstelle nach dem DSA', 'Kontaktstelle gemäß DSA'],
      es: ['punto de contacto único', 'puntos de contacto únicos', 'punto único de contacto', 'puntos únicos de contacto', 'punto de contacto DSA', 'punto de contacto para las autoridades'],
      it: ['punto di contatto unico', 'punti di contatto unici', 'punto unico di contatto', 'punto di contatto DSA', 'punto di contatto per le autorità'],
      pt: ['ponto de contacto único', 'ponto de contato único', 'ponto único de contacto', 'ponto único de contato', 'pontos de contacto únicos'],
      nl: ['centraal contactpunt', 'centrale contactpunt*', 'één contactpunt', 'contactpunt voor autoriteiten', 'contactpunt voor afnemers', 'DSA-contactpunt*'],
      da: ['centralt kontaktpunkt', 'fælles kontaktpunkt', 'kontaktpunkt for myndigheder', 'kontaktpunkt for tjenestemodtagere'],
      no: ['sentralt kontaktpunkt', 'felles kontaktpunkt', 'kontaktpunkt for myndigheter'],
      sv: ['gemensam kontaktpunkt', 'central kontaktpunkt', 'kontaktpunkt för myndigheter', 'kontaktpunkt för tjänstemottagare'],
      fi: ['keskitetty yhteyspiste', 'yhteyspiste viranomaisille', 'yhteyspiste palvelun vastaanottajille'],
      pl: ['pojedynczy punkt kontaktowy', 'pojedynczego punktu kontaktowego', 'pojedyncze punkty kontaktowe', 'punkt kontaktowy DSA'],
      cs: ['jednotné kontaktní místo', 'kontaktní místo pro orgány', 'kontaktní místo pro příjemce'],
      sk: ['jednotné kontaktné miesto', 'kontaktné miesto pre orgány', 'kontaktné miesto pre príjemcov'],
      hu: ['egyedüli kapcsolattartó pont*', 'egységes kapcsolattartó pont*', 'kapcsolattartó pont a hatóságok számára'],
      ro: ['punct unic de contact', 'punctul unic de contact', 'punct de contact unic', 'puncte unice de contact'],
    },
  },
  dsa_legal_representative_named: {
    terms: {
      en: ['DSA legal representative', 'DSA representative', 'legal representative under the Digital Services Act', 'legal representative under the DSA', 'legal representative pursuant to the DSA', 'legal representative pursuant to Art* 13', 'legal representative in the EU', 'legal representative in the European Union', 'legal representative in the Union'],
      fr: ['représentant légal au titre du DSA', 'représentant légal DSA', "représentant légal dans l'Union", "représentant légal dans l'UE", 'représentant légal au sens du règlement sur les services numériques'],
      de: ['Rechtsvertreter* in der Union', 'Rechtsvertreter* in der EU', 'Rechtsvertreter* gemäß DSA', 'Rechtsvertreter* nach dem DSA', 'Rechtsvertreter* gemäß Art* 13', 'DSA-Rechtsvertreter*', 'gesetzliche* Vertreter* in der Union'],
      es: ['representante legal en la Unión', 'representante legal en la UE', 'representante legal a efectos del DSA', 'representante legal DSA'],
      it: ["rappresentante legale nell'Unione", "rappresentante legale nell'UE", 'rappresentante legale ai sensi del DSA', 'rappresentante legale DSA'],
      pt: ['representante legal na União', 'representante legal na UE', 'representante legal para efeitos do DSA'],
      nl: ['wettelijk vertegenwoordiger in de Unie', 'wettelijke vertegenwoordiger in de Unie', 'wettelijk vertegenwoordiger in de EU', 'wettelijke vertegenwoordiger in de EU'],
      da: ['retlig repræsentant i Unionen', 'retlig repræsentant i EU'],
      no: ['juridisk representant i EU'],
      sv: ['rättslig företrädare i unionen', 'rättslig företrädare i EU'],
      fi: ['laillinen edustaja unionissa', 'laillinen edustaja EU:ssa'],
      pl: ['przedstawiciel prawny w Unii', 'przedstawiciela prawnego w Unii', 'przedstawiciel prawny w UE'],
      cs: ['právní zástupce v Unii', 'právní zástupce v EU'],
      sk: ['právny zástupca v Únii', 'právny zástupca v EÚ'],
      hu: ['jogi képviselő az Unióban', 'jogi képviselője az Unióban'],
      ro: ['reprezentant legal în Uniune', 'reprezentantul legal în Uniune', 'reprezentant legal în UE'],
    },
  },
} as const satisfies Record<string, Vocabulary>;

export type RepresentativeCheck = keyof typeof REPRESENTATIVE_VOCABULARY;

/**
 * A footer link to the company's Digital Services Act page, where the points of contact and the
 * legal representative usually are. Used only to find that page and read it, never to report a
 * page missing. Kept out of LINK_VOCABULARY so it plays no part in guessing the language.
 */
export const DSA_PAGE_LINK: Vocabulary = {
  terms: {
    en: ['Digital Services Act', 'DSA', 'DSA information', 'DSA contact*'],
    fr: ['règlement sur les services numériques', 'législation sur les services numériques', 'DSA'],
    de: ['Gesetz über digitale Dienste', 'Digital Services Act', 'DSA'],
    es: ['Ley de Servicios Digitales', 'Reglamento de Servicios Digitales', 'DSA'],
    it: ['Regolamento sui servizi digitali', 'legge sui servizi digitali', 'DSA'],
    pt: ['Regulamento dos Serviços Digitais', 'DSA'],
    nl: ['digitaledienstenverordening', 'DSA'],
    da: ['forordningen om digitale tjenester', 'DSA'],
    no: ['DSA'],
    sv: ['förordningen om digitala tjänster', 'DSA'],
    fi: ['digipalvelusäädös', 'DSA'],
    pl: ['akt o usługach cyfrowych', 'DSA'],
    cs: ['akt o digitálních službách', 'DSA'],
    sk: ['akt o digitálnych službách', 'DSA'],
    hu: ['digitális szolgáltatásokról szóló rendelet', 'DSA'],
    ro: ['Regulamentul privind serviciile digitale', 'DSA'],
  },
};

/**
 * Words before a notice's date ("Dernière mise à jour : 2 mars 2026"). English keeps its own
 * reader. The date has to start within a few words of the label.
 */
export const LAST_UPDATED_LABELS: Partial<Record<Language, readonly string[]>> = {
  fr: ['dernière mise à jour', 'mise à jour le', 'mis à jour le', 'date de mise à jour', "date d'entrée en vigueur", 'en vigueur au', 'en vigueur le', 'version du'],
  de: ['Stand', 'zuletzt aktualisiert', 'letzte Aktualisierung', 'aktualisiert am', 'gültig ab', 'Version vom'],
  es: ['última actualización', 'actualizado el', 'actualizada el', 'fecha de actualización', 'fecha de entrada en vigor', 'vigente desde'],
  it: ['ultimo aggiornamento', 'aggiornato il', 'aggiornata il', 'data di aggiornamento', 'data di entrata in vigore', 'in vigore dal'],
  pt: ['última atualização', 'última actualização', 'atualizado em', 'atualizada em', 'data de atualização', 'em vigor desde', 'em vigor a partir de'],
  nl: ['laatst bijgewerkt', 'laatste wijziging', 'bijgewerkt op', 'gewijzigd op', 'versie van', 'geldig vanaf', 'datum'],
  da: ['senest opdateret', 'sidst opdateret', 'opdateret den', 'gældende fra'],
  no: ['sist oppdatert', 'oppdatert', 'gjelder fra', 'sist endret'],
  sv: ['senast uppdaterad', 'uppdaterad', 'gäller från', 'senast ändrad'],
  fi: ['päivitetty', 'viimeksi päivitetty', 'voimassa alkaen'],
  pl: ['ostatnia aktualizacja', 'data aktualizacji', 'zaktualizowano', 'obowiązuje od', 'data ostatniej aktualizacji'],
  cs: ['poslední aktualizace', 'aktualizováno', 'účinnost od', 'platné od', 'platnost od'],
  sk: ['posledná aktualizácia', 'aktualizované', 'účinnosť od', 'platné od'],
  hu: ['utolsó frissítés', 'frissítve', 'hatályos', 'hatályba lépés'],
  ro: ['ultima actualizare', 'actualizat la', 'data actualizării', 'în vigoare de la', 'valabil de la'],
};

/** Month names, written without accents, as they appear in dates (Polish and Czech genitive forms included). */
export const MONTH_NAMES: Readonly<Record<string, number>> = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
  januar: 1, janner: 1, februar: 2, marz: 3, april: 4, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, dezember: 12,
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  gennaio: 1, febbraio: 2, aprile: 4, maggio: 5, giugno: 6, luglio: 7, settembre: 9, ottobre: 10, dicembre: 12,
  janeiro: 1, fevereiro: 2, marco: 3, maio: 5, junho: 6, julho: 7, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  januari: 1, februari: 2, maart: 3, mei: 5, augustus: 8, december: 12,
  marts: 3, maj: 5, desember: 12, augusti: 8,
  tammikuuta: 1, helmikuuta: 2, maaliskuuta: 3, huhtikuuta: 4, toukokuuta: 5, kesakuuta: 6, heinakuuta: 7, elokuuta: 8, syyskuuta: 9, lokakuuta: 10, marraskuuta: 11, joulukuuta: 12,
  stycznia: 1, lutego: 2, marca: 3, kwietnia: 4, maja: 5, czerwca: 6, lipca: 7, sierpnia: 8, wrzesnia: 9, pazdziernika: 10, listopada: 11, grudnia: 12,
  styczen: 1, luty: 2, marzec: 3, kwiecien: 4, czerwiec: 6, lipiec: 7, sierpien: 8, wrzesien: 9, pazdziernik: 10, listopad: 11, grudzien: 12,
  ledna: 1, unora: 2, brezna: 3, dubna: 4, kvetna: 5, cervna: 6, cervence: 7, srpna: 8, zari: 9, rijna: 10, listopadu: 11, prosince: 12,
  januara: 1, februara: 2, aprila: 4, juna: 6, jula: 7, augusta: 8, septembra: 9, oktobra: 10, novembra: 11, decembra: 12,
  marcius: 3, aprilis: 4, majus: 5, junius: 6, julius: 7, augusztus: 8, szeptember: 9,
  ianuarie: 1, februarie: 2, martie: 3, aprilie: 4, iunie: 6, iulie: 7, septembrie: 9, octombrie: 10, noiembrie: 11, decembrie: 12,
};

/**
 * Labels that come before a company's registration or tax number in a footer or legal notice
 * ("RCS Lyon 552 …", "HRB 6684", "KvK 12345678", "Org.nr 999 999 999"). A label only counts
 * with a number of at least four digits soon after it.
 */
export const REGISTRATION_LABELS: Partial<Record<Language, readonly string[]>> = {
  en: ['company number', 'company no', 'company registration number', 'company reg no', 'registered number', 'registered no', 'registration number', 'registration no', 'registered in England*', 'registered in Scotland', 'registered in Ireland', 'VAT number', 'VAT no', 'VAT reg*', 'VAT registration number', 'ABN', 'ACN', 'UEN', 'NZBN', 'RC number', 'RC no', 'CRO number', 'corporation number', 'business number'],
  fr: ['SIREN', 'SIRET', 'RCS', 'numéro de TVA', 'TVA intracommunautaire', 'n° TVA', 'TVA', "numéro d'immatriculation", 'immatriculée', 'immatriculé', 'IDE', 'BCE', "numéro d'entreprise"],
  de: ['Handelsregister*', 'Registergericht', 'Amtsgericht', 'Registernummer', 'HRB', 'HRA', 'USt-IdNr*', 'USt-ID', 'Umsatzsteuer-Identifikationsnummer', 'UID', 'UID-Nr*', 'Firmenbuch*', 'FN', 'Steuernummer'],
  es: ['CIF', 'NIF', 'Registro Mercantil', 'inscrita en el Registro', 'RUT', 'RFC', 'CUIT', 'NIT'],
  it: ['Partita IVA', 'P.Iva', 'codice fiscale', 'REA', 'registro delle imprese'],
  pt: ['NIPC', 'NIF', 'CNPJ', 'Conservatória do Registo Comercial', 'matrícula', 'pessoa coletiva'],
  nl: ['KvK*', 'Kamer van Koophandel', 'btw*', 'handelsregister', 'ondernemingsnummer', 'KBO', 'RSIN'],
  da: ['CVR*', 'SE-nr*'],
  no: ['org nr', 'org.nr', 'orgnr', 'organisasjonsnummer', 'foretaksregisteret'],
  sv: ['org nr', 'org.nr', 'orgnr', 'organisationsnummer', 'momsregistreringsnummer', 'momsnr', 'VAT-nr'],
  fi: ['Y-tunnus', 'LY-tunnus', 'ALV-numero', 'ALV-nro', 'ALV'],
  pl: ['KRS', 'NIP', 'REGON', 'Sąd Rejonowy', 'numer KRS'],
  cs: ['IČO', 'IČ', 'DIČ', 'obchodní rejstřík*', 'obchodním rejstříku', 'spisová značka'],
  sk: ['IČO', 'DIČ', 'IČ DPH', 'obchodný register', 'obchodnom registri'],
  hu: ['cégjegyzékszám', 'adószám', 'Cg.'],
  ro: ['CUI', 'CIF', 'Nr. Reg. Com.', 'Registrul Comerțului', 'J40', 'cod fiscal'],
};

export interface DataProtectionAuthority {
  /** ISO 3166 codes the authority covers. Empty when the name alone doesn't say which country. */
  countries: readonly string[];
  /** Names and acronyms. Acronyms match as whole words only. Longer names are tried first, so "Office of the Australian Information Commissioner" is never taken for "Information Commissioner". */
  names: readonly string[];
  /** Website domains, matched in the notice's text and links. */
  domains: readonly string[];
}

/**
 * National data protection authorities, for `web.policy.dpa_named` (the notice tells people
 * who they can complain to). Generic words ("the supervisory authority", "eine
 * Aufsichtsbehörde") are not names and don't count.
 */
export const DATA_PROTECTION_AUTHORITIES: readonly DataProtectionAuthority[] = [
  // Europe
  { countries: ['FR'], names: ["Commission nationale de l'informatique et des libertés", 'CNIL'], domains: ['cnil.fr'] },
  { countries: ['GB'], names: ["Information Commissioner's Office", 'Information Commissioner', 'ICO'], domains: ['ico.org.uk'] },
  { countries: ['IE'], names: ['Data Protection Commission', 'Irish Data Protection Commissioner', 'Coimisiún um Chosaint Sonraí'], domains: ['dataprotection.ie'] },
  { countries: ['DE'], names: ['Bundesbeauftragte* für den Datenschutz', 'BfDI', 'Landesbeauftragte* für den Datenschutz', 'Landesbeauftragte* für Datenschutz', 'Bayerisches Landesamt für Datenschutzaufsicht', 'BayLDA', 'Berliner Beauftragte* für Datenschutz', 'Hamburgische* Beauftragte* für Datenschutz', 'HmbBfDI', 'Hessische* Beauftragte* für Datenschutz', 'HBDI', 'Unabhängiges Landeszentrum für Datenschutz', 'ULD', 'LfDI', 'LfD Niedersachsen', 'LDI NRW', 'Sächsische* Datenschutz*', 'Thüringer Landesbeauftragte*', 'TLfDI', 'Landesamt für Datenschutz', 'Landesbeauftragte* für Datenschutz und Informationsfreiheit'], domains: ['bfdi.bund.de', 'lda.bayern.de', 'datenschutz.bayern.de', 'datenschutz-berlin.de', 'datenschutz-hamburg.de', 'datenschutz.hessen.de', 'datenschutzzentrum.de', 'baden-wuerttemberg.datenschutz.de', 'ldi.nrw.de', 'lfd.niedersachsen.de', 'datenschutz.rlp.de', 'datenschutz-mv.de', 'lda.brandenburg.de', 'datenschutz.bremen.de', 'datenschutz.saarland.de', 'datenschutz.sachsen.de', 'datenschutz.sachsen-anhalt.de', 'tlfdi.de'] },
  { countries: ['AT'], names: ['österreichische Datenschutzbehörde', 'Austrian Data Protection Authority'], domains: ['dsb.gv.at'] },
  { countries: ['CH'], names: ['Eidgenössische* Datenschutz- und Öffentlichkeitsbeauftragte*', 'EDÖB', 'FDPIC', 'PFPDT', 'IFPDT', 'Préposé fédéral à la protection des données*', 'Federal Data Protection and Information Commissioner'], domains: ['edoeb.admin.ch'] },
  { countries: ['ES'], names: ['Agencia Española de Protección de Datos', 'AEPD', 'Autoritat Catalana de Protecció de Dades', 'Agencia Vasca de Protección de Datos', 'Spanish Data Protection Agency'], domains: ['aepd.es', 'apdcat.cat', 'avpd.eus'] },
  { countries: ['IT'], names: ['Garante per la protezione dei dati personali', 'Garante della privacy', 'Garante privacy', 'Italian Data Protection Authority'], domains: ['garanteprivacy.it', 'gpdp.it'] },
  { countries: ['PT'], names: ['Comissão Nacional de Proteção de Dados', 'Comissão Nacional de Protecção de Dados'], domains: ['cnpd.pt'] },
  { countries: ['PT', 'LU'], names: ['CNPD'], domains: [] },
  { countries: ['LU'], names: ['Commission nationale pour la protection des données'], domains: ['cnpd.public.lu', 'cnpd.lu'] },
  { countries: ['NL'], names: ['Autoriteit Persoonsgegevens', 'Dutch Data Protection Authority'], domains: ['autoriteitpersoonsgegevens.nl'] },
  { countries: ['BE'], names: ['Gegevensbeschermingsautoriteit', 'Autorité de protection des données', 'Belgian Data Protection Authority'], domains: ['gegevensbeschermingsautoriteit.be', 'autoriteprotectiondonnees.be', 'dataprotectionauthority.be'] },
  { countries: ['DK', 'NO'], names: ['Datatilsynet'], domains: [] },
  { countries: ['DK'], names: ['Danish Data Protection Agency'], domains: ['datatilsynet.dk'] },
  { countries: ['NO'], names: ['Norwegian Data Protection Authority'], domains: ['datatilsynet.no'] },
  { countries: ['SE'], names: ['Integritetsskyddsmyndigheten', 'IMY', 'Datainspektionen', 'Swedish Authority for Privacy Protection'], domains: ['imy.se'] },
  { countries: ['FI'], names: ['Tietosuojavaltuutet*', 'Dataombudsmannens byrå', 'Data Protection Ombudsman'], domains: ['tietosuoja.fi'] },
  { countries: ['IS'], names: ['Persónuvernd'], domains: ['personuvernd.is'] },
  { countries: ['PL'], names: ['Prezes Urzędu Ochrony Danych Osobowych', 'Urząd Ochrony Danych Osobowych', 'Urzędu Ochrony Danych Osobowych', 'UODO', 'PUODO'], domains: ['uodo.gov.pl'] },
  { countries: ['CZ'], names: ['Úřad pro ochranu osobních údajů', 'Úřadu pro ochranu osobních údajů', 'ÚOOÚ'], domains: ['uoou.cz', 'uoou.gov.cz'] },
  { countries: ['SK'], names: ['Úrad na ochranu osobných údajov', 'Úradu na ochranu osobných údajov'], domains: ['dataprotection.gov.sk'] },
  { countries: ['HU'], names: ['Nemzeti Adatvédelmi és Információszabadság Hatóság', 'NAIH'], domains: ['naih.hu'] },
  { countries: ['RO'], names: ['Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal', 'ANSPDCP'], domains: ['dataprotection.ro'] },
  { countries: ['EE'], names: ['Andmekaitse Inspektsioon', 'Estonian Data Protection Inspectorate'], domains: ['aki.ee'] },
  { countries: ['LV'], names: ['Datu valsts inspekcija'], domains: ['dvi.gov.lv'] },
  { countries: ['LT'], names: ['Valstybinė duomenų apsaugos inspekcija'], domains: ['vdai.lrv.lt'] },
  { countries: ['SI'], names: ['Informacijski pooblaščenec'], domains: ['ip-rs.si'] },
  { countries: ['HR'], names: ['Agencija za zaštitu osobnih podataka', 'AZOP'], domains: ['azop.hr'] },
  { countries: ['GR'], names: ['Hellenic Data Protection Authority', 'Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα'], domains: ['dpa.gr'] },
  { countries: ['CY'], names: ['Commissioner for Personal Data Protection'], domains: ['dataprotection.gov.cy'] },
  { countries: ['MT'], names: ['Information and Data Protection Commissioner', 'IDPC'], domains: ['idpc.org.mt'] },
  { countries: ['BG'], names: ['Commission for Personal Data Protection', 'Комисия за защита на личните данни'], domains: ['cpdp.bg'] },
  { countries: ['EU'], names: ['European Data Protection Board', 'EDPB', 'European Data Protection Supervisor', 'EDPS'], domains: ['edpb.europa.eu', 'edps.europa.eu'] },
  { countries: ['TR'], names: ['Kişisel Verileri Koruma Kurumu', 'KVK Kurumu'], domains: ['kvkk.gov.tr'] },
  // Americas
  { countries: ['CA'], names: ['Office of the Privacy Commissioner of Canada', 'Privacy Commissioner of Canada', "Commissariat à la protection de la vie privée du Canada", "Commission d'accès à l'information"], domains: ['priv.gc.ca', 'cai.gouv.qc.ca'] },
  { countries: ['US-CA'], names: ['California Privacy Protection Agency', 'CPPA'], domains: ['cppa.ca.gov'] },
  { countries: ['BR'], names: ['Autoridade Nacional de Proteção de Dados', 'ANPD'], domains: ['gov.br/anpd'] },
  { countries: ['AR'], names: ['Agencia de Acceso a la Información Pública', 'AAIP'], domains: ['aaip.gob.ar'] },
  { countries: ['MX'], names: ['Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales', 'INAI'], domains: ['inai.org.mx'] },
  { countries: ['CO'], names: ['Superintendencia de Industria y Comercio'], domains: ['sic.gov.co'] },
  // Asia-Pacific
  { countries: ['AU'], names: ['Office of the Australian Information Commissioner', 'Australian Information Commissioner', 'OAIC'], domains: ['oaic.gov.au'] },
  { countries: ['NZ'], names: ['New Zealand Privacy Commissioner', 'Privacy Commissioner of New Zealand'], domains: ['privacy.org.nz'] },
  { countries: [], names: ['Office of the Privacy Commissioner'], domains: [] },
  { countries: ['SG'], names: ['Personal Data Protection Commission Singapore', 'Personal Data Protection Commission of Singapore'], domains: ['pdpc.gov.sg'] },
  { countries: ['TH'], names: ['Personal Data Protection Committee'], domains: ['pdpc.or.th'] },
  { countries: [], names: ['Personal Data Protection Commission', 'PDPC'], domains: [] },
  { countries: ['HK'], names: ['Privacy Commissioner for Personal Data', 'PCPD'], domains: ['pcpd.org.hk'] },
  { countries: ['JP'], names: ['個人情報保護委員会'], domains: ['ppc.go.jp'] },
  { countries: ['KR'], names: ['개인정보보호위원회', '개인정보 보호위원회'], domains: ['pipc.go.kr'] },
  { countries: [], names: ['Personal Information Protection Commission', 'PIPC'], domains: [] },
  { countries: ['IN'], names: ['Data Protection Board of India'], domains: [] },
  { countries: ['PH'], names: ['National Privacy Commission'], domains: ['privacy.gov.ph'] },
  { countries: ['MY'], names: ['Personal Data Protection Department', 'Jabatan Perlindungan Data Peribadi', 'JPDP'], domains: ['pdp.gov.my'] },
  { countries: ['CN'], names: ['Cyberspace Administration of China', '国家互联网信息办公室'], domains: ['cac.gov.cn'] },
  { countries: ['SA'], names: ['Saudi Data and Artificial Intelligence Authority', 'Saudi Data & AI Authority', 'SDAIA'], domains: ['sdaia.gov.sa'] },
  // Africa
  { countries: ['NG'], names: ['Nigeria Data Protection Commission', 'Nigeria Data Protection Bureau', 'NDPC', 'NDPB'], domains: ['ndpc.gov.ng', 'ndpb.gov.ng'] },
  { countries: ['ZA'], names: ['Information Regulator'], domains: ['inforegulator.org.za'] },
  { countries: ['KE'], names: ['ODPC'], domains: ['odpc.go.ke'] },
  // Kenya's office today, and Ireland's before 2018: the name alone doesn't say which.
  { countries: [], names: ['Office of the Data Protection Commissioner'], domains: [] },
  { countries: ['GH'], names: [], domains: ['dataprotection.org.gh', 'dpc.gov.gh'] },
];
