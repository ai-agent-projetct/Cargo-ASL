import {journeyScenarios,legCosts,legSellingPrices} from './fixtures/multimodal.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {loadEnvFile} from 'node:process';
import {isAbsolute,resolve} from 'node:path';
import mysql from 'mysql2/promise';
loadEnvFile(new URL('../.env',import.meta.url));
const cli=process.env.REA_CLI,browser=process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe';
if(!cli||!isAbsolute(cli))throw Error('Set REA_CLI to the installed rea-agents/scripts/rea.mjs absolute path.');
const base=process.env.TEST_BASE||`http://${process.env.HOST}:${process.env.PORT}`;
const accounts=JSON.parse(await readFile(new URL('../.local/portal-accounts.json',import.meta.url),'utf8'));
const account=portal=>accounts.find(a=>a.portal===portal),nonce=randomBytes(8).toString('hex');
const directory=resolve('.local/browser-tests/'+nonce);await mkdir(directory,{recursive:true});
const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
const fill=(key,value)=>({step_id:'fill-'+key.replace(/[^a-z0-9]/gi,'-'),action:'fill',locator:{kind:'css',selector:`[name="${key}"]`},value:{source:'literal',value},timeout_ms:10000});
const select=(key,value)=>({...fill(key,value),action:'select_option'});
const click=(id,selector)=>({step_id:id,action:'click',locator:{kind:'css',selector},timeout_ms:10000});
const wait=(id,selector)=>({step_id:id,action:'wait_for',locator:{kind:'css',selector},state:'visible',timeout_ms:15000});
async function apiLogin(portal){const a=account(portal),response=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(a)});assert.equal(response.status,200);return response.headers.get('set-cookie').split(';')[0];}
const cookies=new Map();async function snapshot(portal){if(!cookies.has(portal))cookies.set(portal,await apiLogin(portal));const response=await fetch(base+'/api/workspace/snapshot',{headers:{Cookie:cookies.get(portal)}});assert.equal(response.status,200);return response.json();}
async function scenario(name,portal,actions,viewport={width:1440,height:1000}){
 const a=account(portal);assert.ok(a,'Run demo:seed first.');
 const input={browser:{mode:'launch',executable_path:browser,headless:true},start_url:{url:base+'/login/'+portal},environment:{viewport},secrets:[{secret_id:'email',environment_variable:'CARGO_BROWSER_EMAIL'},{secret_id:'password',environment_variable:'CARGO_BROWSER_PASSWORD'}],actions:[{step_id:'email',action:'fill',locator:{kind:'css',selector:'[name=email]'},value:{source:'secret',secret_id:'email'},timeout_ms:10000},{step_id:'password',action:'fill',locator:{kind:'css',selector:'[name=password]'},value:{source:'secret',secret_id:'password'},timeout_ms:10000},click('login','#login button[type=submit]'),wait('workspace','.app-nav'),...actions],capture:{at_end:['accessibility','screenshot','url'],events:['page-errors']}};
 const inputPath=directory+'/'+name+'.json';await writeFile(inputPath,JSON.stringify(input));
 const output=await new Promise((resolveOutput,reject)=>{const child=spawn(process.execPath,[cli,'capture-browser-scenario',inputPath,'--format','json'],{env:{...process.env,CARGO_BROWSER_EMAIL:a.email,CARGO_BROWSER_PASSWORD:a.password},windowsHide:true});let stdout='',stderr='';child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',reject);child.on('close',async code=>{if(code){await writeFile(directory+'/'+name+'-failure.json',stdout||stderr);reject(Error('REA exited '+code+'; evidence: '+directory+'/'+name+'-failure.json'));}else resolveOutput(stdout);});});
 await writeFile(directory+'/'+name+'-evidence.json',output);const evidence=JSON.parse(output),result=evidence.normalized_result;
 for(const step of result.steps)assert.equal(step.status,'completed',name+': '+step.step_id+' '+step.error);
 assert.ok(!result.events.items.some(event=>event.kind==='page-error'),name+': page error');
 const screenshot=result.steps.at(-1).artifacts.screenshot;if(screenshot?.state==='captured'){const value=screenshot.value;const bytes=value.data_base64||value.artifact?.data_base64;if(bytes)await writeFile(directory+'/'+name+'.png',Buffer.from(bytes,'base64'));}
 console.log('PASS: browser '+name);return result;
}
const hidden=(id,selector)=>({step_id:id,action:'wait_for',locator:{kind:'css',selector},state:'hidden',timeout_ms:15000});
const confirm=id=>click(id,'#action-dialog button[type=submit]');
const field=(id,key,value)=>({...fill(key,value),step_id:id});
async function adminApi(path,method='GET',input){if(!cookies.has('admin'))cookies.set('admin',await apiLogin('admin'));const r=await fetch(base+'/api'+path,{method,headers:{Cookie:cookies.get('admin'),'Content-Type':'application/json'},...(input===undefined?{}:{body:JSON.stringify(input)})});assert.ok(r.ok,await r.clone().text());return r.json();}
let scenarios=0;
try{
 for(const journey of journeyScenarios){
  const prefix='Browser multimodal '+nonce+' '+journey.key,admin=await snapshot('admin'),organization=admin.records.find(r=>r.kind==='organization'),vendor=admin.users.find(u=>u.email===account('vendor').email);assert.ok(organization&&vendor,'Seed demo records first.');
  const entry=[click('inquiries','[data-nav=quote_request]'),click('create','[data-action=create]'),fill('title',prefix),fill('address','Fictional Aster Yard'),fill('pickup','Aster Yard'),fill('delivery',journey.legs.at(-1).destination),fill('pickup_contact','Nora'),fill('delivery_contact','Avery'),fill('pickup_at','2026-11-10T08:00'),fill('delivery_at','2026-11-17T16:00'),fill('cargo_specification','Fictional multimodal stand; no real cargo'),click('enable-journey','[name=multimodal]')];
  for(const [i,leg]of journey.legs.entries()){entry.push(click('add-leg-'+i,'[data-add=legs]'),fill(`legs.${i}.id`,leg.id),select(`legs.${i}.mode`,leg.mode));for(const [key,value]of Object.entries(leg))if(!['id','mode'].includes(key))entry.push((key==='cargo_type'?select:fill)(`legs.${i}.${key}`,value));}
  entry.push(click('package','[data-add=packages]'),fill('packages.0.type','Box'),fill('packages.0.count','2'),click('hazardous','[name="packages.0.hazardous"]'),click('save-inquiry','#record-form button[type=submit]'),wait('saved','.detail-title'));
  await scenario(journey.key+'-client-journey','client',entry);scenarios++;
  const inquiry=(await snapshot('client')).records.find(r=>r.kind==='quote_request'&&r.details.title===prefix);assert.equal(inquiry.details.legs.length,journey.legs.length);assert.equal(inquiry.details.packages[0].hazardous,true);
  await scenario(journey.key+'-admin-rate-request','admin',[
   click('inquiries','[data-nav=quote_request]'),click('inquiry',`[data-open="${inquiry.id}"]`),wait('prepare-visible','[data-transition=prepare]'),click('prepare','[data-transition=prepare]'),select('organization_id',String(organization.id)),fill('incoterm','FCA'),fill('expiry_date','2099-12-31'),click('coordination','[data-add=charges]'),fill('charges.0.description','Journey coordination'),fill('charges.0.sell_rate','20.00'),fill('charges.0.tax_percent','5'),select('charges.0.leg_id','ROAD'),click('save-quote','#record-form button[type=submit]'),wait('quote-saved','[data-leg-task="rate_request:ROAD"]'),click('request-road','[data-leg-task="rate_request:ROAD"]'),fill('title',prefix+' rate'),select('vendor_user_id',String(vendor.id)),fill('due_date','2099-12-31'),click('save-rate','#record-form button[type=submit]'),wait('send-rate','[data-transition=send]'),click('send','[data-transition=send]'),confirm('confirm-send'),wait('pending','[data-transition=respond]')
  ]);scenarios++;
  const rate=(await snapshot('vendor')).records.find(r=>r.kind==='rate_request'&&r.details.title===prefix+' rate');assert.equal(rate.details.leg_id,'ROAD');assert.equal(rate.details.transport_mode,'Road Freight');
  await scenario(journey.key+'-vendor-road-rate','vendor',[
   click('rates','[data-nav=rate_request]'),click('rate',`[data-open="${rate.id}"]`),wait('respond-visible','[data-transition=respond]'),click('respond','[data-transition=respond]'),fill('validity_date','2099-12-31'),click('line','dialog [data-add=vendor_charges]'),fill('vendor_charges.0.description','ROAD freight'),fill('vendor_charges.0.cost_rate','100.00'),confirm('submit-rate'),hidden('submitted','dialog')
  ]);scenarios++;
  const price=[click('quotes','[data-nav=quote]'),click('quote',`[data-open="${inquiry.id}"]`),wait('edit-visible','[data-action=edit]'),click('edit','[data-action=edit]'),fill('charges.1.sell_rate','150.00'),fill('charges.1.tax_percent','5')];
  for(const [i,leg]of journey.legs.slice(1).entries()){const row=i+2;price.push(click('add-charge-'+leg.id,'[data-add=charges]'),fill(`charges.${row}.description`,leg.id+' freight'),fill(`charges.${row}.cost_rate`,legCosts[leg.id]),fill(`charges.${row}.sell_rate`,legSellingPrices[leg.id]),fill(`charges.${row}.tax_percent`,'5'),select(`charges.${row}.leg_id`,leg.id));}
  price.push(click('save','#record-form button[type=submit]'),wait('submit-visible','[data-transition=submit]'),click('submit','[data-transition=submit]'),confirm('confirm-submit'),wait('approve-visible','[data-transition=approve]'),click('approve','[data-transition=approve]'),confirm('confirm-approve'),wait('publish-visible','[data-transition=send]'),click('publish','[data-transition=send]'),confirm('confirm-publish'),wait('sent','[data-transition=expire]'));
  await scenario(journey.key+'-admin-pricing','admin',price);scenarios++;
  let quote=(await snapshot('client')).records.find(r=>r.id===inquiry.id);assert.equal(quote.totals.total,journey.total);assert.equal(quote.totals.cost,undefined);assert.equal(quote.number,inquiry.number);
  await scenario(journey.key+'-client-accept','client',[click('quotes','[data-nav=quote]'),click('quote',`[data-open="${quote.id}"]`),wait('accept-visible','[data-transition=accept]'),click('accept','[data-transition=accept]'),confirm('confirm-accept'),hidden('accepted','dialog')]);scenarios++;
  quote=await adminApi('/workspace/records/'+quote.id);await adminApi('/workspace/records/'+quote.id+'/action','POST',{version:quote.version,action:'convert'});quote=await adminApi('/workspace/records/'+quote.id);let shipment=await adminApi('/workspace/records/'+quote.details._converted_id);
  for(const leg of journey.legs){
   await scenario(journey.key+'-operate-'+leg.id,'admin',[
    click('shipments','[data-nav=shipment]'),click('shipment',`[data-open="${shipment.id}"]`),wait('create-booking-visible',`[data-leg-task="carrier_booking:${leg.id}"]`),click('create-booking',`[data-leg-task="carrier_booking:${leg.id}"]`),fill('title',prefix+' '+leg.id+' booking'),click('save-booking','#record-form button[type=submit]'),wait('submit-booking-visible','[data-transition=submit]'),click('submit-booking','[data-transition=submit]'),confirm('confirm-booking'),wait('approve-booking-visible','[data-transition=approve]'),click('approve-booking','[data-transition=approve]'),confirm('confirm-carrier'),wait('complete-booking-visible','[data-transition=complete]'),click('complete-booking','[data-transition=complete]'),confirm('finish-booking'),hidden('booking-completed','dialog'),click('back-to-jobs','[data-nav=shipment]'),click('open-job',`[data-open="${shipment.id}"]`),wait('book-leg-visible',`[data-leg-event="${leg.id}:book"]`),click('book-leg',`[data-leg-event="${leg.id}:book"]`),wait('depart-leg-visible',`[data-leg-event="${leg.id}:depart"]`),click('depart-leg',`[data-leg-event="${leg.id}:depart"]`),wait('arrive-leg-visible',`[data-leg-event="${leg.id}:arrive"]`),click('arrive-leg',`[data-leg-event="${leg.id}:arrive"]`),wait('complete-leg-visible',`[data-leg-event="${leg.id}:complete"]`),click('complete-leg',`[data-leg-event="${leg.id}:complete"]`),hidden('leg-completed',`[data-leg-event="${leg.id}:complete"]`)
   ]);scenarios++;const visible=(await snapshot('client')).records.find(r=>r.id===shipment.id);assert.equal(visible.details._leg_progress[leg.id].state,'Completed');assert.ok(visible.details.charges.every(c=>c.cost_rate===undefined));
  }
  shipment=await adminApi('/workspace/records/'+shipment.id);assert.equal(shipment.status,'Completed');
  await scenario(journey.key+'-invoice-payments','admin',[
   click('shipments','[data-nav=shipment]'),click('shipment',`[data-open="${shipment.id}"]`),wait('invoice-visible','[data-transition=invoice]'),click('invoice','[data-transition=invoice]'),confirm('create-invoice'),{step_id:'open-invoice',action:'click',locator:{kind:'role',role:'button',name:'Open invoice'},timeout_ms:15000},wait('post-visible','[data-transition=post]'),click('post','[data-transition=post]'),confirm('confirm-post'),wait('pay-visible','[data-transition=pay]'),click('deposit','[data-transition=pay]'),field('deposit-amount','amount','100.00'),field('deposit-reference','reference','QA deposit'),confirm('confirm-deposit'),hidden('deposit-saved','dialog'),click('balance','[data-transition=pay]'),field('balance-amount','amount',journey.key==='land-sea'?'551.00':'866.00'),field('balance-reference','reference','QA final settlement'),confirm('confirm-balance'),hidden('invoice-paid','dialog')
  ]);scenarios++;shipment=await adminApi('/workspace/records/'+shipment.id);const invoice=await adminApi('/workspace/records/'+shipment.details._invoice_id);assert.equal(invoice.status,'Paid');assert.equal(invoice.totals.total,journey.total);assert.deepEqual(invoice.details.legs,journey.legs);
 }
 console.log('PASS: '+scenarios+' actual Chrome journey scenarios. Evidence: '+directory);
}finally{
 const [rows]=await db.execute("SELECT id FROM business_records WHERE JSON_UNQUOTE(JSON_EXTRACT(details,'$.title')) LIKE ?",['%'+nonce+'%']);
 for(const {id}of rows){await db.execute('DELETE FROM ledger_entries WHERE record_id=?',[id]);await db.execute('DELETE FROM record_payments WHERE record_id=?',[id]);await db.execute("DELETE FROM audit_log WHERE entity='record' AND entity_id=?",[id]);await db.execute('DELETE FROM business_records WHERE id=?',[id]);}
 for(const cookie of cookies.values())await fetch(base+'/api/logout',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:'{}'});
 await db.end();
}
