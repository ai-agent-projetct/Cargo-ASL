import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateRecord,validateFields,portalFields,canRead,canEdit,actionsFor} from '../business.mjs';
const inquiry={title:'Exhibition inquiry',client_user_id:7,contact_name:'Nora Vale',email:'nora@example.test',address:'Aster Grove office',date:'2026-11-04',transport_mode:'Air Freight',shipment_type:'International',cargo_type:'General Cargo',origin:'Amsterdam',destination:'Dubai',origin_country:'Netherlands',destination_country:'United Arab Emirates',pickup:'Warehouse A',delivery:'Venue B',pickup_contact:'Avery',delivery_contact:'Rowan',pickup_at:'2026-11-10T09:00',delivery_at:'2026-11-12T17:30',service_type:'Priority',cargo_specification:'Exhibition stand',dangerous:false,stackable:true,temperature:false};
test('customer intake removes identity, approval and financial field injection',()=>{
 const clean=validateFields({...inquiry,owner_id:99,client_user_id:99,charges:[{cost_rate:'1'}],status:'Accepted'},portalFields.quote_request);
 assert.equal(clean.client_user_id,undefined);assert.equal(clean.owner_id,undefined);assert.equal(clean.charges,undefined);assert.equal(clean.status,undefined);assert.equal(clean.stackable,true);
 assert.equal(validateRecord('quote_request',{...clean,client_user_id:7}).pickup_at,'2026-11-10T09:00');
});
test('quote inquiries reject invalid timestamps, rollover and reversed delivery',()=>{
 for(const value of ['2026-02-30T09:00','2026-11-10T24:30','2026-11-10T09:00Z'])assert.throws(()=>validateRecord('quote_request',{...inquiry,pickup_at:value}));
 assert.throws(()=>validateRecord('quote_request',{...inquiry,delivery_at:'2026-11-01T12:00'}));
 assert.throws(()=>validateRecord('quote_request',{...inquiry,address:''}));
});
test('courier product quantities, dates and tracking links enforce safe values',()=>{
 const valid={title:'ASL parcel',date:'2026-11-04',client_user_id:7,logistic_id:'ASL-COURIER-77',tracking_url:'https://tracking.example.test/77',goods:[{product:'Display unit',quantity:'2.5',unit_price:'80.00',currency:'USD',production_date:'2026-11-01',expiration_date:'2027-11-01'}]};
 assert.equal(validateRecord('courier',valid).goods[0].unit_price,'80.00');
 for(const tracking_url of ['javascript:alert(1)','file:///C:/private','https://name:password@example.test'])assert.throws(()=>validateRecord('courier',{...valid,tracking_url}));
 assert.throws(()=>validateRecord('courier',{...valid,goods:[{product:'Box',quantity:'0'}]}));
 assert.throws(()=>validateRecord('courier',{...valid,goods:[{product:'Box',quantity:'1',production_date:'2026-11-02',expiration_date:'2026-11-01'}]}));
});
test('only the assigned client edits a courier draft; booking locks client edits',()=>{
 const draft={kind:'courier',owner_id:1,status:'Draft',details:{client_user_id:7}};
 assert.equal(canRead(draft,{id:7,role:'customer'}),true);assert.equal(canRead(draft,{id:8,role:'customer'}),false);
 assert.equal(canEdit(draft,{id:7,role:'customer'}),true);assert.equal(canEdit(draft,{id:8,role:'customer'}),false);
 assert.equal(canEdit({...draft,status:'Booked'},{id:7,role:'customer'}),false);
});
test('vendor invoice requests separate vendor upload from internal approval',()=>{
 const request={kind:'invoice_request',owner_id:1,status:'Pending Vendor Bill Upload',details:{vendor_user_id:7}};
 assert.deepEqual(actionsFor(request,{id:7,role:'vendor'}),['upload']);assert.deepEqual(actionsFor(request,{id:1,role:'erp'}),[]);assert.equal(canRead(request,{id:8,role:'vendor'}),false);
 assert.deepEqual(actionsFor({...request,status:'Vendor Invoice Upload - Approval Pending'},{id:1,role:'erp'}),['approve','reject']);
 assert.deepEqual(actionsFor({...request,status:'Vendor Invoice Rejected'},{id:7,role:'vendor'}),['upload']);
});
test('clients see their created and cancelled service jobs, while draft financial documents stay private',()=>{
 const record={owner_id:1,details:{client_user_id:7}};
 assert.equal(canRead({...record,kind:'service_job',status:'Draft'},{id:7,role:'customer'}),true);
 assert.equal(canRead({...record,kind:'service_job',status:'Cancelled'},{id:7,role:'customer'}),true);
 assert.equal(canRead({...record,kind:'invoice',status:'Draft'},{id:7,role:'customer'}),false);
});
