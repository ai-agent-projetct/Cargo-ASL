# Cargo ASL testing

Verified locally on 5 November 2026 using Node 24, MySQL, Chrome 156 and REA 6.5.0. These checks establish implemented behavior, not complete reference-ERP equivalence.

Latest results: **97 automated tests passed**, **71 live workflow checks passed** (38 general and 33 multimodal), the existing integration suite passed (including 12 named defensive cases), and **all three demo portal checks passed**. **25 real-browser scenarios passed** (8 general and 17 multimodal), including a mobile viewport. Automated test totals include emulated-DOM parent/subtests; they are distinct from the 25 browser scenarios.

## Run

Configure `.env`, initialize or migrate the database, run `npm run demo:seed`, then start the app. In another terminal:

```sh
npm test
npm run test:integration
npm run test:portals
npm run test:workflow
npm run test:multimodal
npm run demo:workspace
```

For browser acceptance, set `REA_CLI` to the installed `rea-agents/scripts/rea.mjs` absolute path and `BROWSER_EXECUTABLE` to Chrome, then run `npm run test:browser` and `npm run test:browser:journeys`. The default Chrome path is for Windows; CI sets the Linux executable explicitly. Scenario JSON, redacted evidence and screenshots are saved under `.local/browser-tests/` and excluded from Git.

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
- Client-created inquiries and courier products; identity spoofing prevention, invalid-attachment rollback, identity-preserving inquiry pricing, protected unpublished prices, document/history retention and duplicate-preparation rejection.
- Vendor rate draft saving, validity dates, SGD, automatic cost-only import and duplicate-import prevention; direct publication exemptions, quote rejection reasons and owner-only revisions.
- Vendor invoice draft saving and submission without reuploading, upload validation, rejection reasons, resubmission, approval, attachment copying and draft-bill creation without automatic ledger posting.
- Monthly sales-target generation and recomputation, including agent/date/route/currency isolation, exact allocation and all six metrics.
- Real Chrome: client inquiry with package dimensions, client courier, admin quotation preparation/approval/publication, client acceptance, vendor rate draft/submission, vendor upload dialog and mobile courier navigation. Persisted records and customer cost hiding are checked through the API after browser actions.

## Multimodal journeys

The dedicated [multimodal test report](multimodal-testing.md) covers both requested combinations from inquiry through vendor rates, approval, bookings, ordered leg handoffs, supplier bills, customer invoices, payments and balanced ledger entries. The new unit tests cover validation and transition boundaries; browser checks cover the actual forms and buttons. `npm run demo:journeys` retains two paid fictional examples under the existing demo accounts.

## Acceptance limits

Browser file selection/upload is not exercised by REA's current scenario action contract; document persistence and invoice upload are covered by API tests, and the real-browser check opens the actual upload form. SMTP delivery is tested with a stub, not a configured provider. No cloud deployment, load test, backup recovery test, full source permissions comparison or complete feature-parity audit is claimed.

With the user's authorization, labelled source QA inquiries, a courier, a vendor rate, a revised quotation, a Created shipment and a vendor invoice request were added. Browser evidence verifies inquiry/courier persistence and rate save/submit. Authenticated application API/form checks verify the cost import, no-email publication, customer rejection, revision, shipment Summary visibility, PDF draft upload and invoice submission to approval-pending. Source OCR returned an unavailable-service error; manual entry worked. Source invoice approval and all remaining ERP modules are not covered by these checks. See the [comparison and remaining gaps](upgrade-audit.md).

See `scripts/verify-workflow.mjs` for individual assertions and the README for remaining operational requirements.
