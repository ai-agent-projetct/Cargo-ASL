# DP World staging — separate comparison

5 November 2026. This is a reference comparison, not a certification of the complete source ERP. All three supplied accounts authenticated in Chrome. Source customer enquiries were created only under the labelled QA prefix; existing business transactions were not amended.

## Actual coverage

- ERP: dashboard, visible menu metadata, new quotation, house shipment and consolidation forms, multimodal toggle and Sea/Air/Road tabs, document template screen, warehouse configuration, profit-report wizard and proforma list. Unsaved backend forms were discarded.
- Vendor: current dashboard, rate-request list and invoice-request list were reopened. A previously labelled QA rate and pending vendor invoice were visible. No new source vendor bill was posted or paid in this audit.
- Client: all 24 requested intake variants were attempted in Chrome. Twenty-three synthetic enquiries saved as Draft. DG required a file attachment; the browser tool could not choose a file, so that request was not submitted.
- Read-only authenticated API verification confirmed the 23 new source quotation IDs and accessible action models. No source unit tests or complete source quote → booking → customs → delivery → accounting lifecycle was executed.

**Every complete source scenario remains PARTIAL.** An intake save does not prove documents, acceptance, cargo movement, invoice tax, profitability or ledger posting. The source must not be treated as the correctness oracle for unverified functions.

## Important parity observations

| Area | Source observation | Cargo ASL observation |
|---|---|---|
| Consolidation | Dedicated Master Shipment (Consol), Attach Houses, master transport-document field and profitability controls | Generic single shipment; no consolidation master |
| Multimodal | Backend mode tabs and a selected portal mode; ordered handoff lifecycle was not demonstrated | Explicit ordered legs, event history and a single job tested |
| Physical quantities | Source exposes declared/volumetric/chargeable fields and an auto-update option; new portal drafts read back zero declared values | Dimensions persist but no volume/chargeable calculation |
| DG intake | Hazardous selection makes the document input required | Flag-only local enquiry could proceed through dispatch |
| Temperature | Source portal has a temperature-details field | Local flag/instructions do not have a structured operational continuation |
| Documents | Dedicated Docx Report Template configuration was opened | Generic Document Templates master and generic Print only |
| Warehouse | Warehouse/Depot configuration screen was opened; not proof of a WMS | Generic Warehouses master; no stock operations |
| Accounting | Source proforma screen and profit-report wizard were observed; no posting certification | Local posting/payment tested, with AP and credit defects reported |

## Requested source scenarios

