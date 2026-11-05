# Cargo ASL QA audit — confirmed inventory

Date: 5 November 2026. Baseline: `c7f12b3` (`c7f12b37acac0d640a793c404885ceaa787d8e65`).

This records the inventory completed before scenario testing. The user subsequently confirmed “do both”; Cargo ASL scenario testing and a separate DP World staging comparison followed. Results are in [the QA audit report](qa-audit-report.md). Earlier regression successes were not substituted for the wider audit.

## System and access

- Target: Cargo ASL, http://127.0.0.1:3000. Local MySQL health check returned connected.
- Login pages: `/login/admin`, `/login/vendor`, `/login/client`. Existing private demo credentials were used; none are included here.
- Stack: vanilla JavaScript frontend, Node.js backend, MySQL database.
- DP World staging remains a reference system; no reference-system transactions were changed during this inventory.

## What was actually explored

Live Chrome inventory covered all 20 main record menus and all 20 unsaved admin create forms, 13 existing admin record details, 3 vendor record menus/details, and 8 client record menus with 5 existing details and 2 unsaved creation forms. All 21 report selections were opened in each role. Empty modules were inspected through their lists/forms; their saved-record behavior remains to be audited.

No business records were created, saved, amended, posted or deleted. Opening an unsaved form and discarding it was used only to identify fields and controls. No external email or carrier request was sent.

## Main record screens and exposed workflows

| Group | Screen | Form fields | Workflow exposed/configured |
|---|---|---:|---|
| Organizations | Organizations | 22 | Onboarding statuses; activation; archive/restore |
| Sales & CRM | Prospects | 7 | Qualify or cancel |
| Sales & CRM | Leads | 10 | Qualify → convert to opportunity; mark lost |
| Sales & CRM | Opportunities | 8 | Qualify → won/lost |
| Sales & CRM | Quotations | 58 | Approval or explicit exemption → publication → customer decision → shipment/service-job conversion; rejection/revision |
| Sales & CRM | Rate Requests | 18 | Send → vendor draft/reply → cost import → internal acceptance |
| Operations | House Shipments | 73 | Book → dispatch → arrive → complete → invoice; multimodal leg handoffs |
| Operations | Service Jobs | 11 | Start → complete → invoice |
| Accounting | Invoices | 12 | Post → partial/full payment; linked credit note |
| Accounting | Pro Forma Invoices | 12 | Submit → approve → send → convert to invoice |
| Accounting | Vendor Bills | 10 | Post → partial/full supplier payment |
| Accounting | Credit Notes | 8 | Create against invoice → post credit |
| Administration | Tariffs | 9 | Buy/sell tariff validity, charge records, activation/archive |
| Sales & CRM | Sales Targets | 20 | Generate months → recompute actuals; activate/archive |
| Administration | Master Data | 6 | Create category record → activate/archive/restore |
| Dashboard | Activities | 5 | Assign/schedule → complete/cancel |
| Operations | Carrier Bookings | 10 | Submit → confirm → complete/cancel |
| Sales & CRM | Quote Inquiries | 29 | Client submission → admin pricing in place with unchanged reference |
| Operations | Courier Shipments | 10 | Client creation → internal booking → dispatch → completion |
| Accounting | Vendor Invoice Requests | 9 | Send → vendor draft/upload → review → reject/resubmit or approve into draft bill |

These workflow descriptions combine visible controls with the current shared workflow configuration. They describe the available paths, not successful completion of the new audit scenarios.

## Other screens and shared functions

- Overview dashboard: counters, recent activity, quotation/rate pipeline and upcoming activities.
- Reports: 21 named views listed below.
- Notifications and record following.
- Users & access: create accounts, activate/deactivate and reset passwords.
- General ledger: displayed entries and CSV export.
- Email outbox: prepare/review messages and delivery controls; configuration status displayed. No email was sent during inventory.
- Record detail: notes, internal/shared attachments, downloads, print/save PDF, CSV export and audit history where the role exposes them.
- Record lists: search, status/route filters, saved filters, grouping and list/kanban/calendar views. These views are navigation features, not separate operational modules.
- Multimodal record forms/details: ordered leg entry, leg-specific rate/booking/invoice-request controls and progress panels.

## Portal navigation

- **admin**: Organizations; Prospects; Leads; Opportunities; Quotations; Rate Requests; House Shipments; Service Jobs; Invoices; Pro Forma Invoices; Vendor Bills; Credit Notes; Tariffs; Sales Targets; Master Data; Activities; Carrier Bookings; Quote Inquiries; Courier Shipments; Vendor Invoice Requests.
- **vendor**: Rate Requests; Vendor Invoice Requests; Vendor Bills.
- **client**: Quote Inquiries; Quotations; Invoices; Credit Notes; House Shipments; Service Jobs; Pro Forma Invoices; Courier Shipments.

Navigation visibility is recorded here. Endpoint access, cross-user isolation and permission bypass attempts belong to the scenario audit after confirmation.

