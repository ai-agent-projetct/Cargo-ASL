# Cargo ASL

Cargo ASL is a freight workspace built with vanilla JavaScript, Node.js and MySQL. Admin, vendor and client portals enforce record access on the server. Its interface and fictional demo organizations differ from the reference ERP.

The freight audit remediation adds mode-specific documents, customs release, safety acceptance, consolidation/groupage, split delivery/POD, warehouse movements, fleet dispatch, controlled journey amendments, supplier identity/duplicate checks, independent currencies, AED accounting and payment journals. See [the remediation report](docs/freight-remediation-report.md) for scenario evidence and [production preparation](docs/production-readiness.md) for the remaining cloud/company configuration. Live production cutover and complete DP World source equivalence are not certified by local tests.

## Run locally

Use Node 24 and MySQL. Preserve any existing private `.env` and database.

1. Run `npm ci`.
2. Configure `.env` from `.env.example` with MySQL and the initial administrator's credentials.
3. Run `npm run db:init` for a new database or `npm run db:migrate` for an existing installation.
4. For fictional demonstrations only, run `npm run demo:seed` and `npm run demo:operations`.
5. Run `npm start`, then `npm run demo:workspace`. Optional `npm run demo:journeys` creates completed road–sea and road–sea–rail examples once.
6. Open `http://127.0.0.1:3000/login/admin`, `/login/vendor` or `/login/client`. Private demo access is in `.local/portal-logins.txt`.

On this workstation, `Start Cargo ASL.cmd` uses the dedicated MySQL instance on port 3308. Preserve `.local/mysql/data`; other MySQL services are not part of this app. `/legacy` redirects into the current workspace; historical legacy database rows are preserved without exposing a second application.

## Verify

`npm test` runs domain, calculation, report, permission and emulated UI tests. With the app and development database running:

- `npm run test:integration`: existing quotation API integration checks.
- `npm run test:portals`: role sign-in, portal mismatch and session revocation.
- `npm run test:workflow`: full road lifecycle plus financial/access/CRM/service and report controls.
- `npm run test:multimodal`: all 24 requested freight scenarios, DG in four modes and the additional road–sea–rail regression.
- `npm run test:uploads`: three large staged files, client/vendor attachment links and token isolation/replay checks.
- `npm run test:browser`: real Chrome sessions for all roles, vendor rates, quotation approval/acceptance, two multimodal journeys, real file-picker uploads, customs, POD, supplier/customer settlement and mobile width.
- `npm run db:backup` and `npm run test:restore -- <backup.json>`: consistent backup and isolated recovery verification.

Chrome uses `BROWSER_EXECUTABLE` or the local standard installation. Acceptance evidence stays private under `.local/production-tests`; fixtures are clearly labelled QA and remain available for inspection. GitHub Actions runs the current suites against disposable MySQL 8.4 and uploads QA evidence. The old REA audit captures remain historical evidence; current browser acceptance uses Playwright with actual uploads.

Never commit `.env`, `.local`, real credentials or database files. Production setup uses a clean cloud database, real legal/bank details, approved FX and controlled user access. See [the deployment runbook](docs/production-readiness.md).
