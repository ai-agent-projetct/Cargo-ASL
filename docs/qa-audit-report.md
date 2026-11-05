# Cargo ASL — freight forwarding QA audit

5 November 2026 · tested baseline `c7f12b3` · local Chrome + Node.js + MySQL

**Release assessment: NOT READY for unrestricted freight operations or client production use.** The basic operator lifecycle completes, but essential freight controls are missing and financial/privacy defects were reproduced. Application code was left unchanged.

Requested scenarios: **0 PASS / 9 FAIL / 15 PARTIAL**. Twenty-eight local shipment fixtures were executed: the 24 requested cases, four DG variants within case 18, and one additional Road + Sea + Rail regression. All 28 reached customer and supplier settlement for the supported core flow. Missing steps were recorded as gaps, not simulated and counted as passes.

**25 distinct findings:** 0 Critical, 20 High, 5 Medium, 0 Low. No Critical-severity exploit or irreversible loss was confirmed in this audit.

## Scope, inventory and evidence

The user confirmed both Cargo ASL testing and DP World staging comparison after the inventory. Cargo ASL main workspace: 20 record screens, 21 reports, six module groups, 40 master categories, three login roles, plus the earlier workspace. See [inventory](qa-audit-inventory.md). The staging account exposed 157 menu nodes; its inventory and separate limitations are in [source comparison](qa-source-comparison.md).

- Target: `http://127.0.0.1:3000`; database health was connected. Admin, vendor and client demo logins all authenticated into their intended portals. Passwords and source access tokens are excluded.
- Browser tests entered and saved labelled synthetic records through the visible forms and action buttons. New customers/vendors use fictional QA names; source business transactions were not modified.
- Vendor invoice forms were inspected in Chrome. Actual PDF submissions used the normal authenticated application API because REA 6.5 has no file-picker action. Those steps are technical supplements, not GUI upload passes. The synthetic PDFs were valid files.
- API readback independently checked persisted records, portal projections, permissions and ledgers. Arithmetic was calculated independently from the entered rates, not copied from displayed totals.
- Evidence is retained locally in `.local/qa-audit-2026-11-05/`. A sanitized [evidence manifest](qa-evidence-index.json) records browser evidence IDs and SHA-256 digests. Raw DOM/screenshots and credentials remain private and are not in Git.

## Test interpretation and numerical assumptions

PASS requires every required step and assertion to succeed. PARTIAL means the supported core lifecycle completed but required stages could not be exercised because their workflow is absent. FAIL means a scenario-defining requirement or control demonstrably failed. A paid invoice alone does not establish a complete freight lifecycle.

Air volumetric weight uses the requested 1:6000 rule: count × L × W × H in cm ÷ 6000, chargeable weight = max(gross, volumetric). Sea W/M uses the explicit test-tariff assumption max(CBM, metric tonnes); this is not claimed as a universal tariff rule. Rate per leg is 100, 150, 200, 250 cost and 150, 225, 300, 375 selling, plus one 20-unit coordination charge. These small QA rates isolate calculations; they are not market-rate quotations.

