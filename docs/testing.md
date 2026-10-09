# Cargo ASL testing

Verified locally on 8 October 2026 and rerun successfully on 9 October 2026 using Node 24.21.0 and MySQL.

## Run

Configure `.env`, run `npm run db:init`, `npm run demo:seed`, then start the app with `npm start`. In another terminal:

```sh
npm test
npm run test:integration
npm run test:portals
```

The API suites require the app and MySQL. Integration tests create uniquely named temporary fixtures and remove them in `finally`. Use a development database. Demo tests use the generated credentials in `.local/portal-accounts.json`; do not commit that file.

## Results

- 27 unit tests passed: required selections, optional relations, dates, money precision, weights, integers, booleans, enums, text limits, protected fields, search, dashboard drilldown, CSV quoting/formula protection and hosting TLS/cookie configuration.
- API integration suite passed: login, anonymous denial, persisted draft/audit, owner isolation, malformed/oversized bodies, content types, forged/expired sessions, inactive users, invalid/inactive master selections, portal record isolation, cross-origin rejection and logout.
- All three demo roles passed API checks for login, wrong-portal rejection, cookies, account-scoped records, internal API restrictions and logout.
- Browser checks passed for all three demo sign-ins; admin draft creation, list, customer search, dashboard refresh/drilldown; vendor record search. Client overview displayed its assigned fictional records.
- GitHub Actions passed unit and API suites against disposable MySQL 8.4 on 9 October 2026: [successful run for application commit e284a06](https://github.com/ai-agent-projetct/Cargo-ASL/actions/runs/37873923226).

## Fixes

Dashboard drilldown and search resolve visible labels instead of searching raw relation IDs. Save/Refresh retain the ERP workspace. CSV protection covers leading whitespace and control characters. Demo initialization provides required fictional selections and creates its private credentials directory on clean installs.

## Limits

Passing tests cover implemented functionality only. Vendor/client records remain read-only demonstrations. Saved quote editing, charge calculations, approval transitions, shipments, invoices, operational portals and full administration are unfinished. Browser checks are recorded manual evidence, not an automated end-to-end suite. No live hosted deployment, load test or full permissions audit has been verified.
