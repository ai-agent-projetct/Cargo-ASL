# Cargo ASL

Vanilla JavaScript frontend, Node.js server and MySQL schema. **Work in progress: this is not yet a complete ERP.**

The [test guide](docs/testing.md) records demo login checks, 27 passing unit tests, expanded MySQL integration checks, fixes and remaining limitations. Run `npm test`, `npm run test:integration`, and `npm run test:portals` with the local server running. GitHub Actions is configured to run these suites against disposable MySQL. Private reference captures and the full comparison report remain local.

## Run locally

Use Node 24 or newer. On this workstation the verified runtime is `E:\Tools\OmniRoute\node-v24.21.0-win-x64\node.exe`.

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` only if `.env` does not already exist. Configure the local MySQL account and database.
3. Run `npm run db:check`. On this workstation a dedicated instance has been initialized on `127.0.0.1:3308`, database `cargo_asl`, account `LogiASL`. The existing MySQL service on port 3306 was not changed.
4. For initial application login, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters) in `.env`, then run `npm run db:init`. This creates the Cargo ASL database/tables and adds the first internal user without replacing existing users. Source ERP credentials are not imported.
5. Run `npm start`, or double-click `Start Cargo ASL.cmd`; open `http://127.0.0.1:3000`. The launcher starts the dedicated database if necessary. Initial login details are saved in `.local/access.txt`, which is excluded from version control.

The Windows administrator prompt for registering a boot-time service was canceled. No Cargo ASL Windows service was installed. Application startup does not require that service. MySQL data and its configuration are in `.local/mysql/`; do not delete this directory when updating application code. `scripts/stop-local-mysql.mjs` verifies the dedicated data-directory path before stopping it.

`http://127.0.0.1:3000/?preview=1` opens the current interface without database access. It contains no copied source business records, and writes are disabled. It is not a working ERP substitute.

## Current implementation

- Separate `/login/admin`, `/login/vendor`, and `/login/client` pages, each enforcing its selected role on the server. Vendor and client accounts cannot use internal ERP endpoints.
- Dedicated role overview pages with account-scoped fictional records and working search. Demo account credentials are in `.local/portal-logins.txt`. Run `npm run demo:seed` to create the accounts on a fresh database, and `npm run test:portals` to verify role restrictions and logout.
- A distinct teal Cargo ASL design replaces the source sign-in/portal presentation. Demo names and organizations are fictional. Full vendor/client business actions remain unfinished; sample records are read-only.

- Source fonts, sidebar structure, quotation dashboard layout, empty kanban/list views and base quotation form.
- Node HTTP server, MySQL connection, hashed-password login, database sessions, internal-role API checks, request validation, same-origin request protection, and atomic draft creation/audit logging.
- Base quotation required-field/date/amount validation with a runnable check: `npm test`. `npm run test:integration` checks the running server against MySQL, including login, draft persistence, validation, owner isolation, role checks, cross-origin rejection and logout; its temporary records are cleaned up.

## Remaining work

Lookup administration; quotation editing, charges and transport-dependent behavior; approval/conversion rules; shipment workflows; accounting; administration; organizations; vendor/customer portals; reports; source-permission matching; imports/exports beyond basic CSV; complete visual and workflow comparison. Current dashboard aggregations and base forms are provisional until the source workflow is verified.

Never commit `.env` or `.local`. The service binds to loopback by default. Vercel deployment has been requested and configuration prepared, but no live deployment or cloud database has been verified. See [deployment notes](docs/vercel-deployment.md).
