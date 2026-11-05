import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {landSeaLegs,railLeg} from '../scripts/fixtures/multimodal.mjs';
const source=await readFile(new URL('../public/workspace.js',import.meta.url),'utf8');
async function waitFor(condition){for(let i=0;i<100;i++){if(condition())return;await new Promise(resolve=>setImmediate(resolve));}throw new Error('UI did not reach expected state.');}
async function harness(role='erp',authenticated=true){
 const portal={erp:'admin',vendor:'vendor',customer:'client'}[role];
 const dom=new JSDOM('<div id="app"></div>',{url:`http://127.0.0.1:3000/login/${portal}`});
 dom.window.scrollTo=()=>{};
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 for(const name of ['window','document','location','localStorage','FormData','FileReader','File','Blob'])globalThis[name]=name==='window'?dom.window:dom.window[name];
 const user={id:1,name:'QA User',role,email:'qa@cargoasl.invalid'};
 const records=role==='vendor'?[{id:9,kind:'rate_request',owner_id:7,status:'Pending',version:1,number:'RR-000009',details:{title:'QA request',currency:'USD',vendor_user_id:1},actions:['respond','save_rates'],editable:false,notes:[],documents:[],history:[],payments:[],followers:[],following:false}]:[];
 const requests=[];
 globalThis.fetch=async(path,options={})=>{
  const input=options.body?JSON.parse(options.body):null;requests.push({path,method:options.method||'GET',input});
  const result=(body,status=200)=>({ok:status>=200&&status<300,json:async()=>structuredClone(body)});
  if(path==='/api/me')return authenticated?result(user):result({error:'Sign in to Cargo ASL.'},401);
  if(path==='/api/login'){if(input.password==='wrong')return result({error:'Invalid email or password.'},401);authenticated=true;return result(user);}
  if(path==='/api/workspace/snapshot')return result({records,users:[{...user,active:1},{id:2,name:'QA Client',email:'client@cargoasl.invalid',role:'customer',active:1}],ledger:[],notifications:[],mail:[],smtpConfigured:false});
  if(path==='/api/workspace/records'&&options.method==='POST'){const record={id:20,kind:input.kind,details:input.details,owner_id:1,status:'Draft',version:1,number:'ORG-000020',actions:[],editable:true,notes:[],documents:[],history:[],payments:[],followers:[]};records.push(record);return result({id:20},201);}
  if(path==='/api/workspace/records/9/action'){records[0].details.vendor_charges=input.vendor_charges;records[0].details.validity_date=input.validity_date;records[0].status=input.action==='save_rates'?'Pending':'Submitted';records[0].actions=input.action==='save_rates'?['respond','save_rates']:[];return result({id:9});}
  const matched=/^\/api\/workspace\/records\/(\d+)$/.exec(path);if(matched)return result(records.find(record=>record.id===Number(matched[1])));
  return result({error:'Unhandled mocked request: '+path},404);
 };
 const modules={"'/reports.mjs'":JSON.stringify(new URL('../reports.mjs',import.meta.url).href),"'/business.mjs'":JSON.stringify(new URL('../business.mjs',import.meta.url).href),"'/quote-view.mjs'":JSON.stringify(new URL('../public/quote-view.mjs',import.meta.url).href),"'/csv-import.mjs'":JSON.stringify(new URL('../public/csv-import.mjs',import.meta.url).href)};
 let code=source;for(const [from,to]of Object.entries(modules))code=code.replaceAll(from,to);
 await import('data:text/javascript;base64,'+Buffer.from(code+'\n// '+Math.random()).toString('base64'));
 return {dom,requests,records,document:dom.window.document};
}
test('workspace form and portal handlers in an emulated DOM',async t=>{
 await t.test('client enters connected road, sea and train legs without losing edits or row booleans',async()=>{
  const {document,requests}=await harness('customer');document.querySelector('[data-nav=quote_request]').click();document.querySelector('[data-action=create]').click();await new Promise(resolve=>setImmediate(resolve));document.querySelector('[name=multimodal]').click();
  const legs=[...landSeaLegs,railLeg];for(const [i,leg]of legs.entries()){
   document.querySelector('[data-add=legs]').click();const mode=document.querySelector(`[name="legs.${i}.mode"]`);mode.value=leg.mode;mode.dispatchEvent(new window.Event('change'));
   for(const [key,value]of Object.entries(leg))document.querySelector(`[name="legs.${i}.${key}"]`).value=value;
  }
  document.querySelector('[data-move-leg="2:-1"]').click();assert.equal(document.querySelector('[name="legs.1.id"]').value,'RAIL');document.querySelector('[data-move-leg="1:1"]').click();
  document.querySelector('[data-add=packages]').click();document.querySelector('[name="packages.0.type"]').value='Box';document.querySelector('[name="packages.0.hazardous"]').checked=true;
  document.querySelector('#record-form').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>requests.some(r=>r.method==='POST'&&r.path==='/api/workspace/records')).catch(error=>{throw Error(error.message+' '+document.querySelector('[role=alert]')?.textContent);});
  const payload=requests.find(r=>r.method==='POST'&&r.path==='/api/workspace/records').input.details;assert.deepEqual(payload.legs.map(l=>l.id),['ROAD','SEA','RAIL']);assert.equal(payload.legs[1].origin,'Aster Port');assert.equal(payload.packages[0].hazardous,true);assert.equal(payload.multimodal,true);
 });
 await t.test('leg-specific booking form and train filter preserve the linked shipment',async()=>{
  const {document,records,requests}=await harness();records.push({id:31,kind:'shipment',owner_id:1,number:'SHP-000031',status:'Draft',version:1,details:{title:'QA multimodal',organization_id:2,currency:'USD',shipment_type:'Export',multimodal:true,legs:[...landSeaLegs,railLeg]},actions:['advance_leg'],editable:true,notes:[],documents:[],history:[],payments:[],followers:[]});
  document.querySelector('[data-action=refresh]').click();await waitFor(()=>document.querySelector('[data-open="31"]'));await new Promise(resolve=>setImmediate(resolve));document.querySelector('[data-nav=shipment]').click();const filter=document.querySelector('#route-transport_mode');filter.value='Rail Freight';filter.dispatchEvent(new window.Event('change'));assert.ok(document.querySelector('[data-open="31"]'));
  let cargo=document.querySelector('#route-cargo_type');cargo.value='Full Truck Load';cargo.dispatchEvent(new window.Event('change'));assert.equal(document.querySelector('[data-open="31"]'),null);cargo=document.querySelector('#route-cargo_type');cargo.value='Full Container Load';cargo.dispatchEvent(new window.Event('change'));assert.ok(document.querySelector('[data-open="31"]'));
  document.querySelector('[data-open="31"]').click();await waitFor(()=>document.querySelector('[data-leg-task="carrier_booking:RAIL"]'));document.querySelector('[data-leg-task="carrier_booking:RAIL"]').click();assert.equal(document.querySelector('[name=leg_id]').value,'RAIL');assert.equal(document.querySelector('[name=shipment_id]').value,'31');assert.equal(document.querySelector('[name=carrier]').value,'Juniper Rail');
  document.querySelector('#record-form').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>requests.some(r=>r.method==='POST'&&r.path==='/api/workspace/records'));assert.equal(requests.find(r=>r.method==='POST'&&r.path==='/api/workspace/records').input.details.leg_id,'RAIL');
 });
 await t.test('login failure is displayed; successful login uses the selected portal',async()=>{
  const {document,requests}=await harness('erp',false);
  document.querySelector('[name=email]').value='qa@cargoasl.invalid';document.querySelector('[name=password]').value='wrong';
  document.querySelector('#login').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>document.querySelector('.error')?.textContent.includes('Invalid'));
  document.querySelector('[name=email]').value='qa@cargoasl.invalid';document.querySelector('[name=password]').value='correct';
  document.querySelector('#login').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>document.querySelector('.app-nav'));
  assert.equal(requests.find(r=>r.path==='/api/login').input.portal,'admin');assert.ok(document.querySelector('[data-nav=organization]'));
 });
 await t.test('organization form persists edited fields through the create handler',async()=>{
  const {document,requests}=await harness();document.querySelector('[data-nav=organization]').click();document.querySelector('[data-action=create]').click();await new Promise(resolve=>setImmediate(resolve));
  document.querySelector('[name=name]').value='QA Aster Grove';document.querySelector('[name=city]').value='Dubai';
  document.querySelector('#record-form').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>document.querySelector('.document'));
  const saved=requests.find(r=>r.path==='/api/workspace/records'&&r.method==='POST');assert.equal(saved.input.details.name,'QA Aster Grove');assert.equal(saved.input.details.city,'Dubai');assert.equal(saved.input.kind,'organization');
 });
 await t.test('charge-row add/remove preserves user edits; invalid amounts do not crash form',async()=>{
  const {document}=await harness();document.querySelector('[data-nav=quote]').click();document.querySelector('[data-action=create]').click();document.querySelector('[name=title]').value='Retain this title';
  document.querySelector('[data-add=charges]').click();document.querySelector('[name="charges.0.description"]').value='Ocean freight';document.querySelector('[name="charges.0.sell_rate"]').value='not a number';
  document.querySelector('[data-add=charges]').click();assert.equal(document.querySelector('[name=title]').value,'Retain this title');assert.equal(document.querySelector('[name="charges.0.description"]').value,'Ocean freight');assert.match(document.body.textContent,/Enter valid amounts/);
  document.querySelector('[data-remove="charges:1"]').click();assert.equal(document.querySelectorAll('[name$=".description"]').length,1);
 });
 await t.test('vendor rate dialog retains multiple entered rows and submits them',async()=>{
  const {document,requests}=await harness('vendor');document.querySelector('[data-open="9"]').click();await waitFor(()=>document.querySelector('[data-transition=respond]'));document.querySelector('[data-transition=respond]').click();
  document.querySelector('dialog [data-add=vendor_charges]').click();document.querySelector('[name="vendor_charges.0.description"]').value='Freight';document.querySelector('[name="vendor_charges.0.cost_rate"]').value='80';
  document.querySelector('dialog [data-add=vendor_charges]').click();assert.equal(document.querySelector('[name="vendor_charges.0.description"]').value,'Freight');
  document.querySelector('[name="vendor_charges.1.description"]').value='Terminal';document.querySelector('[name="vendor_charges.1.cost_rate"]').value='20';
  document.querySelector('#action-dialog').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>requests.some(r=>r.path.endsWith('/action')));
  const saved=requests.find(r=>r.path.endsWith('/action')).input;assert.equal(saved.vendor_charges.length,2);assert.equal(saved.vendor_charges[0].cost_rate,'80');assert.equal(saved.vendor_charges[1].description,'Terminal');
 });
 await t.test('vendor draft dialog preserves its validity date while adding lines',async()=>{
  const {document,requests}=await harness('vendor');document.querySelector('[data-open="9"]').click();await waitFor(()=>document.querySelector('[data-transition=save_rates]'));document.querySelector('[data-transition=save_rates]').click();
  document.querySelector('[name=validity_date]').value='2099-12-20';document.querySelector('dialog [data-add=vendor_charges]').click();
  document.querySelector('[name="vendor_charges.0.description"]').value='Draft documentation';document.querySelector('[name="vendor_charges.0.cost_rate"]').value='25';
  assert.equal(document.querySelector('[name=validity_date]').value,'2099-12-20');document.querySelector('dialog [data-add=vendor_charges]').click();document.querySelector('dialog [data-remove="vendor_charges:1"]').click();
  assert.match(document.querySelector('dialog h2').textContent,/Save vendor draft/);
  document.querySelector('#action-dialog').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>requests.some(r=>r.path.endsWith('/action')));
  const saved=requests.find(r=>r.path.endsWith('/action')).input;assert.equal(saved.action,'save_rates');assert.equal(saved.validity_date,'2099-12-20');assert.equal(saved.vendor_charges[0].cost_rate,'25');
 });
 await t.test('editing older quotations keeps approval enabled when the policy field is absent',async()=>{
  const {document,records}=await harness();records.push({id:27,kind:'quote',number:'QUO-000027',status:'Draft',details:{title:'Legacy quote'},actions:[],editable:true,notes:[],documents:[],history:[],payments:[],followers:[]});
  document.querySelector('[data-action=refresh]').click();await waitFor(()=>document.querySelector('[data-open="27"]'));await new Promise(resolve=>setImmediate(resolve));document.querySelector('[data-nav=quote]').click();document.querySelector('[data-open="27"]').click();await waitFor(()=>document.querySelector('[data-action=edit]'));document.querySelector('[data-action=edit]').click();assert.equal(document.querySelector('[name=approval_required]').checked,true);
 });
 await t.test('email outbox clearly reports missing configuration',async()=>{
  const {document}=await harness();document.querySelector('[data-nav=mail]').click();assert.match(document.body.textContent,/Delivery requires SMTP_HOST/);assert.match(document.querySelector('h1').textContent,/Email outbox/);
 });
 await t.test('changing transport filters cargo choices and preserves inquiry dimensions',async()=>{
  const {document}=await harness('customer');document.querySelector('[data-nav=quote_request]').click();document.querySelector('[data-action=create]').click();
  document.querySelector('[name=title]').value='Retain QA inquiry';document.querySelector('[data-add=packages]').click();
  document.querySelector('[name="packages.0.type"]').value='Box';document.querySelector('[name="packages.0.length"]').value='100';
  const mode=document.querySelector('[name=transport_mode]');mode.value='Air Freight';mode.dispatchEvent(new window.Event('change'));
  assert.equal(document.querySelector('[name=title]').value,'Retain QA inquiry');assert.equal(document.querySelector('[name="packages.0.length"]').value,'100');
  assert.deepEqual([...document.querySelector('[name=cargo_type]').options].map(o=>o.value),['','Loose','Courier','ULD','UNA']);
  assert.equal(document.querySelector('[name=cargo_type]').value,'Loose');
 });
 await t.test('client can open inquiry and courier forms without admin identity controls',async()=>{
  const {document,requests}=await harness('customer');document.querySelector('[data-nav=quote]').click();document.querySelector('[data-action=request-quote]').click();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(document.querySelector('[name=contact_name]').value,'QA User');assert.equal(document.querySelector('[name=pickup_at]').type,'datetime-local');assert.equal(document.querySelector('[name=client_user_id]'),null);assert.ok(document.querySelector('#portal-documents'));
  document.querySelector('[name=title]').value='QA portal inquiry';document.querySelector('[name=address]').value='Aster Grove';
  document.querySelector('#record-form').dispatchEvent(new window.Event('submit',{cancelable:true}));await waitFor(()=>requests.some(r=>r.method==='POST'&&r.path==='/api/workspace/records'));
  assert.equal(requests.find(r=>r.method==='POST'&&r.path==='/api/workspace/records').input.kind,'quote_request');
  await waitFor(()=>document.querySelector('[data-action=back]'));await new Promise(resolve=>setImmediate(resolve));
  document.querySelector('[data-nav=courier]').click();document.querySelector('[data-action=create]').click();await new Promise(resolve=>setImmediate(resolve));
  document.querySelector('[data-add=goods]').click();assert.ok(document.querySelector('[name="goods.0.product"]'));assert.ok(document.querySelector('[name=logistic_id]'));assert.equal(document.querySelector('[name=client_user_id]'),null);
 });
 await t.test('route filters compose and saved filters restore their selections',async()=>{
  const {document,records}=await harness('customer');
  for(const [id,title,transport_mode,shipment_type]of [[21,'Air export','Air Freight','Export'],[22,'Road export','Road Freight','Export'],[23,'Air import','Air Freight','Import']])records.push({id,kind:'shipment',status:'Booked',details:{title,transport_mode,shipment_type,cargo_type:'General Cargo'}});
  document.querySelector('[data-action=refresh]').click();await waitFor(()=>document.querySelector('[data-open="21"]'));await new Promise(resolve=>setImmediate(resolve));document.querySelector('[data-nav=shipment]').click();
  const change=(id,value)=>{const field=document.querySelector('#'+id);field.value=value;field.dispatchEvent(new window.Event('change'));};
  change('route-transport_mode','Air Freight');change('route-shipment_type','Export');
  assert.match(document.querySelector('tbody').textContent,/Air export/);assert.doesNotMatch(document.querySelector('tbody').textContent,/Road export|Air import/);
  document.querySelector('[data-action=favorite]').click();await new Promise(resolve=>setImmediate(resolve));change('route-transport_mode','Road Freight');
  document.querySelector('[data-action=restore-filter]').click();await new Promise(resolve=>setImmediate(resolve));assert.equal(document.querySelector('#route-transport_mode').value,'Air Freight');assert.equal(document.querySelector('#route-shipment_type').value,'Export');
 });
});
