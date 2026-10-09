import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const source=await readFile(new URL('../public/workspace.js',import.meta.url),'utf8');
async function waitFor(condition){for(let i=0;i<100;i++){if(condition())return;await new Promise(resolve=>setImmediate(resolve));}throw new Error('UI did not reach expected state.');}
async function harness(role='erp',authenticated=true){
 const portal={erp:'admin',vendor:'vendor',customer:'client'}[role];
 const dom=new JSDOM('<div id="app"></div>',{url:`http://127.0.0.1:3000/login/${portal}`});
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 for(const name of ['window','document','location','localStorage','FormData','FileReader','File','Blob'])globalThis[name]=name==='window'?dom.window:dom.window[name];
 const user={id:1,name:'QA User',role,email:'qa@cargoasl.invalid'};
 const records=role==='vendor'?[{id:9,kind:'rate_request',owner_id:7,status:'Pending',version:1,number:'RR-000009',details:{title:'QA request',currency:'USD',vendor_user_id:1},actions:['respond'],editable:false,notes:[],documents:[],history:[],payments:[],followers:[],following:false}]:[];
 const requests=[];
 globalThis.fetch=async(path,options={})=>{
  const input=options.body?JSON.parse(options.body):null;requests.push({path,method:options.method||'GET',input});
  const result=(body,status=200)=>({ok:status>=200&&status<300,json:async()=>structuredClone(body)});
  if(path==='/api/me')return authenticated?result(user):result({error:'Sign in to Cargo ASL.'},401);
  if(path==='/api/login'){if(input.password==='wrong')return result({error:'Invalid email or password.'},401);authenticated=true;return result(user);}
  if(path==='/api/workspace/snapshot')return result({records,users:[{...user,active:1},{id:2,name:'QA Client',email:'client@cargoasl.invalid',role:'customer',active:1}],ledger:[],notifications:[],mail:[],smtpConfigured:false});
  if(path==='/api/workspace/records'&&options.method==='POST'){const record={id:20,kind:input.kind,details:input.details,owner_id:1,status:'Draft',version:1,number:'ORG-000020',actions:[],editable:true,notes:[],documents:[],history:[],payments:[],followers:[]};records.push(record);return result({id:20},201);}
  if(path==='/api/workspace/records/9/action'){records[0].details.vendor_charges=input.vendor_charges;records[0].status='Submitted';records[0].actions=[];return result({id:9});}
  const matched=/^\/api\/workspace\/records\/(\d+)$/.exec(path);if(matched)return result(records.find(record=>record.id===Number(matched[1])));
  return result({error:'Unhandled mocked request: '+path},404);
 };
 const modules={"'/reports.mjs'":JSON.stringify(new URL('../reports.mjs',import.meta.url).href),"'/business.mjs'":JSON.stringify(new URL('../business.mjs',import.meta.url).href),"'/quote-view.mjs'":JSON.stringify(new URL('../public/quote-view.mjs',import.meta.url).href),"'/csv-import.mjs'":JSON.stringify(new URL('../public/csv-import.mjs',import.meta.url).href)};
 let code=source;for(const [from,to]of Object.entries(modules))code=code.replaceAll(from,to);
 await import('data:text/javascript;base64,'+Buffer.from(code+'\n// '+Math.random()).toString('base64'));
 return {dom,requests,records,document:dom.window.document};
}
test('workspace form and portal handlers in an emulated DOM',async t=>{
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
 await t.test('email outbox clearly reports missing configuration',async()=>{
  const {document}=await harness();document.querySelector('[data-nav=mail]').click();assert.match(document.body.textContent,/Delivery requires SMTP_HOST/);assert.match(document.querySelector('h1').textContent,/Email outbox/);
 });
});
