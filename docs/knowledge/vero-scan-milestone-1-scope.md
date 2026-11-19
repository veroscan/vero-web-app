# Vero Scan – Milestone 1 Scope (DRAFT)

Prepared for: Emmanuel Edet (Independent Contractor) – Code and Clause LTD
Status: Draft for Client's Technical Adviser review. Based on the Vero Scan product document (summary read) and Contract Clause 1.2(A). Nothing here is approved until confirmed in writing by the Client.

## 1. Purpose
Milestone 1 (Discovery, Architecture, Setup) produces the plans and foundations needed before any build. It is the trigger for the first payment tranche (₦1,400,000) under Clause 5.1(a).

## 2. Contract deliverables → what we will produce

| Clause 1.2(A) | Deliverable | Content |
|---|---|---|
| (a) | Technical architecture document | System, frontend, backend, data, API, integration and security architecture (section 5) |
| (b) | Database schema | Entities, relationships, migrations plan (section 6) |
| (c) | Technology stack confirmation | Web, mobile, backend, hosting; for written Client approval (section 4) |
| (d) | Environment and repo setup | Client-owned GitHub account and repo, branching, CI, staging on Client's DigitalOcean |
| (e) | API integration map | Per jurisdiction and data source: access method, cost, legal terms, fallback (section 7) |
| (f) | Timeline and development plan | Milestones 2 and 3 broken into sprints, for Technical Adviser approval |

## 3. Product scope baseline (from the product document)
- Company connect → public data scan → document vault (6 layers) → product questionnaire → 0–100 score → RAG breakdown, gap report, top-5 actions, verified badge.
- Lawyer verification workflow for paid plans.
- Plans: Free, Growth, Scale.
- Vault v1 integrates with existing tools (Google Drive, Notion, SpotDraft, Digify); no custom document storage.
- Delivery phases: (1) questionnaire scans for core countries, (2) registry API integrations, (3) more countries as modules, (4) investor-facing scans.

### Scope risk – must be confirmed in writing by the Client
The contract mentions web and mobile apps, scanning engine, auth and admin dashboard. The product document additionally implies: billing/subscriptions, lawyer review workflow, verified badge, monitoring and alerts, investor scans, and 8+ countries. Proposed contract-scope baseline for the ₦3.5M fee (to be agreed):
- **In:** Phase 1 (questionnaire scans) and Phase 2 for UK (Companies House) and Nigeria (via provider), web + mobile, admin dashboard, auth, scoring engine, vault integration for Google Drive, basic lawyer-review queue.
- **Out / change-order candidates:** billing, continuous monitoring and alerts, investor-facing scans, countries beyond the first four regions, custom vault, paid data subscriptions.

## 4. Proposed stack (for Client approval)
- Web: Next.js (TypeScript)
- Mobile: React Native with Expo (shares TypeScript types and API client with web)
- Backend: Node.js (NestJS or Fastify) with REST API; background jobs via BullMQ and Redis
- Database: PostgreSQL (DigitalOcean Managed Database); object storage via DigitalOcean Spaces if needed
- Auth: email/password + OAuth (Google), role-based access (founder, team member, lawyer, admin)
- Hosting: DigitalOcean (App Platform or droplets with Docker), SSL, Client-supplied domain
- CI/CD: GitHub Actions on the Client's repo

## 5. Architecture outline
1. **API service:** auth, companies, scans, vault, questionnaire, reports, admin.
2. **Scan orchestrator:** creates a scan, fans out source checks as queued jobs, collects results, triggers scoring.
3. **Connector layer:** one module per data source behind a common interface (`lookup(company) → normalized findings`). Adding a country adds a connector, not core changes.
4. **Scoring engine:** rules per layer producing RAG status and 0–100 score, versioned so scores stay explainable.
5. **Document vault service:** slots per layer, status tracking, external integrations.
6. **Review workflow:** lawyer queue, sufficiency verdicts, audit trail.
7. **Admin dashboard:** users, scans, system health, rule and settings configuration.
8. **Security:** encryption in transit and at rest, per-company data isolation, audit logs, secrets in environment store, least-privilege access, data-retention policy.

## 6. Data model (entities, first pass)
Organization, User, Company, Jurisdiction, Scan, ScanSourceResult, Finding, Layer, VaultSlot, Document, QuestionnaireTemplate, QuestionnaireAnswer, Rule, Score, ScoreBreakdown, GapItem, ReviewTask, Verification, Plan, Subscription (if billing is in scope), AuditLog.

## 7. Data-source map (first pass, to be verified in Milestone 1)

| Region | Source | Access | Notes |
|---|---|---|---|
| UK | Companies House | Official free API (key) | Rate-limited; officers, status, filings |
| UK | ICO register | Check access method | Mentioned in product doc |
| UK/EU/US | Trademark databases | Check per office | Mentioned in product doc |
| Nigeria | CAC | No official API found | Paid KYC provider (e.g., Dojah) or scraping (risk) |
| US | Delaware and other states | State portals or aggregator | Aggregators are paid |
| EU | National registers / BRIS | BRIS web-only | Aggregator or per-country |
| All | OpenCorporates | Check terms and pricing | Named in product doc |

Open point: who pays for data subscriptions.

## 8. Timeline outline (5 months total, Clause 3.1)
- Month 0 (Milestone 1): discovery, approvals, setup, schema, source map.
- Months 1–3 (Milestone 2): backend, DB, connectors, scoring, auth, admin, internal testing.
- Months 3–5 (Milestone 3): web UI, mobile apps, QA, deployment, documentation, handover.
Detailed sprint plan to be produced at the end of Milestone 1.

## 9. Open questions for the Client
1. Is the baseline in section 3 the agreed scope for ₦3.5M? Which items are change orders?
2. Which countries and sources are required for launch?
3. Who pays for registry/provider subscriptions and per-lookup fees?
4. Brand guidelines and UX/design assets: who supplies them and when?
5. Scoring rubric: who defines the rules per layer and the badge threshold?
6. Lawyer verification: in-app workflow or manual process at launch?
7. Written approval of AI tool use (Clause 1.6) and the GitHub account to be used (Clause 4).
8. Technical Adviser: name and contact.

## 10. Assumptions and risks
- Registry coverage outside the UK depends on third-party providers; some may need scraping with legal and reliability risk.
- Scope in the product document exceeds the contract text; unconfirmed scope could expand the work at a fixed fee.
- Project duration pauses while waiting for client inputs (Clause 3.2); keep a written log of requests and delays.
- No code or data from outside the Client's repo; all work pushed daily (Clause 4).
