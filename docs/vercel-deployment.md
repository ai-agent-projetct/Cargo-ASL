# Vercel deployment preparation

Prepared for configuration; no public production URL or cloud MySQL connection has been verified. The user still needs a cloud database and the real company invoicing details.

Use the [production runbook](production-readiness.md) and private environment template `.env.production.example`. Node 24, the native HTTP entrypoint, verified database TLS, secure cookies, SQL sessions, shared login throttling and all runtime/PDF assets are configured in code. The runtime upload excludes local credentials, data and QA evidence.

Provision a clean database, initialize it securely, configure the real issuer and bank accounts, link vendor legal entities, set approved FX and environment secrets, then build/deploy to protected staging. Live build, SMTP, recovery access and public-URL acceptance must pass before production promotion. Local acceptance results are recorded in [the remediation report](freight-remediation-report.md).
