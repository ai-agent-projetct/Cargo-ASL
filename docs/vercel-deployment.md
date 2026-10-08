# Vercel deployment status

Prepared, not deployed. No public URL or cloud MySQL connection has been verified. Deployment requires authenticated Vercel access and a provisioned cloud database.

The existing `server.mjs` entrypoint is supported by Vercel's Node server detection. `vercel.json` includes public runtime assets. `.vercelignore` permits only runtime files and excludes `.env`, `.local`, MySQL data, credentials, caches, source inspection notes and setup scripts.

Required hosted environment variables:

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`: a cloud MySQL database; do not use localhost or the Windows instance's connection details.
- `MYSQL_SSL_CA`: provider CA certificate if required. TLS certificate verification is always enabled on Vercel.
- `APP_ORIGIN`: the exact HTTPS deployment/custom-domain origin without trailing slash. Without this setting, the Vercel deployment URL is used.

Secure cookies are automatic on Vercel. Keep Node 24 selected. No local Windows MySQL launcher is run by the hosted entrypoint.

Next steps after account sign-in: provision a cloud MySQL database with the user's approved provider/plan; initialize the schema and fictional demonstration users on that database; configure Vercel environment secrets; authenticate deployment tooling; deploy and validate all three login routes against the live database. Do not upload the local access files or copy real source records. Do not publish until the cloud connection and application accounts work.

Local hosting-settings tests pass. A Vercel build and live verification are still pending account access. The current ERP is an incomplete demonstration; existing rate limiting is process-local and needs shared enforcement or a Vercel firewall rule before broader public use.

References: https://vercel.com/docs/functions/runtimes/node-js and https://vercel.com/docs/cli/deploy