Domestic taxable UAE customer fixtures used 5%. Qualifying international-transport fixtures used an explicitly entered 0%, assuming the relevant supply conditions are met. International freight must not receive a blanket 5% rate; eligibility and domestic subcontracting require their own classification. Full, simplified and wholly zero-rated invoice exceptions also differ. The current FTA consolidation includes the October 2026 amendment. [FTA Executive Regulation, Articles 33 and 59](https://tax.gov.ae//Datafolder/Files/Legislation/2026/Law-No-8-of-2017-and-its-amendments--09-2026.pdf).

Supplier scenario PDFs state a gross invoice with no separately recoverable VAT. A separate purchase test verified AED 100 net + AED 5 input VAT → AED 105 payable. Foreign-currency arithmetic was tested, but cross-currency job accounting is not supported. No tax-return filing, live customs submission, carrier transaction or real bank payment was attempted.

## Summary of all 24 requested scenarios

| # | Scenario | Cargo ASL | Local job IDs | Source comparison |
|---|---|---|---|---|
| 1 | Sea FCL export | **PARTIAL** | 603 | SGP-2026-00998; full flow PARTIAL |
| 2 | Sea FCL import | **PARTIAL** | 611 | SGP-2026-00999; full flow PARTIAL |
| 3 | Sea LCL consolidation | **FAIL** | 619 | SGP-2026-01000; full flow PARTIAL |
| 4 | Air export with MAWB and HAWB | **PARTIAL** | 627 | SGP-2026-01001; full flow PARTIAL |
| 5 | Air import | **PARTIAL** | 635 | SGP-2026-01002; full flow PARTIAL |
| 6 | Road FTL domestic | **PARTIAL** | 643 | SGP-2026-01008; full flow PARTIAL |
| 7 | Road LTL groupage | **FAIL** | 651 | SGP-2026-01009; full flow PARTIAL |
| 8 | Road cross-border UAE to KSA | **PARTIAL** | 659 | SGP-2026-01010; full flow PARTIAL |
| 9 | Road + Sea | **PARTIAL** | 677 | SGP-2026-01011; full flow PARTIAL |
| 10 | Sea + Road | **PARTIAL** | 700 | SGP-2026-01003; full flow PARTIAL |
| 11 | Road + Air | **PARTIAL** | 714 | SGP-2026-01012; full flow PARTIAL |
| 12 | Air + Road | **PARTIAL** | 729 | SGP-2026-01004; full flow PARTIAL |
| 13 | Sea + Air via Dubai | **PARTIAL** | 741 | SGP-2026-01005; full flow PARTIAL |
| 14 | Road + Sea + Road door-to-door | **PARTIAL** | 754 | SGP-2026-01013; full flow PARTIAL |
| 15 | Road → Sea → Road → Air under one job | **PARTIAL** | 771 | SGP-2026-01014; full flow PARTIAL |
| 16 | Road → Air → Sea → Road under one job | **PARTIAL** | 791 | SGP-2026-01015; full flow PARTIAL |
| 17 | Transshipment and carrier change | **PARTIAL** | 819 | SGP-2026-01016; full flow PARTIAL |
| 18 | Dangerous goods in every mode | **FAIL** | 842, 862, 854, 834 | DG form blocked at required document; full flow PARTIAL |
| 19 | Reefer / temperature-controlled cargo | **FAIL** | 870 | SGP-2026-01006; full flow PARTIAL |
| 20 | Oversized out-of-gauge cargo | **FAIL** | 884 | SGP-2026-01017; full flow PARTIAL |
| 21 | Split shipment with partial deliveries | **FAIL** | 918 | SGP-2026-01018; full flow PARTIAL |
| 22 | Multi-currency AED / USD / EUR billing | **FAIL** | 927 | SGP-2026-01007; full flow PARTIAL |
| 23 | Booking cancellation and amendment mid-transit | **FAIL** | 671 | SGP-2026-01019; full flow PARTIAL |
| 24 | Missing and wrong data validations | **FAIL** | 694 | SGP-2026-01020; full flow PARTIAL |

## Actual operator sequence

The following sequence was executed separately for every local fixture. Case sections identify where its required specialist workflow was unavailable.

1. Admin created a fictional customer master; client entered an enquiry with route, mode, packages, dimensions, weight and scenario flags.
2. Admin prepared the enquiry as a quotation in place, assigned the customer and requested vendor rates for each leg. Vendor logged in and submitted rates and an internal test note.
3. Admin entered selling rates/tax, requested and completed approval, and published. Client logged in, accepted and the admin converted the quotation to one shipment.
4. Admin reviewed freight-document/customs controls, marked customs required on international cases from S02 onward, created/confirmed carrier bookings and advanced book → depart → arrive → complete for each applicable leg.
5. Admin created a vendor invoice request per leg. Vendor opened its upload form; the API supplement submitted the PDF and invoice details. Admin reviewed, approved, posted and paid each bill.
6. Admin created the customer invoice after delivery, posted it and recorded full settlement. API/report readback checked job/leg links, totals, actual profit, debit/credit balance and role projections.

For S23 the first leg was paused In Transit and an amendment was attempted before continuing. For S24 separate UI/API negative cases, duplicate AP posting and credit rounding were executed. For S22 an AED customer invoice against a USD job was rejected; EUR charge-line FX was checked; a EUR supplier invoice on S22 was also rejected with HTTP 400 through the file-submit API supplement.

## Detailed scenario results

### 1. Sea FCL export — PARTIAL

**Test data:** Jebel Ali → Hamburg; Sea Freight; Export; Full Container Load; 1 package(s), gross 18000 kg, 1200 × 230 × 230 cm each; expected 63.48 m³, sea W/M 63.48. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. 1 x 40HC; QA sealed machinery; no real cargo

**Records and steps:** S01: enquiry/quote 601, shipment 603, 1 carrier booking(s), bills 606, invoice 607; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, B/L, packing list, commercial invoice, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-00998.

### 2. Sea FCL import — PARTIAL

**Test data:** Hamburg → Jebel Ali; Sea Freight; Import; Full Container Load; 1 package(s), gross 15000 kg, 600 × 230 × 230 cm each; expected 31.74 m³, sea W/M 31.74. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S02: enquiry/quote 609, shipment 611, 1 carrier booking(s), bills 614, invoice 615; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, B/L, delivery order, customs declaration, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-00999.

### 3. Sea LCL consolidation — FAIL

**Test data:** Jebel Ali → Hamburg; Sea Freight; Export; Less Container Load; 1 package(s), gross 1000 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S03: enquiry/quote 617, shipment 619, 1 carrier booking(s), bills 622, invoice 623; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, master B/L, house B/L, consolidation manifest, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. Only one LCL job could be recorded; there is no consolidation master, house attachment or consolidated manifest.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SPECIAL-3](#casl-special-3), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01000.

### 4. Air export with MAWB and HAWB — PARTIAL

**Test data:** Dubai DXB → Frankfurt FRA; Air Freight; Export; Loose; 1 package(s), gross 300 kg, 240 × 200 × 200 cm each; expected 9.6 m³, air chargeable 1600 kg. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S04: enquiry/quote 625, shipment 627, 1 carrier booking(s), bills 630, invoice 631; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, MAWB, HAWB, air manifest, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01001.

### 5. Air import — PARTIAL

**Test data:** Frankfurt FRA → Dubai DXB; Air Freight; Import; Loose; 1 package(s), gross 300 kg, 240 × 200 × 200 cm each; expected 9.6 m³, air chargeable 1600 kg. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S05: enquiry/quote 633, shipment 635, 1 carrier booking(s), bills 638, invoice 639; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, MAWB, HAWB, arrival notice, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01002.

### 6. Road FTL domestic — PARTIAL

**Test data:** Dubai → Abu Dhabi; Road Freight; Domestic; Full Truck Load; 1 package(s), gross 12000 kg, 1200 × 240 × 250 cm each; expected 72 m³. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S06: enquiry/quote 641, shipment 643, 1 carrier booking(s), bills 646, invoice 647; 17 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, packing list, proof of delivery, applicable clearance and specialist controls, delivery, AED revenue 170.00, supplier cost 100.00, tax 8.50, invoice 178.50 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 8.50, gross 178.50 and original supplier cost 100.00 reconciled. GL debits/credits balance in AED. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-GL-01](#casl-gl-01), [CASL-TAX-01](#casl-tax-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01008.

### 7. Road LTL groupage — FAIL

**Test data:** Dubai → Abu Dhabi; Road Freight; Domestic; Less Truck Load; 1 package(s), gross 800 kg, 200 × 150 × 100 cm each; expected 3 m³. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S07: enquiry/quote 649, shipment 651, 1 carrier booking(s), bills 654, invoice 655; 17 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, groupage manifest, consignment notes, applicable clearance and specialist controls, delivery, AED revenue 170.00, supplier cost 100.00, tax 8.50, invoice 178.50 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 8.50, gross 178.50 and original supplier cost 100.00 reconciled. GL debits/credits balance in AED. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. LTL can be selected, but no shared groupage load or multiple consignee delivery can be created.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SPECIAL-7](#casl-special-7), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01009.

### 8. Road cross-border UAE to KSA — PARTIAL

**Test data:** Dubai → Riyadh; Road Freight; Export; Full Truck Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S08: enquiry/quote 657, shipment 659, 1 carrier booking(s), bills 666, invoice 668; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, border customs transit, proof of delivery, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01010.

### 9. Road + Sea — PARTIAL

**Test data:** Dubai → Jebel Ali → Hamburg; Road Freight → Sea Freight; Export; Full Truck Load / Full Container Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S09: enquiry/quote 670, shipment 677, 2 carrier booking(s), bills 684/689, invoice 691; 24 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, B/L, applicable clearance and specialist controls, delivery, USD revenue 395.00, supplier cost 250.00, tax 0.00, invoice 395.00 and profit 145.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 395.00, tax 0.00, gross 395.00 and original supplier cost 250.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 2 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01011. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 10. Sea + Road — PARTIAL

**Test data:** Hamburg → Jebel Ali → Dubai; Sea Freight → Road Freight; Export; Full Container Load / Full Truck Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S10: enquiry/quote 693, shipment 700, 2 carrier booking(s), bills 705/707, invoice 708; 24 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, B/L, road consignment note, applicable clearance and specialist controls, delivery, USD revenue 395.00, supplier cost 250.00, tax 0.00, invoice 395.00 and profit 145.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 395.00, tax 0.00, gross 395.00 and original supplier cost 250.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 2 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01003. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 11. Road + Air — PARTIAL

**Test data:** Dubai Industrial City → Dubai DXB → Frankfurt FRA; Road Freight → Air Freight; Export; Full Truck Load / Loose; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, air chargeable 1200 kg. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S11: enquiry/quote 711, shipment 714, 2 carrier booking(s), bills 718/720, invoice 721; 24 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, HAWB/MAWB, applicable clearance and specialist controls, delivery, USD revenue 395.00, supplier cost 250.00, tax 0.00, invoice 395.00 and profit 145.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 395.00, tax 0.00, gross 395.00 and original supplier cost 250.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 2 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01012. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 12. Air + Road — PARTIAL

**Test data:** Frankfurt FRA → Dubai DXB → Abu Dhabi; Air Freight → Road Freight; Export; Loose / Full Truck Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, air chargeable 1200 kg. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S12: enquiry/quote 723, shipment 729, 2 carrier booking(s), bills 733/735, invoice 736; 24 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, HAWB/MAWB, road consignment note, applicable clearance and specialist controls, delivery, USD revenue 395.00, supplier cost 250.00, tax 0.00, invoice 395.00 and profit 145.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 395.00, tax 0.00, gross 395.00 and original supplier cost 250.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 2 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01004. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 13. Sea + Air via Dubai — PARTIAL

**Test data:** Nhava Sheva → Dubai Hub → Frankfurt FRA; Sea Freight → Air Freight; Export; Less Container Load / Loose; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, air chargeable 1200 kg, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S13: enquiry/quote 738, shipment 741, 2 carrier booking(s), bills 745/747, invoice 748; 24 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, sea-air through document, transfer manifest, HAWB, applicable clearance and specialist controls, delivery, USD revenue 395.00, supplier cost 250.00, tax 0.00, invoice 395.00 and profit 145.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 395.00, tax 0.00, gross 395.00 and original supplier cost 250.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 2 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01005. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 14. Road + Sea + Road door-to-door — PARTIAL

**Test data:** Dubai Industrial City → Jebel Ali → Hamburg → Berlin; Road Freight → Sea Freight → Road Freight; Export; Full Truck Load / Full Container Load / Full Truck Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S14: enquiry/quote 750, shipment 754, 3 carrier booking(s), bills 759/761/763, invoice 764; 31 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, B/L, road consignment note, applicable clearance and specialist controls, delivery, USD revenue 695.00, supplier cost 450.00, tax 0.00, invoice 695.00 and profit 245.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 695.00, tax 0.00, gross 695.00 and original supplier cost 450.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 3 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01013. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 15. Road → Sea → Road → Air under one job — PARTIAL

**Test data:** Dubai → Jebel Ali → Hamburg → Frankfurt FRA → London LHR; Road Freight → Sea Freight → Road Freight → Air Freight; Export; Full Truck Load / Full Container Load / Full Truck Load / Loose; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, air chargeable 1200 kg, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S15: enquiry/quote 766, shipment 771, 4 carrier booking(s), bills 777/779/781/783, invoice 784; 38 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, B/L, road consignment note, HAWB/MAWB, applicable clearance and specialist controls, delivery, USD revenue 1070.00, supplier cost 700.00, tax 0.00, invoice 1070.00 and profit 370.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 1070.00, tax 0.00, gross 1070.00 and original supplier cost 700.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 4 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01014. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 16. Road → Air → Sea → Road under one job — PARTIAL

**Test data:** Dubai Industrial City → Dubai DXB → Hamburg Hub → Rotterdam → Amsterdam; Road Freight → Air Freight → Sea Freight → Road Freight; Export; Full Truck Load / Loose / Full Container Load / Full Truck Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, air chargeable 1200 kg, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S16: enquiry/quote 786, shipment 791, 4 carrier booking(s), bills 806/808/810/812, invoice 813; 38 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, HAWB/MAWB, B/L, road consignment note, applicable clearance and specialist controls, delivery, USD revenue 1070.00, supplier cost 700.00, tax 0.00, invoice 1070.00 and profit 370.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 1070.00, tax 0.00, gross 1070.00 and original supplier cost 700.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 4 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01015. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 17. Transshipment and carrier change — PARTIAL

**Test data:** Dubai → Jebel Ali → Colombo Hub → Singapore; Road Freight → Sea Freight → Sea Freight; Export; Full Truck Load / Full Container Load / Full Container Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S17: enquiry/quote 815, shipment 819, 3 carrier booking(s), bills 825/827/829, invoice 830; 31 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, B/L, B/L, applicable clearance and specialist controls, delivery, USD revenue 695.00, supplier cost 450.00, tax 0.00, invoice 695.00 and profit 245.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 695.00, tax 0.00, gross 695.00 and original supplier cost 450.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 3 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01016. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 18. Dangerous goods in every mode — FAIL

**Test data:** Dubai DXB → Frankfurt FRA; Air Freight; Export; Loose; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, air chargeable 1200 kg. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S18-Air: enquiry/quote 840, shipment 842, 1 carrier booking(s), bills 845, invoice 846; 18 completed browser phases; S18-Rail: enquiry/quote 860, shipment 862, 1 carrier booking(s), bills 865, invoice 866; 18 completed browser phases; S18-Road: enquiry/quote 848, shipment 854, 1 carrier booking(s), bills 857, invoice 858; 18 completed browser phases; S18-Sea: enquiry/quote 832, shipment 834, 1 carrier booking(s), bills 837, invoice 838; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, DG declaration, UN/class/packing instruction, carrier acceptance, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. Sea, air, road and rail negative DG fixtures all reached dispatch without an attached DG declaration or structured acceptance. These deliberately incomplete DG dossiers should require a hold; a complete approved DG process could not be entered.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-DG-01](#casl-dg-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — UI requires a DG document; submission was not completed because the REA contract has no file-picker action.

### 19. Reefer / temperature-controlled cargo — FAIL

**Test data:** Jebel Ali → Hamburg; Sea Freight; Export; Full Container Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. QA frozen food; setpoint -18 C; permitted range -20 to -16 C

**Records and steps:** S19: enquiry/quote 868, shipment 870, 1 carrier booking(s), bills 873, invoice 874; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, temperature instructions, reefer setpoint record, excursion log, applicable clearance and specialist controls, delivery, USD revenue 170.00, supplier cost 100.00, tax 0.00, invoice 170.00 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 0.00, gross 170.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. Temperature control was true on the quotation and absent on the converted job; the -18 °C instruction was only free text, with no setpoint/excursion workflow.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-LOSS-01](#casl-loss-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-TEMP-01](#casl-temp-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01006.

### 20. Oversized out-of-gauge cargo — FAIL

**Test data:** Dubai → Jebel Ali → Hamburg; Road Freight → Sea Freight; Export; Full Truck Load / Break Bulk; 1 package(s), gross 6500 kg, 420 × 280 × 310 cm each; expected 36.456 m³, sea W/M 36.456. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S20: enquiry/quote 877, shipment 884, 2 carrier booking(s), bills 903/908, invoice 910; 24 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, OOG dimensions approval, lashing plan, route permits, applicable clearance and specialist controls, delivery, USD revenue 395.00, supplier cost 250.00, tax 0.00, invoice 395.00 and profit 145.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 395.00, tax 0.00, gross 395.00 and original supplier cost 250.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 2 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified. The OOG dimensions did not trigger permit, route assessment, engineering or lashing approval controls.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-OOG-01](#casl-oog-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01017. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 21. Split shipment with partial deliveries — FAIL

**Test data:** Dubai → Abu Dhabi; Road Freight; Domestic; Full Truck Load; 100 package(s), gross 1200 kg, 40 × 30 × 30 cm each; expected 3.6 m³. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. QA 100 cartons: delivery 60 then 40; same booking

**Records and steps:** S21: enquiry/quote 913, shipment 918, 1 carrier booking(s), bills 922, invoice 923; 17 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, applicable clearance and specialist controls, delivery, AED revenue 170.00, supplier cost 100.00, tax 8.50, invoice 178.50 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 8.50, gross 178.50 and original supplier cost 100.00 reconciled. GL debits/credits balance in AED. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. A 60/40 delivery split could not be represented. Only whole-job completion was available; no partial POD or remaining quantity was tracked.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SPECIAL-21](#casl-special-21), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01018.

### 22. Multi-currency AED / USD / EUR billing — FAIL

**Test data:** Jebel Ali → Hamburg; Sea Freight; Export; Full Container Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S22: enquiry/quote 925, shipment 927, 1 carrier booking(s), bills 930, invoice 931; 18 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, customer tax invoice with AED tax equivalent, foreign-currency supplier bill, applicable clearance and specialist controls, delivery, USD revenue 185.00, supplier cost 100.00, tax 0.00, invoice 185.00 and profit 85.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 185.00, tax 0.00, gross 185.00 and original supplier cost 100.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. EUR 150 selling at 1.10 yielded USD 165 plus USD 20 coordination = USD 185. Actual supplier bill was USD 100, giving actual profit USD 85 (estimate cost was USD 110). An AED customer invoice for the USD job was rejected; a EUR supplier invoice on the same job was rejected with HTTP 400, and supplier upload currency was fixed to the job. Independent AED/USD/EUR billing failed.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-GL-01](#casl-gl-01), [CASL-FX-01](#casl-fx-01), [CASL-TAX-01](#casl-tax-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01007.

### 23. Booking cancellation and amendment mid-transit — FAIL

**Test data:** Dubai → Jebel Ali → Hamburg; Road Freight → Sea Freight; Export; Full Truck Load / Full Container Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³, sea W/M 3. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S23: enquiry/quote 663, shipment 671, 2 carrier booking(s), bills 678/683, invoice 685; 27 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, B/L, applicable clearance and specialist controls, delivery, USD revenue 395.00, supplier cost 250.00, tax 0.00, invoice 395.00 and profit 145.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 395.00, tax 0.00, gross 395.00 and original supplier cost 250.00 reconciled. GL debits/credits balance in USD. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. All 2 legs retained one job ID, separate confirmed bookings and completed event history. Planned carriers differed by leg where specified. At LEG1 In Transit, saving a planned-date amendment returned “Journey legs are locked after booking.” No controlled amendment/cancel/rebook action existed; the original journey was then completed.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-CUSTOMS-01](#casl-customs-01), [CASL-AMEND-01](#casl-amend-01), [CASL-GL-01](#casl-gl-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01019. Portal saved one mode; requested itinerary was placed in the specification. Backend mode tabs were inspected; an ordered source journey was not certified.

### 24. Missing and wrong data validations — FAIL

**Test data:** Dubai → Abu Dhabi; Road Freight; Domestic; Full Truck Load; 1 package(s), gross 1200 kg, 200 × 150 × 100 cm each; expected 3 m³. Pickup 2026-11-09T08:00, delivery 2026-11-28T17:00. Labelled synthetic freight audit fixture; no real cargo.

**Records and steps:** S24: enquiry/quote 688, shipment 694, 1 carrier booking(s), bills 699, invoice 701; 17 completed browser phases. The actual operator sequence above was followed independently for these records.

**Expected:** ordered and linked shipment leg(s), accurate physical quantities, road consignment note, applicable clearance and specialist controls, delivery, AED revenue 170.00, supplier cost 100.00, tax 8.50, invoice 178.50 and profit 70.00; correctly restricted portals and balanced accounts.

**Actual:** the core job reached Invoiced after completion; customer invoice and original supplier bills are Paid. Revenue 170.00, tax 8.50, gross 178.50 and original supplier cost 100.00 reconciled. GL debits/credits balance in AED. Package dimensions persisted, but volume/chargeable quantities were not calculated; required mode-specific documents were unavailable. Negative weight/quantity, zero package count, invalid calendar date and reversed quote expiry were rejected. Net > gross and ETA/ATA before ETD/ATD were saved. A second AED 100 payable was posted for the same supplier invoice, making actual job cost AED 200 and profit AED -30 after the deliberate duplicate. The separate full-credit test left AED 0.07 VAT and AED -0.07 revenue.

**Defects (severity and reproduction below):** [CASL-PHY-01](#casl-phy-01), [CASL-SEC-01](#casl-sec-01), [CASL-DOC-01](#casl-doc-01), [CASL-GL-01](#casl-gl-01), [CASL-AP-01](#casl-ap-01), [CASL-AP-02](#casl-ap-02), [CASL-VALID-01](#casl-valid-01), [CASL-VALID-02](#casl-valid-02), [CASL-ROUND-01](#casl-round-01).

**DP World result:** PARTIAL — Synthetic enquiry saved as Draft; complete source lifecycle not executed. Reference SGP-2026-01020.

## Additional coverage and regressions

Road + Sea + Rail was retested as a separate synthetic shipment 888, invoice 919. All three leg workflows completed under one job. Cost 450.00, revenue 695.00, VAT 0.00, gross 695.00, profit 245.00 USD reconciled. Overall PARTIAL because freight documentation and customs workflows remain absent.

Additional UI checks covered customer/vendor activation, tariff creation/activation, prospect qualification, lead → opportunity → won, completed activity, service job → paid invoice, proforma approval/publication/conversion, AED 50 partial receipt + AED 25 credit + AED 30 settlement, client credit visibility, warehouse master, sales-target generation/recompute, courier intake/delivery, and input-VAT purchase posting. All 20 record screen types now have saved-record/action coverage; this is not a claim that every possible branch or master category was tested.

## Unit, integration, UI and permission results

| Layer | Actual result | Meaning |
|---|---|---|
| Existing unit/DOM regression suite | `node --test`: 97 passed, 0 failed | Existing code tests remain green; they do not cover all freight requirements |
| New live financial/relationship/permission checks | 407 passed, 1 failed / 408 | The failed assertion is supplier-private notes visible to client |
| Shipment browser workflows | 28 fixtures; all core lifecycle settlements completed | 24 requested scenarios have the FAIL/PARTIAL outcomes above |
| Additional module UI | 19 successful phases | Master, CRM, rate, service, proforma, credit, target and courier coverage |
| Report navigation | 21 reports × 3 portals; no page errors | Displayed profit rows matched accessible-record report output |
| Security probes | Anonymous and unrelated-account reads rejected; vendor/client ledger withheld; deactivated sessions rejected | Structured cost-rate redaction passed; charge-note privacy failed |
| Validation negatives | Rejected negative weights/quantities, zero packages, impossible date and invalid expiry | Net/gross and shipment chronology controls failed |
| Duplicate and credit accounting | Duplicate AP accepted; full-credit residual reproduced | Separate confirmed defects, not included as successful reconciliation |

The 408 live checks compare final financial values and relationships; they do not turn missing customs, documents, fleet or stock operations into passes. Browser navigation errors caused by test selectors, unsupported locator roles and file-picker limitations were excluded from ERP defect counts and corrected/replayed where supported. No source-system unit tests were available.

## Defects and gaps

Each finding is listed once; scenario references show where it applies. “Capability gap” means the required workflow was absent in the accessible application, not that a hidden integration was proven broken.

<a id="casl-amend-01"></a>
### CASL-AMEND-01 — High — No controlled journey amendment or cancellation after departure

**Type / screen:** Confirmed capability gap; House Shipments → In Transit.

**Reproduce:** 1) Dispatch LEG1 → 2) Edit its planned departure to 11 November → 3) Save: locked after booking → 4) Review record actions: no supported amendment or cancellation.

