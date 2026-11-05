import {createHash} from 'node:crypto';
export async function consumeLoginAttempt(pool,address,email){
 const keys=[['ip:'+address,100],['account:'+String(email||'').trim().toLowerCase(),10]];
 for(const [identity,limit]of keys){const key=createHash('sha256').update(identity).digest('hex');await pool.execute('INSERT INTO login_limits(limiter_key,attempts,window_start) VALUES(?,1,UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE attempts=IF(window_start<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 10 MINUTE),1,attempts+1),window_start=IF(window_start<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 10 MINUTE),UTC_TIMESTAMP(),window_start)',[key]);const [[row]]=await pool.execute('SELECT attempts FROM login_limits WHERE limiter_key=?',[key]);if(row.attempts>limit)throw Object.assign(Error('Too many login attempts. Try again in ten minutes.'),{status:429});}
}
export async function clearLoginAttempts(pool,email){const key=createHash('sha256').update('account:'+email.trim().toLowerCase()).digest('hex');await pool.execute('DELETE FROM login_limits WHERE limiter_key=?',[key]);}
