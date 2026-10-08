import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const accounts=JSON.parse(await readFile(new URL('../.local/portal-accounts.json',import.meta.url),'utf8'));
const base='http://127.0.0.1:3000';
for(const account of accounts){
 const page=await fetch(base+'/login/'+account.portal);assert.equal(page.status,200);
 const wrong=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...account,portal:account.portal==='admin'?'vendor':'admin'})});assert.equal(wrong.status,403);assert.equal(wrong.headers.get('set-cookie'),null);
 const login=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(account)});assert.equal(login.status,200);assert.equal((await login.json()).role,account.role);const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);
 const data=await fetch(base+'/api/portal',{headers:{Cookie:cookie}});assert.equal(data.status,200);const body=await data.json();assert.equal(body.records.length,3);assert.equal(body.demo,true);
 const erp=await fetch(base+'/api/quotes',{headers:{Cookie:cookie}});assert.equal(erp.status,account.role==='erp'?200:403);
 await fetch(base+'/api/logout',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:'{}'});
 assert.equal((await fetch(base+'/api/me',{headers:{Cookie:cookie}})).status,401);
 console.log(`PASS: ${account.portal} login, wrong-portal rejection, assigned demo records, ERP permissions and logout.`);
}