**Expected:** Controlled versioned amendments and cancellation with revised legs, costs and documents.

**Actual:** Journey legs are locked after booking; no amend/rebook/cancel operation exposed.

**Recommended solution:** Provide versioned amendment/rebooking and cancellation workflows that preserve departed legs, approvals, costs and documents.

**Evidence scenarios:** S23.

<a id="casl-ap-01"></a>
### CASL-AP-01 — High — Duplicate supplier invoice can become a second posted payable

**Type / screen:** Reproduced defect; Vendor Invoice Requests → Vendor Bills.

**Reproduce:** 1) Use the settled S24 request and its supplier invoice number → 2) Create another request for the same vendor and job → 3) Upload the same invoice number, AED 100 → 4) Approve and post the resulting second bill.

**Expected:** Reject a duplicate vendor/invoice identity or require an explicit audited exception.

**Actual:** Second bill 728 is Posted and unpaid; first bill 699 was already Paid..

**Recommended solution:** Enforce supplier legal-entity plus normalized invoice-number uniqueness before approval/posting, with a reviewed override.

**Evidence scenarios:** S24.

<a id="casl-ap-02"></a>
### CASL-AP-02 — High — Automatic supplier bills and payables report identify the customer organization

**Type / screen:** Reproduced defect; Invoice request approval / Reports → Outstanding Payables.

