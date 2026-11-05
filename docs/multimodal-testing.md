# Multimodal flow verification — 5 November 2026

Both requested Cargo ASL journeys passed from customer inquiry to settled customer invoice and supplier bills. The local app retains two fictional completed examples under its existing demo admin, vendor and client logins. No external cargo booking, banking transaction or source-ERP financial posting was performed.

## Completed examples

| Scenario | Ordered legs | Cost USD | Revenue USD | Tax USD | Paid invoice USD | Actual profit USD |
|---|---|---:|---:|---:|---:|---:|
| Demo Land + Sea | Road: Aster Yard → Aster Port; Sea: Aster Port → Copper Port | 400.00 | 620.00 | 31.00 | 651.00 | 220.00 |
| Demo Land + Sea + Train | Same road/sea legs, then Rail: Copper Port → Willow Terminal | 600.00 | 920.00 | 46.00 | 966.00 | 320.00 |

All organizations, locations and carriers in these examples are fictional. Revenue includes USD 20 for journey coordination. Tax is 5% of customer revenue. Vendor invoices in these fixtures have no tax. Profit excludes customer tax.

Sign in locally, open **House Shipments**, and search for either demo name. Each leg shows **Completed**; the parent job is **Invoiced** and its linked customer invoice is **Paid**. Vendor bills are also Paid. Open **Reports → Multimodal Journey Progress** to see every leg. The private local ID ledger is `.local/multimodal-demo.json`; credentials remain in `.local/portal-logins.txt`.

## What was implemented

- Ordered leg entry and reordering with stable leg IDs, transport/cargo validation, connected locations/countries and chronological planning.
- Derived whole-journey endpoints; package details and original inquiry documents retained through pricing and shipment conversion.
- Leg-specific vendor requests, cost import, carrier bookings and supplier invoice requests.
- Confirmed internal booking required before a leg can be booked. A later leg may be prebooked, but cannot depart until its predecessor completes.
- Independent leg movement: Booked → In Transit → Arrived → Completed. Parent status follows the aggregate progress; whole-job shortcut buttons cannot skip legs.
- Route structure locked after booking, trusted progress retained during note edits, and optimistic locking on movements.
- Final invoice generation and posting blocked until all legs complete, including when an admin manually creates an invoice draft.
- Whole-journey billing, original supplier PDF retention, payments, ledger entries, actual profit and customer-safe progress reporting.

## Test levels and results

| Suite | Result | Scope |
|---|---:|---|
| `npm test` | 96 passed | Shared validation, exact financial calculations, authorization, transitions, reports and emulated-DOM form handlers. Includes 24 focused multimodal tests and 2 new DOM cases |
| `npm run test:multimodal` | 33 checks passed | Two independent journeys against real Node/MySQL APIs, with separate assigned vendors and customer isolation |
| `npm run test:workflow` | 38 checks passed | Existing CRM, quotation, service-job, shipping, accounting, portal and target regressions |
| `npm run test:integration` | Passed, including 12 named defensive cases | Authentication, persistence, payload boundaries, private files, inactive/expired sessions and role restrictions |
| `npm run test:portals` | All 3 passed | Actual demo credentials, wrong-portal rejection, permissions and logout |
| `npm run test:browser:journeys` | 17 Chrome scenarios passed | Both journey entry forms, leg-specific vendor routing, vendor reply, pricing/approval, client acceptance, every booking/handoff, invoice posting and partial/final payment |
| `npm run test:browser` | 8 Chrome scenarios passed | Existing inquiry, courier, quote, vendor and mobile acceptance checks |

The automated test total includes Node test parent/subtest counts. API check counts group several assertions. These totals are separate and are not a statement of 100% code coverage.

## End-to-end assertion matrix

| Case | Assertions | Land + Sea | Land + Sea + Train |
|---|---|---|---|
| M01 Intake | Connected ordered legs, valid modes/cargo, required locations, customer identity and isolation | Pass | Pass |
| M02 Pricing identity | Same inquiry ID/reference, documents retained, unpublished prices hidden | Pass | Pass |
| M03 Vendor sourcing | Leg route enforced; assigned vendor saves/submits; another vendor cannot read it | Pass | Pass |
| M04 Import boundaries | Costs import once with the correct leg, zero selling price, and no caller-supplied leg spoofing; stale-route response rolls back | Pass | Pass |
| M05 Financial calculation | Exact independent expected cost, revenue, tax and total from the table above | Pass | Pass |
| M06 Approval/publication | Approval required, nominated approver used, published client view hides costs | Pass | Pass |
| M07 Acceptance/conversion | Client accepts; conversion creates one shipment with every leg and original file | Pass | Pass |
| M08 Booking | Missing confirmed booking rejected; each leg gets its own confirmed internal booking | Pass | Pass |
| M09 Handoffs | Later departure blocked until predecessor completes; intermediate completion cannot complete the entire job | Pass | Pass |
| M10 Data integrity | Route changes after booking rejected; injected progress ignored; stale versions rejected | Pass | Pass |
| M11 Vendor invoices | Saved drafts, original-file submission, rejection/reupload, approval into a Draft bill, leg association | Pass | Pass |
| M12 Documents | Valid synthetic PDFs download and original bytes match the copied supplier-bill attachment | Pass | Pass |
| M13 Supplier accounting | Bill posting and payment; every resulting ledger document balances | Pass | Pass |
| M14 Final customer billing | Premature generation/posting rejected; full journey included in final invoice | Pass | Pass |
| M15 Settlement | Overpayment rejected; deposit produces Partially Paid; final settlement produces Paid | Pass | Pass |
| M16 Reporting/audit | Actual profit correct, receivable settled, every leg completion audited and visible to the assigned client | Pass | Pass |

Focused unit cases also reject duplicate/unsafe leg IDs, disconnected countries, unsupported mode/cargo combinations, reversed dates, pickup after first departure, delivery before final arrival, unknown charge-leg references, skipped/repeated/prototype-named transitions and service-job conversion that would discard legs. DOM cases check reordering, train/cargo filters matching the same leg, row booleans and leg-specific booking form defaults.

## Repeat the tests

Use a development MySQL database and start Cargo ASL. Then run:

```sh
npm test
npm run test:integration
npm run test:portals
npm run test:workflow
npm run test:multimodal
```

Set `REA_CLI` to the installed REA CLI module and `BROWSER_EXECUTABLE` to Chrome, then run:

```sh
npm run test:browser
npm run test:browser:journeys
```

API/browser tests create temporary fictional records and remove them. Browser screenshots and redacted evidence remain private under `.local/browser-tests/`. To retain the two paid demonstration examples instead:

```sh
npm run demo:journeys
```

Repeating the demo command verifies the existing completed examples without creating duplicates. GitHub Actions runs the unit, API and both Chrome suites against disposable MySQL.

## Verification boundary

These results establish the two requested Cargo ASL workflows. They cover internal operational and accounting records, not live carrier reservations or bank transfers. Browser file selection is outside the current REA scenario action contract, so document transfer and supplier invoice processing are tested through the real API; their original bytes and persisted results are verified.

The source exposes separate road/sea/air/courier multimodal groupings; a dedicated rail grouping was not observed in the inspected schema. Cargo ASL's requested road/sea/rail combination is implemented and independently tested. Exact equivalence to every source multimodal option, signature workflow and external integration is not claimed. See the broader [upgrade audit](upgrade-audit.md) for remaining ERP scope.
