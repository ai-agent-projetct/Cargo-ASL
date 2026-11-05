import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateRecord,advanceJourney,actionsFor} from '../business.mjs';
import {buildReport} from '../reports.mjs';
import {journeyScenarios,landSeaLegs,railLeg,fictionalInvoicePdf} from '../scripts/fixtures/multimodal.mjs';
const intake=legs=>({title:'Fictional journey',client_user_id:7,contact_name:'Nora Vale',email:'qa@example.test',address:'Aster Yard',date:'2026-11-04',shipment_type:'Export',pickup:'Aster Yard',delivery:'Willow Terminal',pickup_contact:'Nora',delivery_contact:'Avery',pickup_at:'2026-11-10T08:00',delivery_at:'2026-11-17T16:00',service_type:'Standard',cargo_specification:'Fictional display stand',multimodal:true,legs});
for(const scenario of journeyScenarios){
 test(scenario.label+': endpoints derive from ordered legs and input remains unchanged',()=>{
  const input=intake(structuredClone(scenario.legs)),before=structuredClone(input),clean=validateRecord('quote_request',input);
  assert.equal(clean.origin,'Aster Yard');assert.equal(clean.destination,scenario.key==='land-sea'?'Copper Port':'Willow Terminal');assert.equal(clean.transport_mode,'Road Freight');assert.deepEqual(input,before);assert.deepEqual(clean.legs,scenario.legs);
 });
 test(scenario.label+': every leg completes in order and aggregate status reaches Completed',()=>{
  let progress={},result;for(const [index,leg]of scenario.legs.entries())for(const event of ['book','depart','arrive','complete']){
   result=advanceJourney(scenario.legs,progress,leg.id,event,'2026-11-04T12:00:00Z');progress=result.progress;
   if(index===0&&event==='book')assert.equal(result.status,'Booked');
   if(event==='arrive'&&index===scenario.legs.length-1)assert.equal(result.status,'Arrived');
   if(event==='complete'&&index<scenario.legs.length-1)assert.equal(result.status,'In Transit');
  }assert.equal(result.status,'Completed');assert.deepEqual(Object.values(progress).map(p=>p.state),scenario.legs.map(()=>'Completed'));
 });
}
const invalidJourneys=[
 ['missing second leg',legs=>legs.splice(1)],
 ['duplicate IDs',legs=>legs[1].id=legs[0].id],
 ['unsafe ID',legs=>legs[0].id='road:book'],
 ['disconnected locations',legs=>legs[1].origin='Different terminal'],
 ['disconnected countries',legs=>legs[1].origin_country='France'],
 ['incompatible cargo',legs=>legs[0].cargo_type='ULD'],
 ['unsupported mode',legs=>legs[0].mode='Teleport'],
 ['reversed leg dates',legs=>legs[0].arrival='2026-11-09'],
 ['departure before connection',legs=>legs[1].departure='2026-11-09'],
 ['same origin and destination',legs=>legs[0].destination=legs[0].origin],
 ['one transport mode',legs=>{legs[1].mode='Road Freight';legs[1].cargo_type='Full Truck Load';}]
];
for(const [name,mutate]of invalidJourneys)test('journey validation rejects '+name,()=>{const legs=structuredClone(landSeaLegs);mutate(legs);assert.throws(()=>validateRecord('quote_request',intake(legs)));});
test('legs cannot be hidden by disabling multimodal and must provide locations',()=>{
 assert.throws(()=>validateRecord('quote_request',{...intake(landSeaLegs),multimodal:false}));
 assert.throws(()=>validateRecord('quote_request',intake([{...landSeaLegs[0],origin:''},landSeaLegs[1]])));
});
test('pickup and delivery must cover all planned transport legs',()=>{
 assert.throws(()=>validateRecord('quote_request',{...intake(landSeaLegs),pickup_at:'2026-11-11T08:00'}),/Pickup/);
 assert.throws(()=>validateRecord('quote_request',{...intake(landSeaLegs),delivery_at:'2026-11-13T16:00'}),/Delivery/);
});
test('service-job conversion cannot discard multimodal shipment legs',()=>{
 assert.throws(()=>validateRecord('quote',{...intake(landSeaLegs),job_type:'Service Job',organization_id:2,approver_user_id:1,company:'Cargo ASL',sales_team:'QA',expiry_date:'2099-12-31',incoterm:'FCA',currency:'USD',charges:[{description:'Road freight',quantity:'1',cost_rate:'100',sell_rate:'150',leg_id:'ROAD'}]}),/shipment quotation/);
});
test('synthetic invoice fixture has valid PDF object offsets and explicit fictional content',()=>{
 const bytes=fictionalInvoicePdf('QA-ROAD','100.00'),text=bytes.toString();assert.ok(text.startsWith('%PDF-1.4'));assert.ok(text.includes('No real cargo'));assert.ok(text.includes('USD 100.00'));
 const offset=Number(text.match(/startxref\n(\d+)/)[1]);assert.equal(bytes.subarray(offset,offset+4).toString(),'xref');for(const line of text.slice(offset).split('\n').filter(line=>/^\d{10} 00000 n/.test(line))){const at=Number(line.slice(0,10));assert.match(bytes.subarray(at,at+8).toString(),/^[1-5] 0 obj/);}
});
test('multimodal financial lines require valid leg attribution',()=>{
 const details={title:'Invoice',client_user_id:7,organization_id:2,date:'2026-11-04',due_date:'2026-12-04',currency:'USD',multimodal:true,legs:landSeaLegs,charges:[{description:'Freight',quantity:'1',cost_rate:'100',sell_rate:'150',leg_id:'ROAD'}]};
 assert.equal(validateRecord('invoice',details).charges[0].leg_id,'ROAD');
 for(const leg_id of ['',undefined,'UNKNOWN'])assert.throws(()=>validateRecord('invoice',{...details,charges:[{...details.charges[0],leg_id}]}));
});
test('later legs can be prebooked, but cannot depart before their predecessor completes',()=>{
 const booked=advanceJourney(landSeaLegs,{},'SEA','book','now');assert.equal(booked.status,'Booked');assert.throws(()=>advanceJourney(landSeaLegs,booked.progress,'SEA','depart','now'),/previous leg/);
});
test('unknown, skipped, repeated and prototype-named progress actions are rejected without mutation',()=>{
 const progress={ROAD:{state:'Booked',updated_at:'before'}},before=structuredClone(progress);
 for(const [id,event]of [['ROAD','book'],['ROAD','complete'],['MISSING','depart'],['ROAD','constructor'],['ROAD','__proto__'],['ROAD','toString']])assert.throws(()=>advanceJourney(landSeaLegs,progress,id,event,'after'));
 assert.deepEqual(progress,before);
});
test('multimodal shipments expose leg advancement instead of whole-journey shortcuts',()=>{
 const r={kind:'shipment',owner_id:1,status:'Booked',details:{multimodal:true,client_user_id:7}};
 assert.deepEqual(actionsFor(r,{id:1,role:'erp'}),['cancel','advance_leg','prepare_documents','amend','apply_tariff']);assert.deepEqual(actionsFor(r,{id:7,role:'customer'}),[]);
 assert.ok(!actionsFor({...r,details:{...r.details,multimodal:false}},{id:1,role:'erp'}).includes('advance_leg'));
});
test('journey progress report includes train, ordered legs and states without financial fields',()=>{
 const r={id:1,kind:'shipment',status:'In Transit',details:{multimodal:true,legs:[...landSeaLegs,railLeg],_leg_progress:{ROAD:{state:'Completed'},SEA:{state:'In Transit'}}}};
 const report=buildReport('journeys',[r],[],'customer');assert.equal(report.rows.length,3);assert.equal(report.rows[2][2],'Rail Freight');assert.equal(report.rows[0][9],'Completed');assert.equal(report.rows[2][9],'Draft');assert.ok(!report.headers.some(h=>/cost|profit/i.test(h)));
});