**Reproduce:** 1) Approve a vendor invoice request linked to a customer shipment → 2) Open the generated bill → 3) Open Outstanding Payables.

**Expected:** Identify the supplier as the creditor and keep the shipment customer separately.

**Actual:** BILL-000728 appears against the S24 Customer organization. Vendor login is stored separately, but no supplier organization is linked by approval..

**Recommended solution:** Add a supplier-organization relationship to vendor accounts/requests/bills and use it in AP reports.

**Evidence scenarios:** S24.

<a id="casl-customs-01"></a>
### CASL-CUSTOMS-01 — High — No customs declaration/release workflow or dispatch gate

**Type / screen:** Confirmed capability gap; House Shipments → customs fields.

**Reproduce:** 1) Inspect customs-required/reference fields → 2) Search menus and shipment actions for clearance/release → 3) Continue the shipment lifecycle without a clearance document.

**Expected:** A clearance record, release/hold status and controlled dispatch.

**Actual:** Only customs fields and a duty report are exposed.

**Recommended solution:** Introduce declarations, entries, attachments, hold/release status and a release gate before dispatch where clearance is required.

**Evidence scenarios:** S01, S02, S03, S04, S05, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18-Air, S18-Rail, S18-Road, S18-Sea, S19, S20, S22, S23, S25.

