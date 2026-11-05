import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {testSession,quoteData,acceptedJob,confirmedBooking,approveDocuments,delivery,day} from './freight-test-helpers.mjs';
const t=await testSession(),stamp=Date.now(),results=[];
try{
 const org=await t.create('organization',{name:'QA Juniper Freight '+stamp,company_type:'Company',party_type:'Customer',address:'28 Example Road, Abu Dhabi',email:'qa@cargoasl.invalid',vat:'100000000000002'});
 let job=await acceptedJob(t,quoteData({title:'Release Road FTL '+stamp,org,roles:t.roles}));
 await confirmedBooking(t,job);job=await t.action(job,'book');
 await t.rejected('admin','/workspace/records/'+job.id+'/action','POST',{version:job.version,action:'depart'},409);
 job=await approveDocuments(t,job);job=await t.action(job,'depart');job=await t.action(job,'arrive');
 await t.rejected('admin','/workspace/records/'+job.id+'/action','POST',{version:job.version,action:'complete'},409);
 await delivery(t,job);job=await t.action(job,'complete');assert.equal(job.status,'Completed');
 let req=await t.create('invoice_request',{title:'Release supplier '+stamp,organization_id:org.id,shipment_id:job.id,vendor_user_id:t.roles.vendor.id,date:day,currency:'AED',requested_charges:[{description:'Freight',quantity:'1',cost_rate:'100',currency:'AED'}]});req=await t.action(req,'send');const pdf=await t.proof(req,'Fictional vendor invoice AED 105 VAT 5');
 req=await t.action(req,'upload',{invoices:[{bill_number:'REL-'+stamp,bill_date:day,currency:'AED',total:'105',tax_amount:'5',document:{name:'supplier.pdf',mime:'application/pdf',content:pdf.toString('base64')}}]},'vendor');req=await t.action(req,'approve');let bill=await t.get(req.details._bill_ids[0]);bill=await t.action(bill,'post');assert.equal(bill.totals.revenue,'100.00');assert.equal(bill.totals.tax,'5.00');assert.notEqual(bill.details.organization_id,org.id);
 const snap=await t.snapshot(),bank=snap.records.find(r=>r.kind==='financial_account'&&r.status==='Active'&&r.details.account_type==='Bank'&&r.details.currency==='AED');bill=await t.action(bill,'pay',{amount:bill.totals.total,reference:'QA supplier transfer',account_id:bank.id});assert.equal(bill.status,'Paid');
 job=await t.action(job,'invoice');let invoice=await t.get(job.details._invoice_id);invoice=await t.action(invoice,'post');invoice=await t.action(invoice,'pay',{amount:invoice.totals.total,reference:'QA client receipt',account_id:bank.id});assert.equal(invoice.status,'Paid');
 results.push({name:'Road FTL full lifecycle',status:'PASS',job:job.id,bill:bill.id,invoice:invoice.id,checks:t.checks()});
 console.log(JSON.stringify(results));
}finally{await mkdir(new URL('../.local/production-tests/',import.meta.url),{recursive:true});await writeFile(new URL('../.local/production-tests/release-smoke.json',import.meta.url),JSON.stringify(results,null,2));await t.close();}
