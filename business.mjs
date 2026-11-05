export const masterCategories = ['Incoterms','Carriers','Carrier Agents','HS Codes','UN/LOCODE Locations','Commodities','Custom Locations','Client Tags','Email Templates','Carrier Service Types','Charges','Languages','Container Categories','Container Types','MAWB Stocks','Status Change Reasons','Serial Numbers','Ports','Trucks','Location Types','Warehouses','Countries','States','Country Groups','Cities','Shipment Change Reasons','Service Job Types','Custom BE Types','Vessels','Vessel Categories','Companies','Departments','Groups','Sales Teams','Lead Stages','Opportunity Stages','Lead Sources','Quote Templates','Container Numbers','Document Templates'];
const f=(key,label,type='text',required=false)=>({key,label,type,required});
const shared=[f('title','Title','text',true),f('organization_id','Organization','ref:organization',true)];
const route=[f('transport_mode','Transport mode','enum:Sea Freight|Air Freight|Road Freight|Rail Freight',true),f('shipment_type','Shipment type','enum:Export|Import|Cross Trade|Domestic|International|Permanent Import/Export|Temporary Import/Export|ATA Carnets',true),f('cargo_type','Cargo type','enum:Full Container Load|Less Container Load|Break Bulk|Bulk|General Cargo',true),f('origin','Origin','text',true),f('destination','Destination','text',true)];
const currencies='enum:USD|AED|INR|EUR|GBP|SGD';
export const cargoTypes={
 'Sea Freight':['Break Bulk','Bulk','Courier','Full Container Load','Less Container Load','Liquid','Roll On/Roll Off'],
 'Air Freight':['Loose','Courier','ULD','UNA'],
 'Road Freight':["Buyer's Consolidation",'Courier','Full Truck Load','Less Truck Load'],
 'Rail Freight':['Break Bulk','Bulk','Full Container Load','Less Container Load']
};
route[2].type='enum:'+ [...new Set(Object.values(cargoTypes).flat()),'General Cargo'].join('|');
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
 packages:[f('type','Package / container type','text',true),f('count','Count','integer',true),f('commodity','Commodity'),f('weight','Gross weight','decimal'),f('weight_unit','Weight unit','enum:g|oz|lb|kg|t'),f('length','Length','decimal'),f('width','Width','decimal'),f('height','Height','decimal'),f('dimension_unit','Dimension unit','enum:mm|cm|in|ft|m|km|mi'),f('volume','Volume m³','decimal'),f('teu','TEU','decimal'),f('hs_code','HS code'),f('hazardous','Hazardous','boolean'),f('description','Goods description','long')],
 addresses:[f('type','Type','enum:Office|Billing|Pickup|Delivery',true),f('street','Street','text',true),f('city','City'),f('country','Country'),f('contact','Contact'),f('phone','Phone')],
 parties:[f('type','Party type','text',true),f('name','Party','text',true),f('address','Address')],
 routing:[f('description','Description','text',true),f('transporter','Transporter'),f('identification','Transport ID'),f('mode','Mode',route[0].type),f('origin','From','text',true),f('destination','To','text',true)],
 milestones:[f('container','Container number'),f('event','Event','text',true),f('place','Place','text',true),f('estimated','Estimated date','date'),f('actual','Actual date','date')]
};
specs.carrier_booking={label:'Carrier Bookings',prefix:'CB',module:'Operations',fields:[...shared,f('shipment_id','Shipment','ref:shipment',true),f('carrier','Carrier','text',true),f('carrier_reference','Carrier reference'),f('date','Booking date','date',true),f('departure','Departure date','date'),f('arrival','Arrival date','date'),f('notes','Notes','long')]};
specs.quote_request={label:'Quote Inquiries',prefix:'RFQ',module:'Sales & CRM',fields:[f('title','Reference / title','text',true),f('client_user_id','Client account','user:customer',true),f('contact_name','Customer name','text',true),f('email','Customer email','email',true),f('address','Customer address','long',true),f('date','Date','date',true),...route,f('origin_country','Origin country','text',true),f('destination_country','Destination country','text',true),f('incoterm','Incoterm'),f('pickup','Pickup location','text',true),f('delivery','Delivery location','text',true),f('pickup_contact','Pickup contact','text',true),f('delivery_contact','Delivery contact','text',true),f('pickup_at','Pickup date & time','datetime',true),f('delivery_at','Delivery date & time','datetime',true),f('service_type','Service type','enum:Standard|Priority',true),f('cargo_specification','Cargo specification','long',true),f('dangerous','Hazardous','boolean'),f('stackable','Stackable','boolean'),f('temperature','Temperature control','boolean'),f('special_consideration','Special consideration','long')]};
rowSpecs.courierGoods=[f('product','Product','text',true),f('quantity','Quantity','decimal',true),f('uom','Quantity UOM'),f('po_number','PO number'),f('invoice_number','Invoice number'),f('order_date','Order date','date'),f('description','Description'),f('hs_code','HS code'),f('unit_price','Unit price','money'),f('currency','Currency',currencies),f('lot_code','Lot code'),f('production_date','Production date','date'),f('expiration_date','Expiration date','date')];
specs.courier={label:'Courier Shipments',prefix:'COU',module:'Operations',fields:[f('title','Shipment reference','text',true),f('client_user_id','Client account','user:customer',true),f('date','Date','date',true),f('logistic_id','Logistic ID','text',true),f('logistic_partner','Logistic partner'),f('shipper','Shipper'),f('consignee','Consignee'),f('tracking_url','Cargo tracking URL','url'),f('goods','Goods','rows:courierGoods'),f('notes','Notes','long')]};
specs.quote_request.fields.push(f('packages','Packages / dimensions','rows:packages'));
rowSpecs.legs=[f('id','Leg ID','text',true),f('mode','Transport mode',route[0].type,true),f('cargo_type','Cargo type',route[2].type,true),f('origin','From','text',true),f('destination','To','text',true),f('origin_country','Origin country','text',true),f('destination_country','Destination country','text',true),f('carrier','Carrier'),f('departure','Planned departure','date'),f('arrival','Planned arrival','date')];
for(const kind of ['quote_request','quote','shipment','invoice','proforma']){
 if(!specs[kind].fields.some(field=>field.key==='multimodal'))specs[kind].fields.push(f('multimodal','Multimodal journey','boolean'));
 specs[kind].fields.push(f('legs','Journey legs','rows:legs'));
}
rowSpecs.charges.push(f('leg_id','Journey leg'));
for(const kind of ['rate_request','carrier_booking','vendor_bill'])specs[kind].fields.push(f('leg_id','Journey leg'));
export const portalFields=Object.fromEntries(['quote_request','courier'].map(kind=>[kind,specs[kind].fields.filter(field=>field.key!=='client_user_id')]));
specs.quote.fields.push(f('source_request_id','Source inquiry','ref:quote_request'));
specs.quote.fields.push(f('approval_required','Require internal approval before publication','boolean'));
specs.quote.fields.push(f('revised_from_id','Revised from quotation','ref:quote'));
specs.quote.fields.push(f('contact_name','Customer name'),f('email','Customer email','email'),f('address','Customer address','long'));
specs.rate_request.fields.push(f('validity_date','Vendor validity date','date'));
specs.shipment.fields.push(f('sales_agent_id','Sales agent','user:erp'));
specs.target.fields=specs.target.fields.map(field=>['month','revenue'].includes(field.key)?{...field,required:false}:field);
specs.target.fields.push(f('reporting_manager_id','Reporting manager','user:erp'),f('date_from','Target from','date'),f('date_to','Target to','date'),f('parameter','Target parameter','enum:Weight|Volume|Gross Revenue|Gross Margin|Quotation|TEUs'),f('value','Target value','decimal'),...route.slice(0,3).map(field=>({...field,required:false})),f('incentive','Incentive','enum:Amount|Percentage'),f('incentive_unit','Incentive unit','decimal'),f('incentive_unit_type','Incentive unit type','enum:NET PROFIT|GROSS REVENUE|FREIGHT AMOUNT'),f('company','Company'),f('monthly_targets','Monthly targets','rows:monthlyTargets'));
rowSpecs.monthlyTargets=[f('period','Period','month',true),f('parameter','Parameter','enum:Weight|Volume|Gross Revenue|Gross Margin|Quotation|TEUs',true),f('value','Target value','decimal',true)];
for(const kind of ['quote','shipment'])specs[kind].fields.push(f('pickup_contact','Pickup contact'),f('delivery_contact','Delivery contact'),f('pickup_at','Pickup date & time','datetime'),f('delivery_at','Delivery date & time','datetime'),f('cargo_specification','Cargo specification','long'),f('service_type','Service priority','enum:Standard|Priority'),f('special_consideration','Special consideration','long'));
specs.invoice_request={label:'Vendor Invoice Requests',prefix:'VIR',module:'Accounting',fields:[...shared,f('shipment_id','House shipment','ref:shipment',true),f('vendor_user_id','Vendor account','user:vendor',true),f('date','Request date','date',true),f('currency','Currency',currencies,true),f('requested_charges','Requested charges','rows:vendorCharges',true),f('notes','Instructions','long')]};
specs.invoice_request.fields.push(f('leg_id','Journey leg'));
rowSpecs.requestInvoices=[f('bill_number','Bill number','text',true),f('bill_date','Bill date','date',true),f('currency','Currency',currencies,true),f('total','Total','money',true)];
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
   if(type==='datetime'&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'Z'))||new Date(value+'Z').toISOString().slice(0,16)!==value))throw new Error(`${label} must be a valid date and time.`);
   if(type==='url'){let url;try{url=new URL(value);}catch{}if(!url||!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error(`${label} must be an HTTP(S) URL without credentials.`);}
   if(type==='month'&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))throw new Error(`${label} must be YYYY-MM.`);
   if(type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error(`${label} is invalid.`);
   if(type.startsWith('enum:')&&!type.slice(5).split('|').includes(value))throw new Error(`${label} is not an allowed option.`);
   if(['money','decimal','percent','integer'].includes(type)){const pattern=type==='integer'?/^\d{1,9}$/:type==='money'?/^\d{1,9}(\.\d{1,2})?$/:/^\d{1,9}(\.\d{1,4})?$/;if(!pattern.test(value))throw new Error(`${label} must be a non-negative number with valid precision.`);if(type==='percent'&&Number(value)>100)throw new Error(`${label} cannot exceed 100.`);}
  }result[field.key]=value;
 }return result;
}
export function normalizeJourneyRoute(input){
 if(input?.multimodal!==true||!Array.isArray(input.legs)||!input.legs.length)return input;
 const first=input.legs[0],last=input.legs.at(-1);return {...input,transport_mode:first?.mode,cargo_type:first?.cargo_type,origin:first?.origin,origin_country:first?.origin_country,destination:last?.destination,destination_country:last?.destination_country};
}
export function validateRecord(kind,input){
 if(!Object.hasOwn(specs,kind))throw new Error('Unknown record type.');
 const data=validateFields(normalizeJourneyRoute(input),specs[kind].fields);
 validateJourney(data);
 if(kind==='quote'&&data.multimodal&&data.job_type==='Service Job')throw new Error('Multimodal journeys require a shipment quotation.');
 if(['rate_request','carrier_booking','invoice_request','vendor_bill'].includes(kind)&&data.leg_id&&!data.quote_id&&!data.shipment_id)throw new Error('A journey leg requires a linked quotation or shipment.');
 for(const [from,to]of [['date','expiry_date'],['valid_from','valid_to']])if(data[from]&&data[to]&&data[from]>data[to])throw new Error('End date cannot precede start date.');
 if(data.pickup_at&&data.delivery_at&&data.pickup_at>data.delivery_at)throw new Error('Delivery cannot precede pickup.');
 if(data.transport_mode&&data.cargo_type&&data.cargo_type!=='General Cargo'&&!cargoTypes[data.transport_mode]?.includes(data.cargo_type))throw new Error('Cargo type is not available for this transport mode.');
 for(const row of data.packages||[]){
  if(Number(row.count)<=0)throw new Error('Package count must be positive.');
  const dimensions=['length','width','height'].filter(key=>row[key]!==undefined);
  if(dimensions.length&&(dimensions.length!==3||!row.dimension_unit||dimensions.some(key=>Number(row[key])<=0)))throw new Error('Provide positive length, width and height with a dimension unit.');
  if(row.weight!==undefined&&!row.weight_unit)row.weight_unit='kg';
 }
 for(const row of data.goods||[]){if(Number(row.quantity)<=0)throw new Error('Goods quantity must be positive.');if(row.production_date&&row.expiration_date&&row.production_date>row.expiration_date)throw new Error('Goods expiration cannot precede production.');}
 for(const row of data.requested_charges||[])if(Number(row.quantity)<=0||row.currency!==data.currency)throw new Error('Requested charges require a positive quantity and the request currency.');
 if(kind==='target'){
  if(data.date_from||data.date_to||data.parameter||data.value!==undefined){if(!data.date_from||!data.date_to||!data.parameter||data.value===undefined)throw new Error('Provide both target dates, a parameter and target value.');if(data.date_from>data.date_to)throw new Error('Target end cannot precede start.');const months=(Number(data.date_to.slice(0,4))-Number(data.date_from.slice(0,4)))*12+Number(data.date_to.slice(5,7))-Number(data.date_from.slice(5,7))+1;if(months>120)throw new Error('Targets may cover at most 120 months.');}
  else if(!data.month||data.revenue===undefined)throw new Error('Provide a target date range or a legacy monthly revenue target.');
  const periods=(data.monthly_targets||[]).map(row=>row.period);if(new Set(periods).size!==periods.length)throw new Error('Monthly target periods must be unique.');
 }
 for(const row of [...(data.charges||[]),...(data.vendor_charges||[])]){if(Number(row.quantity)<=0)throw new Error('Charge quantity must be positive.');if(row.exchange_rate!==undefined&&Number(row.exchange_rate)<=0)throw new Error('Exchange rate must be positive.');if(row.currency&&row.currency!==data.currency&&!row.exchange_rate)throw new Error('An exchange rate is required for a different line currency.');}
 if(data.charges){const amounts=documentTotals(kind,data.charges);if(['cost','revenue','tax','total'].some(key=>scaled(amounts[key])>999999999999999999n))throw new Error('Document amounts exceed the supported accounting limit.');}
 return data;
}
export function validateJourney(data){
 const legs=data.legs||[];
 if(!data.multimodal){if(legs.length)throw new Error('Enable multimodal before adding journey legs.');return;}
 if(legs.length<2)throw new Error('A multimodal journey requires at least two legs.');
 if(data.pickup_at&&legs[0].departure&&data.pickup_at.slice(0,10)>legs[0].departure)throw new Error('Pickup cannot be after the first departure.');
 if(data.delivery_at&&legs.at(-1).arrival&&data.delivery_at.slice(0,10)<legs.at(-1).arrival)throw new Error('Delivery cannot be before the final arrival.');
 if(new Set(legs.map(leg=>leg.mode)).size<2)throw new Error('Use at least two transport modes.');
 const ids=new Set(),same=(a,b)=>a?.trim().toLowerCase()===b?.trim().toLowerCase();
 for(let i=0;i<legs.length;i++){
  const leg=legs[i];if(!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(leg.id)||ids.has(leg.id))throw new Error('Journey leg IDs must be unique and use letters, digits, underscores or hyphens.');ids.add(leg.id);
  if(!cargoTypes[leg.mode]?.includes(leg.cargo_type))throw new Error('Select a valid cargo type for each journey leg.');
  if(same(leg.origin,leg.destination)&&same(leg.origin_country,leg.destination_country))throw new Error('A journey leg must connect different locations.');
  if(leg.departure&&leg.arrival&&leg.departure>leg.arrival)throw new Error('Leg arrival cannot precede departure.');
  const previous=legs[i-1];if(previous){if(!same(previous.destination,leg.origin)||!same(previous.destination_country,leg.origin_country))throw new Error('Each leg must start where the previous leg ends.');if(previous.arrival&&leg.departure&&previous.arrival>leg.departure)throw new Error('A connecting leg cannot depart before the previous arrival.');}
 }
 for(const line of data.charges||[])if(!ids.has(line.leg_id))throw new Error('Assign every charge to a valid journey leg.');
}
export function advanceJourney(legs,progress,legId,event,at){
 const index=legs.findIndex(leg=>leg.id===legId);if(index<0)throw new Error('Journey leg not found.');
 const transitions={Draft:{book:'Booked'},Booked:{depart:'In Transit'},'In Transit':{arrive:'Arrived'},Arrived:{complete:'Completed'}};
 const state=progress[legId]?.state||'Draft';if(typeof event!=='string'||!Object.hasOwn(transitions[state]||{},event))throw new Error('This leg transition is not allowed.');const next=transitions[state][event];
 if(event==='depart'&&index>0&&progress[legs[index-1].id]?.state!=='Completed')throw new Error('Complete the previous leg before departing.');
 const updated={...progress,[legId]:{state:next,updated_at:at}},states=legs.map(leg=>updated[leg.id]?.state||'Draft');
 const status=states.every(s=>s==='Completed')?'Completed':states.every(s=>['Arrived','Completed'].includes(s))?'Arrived':states.some(s=>['In Transit','Arrived','Completed'].includes(s))?'In Transit':states.some(s=>s==='Booked')?'Booked':'Draft';
 return {progress:updated,status};
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
workflows.rate_request.Pending.save_rates='Pending';
for(const status of ['Draft','Booked','In Transit','Arrived'])workflows.shipment[status].advance_leg=status;
workflows.quote.Draft.send='Sent';
workflows.quote.Renegotiate.send='Sent';
for(const status of ['Rejected','Expired','Cancelled'])workflows.quote[status]={revise:status};
workflows.carrier_booking={Draft:{submit:'Pending',cancel:'Cancelled'},Pending:{approve:'Confirmed',cancel:'Cancelled'},Confirmed:{complete:'Completed',cancel:'Cancelled'}};
workflows.quote_request={Draft:{submit:'Submitted',cancel:'Cancelled'},Submitted:{prepare:'Quoted',reject:'Rejected'},Quoted:{}};
workflows.courier={Draft:{book:'Booked',cancel:'Cancelled'},Booked:{depart:'In Transit',cancel:'Cancelled'},'In Transit':{complete:'Completed'}};
workflows.invoice_request={Draft:{send:'Pending Vendor Bill Upload'},'Pending Vendor Bill Upload':{upload:'Vendor Invoice Upload - Approval Pending'},'Vendor Invoice Upload - Approval Pending':{approve:'Vendor Invoice Approved',reject:'Vendor Invoice Rejected'},'Vendor Invoice Rejected':{upload:'Vendor Invoice Upload - Approval Pending'}};
for(const status of ['Pending Vendor Bill Upload','Vendor Invoice Rejected'])Object.assign(workflows.invoice_request[status],{save_invoice_draft:status,submit_invoice_draft:'Vendor Invoice Upload - Approval Pending'});
for(const status of ['Draft','Active'])Object.assign(workflows.target[status],{generate_months:status,recompute:status});
export function canRead(record,user){
 if(user.role==='erp')return record.owner_id===user.id||record.details.approver_user_id===user.id||record.details.responsible_user_id===user.id||record.details.assigned_user_id===user.id||record.kind==='master';
 if(user.role==='vendor')return ['rate_request','vendor_bill','invoice_request'].includes(record.kind)&&record.details.vendor_user_id===user.id&&record.status!=='Draft';
 if(['quote_request','courier'].includes(record.kind))return record.details.client_user_id===user.id;
 if(['shipment','service_job'].includes(record.kind))return record.details.client_user_id===user.id;
 return ['quote','shipment','service_job','invoice','proforma','credit_note'].includes(record.kind)&&record.details.client_user_id===user.id&&(record.kind==='quote'?record.details._published===true||record.details._portal_inquiry===true:!['Draft','To Approve','Approved','Cancelled'].includes(record.status));
}
export function actionsFor(record,user){
 if(!canRead(record,user))return [];
 let actions=Object.keys(workflows[record.kind]?.[record.status]||{});
 if(user.role==='vendor')return record.kind==='rate_request'?actions.filter(a=>['respond','save_rates'].includes(a)):record.kind==='invoice_request'?actions.filter(a=>['upload','save_invoice_draft'].includes(a)||(a==='submit_invoice_draft'&&record.details._invoice_draft)):[];
 if(user.role==='customer')return record.kind==='quote'?actions.filter(a=>['accept','reject','renegotiate'].includes(a)):[];
 if(record.owner_id!==user.id){
  if(record.kind==='quote'&&record.details.approver_user_id===user.id&&['To Approve','Pricing Team Approval'].includes(record.status))return actions.filter(a=>['approve','reject'].includes(a));
  if(record.kind==='activity'&&record.details.assigned_user_id===user.id)return actions.filter(a=>a==='complete');
  return [];
 }
 actions=actions.filter(a=>!['upload','save_rates','save_invoice_draft','submit_invoice_draft'].includes(a)&&(!['respond','accept','renegotiate'].includes(a)||record.kind==='rate_request'));
 if(record.kind==='quote'&&record.status==='Sent')actions=actions.filter(a=>a!=='reject');
 if(record.kind==='quote'&&['Draft','Renegotiate'].includes(record.status))actions=actions.filter(a=>a!=='send'||record.details.approval_required===false);
 if(record.kind==='quote'&&record.details._revision_id)actions=actions.filter(a=>a!=='revise');
 if(record.kind==='shipment')actions=record.details.multimodal?actions.filter(a=>!['book','depart','arrive','complete'].includes(a)):actions.filter(a=>a!=='advance_leg');
 if(record.kind==='quote')actions=actions.filter(a=>!['approve','reject'].includes(a)||record.details.approver_user_id===user.id);
 return actions;
}
export const editable=record=>['Draft','Active','Renegotiate','Qualified','In Progress','Booked','In Transit','Arrived'].includes(record.status);
export const canEdit=(record,user)=>user.role==='erp'&&record.owner_id===user.id&&editable(record);
