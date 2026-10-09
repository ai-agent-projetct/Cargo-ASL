import {totals,documentTotals,scaled,money} from './business.mjs';
export const reportDefinitions={
 quote_status:'Quote Analysis by Status',sales_agent:'Sales Agent Report',opportunities:'Opportunity Detail Report',visits:'Customer Visit Report',quote_charges:'Charges Wise Quotation Report',customer_sales:'Sales Report by Customer',carrier_sales:'Sales Report by Shipping Lines',custom_duty:'Custom Duty Report',estimated_actual:'Charge Wise Shipment Estimated vs Actual',shipment_profit:'Shipment Profit Report',shipper:'Shipper Wise Report',customer:'Customer Wise Report',volume:'Customer Volume Report',customer_status:'Customer Status Report',emissions:'Carbon Emission Report',courier:'Courier Shipment Report',tariffs:'Tariff Validity Report',receivables:'Outstanding Receivables',payables:'Outstanding Payables'
};
export function buildReport(key,records,users=[],role='erp'){
 const quotes=records.filter(r=>r.kind==='quote'),shipments=records.filter(r=>r.kind==='shipment');
 const name=id=>records.find(r=>r.id===id)?.details.name||`Organization ${id}`;
 const userName=id=>users.find(u=>u.id===id)?.name||`Account ${id}`;
 const ref=r=>r.number||`${r.kind.toUpperCase()}-${r.id}`;
 const result=(headers,rows)=>({headers,rows});
 function grouped(rows,dimension){const groups=new Map();for(const record of rows){const label=dimension(record),currency=record.details.currency||'',index=label+'\0'+currency;let entry=groups.get(index);if(!entry){entry={label,currency,count:0,revenue:0n,cost:0n};groups.set(index,entry);}const total=documentTotals(record.kind,record.details.charges||[]);entry.count++;entry.revenue+=scaled(total.revenue);entry.cost+=scaled(total.cost);}return result(['Group','Currency','Count','Revenue','Cost','Profit'],[...groups.values()].map(g=>[g.label,g.currency,g.count,money(g.revenue),role==='erp'?money(g.cost):'',role==='erp'?(g.revenue>=g.cost?money(g.revenue-g.cost):'-'+money(g.cost-g.revenue)):'']));}
 if(key==='quote_status')return grouped(quotes,r=>r.status);
 if(key==='sales_agent')return grouped(quotes,r=>userName(r.details.sales_agent_id));
 if(key==='customer_sales'||key==='customer')return grouped(shipments,r=>name(r.details.organization_id));
 if(key==='carrier_sales')return grouped(shipments,r=>r.details.carrier||'Not assigned');
 if(key==='shipper')return grouped(shipments,r=>r.details.shipper||'Not assigned');
 if(key==='customer_status')return grouped(shipments,r=>name(r.details.organization_id)+' / '+r.status);
 if(key==='opportunities')return result(['Opportunity','Title','Organization','Status','Expected revenue','Expected close','Probability %'],records.filter(r=>r.kind==='opportunity').map(r=>[ref(r),r.details.title,name(r.details.organization_id),r.status,r.details.expected_revenue||'0',r.details.expected_close||'',r.details.probability||'0']));
 if(key==='visits')return result(['Activity','Title','Related record','Due date','Assigned to','Status'],records.filter(r=>r.kind==='activity').map(r=>[ref(r),r.details.title,r.details.record_id,r.details.due_date,userName(r.details.assigned_user_id),r.status]));
 if(key==='quote_charges')return result(['Quotation','Charge','Currency','Quantity','Cost','Revenue','Tax','Total'],quotes.flatMap(r=>(r.details.charges||[]).map(line=>{const t=totals([line]);return [ref(r),line.description,r.details.currency,line.quantity,role==='erp'?t.cost:'',t.revenue,t.tax,t.total];})));
 if(key==='custom_duty')return result(['Shipment','Customer','Origin','Destination','Currency','Customs reference','Duty'],shipments.map(r=>[ref(r),name(r.details.organization_id),r.details.origin,r.details.destination,r.details.currency,r.details.customs_reference||'',r.details.custom_duty||'0.00']));
 if(key==='estimated_actual')return result(['Shipment','Charge','Currency','Estimated cost','Estimated revenue','Actual billed cost','Actual invoiced revenue'],shipments.flatMap(r=>{
  const groups=new Map(),add=(label,column,amount)=>{const values=groups.get(label)||[0n,0n,0n,0n];values[column]+=amount;groups.set(label,values);};
  for(const line of r.details.charges||[]){const t=totals([line]);add(line.description,0,scaled(t.cost));add(line.description,1,scaled(t.revenue));}
  for(const doc of records.filter(d=>d.details.shipment_id===r.id&&d.details.currency===r.details.currency&&['Posted','Partially Paid','Paid','Credited'].includes(d.status))){
   if(!['invoice','vendor_bill'].includes(doc.kind))continue;
   for(const line of doc.details.charges||[])add(line.description,doc.kind==='vendor_bill'?2:3,scaled(documentTotals(doc.kind,[line]).revenue));
   if(doc.kind==='invoice'&&scaled(doc.details._net_credits||'0'))add('Invoice credits (unallocated)',3,-scaled(doc.details._net_credits));
  }
  const signed=value=>value<0n?'-'+money(-value):money(value);
  return [...groups].map(([label,values])=>[ref(r),label,r.details.currency,role==='erp'?signed(values[0]):'',signed(values[1]),role==='erp'?signed(values[2]):'',signed(values[3])]);
 }));
 if(key==='shipment_profit')return result(['Shipment','Customer','Currency','Estimated cost','Estimated revenue','Actual billed cost','Actual invoiced revenue','Actual profit'],shipments.map(r=>{
  const estimate=totals(r.details.charges||[]);const docs=records.filter(d=>d.details.shipment_id===r.id&&d.details.currency===r.details.currency&&['Posted','Partially Paid','Paid','Credited'].includes(d.status));
  const actualCost=docs.filter(d=>d.kind==='vendor_bill').reduce((sum,d)=>sum+scaled(documentTotals('vendor_bill',d.details.charges).revenue),0n);
  const actualRevenue=docs.filter(d=>d.kind==='invoice').reduce((sum,d)=>sum+scaled(totals(d.details.charges).revenue)-scaled(d.details._net_credits||'0'),0n);
  const profit=actualRevenue-actualCost;
  return [ref(r),name(r.details.organization_id),r.details.currency,role==='erp'?estimate.cost:'',estimate.revenue,role==='erp'?money(actualCost):'',money(actualRevenue),role==='erp'?(profit<0n?'-'+money(-profit):money(profit)):''];
 }));
 if(key==='volume')return result(['Shipment','Customer','Gross weight kg','Net weight kg','Volume m³','TEU'],shipments.map(r=>[ref(r),name(r.details.organization_id),r.details.gross_weight||'0',r.details.net_weight||'0',r.details.volume||'0',(r.details.packages||[]).reduce((sum,p)=>sum+Number(p.teu||0)*Number(p.count||0),0)]));
 if(key==='emissions')return result(['Shipment','Customer','Route','Status','CO2 kg'],shipments.map(r=>[ref(r),name(r.details.organization_id),r.details.origin+' → '+r.details.destination,r.status,r.details.co2_kg||'0']));
 if(key==='courier')return result(['Shipment','Booking reference','Carrier','Shipper','Consignee','Status'],shipments.filter(r=>r.details.courier).map(r=>[ref(r),r.details.booking_reference,r.details.carrier||'',r.details.shipper||'',r.details.consignee||'',r.status]));
 if(key==='tariffs')return result(['Tariff','Type','Origin','Destination','From','To','Status'],records.filter(r=>r.kind==='tariff').map(r=>[r.details.name,r.details.tariff_type,r.details.origin,r.details.destination,r.details.valid_from,r.details.valid_to,r.status]));
 if(key==='receivables'||key==='payables')return result(['Document','Organization','Currency','Total','Paid','Credits','Outstanding','Due date','Status'],records.filter(r=>r.kind===(key==='receivables'?'invoice':'vendor_bill')&&['Posted','Partially Paid'].includes(r.status)).map(r=>{const gross=scaled(documentTotals(r.kind,r.details.charges).total),paid=scaled(r.paid_amount||'0'),credits=scaled(r.details._credits||'0');return [ref(r),name(r.details.organization_id),r.details.currency,money(gross),money(paid),money(credits),money(gross-paid-credits),r.details.due_date,r.status];}));
 throw new Error('Unknown report.');
}
