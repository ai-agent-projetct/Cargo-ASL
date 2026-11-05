# Cargo ASL freight remediation and regression report

Date: 2026-11-05T10:39:18.886Z. Target: local Cargo ASL, Node 24 and MySQL. All records are fictional QA data. The original [audit](qa-audit-report.md) remains unchanged.

**Result:** 24/24 requested scenarios PASS, plus road–sea–rail. DG variants produce 28 passing fixtures. 121 unit tests passed; the complete scenario run made 5170 successful/asserted API checks. Financial/access/CRM/service/report controls passed 71 explicit assertions and 624 API checks. Six real Chrome acceptance groups passed with no page errors. Three large PDFs were submitted through individually staged uploads in both client and vendor workflows; user isolation, replay protection and atomic links passed 25 API checks. The workspace exposes 38 record screens and 21 reports. An isolated restore matched all 21 tables and attachment contents. The final npm audit reported zero known vulnerabilities.

These results establish the tested application workflows. They do not certify live production deployment, automatic carrier/customs integrations, carrier acceptance of generated forms, tax treatment or exhaustive source-ERP parity. Cloud MySQL and real legal/bank details are still missing; see [production preparation](production-readiness.md). Historical QA records/issued copies remain evidence and are not fabricated into valid production records.

## Finding closure

All 25 original findings have an implementation and regression evidence in the tested scope. Legal configuration and external operational approvals remain release requirements.

| Finding | Fix | Evidence |
|---|---|---|
| CASL-AMEND-01 (High) | Versioned future-leg amendments retain departed legs/sequence and old costs. Mid-transit cancellation records disposition; explained settlement remains possible. | S23; cancellation/settlement controls |
| CASL-AP-01 (High) | Atomic supplier/invoice registry rejects normalized duplicate identity, including concurrent posting. | Concurrent duplicate-bill assertion |
| CASL-AP-02 (High) | Vendor accounts link to legal supplier organizations; generated bills and AP identify the supplier. | All vendor bill scenarios; AP controls |
| CASL-CUSTOMS-01 (High) | Declarations, holds, supporting evidence and export/import release gates are enforced. | Cross-border scenarios; missing-proof rejection |
| CASL-DG-01 (High) | Structured UN/name/class/packing/regulation data, signed support and verified acceptance block unsafe dispatch. | S18 Sea/Air/Road/Rail |
| CASL-DOC-01 (High) | Mode-specific documents, valid MAWB stock, master/house links, manifests and immutable approved/issued PDF copies. | All scenarios; PDF visual review |
| CASL-FLEET-01 (High) | Vehicles/drivers/trips validate expiry, capacity and availability; road arrival and trip closure precede completion. | S06 fleet lifecycle |
| CASL-FX-01 (High) | Independent document currencies, dated FX, AED postings, chosen journals and realized FX gains/losses. | S22; six-currency credit and payment controls |
| CASL-LOSS-01 (High) | Temperature requirements and instructions survive quotation conversion. | S19; conversion assertion |
| CASL-OOG-01 (High) | Unit-aware OOG detection requires permits, equipment, engineering/lashing acceptance and evidence. | S20 |
| CASL-PHY-01 (High) | Unit-aware volume, gross weight, 1:6000 air chargeable weight, sea W/M and container TEUs. | Physical assertions in every scenario; unit cases |
| CASL-SEC-01 (High) | Customer projections and tables omit buy rates, buy FX/currency and supplier-private notes/metadata. | Published-quotation assertions in all scenarios; Chrome client checks |
| CASL-SPECIAL-21 (High) | Consignments and signed PODs enforce booked, partially delivered and remaining quantities before completion. | S21 60/40 split; incomplete-delivery rejection |
| CASL-SPECIAL-3 (High) | Sealed masters link multiple houses, master/house B/Ls and manifests; one shared bill allocates exact costs. | S03; shared one-cent allocation unit test |
| CASL-SPECIAL-7 (High) | Groupage masters carry multiple houses/consignees, shared cost shares and individual delivery evidence. | S07 |
| CASL-TAX-01 (High) | Issuer/customer snapshots, tax treatment, supply date, credits and AED equivalent fields render in legal-profile-aware PDFs. Production legal configuration remains required. | S06/S22; credit controls; rendered PDF review |
| CASL-TEMP-01 (High) | Setpoint/range/equipment, readings, excursion rejection and explained resolution are linked to each leg. | S19 |
| CASL-VALID-01 (High) | Net weight above gross is rejected; package dimensions/counts and numerical precision are checked. | S24; control negatives; unit tests |
| CASL-VALID-02 (High) | Planned and actual date pairs reject reversed chronology. | S24; control negatives; unit tests |
| CASL-WMS-01 (High) | Receipts, bin/cross-warehouse transfers and dispatch use locked non-negative stock balances and cargo quantity limits. | S06 receipt → transfer → dispatch |
| CASL-GL-01 (Medium) | Payments require an active selected bank/cash journal; AED carrying balances and settlement differences are explicit. | All settlements; changed-FX bank assertion |
| CASL-LEGACY-01 (Medium) | Legacy entry redirects into the current workspace; historical tables remain preserved. | Route implementation; current browser entry |
| CASL-RATE-01 (Medium) | Active valid route-matched tariffs apply to charges using physical measurement bases. | 1600 kg air tariff control |
| CASL-ROUND-01 (Medium) | Cumulative source/base net and VAT allocation consumes residual cents on full reversal. | Six-currency API reversals; 250 arbitrary unit sequences |
| CASL-UI-01 (Medium) | Search updates on input and preserves focus/caret, so the first record click works. | Every browser record open uses search then one click |

