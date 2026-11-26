# Get your keys: direct links and steps

Written 22 Nov 2026. Every key goes on its own line in `vero-scan/.env` (git ignores this file). You don't
need to paste a key into chat. Once one is set, Claude makes one real lookup and checks the reply.

On 22 Nov 2026 each link was opened automatically:
- **Checked**: the page opened and was the right sign-up, sign-in or key page.
- **Open by hand**: the site wouldn't show its page to an automated check. The link is still the
  service's own address.

Never put a password or a one-time code anywhere in the project.

---

## 1. No sign-up: type a value (5 minutes)

Each of these is just text you choose. Use a company mailbox, never a personal one.

| Line in .env | What to write | What it switches on |
|---|---|---|
| `PUBLIC_API_USER_AGENT` | `VeroScan company checks` | GLEIF (LEI), EU VAT check (VIES), ESMA prospectus register, and the free registers of Norway, Finland, Czechia, Poland and Singapore |
| `SEC_USER_AGENT` | `VeroScan contact@yourdomain.com` | SEC EDGAR (US Form D). The SEC requires a contact email in this value. |
| `FR_RECHERCHE_ENTREPRISES_USER_AGENT` | `VeroScan company checks` | French company register |
| `WEB_SCAN_USER_AGENT` | `VeroScan website check (contact@yourdomain.com)` | Reading a company's website |
| `SANCTIONS_LISTS` | `ofac,uk,un,fr,eu` | The five sanctions lists |
| `APP_ENCRYPTION_KEY` | Run `node -e "console.log(crypto.randomBytes(32).toString('base64'))"` and paste the output | Needed in production. The value in the example file is for development only. |

---

## 2. Free government keys

### UK: Companies House → `COMPANIES_HOUSE_API_KEY`
Link: https://developer.company-information.service.gov.uk/manage-applications (Done)
1. Sign in, or create an account.
2. Click **Create an application**, give it a name, and choose **Live**.
3. Open the application, click **Create new key**, and choose **REST**.
4. Copy the key into `.env`.

### UK: HMRC VAT check → `HMRC_CLIENT_ID`, `HMRC_CLIENT_SECRET`
Link: https://developer.service.hmrc.gov.uk/developer/registration (Done)
1. Register, confirm your email, and sign in.
2. Go to **Applications** and add an application.
3. Subscribe it to the **Check a UK VAT number** API (version 2.0).
4. Copy the client ID and the client secret.
5. HMRC gives sandbox keys first. Production keys come after you ask HMRC for them from the same
   application, and that is reviewed by hand.
6. Leave `HMRC_BASE_URL` empty for live keys. For sandbox keys, set it to
   `https://test-api.service.hmrc.gov.uk`.

### US: trademarks (USPTO TSDR) → `USPTO_TSDR_API_KEY`
Link: https://account.uspto.gov/api-manager/ (open by hand)
1. Sign in with a MyUSPTO account, or create one.
2. Request a TSDR API key and copy it.

### US: patents (USPTO Open Data Portal) → `USPTO_ODP_API_KEY`
Link: https://data.uspto.gov/myodp (open by hand)
1. Sign in with MyUSPTO. The portal also asks for an ID.me identity check, which is a one-time step.
2. Copy the API key shown on the MyODP page.

### EU: trade marks (EUIPO) → `EUIPO_CLIENT_ID`, `EUIPO_CLIENT_SECRET`
Link: https://dev.euipo.europa.eu/user/register (checked)
1. Create an account and sign in.
2. Create an app and subscribe it to **Trademark Search**.
3. EUIPO approves the subscription by hand. Production access comes after sandbox access.
4. Copy the client ID and the client secret.
5. For sandbox keys, also set the two sandbox addresses written in `.env.example`.

### Australia: ABN Lookup → `AU_ABR_GUID`
Link: https://abr.business.gov.au/Tools/WebServicesAgreement (Done)
1. Read and accept the agreement, then fill in the registration form.
2. The GUID arrives by email. Copy it into `.env`.

