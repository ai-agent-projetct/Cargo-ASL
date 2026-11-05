import {readFile,writeFile} from 'node:fs/promises';import {testSession} from './freight-test-helpers.mjs';
if(process.env.NODE_ENV==='production')throw Error('Demo seeding is disabled in production.');
const file=new URL('../.local/freight-demo.json',import.meta.url);let prior;try{prior=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
if(prior){const t=await testSession();try{for(const r of prior.results){const job=await t.get(r.records.job),invoice=await t.get(r.records.invoice);if(job.status!=='Invoiced'||invoice.status!=='Paid')throw Error('Existing demonstration needs review; no duplicate records were created.');}console.log('Existing road–sea and road–sea–rail demonstrations remain completed and settled.');}finally{await t.close();}}
else{process.env.FREIGHT_SCENARIOS='9,25';await import('./verify-freight-scenarios.mjs');await writeFile(file,await readFile(new URL('../.local/production-tests/scenarios-targeted.json',import.meta.url)));}
