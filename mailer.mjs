import nodemailer from 'nodemailer';
export function smtpSettings(env=process.env){
 if(!env.SMTP_HOST||!env.SMTP_FROM)return null;
 const port=Number(env.SMTP_PORT||587);if(![465,587].includes(port))throw new Error('SMTP_PORT must be 465 or 587 for encrypted delivery.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SMTP_FROM))throw new Error('SMTP_FROM must be a valid email address.');
 return {host:env.SMTP_HOST,port,secure:port===465,requireTLS:true,tls:{rejectUnauthorized:true},...(env.SMTP_USER?{auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD||''}}:{}),connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true};
}
export async function deliver(message,env=process.env,createTransport=nodemailer.createTransport){
 const settings=smtpSettings(env);if(!settings)throw new Error('Configure SMTP_HOST and SMTP_FROM to enable email delivery.');
 const transport=createTransport(settings);
 try{return await transport.sendMail({from:env.SMTP_FROM,to:message.recipient,subject:message.subject,text:message.message,messageId:`<cargo-asl-${message.id}@${env.SMTP_FROM.split('@')[1]}>`});}finally{transport.close?.();}
}
