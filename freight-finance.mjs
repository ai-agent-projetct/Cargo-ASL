import {scaled,money,round,convert,documentTotals,totals,creditAllocation} from './money.mjs';
import {renderFreightPdf} from './freight-documents.mjs';
async function issuedCopy(db,record,user){const job=record.details.shipment_id?await db.execute('SELECT * FROM business_records WHERE id=?',[record.details.shipment_id]):[[]];const pdf=await renderFreightPdf({...record,status:'Posted'},job[0][0],{status:'Active',details:record.details._issuer_snapshot});const [row]=await db.execute("INSERT INTO record_documents(record_id,user_id,name,mime,content,visibility) VALUES(?,?,?,'application/pdf',?,'shared')",[record.id,user.id,'issued-'+record.kind+'-'+record.id+'.pdf',pdf]);record.details._pdf_document_id=row.insertId;}
export const invoiceKey=value=>String(value).normalize('NFKC').trim().toUpperCase().replace(/\s+/gu,' ');
export async function exchangeRate(db,owner,from,to,date){
 if(from===to)return '1';
 const [rates]=await db.execute("SELECT details FROM business_records WHERE kind='currency_rate' AND owner_id=? AND status='Active' AND JSON_UNQUOTE(JSON_EXTRACT(details,'$.from_currency'))=? AND JSON_UNQUOTE(JSON_EXTRACT(details,'$.to_currency'))=? AND JSON_UNQUOTE(JSON_EXTRACT(details,'$.date'))<=? ORDER BY JSON_UNQUOTE(JSON_EXTRACT(details,'$.date')) DESC,id DESC LIMIT 1",[owner,from,to,date]);
 if(!rates.length)throw Object.assign(Error(`Configure an approved ${from} → ${to} exchange rate for ${date}.`),{status:409});
 return rates[0].details.rate;
}
export async function supplierOrganization(db,vendor,services,user){
 const [profiles]=await db.execute('SELECT organization_id FROM vendor_profiles WHERE user_id=?',[vendor]);
 if(!profiles.length)services.fail(409,'Link the vendor account to its legal supplier organization in Users & access first.');
 const supplier=await services.recordById(db,profiles[0].organization_id,user);
 if(supplier.kind!=='organization'||!['Vendor','Carrier','Agent'].includes(supplier.details.party_type))services.fail(409,'The vendor legal entity must be a Vendor, Carrier or Agent organization.');
 return supplier;
}
export async function reserveInvoice(db,record,supplierId,services){
 const key=invoiceKey(record.details.supplier_invoice_number||record.details.title);
 if(!key||key.length>200)services.fail(400,'A supplier invoice number of at most 200 characters is required.');
 try{await db.execute('INSERT INTO vendor_invoice_registry(supplier_id,invoice_key,bill_id) VALUES(?,?,?)',[supplierId,key,record.id]);}
 catch(error){if(error.code!=='ER_DUP_ENTRY')throw error;const [rows]=await db.execute('SELECT bill_id FROM vendor_invoice_registry WHERE supplier_id=? AND invoice_key=?',[supplierId,key]);if(rows[0]?.bill_id!==record.id)services.fail(409,'This supplier invoice number is already registered. Review the original bill instead of posting a duplicate.');}
}
export async function financeReferences({db,kind,data,user,services}){
 if(kind==='customs_entry'){const job=await services.recordById(db,data.shipment_id,user);data.job_exchange_rate=await exchangeRate(db,user.id,data.currency,job.details.currency,new Date().toISOString().slice(0,10));}
 if(['invoice','vendor_bill','proforma'].includes(kind)){
  const jobId=data.shipment_id||data.service_job_id;
  if(jobId){const job=await services.recordById(db,jobId,user),rate=await exchangeRate(db,user.id,data.currency,job.details.currency,data.date);if(data.job_exchange_rate&&scaled(data.job_exchange_rate,6)!==scaled(rate,6)&&!data.fx_override_reason)services.fail(400,'Explain and approve the document-to-job FX override.');data.job_exchange_rate||=rate;}
  const base=await exchangeRate(db,user.id,data.currency,'AED',data.date);if(data.base_exchange_rate&&scaled(data.base_exchange_rate,6)!==scaled(base,6)&&!data.fx_override_reason)services.fail(400,'Explain and approve the AED FX override.');data.base_exchange_rate||=base;
 }
 if(kind==='vendor_bill'){
  const supplier=await supplierOrganization(db,data.vendor_user_id,services,user);data.supplier_organization_id=supplier.id;data.organization_id=supplier.id;data.supplier_invoice_number||=data.title;
  if(data.consolidation_id){if(data.shipment_id)services.fail(400,'Bill either the consolidation or an individual house, not both.');const master=await services.recordById(db,data.consolidation_id,user);if(master.kind!=='consolidation'||master.status==='Draft'||master.status==='Cancelled')services.fail(409,'Select a sealed consolidation for shared supplier costs.');}
 }
 if(kind==='invoice_request'){const supplier=await supplierOrganization(db,data.vendor_user_id,services,user);data.supplier_organization_id=supplier.id;}
 if(kind==='purchase_credit'){const bill=await services.recordById(db,data.vendor_bill_id,user);if(bill.kind!=='vendor_bill'||bill.details.currency!==data.currency||bill.details.vendor_user_id!==data.vendor_user_id||bill.details.organization_id!==data.organization_id)services.fail(400,'Supplier credit identity and currency must match its bill.');}
}
export async function financeAction(context){
 const {db,record,input,user,services}=context,{fail,recordById,insert,save,ledger,balance}=services,d=record.details,a=input.action;
 if(record.kind==='invoice_request'&&['upload','save_invoice_draft'].includes(a)){
  const [profiles]=await db.execute('SELECT organization_id FROM vendor_profiles WHERE user_id=?',[user.id]);if(!profiles.length)fail(409,'Your vendor account needs a legal supplier organization.');
  for(const invoice of input.invoices||[]){const [duplicates]=await db.execute('SELECT bill_id FROM vendor_invoice_registry WHERE supplier_id=? AND invoice_key=?',[profiles[0].organization_id,invoiceKey(invoice.bill_number)]);if(duplicates.length)fail(409,'This supplier invoice number is already registered.');}
 }
 if(record.kind==='invoice_request'&&a==='approve'){
  if(!d.submitted_invoices?.length||d._bill_ids?.length)fail(409,'Invoices are missing or the request was already approved.');
  const supplier=await supplierOrganization(db,d.vendor_user_id,services,user);d._bill_ids=[];
  for(const invoice of d.submitted_invoices){
   const tax=scaled(invoice.tax_amount||'0'),gross=scaled(invoice.total);if(tax>gross)fail(400,'Invoice VAT cannot exceed its total.');
   const net=money(gross-tax),billData={title:invoice.bill_number,supplier_invoice_number:invoice.bill_number,organization_id:supplier.id,supplier_organization_id:supplier.id,vendor_user_id:d.vendor_user_id,shipment_id:d.shipment_id,leg_id:d.leg_id,date:invoice.bill_date,due_date:invoice.bill_date,currency:invoice.currency,charges:[{description:d.requested_charges?.length===1?d.requested_charges[0].description:'Supplier invoice '+invoice.bill_number,quantity:'1',cost_rate:net,sell_rate:'0',tax_amount:money(tax),leg_id:d.leg_id}],notes:'Approved against request '+record.id+'.'};
   const billId=await insert(db,'vendor_bill',billData,user);d._bill_ids.push(billId);
   const bill=await recordById(db,billId,user);await reserveInvoice(db,bill,supplier.id,services);
   const [copied]=await db.execute("INSERT INTO record_documents(record_id,user_id,name,mime,content,visibility) SELECT ?,?,name,mime,content,'shared' FROM record_documents WHERE id=? AND record_id=?",[billId,user.id,invoice.document_id,record.id]);if(!copied.affectedRows)fail(409,'Supporting invoice file is missing.');
  }
  d.reviewed_by=user.name;d.reviewed_at=new Date().toISOString();return {handled:true,status:'Vendor Invoice Approved'};
 }
 if(['invoice','vendor_bill'].includes(record.kind)&&a==='post'){
  if(record.kind==='invoice'&&(d.shipment_id||d.service_job_id)){const job=await recordById(db,d.service_job_id||d.shipment_id,user);const cancellation=job.status==='Cancelled'&&d.cancellation_settlement&&d.settlement_reason;if(!cancellation&&(!['Completed','Invoiced'].includes(job.status)||job.details.multimodal&&!job.details.legs.every(l=>job.details._leg_progress?.[l.id]?.state==='Completed')))fail(409,'Complete the shipment or approve an explained cancellation settlement before final invoicing.');}
  const [issuers]=await db.execute("SELECT details FROM business_records WHERE kind='company_profile' AND owner_id=? AND status='Active' ORDER BY id DESC LIMIT 1",[user.id]);
  if(process.env.NODE_ENV==='production'&&!issuers[0]?.details.verified)fail(409,'Verify the company legal and invoicing profile before posting production documents.');
  if(issuers[0])d._issuer_snapshot=issuers[0].details;d._posted_by=user.name;if(d.organization_id)d._customer_snapshot=(await recordById(db,d.organization_id,user)).details;
  const total=documentTotals(record.kind,d.charges);if(scaled(total.total)<=0n)fail(400,'Document total must be positive.');
  if(record.kind==='vendor_bill'){const supplier=await supplierOrganization(db,d.vendor_user_id,services,user);if(d.organization_id!==supplier.id)fail(409,'The bill creditor must be the vendor legal entity.');await reserveInvoice(db,record,supplier.id,services);}
  if(record.kind==='invoice'&&process.env.NODE_ENV==='production'&&scaled(total.tax)>0n&&issuers[0]?.details.vat_registered!==true)fail(409,'A VAT-registered issuer is required before charging VAT.');
  if(record.kind==='invoice'&&process.env.NODE_ENV==='production'){if(!d.supply_date||!d.tax_treatment||!d._customer_snapshot?.name||![d._customer_snapshot.street,d._customer_snapshot.address].some(Boolean))fail(409,'Complete the date of supply, tax treatment and customer legal name/address before posting.');if(d.tax_treatment!=='Standard'&&!d.tax_reason)fail(409,'Record the evidence for this tax treatment.');if(d.tax_treatment!=='Standard'&&scaled(total.tax)>0n)fail(409,'VAT charge lines conflict with the selected non-standard tax treatment.');}
  const rate=d.base_exchange_rate||await exchangeRate(db,user.id,d.currency,'AED',d.date);
  d.base_exchange_rate=rate;const gross=scaled(convert(total.total,rate)),net=scaled(convert(total.revenue,rate)),tax=gross-net;
  if(record.kind==='vendor_bill'&&d.consolidation_id){const master=await recordById(db,d.consolidation_id,user);let allocated=0n;d._job_allocations=[];for(const [i,house]of master.details.houses.entries()){const job=await recordById(db,house.shipment_id,user),portion=i===master.details.houses.length-1?scaled(total.revenue)-allocated:round(scaled(total.revenue)*scaled(house.share,4),1000000n);allocated+=portion;const fx=await exchangeRate(db,user.id,d.currency,job.details.currency,d.date);d._job_allocations.push({shipment_id:job.id,share:house.share,source_net:money(portion),job_exchange_rate:fx});}}
  d._posting={currency:'AED',gross:money(gross),net:money(net),tax:money(tax),rate,source_total:total.total};
  if(record.kind==='invoice'){await ledger(db,record,'Accounts Receivable',gross,0n,'AED');await ledger(db,record,'Sales Revenue',0n,net,'AED');await ledger(db,record,'Tax Payable',0n,tax,'AED');}
  else{await ledger(db,record,'Operating Expense',net,0n,'AED');await ledger(db,record,'Tax Recoverable',tax,0n,'AED');await ledger(db,record,'Accounts Payable',0n,gross,'AED');}
  await issuedCopy(db,record,user);
  return {handled:true,status:'Posted'};
 }
 if(['invoice','vendor_bill'].includes(record.kind)&&a==='pay'){
  const amount=services.cleanError(()=>services.validateFields({amount:input.amount},[{key:'amount',label:'Payment',type:'money',required:true}])).amount,paid=scaled(amount),outstanding=await balance(db,record);
  if(paid<=0n||paid>outstanding)fail(400,'Payment must be positive and cannot exceed the outstanding balance.');
  if(typeof input.reference!=='string'||!input.reference.trim()||input.reference.length>200)fail(400,'A payment reference is required.');
  if(!Number.isSafeInteger(input.account_id))fail(400,'Select the bank or cash journal used for this payment.');
  const account=await recordById(db,input.account_id,user);if(account.kind!=='financial_account'||account.status!=='Active'||!['Bank','Cash'].includes(account.details.account_type))fail(400,'Select an active bank or cash account.');
  const originalRate=d.base_exchange_rate||'1',paymentRate=input.payment_exchange_rate||originalRate;services.cleanError(()=>{if(scaled(paymentRate,6)<=0n)throw Error('Payment FX must be positive.');});
  const accountRate=account.details.currency===d.currency?paymentRate:await exchangeRate(db,user.id,account.details.currency,'AED',new Date().toISOString().slice(0,10));
  const accountAmount=input.account_amount||(account.details.currency===d.currency?amount:money(round(scaled(convert(amount,paymentRate))*1000000n,scaled(accountRate,6))));services.cleanError(()=>{if(scaled(accountAmount)<=0n)throw Error('Bank amount must be positive.');});
  if(account.details.currency===d.currency&&scaled(accountAmount)!==paid)fail(400,'The bank amount must match the payment in the same currency. Record bank fees as a separate explained journal.');
  const [prior]=await db.execute('SELECT COALESCE(SUM(amount),0) AS paid FROM record_payments WHERE record_id=?',[record.id]);
  const total=scaled(documentTotals(record.kind,d.charges).total),baseTotal=scaled(d._posting?.gross||convert(money(total),originalRate));
  const priorAllocated=scaled(d._paid_base||convert(prior[0].paid,originalRate))+scaled(d._base_credits||'0'),allocation=paid===outstanding?baseTotal-priorAllocated:round(baseTotal*paid,total),cash=scaled(convert(accountAmount,accountRate));
  if(cash>999999999999999999n)fail(400,'The payment exceeds the supported accounting amount.');
  await db.execute('INSERT INTO record_payments(record_id,user_id,amount,reference) VALUES(?,?,?,?)',[record.id,user.id,amount,input.reference.trim()]);
  if(record.kind==='invoice'){await ledger(db,record,account.details.name,cash,0n,'AED');await ledger(db,record,'Accounts Receivable',0n,allocation,'AED');}
  else{await ledger(db,record,'Accounts Payable',allocation,0n,'AED');await ledger(db,record,account.details.name,0n,cash,'AED');}
  const difference=record.kind==='invoice'?cash-allocation:allocation-cash;
  if(difference>0n)await ledger(db,record,'FX Gain',0n,difference,'AED');else if(difference<0n)await ledger(db,record,'FX Loss',-difference,0n,'AED');
  d._paid_base=money(scaled(d._paid_base||convert(prior[0].paid,originalRate))+allocation);d._payment_journals=[...(d._payment_journals||[]),{account_id:account.id,name:account.details.name,amount,account_amount:accountAmount,account_currency:account.details.currency,base_amount:money(cash),exchange_rate:paymentRate,account_exchange_rate:accountRate,reference:input.reference.trim()}];
  return {handled:true,status:paid===outstanding?'Paid':'Partially Paid'};
 }
 if(['credit_note','purchase_credit'].includes(record.kind)&&a==='post'){
  const purchase=record.kind==='purchase_credit',parent=await recordById(db,d.invoice_id||d.vendor_bill_id,user,true),amount=scaled(d.amount),outstanding=await balance(db,parent);if(amount<=0n||amount>outstanding)fail(400,'Credit exceeds the document balance.');d._issuer_snapshot=parent.details._issuer_snapshot;d._posted_by=user.name;
  const allocation=services.cleanError(()=>creditAllocation({...parent.details,charges:purchase?parent.details.charges.map(l=>({...l,sell_rate:l.cost_rate,sell_exchange_rate:l.cost_exchange_rate||l.exchange_rate||'1'})):parent.details.charges},d.amount));
  const priorTax=parent.details._tax_credits!==undefined?scaled(parent.details._tax_credits):scaled(parent.details._credits||'0')-scaled(parent.details._net_credits||'0');
  const sourceTotal=documentTotals(parent.kind,parent.details.charges),sourceGross=scaled(sourceTotal.total),already=scaled(parent.details._credits||'0'),baseGross=scaled(parent.details._posting?.gross||convert(sourceTotal.total,parent.details.base_exchange_rate||'1')),baseTax=scaled(parent.details._posting?.tax||convert(sourceTotal.tax,parent.details.base_exchange_rate||'1'));
  const baseAmount=already+amount===sourceGross?baseGross-scaled(parent.details._base_credits||'0'):round(baseGross*amount,sourceGross),baseTaxUsed=scaled(parent.details._base_tax_credits||'0'),tax=already+amount===sourceGross?baseTax-baseTaxUsed:[baseTax-baseTaxUsed,round(baseTax*amount,sourceGross)].reduce((a,b)=>a<b?a:b),net=baseAmount-tax;
  if(purchase){await ledger(db,record,'Accounts Payable',baseAmount,0n,'AED');await ledger(db,record,'Operating Expense',0n,net,'AED');await ledger(db,record,'Tax Recoverable',0n,tax,'AED');}
  else{await ledger(db,record,'Sales Revenue',net,0n,'AED');await ledger(db,record,'Tax Payable',tax,0n,'AED');await ledger(db,record,'Accounts Receivable',0n,baseAmount,'AED');}
  Object.assign(parent.details,{_credits:money(already+amount),_net_credits:money(scaled(parent.details._net_credits||'0')+allocation.net),_tax_credits:money(priorTax+allocation.tax),_base_credits:money(scaled(parent.details._base_credits||'0')+baseAmount),_base_tax_credits:money(baseTaxUsed+tax)});
  if(await balance(db,parent)===0n)parent.status='Credited';await save(db,parent,user,'credit applied');d._allocation={base_amount:money(baseAmount),base_tax:money(tax),source_net:money(allocation.net),source_tax:money(allocation.tax)};
  await issuedCopy(db,record,user);
  return {handled:true,status:'Posted'};
 }
 if(record.kind==='journal_entry'&&a==='post'){
  for(const line of d.lines){const account=await recordById(db,line.account_id,user);if(account.kind!=='financial_account'||account.status!=='Active'||account.details.currency!=='AED')fail(400,'Journal adjustments require active AED accounts.');await ledger(db,record,account.details.name,scaled(line.debit),scaled(line.credit),'AED');}
  return {handled:true,status:'Posted'};
 }
 return {handled:false};
}
