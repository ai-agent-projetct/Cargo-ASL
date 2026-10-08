import {loadEnvFile} from 'node:process';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import mysql from 'mysql2/promise';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);loadEnvFile(root+'.env');
async function ready(){let conn;try{conn=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,connectTimeout:1000});await conn.query('SELECT 1');return true;}catch(e){if(!['ECONNREFUSED','ETIMEDOUT'].includes(e.code))throw e;return false;}finally{await conn?.end();}}
if(!await ready()){
  if(process.env.MYSQL_HOST!=='127.0.0.1'||process.env.MYSQL_PORT!=='3308')throw new Error('Configured MySQL server is unavailable.');
  const child=spawn('C:/mysql/mysql-commercial-9.7.0-winx64/bin/mysqld.exe',[`--defaults-file=${root}.local/mysql/my.ini`],{detached:true,windowsHide:true,stdio:'ignore'});
  await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});child.unref();
  let connected=false;for(let i=0;i<30;i++){if(await ready()){connected=true;break;}await new Promise(resolve=>setTimeout(resolve,1000));}
  if(!connected)throw new Error('Cargo ASL MySQL did not start. Check .local/mysql/server.log.');
}
await import('../server.mjs');
