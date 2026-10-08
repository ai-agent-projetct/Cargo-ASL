import {loadEnvFile} from 'node:process';
import {writeFile} from 'node:fs/promises';
loadEnvFile(new URL('../.env',import.meta.url));
await writeFile(new URL('../.local/access.txt',import.meta.url),`Cargo ASL local access\n\nApp: http://127.0.0.1:${process.env.PORT}\nEmail: ${process.env.ADMIN_EMAIL}\nPassword: ${process.env.ADMIN_PASSWORD}\n\nMySQL host: ${process.env.MYSQL_HOST}\nPort: ${process.env.MYSQL_PORT}\nDatabase: ${process.env.MYSQL_DATABASE}\nUsername: ${process.env.MYSQL_USER}\nPassword: ${process.env.MYSQL_PASSWORD}\n\nStart the app with Start Cargo ASL.cmd. Keep this file private.\n`,{mode:0o600});
console.log('Local login details saved to .local/access.txt (excluded from version control).');
