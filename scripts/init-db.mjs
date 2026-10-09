import {loadEnvFile} from 'node:process';
import {readFile} from 'node:fs/promises';
import {scrypt,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
import mysql from 'mysql2/promise';
loadEnvFile(new URL('../.env',import.meta.url));
const database=process.env.MYSQL_DATABASE;
if(!/^[a-zA-Z0-9_]{1,64}$/.test(database||'')) throw new Error('Invalid MYSQL_DATABASE.');
if(!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length<12) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env before initializing.');
const conn=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD});
try {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  await conn.query(`USE \`${database}\``);
  const schema=await readFile(new URL('../db/schema.sql',import.meta.url),'utf8');
  for(const statement of schema.split(';').map(s=>s.trim()).filter(Boolean)) await conn.query(statement);
  for(const statement of (await readFile(new URL('../db/workspace.sql',import.meta.url),'utf8')).split(';').map(s=>s.trim()).filter(Boolean))await conn.query(statement);
  const salt=randomBytes(16).toString('hex');
  const passwordHash=salt+':'+(await promisify(scrypt)(process.env.ADMIN_PASSWORD,salt,64)).toString('hex');
  await conn.execute("INSERT IGNORE INTO users(email,name,password_hash,role) VALUES(?,'Cargo ASL Administrator',?,'erp')",[process.env.ADMIN_EMAIL.trim().toLowerCase(),passwordHash]);
  for(const [field,label] of [['company_id','Cargo ASL'],['transport_mode_id','[SEA] Sea Freight'],['transport_mode_id','[AIR] Air Freight'],['transport_mode_id','[ROA] Road Freight'],['transport_mode_id','[RAIL] Rail Freight']]) await conn.execute('INSERT IGNORE INTO lookup_values(field_name,label) VALUES(?,?)',[field,label]);
  console.log('Cargo ASL tables initialized. Existing accounts and records preserved.');
}finally{await conn.end();}
