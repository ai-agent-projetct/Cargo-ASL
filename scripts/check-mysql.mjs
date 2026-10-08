import { loadEnvFile } from 'node:process';
import mysql from 'mysql2/promise';
loadEnvFile(new URL('../.env', import.meta.url));
const conn=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
try{const [rows]=await conn.query('SELECT CURRENT_USER() AS account, @@port AS port, DATABASE() AS db, VERSION() AS version');console.log(rows[0]);}finally{await conn.end();}