### New Zealand: NZBN → `NZ_NZBN_API_KEY`
Link: https://portal.api.business.govt.nz/ (checked)
1. Log in or sign up.
2. Find the **NZBN** API (version 5) and subscribe to it.
3. Copy the subscription key.

### Canada: federal corporations → `CA_CORPORATIONS_API_KEY`
Link: https://api.ised-isde.canada.ca/ (open by hand)
1. Sign in to the ISED API Store.
2. Open **Federal Corporation API** and choose the **Public** plan.
3. Copy the user-key.

### Ireland: CRO → `IE_CRO_EMAIL`, `IE_CRO_API_KEY`
Link: https://services.cro.ie/ (checked; the sign-up page itself couldn't be checked)
1. Sign up.
2. CRO asks you to sign its terms (a PDF) and email them back.
3. You then receive an API key. Put the email address you registered with in `IE_CRO_EMAIL`.

### Denmark: CVR → `DK_CVR_USERNAME`, `DK_CVR_PASSWORD`
Link: https://datacvr.virk.dk/artikel/system-til-system-adgang-til-cvr-data (open by hand)
- This is an access request to the Danish Business Authority (Erhvervsstyrelsen), not an instant key.
- The page above says how to apply. As far as I recall, it is by email to cvrselvbetjening@erst.dk,
  but confirm that on the page.
- They send back a username and a password, which are the API credentials. These two go in `.env`
  yourself; never type them into chat.

### Switzerland: Zefix → `ZEFIX_USERNAME`, `ZEFIX_PASSWORD`
Link: https://www.zefix.admin.ch/ (open by hand in a normal browser)
- REST access is given on request by the Federal Office of Justice.
- As far as I recall, you request it by email to zefix@bj.admin.ch. Confirm this on the site.

---

## 3. Paid data (owner decisions first)

| Service | .env line | Link | Notes |
|---|---|---|---|
| OpenRegister (Germany) | `OPENREGISTER_API_KEY` | https://openregister.de/keys (open by hand) | Free plan has 500 credits a month, about 45 lookups. |
| OpenCorporates (fallback for any country) | `OPENCORPORATES_API_TOKEN` | https://opencorporates.com/pricing/ (checked) | Paid. The licence terms are your decision. |
| KVK (Netherlands) | `NL_KVK_API_KEY` | https://www.kvk.nl/ (open by hand) | KVK's old developer portal now leads to a "not found" page. Look for **KVK API** under products (**producten bestellen**). About EUR 6.40 a month. |
| Middesk (Delaware) | `MIDDESK_API_KEY` | https://www.middesk.com/contact (checked) | Sales call, no self-serve. Set `DELAWARE_VENDOR=middesk`. |
| Cobalt Intelligence (Delaware) | `COBALT_API_KEY` | https://cobaltintelligence.com/ (open by hand) | The other Delaware option. Set `DELAWARE_VENDOR=cobalt`. Pick only one Delaware vendor. |
| Mono (Nigeria) | `MONO_SECRET_KEY` | https://app.mono.co/ (open by hand) | Sign up, create an app, and copy its secret key. |

Not to set yet:
- **CIPC (South Africa).** https://developer.cipc.co.za/signin works, but there is no line in `.env` for it.
  Accepting CIPC's terms is your decision first.
- **NDPC (Nigeria).** The list of licensed DPCOs is public at https://services.ndpc.gov.ng/repo/?flp=dpco.
  Claude will check its format before `NDPC_REGISTER_URL` is set.
- **ICO register (UK).** The ICO site refuses automated checks. The download address is still open.

---

## 4. Running the product (needed for launch, not for the scan)

### Email: Resend → `RESEND_API_KEY`, `MAIL_FROM`
Link: https://resend.com/login, then **API Keys**
1. Add and verify your sending domain (DNS records) under **Domains**.
2. Create an API key.
3. Set `MAIL_FROM` to an address on that domain, for example `Vero <no-reply@yourdomain.com>`.

