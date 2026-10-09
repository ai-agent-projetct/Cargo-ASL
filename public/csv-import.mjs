export function parseCsv(text){
 if(typeof text!=='string'||text.length>100000)throw new Error('CSV must be text below 100 KB.');
 text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c==='"'){if(cell||closed)throw new Error('Invalid CSV quoting.');quoted=true;}
  else if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(value=>value!==''))rows.push(row);row=[];}}
  else{if(closed)throw new Error('Unexpected text after a quoted CSV field.');cell+=c;}
 }
 if(quoted)throw new Error('CSV has an unclosed quote.');row.push(cell);if(row.some(value=>value!==''))rows.push(row);
 if(rows.length>101)throw new Error('CSV supports at most 100 data rows.');if(rows.some(row=>row.length!==rows[0].length))throw new Error('CSV rows have inconsistent columns.');return rows;
}
