import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateTargetMonths,targetProgress} from '../targets.mjs';
import {validateRecord} from '../business.mjs';
const target={title:'Quarterly freight',sales_agent_id:7,currency:'USD',date_from:'2026-10-15',date_to:'2026-12-31',parameter:'Gross Revenue',value:'1000'};
test('monthly allocation preserves the declared total without floating point loss',()=>{
 const rows=generateTargetMonths(target);assert.deepEqual(rows.map(r=>r.period),['2026-10','2026-11','2026-12']);assert.deepEqual(rows.map(r=>r.value),['333.3334','333.3333','333.3333']);
 assert.equal(generateTargetMonths({...target,date_from:'0099-12-01',date_to:'0100-01-01'}).length,2);
 assert.equal(generateTargetMonths({...target,date_from:'9999-12-01',date_to:'9999-12-31'}).length,1);
});
test('target actuals respect agent, route, date boundaries, status and currency',()=>{
 const shipment={kind:'shipment',status:'Booked',details:{date:'2026-10-20',sales_agent_id:7,currency:'USD',transport_mode:'Air Freight',charges:[{quantity:'2',cost_rate:'80',sell_rate:'100'}]}};
 const rows=targetProgress({...target,transport_mode:'Air Freight'},[shipment,{...shipment,details:{...shipment.details,date:'2026-10-01'}},{...shipment,details:{...shipment.details,sales_agent_id:8}},{...shipment,details:{...shipment.details,currency:'EUR'}},{...shipment,status:'Cancelled'}]);
 assert.equal(rows[0].actual,'200.0000');assert.equal(rows[0].variance,'-133.3334');assert.equal(rows[1].actual,'0.0000');
 assert.equal(targetProgress({...target,parameter:'Gross Margin'},[shipment])[0].actual,'40.0000');
});
test('weight, volume, TEU and quotation metrics use their own quantities',()=>{
 const shipment={kind:'shipment',status:'Booked',details:{date:'2026-10-20',sales_agent_id:7,gross_weight:'125.5000',volume:'12.2500',packages:[{count:'3',teu:'2'}]}};
 for(const [parameter,expected]of [['Weight','125.5000'],['Volume','12.2500'],['TEUs','6.0000']])assert.equal(targetProgress({...target,parameter},[shipment])[0].actual,expected);
 assert.equal(targetProgress({...target,parameter:'Quotation'},[shipment,{kind:'quote',status:'Converted',details:shipment.details}])[0].actual,'1.0000');
});
test('legacy monthly targets remain valid; incomplete or excessive ranges are rejected',()=>{
 assert.equal(validateRecord('target',{title:'Legacy',sales_agent_id:7,currency:'USD',month:'2026-11',revenue:'100'}).revenue,'100');
 assert.throws(()=>validateRecord('target',{...target,date_to:undefined}));assert.throws(()=>validateRecord('target',{...target,date_to:'2040-01-01'}));
 assert.throws(()=>validateRecord('target',{...target,monthly_targets:[{period:'2026-11',parameter:'Weight',value:'1'},{period:'2026-11',parameter:'Weight',value:'2'}]}));
});
