import assert from 'node:assert/strict';
import {loadEnvFile} from 'node:process';
import {randomBytes,scrypt} from 'node:crypto';
import {promisify} from 'node:util';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import mysql from 'mysql2/promise';
import {buildReport} from '../reports.mjs';
import {journeyScenarios,legCosts,legSellingPrices,fictionalInvoicePdf} from './fixtures/multimodal.mjs';
loadEnvFile(new URL('../.env',import.meta.url));
const base=process.env.TEST_BASE||`http://${process.env.HOST}:${process.env.PORT}`,demo=process.argv.includes('--demo');
const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
const suffix=randomBytes(8).toString('hex'),password=randomBytes(24).toString('hex'),createdUsers=[],sessions=[],results=[];
let checks=0,admin,approver,client,outsider,vendors;
async function check(label,fn){await fn();checks++;console.log('PASS: '+label);}
async function request(path,method='GET',data,actor){const r=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(actor?.cookie?{Cookie:actor.cookie}:{})},...(data===undefined?{}:{body:JSON.stringify(data)})});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
async function ok(path,method,data,actor){const r=await request(path,method,data,actor);assert.ok(r.status>=200&&r.status<300,`${method} ${path}: ${r.status} ${JSON.stringify(r.body)}`);return r.body;}
const get=(id,actor=admin)=>ok('/workspace/records/'+id,'GET',undefined,actor);
async function create(kind,details,actor=admin,extra={}){const r=await ok('/workspace/records','POST',{kind,details,...extra},actor);return get(r.id,actor);}
async function action(record,name,actor=admin,extra={}){await ok('/workspace/records/'+record.id+'/action','POST',{version:record.version,action:name,...extra},actor);return get(record.id,actor);}
async function login(actor){const r=await request('/login','POST',{email:actor.email,password:actor.password||password,portal:{erp:'admin',vendor:'vendor',customer:'client'}[actor.role]});assert.equal(r.status,200);actor.cookie=r.cookie;sessions.push(actor);return actor;}
async function snapshot(actor=admin){return ok('/workspace/snapshot','GET',undefined,actor);}
try{
 if(demo){const accounts=JSON.parse(await readFile(new URL('../.local/portal-accounts.json',import.meta.url)));const account=(portal,role)=>({...accounts.find(a=>a.portal===portal),role});admin=await login(account('admin','erp'));approver=admin;client=await login(account('client','customer'));const vendor=await login(account('vendor','vendor'));vendors=[vendor,vendor,vendor];}
 else{
  const salt=randomBytes(16).toString('hex'),hash=salt+':'+(await promisify(scrypt)(password,salt,64)).toString('hex'),actors=[];
  for(const role of ['erp','erp','customer','customer','vendor','vendor','vendor']){const email=`journey-${suffix}-${actors.length}@cargoasl.invalid`;const [r]=await db.execute('INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)',[email,'Journey QA '+actors.length,hash,role]);const actor={id:r.insertId,email,role};createdUsers.push(actor);actors.push(await login(actor));}
  [admin,approver,client,outsider,...vendors]=actors;
 }
 // Use authenticated account IDs rather than trusting cached demo metadata.
 for(const actor of [admin,approver,client,...vendors]){const me=await ok('/me','GET',undefined,actor);actor.id=me.id;}
 for(const scenario of journeyScenarios){
  const title=demo?'Demo '+scenario.label:'QA '+scenario.label+' '+suffix,label=scenario.label;
  if(demo){const existing=(await snapshot()).records.find(r=>r.kind==='quote'&&r.details.title===title);if(existing){const shipment=await get(existing.details._converted_id),invoice=await get(shipment.details._invoice_id);assert.equal(invoice.status,'Paid','Existing demo is incomplete; review it before creating another.');assert.deepEqual(shipment.details.legs,scenario.legs);assert.equal(invoice.totals.total,scenario.total);console.log('EXISTS: '+title);results.push({scenario:scenario.key,quote_id:existing.id,shipment_id:shipment.id,invoice_id:invoice.id,status:'Paid',cost:scenario.cost,revenue:scenario.revenue,tax:scenario.tax,total:scenario.total,profit:scenario.profit});continue;}}
  const organization=await create('organization',{name:demo?'Demo '+label+' Logistics':'QA Aster Logistics '+suffix+' '+scenario.key,company_type:'Company',party_type:'Customer'});
  if(!demo&&scenario===journeyScenarios[0])await create('service_job',{title:'QA account-manager routing fixture',organization_id:organization.id,client_user_id:client.id,service_type:'Account assignment',date:'2026-11-04',currency:'USD'});
  const intake={title,contact_name:'Nora Vale',email:'nora@cargoasl.invalid',address:'Aster Yard',date:'2026-11-04',shipment_type:'Export',pickup:'Aster Yard',delivery:scenario.legs.at(-1).destination,pickup_contact:'Nora',delivery_contact:'Avery',pickup_at:'2026-11-10T08:00',delivery_at:'2026-11-17T16:00',service_type:'Priority',cargo_specification:'Fictional display equipment; no real cargo',multimodal:true,legs:scenario.legs,packages:[{type:'Box',count:'2',weight:'20',weight_unit:'kg',length:'100',width:'50',height:'40',dimension_unit:'cm',hazardous:true}]};
  let inquiry;
  await check(label+' / customer inquiry, leg continuity and role isolation',async()=>{
   const broken=structuredClone(intake);broken.legs[1].origin='Disconnected port';assert.equal((await request('/workspace/records','POST',{kind:'quote_request',details:broken},client)).status,400);
   inquiry=await create('quote_request',intake,client,{documents:[{name:'fictional-cargo.txt',mime:'text/plain',content:Buffer.from('QA display stand; multimodal briefing').toString('base64')}]});assert.equal(inquiry.status,'Submitted');assert.equal(inquiry.details.legs.length,scenario.legs.length);if(outsider)assert.equal((await request('/workspace/records/'+inquiry.id,'GET',undefined,outsider)).status,404);
  });
  let quote=await create('quote',{...inquiry.details,organization_id:organization.id,source_request_id:inquiry.id,approver_user_id:approver.id,sales_agent_id:admin.id,company:'Cargo ASL',sales_team:'Multimodal',expiry_date:'2099-12-31',incoterm:'FCA',currency:'USD',approval_required:true,charges:[{description:'Journey coordination',quantity:'1',cost_rate:'0',sell_rate:'20.00',tax_percent:'5',leg_id:'ROAD'}]});
  await check(label+' / inquiry becomes priced quote without losing its identity or file',async()=>{assert.equal(quote.id,inquiry.id);assert.equal(quote.number,inquiry.number);assert.equal(quote.documents.length,1);assert.equal((await get(quote.id,client)).details.charges,undefined);assert.deepEqual(quote.details.legs,scenario.legs);});
  const rates=[];
  for(const [index,leg]of scenario.legs.entries()){
   const vendor=vendors[index],details={title:label+' '+leg.id+' rate',organization_id:organization.id,quote_id:quote.id,vendor_user_id:vendor.id,due_date:'2099-12-31',transport_mode:leg.mode,cargo_type:leg.cargo_type,shipment_type:'Export',origin:leg.origin,destination:leg.destination,currency:'USD',leg_id:leg.id};
   await check(label+' / '+leg.id+' vendor request, draft and cost import',async()=>{
    assert.equal((await request('/workspace/records','POST',{kind:'rate_request',details:{...details,leg_id:'UNKNOWN'}},admin)).status,400);
    let rate=await create('rate_request',details);rate=await action(rate,'send');if(outsider)assert.equal((await request('/workspace/records/'+rate.id,'GET',undefined,vendors[(index+1)%vendors.length])).status,404);
    const submission={vendor_charges:[{description:leg.id+' freight',quantity:'1',cost_rate:legCosts[leg.id],currency:'USD',leg_id:'SPOOFED'}],vendor_note:'Fictional capacity confirmed',validity_date:'2099-12-31'};
    rate=await action(rate,'save_rates',vendor,submission);assert.equal(rate.status,'Pending');
    if(index===0&&!demo){let changed=await get(quote.id);const original=changed.details.legs;changed=await ok('/workspace/records/'+quote.id,'PUT',{version:changed.version,details:{...changed.details,legs:original.map((l,i)=>i===0?{...l,origin:'Revised Aster Yard'}:l)}},admin);assert.equal((await request('/workspace/records/'+rate.id+'/action','POST',{version:rate.version,action:'respond',...submission},vendor)).status,409);assert.equal((await get(rate.id,vendor)).status,'Pending');await ok('/workspace/records/'+quote.id,'PUT',{version:changed.version,details:{...changed.details,legs:original}},admin);}
    rate=await action(rate,'respond',vendor,submission);assert.equal(rate.status,'Submitted');
    const updated=await get(quote.id);const line=updated.details.charges.find(c=>c.description===leg.id+' freight');assert.equal(line.leg_id,leg.id);assert.equal(line.cost_rate,legCosts[leg.id]);assert.equal(line.sell_rate,'0');const count=updated.details.charges.length;
    rate=await action(await get(rate.id),'accept');assert.equal((await get(quote.id)).details.charges.length,count);rates.push(rate);
   });
  }
  quote=await get(quote.id);quote=await ok('/workspace/records/'+quote.id,'PUT',{version:quote.version,details:{...quote.details,charges:quote.details.charges.map(c=>({...c,sell_rate:c.description==='Journey coordination'?'20.00':legSellingPrices[c.leg_id],tax_percent:'5'}))}},admin);
  await check(label+' / exact cost, selling price, tax and approval',async()=>{
   assert.equal(quote.totals.cost,scenario.cost);assert.equal(quote.totals.revenue,scenario.revenue);assert.equal(quote.totals.tax,scenario.tax);assert.equal(quote.totals.total,scenario.total);
   assert.equal((await request('/workspace/records/'+quote.id+'/action','POST',{version:quote.version,action:'send'},admin)).status,403);quote=await action(quote,'submit');quote=await action(quote,'approve',approver);quote=await action(quote,'send');
   const shared=await get(quote.id,client);assert.equal(shared.totals.cost,undefined);assert.ok(shared.details.charges.every(c=>c.cost_rate===undefined));quote=await action(shared,'accept',client);
  });
  quote=await action(await get(quote.id),'convert');let shipment=await get(quote.details._converted_id);
  await check(label+' / conversion preserves all legs and documents exactly once',async()=>{assert.deepEqual(shipment.details.legs,scenario.legs);assert.equal(shipment.documents.length,1);assert.equal((await request('/workspace/records/'+quote.id+'/action','POST',{version:quote.version,action:'convert'},admin)).status,403);assert.equal((await get(shipment.id,client)).details.charges[0].cost_rate,undefined);});
  await check(label+' / premature invoicing, progress spoofing and shortcut completion are rejected',async()=>{
   for(const actionName of ['invoice','complete','depart'])assert.equal((await request('/workspace/records/'+shipment.id+'/action','POST',{version:shipment.version,action:actionName},admin)).status,403);
   assert.equal((await request('/workspace/records/'+shipment.id+'/action','POST',{version:shipment.version,action:'advance_leg',leg_id:'ROAD',event:'book'},client)).status,403);
   assert.equal((await request('/workspace/records/'+shipment.id+'/action','POST',{version:shipment.version,action:'advance_leg',leg_id:'ROAD',event:'book'},admin)).status,409);
   if(!demo){const premature=await create('invoice',{title:'QA premature final invoice',organization_id:organization.id,shipment_id:shipment.id,client_user_id:client.id,date:'2026-11-04',due_date:'2099-12-31',currency:'USD',charges:shipment.details.charges});assert.equal((await request('/workspace/records/'+premature.id+'/action','POST',{version:premature.version,action:'post'},admin)).status,409);}
  });
  for(const leg of scenario.legs){let booking=await create('carrier_booking',{title:leg.id+' internal booking',organization_id:organization.id,shipment_id:shipment.id,leg_id:leg.id,carrier:leg.carrier,carrier_reference:'QA-'+scenario.key+'-'+leg.id,date:'2026-11-04'});booking=await action(booking,'submit');booking=await action(booking,'approve');shipment=await action(shipment,'advance_leg',admin,{leg_id:leg.id,event:'book'});}
  await check(label+' / confirmed bookings exist for every leg and out-of-order departure fails',async()=>{assert.equal(shipment.status,'Booked');assert.equal((await request('/workspace/records/'+shipment.id+'/action','POST',{version:shipment.version,action:'advance_leg',leg_id:'SEA',event:'depart'},admin)).status,400);});
  if(!demo){const booking=(await snapshot()).records.find(r=>r.kind==='carrier_booking'&&r.details.shipment_id===shipment.id&&r.details.leg_id==='ROAD');await action(booking,'cancel');assert.equal((await request('/workspace/records/'+shipment.id+'/action','POST',{version:shipment.version,action:'advance_leg',leg_id:'ROAD',event:'depart'},admin)).status,409);let replacement=await create('carrier_booking',{title:'QA replacement road booking',organization_id:organization.id,shipment_id:shipment.id,leg_id:'ROAD',carrier:'Willow Roadways',date:'2026-11-04'});replacement=await action(replacement,'submit');await action(replacement,'approve');}
  await check(label+' / booking locks route structure while notes preserve trusted progress',async()=>{
   const changed=structuredClone(shipment.details);changed.legs.reverse();assert.ok([400,409].includes((await request('/workspace/records/'+shipment.id,'PUT',{version:shipment.version,details:changed},admin)).status));
   const fake={...shipment.details,notes:'QA handoff note',_leg_progress:{ROAD:{state:'Completed'}}};shipment=await ok('/workspace/records/'+shipment.id,'PUT',{version:shipment.version,details:fake},admin);assert.equal(shipment.details._leg_progress.ROAD.state,'Booked');
  });
  for(const [index,leg]of scenario.legs.entries())await check(label+' / '+leg.id+' departure, arrival and completion persist to client',async()=>{
   for(const event of ['depart','arrive','complete']){const stale=shipment.version;shipment=await action(shipment,'advance_leg',admin,{leg_id:leg.id,event});assert.equal((await request('/workspace/records/'+shipment.id+'/action','POST',{version:stale,action:'advance_leg',leg_id:leg.id,event},admin)).status,409);}
   assert.equal((await get(shipment.id,client)).details._leg_progress[leg.id].state,'Completed');assert.equal(shipment.status,index===scenario.legs.length-1?'Completed':'In Transit');
  });
  for(const [index,leg]of scenario.legs.entries())await check(label+' / '+leg.id+' vendor invoice draft, review, bill and payment',async()=>{
   let requestRecord=await create('invoice_request',{title:leg.id+' vendor invoice',organization_id:organization.id,shipment_id:shipment.id,leg_id:leg.id,vendor_user_id:vendors[index].id,date:'2026-11-04',currency:'USD',requested_charges:[{description:leg.id+' freight',quantity:'1',cost_rate:legCosts[leg.id],currency:'USD'}]});requestRecord=await action(requestRecord,'send');
   const upload={invoices:[{bill_number:'QA-'+suffix+'-'+scenario.key+'-'+leg.id,bill_date:'2026-11-04',currency:'USD',total:legCosts[leg.id],document:{name:'fictional-invoice.pdf',mime:'application/pdf',content:fictionalInvoicePdf('QA-'+suffix+'-'+scenario.key+'-'+leg.id,legCosts[leg.id]).toString('base64')}}]};
   requestRecord=await action(requestRecord,'save_invoice_draft',vendors[index],upload);const fileId=requestRecord.details.submitted_invoices[0].document_id;requestRecord=await action(requestRecord,'submit_invoice_draft',vendors[index]);assert.equal(requestRecord.details.submitted_invoices[0].document_id,fileId);
   const download=await fetch(base+'/api/workspace/documents/'+fileId,{headers:{Cookie:vendors[index].cookie}});assert.equal(download.status,200);const bytes=Buffer.from(await download.arrayBuffer());assert.ok(bytes.toString().startsWith('%PDF-1.4'));assert.ok(bytes.toString().endsWith('%%EOF\n'));assert.ok(bytes.includes(Buffer.from(legCosts[leg.id])));
   if(index===0){requestRecord=await action(await get(requestRecord.id),'reject',admin,{reason:'QA review: confirm service reference'});requestRecord=await action(requestRecord,'upload',vendors[index],upload);}
   requestRecord=await action(await get(requestRecord.id),'approve');let bill=await get(requestRecord.details._bill_ids[0]);assert.equal(bill.status,'Draft');assert.equal(bill.details.leg_id,leg.id);assert.equal(bill.documents.length,1);const originalCopy=await fetch(base+'/api/workspace/documents/'+bill.documents[0].id,{headers:{Cookie:admin.cookie}});assert.equal(originalCopy.status,200);assert.ok(Buffer.from(await originalCopy.arrayBuffer()).equals(bytes));bill=await action(bill,'post');bill=await action(bill,'pay',admin,{amount:legCosts[leg.id],reference:'QA settlement '+leg.id});assert.equal(bill.status,'Paid');
  });
  shipment=await action(await get(shipment.id),'invoice');let invoice=await get(shipment.details._invoice_id);invoice=await action(invoice,'post');
  await check(label+' / whole-journey invoice, partial payment and final settlement',async()=>{
   assert.deepEqual(invoice.details.legs,scenario.legs);assert.equal(invoice.totals.total,scenario.total);assert.equal((await get(invoice.id,client)).totals.cost,undefined);
   assert.equal((await request('/workspace/records/'+invoice.id+'/action','POST',{version:invoice.version,action:'pay',amount:'999999.00',reference:'QA overpayment'},admin)).status,400);
   invoice=await action(invoice,'pay',admin,{amount:'100.00',reference:'QA deposit'});assert.equal(invoice.status,'Partially Paid');invoice=await action(invoice,'pay',admin,{amount:scenario.key==='land-sea'?'551.00':'866.00',reference:'QA final settlement'});assert.equal(invoice.status,'Paid');assert.equal((await get(invoice.id,client)).payments.length,2);
  });
  await check(label+' / balanced ledger, actual profit, journey report and audit history',async()=>{
   const state=await snapshot();const profit=buildReport('shipment_profit',state.records).rows.find(row=>row[0]===shipment.number);assert.equal(profit[7],scenario.profit);
   const progress=buildReport('journeys',state.records).rows.filter(row=>row[0]===shipment.number);assert.equal(progress.length,scenario.legs.length);assert.ok(progress.every(row=>row[9]==='Completed'));
   const history=(await get(shipment.id)).history;for(const leg of scenario.legs)assert.ok(history.some(h=>h.action==='leg '+leg.id+': complete'));
   const [unbalanced]=await db.execute('SELECT l.record_id FROM ledger_entries l JOIN business_records r ON r.id=l.record_id WHERE r.owner_id=? GROUP BY l.record_id HAVING SUM(l.debit)<>SUM(l.credit)',[admin.id]);assert.equal(unbalanced.length,0);
   assert.equal(buildReport('receivables',state.records).rows.filter(row=>row[0]===invoice.number).length,0);
  });
  results.push({scenario:scenario.key,quote_id:quote.id,shipment_id:shipment.id,invoice_id:invoice.id,status:invoice.status,cost:scenario.cost,revenue:scenario.revenue,tax:scenario.tax,total:scenario.total,profit:scenario.profit});
 }
 if(demo){await mkdir('.local',{recursive:true});await writeFile('.local/multimodal-demo.json',JSON.stringify(results,null,2));}
 console.log(`PASS: ${checks} multimodal workflow checks across Land + Sea and Land + Sea + Train. ${demo?'Demo records retained.':'Temporary fixtures will be removed.'}`);
}finally{
 for(const actor of sessions)await request('/logout','POST',{},actor).catch(()=>{});
 if(createdUsers.length){const ids=createdUsers.map(a=>a.id),marks=ids.map(()=>'?').join(',');for(const table of ['ledger_entries','record_payments'])await db.execute(`DELETE t FROM ${table} t JOIN business_records r ON r.id=t.record_id WHERE r.owner_id IN (${marks})`,ids);await db.execute(`DELETE a FROM audit_log a JOIN business_records r ON r.id=a.entity_id WHERE a.entity='record' AND r.owner_id IN (${marks})`,ids);await db.execute(`DELETE FROM business_records WHERE owner_id IN (${marks})`,ids);await db.execute(`DELETE FROM users WHERE id IN (${marks})`,ids);}
 await db.end();
}
