import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildReport} from '../reports.mjs';
const organization={id:1,kind:'organization',details:{name:'Aster Grove'}};
const charges=[{description:'Freight',quantity:'2',cost_rate:'50',sell_rate:'100',tax_percent:'5'}];
const shipment={id:2,kind:'shipment',status:'Completed',details:{title:'Ocean job',organization_id:1,currency:'USD',charges,origin:'Rotterdam',destination:'Dubai',co2_kg:'840.5',courier:false}};
test('financial reports keep currencies separate and do not use binary floating sums',()=>{
 const quote={id:3,kind:'quote',status:'Draft',details:{organization_id:1,currency:'USD',charges}};
 const report=buildReport('quote_status',[quote,{...quote,id:4,details:{...quote.details,currency:'EUR'}}]);
 assert.equal(report.rows.length,2);assert.equal(report.rows[0][3],'200.00');assert.equal(report.rows[0][4],'100.00');
});
test('shipment actuals use posted invoices and purchase costs, exclude drafts',()=>{
 const invoice={id:3,kind:'invoice',status:'Posted',details:{shipment_id:2,currency:'USD',charges}};
 const bill={id:4,kind:'vendor_bill',status:'Paid',details:{shipment_id:2,currency:'USD',charges:[{description:'Transport',quantity:'1',cost_rate:'80',sell_rate:'150'}]}};
 const report=buildReport('shipment_profit',[organization,shipment,invoice,bill,{...invoice,id:5,status:'Draft'}]);
 assert.deepEqual(report.rows[0].slice(3),['100.00','200.00','80.00','200.00','120.00']);
});
test('estimated vs actual groups charge descriptions and preserves unallocated credits',()=>{
 const invoice={id:3,kind:'invoice',status:'Posted',details:{shipment_id:2,currency:'USD',charges,_net_credits:'20.00'}};
 const report=buildReport('estimated_actual',[shipment,invoice]);
 assert.deepEqual(report.rows[0].slice(1),['Freight','USD','100.00','200.00','0.00','200.00']);
 assert.deepEqual(report.rows[1].slice(1),['Invoice credits (unallocated)','USD','0.00','0.00','0.00','-20.00']);
});
test('receivables subtract recorded payments and credits',()=>{
 const invoice={id:3,kind:'invoice',status:'Partially Paid',paid_amount:'50.00',details:{organization_id:1,currency:'USD',charges,_credits:'10.00',due_date:'2026-12-01'}};
 assert.equal(buildReport('receivables',[organization,invoice]).rows[0][6],'150.00');
});
test('posted credit notes reduce actual net revenue and profit',()=>{
 const invoice={id:3,kind:'invoice',status:'Partially Paid',details:{shipment_id:2,currency:'USD',charges,_net_credits:'40.00'}};
 assert.equal(buildReport('shipment_profit',[shipment,invoice]).rows[0][6],'160.00');
 assert.equal(buildReport('shipment_profit',[shipment,invoice]).rows[0][7],'160.00');
});
test('customer reports exclude commercial costs; courier and emissions honor shipment data',()=>{
 const quote={id:3,kind:'quote',status:'Sent',details:{currency:'USD',charges}};
 assert.equal(buildReport('quote_status',[quote],[],'customer').rows[0][4],'');
 assert.equal(buildReport('emissions',[organization,shipment]).rows[0][4],'840.5');
 assert.equal(buildReport('courier',[shipment]).rows.length,0);
});
