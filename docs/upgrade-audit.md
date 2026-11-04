# Cargo ASL upgrade comparison — 4 November 2026

REA 6.5.0 is connected to Codex and installed globally. The current source ERP, vendor and customer logins were exercised successfully through isolated browsers. Source inspection was read-only: no source quotation, shipment, invoice, target, email or payment was submitted or changed. Credentials and raw source captures are excluded from this repository.

## Inspected

- ERP quotation dashboard and Sales & CRM navigation; the unsaved sales-target form, its six parameters and monthly-line controls.
- A saved pro forma invoice, including currency, exchange-rate lines, totals, grouping controls, print/email/customer-preview controls and history.
- House-shipment list and saved detail, its operational states, cost/revenue summaries, documents and invoice-request controls.
- The unsaved vendor invoice-request form and its four visible states, invoice metadata and requested-charge tabs.
- Vendor dashboard and invoice-request list. The supplied vendor account has no assigned requests.
- All seven customer record sections, the complete unsaved quote-request form, and courier creation with product and document tables. The supplied customer account's record lists are empty.

## Implemented and tested in this update

| Confirmed Cargo ASL gap | Result | Verification |
|---|---|---|
| Customers could not request quotations | Inquiry form, documents in the same transaction, account-manager routing, protected identity, linked admin pricing and duplicate prevention | Unit, API, real browser |
| Customers could not create courier records | Logistic identifiers, partner/reference, shipper/consignee, product quantities/UOM, PO/invoice, HS code, price/currency, lot and date details; own draft editing | Unit, API, real browser |
| Vendor invoice-request workflow absent | Pending upload → approval pending → approved/rejected; rejection reasons and resubmission; original-file retention; draft supplier bills on approval | Unit, API; upload dialog checked in Chrome |
| Inquiries lost shipping details during pricing | Pickup/delivery contacts and times, cargo specifications, priority and special considerations remain available on quotations and shipments | Shared validation and conversion checks |
| Portal filters absent | Transport, cargo and shipment filters; pending/overdue invoice filters; saved filters retain these selections | DOM/browser checks and code review |
| Courier and emissions access incomplete | Courier navigation/report data and a direct CO₂ report link | Browser navigation and report tests |
| Sales target model too limited | Date ranges, six parameters, reporting-manager/incentive metadata, monthly target lines, regeneration, actual-value recomputation and report | Unit and live workflow checks |
| New interface lacked real-browser acceptance | Six repeatable REA scenarios, including cross-role pricing/acceptance and a mobile viewport; wired into CI | Local Chrome passed |

Approval of a vendor invoice produces a **draft** bill for tax/document review. It does not silently post the ledger or record a payment. The local accounting effects are tested; exact equivalence to every source approval/posting rule remains unverified.

## Confirmed remaining gaps and unknowns

| Area | Remaining work or evidence needed |
|---|---|
| Master Shipment (Consol) | Source has a separate module; a full consolidation/linking workflow has not been implemented or audited. |
| Shipment lifecycle | Source also shows Confirmed, HAWB Generated and Job Close. Cargo ASL's simpler booking/transit/completion/invoicing states do not reproduce all of these controls. |
| Accounting | Debit notes, every pro forma approval rule, charge grouping, branded PDF/email attachments and customer-preview behavior are not fully reproduced. |
| Documents | Source BL upload and DOCX report/template generation are not implemented as equivalent workflows. |
| Integrations | Source courier form exposes Cargosflow synchronization. Its API contract, endpoint and credentials are unavailable; no fake synchronization is presented as working. External tracking/onboarding integrations remain unverified. |
| Permissions | Source company, group and team access rules have not been fully established. Cargo ASL uses its documented owner/assignee/portal permissions. |
| Targets | Source monthly distribution and incentive formulas were not exercised. Cargo ASL explicitly uses equal monthly allocation with editable lines and actuals from accessible records. This is not a verified copy of the source formula. |
| Detailed portals | Empty source vendor/customer lists prevent comparison of saved-record actions. Populated source test records or a walkthrough are needed. Local behavior is independently tested. |
| Deployment | A cloud MySQL database, deployment access and operational configuration are still required for a client-shareable hosted app. SMTP delivery needs provider credentials. |

The application is functional for the tested workflows, but it must not be described as an exact, complete clone of the entire source ERP. The previous distinct Cargo ASL interface and fictional demonstration data are retained. Source business names, transactions and passwords were not copied into application fixtures.
