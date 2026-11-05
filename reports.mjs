import {totals,documentTotals,scaled,money} from './business.mjs';
import {targetProgress} from './targets.mjs';
import {convert,round} from './money.mjs';
export const reportDefinitions={
 quote_status:'Quote Analysis by Status',sales_agent:'Sales Agent Report',opportunities:'Opportunity Detail Report',visits:'Customer Visit Report',quote_charges:'Charges Wise Quotation Report',customer_sales:'Sales Report by Customer',carrier_sales:'Sales Report by Shipping Lines',custom_duty:'Custom Duty Report',estimated_actual:'Charge Wise Shipment Estimated vs Actual',shipment_profit:'Shipment Profit Report',shipper:'Shipper Wise Report',customer:'Customer Wise Report',volume:'Customer Volume Report',customer_status:'Customer Status Report',emissions:'Carbon Emission Report',courier:'Courier Shipment Report',tariffs:'Tariff Validity Report',receivables:'Outstanding Receivables',payables:'Outstanding Payables'
};
reportDefinitions.target_actuals='Target vs Actual';
reportDefinitions.journeys='Multimodal Journey Progress';
export function buildReport(key,records,users=[],role='erp'){
 const quotes=records.filter(r=>r.kind==='quote'),shipments=records.filter(r=>r.kind==='shipment');
 const name=id=>records.find(r=>r.id===id)?.details.name||records.find(r=>r.details.organization_id===id&&r.organization_name)?.organization_name||`Organization ${id}`;
 const userName=id=>users.find(u=>u.id===id)?.name||`Account ${id}`;
 const ref=r=>r.number||`${r.kind.toUpperCase()}-${r.id}`;
 const result=(headers,rows)=>({headers,rows});
 const posted=doc=>['Posted','Partially Paid','Paid','Credited'].includes(doc.status);
 const linked=(doc,job)=>doc.details.shipment_id===job.id||doc.details._job_allocations?.some(a=>a.shipment_id===job.id)||records.some(s=>s.kind==='service_job'&&s.id===doc.details.service_job_id&&s.details.shipment_id===job.id);
 const actual=(doc,job,value)=>{const allocations=doc.details._job_allocations,a=allocations?.find(a=>a.shipment_id===job.id);let native=scaled(value);if(a){let used=0n;for(const [i,part]of allocations.entries()){const share=i===allocations.length-1?scaled(value)-used:round(scaled(value)*scaled(part.share,4),1000000n);used+=share;if(part===a){native=share;break;}}}return scaled(convert(money(native),a?.job_exchange_rate||doc.details.job_exchange_rate||'1'));};
 if(key==='journeys')return result(['Shipment','Leg','Mode','Cargo type','From','To','Carrier','Planned departure','Planned arrival','Leg status','Journey status'],shipments.filter(r=>r.details.multimodal).flatMap(r=>r.details.legs.map(leg=>[ref(r),leg.id,leg.mode,leg.cargo_type,leg.origin,leg.destination,leg.carrier||'',leg.departure||'',leg.arrival||'',r.details._leg_progress?.[leg.id]?.state||'Draft',r.status])));
 if(key==='target_actuals')return result(['Target','Sales agent','Period','Parameter','Currency','Target value','Actual value','Variance','Achievement %'],records.filter(r=>r.kind==='target'&&r.status!=='Archived').flatMap(r=>targetProgress(r.details,records).map(line=>[r.details.title,userName(r.details.sales_agent_id),line.period,line.parameter,['Gross Revenue','Gross Margin'].includes(line.parameter)?r.details.currency:'',line.value,line.actual,line.variance,line.achievement??'—'])));
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
 if(key==='custom_duty')return result(['Shipment','Customer','Origin','Destination','Currency','Customs reference','Released duty assessment'],shipments.map(r=>{const entries=records.filter(c=>c.kind==='customs_entry'&&c.details.shipment_id===r.id&&c.status==='Released'),duty=entries.length?money(entries.reduce((s,c)=>s+scaled(convert(c.details.assessed_duty||c.details.duty_amount||'0',c.details.job_exchange_rate||'1')),0n)):r.details.custom_duty||'0.00';return [ref(r),name(r.details.organization_id),r.details.origin,r.details.destination,r.details.currency,entries.map(c=>c.details.release_reference).join(', ')||r.details.customs_reference||'',duty];}));
 if(key==='estimated_actual')return result(['Shipment','Charge','Currency','Estimated cost','Estimated revenue','Actual billed cost','Actual invoiced revenue'],shipments.flatMap(r=>{
  const groups=new Map(),add=(label,column,amount)=>{const values=groups.get(label)||[0n,0n,0n,0n];values[column]+=amount;groups.set(label,values);};
  for(const line of r.details.charges||[]){const t=totals([line]),label=(line.leg_id?line.leg_id+' · ':'')+line.description;add(label,0,scaled(t.cost));add(label,1,scaled(t.revenue));}
  for(const doc of records.filter(d=>linked(d,r)&&posted(d))){
   if(!['invoice','vendor_bill'].includes(doc.kind))continue;
   for(const line of doc.details.charges||[])add((line.leg_id?line.leg_id+' · ':'')+line.description,doc.kind==='vendor_bill'?2:3,actual(doc,r,documentTotals(doc.kind,[line]).revenue));
   if(scaled(doc.details._net_credits||'0'))add(doc.kind==='invoice'?'Invoice credits (unallocated)':'Supplier credits (unallocated)',doc.kind==='invoice'?3:2,-actual(doc,r,doc.details._net_credits));
  }
  const signed=value=>value<0n?'-'+money(-value):money(value);
  return [...groups].map(([label,values])=>[ref(r),label,r.details.currency,role==='erp'?signed(values[0]):'',signed(values[1]),role==='erp'?signed(values[2]):'',signed(values[3])]);
 }));
 if(key==='shipment_profit')return result(['Shipment','Customer','Currency','Estimated cost','Estimated revenue','Actual billed cost','Actual invoiced revenue','Actual profit'],shipments.map(r=>{
  const estimate=totals(r.details.charges||[]);const docs=records.filter(d=>linked(d,r)&&posted(d));
  const actualCost=docs.filter(d=>d.kind==='vendor_bill').reduce((sum,d)=>sum+actual(d,r,money(scaled(documentTotals('vendor_bill',d.details.charges).revenue)-scaled(d.details._net_credits||'0'))),0n);
  const actualRevenue=docs.filter(d=>d.kind==='invoice').reduce((sum,d)=>sum+actual(d,r,money(scaled(totals(d.details.charges).revenue)-scaled(d.details._net_credits||'0'))),0n);
  const profit=actualRevenue-actualCost;
  return [ref(r),name(r.details.organization_id),r.details.currency,role==='erp'?estimate.cost:'',estimate.revenue,role==='erp'?money(actualCost):'',money(actualRevenue),role==='erp'?(profit<0n?'-'+money(-profit):money(profit)):''];
 }));
 if(key==='volume')return result(['Shipment','Customer','Gross weight kg','Net weight kg','Volume m³','TEU'],shipments.map(r=>[ref(r),name(r.details.organization_id),r.details.gross_weight||'0',r.details.net_weight||'0',r.details.volume||'0',r.details.teu??(r.details.packages||[]).reduce((sum,p)=>sum+Number(p.teu||0)*Number(p.count||0),0)]));
 if(key==='emissions')return result(['Shipment','Customer','Route','Status','CO2 kg'],shipments.map(r=>[ref(r),name(r.details.organization_id),r.details.origin+' → '+r.details.destination,r.status,r.details.co2_kg||'0']));
 if(key==='courier')return result(['Shipment','Logistic ID / booking reference','Logistic partner','Shipper','Consignee','Status'],[...shipments.filter(r=>r.details.courier),...records.filter(r=>r.kind==='courier')].map(r=>[ref(r),r.details.logistic_id||r.details.booking_reference,r.details.logistic_partner||r.details.carrier||'',r.details.shipper||'',r.details.consignee||'',r.status]));
 if(key==='tariffs')return result(['Tariff','Type','Origin','Destination','From','To','Status'],records.filter(r=>r.kind==='tariff').map(r=>[r.details.name,r.details.tariff_type,r.details.origin,r.details.destination,r.details.valid_from,r.details.valid_to,r.status]));
 if(key==='receivables'||key==='payables')return result(['Document','Organization','Currency','Total','Paid','Credits','Outstanding','Due date','Status'],records.filter(r=>r.kind===(key==='receivables'?'invoice':'vendor_bill')&&['Posted','Partially Paid'].includes(r.status)).map(r=>{const gross=scaled(documentTotals(r.kind,r.details.charges).total),paid=scaled(r.paid_amount||'0'),credits=scaled(r.details._credits||'0');return [ref(r),name(r.details.organization_id),r.details.currency,money(gross),money(paid),money(credits),money(gross-paid-credits),r.details.due_date,r.status];}));
 throw new Error('Unknown report.');
}