<a id="casl-dg-01"></a>
### CASL-DG-01 — High — Hazardous cargo can progress without structured dangerous-goods acceptance data

**Type / screen:** Confirmed capability gap; Quotations / House Shipments.

**Reproduce:** 1) Create hazardous inquiry with package dimensions → 2) Inspect DG acceptance fields → 3) Book and dispatch without an approved DG declaration.

**Expected:** Mode-appropriate UN/class/packing instruction and acceptance controls.

**Actual:** Only hazardous flags, free text and attachments are present.

**Recommended solution:** Add structured mode-specific DG data, required supporting documents and an acceptance/release decision before dispatch.

**Evidence scenarios:** S18-Air, S18-Rail, S18-Road, S18-Sea.

<a id="casl-doc-01"></a>
### CASL-DOC-01 — High — Mode-specific freight documents cannot be generated

**Type / screen:** Confirmed capability gap; House Shipments → record details.

**Reproduce:** 1) Open the saved shipment → 2) Inspect generation/print actions → 3) Only generic Print / save PDF and file attachments are available.

**Expected:** ["B/L","packing list","commercial invoice"].

**Actual:** ["Print / save PDF"].

**Recommended solution:** Add versioned mode-specific documents and master/house links with numbering, validation and printable templates.

**Evidence scenarios:** S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18-Air, S18-Rail, S18-Road, S18-Sea, S19, S20, S21, S22, S23, S24, S25.

