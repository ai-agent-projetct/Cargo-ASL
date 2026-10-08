import assert from 'node:assert/strict';
import {loadEnvFile} from 'node:process';
import {randomBytes,scrypt} from 'node:crypto';
import {promisify} from 'node:util';
import mysql from 'mysql2/promise';
import {sections} from '../quote.mjs';
loadEnvFile(new URL('../.env',import.meta.url));
const base=`http://${process.env.HOST}:${process.env.PORT}`;
const conn=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
const suffix=randomBytes(8).toString('hex'),password=randomBytes(20).toString('hex'),ids=[],lookupIds=[];
const salt=randomBytes(16).toString('hex'),encoded=salt+':'+(await promisify(scrypt)(password,salt,64)).toString('hex');
let createdId;
async function request(path,method='GET',data,cookie){const response=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};}
try{
  assert.equal((await request('/health')).status,200);
  assert.equal((await request('/quotes')).status,401);
  for(const role of ['erp','erp','customer']){
    const email=`check-${suffix}-${ids.length}@cargoasl.invalid`;
    const [row]=await conn.execute('INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)',[email,'Integration check',encoded,role]);ids.push({id:row.insertId,email});
  }
  const owner=await request('/login','POST',{email:ids[0].email,password,portal:'admin'});assert.equal(owner.status,200);assert.ok(owner.cookie);
  const check=async(name,fn)=>{await fn();console.log(`PASS: ${name}`);};
  await check('A01 malformed JSON returns 400',async()=>assert.equal((await fetch(base+'/api/quotes',{method:'POST',headers:{Cookie:owner.cookie,'Content-Type':'application/json'},body:'{'})).status,400));
  await check('A02 wrong content type returns 415',async()=>assert.equal((await fetch(base+'/api/quotes',{method:'POST',headers:{Cookie:owner.cookie,'Content-Type':'text/plain'},body:'{}'})).status,415));
  await check('A03 oversized body returns 413',async()=>assert.equal((await fetch(base+'/api/quotes',{method:'POST',headers:{Cookie:owner.cookie,'Content-Type':'application/json'},body:JSON.stringify({note:'x'.repeat(100001)})})).status,413));
  await check('A04 forged session returns 401',async()=>assert.equal((await request('/me','GET',null,'cargo_session='+'0'.repeat(64))).status,401));
  await check('A05 private files are not served',async()=>{for(const path of ['/.env','/.local/portal-accounts.json','/db/schema.sql'])assert.notEqual((await fetch(base+path,{headers:{Cookie:owner.cookie}})).status,200);});
  const draft={date:'2026-09-11',goods_value:'10.25',reference_number:`check-${suffix}`};
  for(const [,fields]of sections)for(const [key,label,,required]of fields)if(required){const [row]=await conn.execute('INSERT INTO lookup_values(field_name,label) VALUES(?,?)',[key,`Check ${suffix} ${label}`]);lookupIds.push(row.insertId);draft[key]=row.insertId;}
  assert.equal((await request('/quotes','POST',{...draft,client_id:0},owner.cookie)).status,400);
  await check('A06 relation IDs must belong to the correct field',async()=>assert.equal((await request('/quotes','POST',{...draft,client_id:draft.team_id},owner.cookie)).status,400));
  await check('A07 inactive lookup rejected without creating a quote',async()=>{
    await conn.execute('UPDATE lookup_values SET active=FALSE WHERE id=?',[draft.client_id]);
    assert.equal((await request('/quotes','POST',draft,owner.cookie)).status,400);
    assert.deepEqual((await request('/quotes','GET',null,owner.cookie)).data,[]);
    await conn.execute('UPDATE lookup_values SET active=TRUE WHERE id=?',[draft.client_id]);
  });
  const created=await request('/quotes','POST',draft,owner.cookie);assert.equal(created.status,201);createdId=created.data.id;
  const [persisted]=await conn.execute('SELECT details FROM quotes WHERE id=?',[createdId]);assert.equal(persisted[0].details.goods_value,'10.25');
  await check('A08 persisted draft has one matching audit entry',async()=>{const [rows]=await conn.execute("SELECT user_id,action FROM audit_log WHERE entity='quote' AND entity_id=?",[createdId]);assert.deepEqual(rows,[{user_id:ids[0].id,action:'create'}]);});
  assert.equal((await request('/quotes','GET',null,owner.cookie)).data[0].id,createdId);
  const other=await request('/login','POST',{email:ids[1].email,password,portal:'admin'});assert.deepEqual((await request('/quotes','GET',null,other.cookie)).data,[]);
  const customer=await request('/login','POST',{email:ids[2].email,password,portal:'client'});assert.equal((await request('/quotes','GET',null,customer.cookie)).status,403);
  await check('A09 customer cannot create quotes or read master data',async()=>{assert.equal((await request('/quotes','POST',draft,customer.cookie)).status,403);assert.equal((await request('/lookups','GET',null,customer.cookie)).status,403);});
  await check('A10 portal records do not leak across users',async()=>{
    await conn.execute('INSERT INTO portal_demo_records(user_id,reference,organization,route,status) VALUES(?,?,?,?,?)',[ids[0].id,`check-${suffix}`,'Fictional QA organization','A to B','Draft']);
    assert.equal((await request('/portal','GET',null,owner.cookie)).data.records.length,1);
    assert.deepEqual((await request('/portal','GET',null,customer.cookie)).data.records,[]);
  });
  await check('A11 disabling user revokes existing session access',async()=>{await conn.execute('UPDATE users SET active=FALSE WHERE id=?',[ids[1].id]);assert.equal((await request('/me','GET',null,other.cookie)).status,401);});
  await check('A12 expired sessions are rejected',async()=>{await conn.execute('UPDATE sessions SET expires_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 SECOND) WHERE user_id=?',[ids[2].id]);assert.equal((await request('/me','GET',null,customer.cookie)).status,401);});
  const crossSite=await fetch(base+'/api/logout',{method:'POST',headers:{Origin:'https://untrusted.invalid','Content-Type':'application/json',Cookie:owner.cookie},body:'{}'});assert.equal(crossSite.status,403);
  await request('/logout','POST',{},owner.cookie);assert.equal((await request('/me','GET',null,owner.cookie)).status,401);
  console.log('PASS: MySQL connectivity, login, draft persistence, validation, owner isolation, role restrictions, cross-origin rejection and logout.');
}finally{
  if(createdId){await conn.execute("DELETE FROM audit_log WHERE entity='quote' AND entity_id=?",[createdId]);await conn.execute('DELETE FROM quotes WHERE id=?',[createdId]);}
  for(const {id}of ids)await conn.execute('DELETE FROM users WHERE id=?',[id]);
  for(const id of lookupIds)await conn.execute('DELETE FROM lookup_values WHERE id=?',[id]);
  await conn.end();
}
