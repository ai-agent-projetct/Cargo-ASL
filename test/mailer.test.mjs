import {test} from 'node:test';
import assert from 'node:assert/strict';
import {smtpSettings,deliver} from '../mailer.mjs';
test('SMTP always enforces encryption and certificate verification; configuration is explicit',()=>{
 assert.equal(smtpSettings({}),null);
 const options=smtpSettings({SMTP_HOST:'smtp.provider.example',SMTP_FROM:'cargo@provider.example',SMTP_PORT:'587'});
 assert.equal(options.requireTLS,true);assert.equal(options.tls.rejectUnauthorized,true);assert.equal(options.disableFileAccess,true);assert.equal(options.disableUrlAccess,true);
 assert.throws(()=>smtpSettings({SMTP_HOST:'smtp.example',SMTP_FROM:'cargo@example.com',SMTP_PORT:'25'}));
});
test('SMTP delivery passes only the reviewed message and a stable message ID',async()=>{
 let sent,closed=false;const env={SMTP_HOST:'smtp.example',SMTP_FROM:'cargo@example.com'};
 const response=await deliver({id:7,recipient:'client@example.com',subject:'Quotation ready',message:'Please open your portal.'},env,()=>({sendMail:async message=>{sent=message;return {accepted:['client@example.com']};},close:()=>closed=true}));
 assert.deepEqual(response.accepted,['client@example.com']);assert.equal(sent.messageId,'<cargo-asl-7@example.com>');assert.equal(sent.text,'Please open your portal.');assert.equal(closed,true);
 await assert.rejects(()=>deliver({},{}));
});
