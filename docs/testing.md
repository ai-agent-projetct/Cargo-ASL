# Cargo ASL testing

Verified locally on 9 October 2026 using Node 24.21.0 and MySQL. These checks establish implemented behavior, not complete reference-ERP equivalence.

Latest results: **51 automated tests passed**, **26 live workflow checks passed**, the existing integration suite passed (including 12 named defensive cases), and **all three demo portal checks passed**. Re-running fictional workspace seeding also passed without replacing existing records. Automated test totals include the emulated-DOM parent/subtests; they are not 51 independent browser journeys.

## Run

Configure `.env`, initialize or migrate the database, run `npm run demo:seed`, then start the app. In another terminal:

```sh
npm test
npm run test:integration
npm run test:portals
npm run test:workflow
npm run demo:workspace
```

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

## Acceptance limits

Prior browser checks covered the earlier interface and demo sign-ins. The new workspace has DOM checks, but its real-browser and mobile acceptance remain pending because the browser transport is disconnected. SMTP delivery is tested with a stub, not a configured provider. No cloud deployment, load test, backup recovery test, full source permissions comparison or complete feature-parity audit is claimed.

The source vendor account had no assigned rate requests and the source client account's seven record pages were empty. Their detailed workflows could not be established from those accounts. Local implemented flows therefore require comparison with populated source test records before exact equivalence can be accepted.

See `scripts/verify-workflow.mjs` for individual assertions and the README for remaining operational requirements.
