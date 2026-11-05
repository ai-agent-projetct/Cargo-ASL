import {loadEnvFile} from 'node:process';
import {readFile} from 'node:fs/promises';
import mysql from 'mysql2/promise';
import {hostingSettings} from '../hosting.mjs';
loadEnvFile(process.env.CARGO_ENV_FILE||new URL('../.env',import.meta.url));
const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,ssl:hostingSettings().ssl});
try{for(const file of ['workspace.sql','freight.sql'])for(const sql of (await readFile(new URL('../db/'+file,import.meta.url),'utf8')).split(';').map(s=>s.trim()).filter(Boolean))await db.query(sql);console.log('Operational and freight tables ready; existing records preserved.');}finally{await db.end();}