| # | Scenario | Source intake | Saved source reference | Full source lifecycle |
|---|---|---|---|---|
| 1 | Sea FCL export | Saved Draft | SGP-2026-00998 | PARTIAL — not executed end to end |
| 2 | Sea FCL import | Saved Draft | SGP-2026-00999 | PARTIAL — not executed end to end |
| 3 | Sea LCL consolidation | Saved Draft | SGP-2026-01000 | PARTIAL — not executed end to end |
| 4 | Air export with MAWB and HAWB | Saved Draft | SGP-2026-01001 | PARTIAL — not executed end to end |
| 5 | Air import | Saved Draft | SGP-2026-01002 | PARTIAL — not executed end to end |
| 6 | Road FTL domestic | Saved Draft | SGP-2026-01008 | PARTIAL — not executed end to end |
| 7 | Road LTL groupage | Saved Draft | SGP-2026-01009 | PARTIAL — not executed end to end |
| 8 | Road cross-border UAE to KSA | Saved Draft | SGP-2026-01010 | PARTIAL — not executed end to end |
| 9 | Road + Sea | Saved Draft | SGP-2026-01011 | PARTIAL — not executed end to end |
| 10 | Sea + Road | Saved Draft | SGP-2026-01003 | PARTIAL — not executed end to end |
| 11 | Road + Air | Saved Draft | SGP-2026-01012 | PARTIAL — not executed end to end |
| 12 | Air + Road | Saved Draft | SGP-2026-01004 | PARTIAL — not executed end to end |
| 13 | Sea + Air via Dubai | Saved Draft | SGP-2026-01005 | PARTIAL — not executed end to end |
| 14 | Road + Sea + Road door-to-door | Saved Draft | SGP-2026-01013 | PARTIAL — not executed end to end |
| 15 | Road → Sea → Road → Air under one job | Saved Draft | SGP-2026-01014 | PARTIAL — not executed end to end |
| 16 | Road → Air → Sea → Road under one job | Saved Draft | SGP-2026-01015 | PARTIAL — not executed end to end |
| 17 | Transshipment and carrier change | Saved Draft | SGP-2026-01016 | PARTIAL — not executed end to end |
| 18 | Dangerous goods in every mode | Required DG attachment; not submitted | — | PARTIAL — not executed end to end |
| 19 | Reefer / temperature-controlled cargo | Saved Draft | SGP-2026-01006 | PARTIAL — not executed end to end |
| 20 | Oversized out-of-gauge cargo | Saved Draft | SGP-2026-01017 | PARTIAL — not executed end to end |
| 21 | Split shipment with partial deliveries | Saved Draft | SGP-2026-01018 | PARTIAL — not executed end to end |
| 22 | Multi-currency AED / USD / EUR billing | Saved Draft | SGP-2026-01007 | PARTIAL — not executed end to end |
| 23 | Booking cancellation and amendment mid-transit | Saved Draft | SGP-2026-01019 | PARTIAL — not executed end to end |
| 24 | Missing and wrong data validations | Saved Draft | SGP-2026-01020 | PARTIAL — not executed end to end |

Combination requests used the first mode available on the portal and recorded the full requested route in the specification. They were not misrepresented as saved ordered multimodal source jobs. FCL/FTL portal intake uses container count/type fields; loose/LCL input used the visible package dimensions/weight controls. Source validation, consolidated documents, special handling, multi-currency accounting and mid-transit amendment outcomes remain unverified beyond the inspected forms.

## Accessible menu inventory

The following 157 nodes came from the authenticated menu tree. A menu entry establishes visibility, not a tested business operation.

