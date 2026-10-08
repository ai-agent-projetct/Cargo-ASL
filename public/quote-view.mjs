export function quoteLabel(quote, field, lookups) {
  if (field === 'status') return quote.status;
  return lookups.find(row => row.field_name === field && row.id === quote.details[field])?.label || 'Not Available';
}
export function filterQuotes(quotes, lookups, {query='', currentMonth=false, month=new Date().toISOString().slice(0,7), drill=null}={}) {
  const search=query.trim().toLowerCase();
  return quotes.filter(quote => {
    if(currentMonth && String(quote.created_at).slice(0,7)!==month) return false;
    if(drill && quoteLabel(quote,drill.field,lookups)!==drill.label) return false;
    const labels=lookups.filter(row=>quote.details[row.field_name]===row.id).map(row=>row.label);
    return !search || [`ASL-Q-${quote.id}`,quote.status,...Object.values(quote.details),...labels].join(' ').toLowerCase().includes(search);
  });
}
export function csvText(rows) {
  return rows.map(row=>row.map(value=>{
    let text=String(value??'');
    if(/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text="'"+text;
    return '"'+text.replaceAll('"','""')+'"';
  }).join(',')).join('\r\n');
}