Additional defects caught and fixed during remediation included audit-label overflow on long cancellation reasons, same-currency payment FX changing the native bank amount, master-cost rounding across houses, PDF footer/signature pagination, missing arrow glyphs, and customer organization labels. Full cancellation reasons are retained as internal notes. Issued copies remain immutable.

## Scenario summary

| Scenario | Status | Job | Currency | Actual cost | Actual revenue | Actual profit |
|---|---|---|---|---|---|---|
| S01 Sea FCL export | PASS | 3040 | USD | 100.00 | 170.00 | 70.00 |
| S02 Sea FCL import | PASS | 3054 | USD | 100.00 | 170.00 | 70.00 |
| S03 Sea LCL consolidation | PASS | 3070 | USD | 160.00 | 170.00 | 10.00 |
| S04 Air export with MAWB and HAWB | PASS | 3100 | USD | 100.00 | 170.00 | 70.00 |
| S05 Air import | PASS | 3117 | USD | 100.00 | 170.00 | 70.00 |
| S06 Road FTL domestic | PASS | 3136 | AED | 100.00 | 170.00 | 70.00 |
| S07 Road LTL groupage | PASS | 3156 | AED | 160.00 | 170.00 | 10.00 |
| S08 Road cross-border UAE to KSA | PASS | 3181 | USD | 100.00 | 170.00 | 70.00 |
| S09 Road + Sea | PASS | 3196 | USD | 250.00 | 370.00 | 120.00 |
| S10 Sea + Road | PASS | 3219 | USD | 250.00 | 370.00 | 120.00 |
| S11 Road + Air | PASS | 3242 | USD | 250.00 | 370.00 | 120.00 |
| S12 Air + Road | PASS | 3268 | USD | 250.00 | 370.00 | 120.00 |
| S13 Sea + Air via Dubai | PASS | 3294 | USD | 250.00 | 370.00 | 120.00 |
| S14 Road + Sea + Road door-to-door | PASS | 3323 | USD | 450.00 | 620.00 | 170.00 |
| S15 Road → Sea → Road → Air under one job | PASS | 3355 | USD | 700.00 | 920.00 | 220.00 |
| S16 Road → Air → Sea → Road under one job | PASS | 3399 | USD | 700.00 | 920.00 | 220.00 |
| S17 Transshipment and carrier change | PASS | 3442 | USD | 450.00 | 620.00 | 170.00 |
| S18-Sea Dangerous goods in every mode / Sea Freight | PASS | 3473 | USD | 100.00 | 170.00 | 70.00 |
| S18-Air Dangerous goods in every mode / Air Freight | PASS | 3489 | USD | 100.00 | 170.00 | 70.00 |
| S18-Road Dangerous goods in every mode / Road Freight | PASS | 3508 | USD | 100.00 | 170.00 | 70.00 |
| S18-Rail Dangerous goods in every mode / Rail Freight | PASS | 3524 | USD | 100.00 | 170.00 | 70.00 |
| S19 Reefer / temperature-controlled cargo | PASS | 3540 | USD | 100.00 | 170.00 | 70.00 |
| S20 Oversized out-of-gauge cargo | PASS | 3557 | USD | 250.00 | 370.00 | 120.00 |
| S21 Split shipment with partial deliveries | PASS | 3581 | AED | 100.00 | 170.00 | 70.00 |
| S22 Multi-currency AED / USD / EUR billing | PASS | 3596 | USD | 110.00 | 170.00 | 60.00 |
| S23 Booking cancellation and amendment mid-transit | PASS | 3611 | USD | 250.00 | 370.00 | 120.00 |
| S24 Missing and wrong data validations | PASS | 3639 | AED | 100.00 | 170.00 | 70.00 |
| S25 Additional regression: Road + Sea + Rail | PASS | 3653 | USD | 450.00 | 620.00 | 170.00 |

