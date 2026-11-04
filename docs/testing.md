# Cargo ASL testing

Verified locally on 4 November 2026 using Node 24, MySQL, Chrome 156 and REA 6.5.0. These checks establish implemented behavior, not complete reference-ERP equivalence.

Latest results: **63 automated tests passed**, **34 live workflow checks passed**, the existing integration suite passed (including 12 named defensive cases), and **all three demo portal checks passed**. **Six real-browser scenarios passed**, including a mobile viewport. Automated test totals include emulated-DOM parent/subtests; they are distinct from the six browser scenarios.

## Run

Configure `.env`, initialize or migrate the database, run `npm run demo:seed`, then start the app. In another terminal:

```sh
npm test
npm run test:integration
npm run test:portals
npm run test:workflow
npm run demo:workspace
```

For browser acceptance, set `REA_CLI` to the installed `rea-agents/scripts/rea.mjs` absolute path and `BROWSER_EXECUTABLE` to Chrome, then run `npm run test:browser`. The default Chrome path is for Windows; CI sets the Linux executable explicitly. Scenario JSON, redacted evidence and screenshots are saved under `.local/browser-tests/` and excluded from Git.

API suites create temporary users and business records and remove them in `finally`. Use a development database. Demo credentials are generated in `.local/portal-accounts.json` and `.local/portal-logins.txt`, which must remain private.

## Coverage

- Validation and protected fields; real dates, decimal precision, enums, references and accounting overflow.
- Exact quantity/FX/tax calculations, supplier purchase amounts, credit-adjusted reports, currency separation and outstanding balances.
- CSV quoting, multiline import and formula neutralization.
- SMTP encryption/configuration and transport behavior using a test double; no external email is sent by tests.
- Emulated-DOM portal login, errors, form save, charge-row editing, vendor submission and unconfigured outbox.
- Live MySQL authentication, persisted drafts, audit creation, content/body limits, inactive/expired sessions, owner and portal isolation, cross-origin rejection and logout.
- All three demo logins, correct roles, wrong-portal rejection and restricted endpoints.
- Live cross-role CRM → vendor rates → approved quote → client acceptance → shipment → posted invoice → credit/payment, plus service-quote conversion, service invoicing, pro forma conversion, carrier bookings, supplier payments, configuration, assigned activities, followers/notifications and account provisioning/password reset.
- Client-created inquiries and courier products; identity spoofing prevention, invalid-attachment rollback, inquiry-to-quote linking and duplicate-preparation rejection.
- Vendor invoice upload validation, rejection reasons, resubmission, approval, attachment copying and draft-bill creation without automatic ledger posting.
- Monthly sales-target generation and recomputation, including agent/date/route/currency isolation, exact allocation and all six metrics.
- Real Chrome: client inquiry, client courier, admin quotation preparation/approval/publication, client acceptance, vendor upload dialog and mobile courier navigation. Persisted records and customer cost hiding are checked through the API after browser actions.

## Acceptance limits

Browser file selection/upload is not exercised by REA's current scenario action contract; document persistence and invoice upload are covered by API tests, and the real-browser check opens the actual upload form. SMTP delivery is tested with a stub, not a configured provider. No cloud deployment, load test, backup recovery test, full source permissions comparison or complete feature-parity audit is claimed.

The source vendor account had no assigned rate requests and the source client account's seven record pages were empty. Their detailed workflows could not be established from those accounts. Local implemented flows therefore require comparison with populated source test records before exact equivalence can be accepted.

See `scripts/verify-workflow.mjs` for individual assertions and the README for remaining operational requirements.
