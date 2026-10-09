import {test} from 'node:test';
import assert from 'node:assert/strict';
import {totals,documentTotals,validateRecord,scaled,canRead,actionsFor} from '../business.mjs';
import {parseCsv} from '../public/csv-import.mjs';
test('financial calculation: independent expected quantities, FX, taxes and margin',()=>{
 const result=totals([{description:'Ocean freight',quantity:'2',cost_rate:'75.25',sell_rate:'100.10',tax_percent:'5',exchange_rate:'1.5'}]);
 assert.deepEqual(result,{cost:'225.75',revenue:'300.30',tax:'15.02',total:'315.32',profit:'74.55',margin:24.82,lines:[{cost:'225.75',revenue:'300.30',tax:'15.02',total:'315.32'}]});
});
test('financial calculation: sums rounded line amounts and represents negative profit',()=>{
 const result=totals([{quantity:'0.5',cost_rate:'0.05',sell_rate:'0.01',tax_percent:'0'},{quantity:'0.5',cost_rate:'0.05',sell_rate:'0.01',tax_percent:'0'}]);
 assert.equal(result.revenue,'0.02');assert.equal(result.cost,'0.06');assert.equal(result.profit,'-0.04');
 assert.equal(scaled('999999999.99'),99999999999n);
});
test('vendor bill uses purchase rate, not selling rate, for payable and tax',()=>{
 const bill=documentTotals('vendor_bill',[{description:'Transport',quantity:'2',cost_rate:'80',sell_rate:'150',tax_percent:'5'}]);
 assert.equal(bill.revenue,'160.00');assert.equal(bill.tax,'8.00');assert.equal(bill.total,'168.00');
});
test('organization validation strips protected fields and rejects invalid emails',()=>{
 const valid={name:'Willow Crest',company_type:'Company',party_type:'Customer',status:'Active',owner_id:99};
 assert.deepEqual(validateRecord('organization',valid),{name:'Willow Crest',company_type:'Company',party_type:'Customer'});
 assert.throws(()=>validateRecord('organization',{...valid,email:'invalid'}));
 assert.throws(()=>validateRecord('organization',{...valid,name:'   '}));
 assert.throws(()=>validateRecord('__proto__',{}));
});
test('tariffs reject reversed date ranges and zero quantity',()=>{
 const valid={name:'Ocean tariff',tariff_type:'Sell',transport_mode:'Sea Freight',origin:'Rotterdam',destination:'Dubai',valid_from:'2026-01-01',valid_to:'2026-12-31',currency:'USD',charges:[{description:'Freight',quantity:'1',cost_rate:'10',sell_rate:'15'}]};
 assert.equal(validateRecord('tariff',valid).charges.length,1);
 assert.throws(()=>validateRecord('tariff',{...valid,valid_to:'2025-01-01'}));
 assert.throws(()=>validateRecord('tariff',{...valid,charges:[{...valid.charges[0],quantity:'0'}]}));
 assert.throws(()=>validateRecord('tariff',{...valid,charges:[{...valid.charges[0],currency:'EUR'}]}));
});
test('access rules isolate vendor/customer records and unpublished quotes',()=>{
 const quote={id:1,kind:'quote',owner_id:1,status:'Sent',details:{client_user_id:3,approver_user_id:1,_published:true}};
 assert.equal(canRead(quote,{id:3,role:'customer'}),true);
 assert.equal(canRead(quote,{id:4,role:'customer'}),false);
 assert.equal(canRead(quote,{id:2,role:'vendor'}),false);
 assert.equal(canRead({...quote,status:'Draft',details:{...quote.details,_published:false}},{id:3,role:'customer'}),false);
 assert.deepEqual(actionsFor(quote,{id:3,role:'customer'}),['accept','reject','renegotiate']);
 assert.deepEqual(actionsFor(quote,{id:1,role:'erp'}),['expire','cancel']);
});
test('only nominated approver can approve a quote',()=>{
 const quote={kind:'quote',owner_id:1,status:'To Approve',details:{approver_user_id:2}};
 assert.deepEqual(actionsFor(quote,{id:1,role:'erp'}),[]);
 assert.deepEqual(actionsFor(quote,{id:2,role:'erp'}),['approve','reject']);
});
test('shared configuration and approval visibility do not grant owner actions',()=>{
 assert.deepEqual(actionsFor({kind:'master',owner_id:1,status:'Active',details:{}},{id:2,role:'erp'}),[]);
 assert.deepEqual(actionsFor({kind:'quote',owner_id:1,status:'Approved',details:{approver_user_id:2}},{id:2,role:'erp'}),[]);
});
test('large quantity and rate products are rejected before database overflow',()=>{
 assert.throws(()=>validateRecord('tariff',{name:'Large rate',tariff_type:'Sell',transport_mode:'Sea Freight',origin:'A',destination:'B',valid_from:'2026-01-01',valid_to:'2026-12-31',currency:'USD',charges:[{description:'Freight',quantity:'999999999',sell_rate:'999999999',cost_rate:'1'}]}),/accounting limit/);
});
test('CSV import reads quoted commas, escaped quotes and multiline fields',()=>{
 assert.deepEqual(parseCsv('name,note\r\n"A,B","say ""hi""\nagain"\r\n'),[['name','note'],['A,B','say "hi"\nagain']]);
 for(const csv of ['a,b\n1','"unclosed','"closed"bad','a,b\n"a""x'])assert.throws(()=>parseCsv(csv));
});
