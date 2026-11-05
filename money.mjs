export const scaled=(value,places=2)=>{const [whole,decimal='']=String(value||'0').split('.');if(!/^\d+$/.test(whole)||!/^\d*$/.test(decimal)||decimal.length>places)throw new Error('Invalid decimal precision.');return BigInt(whole)*10n**BigInt(places)+BigInt(decimal.padEnd(places,'0')||'0');};
export const money=value=>value<0n?'-'+money(-value):`${value/100n}.${String(value%100n).padStart(2,'0')}`;
export const round=(value,divisor)=>{if(divisor<=0n)throw Error('Invalid divisor.');return value<0n?-round(-value,divisor):(value+divisor/2n)/divisor;};
export const convert=(amount,rate='1')=>money(round(scaled(amount)*scaled(rate,6),1000000n));
export function totals(charges=[]){
 let cost=0n,revenue=0n,tax=0n;
 const lines=charges.map(line=>{
  const quantity=scaled(line.quantity,4),costFx=scaled(line.cost_exchange_rate||line.exchange_rate||'1',6),sellFx=scaled(line.sell_exchange_rate||line.exchange_rate||'1',6);
  const lineCost=round(scaled(line.cost_rate||'0')*quantity*costFx,10000000000n),lineRevenue=round(scaled(line.sell_rate||'0')*quantity*sellFx,10000000000n);
  const lineTax=line.tax_amount!==undefined?round(scaled(line.tax_amount)*sellFx,1000000n):round(lineRevenue*scaled(line.tax_percent||'0',4),1000000n);
  cost+=lineCost;revenue+=lineRevenue;tax+=lineTax;return {cost:money(lineCost),revenue:money(lineRevenue),tax:money(lineTax),total:money(lineRevenue+lineTax)};
 });
 const profit=revenue-cost;return {cost:money(cost),revenue:money(revenue),tax:money(tax),total:money(revenue+tax),profit:money(profit),margin:revenue?Number(profit*10000n/revenue)/100:0,lines};
}
export function documentTotals(kind,charges=[]){return totals(kind==='vendor_bill'?charges.map(line=>({...line,sell_rate:line.cost_rate,sell_exchange_rate:line.cost_exchange_rate||line.exchange_rate||'1'})):charges);}
export function creditAllocation(invoice,amount){
 const original=totals(invoice.charges),gross=scaled(original.total),credited=scaled(invoice._credits||'0'),value=scaled(amount);
 if(value<=0n||value>gross-credited)throw Error('Credit exceeds the remaining invoice value.');
 const taxUsed=invoice._tax_credits!==undefined?scaled(invoice._tax_credits):credited-scaled(invoice._net_credits||'0'),taxLeft=scaled(original.tax)-taxUsed;
 const tax=value===gross-credited?taxLeft:[taxLeft,round(scaled(original.tax)*value,gross)].reduce((a,b)=>a<b?a:b);
 if(tax<0n)throw Error('Existing credit allocation requires reconciliation before further crediting.');
 return {tax,net:value-tax};
}