## Detailed results

### S01 — Sea FCL export

**Status: PASS.**

**Test data:** Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany). Export; USD. 1 package(s), 1200 × 230 × 230 cm; 18000 kg gross, 63.48 CBM, 18000 kg air chargeable, 63.48 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3040; invoice 3050. 125 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S02 — Sea FCL import

**Status: PASS.**

**Test data:** Sea Freight Hamburg (Germany) → Jebel Ali (United Arab Emirates). Import; USD. 1 package(s), 600 × 230 × 230 cm; 15000 kg gross, 31.74 CBM, 15000 kg air chargeable, 31.74 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3054; invoice 3066. 133 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S03 — Sea LCL consolidation

**Status: PASS.**

**Test data:** Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1000 kg gross, 3 CBM, 1000 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 160.00, net revenue 170.00, profit 10.00 USD. Job 3070; invoice 3092. 274 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S04 — Air export with MAWB and HAWB

**Status: PASS.**

**Test data:** Air Freight Dubai DXB (United Arab Emirates) → Frankfurt FRA (Germany). Export; USD. 1 package(s), 240 × 200 × 200 cm; 300 kg gross, 9.6 CBM, 1600 kg air chargeable, 9.6 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3100; invoice 3113. 137 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S05 — Air import

**Status: PASS.**

**Test data:** Air Freight Frankfurt FRA (Germany) → Dubai DXB (United Arab Emirates). Import; USD. 1 package(s), 240 × 200 × 200 cm; 300 kg gross, 9.6 CBM, 1600 kg air chargeable, 9.6 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3117; invoice 3132. 145 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S06 — Road FTL domestic

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Abu Dhabi (United Arab Emirates). Domestic; AED. 1 package(s), 1200 × 240 × 250 cm; 12000 kg gross, 72 CBM, 12000 kg air chargeable, 72 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 AED. Job 3136; invoice 3152. 143 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S07 — Road LTL groupage

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Abu Dhabi (United Arab Emirates). Domestic; AED. 1 package(s), 200 × 150 × 100 cm; 800 kg gross, 3 CBM, 800 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 160.00, net revenue 170.00, profit 10.00 AED. Job 3156; invoice 3173. 229 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S08 — Road cross-border UAE to KSA

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Riyadh (Saudi Arabia). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3181; invoice 3191. 125 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S09 — Road + Sea

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Jebel Ali (United Arab Emirates); Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 250.00, net revenue 370.00, profit 120.00 USD. Job 3196; invoice 3214. 185 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S10 — Sea + Road

**Status: PASS.**

