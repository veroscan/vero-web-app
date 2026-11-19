# Vero Scan — Milestone 1 Research and Execution Plan

**Project:** Vero Scan (Code and Clause LTD)
**Prepared by:** Emmanuel Edet, Independent Contractor
**Date:** 4 November 2026
**Status:** Working plan. Research findings dated November 2026. Items marked **[verify]** must be confirmed before they go into the final Milestone 1 deliverables.
**Basis:** Independent Contractor Agreement (Clauses 1–6), Vero Scan product document (Google Doc), and desk research across four tracks (African registries; UK/US/EU data sources; legal obligations; integrations and infrastructure).

> This document is technical planning, not legal advice. Every legal rule that ends up in the product must be reviewed and signed off by a Code & Clause lawyer.

---

## Contents

1. Summary and key decisions
2. What Milestone 1 must deliver (contract mapping)
3. Corrections to assumptions in the product document
4. Prerequisites the Client must provide
5. Week-by-week execution plan
6. Deliverable (a): Technical architecture
7. Deliverable (b): Database schema
8. Deliverable (c): Technology stack and licence compliance
9. Deliverable (d): Environment, repository and account setup
10. Deliverable (e): API and data-source integration map
11. Rules engine, questionnaire and scoring model
12. Vault integrations
13. Document understanding (AI) design
14. Security and data protection baseline
15. Deliverable (f): Timeline for Milestones 2 and 3
16. Running costs (estimates)
17. Risks and mitigations
18. Questions and decisions needed from the Client
19. Verification checklist (before final submission)
20. Sources

---

## 1. Summary and key decisions

**What Milestone 1 is:** six paper-and-setup deliverables (Clause 1.2(A)(a)–(f)). No product code beyond repository scaffolding. It triggers the first payment of ₦1,400,000 (Clause 5.1(a)) once the architecture document and GitHub setup are delivered. Development of Milestone 2 does not have to start until that payment arrives.

**Recommended duration:** 4 weeks, from the date the Client supplies the prerequisites in section 4.

**Main findings that shape the design:**

1. **No African registry offers an open self-serve API.** Nigeria's CAC has a partner-only API via NIBSS "super agents" (May 2025). Uganda's URSB has a partner-only API used by Stanbic. For launch, use a KYB aggregator (Dojah, Smile ID, Youverify, Prembly) for Nigeria and Kenya.
2. **The easiest African countries after Nigeria are Kenya, then South Africa, then Uganda or Zambia.** Ghana is commercially important but has no API and no verified aggregator coverage.
3. **Germany is not an "easy API" country.** The Handelsregister has no API, caps lookups at about 60 per hour, and warns that mass automated queries may be a criminal offence. **France, Estonia and the Netherlands are much easier** (free or cheap official APIs).
4. **The UK is the best data source.** Companies House has a free, well-documented API. The ICO fee-payer register is a free daily download.
5. **Delaware prohibits data mining** of its entity search. Use customer-uploaded good-standing certificates or a licensed vendor; never scrape.
6. **OpenCorporates' free key is share-alike** and cannot be used inside a proprietary score. Use the paid tier (from £2,250/yr) only if needed.
7. **Phase 1 is questionnaire-driven**, so the heaviest Milestone 1 work is not APIs but the **legal rules content** for 8 countries plus EU rules. The developer builds the engine; Code & Clause must own and approve the rule content.
8. **Google Drive full-folder access needs "restricted" OAuth scopes**, which require Google verification plus an annual security assessment (CASA). Start with direct upload + Google Picker (`drive.file`), which needs no assessment.
9. **Digify may not let third parties list or download data-room contents.** Do not commit to Digify until it confirms in writing.
10. **The stack is licence-clean** (no GPL/AGPL/LGPL, per Clause 1.3(e)) provided we use Valkey instead of Redis 8, keep `sharp` out of Next.js, and avoid Poppler, Ghostscript and MuPDF.

**Decisions proposed for Client approval:**

| # | Decision | Recommendation |
|---|---|---|
| D1 | Launch countries (questionnaire rules) | The 8 Phase 1 countries in the product doc: Nigeria, UK, US (Delaware + Wyoming, California for privacy), Germany, France, Kenya, Ghana, South Africa |
| D2 | Launch registry connectors (automatic data) | UK (Companies House, Gazette, ICO file, FCA), France (recherche-entreprises, INPI RNE and Marques, BODACC, REGAFI, AMF), Nigeria (licensed CAC vendor plus NDPC, CBN, SEC and FCCPC lists), US (SEC Form D, USPTO, FinCEN, Middesk), South Africa (CIPC developer portal, Didit bridge), Kenya (Dojah or QoreID, Kenya Law gazette), Germany (OpenRegister, DPMAconnectPlus, EBA and ESMA), Ghana (vendor plus document route, DPC register), EU VAT (VIES), GLEIF, sanctions lists. Full routes per item: *Verification Solutions Matrix* |
| D3 | KYB vendors | Nigeria: Mono primary (CAC lookup, directors, PSC, status-report PDF, TIN), QoreID or Smile ID second. Kenya: Dojah or QoreID. Ghana: Youverify or Dojah with certificate upload as the default. South Africa: official CIPC API, Didit until approved. Germany: OpenRegister. US: Middesk. Run 20 test companies per country through each before signing |
| D4 | Vault at launch | Direct upload into Vero storage + Google Drive (Picker) + Notion. SpotDraft in Milestone 3 if the Client's plan includes API access. Digify deferred |
| D5 | AI document classification | Claude API under a zero-data-retention agreement, or Claude on AWS Bedrock / Google Vertex in an EU region if EU/UK residency is required |
| D6 | Hosting region | DigitalOcean LON1 (London); FRA1 if most customers are EU. There is no DigitalOcean region in Africa |
| D7 | Mobile | One Expo (React Native) app for iOS and Android, sharing types and API client with the web app |

---

## 2. What Milestone 1 must deliver (contract mapping)

| Contract clause | Deliverable | Format | Acceptance evidence |
|---|---|---|---|
| 1.2(A)(a) | Technical architecture document | PDF/Markdown in the repo `/docs` | Technical Adviser sign-off |
| 1.2(A)(b) | Complete database schema | ERD diagram + Prisma/Drizzle schema file + data dictionary | Schema review |
| 1.2(A)(c) | Technology stack confirmation | Stack decision record with licences | **Client's written approval** (required before development) |
| 1.2(A)(d) | Dev environment, version control, repository | Client-owned GitHub org + repo, CI, staging on Client's DigitalOcean | Client admin access confirmed (Schedule 3) |
| 1.2(A)(e) | API integration map for all target jurisdictions | Per-country source matrix (section 10) with access, cost, terms, fallback | Technical Adviser review |
| 1.2(A)(f) | Project timeline and development plan for M2 and M3 | Sprint plan + Gantt (section 15) | **Technical Adviser approval** before development |

Related contract duties that start in Milestone 1:

- **Clause 4.1:** create the dedicated GitHub account **before any development**, transfer ownership to the Client the same day, and complete Schedule 3.
- **Clause 4.2–4.3:** all work pushed to the Client's repo from day one; commit at least daily on working days.
- **Clause 1.3(f) and Schedule 2:** start the dependency register now and keep it updated.
- **Clause 1.6:** disclose AI tool use in writing before submitting AI-assisted work. Send this disclosure in week 1.
- **Clause 1.5:** the Technical Adviser has 10 business days to review each milestone. Plan for that in the timeline.
- **Clause 3.2:** the project clock pauses while waiting for Client inputs. Keep a dated log of every request and response.

