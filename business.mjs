export const masterCategories = ['Incoterms','Carriers','Carrier Agents','HS Codes','UN/LOCODE Locations','Commodities','Custom Locations','Client Tags','Email Templates','Carrier Service Types','Charges','Languages','Container Categories','Container Types','MAWB Stocks','Status Change Reasons','Serial Numbers','Ports','Trucks','Location Types','Warehouses','Countries','States','Country Groups','Cities','Shipment Change Reasons','Service Job Types','Custom BE Types','Vessels','Vessel Categories','Companies','Departments','Groups','Sales Teams','Lead Stages','Opportunity Stages','Lead Sources','Quote Templates','Container Numbers','Document Templates'];
const f=(key,label,type='text',required=false)=>({key,label,type,required});
const shared=[f('title','Title','text',true),f('organization_id','Organization','ref:organization',true)];
const route=[f('transport_mode','Transport mode','enum:Sea Freight|Air Freight|Road Freight|Rail Freight',true),f('shipment_type','Shipment type','enum:Export|Import|Cross Trade|Domestic|Temporary Import/Export|ATA Carnets',true),f('cargo_type','Cargo type','enum:Full Container Load|Less Container Load|Break Bulk|Bulk|General Cargo',true),f('origin','Origin','text',true),f('destination','Destination','text',true)];
const currencies='enum:USD|AED|INR|EUR|GBP';
export const specs={
 organization:{label:'Organizations',prefix:'ORG',module:'Organizations',fields:[f('name','Name','text',true),f('company_type','Type','enum:Company|Individual',true),f('party_type','Party type','enum:Customer|Vendor|Carrier|Agent|Shipper|Consignee',true),f('email','Email','email'),f('phone','Phone'),f('street','Street'),f('street2','Street 2'),f('city','City'),f('state','State'),f('zip','ZIP'),f('country','Country'),f('vat','VAT'),f('uen','UEN'),f('website','Website'),f('contact','Contact person'),f('registration','Registration number'),f('reference','Internal reference'),f('tags','Tags'),f('payment_terms','Payment terms'),f('credit_limit','Credit limit','money'),f('addresses','Addresses','rows:addresses'),f('notes','Internal notes','long')]},
 prospect:{label:'Prospects',prefix:'PROS',module:'Sales & CRM',fields:[...shared,f('contact','Contact'),f('email','Email','email'),f('phone','Phone'),f('source','Source'),f('notes','Notes','long')]},
 lead:{label:'Leads',prefix:'LEAD',module:'Sales & CRM',fields:[...shared,f('contact','Contact'),f('email','Email','email'),f('phone','Phone'),f('source','Source'),f('priority','Priority','enum:Normal|High|Urgent'),f('expected_revenue','Expected revenue','money'),f('next_contact','Next contact','date'),f('notes','Notes','long')]},
 opportunity:{label:'Opportunities',prefix:'OPP',module:'Sales & CRM',fields:[...shared,f('lead_id','From lead','ref:lead'),f('expected_revenue','Expected revenue','money'),f('probability','Probability %','percent'),f('expected_close','Expected close','date'),f('sales_agent_id','Sales agent','user:erp'),f('notes','Notes','long')]},
 quote:{label:'Quotations',prefix:'QUO',module:'Sales & CRM',fields:[...shared,f('opportunity_id','Opportunity','ref:opportunity'),f('client_user_id','Client portal account','user:customer',true),f('approver_user_id','Approver','user:erp',true),f('sales_agent_id','Sales agent','user:erp'),f('company','Company','text',true),f('sales_team','Sales team','text',true),f('date','Quote date','date',true),f('expiry_date','Expiry date','date',true),...route,f('incoterm','Incoterm','text',true),f('currency','Currency',currencies,true),f('origin_country','Origin country','text',true),f('destination_country','Destination country','text',true),f('origin_port','Origin port / airport'),f('destination_port','Destination port / airport'),f('carrier','Carrier'),f('vessel','Vessel / flight / vehicle'),f('pickup','Pickup location'),f('pickup_date','Pickup date','date'),f('delivery','Delivery location'),f('delivery_date','Delivery date','date'),f('shipper','Shipper'),f('consignee','Consignee'),f('courier','Courier','boolean'),f('multimodal','Multimodal','boolean'),f('dangerous','Dangerous goods','boolean'),f('temperature','Temperature controlled','boolean'),f('stackable','Stackable','boolean'),f('goods_value','Goods value','money'),f('insurance_value','Insurance value','money'),f('gross_weight','Gross weight kg','decimal'),f('net_weight','Net weight kg','decimal'),f('volume','Volume m³','decimal'),f('packages','Packages','rows:packages'),f('charges','Charges','rows:charges',true),f('terms','Terms & conditions','long'),f('notes','Remarks','long')]},
 rate_request:{label:'Rate Requests',prefix:'RR',module:'Sales & CRM',fields:[...shared,f('opportunity_id','Opportunity','ref:opportunity'),f('quote_id','Quotation','ref:quote'),f('vendor_user_id','Vendor account','user:vendor',true),f('due_date','Due date','date',true),...route,f('currency','Currency',currencies,true),f('packages','Packages','rows:packages'),f('vendor_charges','Vendor rates','rows:vendorCharges'),f('notes','Instructions','long'),f('vendor_note','Vendor remarks','long')]},
 shipment:{label:'House Shipments',prefix:'SHP',module:'Operations',fields:[...shared,f('quote_id','Quotation','ref:quote'),f('client_user_id','Client account','user:customer',true),f('responsible_user_id','Responsible','user:erp'),f('booking_reference','Booking reference','text',true),f('date','Shipment date','date',true),...route,f('currency','Currency',currencies,true),f('incoterm','Incoterm'),f('shipper','Shipper'),f('consignee','Consignee'),f('carrier','Carrier'),f('origin_port','Origin port / airport'),f('destination_port','Destination port / airport'),f('etd','ETD','date'),f('atd','ATD','date'),f('eta','ETA','date'),f('ata','ATA','date'),f('pickup','Pickup location'),f('delivery','Delivery location'),f('courier','Courier shipment','boolean'),f('dangerous','Dangerous goods','boolean'),f('insured','Insured','boolean'),f('insurance_value','Insurance value','money'),f('customs_required','Customs required','boolean'),f('customs_reference','Customs / ATA carnet reference'),f('custom_duty','Customs duty','money'),f('goods_value','Declared value','money'),f('gross_weight','Gross weight kg','decimal'),f('net_weight','Net weight kg','decimal'),f('volume','Volume m³','decimal'),f('co2_kg','CO2 kg','decimal'),f('po_reference','Purchase order reference'),f('po_status','PO status','enum:Pending|Confirmed'),f('parties','Parties','rows:parties'),f('packages','Packages','rows:packages'),f('routing','Routing','rows:routing'),f('milestones','Milestones','rows:milestones'),f('charges','Revenue & cost charges','rows:charges'),f('terms','Terms & conditions','long'),f('notes','Remarks','long')]},
 service_job:{label:'Service Jobs',prefix:'JOB',module:'Operations',fields:[...shared,f('quote_id','Quotation','ref:quote'),f('client_user_id','Client account','user:customer',true),f('service_type','Service type','text',true),f('date','Job date','date',true),f('due_date','Due date','date'),f('currency','Currency',currencies,true),f('responsible_user_id','Responsible','user:erp'),f('charges','Charges','rows:charges'),f('notes','Instructions','long')]},
 invoice:{label:'Invoices',prefix:'INV',module:'Accounting',fields:[...shared,f('shipment_id','Shipment','ref:shipment'),f('service_job_id','Service job','ref:service_job'),f('client_user_id','Client account','user:customer',true),f('date','Invoice date','date',true),f('due_date','Due date','date',true),f('currency','Currency',currencies,true),f('charges','Invoice lines','rows:charges',true),f('notes','Notes','long')]},
 proforma:{label:'Pro Forma Invoices',prefix:'PF',module:'Accounting',fields:[...shared,f('shipment_id','Shipment','ref:shipment'),f('service_job_id','Service job','ref:service_job'),f('client_user_id','Client account','user:customer',true),f('date','Date','date',true),f('due_date','Due date','date',true),f('currency','Currency',currencies,true),f('charges','Charges','rows:charges',true),f('notes','Notes','long')]},
 vendor_bill:{label:'Vendor Bills',prefix:'BILL',module:'Accounting',fields:[...shared,f('vendor_user_id','Vendor account','user:vendor',true),f('shipment_id','Shipment','ref:shipment'),f('date','Bill date','date',true),f('due_date','Due date','date',true),f('currency','Currency',currencies,true),f('charges','Bill lines','rows:charges',true),f('notes','Notes','long')]},
 credit_note:{label:'Credit Notes',prefix:'CN',module:'Accounting',fields:[...shared,f('invoice_id','Invoice','ref:invoice',true),f('client_user_id','Client account','user:customer',true),f('date','Date','date',true),f('currency','Currency',currencies,true),f('amount','Credit amount','money',true),f('reason','Reason','long',true)]},
 tariff:{label:'Tariffs',prefix:'TAR',module:'Administration',fields:[f('name','Name','text',true),f('tariff_type','Tariff type','enum:Sell|Buy',true),f('transport_mode','Transport mode',route[0].type,true),f('origin','Origin','text',true),f('destination','Destination','text',true),f('valid_from','Valid from','date',true),f('valid_to','Valid to','date',true),f('currency','Currency',currencies,true),f('charges','Charges','rows:charges',true)]},
 target:{label:'Sales Targets',prefix:'TGT',module:'Sales & CRM',fields:[f('title','Title','text',true),f('sales_agent_id','Sales agent','user:erp',true),f('month','Month YYYY-MM','month',true),f('currency','Currency',currencies,true),f('revenue','Revenue target','money',true),f('quotes','Quote target','integer'),f('notes','Notes','long')]},
 master:{label:'Master Data',prefix:'CFG',module:'Administration',fields:[f('category','Category',`enum:${masterCategories.join('|')}`,true),f('code','Code','text',true),f('name','Name','text',true),f('enabled','Enabled','boolean'),f('pickup_delivery','Enable pickup & delivery','boolean'),f('description','Description / template','long')]},
 activity:{label:'Activities',prefix:'ACT',module:'Dashboard',fields:[f('title','Title','text',true),f('record_id','Related record','record',true),f('assigned_user_id','Assigned to','user:erp',true),f('due_date','Due date','date',true),f('notes','Notes','long')]}
};
export const rowSpecs={
 charges:[f('description','Description','text',true),f('quantity','Quantity','decimal',true),f('cost_rate','Cost rate','money',true),f('sell_rate','Sell rate','money',true),f('tax_percent','Tax %','percent'),f('exchange_rate','Exchange rate','decimal'),f('currency','Line currency',currencies),f('note','Note')],
 vendorCharges:[f('description','Description','text',true),f('quantity','Quantity','decimal',true),f('cost_rate','Rate','money',true),f('currency','Currency',currencies),f('note','Note')],
 packages:[f('type','Package / container type','text',true),f('count','Count','integer',true),f('commodity','Commodity'),f('weight','Weight kg','decimal'),f('volume','Volume m³','decimal'),f('teu','TEU','decimal')],
 addresses:[f('type','Type','enum:Office|Billing|Pickup|Delivery',true),f('street','Street','text',true),f('city','City'),f('country','Country'),f('contact','Contact'),f('phone','Phone')],
 parties:[f('type','Party type','text',true),f('name','Party','text',true),f('address','Address')],
 routing:[f('description','Description','text',true),f('transporter','Transporter'),f('identification','Transport ID'),f('mode','Mode',route[0].type),f('origin','From','text',true),f('destination','To','text',true)],
 milestones:[f('container','Container number'),f('event','Event','text',true),f('place','Place','text',true),f('estimated','Estimated date','date'),f('actual','Actual date','date')]
};
specs.carrier_booking={label:'Carrier Bookings',prefix:'CB',module:'Operations',fields:[...shared,f('shipment_id','Shipment','ref:shipment',true),f('carrier','Carrier','text',true),f('carrier_reference','Carrier reference'),f('date','Booking date','date',true),f('departure','Departure date','date'),f('arrival','Arrival date','date'),f('notes','Notes','long')]};
specs.quote.fields.splice(3,0,f('job_type','Quote for','enum:Shipment|Service Job'));
specs.shipment.fields.push(f('paid_place','Paid place'),f('place_issue','Place of issue'),f('place_receipt','Place of receipt'),f('place_delivery','Place of delivery'),f('originals','Originals','integer'),f('copies','Copies','integer'),f('cargo_received','Cargo received date','date'),f('issue_date','Issue date','date'),f('receipt_date','Receipt date','date'),f('onboard_date','Ship onboard date','date'),f('cutoff_date','Port cut-off date','date'),f('customer_reference','Customer reference'),f('commercial_invoice','Commercial invoice'),f('payment_terms','Payment terms','enum:Prepaid|Collect'),f('free_days','Free days','integer'),f('marks','Marks & numbers','long'),f('instructions','Instructions','long'));
export function validateFields(input,fields){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Details must be an object.');
 const result={};
 for(const field of fields){let value=input[field.key];const {type,label,required}=field;
  if(value===undefined||value===null||value===''){if(required)throw new Error(`${label} is required.`);continue;}
  if(type.startsWith('rows:')){if(!Array.isArray(value)||value.length>100||(required&&!value.length))throw new Error(`${label} requires 1–100 lines.`);value=value.map(row=>validateFields(row,rowSpecs[type.slice(5)]));}
  else if(type==='boolean'){if(typeof value!=='boolean')throw new Error(`${label} must be true or false.`);}
  else if(type.startsWith('ref:')||type.startsWith('user:')||type==='record'){if(!Number.isSafeInteger(value)||value<1)throw new Error(`${label} must be a valid selection.`);}
  else {if(typeof value!=='string'||value.length>(type==='long'?20000:2000))throw new Error(`${label} is invalid.`);value=value.trim();if(required&&!value)throw new Error(`${label} is required.`);
   if(type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))throw new Error(`${label} must be a valid date.`);
   if(type==='month'&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))throw new Error(`${label} must be YYYY-MM.`);
   if(type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error(`${label} is invalid.`);
   if(type.startsWith('enum:')&&!type.slice(5).split('|').includes(value))throw new Error(`${label} is not an allowed option.`);
   if(['money','decimal','percent','integer'].includes(type)){const pattern=type==='integer'?/^\d{1,9}$/:type==='money'?/^\d{1,9}(\.\d{1,2})?$/:/^\d{1,9}(\.\d{1,4})?$/;if(!pattern.test(value))throw new Error(`${label} must be a non-negative number with valid precision.`);if(type==='percent'&&Number(value)>100)throw new Error(`${label} cannot exceed 100.`);}
  }result[field.key]=value;
 }return result;
}
export function validateRecord(kind,input){
 if(!Object.hasOwn(specs,kind))throw new Error('Unknown record type.');
 const data=validateFields(input,specs[kind].fields);
 for(const [from,to]of [['date','expiry_date'],['valid_from','valid_to']])if(data[from]&&data[to]&&data[from]>data[to])throw new Error('End date cannot precede start date.');
 for(const row of [...(data.charges||[]),...(data.vendor_charges||[])]){if(Number(row.quantity)<=0)throw new Error('Charge quantity must be positive.');if(row.exchange_rate!==undefined&&Number(row.exchange_rate)<=0)throw new Error('Exchange rate must be positive.');if(row.currency&&row.currency!==data.currency&&!row.exchange_rate)throw new Error('An exchange rate is required for a different line currency.');}
 if(data.charges){const amounts=documentTotals(kind,data.charges);if(['cost','revenue','tax','total'].some(key=>scaled(amounts[key])>999999999999999999n))throw new Error('Document amounts exceed the supported accounting limit.');}
 return data;
}
export const scaled=(value,places=2)=>{const [whole,decimal='']=String(value||'0').split('.');if(!/^\d+$/.test(whole)||!/^\d*$/.test(decimal)||decimal.length>places)throw new Error('Invalid decimal precision.');return BigInt(whole)*10n**BigInt(places)+BigInt(decimal.padEnd(places,'0')||'0');};
export const money=value=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;
const round=(value,divisor)=>(value+divisor/2n)/divisor;
export function totals(charges=[]){
 let cost=0n,revenue=0n,tax=0n;const lines=charges.map(line=>{
  const quantity=scaled(line.quantity,4),fx=scaled(line.exchange_rate||'1',4);
  const lineCost=round(scaled(line.cost_rate||'0')*quantity*fx,100000000n),lineRevenue=round(scaled(line.sell_rate||'0')*quantity*fx,100000000n);
  const lineTax=round(lineRevenue*scaled(line.tax_percent||'0',4),1000000n);
  cost+=lineCost;revenue+=lineRevenue;tax+=lineTax;return {cost:money(lineCost),revenue:money(lineRevenue),tax:money(lineTax),total:money(lineRevenue+lineTax)};
 });
 const profit=revenue-cost;return {cost:money(cost),revenue:money(revenue),tax:money(tax),total:money(revenue+tax),profit:profit<0n?'-'+money(-profit):money(profit),margin:revenue?Number(profit*10000n/revenue)/100:0,lines};
}
export function documentTotals(kind,charges=[]){return totals(kind==='vendor_bill'?charges.map(line=>({...line,sell_rate:line.cost_rate})):charges);}
export const workflows={
 prospect:{Draft:{qualify:'Qualified',cancel:'Cancelled'}},
 lead:{Draft:{qualify:'Qualified',lose:'Lost'},Qualified:{convert:'Converted',lose:'Lost'}},
 opportunity:{Draft:{qualify:'Qualified',lose:'Lost'},Qualified:{win:'Won',lose:'Lost'}},
 organization:{Draft:{onboard:'Onboarding Form Sent',activate:'Active'},'Onboarding Form Sent':{activate:'Onboarding Form Received'},'Onboarding Form Received':{activate:'Active'},Active:{archive:'Archived'},Archived:{restore:'Active'}},
 quote:{Draft:{submit:'To Approve',pricing:'Pricing Team Approval',cancel:'Cancelled'},'To Approve':{approve:'Approved',reject:'Rejected'},'Pricing Team Approval':{approve:'Approved',reject:'Rejected'},Approved:{send:'Sent',cancel:'Cancelled'},Sent:{accept:'Accepted',reject:'Rejected',renegotiate:'Renegotiate',expire:'Expired',cancel:'Cancelled'},Renegotiate:{submit:'To Approve',cancel:'Cancelled'},Accepted:{convert:'Converted'}},
 rate_request:{Draft:{send:'Pending',cancel:'Cancelled'},Pending:{respond:'Submitted',cancel:'Cancelled'},Submitted:{accept:'Accepted',cancel:'Cancelled'}},
 shipment:{Draft:{book:'Booked',cancel:'Cancelled'},Booked:{depart:'In Transit',cancel:'Cancelled'},'In Transit':{arrive:'Arrived'},Arrived:{complete:'Completed'},Completed:{invoice:'Invoiced'}},
 service_job:{Draft:{start:'In Progress',cancel:'Cancelled'},'In Progress':{complete:'Completed'},Completed:{invoice:'Invoiced'}},
 invoice:{Draft:{post:'Posted',cancel:'Cancelled'},Posted:{pay:'Paid',credit:'Credited'},'Partially Paid':{pay:'Paid',credit:'Credited'}},
 proforma:{Draft:{submit:'To Approve',cancel:'Cancelled'},'To Approve':{approve:'Approved',reject:'Rejected'},Approved:{send:'Sent',convert:'Invoiced'},Sent:{convert:'Invoiced'}},
 vendor_bill:{Draft:{post:'Posted',cancel:'Cancelled'},Posted:{pay:'Paid'},'Partially Paid':{pay:'Paid'}},
 credit_note:{Draft:{post:'Posted',cancel:'Cancelled'}},
 activity:{Draft:{complete:'Completed',cancel:'Cancelled'}},
 tariff:{Draft:{activate:'Active',archive:'Archived'},Active:{archive:'Archived'},Archived:{restore:'Active'}},
 master:{Draft:{activate:'Active',archive:'Archived'},Active:{archive:'Archived'},Archived:{restore:'Active'}},
 target:{Draft:{activate:'Active',archive:'Archived'},Active:{archive:'Archived'}}
};
workflows.carrier_booking={Draft:{submit:'Pending',cancel:'Cancelled'},Pending:{approve:'Confirmed',cancel:'Cancelled'},Confirmed:{complete:'Completed',cancel:'Cancelled'}};
export function canRead(record,user){
 if(user.role==='erp')return record.owner_id===user.id||record.details.approver_user_id===user.id||record.details.responsible_user_id===user.id||record.details.assigned_user_id===user.id||record.kind==='master';
 if(user.role==='vendor')return ['rate_request','vendor_bill'].includes(record.kind)&&record.details.vendor_user_id===user.id&&record.status!=='Draft';
 return ['quote','shipment','service_job','invoice','proforma','credit_note'].includes(record.kind)&&record.details.client_user_id===user.id&&(record.kind==='quote'?record.details._published===true:!['Draft','To Approve','Approved','Cancelled'].includes(record.status));
}
export function actionsFor(record,user){
 if(!canRead(record,user))return [];
 let actions=Object.keys(workflows[record.kind]?.[record.status]||{});
 if(user.role==='vendor')return record.kind==='rate_request'?actions.filter(a=>a==='respond'):[];
 if(user.role==='customer')return record.kind==='quote'?actions.filter(a=>['accept','reject','renegotiate'].includes(a)):[];
 if(record.owner_id!==user.id){
  if(record.kind==='quote'&&record.details.approver_user_id===user.id&&['To Approve','Pricing Team Approval'].includes(record.status))return actions.filter(a=>['approve','reject'].includes(a));
  if(record.kind==='activity'&&record.details.assigned_user_id===user.id)return actions.filter(a=>a==='complete');
  return [];
 }
 actions=actions.filter(a=>!['respond','accept','renegotiate'].includes(a)||record.kind==='rate_request');
 if(record.kind==='quote'&&record.status==='Sent')actions=actions.filter(a=>a!=='reject');
 if(record.kind==='quote')actions=actions.filter(a=>!['approve','reject'].includes(a)||record.details.approver_user_id===user.id);
 return actions;
}
export const editable=record=>['Draft','Active','Renegotiate','Qualified','In Progress','Booked','In Transit','Arrived'].includes(record.status);
