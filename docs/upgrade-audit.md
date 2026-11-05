# Cargo ASL upgrade comparison — 4 November 2026

REA 6.5.0 is installed globally and connected to Codex. All three supplied source accounts were exercised. After the user authorized adding sample data, clearly labelled staging fixtures were created under `CARGO-ASL-QA-20261104`. Existing source transactions were not edited. Credentials, access tokens, source captures and the fixture ledger remain private under `.local/`.

## Source checks completed

| Case | Observed result | Evidence method |
|---|---|---|
| Customer inquiry | Saved, reloaded, listed in Inquiry Log and opened in ERP; packages and dimensions persisted | REA Chrome and authenticated reads |
| Customer courier | Product, quantity, unit price, currency, lot and dates persisted; saved detail has no editing controls | REA Chrome |
| Vendor rates | QA request appeared for its assigned vendor; draft saved/reloaded, then submitted with a validity date | REA Chrome and authenticated reads |
| Automatic pricing intake | Vendor submission generated a quote cost charge. Selling price remained zero for admin pricing | Authenticated model reads |
| Publication | Explicit no-email publication succeeded; customer saw the quote under Pending Approval | Authenticated business action and customer form reads |
| Customer rejection and revision | Reason saved; source revision action created a new Draft with copied charge lines. Admin pricing verified USD 25 cost / USD 40 sale, followed by no-email publication | Customer form POST and guarded business actions |
| Created shipment | Synthetic shipment stayed in Created; customer Summary included it before booking | Authenticated create and customer form reads |
| Vendor invoice | Assigned QA request appeared; a generated synthetic PDF and manual USD 25 line saved as a draft, then submitted to Approval Pending | Authenticated vendor form POSTs and admin reads |
| OCR fallback | Source reported that its OCR service could not be reached; attachment retention and manual submission still worked | Actual source response |

The source invoice remains awaiting review. Its form confirms that approval creates a **draft** bill. Source invoice approval/rejection, ledger posting, payments and external synchronization were not executed. Source shipment booking was not performed. One customer-browser follow-up timed out; authenticated customer reads established the later portal results and are identified separately above.

## Implemented and tested in Cargo ASL

| Confirmed gap | Result | Verification |
|---|---|---|
| Inquiry pricing changed identity | New inquiries become quotations in place, preserving ID, RFQ reference, documents, followers and history. Unpublished charge details stay private. Older linked records are preserved | API, Chrome |
| Inquiry packages missing | Package counts, dimensions/units, gross weight/unit, commodity, HS code, hazardous flag and description | Unit, API, Chrome |
| Cargo choices ignored transport mode | Observed sea, air, road and rail choices in shared UI/server validation; legacy General Cargo remains supported | Unit, DOM, Chrome |
| Currency options incomplete | SGD available alongside USD/AED/INR/EUR/GBP | Unit, Chrome vendor rates |
| Saved courier remained client-editable | Client records are read-only immediately after saving; internal owner editing remains subject to status | Unit, API, Chrome |
| Vendor draft and validity absent | Save draft, reload, amend and submit rates; server timestamp, validity validation and role/status protection | Unit, API, Chrome |
| Vendor costs needed manual import | Submission imports cost charges into an owned unlocked quote once, with zero selling price for admin pricing. Later acceptance does not duplicate charges | API |
| Approval was always mandatory | Owning admins may explicitly disable internal approval for direct publication; existing quotes default to requiring approval | Unit, API, DOM |
| Quote rejection/revision incomplete | Customer rejection reason; owner-only new draft revision with copied details, original link and duplicate prevention | Unit, API |
| Created jobs hidden | Assigned clients can read their Created/Draft jobs without editing or seeing costs | Unit, API |
| Vendor invoice draft absent | Save a complete invoice draft, retain originals, submit without reupload; reject/resubmit/approve into draft bills | Unit, API; actual Chrome upload dialog |
| Sales targets too limited | Six parameters, date ranges, monthly target lines, regeneration, recomputed actuals, reporting-manager/incentive metadata | Unit, API |
| Portal navigation/filter gaps | Route filters, saved filters, invoice pending/overdue filters, courier and CO2 access | Unit, API, Chrome |

Latest local verification (5 November): **97 automated tests**, **71 live workflow checks**, **12 named defensive integration cases**, **all three demo logins**, and **25 actual Chrome scenarios** passed. Both requested land/sea and land/sea/train journeys reached paid invoices and balanced ledgers; see [the multimodal report](multimodal-testing.md). Tests use fictional local records and remove their temporary fixtures. Source QA records remain available for review.

## Remaining parity and deployment work

| Area | Remaining differences or unverified behavior |
|---|---|
| Consolidation and operational states | Master Shipment linking; Confirmed, HAWB/BL/Nomination generation and Job Close controls remain incomplete |
| Advanced quotations | Ordered multimodal road/sea/rail journeys are implemented and tested. Exact source multimodal/multi-carrier option grouping, counteroffers/renegotiation rounds, minimum charges, measurement-basis formulas, line inclusion/grouping and all conditional incoterm rules still need comparison |
| Customer quote actions | Source Accept & Sign captures a signature; Cargo ASL currently records acceptance without an equivalent signature workflow. Source inquiry cancellation/reason behavior is not fully exercised |
| Vendor invoice detail | Source offers per-charge matching, FX and manual/OCR extraction, optional header fields, file preview/deletion and partial drafts. Cargo ASL currently saves complete metadata/document drafts and invoice totals; these detailed functions are not equivalent |
| Documents/accounting | Debit notes, every pro forma approval rule, branded PDF/email attachments, BL upload and DOCX template generation remain incomplete |
| Integrations | Cargosflow synchronization, live carrier tracking, onboarding and working OCR require verified provider contracts/configuration. No simulated provider success is presented |
| Permissions and scale | Full company/group/team rules need comparison. Snapshot/report aggregation remains capped at 5,000 accessible records |
| Targets | Local monthly distribution is explicitly equal allocation; source distribution and incentive formulas remain unverified |
| Hosting | Cloud MySQL and authenticated deployment are still needed for a client-shareable hosted app. SMTP needs provider configuration; backup recovery and production load testing remain outstanding |

This is a functional, tested implementation of the listed workflows. It is **not yet an exact, complete clone** of the entire source ERP. Cargo ASL retains its distinct interface and fictional demo organizations.
