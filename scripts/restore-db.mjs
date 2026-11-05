import {readFile} from 'node:fs/promises';
import {loadEnvFile} from 'node:process';
import mysql from 'mysql2/promise';
import {hostingSettings} from '../hosting.mjs';
export async function restoreBackup(db,backup,target,source){
 if(backup.format!=='cargo-asl-backup-v1'||!Array.isArray(backup.tables)||!/^[A-Za-z0-9_]{1,64}$/.test(target)||target===source)throw Error('Restore requires a valid backup and a separate empty database.');
 const [[exists]]=await db.execute('SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema=?',[target]);if(Number(exists.n))throw Error('Restore target must be empty. Existing tables will never be overwritten.');
 await db.query('CREATE DATABASE IF NOT EXISTS `'+target+'` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci');await db.query('USE `'+target+'`');
 await db.query('SET FOREIGN_KEY_CHECKS=0');
 try{for(const table of backup.tables){if(!/^[A-Za-z0-9_]+$/.test(table.name)||!table.ddl.startsWith('CREATE TABLE `'+table.name+'`'))throw Error('Invalid backup table.');await db.query(table.ddl);}
  for(const table of backup.tables){const [columns]=await db.query('SHOW COLUMNS FROM `'+table.name+'`'),types=new Map(columns.map(c=>[c.Field,c.Type]));for(const row of table.rows){const keys=Object.keys(row);if(keys.some(k=>!types.has(k)))throw Error('Unknown backup column.');const values=keys.map(k=>{const value=row[k];if(value?.type==='Buffer'&&Array.isArray(value.data))return Buffer.from(value.data);if(types.get(k)==='json'&&value!==null)return JSON.stringify(value);if(typeof value==='string'&&/^(datetime|timestamp)/.test(types.get(k)))return value.replace('T',' ').replace(/\.\d{3}Z$/,'');return value;});await db.execute('INSERT INTO `'+table.name+'` ('+keys.map(k=>'`'+k+'`').join(',')+') VALUES('+keys.map(()=>'?').join(',')+')',values);}}
 }finally{await db.query('SET FOREIGN_KEY_CHECKS=1');}
}
if(process.argv[1]&&new URL(import.meta.url).pathname.endsWith(process.argv[1].replaceAll('\\','/').split('/').at(-1))){
 loadEnvFile(process.env.CARGO_ENV_FILE||new URL('../.env',import.meta.url));const [file,target]=process.argv.slice(2);if(!file||!target)throw Error('Usage: node scripts/restore-db.mjs <trusted-backup.json> <empty-database-name>');const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,ssl:hostingSettings().ssl,timezone:'Z'});try{const backup=JSON.parse(await readFile(file,'utf8'));await restoreBackup(db,backup,target,process.env.MYSQL_DATABASE);console.log('Backup restored into separate database '+target+'. Validate it before changing application configuration.');}finally{await db.end();}
}
