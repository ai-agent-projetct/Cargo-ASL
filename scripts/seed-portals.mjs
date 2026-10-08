import {loadEnvFile} from 'node:process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {scrypt,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
import mysql from 'mysql2/promise';
loadEnvFile(new URL('../.env',import.meta.url));
const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
const file=new URL('../.local/portal-accounts.json',import.meta.url);
await mkdir(new URL('../.local/',import.meta.url),{recursive:true});
let accounts;
try{accounts=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;accounts=[['admin','erp','Maya Rowan'],['vendor','vendor','Evan Mercer'],['client','customer','Nora Vale']].map(([portal,role,name])=>({portal,role,name,email:`demo.${portal}@cargoasl.local`,password:randomBytes(18).toString('base64url')}));await writeFile(file,JSON.stringify(accounts,null,2));}
try{
 await db.query(`CREATE TABLE IF NOT EXISTS portal_demo_records(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id BIGINT UNSIGNED NOT NULL,reference VARCHAR(40) NOT NULL,organization VARCHAR(150) NOT NULL,route VARCHAR(150) NOT NULL,status VARCHAR(40) NOT NULL,UNIQUE(user_id,reference),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)`);
 await db.beginTransaction();
 for(const [field,label] of Object.entries({client_id:'Aster Grove Exhibitions',approving_user_id:'Maya Rowan',user_id:'Maya Rowan',company_id:'Cargo ASL',team_id:'Demo Logistics Team',shipment_type_id:'Export',cargo_type_id:'Full Container Load',origin_country_id:'Netherlands',destination_country_id:'United Arab Emirates',incoterm_id:'FCA'})) await db.execute('INSERT IGNORE INTO lookup_values(field_name,label) VALUES(?,?)',[field,label]);
 for(const a of accounts){const salt=randomBytes(16).toString('hex'),hash=salt+':'+(await promisify(scrypt)(a.password,salt,64)).toString('hex');await db.execute('INSERT IGNORE INTO users(email,name,password_hash,role) VALUES(?,?,?,?)',[a.email,a.name,hash,a.role]);const [users]=await db.execute('SELECT id,role FROM users WHERE email=?',[a.email]);if(users[0].role!==a.role)throw new Error('Existing demo account has an unexpected role.');for(const [reference,organization,route,status]of [['DEMO-1042','Aster Grove Exhibitions','Rotterdam → Dubai','In transit'],['DEMO-1043','Copper Finch Studios','Singapore → Mumbai','Draft'],['DEMO-1044','Willow Crest Events','Hamburg → Doha','Delivered']])await db.execute('INSERT IGNORE INTO portal_demo_records(user_id,reference,organization,route,status) VALUES(?,?,?,?,?)',[users[0].id,reference,organization,route,status]);}
 await db.commit();
 await writeFile(new URL('../.local/portal-logins.txt',import.meta.url),accounts.map(a=>`${a.portal.toUpperCase()} LOGIN\nhttp://127.0.0.1:3000/login/${a.portal}\nEmail: ${a.email}\nPassword: ${a.password}\n`).join('\n')+'\nFictional demonstration accounts. Keep this file private.\n');console.log('Three role-specific demo accounts and fictional records are ready. Credentials: .local/portal-logins.txt');
}catch(e){await db.rollback();throw e;}finally{await db.end();}
