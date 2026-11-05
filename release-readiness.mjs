export function releaseChecks(env,profile,{demoAccounts=0,missingSupplierProfiles=0}={}){
 const checks=[
  ['https','Public HTTPS origin',/^https:\/\//.test(env.APP_ORIGIN||'')],
  ['database','Cloud MySQL host configured',Boolean(env.MYSQL_HOST)&&!['localhost','127.0.0.1','::1'].includes(env.MYSQL_HOST)],
  ['tls','Verified database TLS',env.MYSQL_SSL==='true'||env.VERCEL==='1'],
  ['issuer','Verified legal issuer and registered address',Boolean(profile?.verified&&profile.name&&profile.address&&profile.country&&!/demonstration|fictional|\bQA\b/i.test(profile.name))],
  ['vat','VAT identity configured',Boolean(profile)&&(!profile.vat_registered||/^\d{15}$/.test(profile.vat||''))],
  ['bank','Payment beneficiary configured',Boolean(profile?.bank&&profile?.iban)],
  ['accounts','Demo accounts removed or deactivated',demoAccounts===0],
  ['suppliers','Vendor legal entities linked',missingSupplierProfiles===0],
  ['backups','Backup/restore and monitoring confirmed',env.OPERATIONS_VERIFIED==='true']
 ].map(([id,label,passed])=>({id,label,passed}));return {ready:checks.every(c=>c.passed),mode:env.NODE_ENV||'development',checks};
}
export function assertProductionEnvironment(env){if(env.NODE_ENV!=='production')return;if(!/^https:\/\//.test(env.APP_ORIGIN||''))throw Error('Production requires APP_ORIGIN with HTTPS.');if(env.MYSQL_SSL!=='true'&&env.VERCEL!=='1')throw Error('Production requires verified MySQL TLS.');for(const key of ['MYSQL_HOST','MYSQL_USER','MYSQL_PASSWORD','MYSQL_DATABASE'])if(!env[key])throw Error('Production requires '+key+'.');}
