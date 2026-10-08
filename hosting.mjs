export function hostingSettings(env=process.env){
  const cloud=env.VERCEL==='1';
  const origin=env.APP_ORIGIN || (cloud && env.VERCEL_URL?`https://${env.VERCEL_URL}`:`http://${env.HOST||'127.0.0.1'}:${env.PORT||3000}`);
  const ssl=env.MYSQL_SSL==='true'||cloud?{rejectUnauthorized:true,...(env.MYSQL_SSL_CA?{ca:env.MYSQL_SSL_CA.replaceAll('\\n','\n')}:{})}:undefined;
  return {origin,ssl,secureCookie:cloud||env.COOKIE_SECURE==='true'};
}
