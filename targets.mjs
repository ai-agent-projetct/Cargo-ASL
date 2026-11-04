import {scaled,totals} from './business.mjs';
const format=value=>(value<0n?'-':'')+(value<0n?-value:value)/10000n+'.'+String((value<0n?-value:value)%10000n).padStart(4,'0');
const range=data=>{if(data.date_from)return {from:data.date_from,to:data.date_to};const end=new Date(data.month+'-01T00:00:00Z');end.setUTCMonth(end.getUTCMonth()+1);end.setUTCDate(0);return {from:data.month+'-01',to:end.toISOString().slice(0,10)};};
export function generateTargetMonths(data){
 const {from,to}=range(data),periods=[];let month=from.slice(0,7);
 while(month<=to.slice(0,7)){periods.push(month);if(periods.length>120)throw Error('Targets may cover at most 120 months.');if(month===to.slice(0,7))break;const next=new Date(month+'-01T00:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);month=next.toISOString().slice(0,7);}
 if(!periods.length)throw Error('Target end cannot precede start.');
 const total=scaled(data.value??data.revenue,4),count=BigInt(periods.length),each=total/count,remainder=total%count;
 // Equal monthly allocation is explicit; the source distribution rule has not been verified.
 return periods.map((period,index)=>({period,parameter:data.parameter||'Gross Revenue',value:format(each+(BigInt(index)<remainder?1n:0n))}));
}
export function targetProgress(data,records){
 const {from,to}=range(data),lines=data.monthly_targets?.length?data.monthly_targets:generateTargetMonths(data);
 return lines.map(line=>{
  let actual=0n;
  for(const record of records){const d=record.details,date=d.date;if(!date||date<from||date>to||date.slice(0,7)!==line.period||d.sales_agent_id!==data.sales_agent_id||['Cancelled','Rejected','Expired'].includes(record.status))continue;
   if(['transport_mode','shipment_type','cargo_type'].some(key=>data[key]&&d[key]!==data[key]))continue;
   if(line.parameter==='Quotation'){if(record.kind==='quote')actual+=10000n;continue;}
   if(record.kind!=='shipment')continue;
   if(line.parameter==='Weight')actual+=scaled(d.gross_weight||'0',4);
   else if(line.parameter==='Volume')actual+=scaled(d.volume||'0',4);
   else if(line.parameter==='TEUs')for(const row of d.packages||[])actual+=scaled(row.teu||'0',4)*BigInt(row.count||'0');
   else if(d.currency===data.currency){const t=totals(d.charges||[]);actual+=line.parameter==='Gross Margin'?scaled(t.revenue,4)-scaled(t.cost,4):scaled(t.revenue,4);}
  }
  const target=scaled(line.value,4);return {...line,actual:format(actual),variance:format(actual-target),achievement:target?Number(actual*10000n/target)/100:null};
 });
}