| ID | Path | Action |
|---|---|---|
| 122 | Accounting | Group |
| 124 | Accounting > Customers | Group |
| 129 | Accounting > Customers > Products | ir.actions.act_window,247 |
| 130 | Accounting > Customers > Customers | ir.actions.act_window,256 |
| 131 | Accounting > Vendors | Group |
| 132 | Accounting > Vendors > Bills | ir.actions.act_window,223 |
| 136 | Accounting > Vendors > Products | ir.actions.act_window,248 |
| 137 | Accounting > Vendors > Vendors | ir.actions.act_window,257 |
| 154 | Accounting > Reporting | Group |
| 155 | Accounting > Reporting > Management | Group |
| 156 | Accounting > Reporting > Management > Invoice Analysis | ir.actions.act_window,250 |
| 158 | Accounting > Configuration | Group |
| 159 | Accounting > Configuration > Settings | ir.actions.act_window,254 |
| 160 | Accounting > Configuration > Invoicing | Group |
| 161 | Accounting > Configuration > Invoicing > Payment Terms | ir.actions.act_window,242 |
| 162 | Accounting > Configuration > Invoicing > Incoterms | ir.actions.act_window,262 |
| 163 | Accounting > Configuration > Banks | Group |
| 164 | Accounting > Configuration > Banks > Add a Bank Account | ir.actions.server,245 |
| 166 | Accounting > Configuration > Accounting | Group |
| 168 | Accounting > Configuration > Accounting > Taxes | ir.actions.act_window,240 |
| 169 | Accounting > Configuration > Accounting > Journals | ir.actions.act_window,233 |
| 171 | Accounting > Configuration > Accounting > Currencies | ir.actions.act_window,69 |
| 172 | Accounting > Configuration > Accounting > Fiscal Positions | ir.actions.act_window,255 |
| 173 | Accounting > Configuration > Accounting > Journal Groups | ir.actions.act_window,234 |
| 175 | Accounting > Configuration > Payments | Group |
| 176 | Accounting > Configuration > Management | Group |
| 177 | Accounting > Configuration > Management > Product Categories | ir.actions.act_window,154 |
| 180 | Accounting > Configuration > Management > Analytic Items | ir.actions.act_window,136 |
| 181 | Accounting > Configuration > Analytic Accounting | Group |
| 182 | Accounting > Configuration > Analytic Accounting > Analytic Accounts | ir.actions.act_window,135 |
| 183 | Accounting > Configuration > Analytic Accounting > Analytic Account Groups | ir.actions.act_window,132 |
| 184 | Accounting > Configuration > Analytic Accounting > Analytic Tags | ir.actions.act_window,131 |
| 185 | Accounting > Configuration > Analytic Accounting > Analytic Defaults Rules | ir.actions.act_window,265 |
| 186 | Accounting > Configuration > Payments > Payment Acquirers | ir.actions.act_window,271 |
| 191 | Accounting > Configuration > Accounting > Account Group | ir.actions.act_window,279 |
| 192 | Accounting > Configuration > Invoicing > Invoice Terms & Condition | ir.actions.act_window,281 |
| 194 | Accounting > Configuration > Accounting > Currency Rates Providers | ir.actions.act_window,284 |
| 195 | Administration | Group |
| 196 | Administration > Manage | Group |
| 197 | Administration > Companies & Users | Group |
| 198 | Administration > Companies & Users > Companies | ir.actions.act_window,55 |
| 199 | Administration > Companies & Users > Users | ir.actions.act_window,72 |
| 201 | Administration > Manage > Incoterm | ir.actions.act_window,262 |
| 203 | Operations | Group |
| 204 | Operations > Configuration | Group |
| 206 | Administration > Manage > HS Codes | ir.actions.act_window,287 |
| 207 | Administration > Manage > Container Category | ir.actions.act_window,288 |
| 208 | Administration > Manage > Container Type | ir.actions.act_window,289 |
| 215 | Administration > Manage > Carriers | ir.actions.act_window,296 |
| 216 | Administration > Manage > Carrier Agent | ir.actions.act_window,297 |
| 217 | Administration > Manage > UN/LOCODE Locations | ir.actions.act_window,298 |
| 218 | Administration > Manage > Commodity | ir.actions.act_window,299 |
| 219 | Administration > Manage > Ports | ir.actions.act_window,300 |
| 220 | Administration > Manage > Vessels | Group |
| 221 | Administration > Manage > Vessels > Vessel | ir.actions.act_window,301 |
| 222 | Administration > Manage > Vessels > Vessel Category | ir.actions.act_window,302 |
| 223 | Administration > Manage > Custom Locations | ir.actions.act_window,304 |
| 225 | Administration > Manage > Charge Master | ir.actions.act_window,306 |
| 226 | Administration > Manage > Localization | Group |
| 227 | Administration > Manage > Localization > Countries | ir.actions.act_window,307 |
| 228 | Administration > Manage > Localization > Fed. States | ir.actions.act_window,308 |
| 229 | Administration > Manage > Localization > Country Group | ir.actions.act_window,309 |
| 230 | Administration > Manage > Localization > Cities | ir.actions.act_window,310 |
| 232 | Administration > Document Reports | Group |
| 233 | Administration > Document Reports > Docx Reports | ir.actions.act_window,141 |
| 235 | Administration > Companies & Users > Groups | ir.actions.act_window,313 |
| 236 | Administration > Manage > Email | Group |
| 237 | Administration > Manage > Email > Outgoing Mail Servers | ir.actions.act_window,16 |
| 238 | Administration > Manage > Email > Incoming Mail Servers | ir.actions.act_window,145 |
| 239 | Administration > Manage > Email > Email Templates | ir.actions.act_window,128 |
| 240 | Administration > Manage > Warehouse/Depot | ir.actions.act_window,314 |
| 243 | Administration > Manage > Languages | ir.actions.act_window,56 |
| 244 | Administration > Manage > Serial Number | ir.actions.act_window,317 |
| 246 | Accounting > Configuration > Banks > Banks | ir.actions.act_window,63 |
| 247 | Accounting > Configuration > Banks > Bank Accounts | ir.actions.act_window,64 |
| 252 | Dashboard | Group |
| 255 | Administration > Companies & Users > Departments | ir.actions.act_window,325 |
| 278 | Accounting > Configuration > Accounting > Fiscal Years | ir.actions.act_window,357 |
| 279 | Accounting > Configuration > Accounting > Chart Of Account Sequence | ir.actions.act_window,358 |
| 282 | Accounting > Configuration > Management > Deferred Revenue Models | ir.actions.act_window,361 |
| 283 | Accounting > Configuration > Management > Deferred Expense Models | ir.actions.act_window,362 |
| 284 | Accounting > Configuration > Account Finance Reports | Group |
| 285 | Accounting > Configuration > Account Finance Reports > Account Finance Reports | ir.actions.act_window,363 |
| 286 | Accounting > Reporting > Finance Reports | Group |
| 287 | Accounting > Reporting > Audit Reports | Group |
| 288 | Accounting > Reporting > Partner Reports | Group |
| 289 | Accounting > Reporting > Partner Reports > Partner Ledger | ir.actions.client,373 |
| 290 | Accounting > Reporting > Audit Reports > General Ledger | ir.actions.client,374 |
| 291 | Accounting > Reporting > Finance Reports > Balance Sheet | ir.actions.client,367 |
| 292 | Accounting > Reporting > Finance Reports > Profit & Loss | ir.actions.client,366 |
| 295 | Accounting > Reporting > Audit Reports > Trial Balance | ir.actions.client,552 |
| 296 | Accounting > Reporting > Audit Reports > Tax Report | ir.actions.client,370 |
| 297 | Accounting > Reporting > Partner Reports > Balance Confirmation Report | ir.actions.act_window,372 |
| 298 | Administration > Manage > MAWB Stocks | ir.actions.act_window,375 |
| 299 | Administration > Manage > Truck Number | ir.actions.act_window,376 |
| 303 | Accounting > Configuration > Management > Asset Models | ir.actions.act_window,379 |
| 310 | Operations > House Shipment | ir.actions.act_window,410 |
| 311 | Operations > Master Shipment (Consol) | ir.actions.act_window,411 |
| 312 | Operations > Configuration > Container Number | ir.actions.act_window,412 |
| 313 | Administration > Manage > Shipment Change Reason | ir.actions.act_window,415 |
| 314 | Sales & CRM | Group |
| 315 | Sales & CRM > Sales Strategy | Group |
| 316 | Sales & CRM > Sales | Group |
| 317 | Sales & CRM > Reports | Group |
| 318 | Sales & CRM > Configurations | Group |
| 319 | Sales & CRM > Sales Strategy > Dashboard | ir.actions.client,419 |
| 320 | Sales & CRM > Sales Strategy > Targets | ir.actions.act_window,418 |
| 321 | Organizations | ir.actions.act_window,420 |
| 322 | Sales & CRM > Configurations > Sales Team | ir.actions.act_window,421 |
| 323 | Dashboard > Shipment Dashboard | ir.actions.client,438 |
| 324 | Dashboard > Carrier Booking Dashboard | ir.actions.client,439 |
| 325 | Sales & CRM > Sales > Prospect | ir.actions.act_window,442 |
| 326 | Operations > Reporting | Group |
| 327 | Accounting > Reporting > Partner Reports > Vendor Statement | ir.actions.client,448 |
| 329 | Operations > Reporting > Sales Report by Customer | ir.actions.client,451 |
| 330 | Operations > Reporting > Sales Report by Shipping Lines | ir.actions.client,452 |
| 331 | Operations > Reporting > Custom Duty Report | ir.actions.client,453 |
| 334 | Operations > Reporting > Charge Wise Shipment Estimated VS Actual | ir.actions.act_window,457 |
| 335 | Operations > Reporting > Shipment Profit Report | ir.actions.act_window,458 |
| 336 | Administration > Tariff | Group |
| 337 | Administration > Tariff > Sell Tariff | ir.actions.act_window,464 |
| 338 | Administration > Tariff > Buy Tariff | ir.actions.act_window,465 |
| 339 | Sales & CRM > Configurations > Lead Stage | ir.actions.act_window,467 |
| 340 | Sales & CRM > Sales > Leads | ir.actions.act_window,469 |
| 341 | Sales & CRM > Sales > Opportunity | ir.actions.act_window,470 |
| 343 | Sales & CRM > Configurations > Opportunity Stage | ir.actions.act_window,471 |
| 344 | Sales & CRM > Sales > Rate Requests | ir.actions.act_window,473 |
| 345 | Sales & CRM > Configurations > Lead Source | ir.actions.act_window,474 |
| 346 | Sales & CRM > Sales > Quotes | ir.actions.act_window,479 |
| 348 | Sales & CRM > Configurations > Quote Template | ir.actions.act_window,482 |
| 349 | Administration > Manage > Status Change Reasons | ir.actions.act_window,483 |
| 350 | Dashboard > Quote Dashboard | ir.actions.client,484 |
| 351 | Sales & CRM > Reports > Quote Analysis by Status | ir.actions.act_window,486 |
| 352 | Sales & CRM > Reports > Sales Agent Report | ir.actions.act_window,488 |
| 382 | Operations > Reporting > Shipper Wise Report | ir.actions.act_window,530 |
| 384 | Sales & CRM > Reports > Opportunity Detail Report | ir.actions.act_window,533 |
| 393 | Administration > Manage > Custom BE Type | ir.actions.act_window,551 |
| 394 | Accounting > Reporting > Partner Reports > Aged Payable | ir.actions.client,553 |
| 395 | Accounting > Reporting > Partner Reports > Aged Receivable | ir.actions.client,554 |
| 396 | Accounting > Reporting > Finance Reports > Customer Due Report | ir.actions.act_window,555 |
| 399 | Accounting > Reporting > Partner Reports > Customer Statement | ir.actions.client,560 |
| 400 | Accounting > Reporting > Partner Reports > Outstanding Customer Statement | ir.actions.client,561 |
| 401 | Accounting > Reporting > Partner Reports > Outstanding Vendor Statement | ir.actions.client,562 |
| 402 | Operations > Reporting > Customer Wise Report | ir.actions.act_window,563 |
| 403 | Accounting > Customers > Pro Forma Invoice | ir.actions.act_window,462 |
| 404 | Sales & CRM > Reports > Customer Visit Report | ir.actions.act_window,567 |
| 405 | Administration > Manage > Service Job Type | ir.actions.act_window,571 |
| 406 | Operations > Service Job | ir.actions.act_window,572 |
| 410 | Accounting > Reporting > Management > Depreciation Schedule | ir.actions.client,621 |
| 412 | Accounting > Reporting > Finance Reports > Invoice Charge Wise Report | ir.actions.act_window,623 |
| 413 | Administration > Manage > Location Type | ir.actions.act_window,627 |
| 418 | Administration > Manage > Client Tag | ir.actions.act_window,636 |
| 421 | Administration > Manage > Carrier Service Type | ir.actions.act_window,642 |
| 429 | Sales & CRM > Reports > Charges Wise Quotation Report | ir.actions.act_window,695 |
| 432 | Operations > Reporting > Customer Status Report | ir.actions.act_window,703 |
| 433 | Operations > Reporting > Customer Volume Report | ir.actions.act_window,704 |
| false | root | Group |

Raw staging captures contain original business data and access-token URLs and remain private. Only synthetic QA references, module names and sanitized evidence identifiers are included in the report.
