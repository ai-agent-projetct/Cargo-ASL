import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateQuote} from '../quote.mjs';

const valid = () => ({client_id:1,approving_user_id:2,user_id:3,company_id:4,team_id:5,transport_mode_id:6,shipment_type_id:7,cargo_type_id:8,origin_country_id:9,destination_country_id:10,incoterm_id:11});
test('Q01: non-object bodies are rejected',()=>{
  for(const value of [null,undefined,[],true,42,'draft']) assert.throws(()=>validateQuote(value));
});
for(const key of Object.keys(valid())) test(`Q02: ${key} requires a positive safe integer`,()=>{
  for(const value of [undefined,null,'',0,-1,1.5,'1',true,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>validateQuote({...valid(),[key]:value}));
});
test('Q03: optional relations are validated and empty fields omitted',()=>{
  assert.equal(validateQuote({...valid(),agent_id:undefined}).agent_id,undefined);
  assert.throws(()=>validateQuote({...valid(),agent_id:'2'}));
  assert.equal(validateQuote({...valid(),agent_id:12}).agent_id,12);
});
test('Q04: dates reject rollover, timestamps and non-leap February',()=>{
  for(const date of ['2025-02-29','2026-04-31','2026-13-01','2026-01-00','2026-01-01T00:00:00Z',1]) assert.throws(()=>validateQuote({...valid(),date}));
  assert.equal(validateQuote({...valid(),date:'2024-02-29'}).date,'2024-02-29');
});
test('Q05: money preserves decimal strings without rounding',()=>{
  for(const goods_value of ['0','0.00','999999999.99']) assert.equal(validateQuote({...valid(),goods_value}).goods_value,goods_value);
  for(const goods_value of ['1000000000','1.001','-0.01','1e2','NaN','Infinity',' 1','1,000',12.34]) assert.throws(()=>validateQuote({...valid(),goods_value}));
});
test('Q06: dimensions allow four decimal places; packs require whole numbers',()=>{
  assert.equal(validateQuote({...valid(),gross_weight_unit:'1.1234',pack_unit:'0'}).gross_weight_unit,'1.1234');
  for(const update of [{gross_weight_unit:'1.12345'},{pack_unit:'1.1'},{pack_unit:'-1'},{pack_unit:'1000000000'}]) assert.throws(()=>validateQuote({...valid(),...update}));
});
test('Q07: boolean false survives and truthy strings are rejected',()=>{
  assert.equal(validateQuote({...valid(),is_multimodal:false}).is_multimodal,false);
  for(const value of ['true','false',0,1]) assert.throws(()=>validateQuote({...valid(),is_multimodal:value}));
});
test('Q08: enums accept only declared choices',()=>{
  for(const quote_for of ['Shipment','Service Job']) assert.equal(validateQuote({...valid(),quote_for}).quote_for,quote_for);
  for(const shipment_count of ['Single','Multiple']) assert.equal(validateQuote({...valid(),shipment_count}).shipment_count,shipment_count);
  for(const update of [{quote_for:'shipment'},{shipment_count:'Many'}]) assert.throws(()=>validateQuote({...valid(),...update}));
});
test('Q09: text limits apply to reference, notes and remarks',()=>{
  assert.equal(validateQuote({...valid(),reference_number:'x'.repeat(2000)}).reference_number.length,2000);
  assert.throws(()=>validateQuote({...valid(),reference_number:'x'.repeat(2001)}));
  for(const key of ['note','remarks']) {
    assert.equal(validateQuote({...valid(),[key]:'x'.repeat(20000)})[key].length,20000);
    for(const value of ['x'.repeat(20001),{},null]) assert.throws(()=>validateQuote({...valid(),[key]:value}));
  }
});
test('Q10: caller cannot inject owner, status, ID or version; input is unchanged',()=>{
  const input={...valid(),owner_id:99,status:'Accepted',id:99,version:999};
  const before=structuredClone(input);
  assert.deepEqual(validateQuote(input),valid());
  assert.deepEqual(input,before);
});
