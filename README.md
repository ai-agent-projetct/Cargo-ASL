# Cargo ASL

Cargo ASL is a logistics workspace with a vanilla JavaScript frontend, Node.js backend and MySQL storage. Admin, vendor and client accounts use separate sign-in pages and server-enforced record permissions. Its teal interface and demonstration organizations are original and fictional.

The implemented workflows are functional locally. Complete equivalence to the reference ERP and production readiness have **not** been verified. See the [test guide](docs/testing.md) for tested behavior and remaining acceptance work.

## Run

Use Node 24 or newer and MySQL. On this workstation Node is available at `C:\Program Files\nodejs\node.exe`.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` only if `.env` does not exist. Set the MySQL connection and initial `ADMIN_EMAIL` / `ADMIN_PASSWORD` (at least 12 characters).
3. For a new database, run `npm run db:init`. For an existing Cargo ASL database, run `npm run db:migrate` to add the workspace tables without replacing existing data.
4. Run `npm run demo:seed` to create fictional demo accounts. Their generated credentials are saved privately in `.local/portal-logins.txt`.
5. Run `npm start`, then `npm run demo:workspace` in another terminal to add linked fictional business records. The seed preserves existing records and can be repeated.
6. Open `http://127.0.0.1:3000/login/admin`, `/login/vendor`, or `/login/client`.

On this workstation, `Start Cargo ASL.cmd` starts the app and dedicated MySQL instance on port 3308. The MySQL data is in `.local/mysql/data`; preserve it when updating. No Cargo ASL Windows service was installed. Existing MySQL services were not changed.

## Workflows

- CRM organizations, prospects, leads, opportunities, activities and sales targets.
- Editable quotations with packages, charge lines, exchange rates, tax and exact decimal totals; nominated approval or explicit direct publication, customer rejection reasons, revision, expiry and conversion.
- Client quote inquiries with pickup/delivery contacts and times, service priority, cargo specifications, special handling and documents. Account managers price each inquiry in place, preserving its ID, reference, files and history. Unpublished pricing stays private; duplicate preparation is rejected. Previously prepared linked records are preserved.
- Client-created courier shipments with product quantities, UOM, PO/invoice references, HS codes, unit prices, currencies, lots and production/expiry dates. Saved courier records are read-only to clients.
- Vendor rate requests with saved drafts, validity dates and portal submission. Submitted costs automatically reach an owned, editable quotation once; admins set selling prices separately.
- Vendor invoice requests, complete invoice drafts, submission of saved original files, rejection with reasons, resubmission and approval. Approval creates draft supplier bills with their original documents; posting remains a separate reviewed action.
- Shipments, service jobs and carrier bookings, including parties, packages, routing, milestones, customs, insurance and document details. Multimodal quotations support ordered road/sea/rail legs, per-leg costs and rates, confirmed bookings, protected handoffs and whole-journey invoicing.
- Pro forma conversion, invoice and supplier-bill posting, partial/full payments, credit notes and balanced ledger entries.
- Master-data categories, tariffs, account creation, activation/deactivation and password resets that invalidate sessions.
- Internal/shared notes and attachments, audit history, record followers and notifications.
- Search, filters, saved filters, grouping, list/kanban/date views, charge CSV import, CSV exports and printable records.
- Twenty-one report views, including charge estimates vs actuals, profit, outstanding balances, customer volumes, courier shipments, recorded emissions and sales targets. Targets support weight, volume, revenue, margin, quotation count and TEUs. Monthly regeneration allocates totals equally, with editable monthly lines; equivalence to the source allocation formula is unverified.
- Email outbox with reviewed messages and actual SMTP delivery when configured. Demo addresses are blocked. SMTP credentials are optional locally; an unconfigured outbox does not report messages as sent.

Existing earlier quotation drafts remain accessible at `/legacy`. They are a separate data model and are not automatically migrated into the new workspace. The earlier read-only visual preview is `/legacy?preview=1`.

## Verify

```sh
npm test
npm run test:integration
npm run test:portals
npm run test:workflow
npm run test:multimodal
```

REA 6.5.0 is also used for real-browser acceptance. Set `REA_CLI` to your installed `rea-agents/scripts/rea.mjs` and `BROWSER_EXECUTABLE` to Chrome, then run `npm run test:browser`. The eight baseline scenarios use fictional temporary records and clean them up. `npm run test:browser:journeys` runs 17 additional Chrome scenarios for land + sea and land + sea + train, through invoice payment. Captures remain private under `.local/browser-tests/`. GitHub Actions installs the pinned REA CLI and runs these scenarios too.

Run `npm run demo:journeys` to create two completed fictional examples under the existing demo logins. Search House Shipments for **Demo Land + Sea** and **Demo Land + Sea + Train**. Repeating the command verifies the paid examples without duplicating them. See the [multimodal test report](docs/multimodal-testing.md) for routes, amounts and assertions.

New clients are routed to the active account manager associated with their existing Cargo ASL records. For clients without existing records, `INTAKE_ADMIN_EMAIL` selects the intake manager; otherwise the initial administrator or first active admin receives the request.

The API suites require the app and a development MySQL database; temporary fixtures are removed afterward. GitHub Actions runs the suites against disposable MySQL and checks repeatable demo initialization.

## Deployment and acceptance

The [5 November freight QA audit](docs/qa-audit-report.md) covers all 24 requested shipment scenarios, the three portals, financial reconciliation and a separate DP World staging comparison. It records 9 FAIL and 15 PARTIAL scenarios and identifies missing workflows and reproduced defects. Read this report before treating the workspace as production-ready; existing passing regression tests do not establish complete freight functionality.

Never commit `.env`, `.local`, credentials or MySQL data. Vercel configuration is prepared, but a cloud MySQL database and authenticated deployment are still required. See [deployment notes](docs/vercel-deployment.md).

Eight real-browser scenarios now cover client inquiry/dimensions and courier creation, admin pricing/publication, client acceptance, vendor rate draft/submission, the vendor invoice-upload dialog and mobile navigation. They do not establish full source parity. Source company/group permissions, all mode-specific rules, document templates and external carrier/onboarding integrations remain unverified. Tracking and emissions currently use manually entered records; actual email delivery requires SMTP configuration. The workspace loads up to 5,000 accessible records and warns if the limit is reached; larger deployments need server pagination and complete report aggregation. Public deployment also needs shared rate-limit enforcement, backups and operational acceptance. See the [upgrade comparison](docs/upgrade-audit.md) for confirmed remaining gaps.
