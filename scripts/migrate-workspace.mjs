import {loadEnvFile} from 'node:process';
import {readFile} from 'node:fs/promises';
import mysql from 'mysql2/promise';
import {hostingSettings} from '../hosting.mjs';
loadEnvFile(new URL('../.env',import.meta.url));
const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,ssl:hostingSettings().ssl});
try{for(const sql of (await readFile(new URL('../db/workspace.sql',import.meta.url),'utf8')).split(';').map(s=>s.trim()).filter(Boolean))await db.query(sql);console.log('Operational workspace tables ready; existing records preserved.');}finally{await db.end();}
