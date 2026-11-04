# Cargo ASL

Cargo ASL is a logistics workspace with a vanilla JavaScript frontend, Node.js backend and MySQL storage. Admin, vendor and client accounts use separate sign-in pages and server-enforced record permissions. Its teal interface and demonstration organizations are original and fictional.

The implemented workflows are functional locally. Complete equivalence to the reference ERP and production readiness have **not** been verified. See the [test guide](docs/testing.md) for tested behavior and remaining acceptance work.

## Run

Use Node 24 or newer and MySQL. On this workstation Node is available at `E:\Tools\OmniRoute\node-v24.21.0-win-x64\node.exe`.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` only if `.env` does not exist. Set the MySQL connection and initial `ADMIN_EMAIL` / `ADMIN_PASSWORD` (at least 12 characters).
3. For a new database, run `npm run db:init`. For an existing Cargo ASL database, run `npm run db:migrate` to add the workspace tables without replacing existing data.
4. Run `npm run demo:seed` to create fictional demo accounts. Their generated credentials are saved privately in `.local/portal-logins.txt`.
5. Run `npm start`, then `npm run demo:workspace` in another terminal to add linked fictional business records. The seed preserves existing records and can be repeated.
6. Open `http://127.0.0.1:3000/login/admin`, `/login/vendor`, or `/login/client`.

On this workstation, `Start Cargo ASL.cmd` starts the app and dedicated MySQL instance on port 3308. The MySQL data is in `.local/mysql/data`; preserve it when updating. No Cargo ASL Windows service was installed. Existing MySQL services were not changed.

## Workflows

- CRM organizations, prospects, leads, opportunities, activities and sales targets.
- Editable quotations with packages, charge lines, exchange rates, tax and exact decimal totals; nominated approval, publication, customer decisions, expiry and conversion.
- Client quote inquiries with pickup/delivery contacts and times, service priority, cargo specifications, special handling and documents. Account managers prepare a linked priced quotation; duplicate preparation is rejected.
- Client-created courier shipments with product quantities, UOM, PO/invoice references, HS codes, unit prices, currencies, lots and production/expiry dates.
- Vendor rate requests and portal rate submissions, with approved rates imported into an editable quotation.
- Vendor invoice requests, PDF/image submissions, rejection with reasons, resubmission and approval. Approval creates draft supplier bills with their original documents; posting remains a separate reviewed action.
- Shipments, service jobs and carrier bookings, including parties, packages, routing, milestones, customs, insurance and document details.
- Pro forma conversion, invoice and supplier-bill posting, partial/full payments, credit notes and balanced ledger entries.
- Master-data categories, tariffs, account creation, activation/deactivation and password resets that invalidate sessions.
- Internal/shared notes and attachments, audit history, record followers and notifications.
- Search, filters, saved filters, grouping, list/kanban/date views, charge CSV import, CSV exports and printable records.
- Twenty report views, including charge estimates vs actuals, profit, outstanding balances, customer volumes, courier shipments, recorded emissions and sales targets. Targets support weight, volume, revenue, margin, quotation count and TEUs. Monthly regeneration allocates totals equally, with editable monthly lines; equivalence to the source allocation formula is unverified.
- Email outbox with reviewed messages and actual SMTP delivery when configured. Demo addresses are blocked. SMTP credentials are optional locally; an unconfigured outbox does not report messages as sent.

Existing earlier quotation drafts remain accessible at `/legacy`. They are a separate data model and are not automatically migrated into the new workspace. The earlier read-only visual preview is `/legacy?preview=1`.

## Verify

```sh
npm test
npm run test:integration
npm run test:portals
npm run test:workflow
```

REA 6.5.0 is also used for real-browser acceptance. Set `REA_CLI` to your installed `rea-agents/scripts/rea.mjs` and `BROWSER_EXECUTABLE` to Chrome, then run `npm run test:browser`. The six scenarios use fictional temporary records and clean them up. Captures remain private under `.local/browser-tests/`. GitHub Actions installs the pinned REA CLI and runs these scenarios too.

New clients are routed to the active account manager associated with their existing Cargo ASL records. For clients without existing records, `INTAKE_ADMIN_EMAIL` selects the intake manager; otherwise the initial administrator or first active admin receives the request.

The API suites require the app and a development MySQL database; temporary fixtures are removed afterward. GitHub Actions runs the suites against disposable MySQL and checks repeatable demo initialization.

## Deployment and acceptance

Never commit `.env`, `.local`, credentials or MySQL data. Vercel configuration is prepared, but a cloud MySQL database and authenticated deployment are still required. See [deployment notes](docs/vercel-deployment.md).

Six real-browser scenarios now cover client inquiry/courier creation, admin pricing and publication, client acceptance, the vendor invoice-upload dialog and mobile navigation. They do not establish full source parity. Source company/group permissions, all mode-specific rules, document templates and external carrier/onboarding integrations remain unverified. Tracking and emissions currently use manually entered records; actual email delivery requires SMTP configuration. The workspace loads up to 5,000 accessible records and warns if the limit is reached; larger deployments need server pagination and complete report aggregation. Public deployment also needs shared rate-limit enforcement, backups and operational acceptance. See the [upgrade comparison](docs/upgrade-audit.md) for confirmed remaining gaps.