## Reports

1. Quote Analysis by Status
2. Sales Agent Report
3. Opportunity Detail Report
4. Customer Visit Report
5. Charges Wise Quotation Report
6. Sales Report by Customer
7. Sales Report by Shipping Lines
8. Custom Duty Report
9. Charge Wise Shipment Estimated vs Actual
10. Shipment Profit Report
11. Shipper Wise Report
12. Customer Wise Report
13. Customer Volume Report
14. Customer Status Report
15. Carbon Emission Report
16. Courier Shipment Report
17. Tariff Validity Report
18. Outstanding Receivables
19. Outstanding Payables
20. Target vs Actual
21. Multimodal Journey Progress

## Master-data categories

40 categories share one generic Master Data form. Their presence does not establish a dedicated workflow for each category.

Incoterms; Carriers; Carrier Agents; HS Codes; UN/LOCODE Locations; Commodities; Custom Locations; Client Tags; Email Templates; Carrier Service Types; Charges; Languages; Container Categories; Container Types; MAWB Stocks; Status Change Reasons; Serial Numbers; Ports; Trucks; Location Types; Warehouses; Countries; States; Country Groups; Cities; Shipment Change Reasons; Service Job Types; Custom BE Types; Vessels; Vessel Categories; Companies; Departments; Groups; Sales Teams; Lead Stages; Opportunity Stages; Lead Sources; Quote Templates; Container Numbers; Document Templates.

## Earlier workspace and preview

- `/legacy`: separate read-only demo overview and an Open ERP workspace button.
- Earlier quotation dashboard: quotation charts, filters, list/kanban views, exports and unsaved quotation creation form.
- Earlier sidebar entries: Dashboard, Administration, Sales & CRM, Operations, Organizations, Accounting. The Administration, Operations, Organizations and Accounting entries display implementation-incomplete placeholder content.
- `/legacy?preview=1`: read-only interface preview.
- The earlier quotation model is separate from the current operational record model. Data consistency and navigation confusion across the two models will be included in the audit.

## Requested modules with no dedicated operational screen observed

| Requested area | What exists in the inventory | Scope implication |
|---|---|---|
| B/L, HAWB/MAWB, CMR and packing-list documentation | Generic printing/attachments, shipment document fields and MAWB/template master categories | Dedicated generation, numbering, versioning and accuracy need to be tested; a category or field is not proof of generation |
| Customs clearance | Customs-required flag, reference, duty and related shipment fields/report | No separate declaration/release/hold workflow screen observed |
| Warehousing | Warehouses master-data category | No receiving, putaway, inventory, picking, storage billing or release screen observed |
| Transport/fleet | Carrier bookings, routing/legs, carrier/truck master categories | No dedicated driver/vehicle dispatch, maintenance, compliance or live fleet board observed |
| Consolidation/groupage | Cargo types and a legacy consolidation-type field | No master/house consolidation workbench observed |
| DG, reefer and OOG handling | Hazardous/temperature flags, packages/dimensions and notes | Specialized acceptance, declarations, limits and monitoring are not established by these fields |
| Split shipments/partial deliveries | No dedicated split/partial-delivery workbench observed | Must be included as an explicit gap/failure check |

## Proposed scenario scope

Keep all 24 scenarios from the request. Missing workflows will remain in scope and receive documented FAIL/PARTIAL results as appropriate; they will not be silently removed. Dangerous goods will have sea/air/road/rail variants. Currency checks will cover AED, USD and EUR, with VAT applicability assessed per transaction rather than assuming that every freight charge must attract 5%.

Each scenario report will contain its data, actual operator steps, expected versus observed behavior, status and linked defects with severity and reproduction steps. Findings will distinguish live reproductions, structural missing features, code-supported findings and unverified external integrations. No fixes will be made during the audit.

## Inventory evidence and confirmed scope

- admin inventory: `ev_1e697d6b04b6df744a9e4128fbc16b1bd812e492cd2e6153842fe09bc261c935` (151 recorded steps).
- vendor inventory: `ev_2d178a652a5418671f85b82a1ac363b06d2beb5ed7c58ca03808d26217ae116d` (41 recorded steps).
- client inventory: `ev_a0d95fdb60925181acb171095a65249ee7210292a7677b7b17678666348e8ddc` (58 recorded steps).
- Earlier workspace: `ev_e83eced12abc21e7660d2dadc0622b4ee9099c1a4a5b4cdfbfbb259c2dc6cd75`.
- Anonymous read-only preview: `ev_e1f5419169ccac6a6072838ad840df1a8c4bee951fec1b69731851448db820e4`.
- Raw captures and screen text are private under `.local/qa-audit-2026-11-05/`.
- Confirmed: Cargo ASL, the earlier workspace and all 24 requested scenarios remained in scope. DP World reference coverage and its unverified stages are documented separately in [the source comparison](qa-source-comparison.md).
