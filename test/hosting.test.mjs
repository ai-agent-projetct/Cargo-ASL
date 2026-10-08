import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hostingSettings} from '../hosting.mjs';
test('hosted deployments require secure cookies and verified TLS while local development still works',()=>{
 const local=hostingSettings({});assert.equal(local.origin,'http://127.0.0.1:3000');assert.equal(local.ssl,undefined);assert.equal(local.secureCookie,false);
 const cloud=hostingSettings({VERCEL:'1',VERCEL_URL:'cargo-example.vercel.app',MYSQL_SSL:'false'});assert.equal(cloud.origin,'https://cargo-example.vercel.app');assert.equal(cloud.secureCookie,true);assert.equal(cloud.ssl.rejectUnauthorized,true);
 const custom=hostingSettings({VERCEL:'1',APP_ORIGIN:'https://cargo.example.com',MYSQL_SSL_CA:'line1\\nline2'});assert.equal(custom.origin,'https://cargo.example.com');assert.equal(custom.ssl.ca,'line1\nline2');
});
