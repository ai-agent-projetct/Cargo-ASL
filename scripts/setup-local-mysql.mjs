import {mkdir,readFile,writeFile,unlink,access} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadEnvFile} from 'node:process';
import mysql from 'mysql2/promise';
import net from 'node:net';

const root=fileURLToPath(new URL('../',import.meta.url));
const dir=root+'.local/mysql/';
const binary='C:/mysql/mysql-commercial-9.7.0-winx64/bin/mysqld.exe';
const port=3308;
loadEnvFile(root+'.env');
if(process.env.MYSQL_USER!=='LogiASL'||!process.env.MYSQL_PASSWORD) throw new Error('Expected the authorized Cargo ASL database account in .env.');
await mkdir(dir,{recursive:true});
let initialized=false;
try{await access(dir+'data/auto.cnf');await access(dir+'admin.json');initialized=true;}catch(e){if(e.code!=='ENOENT')throw e;}
await new Promise((resolve,reject)=>{const probe=net.createServer();probe.once('error',reject);probe.listen(port,'127.0.0.1',()=>probe.close(resolve));});
const ini=`[mysqld]\nbasedir=C:/mysql/mysql-commercial-9.7.0-winx64\ndatadir="${(dir+'data').replaceAll('\\','/')}"\nport=3307\nbind-address=127.0.0.1\nmysqlx=0\nlog-error="${(dir+'server.log').replaceAll('\\','/')}"\nsecure-file-priv=NULL\nlocal-infile=0\ncharacter-set-server=utf8mb4\ncollation-server=utf8mb4_0900_ai_ci\ninnodb-buffer-pool-size=128M\n`;
await writeFile(dir+'my.ini',ini.replace('port=3307',`port=${port}`));
if(!initialized)await new Promise((resolve,reject)=>{const child=spawn(binary,[`--defaults-file=${dir}my.ini`,'--initialize-insecure'],{windowsHide:true,stdio:'ignore'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('MySQL initialization failed; inspect the Cargo ASL server log.')));});
const rootPassword=initialized?JSON.parse(await readFile(dir+'admin.json','utf8')).password:randomBytes(32).toString('base64url');
const sql=`ALTER USER 'root'@'localhost' IDENTIFIED BY ${mysql.escape(rootPassword)};\nCREATE DATABASE IF NOT EXISTS cargo_asl CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;\nCREATE USER ${mysql.escape(process.env.MYSQL_USER)}@'localhost' IDENTIFIED BY ${mysql.escape(process.env.MYSQL_PASSWORD)};\nGRANT ALL PRIVILEGES ON cargo_asl.* TO ${mysql.escape(process.env.MYSQL_USER)}@'localhost';\n`;
await writeFile(dir+'admin.json',JSON.stringify({host:'127.0.0.1',port,user:'root',password:rootPassword}),{mode:0o600});
await writeFile(dir+'bootstrap.sql',sql.replace('CREATE USER ','CREATE USER IF NOT EXISTS '),{mode:0o600});
const child=spawn(binary,[`--defaults-file=${dir}my.ini`,`--init-file=${dir}bootstrap.sql`],{windowsHide:true,detached:true,stdio:'ignore'});
await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});child.unref();
let connected=false;
for(let attempt=0;attempt<45;attempt++){
  try{const conn=await mysql.createConnection({host:'127.0.0.1',port,user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:'cargo_asl',connectTimeout:1000});await conn.query('SELECT 1');await conn.end();connected=true;break;}catch{await new Promise(resolve=>setTimeout(resolve,1000));}
}
if(!connected)throw new Error('Cargo ASL MySQL did not become ready; inspect .local/mysql/server.log.');
await unlink(dir+'bootstrap.sql');
let env=await readFile(root+'.env','utf8');env=env.replace(/^MYSQL_PORT=.*$/m,`MYSQL_PORT=${port}`);
if(!/^ADMIN_EMAIL=/m.test(env))env+='\nADMIN_EMAIL=admin@cargoasl.local\nADMIN_PASSWORD='+randomBytes(18).toString('base64url')+'\n';
await writeFile(root+'.env',env,{mode:0o600});
console.log(`Dedicated Cargo ASL MySQL is ready on 127.0.0.1:${port}. Application account verified; existing MySQL service unchanged.`);
