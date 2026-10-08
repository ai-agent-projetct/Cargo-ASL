import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sections,validateQuote} from '../quote.mjs';
test('quotation validation rejects invalid required selections, dates, amounts and enums',()=>{
  const draft=Object.fromEntries(sections.flatMap(([,fields])=>fields.filter(f=>f[3]).map(f=>[f[0],1])));
  assert.deepEqual(validateQuote({...draft,goods_value:'12.34',date:'2026-09-11'}),{...draft,goods_value:'12.34',date:'2026-09-11'});
  for(const update of [{client_id:0},{date:'2026-02-30'},{goods_value:'1e9'},{goods_value:'-1'},{goods_value:'12.345'},{quote_for:'Unknown'},{is_multimodal:'false'}]) assert.throws(()=>validateQuote({...draft,...update}));
  assert.equal(validateQuote({...draft,status:'Accepted',owner_id:99}).status,undefined);
  assert.throws(()=>validateQuote({}));
});
