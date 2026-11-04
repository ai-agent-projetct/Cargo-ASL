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
const inquiryTitle='Browser inquiry '+nonce,courierTitle='Browser parcel '+nonce;
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
 const output=await new Promise((resolveOutput,reject)=>{const child=spawn(process.execPath,[cli,'capture-browser-scenario',inputPath,'--format','json'],{env:{...process.env,CARGO_BROWSER_EMAIL:a.email,CARGO_BROWSER_PASSWORD:a.password},windowsHide:true});let stdout='',stderr='';child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',reject);child.on('close',code=>code?reject(Error(stderr||'REA exited '+code)):resolveOutput(stdout));});
 await writeFile(directory+'/'+name+'-evidence.json',output);const evidence=JSON.parse(output),result=evidence.normalized_result;
 for(const step of result.steps)assert.equal(step.status,'completed',name+': '+step.step_id+' '+step.error);
 assert.ok(!result.events.items.some(event=>event.kind==='page-error'),name+': page error');
 const screenshot=result.steps.at(-1).artifacts.screenshot;if(screenshot?.state==='captured'){const value=screenshot.value;const bytes=value.data_base64||value.artifact?.data_base64;if(bytes)await writeFile(directory+'/'+name+'.png',Buffer.from(bytes,'base64'));}
 console.log('PASS: browser '+name);return result;
}
try{
 await scenario('client-inquiry','client',[click('quotes','[data-nav=quote]'),click('request','[data-action=request-quote]'),wait('form','#record-form'),fill('title',inquiryTitle),fill('address','Fictional Aster Grove office'),fill('origin','Amsterdam'),fill('destination','Dubai'),fill('origin_country','Netherlands'),fill('destination_country','United Arab Emirates'),fill('pickup','Warehouse A'),fill('delivery','Venue B'),fill('pickup_contact','Avery'),fill('delivery_contact','Rowan'),fill('pickup_at','2026-12-10T09:00'),fill('delivery_at','2026-12-12T17:30'),select('service_type','Priority'),fill('cargo_specification','Fictional display stand'),click('submit','#record-form button[type=submit]'),wait('saved','.detail-title')]);
 let client=await snapshot('client');const inquiry=client.records.find(r=>r.kind==='quote_request'&&r.details.title===inquiryTitle);assert.equal(inquiry?.status,'Submitted');
 await scenario('client-courier','client',[click('couriers','[data-nav=courier]'),click('create','[data-action=create]'),fill('title',courierTitle),fill('logistic_id','BROWSER-'+nonce),fill('logistic_partner','Blue Horizon Courier'),fill('shipper','Aster Grove'),fill('consignee','Copper Finch'),click('product','[data-add=goods]'),fill('goods.0.product','Display stand'),fill('goods.0.quantity','2'),fill('goods.0.unit_price','80.00'),select('goods.0.currency','USD'),click('save','#record-form button[type=submit]'),wait('saved','.detail-title')]);
 client=await snapshot('client');assert.ok(client.records.some(r=>r.kind==='courier'&&r.details.title===courierTitle));
 const admin=await snapshot('admin'),organization=admin.records.find(r=>r.kind==='organization');assert.ok(organization,'Run demo:workspace first.');assert.ok(admin.records.some(r=>r.id===inquiry.id),'Inquiry must reach the demo account manager.');
 await scenario('admin-prepare-quote','admin',[click('inquiries','[data-nav=quote_request]'),click('inquiry',`[data-open="${inquiry.id}"]`),wait('loaded','[data-transition=prepare]'),click('prepare','[data-transition=prepare]'),select('organization_id',String(organization.id)),fill('incoterm','FCA'),click('charge','[data-add=charges]'),fill('charges.0.description','Fictional freight'),fill('charges.0.cost_rate','80.00'),fill('charges.0.sell_rate','130.00'),click('save','#record-form button[type=submit]'),wait('saved','.detail-title'),click('submit','[data-transition=submit]'),click('confirm-submit','#action-dialog button[type=submit]'),wait('approvable','[data-transition=approve]'),click('approve','[data-transition=approve]'),click('confirm-approve','#action-dialog button[type=submit]'),wait('sendable','[data-transition=send]'),click('publish','[data-transition=send]'),click('confirm-publish','#action-dialog button[type=submit]'),wait('published','[data-transition=expire]')]);
 client=await snapshot('client');const quote=client.records.find(r=>r.kind==='quote'&&r.details.source_request_id===inquiry.id);assert.equal(quote?.status,'Sent');assert.equal(quote.totals.cost,undefined);
 await scenario('client-accept-quote','client',[click('quotes','[data-nav=quote]'),click('quote',`[data-open="${quote.id}"]`),wait('loaded','[data-transition=accept]'),click('accept','[data-transition=accept]'),click('confirm','#action-dialog button[type=submit]'),wait('accepted','.detail-title')]);
 assert.equal((await snapshot('client')).records.find(r=>r.id===quote.id).status,'Accepted');
 const vendor=await snapshot('vendor'),request=vendor.records.find(r=>r.kind==='invoice_request'&&r.status==='Pending Vendor Bill Upload');assert.ok(request,'Run demo:workspace first.');
 await scenario('vendor-invoice-form','vendor',[click('requests','[data-nav=invoice_request]'),click('request',`[data-open="${request.id}"]`),wait('uploadable','[data-transition=upload]'),click('upload','[data-transition=upload]'),wait('invoice-form','#action-dialog input[name=file_0]')]);
 await scenario('mobile-client-couriers','client',[click('couriers','[data-nav=courier]'),wait('list','.list-tools')],{width:390,height:844});
 console.log('PASS: 6 real-browser scenarios and persisted cross-role assertions. Evidence: '+directory);
}finally{
 const [rows]=await db.execute("SELECT id FROM business_records WHERE kind IN ('quote_request','quote','courier') AND JSON_UNQUOTE(JSON_EXTRACT(details,'$.title')) IN (?,?)",[inquiryTitle,courierTitle]);
 for(const {id}of rows){await db.execute("DELETE FROM audit_log WHERE entity='record' AND entity_id=?",[id]);await db.execute('DELETE FROM business_records WHERE id=?',[id]);}
 for(const cookie of cookies.values())await fetch(base+'/api/logout',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:'{}'});
 await db.end();
}