<a id="casl-fleet-01"></a>
### CASL-FLEET-01 — High — Truck masters do not provide transport or fleet execution

**Type / screen:** Confirmed capability gap; Master Data → Trucks / Carrier Bookings.

**Reproduce:** 1) Inspect truck master fields and road booking form → 2) Look for driver/vehicle assignment, trip sheet, permit, maintenance or POD controls.

**Expected:** Assign and operate fleet trips with resource availability and delivery evidence.

**Actual:** A generic Truck category and free-text carrier/vehicle fields are present; fleet operations are absent..

**Recommended solution:** Add vehicle/driver/trip records, availability checks and delivery evidence.

**Evidence scenarios:** S06, S07, S08.

<a id="casl-fx-01"></a>
### CASL-FX-01 — High — One job cannot receive supplier/customer bills in independent currencies

**Type / screen:** Confirmed capability gap; Vendor Invoice Requests / Invoices.

**Reproduce:** 1) On S22 USD job 927, create an AED customer invoice and save → 2) Open its USD supplier request upload form → 3) Submit a EUR invoice through the authenticated API supplement.

**Expected:** EUR supplier bill and AED customer invoice against the same USD job, with base-currency accounting.

**Actual:** [{"test":"AED customer invoice against USD job","result":"Document currency must match the linked job."},{"test":"EUR supplier invoice against USD job/request","result":{"error":"Invoice totals must be positive, in the request currency, with a PDF or image."},"status":400}].

**Recommended solution:** Allow document currencies distinct from the job, with dated exchange rates, base-currency ledgers and realized/unrealized FX handling.

**Evidence scenarios:** S22.

<a id="casl-loss-01"></a>
### CASL-LOSS-01 — High — Temperature-control flag is lost when a quote becomes a shipment

**Type / screen:** Reproduced defect; Quotation → House Shipment.

**Reproduce:** 1) Create an inquiry with Temperature controlled checked → 2) Prepare and accept the quotation → 3) Convert it to a shipment and inspect the operational details.

**Expected:** Preserve temperature control in the operational job.

**Actual:** {"quote_temperature":true,"shipment_temperature":null}.

**Recommended solution:** Preserve the temperature-control requirement and instructions throughout quote-to-job conversion and printing.

**Evidence scenarios:** S19.

<a id="casl-oog-01"></a>
### CASL-OOG-01 — High — Oversized cargo has no OOG approval, lashing or route-permit workflow

**Type / screen:** Confirmed capability gap; Quotations / House Shipments.

**Reproduce:** 1) Enter 420 x 280 x 310 cm, 6500 kg → 2) Book and dispatch without OOG approvals.

**Expected:** OOG limits, engineering approval, lashing plan and route permits.

**Actual:** Dimensions are stored but no approval/permit gate is exposed.

**Recommended solution:** Add OOG assessment, permits, engineering/lashing approvals and shipment release requirements.

**Evidence scenarios:** S20.

<a id="casl-phy-01"></a>
### CASL-PHY-01 — High — Dimensions do not calculate volume or chargeable weight

**Type / screen:** Confirmed capability gap; Quote Inquiries → Quotations.

**Reproduce:** 1) Enter package count and dimensions shown in test data → 2) Save inquiry and prepare quotation without manually entering volume → 3) Read declared volume / chargeable fields.

**Expected:** {"volume":"63.48","chargeable":"63.48"}.

**Actual:** {"gross":"18000","volume":null,"chargeable":null,"expected_volume":"63.48","expected_air_chargeable":"18000","expected_sea_wm":"63.48"}.