### File storage: DigitalOcean Spaces → `SPACES_*`
Link: https://cloud.digitalocean.com/account/api/spaces (open by hand)
1. Create a Space (bucket), for example in `fra1`.
2. Generate a Spaces key and copy the key and the secret.
3. Set `SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com`, `SPACES_REGION=fra1`, and `SPACES_BUCKET=<name>`.

### Job queue: Valkey → `VALKEY_URL`
Link: https://cloud.digitalocean.com/databases/new (open by hand)
1. Choose **Valkey** (never Redis 7.4+).
2. Copy the connection string.

### Payments: Stripe → `STRIPE_*` (off until all four are set)
1. https://dashboard.stripe.com/apikeys (checked): copy the **Secret key** into `STRIPE_SECRET_KEY`.
2. https://dashboard.stripe.com/products: create the Growth and Scale products, each with a price.
   Copy each price id (`price_…`) into `STRIPE_PRICE_GROWTH` and `STRIPE_PRICE_SCALE`.
3. https://dashboard.stripe.com/webhooks: add the endpoint `<API_BASE_URL>/v1/webhooks/stripe`, then copy
   its signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

### Document helper: Anthropic → `ANTHROPIC_API_KEY`
Link: https://platform.claude.com/settings/keys (checked)
- Keep `AI_DOCUMENT_HELPER_ENABLED=false` for real customer documents until zero data retention is
  arranged with Anthropic.

### GitHub App → `GITHUB_APP_*`, `GITHUB_WEBHOOK_SECRET`
Link: https://github.com/settings/apps/new (checked; sign in first)
1. Name the app. Set the webhook URL to `<API_BASE_URL>/v1/webhooks/github`, and type a webhook secret
   of at least 20 characters.
2. Give it read-only permissions.
3. After you create it, copy the **App ID** and the slug (from github.com/apps/<slug>).
4. Click **Generate a private key**. Save the `.pem` file outside the project and set
   `GITHUB_APP_PRIVATE_KEY_FILE` to its path.

### DocuSign → `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_SECRET_KEY`
Link: https://admindemo.docusign.com/apps-and-keys (open by hand; create a free developer account first)
1. Add an app and copy its integration key.
2. Add a secret key.
3. Add the redirect URI `<API_BASE_URL>/v1/connections/docusign/callback`.

### Google Drive → `GOOGLE_DRIVE_*`, `GOOGLE_PICKER_API_KEY`, `GOOGLE_CLOUD_PROJECT_NUMBER`
Link: https://console.cloud.google.com/apis/credentials (checked)
1. Enable the **Google Drive API** and the **Google Picker API**.
2. Create an **OAuth client ID** of type Web application, with the redirect
   `<API_BASE_URL>/v1/connections/google-drive/callback`.
3. Create an **API key** and restrict it to the Picker API and to your web address.
4. The project number is on the console's home page.

### SharePoint / OneDrive → `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
Link: https://entra.microsoft.com/ (open by hand), then **App registrations**, then **New registration**
1. Choose the Web platform, with the redirect `<API_BASE_URL>/v1/connections/sharepoint/callback`.
2. Copy the **Application (client) ID**.
3. Under **Certificates & secrets**, create a new client secret.

### Email forwarding (Resend receiving) → `INBOUND_EMAIL_*`
In Resend, add a receiving domain such as `in.yourdomain.com` and point its MX records at Resend. Add a
webhook to `<API_BASE_URL>/v1/webhooks/inbound-email`, then copy its signing secret (`whsec_…`).

---

## Suggested order

Do these first, because they are free and most of the scan uses them:
1. Section 1 (no sign-up).
2. Companies House.
3. HMRC.
4. USPTO (both keys).
5. EUIPO.
6. Australia, New Zealand, Canada and Ireland.
7. Send the Denmark and Switzerland access requests.

Then decide on the paid ones. Section 4 is needed before launch.
