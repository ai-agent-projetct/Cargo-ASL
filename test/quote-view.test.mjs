import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterQuotes,csvText} from '../public/quote-view.mjs';
const quotes=[{id:1,status:'Draft',created_at:'2026-10-01',details:{client_id:10,reference_number:'REF-A'}},{id:2,status:'Accepted',created_at:'2026-09-01',details:{client_id:11}}];
const lookups=[{id:10,field_name:'client_id',label:'Aster Grove'},{id:11,field_name:'client_id',label:'Willow Crest'}];
test('V01: searches reference, visible customer, status and quotation number',()=>{
  for(const query of ['aster','draft','asl-q-1','ref-a']) assert.deepEqual(filterQuotes(quotes,lookups,{query}),[quotes[0]]);
  assert.deepEqual(filterQuotes(quotes,lookups,{query:'missing'}),[]);
});
test('V02: dashboard drilldown matches the selected dimension, not raw JSON',()=>{
  assert.deepEqual(filterQuotes(quotes,lookups,{drill:{field:'client_id',label:'Aster Grove'}}),[quotes[0]]);
  assert.deepEqual(filterQuotes(quotes,lookups,{drill:{field:'status',label:'Accepted'}}),[quotes[1]]);
});
test('V03: month filter composes with search and drilldown',()=>{
  assert.deepEqual(filterQuotes(quotes,lookups,{currentMonth:true,month:'2026-10'}),[quotes[0]]);
  assert.deepEqual(filterQuotes(quotes,lookups,{currentMonth:true,month:'2026-10',query:'accepted'}),[]);
});
test('V04: CSV quotes separators, embedded quotes, newlines and nulls',()=>{
  assert.equal(csvText([['a,b','"hello"',null],['line\nbreak']]),'"a,b","""hello""",""\r\n"line\nbreak"');
});
test('V05: CSV neutralizes formulas including leading whitespace',()=>{
  for(const value of ['=1+1','+2','-3','@SUM(A1)','  =1','\t=1','\r=1','\n=1']) assert.ok(csvText([[value]]).startsWith('"\''));
});