**Recommended solution:** Calculate unit-aware volume, gross totals and mode-specific chargeable quantities; support an explicit audited manual override.

**Evidence scenarios:** S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18-Air, S18-Rail, S18-Road, S18-Sea, S19, S20, S21, S22, S23, S24, S25.

<a id="casl-sec-01"></a>
### CASL-SEC-01 — High — Supplier internal line notes disclose buying prices to customers

**Type / screen:** Reproduced defect; Client → Quotations.

**Reproduce:** 1) Vendor: submit a rate with line Note INTERNAL-AUDIT-BUY-<currency>-<cost> → 2) Admin: publish the quotation → 3) Client: open quotation and read the charge Note column.

**Expected:** Vendor pricing notes remain internal.

**Actual:** [{"description":"Audit coordination"},{"description":"LEG1 freight","note":"INTERNAL-AUDIT-BUY-USD-100"}].

**Recommended solution:** Separate supplier-private notes from customer-facing descriptions and enforce that separation in both API projections and rendering.

**Evidence scenarios:** S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18-Air, S18-Rail, S18-Road, S18-Sea, S19, S20, S21, S22, S23, S24, S25.

<a id="casl-special-21"></a>
### CASL-SPECIAL-21 — High — No operational workflow for split consignments and partial delivery

**Type / screen:** Confirmed capability gap; Operations.

**Reproduce:** 1) Create the scenario enquiry → 2) Inspect booking and shipment actions for the required operation.

**Expected:** split consignments and partial delivery.

**Actual:** No dedicated screen/action found.

**Recommended solution:** Track booked, dispatched, delivered and remaining quantities per consignment and issue partial PODs.

**Evidence scenarios:** S21.

<a id="casl-special-3"></a>
### CASL-SPECIAL-3 — High — No operational workflow for master/house consolidation

**Type / screen:** Confirmed capability gap; Operations.

**Reproduce:** 1) Create the scenario enquiry → 2) Inspect booking and shipment actions for the required operation.

**Expected:** master/house consolidation.

**Actual:** No dedicated screen/action found.

**Recommended solution:** Implement consolidation masters, multiple linked houses, container allocations and manifests.

**Evidence scenarios:** S03.

<a id="casl-special-7"></a>
### CASL-SPECIAL-7 — High — No operational workflow for groupage and multiple consignees

**Type / screen:** Confirmed capability gap; Operations.

**Reproduce:** 1) Create the scenario enquiry → 2) Inspect booking and shipment actions for the required operation.

**Expected:** groupage and multiple consignees.

**Actual:** No dedicated screen/action found.

**Recommended solution:** Implement groupage loads with multiple consignments, consignees and per-consignment delivery.

**Evidence scenarios:** S07.

<a id="casl-tax-01"></a>
### CASL-TAX-01 — High — Generic invoice view lacks an issuable UAE tax-invoice template

**Type / screen:** Confirmed capability gap; Invoices → Print / save PDF.

**Reproduce:** 1) Open the taxable AED domestic invoice → 2) Review available issuer, supplier TRN, supply-date and invoice template fields → 3) Review foreign-currency invoice controls.

**Expected:** Produce an appropriate configured tax invoice, including required issuer/recipient details and AED tax presentation where applicable.

**Actual:** The invoice uses the generic record view and has no issuer TRN/address/template configuration or AED tax equivalent for foreign-currency documents..

**Recommended solution:** Implement configurable legal invoice/credit-note templates with issuer identity, tax treatment and AED equivalents; verify applicable full/simplified/zero-rated exceptions.

**Evidence scenarios:** S06, S22.

<a id="casl-temp-01"></a>
### CASL-TEMP-01 — High — Temperature-controlled cargo has no setpoint or excursion workflow

**Type / screen:** Confirmed capability gap; Quotations / House Shipments.

**Reproduce:** 1) Set Temperature controlled → 2) Enter -18 C in specification → 3) Inspect shipment controls and milestones for temperature monitoring.

**Expected:** Structured setpoint/range, reefer instructions and temperature events.

**Actual:** Temperature checkbox and free-text specification only.

**Recommended solution:** Store setpoint, allowed range, reefer equipment and temperature/excursion events as structured operational data.

**Evidence scenarios:** S19.

<a id="casl-valid-01"></a>
### CASL-VALID-01 — High — Net weight greater than gross weight is accepted

**Type / screen:** Reproduced defect; Quotations → Create/Edit.

**Reproduce:** 1) Create a valid quotation → 2) Set gross weight 1000 kg and net weight 2000 kg → 3) Save.

**Expected:** Reject net weight above gross weight.

**Actual:** The quotation saves with gross 1000 and net 2000..

**Recommended solution:** Validate the relationship on enquiries, quotes, packages and shipments.

**Evidence scenarios:** S24.

<a id="casl-valid-02"></a>
### CASL-VALID-02 — High — Single-mode shipment accepts arrival before departure

**Type / screen:** Reproduced defect; House Shipments → Create/Edit.

**Reproduce:** 1) Enter ETD 10 Nov / ETA 1 Nov 2026 → 2) Enter ATD 11 Nov / ATA 2 Nov 2026 → 3) Save the otherwise valid shipment.

**Expected:** Reject reversed planned and actual transport dates.

**Actual:** All four contradictory dates persist in the saved shipment..

**Recommended solution:** Validate ETD/ETA and ATD/ATA order as well as individual date syntax.

**Evidence scenarios:** S24.

<a id="casl-wms-01"></a>
### CASL-WMS-01 — High — Warehousing is a configuration name without inventory operations

**Type / screen:** Confirmed capability gap; Master Data → Warehouses / Operations.

**Reproduce:** 1) Create and activate the QA warehouse master → 2) Look for receipts, locations, stock balances, movements, picks and dispatch allocations.

**Expected:** Receive, store, allocate and release cargo with quantity/location traceability.

**Actual:** Only a generic warehouse master record can be created. No stock workflow is exposed..

**Recommended solution:** Implement stock movements and shipment-linked receipt/pick/dispatch records.

<a id="casl-gl-01"></a>
### CASL-GL-01 — Medium — Payment entry cannot select a bank account or journal

