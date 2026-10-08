import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import mysql from 'mysql2/promise';
import { validateQuote, sections } from './quote.mjs';
import { hostingSettings } from './hosting.mjs';

const hosting=hostingSettings();
const pool = mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE, connectionLimit: 3, maxIdle:1, idleTimeout:10000, connectTimeout:10000, ssl:hosting.ssl, timezone: 'Z' });
const hash = value => createHash('sha256').update(value).digest('hex');
const derive = promisify(scrypt);
const attempts = new Map();
const portalStyle=['public/portals.css','text/css'];
const publicFiles = new Map([['/quote-view.mjs',['public/quote-view.mjs','text/javascript']],['/', ['public/index.html','text/html']],['/app.js',['public/app.js','text/javascript']],['/style.css',['public/style.css','text/css']],['/quote.mjs',['quote.mjs','text/javascript']],['/assets/lato.woff',['public/assets/lato.woff','font/woff']],['/assets/lato-bold.woff',['public/assets/lato-bold.woff','font/woff']],['/assets/icons.woff2',['public/assets/icons.woff2','font/woff2']]]);
function fail(status,message) { throw Object.assign(new Error(message),{status}); }
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415,'Use application/json.');
  const chunks=[]; let size=0;
  for await (const chunk of req) { size+=chunk.length; if(size>100000) fail(413,'Request too large.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { fail(400,'Invalid JSON.'); }
}
function json(res,status,data,headers={}) { res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers}); res.end(JSON.stringify(data)); }
async function currentUser(req) {
  const token = /(?:^|;\s*)cargo_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  if(!token) return null;
  const [rows] = await pool.execute('SELECT u.id,u.name,u.email,u.role FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP() AND u.active=TRUE',[hash(token)]);
  return rows[0] || null;
}
async function validateRelations(conn, data) {
  for (const [,fields] of sections) for(const [key,label,type] of fields) if(type==='relation' && data[key]) {
    const [rows]=await conn.execute('SELECT id FROM lookup_values WHERE id=? AND field_name=? AND active=TRUE',[data[key],key]);
    if(!rows.length) fail(400,`${label} selection is unavailable.`);
  }
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  try {
    const url=new URL(req.url,'http://localhost');
    if(req.method==='GET'&&url.pathname==='/portals.css'){res.writeHead(200,{'Content-Type':portalStyle[1]});return res.end(await readFile(new URL(portalStyle[0],import.meta.url)));}
    if(req.method==='GET' && /^\/login\/(admin|vendor|client)$/.test(url.pathname)) {res.writeHead(200,{'Content-Type':'text/html'});return res.end(await readFile(new URL('public/index.html',import.meta.url)));}
    if(req.method==='GET' && publicFiles.has(url.pathname)) {
      const [file,type]=publicFiles.get(url.pathname); const data=await readFile(new URL(file,import.meta.url));
      res.writeHead(200,{'Content-Type':type}); return res.end(data);
    }
    if(req.method==='GET' && url.pathname==='/api/health') {
      try { await pool.query('SELECT 1'); return json(res,200,{database:'connected'}); }
      catch { return json(res,503,{database:'unavailable',error:'MySQL connection is unavailable. Check the local database configuration.'}); }
    }
    if(!['GET','HEAD'].includes(req.method)) {
      const origin=req.headers.origin;
      const expected=hosting.origin;
      if(origin && origin!==expected) fail(403,'Request origin is not allowed.');
      if(req.headers['sec-fetch-site']==='cross-site') fail(403,'Cross-site request rejected.');
    }
    if(req.method==='POST' && url.pathname==='/api/login') {
      const ip=req.socket.remoteAddress; const now=Date.now();
      for(const [key,value] of attempts) if(now-value.start>600000) attempts.delete(key);
      const attempt=attempts.get(ip) || {count:0,start:now};
      if(attempt.count>=10) fail(429,'Too many login attempts. Try again in ten minutes.');
      attempt.count++; attempts.set(ip,attempt);
      const input=await body(req);
      const role={admin:'erp',vendor:'vendor',client:'customer'}[input?.portal];
      if(!role) fail(400,'Choose admin, vendor or client login.');
      if(typeof input.email!=='string'||input.email.length>254||typeof input.password!=='string'||input.password.length>1024) fail(400,'Enter your email and password.');
      const [rows]=await pool.execute('SELECT * FROM users WHERE email=? AND active=TRUE',[input.email.trim().toLowerCase()]);
      const user=rows[0]; const [salt,stored]=user?.password_hash.split(':') || ['0'.repeat(32),'0'.repeat(128)];
      const calculated=await derive(input.password,salt,64); const expected=Buffer.from(stored,'hex');
      if(!user||expected.length!==calculated.length||!timingSafeEqual(expected,calculated)) fail(401,'Invalid email or password.');
      if(user.role!==role) fail(403,'This account does not have access to the selected portal.');
      attempts.delete(ip); const token=randomBytes(32).toString('hex');
      await pool.execute('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 8 HOUR))',[hash(token),user.id]);
      return json(res,200,{id:user.id,name:user.name,role:user.role},{'Set-Cookie':`cargo_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${hosting.secureCookie?'; Secure':''}`});
    }
    const user=await currentUser(req);
    if(!user) fail(401,'Sign in to Cargo ASL.');
    if(req.method==='GET' && url.pathname==='/api/me') return json(res,200,user);
    if(req.method==='GET' && url.pathname==='/api/portal') {
      const [records]=await pool.execute('SELECT reference,organization,route,status FROM portal_demo_records WHERE user_id=? ORDER BY id DESC',[user.id]);
      return json(res,200,{records,demo:true});
    }
    if(req.method==='POST' && url.pathname==='/api/logout') {
      const token=/(?:^|;\s*)cargo_session=([a-f0-9]{64})/.exec(req.headers.cookie||'')?.[1];
      if(token) await pool.execute('DELETE FROM sessions WHERE token_hash=?',[hash(token)]);
      return json(res,200,{ok:true},{'Set-Cookie':'cargo_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
    }
    if(user.role!=='erp') fail(403,'This endpoint requires an internal ERP account.');
    if(req.method==='GET'&&url.pathname==='/api/lookups') {
      const [rows]=await pool.query('SELECT id,field_name,label FROM lookup_values WHERE active=TRUE ORDER BY label'); return json(res,200,rows);
    }
    if(req.method==='GET'&&url.pathname==='/api/quotes') {
      const [rows]=await pool.execute('SELECT id,status,version,details,created_at,updated_at FROM quotes WHERE owner_id=? ORDER BY id DESC LIMIT 500',[user.id]); return json(res,200,rows);
    }
    if(req.method==='POST'&&url.pathname==='/api/quotes') {
      const input=await body(req); let data;
      try {data=validateQuote(input);} catch(e) {fail(400,e.message);}
      const conn=await pool.getConnection();
      try {
        await conn.beginTransaction(); await validateRelations(conn,data);
        const [result]=await conn.execute('INSERT INTO quotes(owner_id,details) VALUES(?,?)',[user.id,JSON.stringify(data)]);
        await conn.execute("INSERT INTO audit_log(user_id,entity,entity_id,action) VALUES(?,'quote',?,'create')",[user.id,result.insertId]);
        await conn.commit(); return json(res,201,{id:result.insertId,status:'Draft',version:1});
      } catch(e) {await conn.rollback();throw e;} finally {conn.release();}
    }
    fail(404,'Route not found.');
  } catch(e) {
    if(!e.status) console.error('Request failed:',e.code||e.name);
    json(res,e.status||503,{error:e.status?e.message:'The database is unavailable or has not been initialized.'});
  }
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log(`Cargo ASL listening on http://${process.env.HOST||'127.0.0.1'}:${process.env.PORT||3000}`));
