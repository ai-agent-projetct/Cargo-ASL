# Cargo ASL release preparation

The remediated application has local freight acceptance coverage. Public production cutover is pending a cloud MySQL database, verified company/invoice details, real bank accounts and operational configuration. The admin **Company & Tax Settings** and **Users & access** screens show the release checks. `/api/health` checks database connectivity; authenticated admin `/api/workspace/readiness` explains configuration blockers.

## Configure a clean production database

Use a separate production MySQL database. Do not upload `.local/mysql`, restore the local audit/demo database into production, or reuse demo passwords. Historical QA records intentionally preserve the original failed audit evidence; missing historical documents or financial corrections are not manufactured by migration.

1. Provision MySQL with verified TLS and backups. Put its connection values in Vercel's secret environment settings and a private setup environment file. Use `.env.production.example` as the template.
2. Set `CARGO_ENV_FILE` to that private file when running setup scripts. Add an initial `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters to the setup file only. Run `npm run db:init`, `npm run db:migrate`, and `npm run db:ledgers` from a trusted machine that can reach the database. Existing tables are preserved. A provider-created database needs no database-creation privilege.
3. Sign in as that administrator. Create the real **Company & Tax Settings** record, registered address, country, VAT registration/TRN where applicable, payment beneficiary, bank/IBAN and terms. Verify and activate the profile after checking the real company documents. Demo issuer details remain unverified.
4. Create the real bank/cash journals in **Accounts & Journals**, approved dated exchange rates and supplier organizations. Create client/vendor accounts in **Users & access**, then link every vendor account to its supplier legal entity. Deliver initial passwords privately.
5. Configure `INTAKE_ADMIN_EMAIL`. Configure SMTP if email delivery is needed; the app queues messages and requires an explicit send. SMTP delivery has not been tested with a real provider in this local release.
6. Verify provider backups, restore access, retention and uptime/error alerts; then set `OPERATIONS_VERIFIED=true`. The tested local restore procedure recreates a separate empty database and compares every restored row and attachment. Production recovery needs provider-specific access.

## Deploy and verify

Use the repository's `server.mjs` entrypoint, Node 24, `vercel.json` and `.vercelignore`. Set `NODE_ENV=production`, the exact HTTPS `APP_ORIGIN`, cloud MySQL secrets and verified TLS. No credentials or database files belong in Git or deployment uploads. The backend uses SQL sessions and shared SQL login throttling; cookies are secure in production.

Vercel supports [native Node HTTP servers](https://vercel.com/changelog/deploy-node-servers-with-zero-configuration) and [Node runtime files/dependencies](https://vercel.com/docs/functions/runtimes/node-js). Runtime modules and PDF fonts are included in the upload allowlist. A cloud build and live connection remain unverified until the database and deployment account are configured.

Deploy to a protected staging environment first. Confirm the three login routes, company profile, supplier mapping, approved FX, email outbox, issued document downloads and an approved non-production shipment/settlement. Confirm readiness checks, health/error alerts and recovery access before promoting the deployment and sharing its client URL. The acceptance runners create fictional data and refuse `NODE_ENV=production`.

## Freight and finance controls

- Carrier booking confirmation requires a carrier reference and an explicit acceptance check. Generated drafts are reviewed/approved before release. MAWB numbers require valid mod-7 numbering and a recorded authorized stock allocation. Consolidation master/house links, manifests and cost allocations are supported.
- Cross-border clearance uses linked declarations, holds, supporting files and export/import release references. Duty calculations are assessments; actual duty expenses are accounted through approved supplier bills. The app does not submit declarations to a customs authority or make government payments.
- DG, reefer and OOG shipments require structured acceptance and a supporting signed carrier/technical approval. Regulatory/carrier rules are verified by a qualified operator. The generated DG summary does not replace a carrier-specific signed declaration. Tracking and temperature readings can be entered manually; live carrier/IoT integrations are not configured.
- UAE standard VAT is entered where applicable; qualifying international transport may require a different treatment. Production posting requires the date of supply, tax treatment and issuer/customer identity, plus evidence for a non-standard treatment. Confirm the company's treatment with its accountant using current [FTA legislation](https://tax.gov.ae/en/legislation/vat/legislation.aspx). Tests cover 5% arithmetic and foreign-currency AED presentation; they are not tax certification.
- Supplier invoice identity is reserved atomically by legal supplier and normalized invoice number. Supplier credits, exact cumulative sales credits, independent document currencies, approved FX, selected payment journals and balanced AED postings are supported. Bank fees use separate explained journals.
- Client/vendor multi-file forms stage each file separately (at most 2 MB per file), then atomically consume user-scoped, expiring tokens. This preserves three-file submissions within hosted request limits.
- Posted financial PDFs and issued freight PDFs are saved as immutable copies. Drafts/unverified issuers show a demonstration watermark. Old issued QA copies remain historical evidence when the template is improved.

## Backup and rollback

`npm run db:backup` creates a consistent private JSON backup under `.local/backups`. Keep encrypted provider backups outside the application host too. `npm run db:restore -- <trusted-backup.json> <empty-target-database>` refuses to overwrite the configured live database or existing tables. `npm run test:restore -- <backup.json>` verifies a separate temporary database and removes only that generated test database. `RESTORE_ADMIN_FILE` can privately supply database administration credentials for this test when the application account correctly lacks database-creation privileges.

The freight migration is additive. Before upgrading a real installation, back up, test the restore, migrate and verify the release in staging. Roll back application code only with a schema/data compatibility review; do not restore an old backup over new financial transactions.