**Type / screen:** Confirmed capability gap; Invoices / Vendor Bills → Record payment.

**Reproduce:** 1) Record a supplier bank transfer or customer bank receipt → 2) Inspect payment form: no journal/account selector → 3) Inspect General ledger entries: Cash is used.

**Expected:** Select cash/bank journal and post to the chosen ledger.

**Actual:** Payment forms expose amount/reference only; entries use Cash.

**Recommended solution:** Let payments select a configured bank/cash account and journal, and reconcile against bank activity.

**Evidence scenarios:** S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18-Air, S18-Rail, S18-Road, S18-Sea, S19, S20, S21, S22, S23, S24, S25.

<a id="casl-legacy-01"></a>
### CASL-LEGACY-01 — Medium — Earlier workspace exposes placeholder modules and a separate quote data set

**Type / screen:** Reproduced inconsistency; Admin → Earlier draft workspace → /legacy.

**Reproduce:** 1) Open Earlier draft workspace → 2) Use its ERP workspace and sidebar modules → 3) Compare its quotation count to the main workspace.

**Expected:** Navigation opens supported workflows and one consistent operational data set.

**Actual:** The earlier workspace advertises incomplete workflows, several sidebar entries are placeholders, and its quotations differ from the main workspace..

**Recommended solution:** Remove the obsolete entry point or migrate it to the main records and real module routes.

<a id="casl-rate-01"></a>
### CASL-RATE-01 — Medium — Activated tariffs are not selectable or applied to quotations

**Type / screen:** Confirmed capability gap; Tariffs → Quotations.

**Reproduce:** 1) Create and activate the AED Dubai–Abu Dhabi sell tariff → 2) Open a matching quotation and its charge controls → 3) Look for rate discovery/application and validity selection.

**Expected:** Apply the appropriate dated buy/sell tariff with its basis and source reference.

**Actual:** Tariffs store charge lines, but quotation controls provide no tariff link or application action. Charges must be re-entered or imported manually..

**Recommended solution:** Add explicit tariff selection with route/date/basis matching and charge provenance.

**Evidence scenarios:** S06.

<a id="casl-round-01"></a>
### CASL-ROUND-01 — Medium — Repeated partial credits leave tax and revenue balances after full reversal

**Type / screen:** Reproduced defect; Invoices → Credit Notes → General ledger.

**Reproduce:** 1) Post an AED 100 net + AED 5 VAT invoice → 2) Post ten AED 10 gross credits and one AED 5 credit → 3) Compare total credits and remaining ledger balances.

**Expected:** {"gross_credits":"105.00","net_credits":"100.00","VAT_balance":"0.00","revenue_balance":"0.00"}.

**Actual:** {"status":"Credited","gross_credits":"105.00","net_credits":"100.07","tax_payable_balance":0.07,"sales_revenue_balance":-0.07,"ar_credit_balance":0}.

**Recommended solution:** Track remaining net/tax amounts and allocate final-credit rounding to fully reverse the original invoice. First credit was entered in Chrome; subsequent credits used the normal authenticated API.

**Evidence scenarios:** S24.

<a id="casl-ui-01"></a>
### CASL-UI-01 — Medium — First row click after editing search is consumed by filter rendering

**Type / screen:** Reproduced defect; Quotations → Search → record number.

**Reproduce:** 1) Type the S22 title into Search without Tab or Enter → 2) Click its visible record number → 3) Observe that only the filtered list appears → 4) Click the record number again to open details.

**Expected:** The first row click opens the selected record.

**Actual:** Search commits on change/blur and replaces the table during the first click; no record GET occurs until the second click..

**Recommended solution:** Commit filtering before row activation or preserve the selected record through the filter render.

## Fix order and missing freight capabilities

1. Stop commercial data disclosure (SEC-01), duplicate payables (AP-01) and wrong supplier attribution (AP-02).
2. Correct weight/date validation, quote-to-job special-handling loss and credit-note rounding. Add regressions for the exact saved examples.
3. Implement freight document generation, master/house consolidation, clearance/hold/release and DG acceptance gates before treating operational completion as release for transport.
4. Add reefer/OOG controls, groupage and split quantities/PODs, plus controlled route amendments and cancellations.
5. Implement independent buy/sell/job/base currencies, tax invoice templates, configurable ledgers/journals and bank reconciliation.
6. Build actual warehouse and fleet operations; connect tariffs to quotations; retire the obsolete earlier workspace.

Additional enterprise capabilities to scope separately include finance/operations/warehouse role separation, company-level access policy, accounting periods/chart-of-accounts/journal configuration, base-currency financial statements, AP/AR aging buckets, live customs/carrier integrations, stock/fleet integrations, backup/restore verification and concurrency/load testing. The requested three portal roles exist; more detailed roles were not an agreed implemented policy and are reported as future scope, not an access exploit.

Known capacity limitation: snapshot-backed reports omit records beyond the latest 5,000 accessible records and display a notice. This code-supported limit was not load-tested with 5,001 new records. External email, bank settlement, government filing, carrier acceptance, e-invoicing-provider connectivity, hosted Vercel behavior, browser file choosers and disaster recovery remain unverified. No PASS is assigned to those integrations.

## Evidence and handover

Use [scenario CSV](qa-scenario-matrix.csv), [defect CSV](qa-defects.csv), [machine-readable audit](qa-audit-results.json), [source comparison](qa-source-comparison.md) and [evidence manifest](qa-evidence-index.json). Local fixtures remain available for review. The deliberate duplicate bill is Posted and unpaid; it is clearly labelled in its invoice request. Temporary role-isolation accounts were deactivated. The S22 rejected-currency supplier request also remains labelled for review. No application fix is included in this audit.

DG references used to distinguish data/acceptance controls from generic file uploads: [IATA shipper declaration guidance](https://www.iata.org/en/programs/cargo/dangerous-goods//shippers-declaration), [IMO IMDG information](https://www.imo.org/en/publications/pages/imdg%20code.aspx). Exact requirements depend on commodity, mode, exemptions and carrier acceptance. Road consignment documentation is required by the test brief; CMR is only expected where applicable to the movement.
