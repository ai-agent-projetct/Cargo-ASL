export const landSeaLegs=[
 {id:'ROAD',mode:'Road Freight',cargo_type:'Full Truck Load',origin:'Aster Yard',destination:'Aster Port',origin_country:'Netherlands',destination_country:'Netherlands',carrier:'Willow Roadways',departure:'2026-11-10',arrival:'2026-11-10'},
 {id:'SEA',mode:'Sea Freight',cargo_type:'Full Container Load',origin:'Aster Port',destination:'Copper Port',origin_country:'Netherlands',destination_country:'Germany',carrier:'Copper Maritime',departure:'2026-11-11',arrival:'2026-11-14'}
];
export const railLeg={id:'RAIL',mode:'Rail Freight',cargo_type:'Full Container Load',origin:'Copper Port',destination:'Willow Terminal',origin_country:'Germany',destination_country:'Germany',carrier:'Juniper Rail',departure:'2026-11-15',arrival:'2026-11-16'};
export const journeyScenarios=[
 {key:'land-sea',label:'Land + Sea',legs:landSeaLegs,cost:'400.00',revenue:'620.00',tax:'31.00',total:'651.00',profit:'220.00'},
 {key:'land-sea-rail',label:'Land + Sea + Train',legs:[...landSeaLegs,railLeg],cost:'600.00',revenue:'920.00',tax:'46.00',total:'966.00',profit:'320.00'}
];
export const legCosts={ROAD:'100.00',SEA:'300.00',RAIL:'200.00'};
export const legSellingPrices={ROAD:'150.00',SEA:'450.00',RAIL:'300.00'};
export function fictionalInvoicePdf(number,total){
 const escape=value=>String(value).replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
 const stream=`BT /F1 12 Tf 40 750 Td (Cargo ASL QA - Fictional invoice - No real cargo) Tj 0 -24 Td (Invoice: ${escape(number)}) Tj 0 -24 Td (Total: USD ${escape(total)}) Tj ET`;
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
 let pdf='%PDF-1.4\n';const offsets=[];for(const [i,object]of objects.entries()){offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${object}\nendobj\n`;}
 const xref=Buffer.byteLength(pdf);pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return Buffer.from(pdf);
}
