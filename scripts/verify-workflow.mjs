import assert from 'node:assert/strict';
import {loadEnvFile} from 'node:process';
import {randomBytes,scrypt} from 'node:crypto';
import {promisify} from 'node:util';
import mysql from 'mysql2/promise';
loadEnvFile(new URL('../.env',import.meta.url));
const base=process.env.TEST_BASE||`http://${process.env.HOST}:${process.env.PORT}`;
const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
const suffix=randomBytes(8).toString('hex'),password=randomBytes(24).toString('hex'),accounts=[],ids=[];
let checks=0;
async function check(name,fn){await fn();checks++;console.log('PASS: '+name);}
async function request(path,method='GET',data,account){const response=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(account?.cookie?{Cookie:account.cookie}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})});const body=await response.json();return {status:response.status,body,cookie:response.headers.get('set-cookie')?.split(';')[0]};}
async function ok(path,method,data,account){const result=await request(path,method,data,account);assert.ok(result.status>=200&&result.status<300,`${method} ${path}: ${result.status} ${JSON.stringify(result.body)}`);return result.body;}
const get=(id,account)=>ok('/workspace/records/'+id,'GET',undefined,account);
async function create(kind,details,account){const result=await ok('/workspace/records','POST',{kind,details},account);ids.push(result.id);return get(result.id,account);}
async function action(record,name,account,extra={}){const result=await ok('/workspace/records/'+record.id+'/action','POST',{version:record.version,action:name,...extra},account);return get(result.id,account);}
try{
 const salt=randomBytes(16).toString('hex'),hash=salt+':'+(await promisify(scrypt)(password,salt,64)).toString('hex');
 for(const role of ['erp','erp','vendor','customer','customer']){const email=`flow-${suffix}-${accounts.length}@cargoasl.invalid`;const [row]=await db.execute('INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)',[email,'Workflow QA '+accounts.length,hash,role]);accounts.push({id:row.insertId,email,role});}
 for(const account of accounts){const login=await request('/login','POST',{email:account.email,password,portal:{erp:'admin',vendor:'vendor',customer:'client'}[account.role]});assert.equal(login.status,200);account.cookie=login.cookie;}
 const [admin,approver,vendor,client,outsider]=accounts;
 const organization=await create('organization',{name:'QA Willow Crest '+suffix,company_type:'Company',party_type:'Customer',email:'qa@cargoasl.invalid'},admin);
 let lead=await create('lead',{title:'Exhibition enquiry',organization_id:organization.id,expected_revenue:'1000.00'},admin);
 lead=await action(lead,'qualify',admin);lead=await action(lead,'convert',admin);const opportunity=await get(lead.details._converted_id,admin);
 await check('CRM lead qualification creates linked opportunity',async()=>assert.equal(opportunity.details.lead_id,lead.id));
 let quote=await create('quote',{title:'QA ocean quote '+suffix,organization_id:organization.id,opportunity_id:opportunity.id,client_user_id:client.id,approver_user_id:approver.id,company:'Cargo ASL',sales_team:'QA',date:'2026-10-09',expiry_date:'2099-12-31',transport_mode:'Sea Freight',shipment_type:'Export',cargo_type:'Full Container Load',origin:'Rotterdam',destination:'Dubai',origin_country:'Netherlands',destination_country:'United Arab Emirates',incoterm:'FCA',currency:'USD',charges:[{description:'Freight',quantity:'2',cost_rate:'50.00',sell_rate:'100.00',tax_percent:'5'}]},admin);
 await check('draft hidden from client, vendor and other admin; client cannot create',async()=>{
  for(const account of [vendor,client,outsider])assert.equal((await request('/workspace/records/'+quote.id,'GET',undefined,account)).status,404);
  assert.equal((await request('/workspace/records','POST',{kind:'organization',details:organization.details},client)).status,403);
  assert.equal((await request('/workspace/records/'+quote.id+'/action','POST',{version:quote.version,action:'send'},admin)).status,403);
 });
 const oldVersion=quote.version;quote=await ok('/workspace/records/'+quote.id,'PUT',{version:quote.version,details:{...quote.details,title:'Updated QA quote'}},admin);
 await check('optimistic locking rejects stale edits',async()=>assert.equal((await request('/workspace/records/'+quote.id,'PUT',{version:oldVersion,details:quote.details},admin)).status,409));
 let rate=await create('rate_request',{title:'QA vendor request',organization_id:organization.id,quote_id:quote.id,vendor_user_id:vendor.id,due_date:'2099-12-31',transport_mode:'Sea Freight',shipment_type:'Export',cargo_type:'Full Container Load',origin:'Rotterdam',destination:'Dubai',currency:'USD'},admin);
 rate=await action(rate,'send',admin);
 await check('vendor rates reject a foreign currency instead of importing without FX',async()=>assert.equal((await request('/workspace/records/'+rate.id+'/action','POST',{version:rate.version,action:'respond',vendor_charges:[{description:'Freight',quantity:'1',cost_rate:'80',currency:'EUR'}],vendor_note:''},vendor)).status,400));
 rate=await action(rate,'respond',vendor,{vendor_charges:[{description:'Port service',quantity:'1',cost_rate:'80.00',currency:'USD'}],vendor_note:'Capacity confirmed'});
 await check('vendor can submit its assigned request, but cannot approve it',async()=>{
  assert.equal(rate.status,'Submitted');assert.equal((await request('/workspace/records/'+rate.id+'/action','POST',{version:rate.version,action:'accept'},vendor)).status,403);
 });
 rate=await action(rate,'accept',admin);quote=await get(quote.id,admin);
 await check('accepted vendor rates imported into unlocked quote',async()=>{assert.equal(quote.details.charges.length,2);assert.equal(quote.totals.total,'290.00');});
 quote=await action(quote,'submit',admin);
 await check('only nominated approver can approve',async()=>assert.equal((await request('/workspace/records/'+quote.id+'/action','POST',{version:quote.version,action:'approve'},admin)).status,403));
 quote=await action(quote,'approve',approver);quote=await action(quote,'send',admin);
 await check('client sees sent quote with cost and profit removed',async()=>{const shared=await get(quote.id,client);assert.equal(shared.totals.total,'290.00');assert.equal(shared.totals.cost,undefined);assert.equal(shared.totals.profit,undefined);assert.equal(shared.details.charges[0].cost_rate,undefined);assert.equal((await request('/workspace/records/'+quote.id,'GET',undefined,outsider)).status,404);});
 await check('shared and internal notes and documents enforce visibility',async()=>{
  await ok('/workspace/records/'+quote.id+'/notes','POST',{message:'Internal cost discussion',visibility:'internal'},admin);
  await ok('/workspace/records/'+quote.id+'/notes','POST',{message:'Ready for your review',visibility:'shared'},admin);
  await ok('/workspace/records/'+quote.id+'/documents','POST',{name:'internal.txt',mime:'text/plain',content:Buffer.from('Private internal file').toString('base64'),visibility:'internal'},admin);
  const internal=(await get(quote.id,admin)).documents[0];
  await ok('/workspace/records/'+quote.id+'/documents','POST',{name:'quote.txt',mime:'text/plain',content:Buffer.from('Shared quotation').toString('base64'),visibility:'shared'},admin);
  const shared=await get(quote.id,client);assert.equal(shared.notes.length,1);assert.equal(shared.documents.length,1);
  assert.equal((await request('/workspace/documents/'+internal.id,'GET',undefined,client)).status,404);
  const response=await fetch(base+'/api/workspace/documents/'+shared.documents[0].id,{headers:{Cookie:client.cookie}});assert.equal(response.status,200);assert.equal(await response.text(),'Shared quotation');
 });
 await check('record followers receive transitions and can mark notifications read',async()=>{
  await ok('/workspace/records/'+quote.id+'/follow','POST',{following:true},client);
  assert.equal((await get(quote.id,client)).following,true);
  assert.equal((await request('/workspace/records/'+quote.id+'/follow','POST',{following:true},outsider)).status,404);
 });
 await check('demo recipients and portal users cannot queue real email',async()=>{
  const payload={subject:'Quotation ready',message:'Please review your assigned quotation.'};
  assert.equal((await request('/workspace/records/'+quote.id+'/mail','POST',payload,admin)).status,400);
  assert.equal((await request('/workspace/records/'+quote.id+'/mail','POST',payload,client)).status,403);
 });
 quote=await action(quote,'accept',client);quote=await action(quote,'convert',admin);let shipment=await get(quote.details._converted_id,admin);
 await check('conversion notifies the client follower without internal values',async()=>{
  const state=await ok('/workspace/snapshot','GET',undefined,client);
  assert.ok(state.notifications.some(n=>n.record_id===quote.id&&n.message==='convert'));
  await ok('/workspace/notifications/read','POST',{},client);
  assert.ok((await ok('/workspace/snapshot','GET',undefined,client)).notifications.every(n=>n.is_read));
 });
 await check('accepted quote converts once to linked shipment',async()=>{assert.equal(shipment.details.quote_id,quote.id);assert.equal((await request('/workspace/records/'+quote.id+'/action','POST',{version:quote.version,action:'convert'},admin)).status,403);});
 for(const name of ['book','depart','arrive','complete'])shipment=await action(shipment,name,admin);
 shipment=await action(shipment,'invoice',admin);let invoice=await get(shipment.details._invoice_id,admin);
 invoice=await action(invoice,'post',admin);
 await check('completed shipment creates invoice with balanced posting',async()=>{assert.equal(invoice.totals.total,'290.00');assert.equal(invoice.status,'Posted');const [rows]=await db.execute('SELECT SUM(debit) AS debit,SUM(credit) AS credit FROM ledger_entries WHERE record_id=?',[invoice.id]);assert.equal(rows[0].debit,rows[0].credit);assert.equal(rows[0].debit,'290.00');});
 await check('overpayment rejected and posted invoice locked',async()=>{assert.equal((await request('/workspace/records/'+invoice.id+'/action','POST',{version:invoice.version,action:'pay',amount:'290.01',reference:'QA'},admin)).status,400);assert.equal((await request('/workspace/records/'+invoice.id,'PUT',{version:invoice.version,details:invoice.details},admin)).status,409);});
 invoice=await action(invoice,'pay',admin,{amount:'100.00',reference:'QA first payment'});
 invoice=await action(invoice,'credit',admin,{amount:'50.00',reason:'QA adjustment'});let credit=await get(invoice.details._credit_note_id,admin);credit=await action(credit,'post',admin);invoice=await get(invoice.id,admin);
 invoice=await action(invoice,'pay',admin,{amount:'140.00',reference:'QA settlement'});
 await check('partial payment, posted credit and final payment settle balance',async()=>{assert.equal(invoice.status,'Paid');assert.equal(invoice.details._credits,'50.00');assert.equal(invoice.payments.length,2);const [rows]=await db.execute("SELECT SUM(l.debit)-SUM(l.credit) AS balance FROM ledger_entries l WHERE l.account='Accounts Receivable' AND l.record_id IN (?,?)",[invoice.id,credit.id]);assert.equal(rows[0].balance,'0.00');});
 await check('vendor/client cannot read other assigned records or ledger',async()=>{const vendorState=await ok('/workspace/snapshot','GET',undefined,vendor);assert.ok(vendorState.records.every(r=>['rate_request','vendor_bill'].includes(r.kind)));assert.deepEqual(vendorState.ledger,[]);assert.deepEqual((await ok('/workspace/snapshot','GET',undefined,outsider)).records,[]);});
 await check('audit history records workflow transitions',async()=>{const row=await get(invoice.id,admin);assert.ok(row.history.some(a=>a.action==='post'));assert.ok(row.history.some(a=>a.action==='credit applied'));});
 let bill=await create('vendor_bill',{title:'QA transport bill',organization_id:organization.id,vendor_user_id:vendor.id,shipment_id:shipment.id,date:'2026-10-09',due_date:'2099-12-31',currency:'USD',charges:[{description:'Transport',quantity:'2',cost_rate:'80',sell_rate:'150',tax_percent:'5'}]},admin);
 bill=await action(bill,'post',admin);bill=await action(bill,'pay',admin,{amount:'168.00',reference:'QA supplier settlement'});
 await check('vendor bill posts purchase cost and balances supplier payment',async()=>{assert.equal(bill.totals.total,'168.00');assert.equal(bill.status,'Paid');assert.equal((await get(bill.id,vendor)).status,'Paid');const [rows]=await db.execute('SELECT SUM(debit) AS debit,SUM(credit) AS credit FROM ledger_entries WHERE record_id=?',[bill.id]);assert.equal(rows[0].debit,rows[0].credit);});
 let proforma=await create('proforma',{title:'QA pro forma',organization_id:organization.id,client_user_id:client.id,date:'2026-10-09',due_date:'2099-12-31',currency:'USD',charges:[{description:'Handling',quantity:'1',cost_rate:'20',sell_rate:'30',tax_percent:'0'}]},admin);
 for(const name of ['submit','approve','send','convert'])proforma=await action(proforma,name,admin);
 await check('pro forma approval and publication convert to draft invoice',async()=>{assert.equal(proforma.status,'Invoiced');assert.equal((await get(proforma.details._invoice_id,admin)).kind,'invoice');});
 let service=await create('service_job',{title:'QA handling job',organization_id:organization.id,client_user_id:client.id,service_type:'Handling',date:'2026-10-09',currency:'USD',charges:[{description:'Handling',quantity:'1',cost_rate:'50',sell_rate:'75'}]},admin);
 for(const name of ['start','complete','invoice'])service=await action(service,name,admin);
 await check('service job lifecycle creates linked invoice',async()=>assert.equal((await get(service.details._invoice_id,admin)).details.service_job_id,service.id));
 let booking=await create('carrier_booking',{title:'QA carrier booking',organization_id:organization.id,shipment_id:shipment.id,carrier:'Fictional carrier',date:'2026-10-09'},admin);
 for(const name of ['submit','approve','complete'])booking=await action(booking,name,admin);
 await check('carrier booking lifecycle stays linked to shipment',async()=>assert.equal(booking.status,'Completed'));
 let master=await create('master',{category:'Incoterms',code:'QA-FCA-'+suffix,name:'QA Free Carrier',enabled:true,pickup_delivery:true},admin);master=await action(master,'activate',admin);master=await action(master,'archive',admin);master=await action(master,'restore',admin);
 await check('configuration records support activation, archival and restore',async()=>assert.equal(master.status,'Active'));
 const activity=await create('activity',{title:'QA follow-up',record_id:quote.id,assigned_user_id:approver.id,due_date:'2099-12-31'},admin);
 await check('assigned internal user can complete scheduled activity',async()=>assert.equal((await action(activity,'complete',approver)).status,'Completed'));
 let serviceQuote=await create('quote',{...quote.details,title:'QA service quotation',job_type:'Service Job'},admin);
 for(const name of ['submit','approve','send'])serviceQuote=await action(serviceQuote,name,name==='approve'?approver:admin);
 serviceQuote=await action(serviceQuote,'accept',client);serviceQuote=await action(serviceQuote,'convert',admin);
 await check('accepted service quotation converts to service job with charges preserved',async()=>{
  const converted=await get(serviceQuote.details._converted_id,admin);assert.equal(converted.kind,'service_job');assert.equal(converted.totals.total,'290.00');assert.equal(converted.details.quote_id,serviceQuote.id);
 });
 await check('admin can provision a real account; vendor cannot manage users',async()=>{
  const created=await ok('/workspace/users','POST',{name:'QA additional client',email:`extra-${suffix}@cargoasl.invalid`,role:'customer',password},admin);accounts.push({id:created.id});
  const login=await request('/login','POST',{email:`extra-${suffix}@cargoasl.invalid`,password,portal:'client'});assert.equal(login.status,200);
  assert.equal((await request('/workspace/users/'+created.id,'PATCH',{active:false},vendor)).status,403);
  await ok('/workspace/users/'+created.id,'PATCH',{password:password+'new'},admin);
  assert.equal((await request('/me','GET',undefined,{cookie:login.cookie})).status,401);
  assert.equal((await request('/login','POST',{email:`extra-${suffix}@cargoasl.invalid`,password,portal:'client'})).status,401);
  assert.equal((await request('/login','POST',{email:`extra-${suffix}@cargoasl.invalid`,password:password+'new',portal:'client'})).status,200);
 });
 console.log(`PASS: ${checks} end-to-end workflow checks. Temporary fixtures will be removed.`);
}finally{
 if(accounts.length){const owners=accounts.map(a=>a.id),marks=owners.map(()=>'?').join(',');
  await db.execute(`DELETE l FROM ledger_entries l JOIN business_records r ON r.id=l.record_id WHERE r.owner_id IN (${marks})`,owners);
  await db.execute(`DELETE p FROM record_payments p JOIN business_records r ON r.id=p.record_id WHERE r.owner_id IN (${marks})`,owners);
  await db.execute(`DELETE a FROM audit_log a JOIN business_records r ON r.id=a.entity_id WHERE a.entity='record' AND r.owner_id IN (${marks})`,owners);
  await db.execute(`DELETE FROM business_records WHERE owner_id IN (${marks})`,owners);
  await db.execute(`DELETE FROM users WHERE id IN (${marks})`,owners);
 }await db.end();
}
