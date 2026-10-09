import {specs,workflows,validateFields,validateRecord,totals,documentTotals,scaled,money,canRead,actionsFor,editable} from './business.mjs';
import {deliver,smtpSettings} from './mailer.mjs';
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const today=()=>new Date().toISOString().slice(0,10);
const assertInput=value=>{if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'An object is required.');};
const cleanError=fn=>{try{return fn();}catch(e){fail(400,e.message);}};
function projected(record,user){
 const result=structuredClone(record);
 result.number=`${specs[result.kind].prefix}-${String(result.id).padStart(6,'0')}`;
 result.actions=actionsFor(record,user);
 result.editable=user.role==='erp'&&record.owner_id===user.id&&editable(record);
 if(result.details.charges)result.totals=documentTotals(record.kind,result.details.charges);
 if(user.role==='customer'){
  for(const line of result.details.charges||[])delete line.cost_rate;
  if(result.totals){delete result.totals.cost;delete result.totals.profit;delete result.totals.margin;result.totals.lines.forEach(line=>delete line.cost);}
  for(const key of ['approver_user_id','sales_agent_id','sales_team','vendor_user_id','_published'])delete result.details[key];
 }
 return result;
}
async function recordById(db,id,user,lock=false){
 if(!Number.isSafeInteger(id)||id<1)fail(404,'Record not found.');
 const [rows]=await db.execute(`SELECT * FROM business_records WHERE id=?${lock?' FOR UPDATE':''}`,[id]);
 const record=rows[0];if(!record||!Object.hasOwn(specs,record.kind)||!canRead(record,user))fail(404,'Record not found.');return record;
}
async function references(db,kind,data,user){
 for(const field of specs[kind].fields){const value=data[field.key];if(!value)continue;
  if(field.type.startsWith('user:')){const [rows]=await db.execute('SELECT id FROM users WHERE id=? AND active=TRUE AND role=?',[value,field.type.slice(5)]);if(!rows.length)fail(400,`${field.label} is unavailable.`);}
  else if(field.type.startsWith('ref:')||field.type==='record'){
   const target=await recordById(db,value,user);
   if(field.type.startsWith('ref:')&&target.kind!==field.type.slice(4))fail(400,`${field.label} has an incorrect record type.`);
   if(['Archived','Cancelled','Lost'].includes(target.status))fail(400,`${field.label} is inactive.`);
   if(field.key!=='organization_id'&&data.organization_id&&target.details.organization_id&&target.details.organization_id!==data.organization_id)fail(400,`${field.label} belongs to a different organization.`);
  }
 }
 if(['invoice','proforma','vendor_bill'].includes(kind))for(const key of ['shipment_id','service_job_id'])if(data[key]){const source=await recordById(db,data[key],user);if(data.currency!==source.details.currency)fail(400,'Document currency must match the linked job.');if(data.client_user_id&&data.client_user_id!==source.details.client_user_id)fail(400,'Client must match the linked job.');}
 if(kind==='credit_note'){const invoice=await recordById(db,data.invoice_id,user);if(invoice.details.currency!==data.currency||invoice.details.client_user_id!==data.client_user_id)fail(400,'Credit note currency and client must match the invoice.');if(!['Posted','Partially Paid'].includes(invoice.status))fail(400,'Credit notes require an outstanding posted invoice.');}
}
async function insert(db,kind,data,user){
 data=cleanError(()=>validateRecord(kind,data));await references(db,kind,data,user);
 const [row]=await db.execute('INSERT INTO business_records(kind,owner_id,details) VALUES(?,?,?)',[kind,user.id,JSON.stringify(data)]);
 await audit(db,user.id,row.insertId,'create');return row.insertId;
}
async function audit(db,userId,id,action){await db.execute("INSERT INTO audit_log(user_id,entity,entity_id,action) VALUES(?,'record',?,?)",[userId,id,action]);await db.execute('INSERT INTO workspace_notifications(record_id,user_id,message) SELECT record_id,user_id,? FROM record_followers WHERE record_id=? AND user_id<>?',[action,id,userId]);}
async function save(db,record,user,action){
 await db.execute('UPDATE business_records SET status=?,details=?,version=version+1 WHERE id=?',[record.status,JSON.stringify(record.details),record.id]);await audit(db,user.id,record.id,action);record.version++;
}
async function ledger(db,record,account,debit=0n,credit=0n){if(!debit&&!credit)return;await db.execute('INSERT INTO ledger_entries(record_id,account,currency,debit,credit) VALUES(?,?,?,?,?)',[record.id,account,record.details.currency,money(debit),money(credit)]);}
async function balance(db,record){const [paid]=await db.execute('SELECT COALESCE(SUM(amount),0) AS amount FROM record_payments WHERE record_id=?',[record.id]);return scaled(documentTotals(record.kind,record.details.charges).total)-scaled(paid[0].amount)-scaled(record.details._credits||'0');}
export async function workspaceApi({req,res,url,user,pool,body,json,derive,randomBytes}){
 if(!url.pathname.startsWith('/api/workspace'))return false;
 const tail=url.pathname.slice('/api/workspace'.length);
 if(req.method==='GET'&&tail==='/snapshot'){
  // Visibility is checked before serializing any record or commercial figures.
  const identity=key=>`CAST(JSON_UNQUOTE(JSON_EXTRACT(r.details,'$.${key}')) AS UNSIGNED)=?`;
  const scope=user.role==='erp'?`(r.owner_id=? OR ${identity('approver_user_id')} OR ${identity('responsible_user_id')} OR ${identity('assigned_user_id')} OR r.kind='master')`:user.role==='vendor'?identity('vendor_user_id'):identity('client_user_id');
  const [all]=await pool.execute(`SELECT r.*,COALESCE(p.paid_amount,0) AS paid_amount FROM business_records r LEFT JOIN (SELECT record_id,SUM(amount) AS paid_amount FROM record_payments GROUP BY record_id) p ON p.record_id=r.id WHERE ${scope} ORDER BY r.id DESC LIMIT 5001`,user.role==='erp'?[user.id,user.id,user.id,user.id]:[user.id]);
  const records=all.filter(r=>Object.hasOwn(specs,r.kind)&&canRead(r,user)).map(r=>projected(r,user));
  const users=user.role==='erp'?(await pool.query('SELECT id,name,email,role,active FROM users ORDER BY name'))[0]:[];
  const ledgerRows=user.role==='erp'?(await pool.execute('SELECT l.* FROM ledger_entries l JOIN business_records r ON r.id=l.record_id WHERE r.owner_id=? ORDER BY l.id DESC LIMIT 5000',[user.id]))[0]:[];
  const [notices]=await pool.execute('SELECT * FROM workspace_notifications WHERE user_id=? ORDER BY id DESC LIMIT 100',[user.id]);
  const validIds=new Set(records.map(r=>r.id));const notifications=notices.filter(n=>validIds.has(n.record_id));
  const mail=user.role==='erp'?(await pool.execute('SELECT id,record_id,recipient,subject,message,status,error,created_at FROM workspace_mail WHERE user_id=? ORDER BY id DESC LIMIT 100',[user.id]))[0]:[];
  let smtpConfigured=false;try{smtpConfigured=user.role==='erp'&&Boolean(smtpSettings());}catch{}
  return json(res,200,{records:records.slice(0,5000),users,ledger:ledgerRows,notifications,mail,smtpConfigured,limit:5000,truncated:all.length>5000});
 }
 if(req.method==='POST'&&tail==='/notifications/read'){await pool.execute('UPDATE workspace_notifications SET is_read=TRUE WHERE user_id=?',[user.id]);return json(res,200,{ok:true});}
 const sendMail=/^\/mail\/(\d+)\/send$/.exec(tail);
 if(sendMail&&req.method==='POST'){
  if(user.role!=='erp')fail(403,'An admin account is required.');if(!smtpSettings())fail(412,'Configure SMTP_HOST and SMTP_FROM before sending email.');
  const mailId=Number(sendMail[1]);const [rows]=await pool.execute('SELECT * FROM workspace_mail WHERE id=? AND user_id=?',[mailId,user.id]);const message=rows[0];if(!message)fail(404,'Email not found.');const record=await recordById(pool,message.record_id,user);
  const recipientId=record.details.vendor_user_id||record.details.client_user_id;const [recipients]=await pool.execute('SELECT id,email,role FROM users WHERE id=? AND active=TRUE',[recipientId||0]);const recipient=recipients[0];
  if(!recipient||recipient.email!==message.recipient||!canRead(record,recipient))fail(409,'Recipient access changed. Queue a new message after reviewing the record.');
  const [claimed]=await pool.execute("UPDATE workspace_mail SET status='Sending',error=NULL WHERE id=? AND status IN ('Queued','Failed')",[mailId]);if(!claimed.affectedRows)fail(409,'This email has already been sent or is currently sending.');
  let sent=false;try{const result=await deliver(message);if(!result.accepted?.length)throw new Error('SMTP provider did not accept the recipient.');sent=true;await pool.execute("UPDATE workspace_mail SET status='Sent' WHERE id=?",[mailId]);await audit(pool,user.id,message.record_id,'email sent');return json(res,200,{ok:true});}catch(error){if(!sent)await pool.execute("UPDATE workspace_mail SET status='Failed',error=? WHERE id=?",[String(error.code||'SMTP_DELIVERY_FAILED'),mailId]);fail(502,sent?'Email was accepted by SMTP, but logging failed. Check the provider before retrying.':'Email delivery failed. Check SMTP settings and the outbox.');}
 }
 if(req.method==='POST'&&tail==='/users'){
  if(user.role!=='erp')fail(403,'An admin account is required.');const input=await body(req);assertInput(input);
  const name=typeof input.name==='string'?input.name.trim():'';const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
  if(!name||name.length>150||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!['erp','vendor','customer'].includes(input.role)||typeof input.password!=='string'||input.password.length<12||input.password.length>1024)fail(400,'Provide a name, valid email, role and password of at least 12 characters.');
  const salt=randomBytes(16).toString('hex'),passwordHash=salt+':'+(await derive(input.password,salt,64)).toString('hex');
  try{const [result]=await pool.execute('INSERT INTO users(name,email,role,password_hash) VALUES(?,?,?,?)',[name,email,input.role,passwordHash]);return json(res,201,{id:result.insertId});}catch(e){if(e.code==='ER_DUP_ENTRY')fail(409,'That email already has an account.');throw e;}
 }
 if(req.method==='PATCH'&&/^\/users\/\d+$/.test(tail)){
  if(user.role!=='erp')fail(403,'An admin account is required.');const id=Number(tail.split('/')[2]),input=await body(req);assertInput(input);
  if(id===user.id)fail(400,'Use another admin to change your own account.');
  if(input.password!==undefined){
   if(typeof input.password!=='string'||input.password.length<12||input.password.length>1024)fail(400,'Password must contain 12 to 1,024 characters.');
   const salt=randomBytes(16).toString('hex'),passwordHash=salt+':'+(await derive(input.password,salt,64)).toString('hex');
   const [result]=await pool.execute('UPDATE users SET password_hash=? WHERE id=?',[passwordHash,id]);if(!result.affectedRows)fail(404,'User not found.');
  }else{
   if(typeof input.active!=='boolean')fail(400,'Active must be true or false.');
   const [result]=await pool.execute('UPDATE users SET active=? WHERE id=?',[input.active,id]);if(!result.affectedRows)fail(404,'User not found.');
  }
  await pool.execute('DELETE FROM sessions WHERE user_id=?',[id]);return json(res,200,{ok:true});
 }
 const matched=/^\/records(?:\/(\d+))?(?:\/(action|notes|documents|follow|mail))?$/.exec(tail);
 if(!matched){const download=/^\/documents\/(\d+)$/.exec(tail);if(download&&req.method==='GET'){
   const [rows]=await pool.execute('SELECT * FROM record_documents WHERE id=?',[Number(download[1])]);const doc=rows[0];if(!doc)fail(404,'Document not found.');await recordById(pool,doc.record_id,user);if(user.role!=='erp'&&doc.visibility!=='shared')fail(404,'Document not found.');
   res.writeHead(200,{'Content-Type':doc.mime,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`,'Cache-Control':'no-store'});res.end(doc.content);return true;
  }fail(404,'Workspace route not found.');}
 const id=Number(matched[1]),sub=matched[2];
 if(req.method==='GET'&&id&&!sub){
  const record=await recordById(pool,id,user);const [notes]=await pool.execute(`SELECT n.id,n.message,n.visibility,n.created_at,u.name AS author FROM record_notes n JOIN users u ON u.id=n.user_id WHERE record_id=? ${user.role==='erp'?'':"AND visibility='shared'"} ORDER BY n.id`,[id]);
  const [documents]=await pool.execute(`SELECT id,name,mime,visibility,created_at FROM record_documents WHERE record_id=? ${user.role==='erp'?'':"AND visibility='shared'"} ORDER BY id`,[id]);
  const [history]=user.role==='erp'?await pool.execute("SELECT a.action,a.created_at,u.name AS author FROM audit_log a JOIN users u ON u.id=a.user_id WHERE entity='record' AND entity_id=? ORDER BY a.id",[id]):[[]];
  const [payments]=await pool.execute('SELECT amount,reference,created_at FROM record_payments WHERE record_id=? ORDER BY id',[id]);
  const [followers]=await pool.execute('SELECT f.user_id,u.name FROM record_followers f JOIN users u ON u.id=f.user_id WHERE record_id=?',[id]);
  return json(res,200,{...projected(record,user),notes,documents,history,payments,following:followers.some(f=>f.user_id===user.id),followers:user.role==='erp'?followers:[]});
 }
 if(req.method==='POST'&&id&&sub==='follow'){
  await recordById(pool,id,user);const input=await body(req);assertInput(input);if(typeof input.following!=='boolean')fail(400,'Following must be true or false.');
  if(input.following)await pool.execute('INSERT IGNORE INTO record_followers(record_id,user_id) VALUES(?,?)',[id,user.id]);else await pool.execute('DELETE FROM record_followers WHERE record_id=? AND user_id=?',[id,user.id]);return json(res,200,{ok:true});
 }
 if(req.method==='POST'&&id&&sub==='mail'){
  if(user.role!=='erp')fail(403,'An admin account is required.');const record=await recordById(pool,id,user);const input=await body(req);assertInput(input);
  const recipientId=record.details.vendor_user_id||record.details.client_user_id;if(!recipientId)fail(400,'Assign a vendor or client account before emailing.');
  const [rows]=await pool.execute('SELECT id,email,role FROM users WHERE id=? AND active=TRUE',[recipientId]);const recipient=rows[0];if(!recipient||!canRead(record,recipient))fail(400,'Publish this record to its assigned portal before emailing.');
  if(/\.(local|invalid|example)$/i.test(recipient.email))fail(400,'Demo addresses cannot receive real email. Assign a real recipient account.');
  if(typeof input.subject!=='string'||!input.subject.trim()||input.subject.length>200||/[\r\n]/.test(input.subject)||typeof input.message!=='string'||!input.message.trim()||input.message.length>20000)fail(400,'Provide an email subject and message.');
  const [result]=await pool.execute('INSERT INTO workspace_mail(record_id,user_id,recipient,subject,message) VALUES(?,?,?,?,?)',[id,user.id,recipient.email,input.subject.trim(),input.message]);await audit(pool,user.id,id,'email queued');return json(res,201,{id:result.insertId,recipient:recipient.email,status:'Queued'});
 }
 if(req.method==='POST'&&id&&sub==='notes'){
  await recordById(pool,id,user);const input=await body(req);assertInput(input);if(typeof input.message!=='string'||!input.message.trim()||input.message.length>20000)fail(400,'Write a note of at most 20,000 characters.');
  const visibility=user.role==='erp'&&input.visibility!=='shared'?'internal':'shared';await pool.execute('INSERT INTO record_notes(record_id,user_id,message,visibility) VALUES(?,?,?,?)',[id,user.id,input.message.trim(),visibility]);return json(res,201,{ok:true});
 }
 if(req.method==='POST'&&id&&sub==='documents'){
  await recordById(pool,id,user);const input=await body(req,3000000);assertInput(input);
  if(typeof input.name!=='string'||!input.name.trim()||input.name.length>200||/[\x00-\x1f/\\]/.test(input.name)||!['application/pdf','image/png','image/jpeg','text/plain','text/csv'].includes(input.mime)||typeof input.content!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.content))fail(400,'Upload a PDF, PNG, JPEG, text or CSV file with a valid name.');
  const content=Buffer.from(input.content,'base64');if(!content.length||content.length>2000000)fail(400,'File size must be between 1 byte and 2 MB.');
  const visibility=user.role==='erp'&&input.visibility!=='shared'?'internal':'shared';await pool.execute('INSERT INTO record_documents(record_id,user_id,name,mime,content,visibility) VALUES(?,?,?,?,?,?)',[id,user.id,input.name,input.mime,content,visibility]);return json(res,201,{ok:true});
 }
 if(!['POST','PUT'].includes(req.method))fail(405,'Method not supported.');
 const input=await body(req);assertInput(input);
 const db=await pool.getConnection();
 try{await db.beginTransaction();
  if(!id){if(user.role!=='erp')fail(403,'Only an admin can create internal records.');const newId=await insert(db,input.kind,input.details,user);await db.commit();return json(res,201,{id:newId});}
  const record=await recordById(db,id,user,true);
  if(!Number.isSafeInteger(input.version)||record.version!==input.version)fail(409,'This record changed. Reload before saving.');
  if(req.method==='PUT'&&!sub){
   if(user.role!=='erp'||record.owner_id!==user.id)fail(403,'Only the record owner can edit.');if(!editable(record))fail(409,'This status is locked for editing.');
   const data=cleanError(()=>validateRecord(record.kind,input.details));await references(db,record.kind,data,user);if(record.details._published)data._published=true;record.details=data;await save(db,record,user,'edit');
  }else if(req.method==='POST'&&sub==='action'){
   const action=input.action;if(!actionsFor(record,user).includes(action))fail(403,'This action is not allowed for your role and the current status.');
   const d=record.details;let next;
   if(action==='respond'){
    const rates=cleanError(()=>validateFields({vendor_charges:input.vendor_charges},[{key:'vendor_charges',label:'Vendor rates',type:'rows:vendorCharges',required:true}]));
    if(rates.vendor_charges.some(r=>Number(r.quantity)<=0))fail(400,'Quantity must be positive.');
    if(rates.vendor_charges.some(r=>r.currency!==d.currency))fail(400,'Vendor rates must use the request currency.');d.vendor_charges=rates.vendor_charges;
    if(typeof input.vendor_note!=='string'||input.vendor_note.length>20000)fail(400,'Vendor remarks are invalid.');d.vendor_note=input.vendor_note;
   }
   if(record.kind==='quote'){
    if(['submit','pricing','approve','send','accept'].includes(action)&&!(d.charges?.length))fail(400,'Add quotation charges first.');
    if(action==='accept'&&d.expiry_date<today())fail(409,'The quotation has expired.');
    if(action==='expire'&&d.expiry_date>=today())fail(409,'The expiry date has not passed.');
    if(action==='send')d._published=true;
    if(action==='convert'){
     const shipment={...d,title:d.title,quote_id:id,booking_reference:`BK-${String(id).padStart(6,'0')}`,date:today(),po_status:'Pending'};
     d._converted_id=await insert(db,d.job_type==='Service Job'?'service_job':'shipment',{...shipment,service_type:'From quotation'},user);
    }
   }
   if(record.kind==='lead'&&action==='convert')d._converted_id=await insert(db,'opportunity',{...d,lead_id:id,probability:'25'},user);
   if(record.kind==='rate_request'&&action==='accept'&&d.quote_id){
    const quote=await recordById(db,d.quote_id,user,true);if(!['Draft','Renegotiate'].includes(quote.status))fail(409,'The linked quote is locked.');
    if(!d.vendor_charges?.length)fail(400,'No vendor rates have been submitted.');
    if(d.currency!==quote.details.currency)fail(400,'Rate request and quote currencies must match before importing rates.');
    quote.details.charges=[...(quote.details.charges||[]),...d.vendor_charges.map(r=>({...r,sell_rate:r.cost_rate,tax_percent:'0'}))];await save(db,quote,user,'import vendor rates');
   }
   if(['shipment','service_job'].includes(record.kind)&&action==='invoice'){
    if(!d.charges?.length)fail(400,'Add revenue charges before invoicing.');
    const due=new Date();due.setUTCDate(due.getUTCDate()+30);
    d._invoice_id=await insert(db,'invoice',{...d,title:`Invoice for ${d.title}`,[record.kind==='shipment'?'shipment_id':'service_job_id']:id,date:today(),due_date:due.toISOString().slice(0,10)},user);
   }
   if(record.kind==='proforma'&&action==='convert')d._invoice_id=await insert(db,'invoice',d,user);
   if(['invoice','vendor_bill'].includes(record.kind)&&action==='post'){
    const t=documentTotals(record.kind,d.charges),gross=scaled(t.total),net=scaled(t.revenue),tax=scaled(t.tax);if(!gross)fail(400,'Document total must be positive.');
    if(record.kind==='invoice'){await ledger(db,record,'Accounts Receivable',gross);await ledger(db,record,'Sales Revenue',0n,net);await ledger(db,record,'Tax Payable',0n,tax);}
    else{await ledger(db,record,'Operating Expense',net);await ledger(db,record,'Tax Recoverable',tax);await ledger(db,record,'Accounts Payable',0n,gross);}
   }
   if(['invoice','vendor_bill'].includes(record.kind)&&action==='pay'){
    const amount=cleanError(()=>validateFields({amount:input.amount},[{key:'amount',label:'Amount',type:'money',required:true}])).amount;
    const outstanding=await balance(db,record),paid=scaled(amount);if(paid<=0n||paid>outstanding)fail(400,'Payment must be positive and cannot exceed the outstanding balance.');
    if(typeof input.reference!=='string'||!input.reference.trim()||input.reference.length>200)fail(400,'A payment reference is required.');
    await db.execute('INSERT INTO record_payments(record_id,user_id,amount,reference) VALUES(?,?,?,?)',[id,user.id,amount,input.reference.trim()]);
    if(record.kind==='invoice'){await ledger(db,record,'Cash',paid);await ledger(db,record,'Accounts Receivable',0n,paid);}else{await ledger(db,record,'Accounts Payable',paid);await ledger(db,record,'Cash',0n,paid);}
    next=paid===outstanding?'Paid':'Partially Paid';
   }
   if(record.kind==='invoice'&&action==='credit'){
    const amount=cleanError(()=>validateFields({amount:input.amount},[{key:'amount',label:'Amount',type:'money',required:true}])).amount;
    if(scaled(amount)<=0n||scaled(amount)>await balance(db,record))fail(400,'Credit must be positive and cannot exceed the outstanding balance.');
    if(typeof input.reason!=='string'||!input.reason.trim())fail(400,'A reason is required.');
    d._credit_note_id=await insert(db,'credit_note',{title:`Credit for ${d.title}`,organization_id:d.organization_id,invoice_id:id,client_user_id:d.client_user_id,date:today(),currency:d.currency,amount,reason:input.reason},user);next=record.status;
   }
   if(record.kind==='credit_note'&&action==='post'){
    const invoice=await recordById(db,d.invoice_id,user,true);const amount=scaled(d.amount);if(amount<=0n||amount>await balance(db,invoice))fail(400,'Credit exceeds the invoice balance.');
    const original=totals(invoice.details.charges),gross=scaled(original.total),tax=scaled(original.tax)*amount/gross,net=amount-tax;
    await ledger(db,record,'Sales Revenue',net);await ledger(db,record,'Tax Payable',tax);await ledger(db,record,'Accounts Receivable',0n,amount);
    invoice.details._credits=money(scaled(invoice.details._credits||'0')+amount);invoice.details._net_credits=money(scaled(invoice.details._net_credits||'0')+net);if(await balance(db,invoice)===0n)invoice.status='Credited';await save(db,invoice,user,'credit applied');
   }
   record.status=next||workflows[record.kind][record.status][action];
   await save(db,record,user,action);
  }else fail(405,'Method not supported.');
  await db.commit();return json(res,200,projected(record,user));
 }catch(e){await db.rollback();throw e;}finally{db.release();}
}