---

## 3. Corrections to assumptions in the product document

These should be raised politely with the Client because they change scope or design.

| Product document says | What the research found | Impact |
|---|---|---|
| "CAC search API exists" | Only a partner-only CAC–NIBSS super-agent API (May 2025), with no public docs or application process. The public search is web-only with reCAPTCHA. | Use a KYB vendor (paid per call). Optionally apply to NIBSS later. |
| South Africa CIPC: "Public search API" | No official public API confirmed. A vendor mentions a CIPC "APIVerse" portal, but it could not be verified. Search requires login and is capped at about 20/day. Official bulk extracts cost R10 + R0.04 per record. | Use Smile ID or a local CIPC wrapper. |
| Kenya BRS: "Public search available" | True, but paid (CR12 KES 650) via eCitizen, with no public API. Five vendors cover it. | Kenya is the best African country after Nigeria. |
| Ghana: "Accessible" | Paid manual searches (about GHS 30–150), no API, no verified aggregator coverage, portal outages in 2026. | Reference + document upload only at launch. |
| Germany Handelsregister: "Public access" | Free to view, but no API, a 60-lookups/hour cap, and a warning that mass automated queries may breach criminal law. | Use a German vendor or manual lookups. Not an "easy API" country. |
| France: "Public API access" | Confirmed and better than expected: three free official APIs (Recherche d'entreprises, INSEE Sirene, INPI RNE + trademarks). | France is the easiest EU country after Estonia/Finland. |
| Delaware Secretary of State records | No API; the site prohibits data mining. Status checks cost $10–$20, certificates $50–$175. | Customer uploads a good-standing certificate, or use a licensed vendor. |
| OpenCorporates "aggregates US state registries" | Free key is share-alike (incompatible with a proprietary product). Paid from £2,250/yr. South Africa data archive-only; Uganda stale since 2021. | Optional, paid, not a foundation. |
| "§13 TMG" German privacy notice example | The TMG was repealed on 14 May 2024. Imprint is now **§5 DDG**; cookie consent is **§25 TDDDG**; privacy notices are GDPR Arts 13/14. | Update the rule content. Use this as an example of a "stale citation" flag. |
| NDPR | The NDPR has been superseded by the **Nigeria Data Protection Act 2023** and the **GAID 2025** (effective 19 Sep 2025). | Rules should cite NDPA/GAID. |
| PACER for court records | PACER charges $0.10/page; CourtListener's free tier was cut in May 2026 and commercial use needs an agreement. RECAP coverage is partial. | Court records are a later phase; any "no case found" must be labelled partial. |

---

## 4. Prerequisites the Client must provide

These are on the critical path. The 4-week clock should start when items 1–6 are in hand.

| # | Item | Why | Owner | Lead time |
|---|---|---|---|---|
| 1 | Written approval of AI tool use (Clause 1.6) | Contract requirement before AI-assisted work is submitted | Client | Days |
| 2 | Name and contact of the Technical Adviser | Reviews and certifies every milestone | Client | Days |
| 3 | Milestone 1 Project Brief (or written confirmation that the product document is the brief) | Defined term in the contract | Client | Days |
| 4 | Written confirmation of scope for ₦3.5M (section 18, Q1) | Product doc is larger than contract text | Client | Days |
| 5 | DigitalOcean account owned by the Client, with the contractor invited as team member | Clause 1.4(c) | Client | 1 day |
| 6 | Domain name for Vero Scan (Clause 1.4(b)) | DNS, SSL, email | Client | 1 day |
| 7 | D-U-N-S number for Code and Clause LTD | Needed for Apple and Google organisation developer accounts | Client | Up to 1–2 weeks |
| 8 | Apple Developer Program (organisation, $99/yr) and Google Play Console (organisation, $25 one-time) | App store publishing must be under the Client's name | Client | 1–3 weeks |
| 9 | Brand guidelines and UX assets (logo, colours, fonts, any designs) | Needed for Milestone 3 frontend; useful earlier for wireframes | Client | Before M3 |
| 10 | Budget owner for paid data and services (KYB vendor, Expo, LLM, optional OpenCorporates) | Contract is silent on third-party costs | Client | Before M2 |
| 11 | Code & Clause lawyer assigned to own the legal rule content | Rules must be legally reviewed | Client | Before M2 |

Start items 7 and 8 in week 1: they take the longest and block mobile releases.

---

## 5. Week-by-week execution plan (4 weeks)

### Week 1 — Kick-off, accounts, discovery

- Send the Client: AI-use disclosure (Clause 1.6), prerequisites list (section 4), and scope questions (section 18).
- Create the dedicated Vero Scan GitHub account/organisation; transfer ownership and admin to the Client the same day; complete Schedule 3 and get it signed.
- Create the repository, branch protection, CODEOWNERS, issue templates, `/docs` folder, and the dependency register (Schedule 2) file.
- Kick-off meeting with the Client and Technical Adviser: confirm launch countries, plans, scope boundary, success criteria, review process.
- Request quotes and sandbox keys: Dojah, Smile ID, Youverify (Africa KYB); register free keys: Companies House, INSEE Sirene, INPI, USPTO, EUIPO sandbox, FCA register.
- Email NIBSS/CAC about super-agent onboarding; email SpotDraft partnerships and Digify support with specific API questions (section 12).

**Output:** signed Schedule 3, live repo, request log started, vendor requests sent.

### Week 2 — Architecture and data

- Write the architecture document draft (section 6).
- Design the database schema and ERD (section 7).
- Build quick technical spikes (throwaway, in a `spikes/` folder, not production code): call Companies House, Recherche d'entreprises and Dojah sandbox; measure response shape, speed, errors.
- Confirm the stack and produce the licence report (section 8).
- Draft the API integration map with real test results (section 10).

**Output:** architecture draft v0.9, ERD v0.9, stack decision record, integration map v0.9.

### Week 3 — Rules, scoring and environment

- Define the rule schema, questionnaire v1 and scoring model (section 11) with the Code & Clause lawyer.
- Encode 3–5 sample rules per country as examples, so lawyers see the format.
- Set up staging on DigitalOcean (App Platform, Managed PostgreSQL, Valkey, Spaces), CI (lint, test, licence check, build), environment variables and secrets policy.
- Write the security and data-protection baseline (section 14), including the sub-processor list and DPIA outline.

**Output:** rules spec, questionnaire v1, scoring spec, staging environment reachable, CI green.

### Week 4 — Timeline, review, submission

- Produce the detailed sprint plan for Milestones 2 and 3 (section 15).
- Internal review against this checklist (section 19); fix gaps.
- Submit the Milestone 1 package to the Technical Adviser and request written certification (Clause 1.5).
- Hand over any credentials created so far; confirm all files are in the Client's repo (Clause 4.2, 4.4).

**Output:** Milestone 1 package submitted; certification requested; invoice for first tranche.

---

## 6. Deliverable (a): Technical architecture

The Client's brief of 4 November 2026 defines three intelligence layers, and the architecture is organised around them:

- **Layer A, Registry Intelligence:** from the company name, pull existence, filing status, officers, shareholders, charges, licences and sanctions from official or licensed sources (the connector layer below).
- **Layer B, Company Intelligence:** from the company name or domain, infer what the company builds, its sector, markets, stage, team size, apps and hiring from public data, with the website as the anchor and no questionnaire needed for this layer.
- **Layer C, Legal Gap Intelligence:** combine A and B with the questionnaire to generate the company-specific checklist (stage × incorporation country × operating countries × sector), check what is publicly verifiable, and flag the gaps.

Every fact carries a **verification tier** (1 official live, 2 licensed vendor, 3 official list import, 4 document-verified, 5 attested) and a match confidence, and the report shows both. The companion document *Vero Scan — Verification Solutions Matrix* gives the route, fallback and cost for every item in the Client's Stage 1–5 checklists across all eight countries.

### 6.1 Style

A **modular monolith** API (one deployable backend with clear internal modules) plus a separate **worker** process for background jobs. This is the simplest design that is easy for another developer to maintain (Clause 1.3(a)) and can be split later if needed.

### 6.2 Components

```
             ┌────────────── Clients ───────────────┐
             │  Web app (Next.js)   Mobile (Expo)    │
             └───────────────┬───────────────────────┘
                             │ HTTPS (REST + JSON)
                  ┌──────────▼───────────┐
                  │   API service        │  auth, companies, scans, vault,
                  │   (NestJS/Fastify)   │  questionnaire, reports, review,
                  └───┬──────────┬───────┘  admin, billing (if in scope)
                      │          │ enqueue jobs
        ┌─────────────▼──┐   ┌───▼────────────────┐
        │ PostgreSQL     │   │ Valkey + BullMQ    │
        │ (managed, RLS) │   │ (job queues)       │
        └─────────────▲──┘   └───┬────────────────┘
                      │          │
                  ┌───┴──────────▼──────┐     ┌──────────────────────┐
                  │  Worker service     │────►│ Connectors (1 per    │
                  │  scan orchestrator, │     │ data source): CH, FR,│
                  │  doc processing,    │     │ Dojah, VIES, GLEIF,  │
                  │  scoring, alerts    │     │ EDGAR, USPTO, ICO... │
                  └───┬─────────────────┘     └──────────────────────┘
                      │
          ┌───────────▼──────────┐   ┌───────────────────────────┐
          │ DO Spaces (documents,│   │ AI document classifier    │
          │ encrypted, signed    │   │ (Claude API / Bedrock EU) │
          │ URLs)                │   └───────────────────────────┘
          └──────────────────────┘
```

### 6.3 Internal modules (API)

| Module | Responsibility |
|---|---|
| Auth & Users | Sign-up, login, magic link, MFA (TOTP/passkeys), sessions, roles, account deletion |
| Organisations | Tenants (a company or an investor firm), members, invitations, plan |
| Companies | Company profile: incorporation country/entity type, operating countries, investor countries, sector, stage |
| Questionnaire | Versioned question sets, answers, conditional logic |
| Scans | Create scan, track status, collect source results, trigger scoring |
| Connectors | One adapter per data source behind a common interface; caching, rate limiting, retries, provenance |
| Rules Engine | Load jurisdiction rule packs, evaluate against facts, produce findings |
| Scoring | Per-layer and overall scores, RAG status, history |
| Vault | Six-layer document slots, uploads, external vault links, document status |
| Documents AI | Text extraction, classification, key-field extraction, confidence |
| Reports | Gap report, priority actions, PDF export, verification badge |
| Review | Lawyer review queue, verdicts, comments, audit trail |
| Admin | Users, scans, system health, rule pack publishing, settings |
| Notifications | Email (transactional), in-app, push (mobile) |
| Audit | Append-only log of security-relevant events |

### 6.4 Connector interface

Every data source implements the same contract so new countries are "modules" (product doc Phase 3):

```ts
interface Connector {
  id: string;                         // "uk.companies_house"
  jurisdictions: string[];            // ["GB"]
  capabilities: ("entity_lookup" | "officers" | "filings" | "trademarks"
                 | "dp_registration" | "licence" | "court")[];
  lookup(input: CompanyRef): Promise<SourceResult>;
}

interface SourceResult {
  status: "found" | "not_found" | "ambiguous" | "error" | "unsupported";
  facts: Fact[];          // normalised, e.g. {key:"entity.status", value:"active"}
  provenance: { sourceUrl: string; retrievedAt: string; rawHash: string };
  matchConfidence: number; // 0–1, shown to users
}
```

Rules never call connectors directly; they read **facts**. That keeps rules testable and lets a fact come from an API, a questionnaire answer or an uploaded document.

### 6.5 Scan flow

1. **Company Connect:** user enters name, incorporation country, operating/user countries, investor countries, sector, stage.
2. **Public data scan (async jobs):** orchestrator selects connectors for those countries, runs them in parallel with timeouts, stores `SourceResult` rows.
3. **Questionnaire:** answers become facts.
4. **Vault:** each slot filled/empty becomes a fact; AI classification proposes which slot a document fits (user confirms).
5. **Rules evaluation:** applicable rule packs (EU + DE, US + US-DE, etc.) evaluated → findings (pass / gap / defect / verify).
6. **Scoring:** per-layer sub-scores and overall score; stored as a snapshot.
7. **Report:** gap report, top-5 actions, export.
8. **Lawyer review (paid plans):** reviewer confirms or overrides findings; verified badge if threshold met.

Re-scoring is triggered whenever answers, documents or source data change.

### 6.6 Non-functional targets (proposed)

| Item | Target |
|---|---|
| Preliminary report time | Under 2 minutes for questionnaire + available connectors (product doc: "minutes") |
| API p95 latency | Under 500 ms for normal reads |
| Availability | 99.5% monthly at MVP |
| Backups | Daily, point-in-time recovery; restore tested before launch |
| Accessibility | WCAG 2.2 AA for the web app |
| Browsers | Last 2 versions of Chrome, Safari, Edge, Firefox |
| Mobile | iOS 16+, Android 10+ (confirm with Expo SDK at build time) |

---

## 7. Deliverable (b): Database schema

PostgreSQL. Every tenant-owned table carries `organisation_id`, protected by **row-level security** so one customer can never read another's data. All tables have `id` (UUID), `created_at`, `updated_at`; soft delete where needed.

### 7.1 Entities

| Group | Entity | Key fields |
|---|---|---|
| Identity | `organisation` | name, type (company / investor / individual), plan_id, region |
| | `user` | email, name, mfa_enabled, locale, deleted_at |
| | `membership` | user_id, organisation_id, role (owner, member, lawyer, investor_viewer, admin) |
| Company | `company` | organisation_id, legal_name, registration_number, entity_type, incorporation_country, incorporation_state, stage, sector[] |
| | `company_market` | company_id, country, kind (operates / users / investors) |
| Jurisdiction | `jurisdiction` | code (NG, GB, US, US-DE, EU, DE…), parent_code, name |
| | `rule_pack` | jurisdiction_code, version, status (draft / approved / retired), approved_by, approved_at |
| | `rule` | rule_pack_id, rule_key (e.g. NG.DP.DCPMI_REGISTRATION), layer, area, definition (JSON), severity, confidence, effective_from, effective_to |
| Questionnaire | `question_set` | version, status |
| | `question` | question_set_id, key, type, options (JSON), show_if (JSON) |
| | `answer` | company_id, question_id, value (JSON), answered_by, answered_at |
| Scan | `scan` | company_id, type (self / investor / free), status, started_at, completed_at, rule_pack_versions (JSON) |
| | `source_result` | scan_id, connector_id, status, facts (JSON), source_url, retrieved_at, raw_hash, match_confidence |
| | `fact` | company_id, key, value (JSON), origin (connector / answer / document / reviewer), origin_ref, valid_from |
| | `finding` | scan_id, rule_id, outcome (pass / gap / defect / verify / not_applicable), layer, severity, explanation, evidence_refs (JSON) |
| Scoring | `score_snapshot` | scan_id, overall (0–100), layer_scores (JSON), method_version |
| | `action_item` | scan_id, finding_id, rank, title, action_type (quick_order / consult / register), status |
| Vault | `vault_slot` | layer, key, title, description, required_when (JSON) |
| | `document` | company_id, slot_id (nullable), storage_key or external_ref, source (upload / gdrive / notion / spotdraft), file_hash, mime, pages, classification, classification_confidence, extracted_fields (JSON), status |
| | `vault_connection` | organisation_id, provider, encrypted_credentials, scopes, status, last_synced_at |
| Review | `review_task` | scan_id, assigned_to, status, due_at |
| | `review_verdict` | review_task_id, finding_id, verdict (confirmed / overridden), note |
| | `verification_badge` | company_id, issued_at, expires_at, score_at_issue, public_token |
| Investor | `investor_scan_consent` | target_company_id, requester_org_id, consent_status, documents_shared (bool) |
| Billing (if in scope) | `plan`, `subscription`, `invoice` | provider refs (e.g. Paystack/Stripe), status, period |
| System | `audit_log` | organisation_id, actor_id, action, target, ip, user_agent, created_at (append-only) |
| | `job_run` | queue, job_id, status, attempts, error |
| | `connector_cache` | connector_id, request_hash, response, expires_at |

### 7.2 Notes

- **Facts layer:** facts are the single input to rules, so new sources only add facts.
- **Versioning:** scans store which rule-pack versions were used, so an old score stays explainable after rules change.
- **Personal data minimisation:** store officers' names and roles from registries; do not store home addresses or ID numbers unless needed.
- **Retention:** source raw data cached for a set period (e.g. 30–90 days), then only facts + provenance kept.

---

## 8. Deliverable (c): Technology stack and licence compliance

| Layer | Choice | Licence | Notes |
|---|---|---|---|
| Web | Next.js + React, TypeScript | MIT | Disable built-in image optimisation or use a custom loader so `sharp` (LGPL libvips) is not installed |
| Styling | Tailwind CSS | MIT | |
| Mobile | React Native + Expo, EAS Build/Submit | MIT | Shares types and API client with web |
| API | NestJS (or Fastify) | MIT | |
| ORM | Prisma or Drizzle | Apache-2.0 | |
| Database | PostgreSQL (DO Managed) | PostgreSQL Licence | |
| Queue / cache | **Valkey** + BullMQ | BSD-3 / MIT | **Do not use Redis 7.4+/8.x** (RSAL/SSPL/AGPL) |
| Object storage | DO Spaces (S3-compatible) | Service | |
| Rules evaluation | JSONLogic or CEL library | MIT / Apache-2.0 [verify exact package] | Rules stored as data |
| PDF text | pdf.js (`pdfjs-dist`), pypdf if Python | Apache-2.0 / BSD-3 | |
| OCR fallback | Tesseract | Apache-2.0 | Only if not using AI vision for scans |
| Rasterise | PDFium | BSD-3 | |
| Canvas (if needed) | `@napi-rs/canvas` | MIT | Not `node-canvas` (Cairo is LGPL) |
| **Banned** | Poppler, Ghostscript, MuPDF/PyMuPDF, Redis 8, node-canvas | GPL / AGPL / SSPL / LGPL | Enforced in CI |

**Compliance controls:**
- CI step runs a licence checker that **fails the build** on GPL, AGPL, LGPL or SSPL.
- Generate a CycloneDX SBOM per build; it becomes the Schedule 2 register.
- For dual-licensed packages (e.g. jszip, node-forge), record the permissive option elected.

---

## 9. Deliverable (d): Environment, repository and account setup

### 9.1 Accounts (all owned by the Client; contractor invited)

| Account | Owner | Contractor role | MFA |
|---|---|---|---|
| GitHub organisation "vero-scan" (dedicated, Clause 4.1) | Client | Admin during project | Enforced |
| DigitalOcean team | Client | Member | Enforced |
| Apple Developer (organisation) | Client | App Manager / Admin | Enforced |
| Google Play Console (organisation) | Client | Admin | Enforced |
| Expo organisation | Client | Developer | Enforced |
| Domain registrar / DNS | Client | DNS edit | Enforced |
| Transactional email (e.g. Postmark/Resend/SES) | Client | Member | Enforced |
| KYB vendor (Dojah, etc.) | Client | Developer | Enforced |
| AI provider (Anthropic or AWS/GCP) | Client | Developer | Enforced |
| Error monitoring (e.g. Sentry) | Client | Member | Enforced |

### 9.2 Repository layout

```
vero-scan/
  apps/
    web/          Next.js
    mobile/       Expo
    api/          NestJS
    worker/       background jobs
  packages/
    shared/       types, validation schemas, API client
    rules/        rule engine + jurisdiction rule packs (data)
    connectors/   one folder per data source
  docs/           architecture, ADRs, schema, integration map, runbooks
  infra/          DO App Platform spec, scripts
  spikes/         throwaway experiments (excluded from production)
  DEPENDENCIES.md (Schedule 2 register)
```

### 9.3 Environments

| Env | Where | Data |
|---|---|---|
| Local | Docker Compose (Postgres, Valkey) | Seed data only |
| Staging | DO App Platform, LON1 | Test data; vendor sandboxes |
| Production | DO App Platform, LON1 | Real data (set up in Milestone 3) |

### 9.4 CI/CD (GitHub Actions)

- On pull request: lint, type-check, unit tests, licence check, build.
- On merge to `main`: deploy to staging.
- Production deploy: manual approval (Milestone 3).
- Branch protection on `main`; pull requests required; daily commits (Clause 4.3).

---

## 10. Deliverable (e): API and data-source integration map

This section is the summary map. The per-item detail (primary route, fallback, endpoint, cost, terms, tier and what is still unverified) for every "publicly verifiable" item in the Client's Stage 1–5 checklists is in the companion document *Vero Scan — Verification Solutions Matrix*, which also covers Layer B sources and the URL-scan checklist.

Legend: **Launch** = built in Milestone 2; **Later** = Phase 3+; **Ref** = referenced only (link + document upload request).

### 10.1 Company registries

| Country | Source | Access | Cost | Auth | Data | Plan |
|---|---|---|---|---|---|---|
| **UK** | Companies House REST API | Official, free | Free | API key (HTTP Basic) | Status, SIC, officers, PSC, filings, accounts/confirmation due dates, charges, insolvency | **Launch** |
| UK | Companies House Streaming API | Official, free | Free | Stream key | Live changes | Later (monitoring) |
| **Nigeria** | CAC via KYB vendor (Dojah / Prembly / Mono / Smile ID) | Vendor | Per call (quote) | API key | Name, RC, status, address; advanced adds directors/shareholders | **Launch** |
| Nigeria | CAC–NIBSS super-agent API | Partner-only | Unknown | Unknown | Official data | Later (apply) |
| **Kenya** | BRS via Dojah / Smile ID / Youverify / Prembly / QoreID | Vendor | Per call | API key | Status, KRA PIN, directors, shareholders, encumbrances | **Launch** |
| **South Africa** | CIPC developer portal (official; Companies and BO products, OAuth 2.0) | Official API (apply) | Not published [verify] | Subscription key | Status incl. annual-return deregistration stages, type, directors | **Launch** (Didit at $0.75/lookup as the bridge until approved) |
| South Africa | CIPC bulk data extract | Official | R10 + R0.04/record | Order | Basic company/director data | Later |
| **Ghana** | ORC | Manual paid search | GHS 30–150 | — | Register data | **Ref** |
| Uganda | URSB API | Partner-only | Unknown | MOU | Company data | Later (request) |
| Zambia | PACRA via Dojah | Vendor | Per call | API key | Basic only, no directors | Later |
| Egypt, Rwanda, Senegal, Tanzania | — | Manual / vendor | — | — | — | Ref |
| **US — Delaware** | ICIS | No API; mining prohibited | $10–$20 status; $50–$175 certificate | — | Status | **Ref + certificate upload**, or licensed vendor |
| US — Wyoming | SOS bulk download subscription | Paid subscription [verify fee] | — | Form | Filings, parties | Ref |
| US — federal | SEC EDGAR (data.sec.gov) | Official, free | Free | User-Agent header; 10 req/s | Form D and SEC filings | **Launch** |
| **France** | Recherche d'entreprises (api.gouv.fr) | Official, free, keyless | Free | None (~7 req/s [verify]) | SIREN, status, officers, NAF | **Launch** |
| France | INSEE Sirene | Official, free | Free | API key; 30 req/min | Establishments | Launch (backup) |
| France | INPI RNE | Official, free | Free | Account token | Filings, officers | Later |
| **Germany** | Handelsregister / Unternehmensregister | No API; 60 lookups/hour; criminal-law warning | Free (web) | — | Register entries | **Ref**, or vendor (OpenRegister etc.) [verify vendor licensing] |
| Netherlands | KvK API | Official, paid | €6.40/month + €0.02/profile | API key | Profiles | Later |
| Estonia | e-Business Register (RIK) | Official, free contract | Free | Key → token | Full company data | Later |
| Spain | BORME gazette API | Official, free | Free | None | Gazette notices | Later |
| EU | BRIS / e-Justice | Web only | Free | — | — | Not used |
| EU | VIES VAT check | Official, free | Free | None | VAT validity | **Launch** |
| Global | GLEIF LEI API | Official, free, CC0 | Free | None | LEI, parent/child | **Launch** |
| Global | OpenCorporates | Paid licence | From £2,250/yr | Token | Aggregated registries | Optional |

**Easiest countries to add after the Phase 1 set:**
- **Africa:** Kenya → South Africa → Uganda (or Zambia for speed).
- **EU:** France → Estonia → Netherlands. Finland (PRH) and Ireland (CRO) are also easy if scope widens. Spain is hardest.

### 10.2 Regulatory registrations

| Country | Register | Access | Plan |
|---|---|---|---|
| UK | ICO data protection fee-payer register | Daily downloadable file; no API [verify format/licence] | **Launch** (nightly import + name/number match) |
| UK | FCA Financial Services Register | Official API, free | Launch for fintech companies |
| Nigeria | NDPC list of Data Controllers/Processors of Major Importance | Public web list, no API | Launch if terms allow periodic import [verify], else Ref |
| Kenya | ODPC Registered Data Handlers | Public web table (1,000+ rows), shows status | Launch if terms allow [verify] |
| Ghana | DPC register | Not verified | Ref |
| South Africa | Information Regulator | No public lookup found | Ref (ask for registration evidence) |
| US-CA | CPPA Data Broker Registry | Yearly published list | Later |

### 10.3 Trademarks

| Office | Access | Plan |
|---|---|---|
| USPTO | TSDR API (key, 60 req/min) + Open Data Portal | **Launch** (by serial/registration number; owner search via ODP [verify]) |
| EUIPO (EU marks) | Official API, OAuth2, sandbox then production approval [verify free tier] | **Launch** |
| France INPI | PI API (FR, EU and international marks) | Later |
| UKIPO | No public API; new service not before 2027 | Ref / vendor |
| Nigeria, Kenya, Ghana | Manual / agent search; no API | Ref |
| South Africa CIPC | Free e-search with login; no API | Ref |
| TMview | No public API | Not used |

### 10.4 Court records

| Source | Access | Plan |
|---|---|---|
| CourtListener / RECAP (US federal) | API; commercial use needs agreement; partial coverage | Later; label results "partial" |
| PACER | Paid per page | Not used |

### 10.5 Published privacy policy scan

- Discover the policy from the company's website (footer links, `/privacy`, sitemap).
- Fetch with an identifying user agent, respect `robots.txt`, low rate, cache.
- Store raw HTML, timestamp and SHA-256 hash for evidence.
- Run a deterministic checklist (controller identity, legal bases, rights, retention, transfers, DPO contact, cookie notice, CCPA "Do Not Sell/Share") plus AI clause detection that must quote the exact text (rejects unsupported claims).
- Flag stale citations (e.g. "TMG", "TTDSG", "NDPR" without NDPA).
- **Launch** for questionnaire-linked checks.

---

## 11. Rules engine, questionnaire and scoring model

### 11.1 Ownership

- **Developer:** builds the engine, the rule format, the admin tool to publish rule packs, tests and the scoring math.
- **Code & Clause (lawyers):** write and approve the legal content of each rule (obligation, instrument, trigger, evidence, consequence text). A rule pack only goes live with a named approver.

This split must be agreed in writing because writing legal content for 8 countries is not software development.

### 11.2 Rule format (stored as data)

Each country is a module ("rule pack") with inheritance (DE and FR inherit EU; US-DE inherits US):

```yaml
rule:
  id: "NG.DP.DCPMI_REGISTRATION"
  jurisdiction: "NG"
  layer: 3                      # 1–6 per product doc
  area: "data_protection"
  title: "Register with NDPC as a Data Controller/Processor of Major Importance"
  instrument:
    - {law: "Nigeria Data Protection Act 2023", cite: "s44"}
    - {law: "GAID 2025"}
  regulator: "NDPC"
  applies_when:                 # JSONLogic over facts
    all:
      - {in: ["NG", "facts.user_countries"]}
      - {">": ["facts.data_subjects.NG.6m", 200]}
  satisfied_when:
    any:
      - {"==": ["facts.registry.ndpc.dcpmi_listed", true]}
      - {"==": ["facts.vault.ndpc_certificate.present", true]}
  parameters: {tiers: [...]}    # fees/thresholds versioned separately
  recurrence: {type: "annual", due: {month: 3, day: 31}}
  evidence: ["NDPC registration certificate"]
  severity: "high"
  consequence_text: "Plain-language business consequence..."
  remediation: {action_type: "register", quick_order: "ndpc_registration"}
  effective_from: "2024-02-14"
  effective_to: null
  confidence: "verified"        # verified | needs_review — needs_review rules show "verify" and are not scored
  sources: ["https://ndpc.gov.ng/..."]
```

Design rules:
- **Derived facts** (e.g. `is_ccpa_business`, `ndpc_tier`, `eu_targeting`, `ai_risk_class`) are computed once and unit-tested, which keeps rules short.
- **Effective dates and phase-ins** handle changes like the EU AI Act Omnibus delays (Annex III high-risk now 2 Dec 2027) and the US BOI removal for domestic companies.
- **Stale citation patterns** let the document scan flag outdated references (e.g. "§13 TMG").

### 11.3 Questionnaire v1 (22 questions)

1. Country (and US state) and entity type of each incorporated entity
2. Countries with users/customers
3. US states with users (California, Colorado, other)
4. Countries of investors / parent company
5. Team location: employees vs contractors per country
6. Annual revenue band and headcount band
7. Personal data processed? Approximate data subjects per country (last 6 and 12 months)
8. Sensitive data (health, biometrics, financial, children, location)
9. Where data is hosted/processed; main vendors
10. Cookies, pixels, SDKs, analytics (types)
11. Marketing email/SMS (opt-in or opt-out)
12. AI use: role (provider / deployer / model trainer) and use-cases (chatbot, generative, hiring, credit, biometrics, education, insurance, moderation)
13. Automated decisions with significant effect without human review
14. Payments: via licensed PSP only / hold funds / wallet / lending / crypto / FX
15. Upload licensed partner agreement (Stripe, Paystack, sponsor bank)
16. Regulated sector (fintech, health, edtech, insurtech, telecoms, gaming, mobility, government)
17. B2C, B2B or both; subscriptions/auto-renewals
18. User-generated content or marketplace
19. Users under 18 / under 13
20. Signed IP assignments from founders, employees, contractors; pre-incorporation IP assigned
21. Local entity paying foreign affiliate for IP/software/services; IP moved offshore
22. Last filing dates: annual return / confirmation statement / franchise tax / beneficial-ownership filing / data-protection registration / NDPC audit return

Each answer maps to the rules it triggers (full mapping table goes in the rules spec).

### 11.4 Phase 1 rule coverage (seed list, to be legally reviewed)

| Layer | Nigeria | UK | US (DE/WY/CA) | Germany | France | Kenya | Ghana | South Africa |
|---|---|---|---|---|---|---|---|---|
| 1 Corporate | CAC annual returns; PSC register | Confirmation statement (£50); PSC; ID verification; accounts | DE franchise tax/annual report (1 Mar); registered agent; WY annual report; CA foreign qualification | Transparenzregister; accounts publication | RBE filing; accounts filing | Annual returns; BO register | Annual returns; BO filing | Annual return; BO filing |
| 2 IP | Copyright Act 2022 ownership; NOTAP tech-transfer registration | CDPA s11/s90(3) contractor assignment | Work-for-hire limits; 17 USC 204 assignment; CA Labor Code 2870 | UrhG §31(5), §69b; ArbnErfG | CPI L131-3 formal assignment | Copyright Act 2001 | Copyright Act 2005 | Copyright Act s21/s22(3); SARB approval for IP export |
| 3 Compliance | NDPA 2023 + GAID 2025; DCPMI registration; annual audit return (31 Mar); DPO; CBN licence; FCCPC lending; SEC (crypto) | UK GDPR + DUAA 2025; ICO fee; PECR cookies; FCA authorisation; CASS 15 | CCPA/CPRA thresholds ($26.625m etc.); new CPPA regs; MSB/state licences; DFAL | GDPR; §5 DDG imprint; §25 TDDDG cookies; BDSG §38 DPO (20+ staff); BaFin; NIS2 | GDPR; LCEN legal notice; CNIL cookie rules; Loi Toubon; ACPR | DPA 2019; ODPC registration (24 months); CBK PSP; VASP Act 2025 | DPA 2012 registration (before processing); BoG PSP; VASP Act | POPIA; Information Officer registration; PAIA manual/report; direct-marketing opt-in; SARB/PASA; FSCA CASP |
| 4 Commercial | FCCPA consumer terms | DMCC Act; consumer terms | FTC Act; CA auto-renewal law | BGB §312j/k buttons; BFSG accessibility | 3-click cancellation; French T&Cs | Consumer Protection Act 2012 | Electronic Transactions Act | CPA/ECTA cooling-off |
| 5 Fundraising | Cap table vs CAMA; SAFE vs Nigerian law | Investor rights under English law | SAFE mechanics; Form D | — | — | — | — | Exchange control on offshore structures |
| 6 AI & data | NDPA s37; policy only | UK GDPR Art 22A–D | CCPA ADMT (2027); CO SB 26-189; CA SB 53 | EU AI Act (Art 4, 5, 50 now; Annex III 2 Dec 2027); GDPR Art 22 | Same + CNIL AI guidance | DPA s35; AI Strategy (policy) | Policy only | POPIA s71; draft AI policy |

### 11.5 Scoring model (proposal for Client approval)

- Each finding has an **outcome** (pass, gap, defect, verify, not applicable) and **severity** (critical 10, high 6, medium 3, low 1 — weights configurable).
- **Layer sub-score** = 100 × (sum of weights of passed rules) ÷ (sum of weights of applicable, scored rules). "Verify" and "not applicable" rules are excluded.
- **Overall score** = weighted average of the six layer scores. Proposed default weights: Corporate 20%, IP 20%, Compliance 20%, Commercial 15%, Fundraising 10%, AI & data 15% (Fundraising and AI weights redistribute if not applicable).
- **Critical cap:** any open critical finding caps that layer at 49 (red), so one fatal gap cannot be hidden by many small passes.
- **RAG:** green ≥ 75, amber 50–74, red < 50 (configurable).
- **Free plan:** "approximate score" uses only questionnaire + public data, shown as a range (e.g. 55–70).
- **Verified badge:** overall ≥ threshold (Client to set, e.g. 80), no open critical findings, and lawyer review completed within the last 12 months.
- **Priority actions:** rank open findings by severity × cost-of-delay factor (deadline proximity, penalty size, fundraising relevance); show top 5.
- Every score snapshot records the method version and rule-pack versions.

---

## 12. Vault integrations

| Platform | API | Auth | What we can do | Launch plan |
|---|---|---|---|---|
| **Direct upload** | — | — | Full control; encrypted in Spaces | **Launch** |
| **Google Drive** | Yes | OAuth | With `drive.file` + Google Picker: only files the user picks (multi-select). Full-folder access needs restricted scopes → Google verification + annual CASA assessment (~$540–$4,500/yr, 2–8 weeks) and eligibility is not guaranteed | **Launch with Picker**; service-account folder share as "auto-sync" option later; CASA only if demand |
| **Notion** | Yes | Public OAuth connection (page picker) | Read pages, blocks, files; write back via File Upload API; no review needed unless listed in Marketplace | **Launch** |
| **SpotDraft** | Yes, REST v2.1 | Customer-generated Client ID/Secret (not OAuth) | Contracts, metadata, versions; upload executed contracts; webhooks | **Milestone 3**, subject to confirming which SpotDraft plans include API and whether binary download is available |
| **Digify** | Yes, paid plans | API key | Sharing and data-room creation documented; **listing/downloading data-room files not confirmed** | **Deferred** until Digify confirms in writing |

The Vero "Legal Infrastructure Template" (six-layer folder structure) can be offered as a Google Drive/Notion template users copy.

---

## 13. Document understanding (AI) design

**Pipeline:**
1. Extract text with pdf.js / pypdf; if no text layer, use AI vision (Claude reads scanned PDFs natively) or Tesseract fallback.
2. Cheap rules first (filename, title, keywords).
3. AI classification into document types (IP assignment, contractor agreement, SAFE, shareholders' agreement, DPA, privacy policy, MSA, employment contract, board resolution, etc.) with a JSON schema output: type, parties, dates, governing law, signature status, key clauses.
4. Show confidence; user confirms the slot. Low-confidence items go to "needs review".
5. Lawyers verify sufficiency on paid plans (the AI only detects presence and basic facts, never "sufficiency").

**Data protection:**
- AI provider is a **sub-processor** (needs a DPA; listed in the sub-processor list).
- Use a **zero-data-retention** agreement (Anthropic sales) with a model that supports it, or **Claude on AWS Bedrock / Google Vertex in an EU region** if EU/UK data residency is required. [verify which models are available per region]
- Send only the pages/clauses needed; make AI processing a per-organisation setting; log every AI call in the audit log.
- Carry out a DPIA (documents contain names, salaries, IDs).

---

## 14. Security and data protection baseline

| Area | Commitment |
|---|---|
| Standard | OWASP ASVS 5.0 Level 2 (web/API); OWASP MASVS L1 (mobile); external penetration test before launch |
| Identity | Email + magic link/password; MFA (TOTP/passkeys) enforceable per organisation; SSO later. **No social login in v1** (avoids Apple's "Sign in with Apple" requirement) |
| Access control | Role-based; tenant isolation via Postgres row-level security; least privilege for staff and lawyers |
| Encryption | TLS 1.2+ everywhere incl. DB; DO-managed encryption at rest; **application-level envelope encryption** for vault credentials and API keys; signed short-lived URLs for files |
| Audit | Append-only audit log (logins, MFA changes, integrations, document access/export, AI calls, admin actions, deletions); never log document content or secrets |
| Secrets | DO App Platform encrypted environment variables; GitHub environment secrets; rotation runbook |
| Platform | MFA on all accounts; DO firewalls and trusted sources on DBs; private VPC; daily backups + PITR; tested restore |
| Webhooks | HMAC verification (SpotDraft, Notion, Drive channel tokens) |
| Mobile store rules | In-app account deletion (Apple 5.1.1(v)); web deletion link (Google Play); demo account for review; no in-app purchases |
| Privacy | Vero's own privacy policy, DPA template, sub-processor list (DigitalOcean, AI provider, email, Expo, KYB vendor), DPIA, retention and deletion schedule, data export for customers |
| Registry personal data | Legitimate-interest assessment; GDPR Art 14 notice; store officer names/roles only; provenance on every fact; match confidence shown to users |
| Accuracy | Every flag shows its source and date; "not found" is never presented as proof of absence |

Do not claim SOC 2 or ISO 27001 certification for Vero Scan.

---

## 15. Deliverable (f): Timeline for Milestones 2 and 3

Total project: 5 calendar months from execution (Clause 3.1), paused while waiting for Client inputs (Clause 3.2). Milestone 1 = month 1. Two-week sprints.

### Milestone 2 — Core Product Build (≈ weeks 5–14)

| Sprint | Weeks | Scope |
|---|---|---|
| S1 | 5–6 | Auth, organisations, roles, MFA, audit log; company profile; CI/CD to staging; connector framework (facts, provenance, tiers, match confidence); UK Layer A (Companies House, Gazette), SEC Form D, GLEIF, VIES, sanctions ingest |
| S2 | 7–8 | Questionnaire engine (versioned); rules engine core; France Layer A (official APIs); Layer B Tier 0 (discovery, domain, website crawl, LLM classification, apps, ATS feeds); entity resolution; first rule packs (UK, Nigeria) |
| S3 | 9–10 | Nigeria Layer A (Mono plus second vendor, NDPC feed, CBN/SEC/FCCPC imports, status-report parsing, certificate upload pipeline); URL scan (discovery, consent behaviour, GAID/GDPR/CCPA adequacy); scan orchestrator |
| S4 | 11–12 | US, Kenya and South Africa Layer A; vault (upload, six-layer slots), document AI classification, Google Drive Picker, Notion; document-verification pipeline (good standing, EIN, 83(b), trademark certificates); scoring engine |
| S5 | 13–14 | Germany and Ghana Layer A; stage inference; remaining rule packs (US, DE, FR, KE, GH, ZA); reports (gap report, top-5 actions, PDF export); lawyer review queue; admin dashboard; internal testing report → submit to Technical Adviser |

### Milestone 3 — Frontend, Mobile, QA, Launch (≈ weeks 15–22)

| Sprint | Weeks | Scope |
|---|---|---|
| S6 | 15–16 | Web UI to brand guidelines: onboarding, scan flow, dashboard, vault, reports |
| S7 | 17–18 | Mobile app (Expo) with equivalent features; push notifications; account deletion; SpotDraft integration (if confirmed) |
| S8 | 19–20 | QA: functional, performance, security (pen test), cross-browser/device; bug fixing |
| S9 | 21–22 | Production deployment on DO, domain, SSL; App Store / Play submission; documentation; handover session (Clause 1.2(C)(g)) |

Buffers: Technical Adviser reviews (10 business days each) and app-store review (1–2 weeks) are the main schedule risks. The plan should show them explicitly.

**Not in this plan unless confirmed as in scope:** billing/subscriptions, continuous monitoring and regulatory alerts (Scale plan), investor-facing scans (Phase 4), countries beyond the 8 Phase 1 countries, a custom vault, Digify.

---

## 16. Running costs (estimates, Client-paid)

| Item | Estimate | Notes |
|---|---|---|
| DigitalOcean staging | ~$66/month | App Platform + Postgres + Valkey |
| DigitalOcean production (non-HA) | ~$125–150/month | HA Postgres now needs Advanced Edition (~$260/month extra) |
| Expo EAS Starter | $19/month | Builds and submissions |
| Apple Developer | $99/year | Organisation account |
| Google Play | $25 one-time | Organisation account |
| KYB vendor (Dojah etc.) | Per call, quote needed | Basic and advanced lookups |
| AI (Claude API / Bedrock) | Usage-based | Depends on document volume |
| Transactional email, error monitoring | ~$0–50/month at MVP | Free tiers may suffice |
| Optional: OpenCorporates | From £2,250/year | Only if broader coverage needed |
| Optional: Google CASA assessment | ~$540–4,500/year | Only for full-Drive sync |
| Optional: Delaware status checks | $10–20 each | Or customer uploads certificate |
| Optional: penetration test | Quote needed | Recommended before launch |

---

## 17. Risks and mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Scope in product document exceeds the fixed ₦3.5M contract | High | High | Written scope confirmation (section 18); change orders for extras |
| 2 | Legal rule content for 8 countries is large and needs lawyers | High | High | Code & Clause owns content; developer delivers engine + sample rules |
| 3 | No official African registry APIs | Certain | Medium | KYB vendors; document upload fallback |
| 4 | Third-party data costs not budgeted | High | Medium | Client confirms budget owner before Milestone 2 |
| 5 | Germany and Delaware cannot be automated legally | Certain | Medium | Reference + certificate upload; licensed vendor |
| 6 | Google Drive restricted scope verification | Medium | Medium | Picker (`drive.file`) at launch |
| 7 | Digify/SpotDraft API limits | Medium | Low | Defer until confirmed |
| 8 | Inaccurate registry match leads to wrong flag (reputational/defamation risk) | Medium | High | Match confidence, provenance, "verify" state, lawyer review |
| 9 | Delays waiting on Client inputs or Technical Adviser reviews | Medium | Medium | Dated request log; Clause 3.2 pause |
| 10 | Apple/Google org accounts and D-U-N-S take weeks | Medium | Medium | Start in week 1 |
| 11 | Copyleft dependency slips in | Low | High | CI licence gate + SBOM |
| 12 | AI misclassifies documents | Medium | Medium | User confirmation, confidence thresholds, lawyer review |
| 13 | Laws change during build (e.g. EU AI Act, NDPC fees) | High | Low | Rules are versioned data with effective dates |

---

## 18. Questions and decisions needed from the Client

1. **Scope:** Is the baseline in section 15 the agreed scope for ₦3.5M? Which of billing, monitoring/alerts, investor scans and extra countries are change orders?
2. **Countries:** Confirm the 8 Phase 1 countries and the launch connectors (D1, D2).
3. **Legal content:** Which Code & Clause lawyer owns and approves the rule packs, and by when?
4. **Data costs:** Who pays for KYB vendor calls, AI usage, Expo and optional services?
5. **Scoring:** Approve the scoring method (section 11.5); set the badge threshold.
6. **Lawyer review:** In-app review queue at launch, or manual process?
7. **Data residency:** Must customer documents stay in the UK/EU? (Affects AI provider choice.)
8. **Brand/UX:** Who supplies brand guidelines and designs, and when?
9. **Accounts:** Confirm the Client will create the DigitalOcean, Apple, Google Play, Expo and domain accounts (and start D-U-N-S).
10. **AI use:** Written approval of the contractor's AI tool use (Clause 1.6).
11. **Technical Adviser:** Name, contact, and review process.
12. **Billing provider (if in scope):** Paystack, Stripe or other?

---

## 19. Verification checklist (before final submission)

Research items still to confirm:

- [ ] Dojah / Smile ID / Youverify: written quotes, country coverage, sandbox access
- [ ] NIBSS/CAC super-agent onboarding requirements
- [ ] CAC, eCitizen (Kenya), NDPC and ODPC terms of use on automated access
- [ ] CIPC "APIVerse" existence; CIPC bulk extract ordering process
- [ ] ICO register file format and licence
- [ ] EUIPO API free tier and quotas; USPTO ODP owner search
- [ ] Recherche d'entreprises and INPI rate limits and licence clauses
- [ ] German vendor (e.g. OpenRegister) data sourcing and licence
- [ ] SpotDraft API plan gating and document download; Digify data-room file access
- [ ] Claude model availability under ZDR and in Bedrock/Vertex EU regions
- [ ] DigitalOcean PostgreSQL plan changes and pricing at time of setup
- [ ] Legal rule items tagged unverified in the legal research (e.g. NDPC EHL/UHL tiers and fees, Kenya ODPC fees, Ghana DPC renewal, France LCEN article number, CCPA 2026 penalty amounts)

Contract items:

- [ ] AI disclosure sent and acknowledged (Clause 1.6)
- [ ] GitHub account created and transferred; Schedule 3 signed
- [ ] Stack approved in writing by the Client
- [ ] Timeline approved by the Technical Adviser
- [ ] Dependency register (Schedule 2) started
- [ ] All Milestone 1 files in the Client's repository
- [ ] Request/response log maintained (Clause 3.2)

---

## 20. Sources

Key sources used (full source lists are kept with the research notes):

**Registries and data**
- NIBSS–CAC API platform: https://nibss-plc.com.ng/nibss-and-cac-launch-api-integration-platform-to-streamline-business-services-and-enhance-data-verification
- Dojah CAC: https://docs.dojah.io/api-reference/business-verification/lookup-cac.md
- Dojah Kenya: https://docs.dojah.io/api-reference/business-verification/lookup-kenya-business.md
- Smile ID KYB: https://legacy-docs.usesmileid.com/products/for-businesses-kyb/business-verification
- BRS Kenya fees: https://brs.go.ke/fee-schedule-companies-registry/
- CIPC fees: https://www.cipc.co.za//?page_id=1649
- NDPC DCPMI list: https://services.ndpc.gov.ng/repo/?flp=dcmi
- ODPC registered handlers: https://www.odpc.go.ke/registered-data-handlers/
- Companies House auth: https://developer-specs.company-information.service.gov.uk/guides/authorisation
- Companies House guidelines: https://developer.company-information.service.gov.uk/developer-guidelines
- ICO register download: https://cy.ico.org.uk/about-the-ico/what-we-do/register-of-fee-payers/download-the-register/
- Delaware ICIS: https://icis.corp.delaware.gov/ecorp/EntitySearch/NameSearch.aspx
- Delaware status fees: https://corp.delaware.gov/onlinestatus/
- OpenCorporates pricing: https://opencorporates.com/pricing/
- SEC EDGAR access: https://www.sec.gov/os/accessing-edgar-data
- USPTO TSDR: https://developer.uspto.gov/faq/tsdr-api-bulk-download
- CourtListener API change: https://free.law/2026/05/07/api-included-in-memberships/
- Handelsregister notes: https://github.com/bundesAPI/handelsregister
- France Sirene guide: https://api.gouv.fr/guides/quelle-api-sirene
- INPI API: https://www.inpi.fr/acces-aux-api-et-ftp-data-inpi
- KvK pricing: https://developers.kvk.nl/pricing
- Estonia RIK API: https://avaandmed.ariregister.rik.ee/en/open-data-api/introduction-api-services
- EU high-value datasets: https://data.europa.eu/en/news-events/news/high-value-datasets-what-has-changed-and-what-will-come-next
- EUIPO developer portal: https://dev.euipo.europa.eu/

**Legal**
- EU AI Act Omnibus timeline: https://fpf.org/blog/the-ai-act-implementation-timeline-what-changes-under-the-ai-omnibus/
- TMG replaced by DDG: https://www.ihk.de/bayreuth/hauptnavigation/service/recht/allgemeine-rechtsthemen/telemediengesetz-tmg-ist-jetzt-digitale-dienste-gesetz-ddg--6204406
- UK DUAA commencement: https://www.kennedyslaw.com/en/thought-leadership/article/2026/the-data-use-and-access-act-2025-commencement-dates-and-planned-guidance-for-2026
- US BOI removal: https://www.davispolk.com/insights/client-update/fincen-eliminates-beneficial-ownership-reporting-requirements-u-s-companies
- Nigeria GAID 2025: https://privacymatters.dlapiper.com/2025/06/nigeria-ndpc-issues-gaid-key-compliance-insights/
- ICO fee tiers: https://www.gov.uk/government/consultations/data-protection-fee-regime-proposed-changes/outcome/data-protection-fee-regime-government-response
- Delaware franchise tax: https://corp.delaware.gov/paytaxes/
- CCPA threshold: https://www.cppa.ca.gov/regulations/cpi_adjustment.html
- Kenya ODPC registration regulations: https://www.odpc.go.ke/wp-content/uploads/2024/03/THE-DATA-PROTECTION-REGISTRATION-OF-DATA-CONTROLLERS-AND-DATA-PROCESSORS-REGULATIONS-2021.pdf
- Ghana DPC registration: https://dataprotection.org.gh/registration/
- South Africa POPIA regulations: https://bowmanslaw.com/insights/south-africa-popia-regulations-get-a-makeover-what-you-need-to-know/

**Integrations and infrastructure**
- Google Drive scopes: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Notion public integrations: https://developers.notion.com/guides/connections-and-tokens/public-integrations/overview
- SpotDraft API: https://developer.spotdraft.com/docs/getting-started/quickstart
- Digify API: https://digify.com/api-integrations.html
- Claude data retention: https://platform.claude.com/docs/en/manage-claude/api-and-data-retention
- DigitalOcean regions: https://docs.digitalocean.com/platform/regional-availability/
- DigitalOcean DB plan changes: https://docs.digitalocean.com/release-notes/upcoming/dbaas-plan-changes/
- Expo pricing: https://expo.dev/pricing
- Apple review guidelines: https://developer.apple.com/app-store/review/guidelines/
- Redis licences: https://redis.io/legal/licenses/