**Test data:** Sea Freight Hamburg (Germany) → Jebel Ali (United Arab Emirates); Road Freight Jebel Ali (United Arab Emirates) → Dubai (United Arab Emirates). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 250.00, net revenue 370.00, profit 120.00 USD. Job 3219; invoice 3237. 185 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S11 — Road + Air

**Status: PASS.**

**Test data:** Road Freight Dubai Industrial City (United Arab Emirates) → Dubai DXB (United Arab Emirates); Air Freight Dubai DXB (United Arab Emirates) → Frankfurt FRA (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 250.00, net revenue 370.00, profit 120.00 USD. Job 3242; invoice 3263. 197 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S12 — Air + Road

**Status: PASS.**

**Test data:** Air Freight Frankfurt FRA (Germany) → Dubai DXB (United Arab Emirates); Road Freight Dubai DXB (United Arab Emirates) → Abu Dhabi (United Arab Emirates). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 250.00, net revenue 370.00, profit 120.00 USD. Job 3268; invoice 3289. 197 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S13 — Sea + Air via Dubai

**Status: PASS.**

**Test data:** Sea Freight Nhava Sheva (India) → Dubai Hub (United Arab Emirates); Air Freight Dubai Hub (United Arab Emirates) → Frankfurt FRA (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 250.00, net revenue 370.00, profit 120.00 USD. Job 3294; invoice 3317. 217 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S14 — Road + Sea + Road door-to-door

**Status: PASS.**

**Test data:** Road Freight Dubai Industrial City (United Arab Emirates) → Jebel Ali (United Arab Emirates); Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany); Road Freight Hamburg (Germany) → Berlin (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 450.00, net revenue 620.00, profit 170.00 USD. Job 3323; invoice 3348. 241 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S15 — Road → Sea → Road → Air under one job

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Jebel Ali (United Arab Emirates); Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany); Road Freight Hamburg (Germany) → Frankfurt FRA (Germany); Air Freight Frankfurt FRA (Germany) → London LHR (United Kingdom). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 700.00, net revenue 920.00, profit 220.00 USD. Job 3355; invoice 3392. 329 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S16 — Road → Air → Sea → Road under one job

**Status: PASS.**

**Test data:** Road Freight Dubai Industrial City (United Arab Emirates) → Dubai DXB (United Arab Emirates); Air Freight Dubai DXB (United Arab Emirates) → Hamburg Hub (Germany); Sea Freight Hamburg Hub (Germany) → Rotterdam (Netherlands); Road Freight Rotterdam (Netherlands) → Amsterdam (Netherlands). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 700.00, net revenue 920.00, profit 220.00 USD. Job 3399; invoice 3436. 329 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S17 — Transshipment and carrier change

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Jebel Ali (United Arab Emirates); Sea Freight Jebel Ali (United Arab Emirates) → Colombo Hub (Sri Lanka); Sea Freight Colombo Hub (Sri Lanka) → Singapore (Singapore). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 450.00, net revenue 620.00, profit 170.00 USD. Job 3442; invoice 3469. 261 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S18-Sea — Dangerous goods in every mode / Sea Freight

**Status: PASS.**

**Test data:** Sea Freight Dubai DXB (United Arab Emirates) → Frankfurt FRA (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: true; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3473; invoice 3485. 134 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S18-Air — Dangerous goods in every mode / Air Freight

**Status: PASS.**

**Test data:** Air Freight Dubai DXB (United Arab Emirates) → Frankfurt FRA (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: true; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3489; invoice 3504. 146 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S18-Road — Dangerous goods in every mode / Road Freight

**Status: PASS.**

**Test data:** Road Freight Dubai DXB (United Arab Emirates) → Frankfurt FRA (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: true; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3508; invoice 3520. 134 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S18-Rail — Dangerous goods in every mode / Rail Freight

**Status: PASS.**

**Test data:** Rail Freight Dubai DXB (United Arab Emirates) → Frankfurt FRA (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: true; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3524; invoice 3536. 134 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S19 — Reefer / temperature-controlled cargo

**Status: PASS.**

**Test data:** Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: true.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 USD. Job 3540; invoice 3552. 140 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S20 — Oversized out-of-gauge cargo

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Jebel Ali (United Arab Emirates); Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany). Export; USD. 1 package(s), 420 × 280 × 310 cm; 6500 kg gross, 36.456 CBM, 6500 kg air chargeable, 36.456 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 250.00, net revenue 370.00, profit 120.00 USD. Job 3557; invoice 3577. 199 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S21 — Split shipment with partial deliveries

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Abu Dhabi (United Arab Emirates). Domestic; AED. 100 package(s), 40 × 30 × 30 cm; 1200 kg gross, 3.6 CBM, 1200 kg air chargeable, 3.6 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 AED. Job 3581; invoice 3592. 127 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S22 — Multi-currency AED / USD / EUR billing

**Status: PASS.**

**Test data:** Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 110.00, net revenue 170.00, profit 60.00 USD. Job 3596; invoice 3606. 130 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S23 — Booking cancellation and amendment mid-transit

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Jebel Ali (United Arab Emirates); Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 250.00, net revenue 370.00, profit 120.00 USD. Job 3611; invoice 3635. 220 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S24 — Missing and wrong data validations

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Abu Dhabi (United Arab Emirates). Domestic; AED. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 100.00, net revenue 170.00, profit 70.00 AED. Job 3639; invoice 3647. 108 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

### S25 — Additional regression: Road + Sea + Rail

**Status: PASS.**

**Test data:** Road Freight Dubai (United Arab Emirates) → Jebel Ali (United Arab Emirates); Sea Freight Jebel Ali (United Arab Emirates) → Hamburg (Germany); Rail Freight Hamburg (Germany) → Berlin (Germany). Export; USD. 1 package(s), 200 × 150 × 100 cm; 1200 kg gross, 3 CBM, 1200 kg air chargeable, 3 sea W/M. DG: false; temperature controlled: false.

**Steps performed:** Client enquiry → Vendor rate submission → Pricing and approval → Client acceptance → Conversion under one job → Carrier confirmation → Mode documents with master links → Customs and safety release controls → Leg dispatch, arrival and delivery → Supplier invoice upload and settlement → Customer invoice and settlement → Profit report and balanced AED ledger.

**Expected vs actual:** Linked legs and documents, physical calculations, applicable customs/safety controls, final delivery quantities/POD, supplier/customer settlement, job-currency actuals and balanced AED postings passed the scenario assertions. Actual cost 450.00, net revenue 620.00, profit 170.00 USD. Job 3653; invoice 3678. 246 successful API checks.

**Defects:** No unresolved failure in this fixture. Supporting operational approvals are fictional test evidence, not approvals for real cargo.

## Browser, unit and recovery evidence

The real Chrome suite signs in separately as admin, vendor and client. It submits vendor rates, prices/approves/publishes quotations, accepts them as the client, converts jobs, releases customs with a real PDF file-picker upload, progresses road–sea and road–sea–rail, creates/uploads PODs, uploads supplier invoices, and settles supplier/customer documents through selected bank journals. Mode-document draft preparation/approval is fixture setup through the normal API. Mobile width and JavaScript page errors are checked. It does not claim every field in all 28 fixtures was entered through the browser.

The unit suite covers domain validation, exact decimal calculations, physical units, credit rounding, reports, permissions, readiness and emulated UI handlers. API scenarios verify persistence and end-to-end transitions separately; they are not described as unit tests.

Private evidence: `.local/production-tests/scenarios.json`, `controls.json`, `browser/results.json`, browser PNGs, rendered PDF samples, `unit-final.log`, `audit.log` and `restore.json`. Public sanitized results: [freight-release-results.json](freight-release-results.json). The final invoice layout, B/L and MAWB were rendered and visually reviewed. Large multi-file requests are staged individually to stay below the hosting request limit.

## Remaining production work

Provide and configure the cloud database, real issuer/TRN/address and bank details; initialize clean production accounts/FX; configure SMTP if needed; complete provider monitoring/recovery and protected-staging acceptance; then deploy/promote. No public production cutover was performed. Qualified operators must supply real carrier, DG/OOG/reefer and customs approvals. See [the runbook](production-readiness.md).
