import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import mysql from 'mysql2/promise';
const config=JSON.parse(await readFile(new URL('../.local/mysql/admin.json',import.meta.url),'utf8'));
const expected=fileURLToPath(new URL('../.local/mysql/data/',import.meta.url)).replaceAll('\\','/').toLowerCase();
const conn=await mysql.createConnection(config);
try{
  const [rows]=await conn.query('SELECT @@datadir AS directory');
  if(rows[0].directory.replaceAll('\\','/').toLowerCase()!==expected)throw new Error('Refusing to stop a database outside the Cargo ASL data directory.');
  await conn.query('SHUTDOWN');console.log('Dedicated Cargo ASL MySQL stopped.');
}finally{await conn.end();}
