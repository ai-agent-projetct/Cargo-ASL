export const stages = ['Draft', 'Renegotiate', 'To Approve', 'Approved', 'Sent', 'Expired', 'Cancelled', 'Pricing Team Approval', 'Accepted', 'Rejected'];
export const sections = [
  ['Customer', [['client_id','Customer','relation',true],['client_address_id','Address','relation'],['approving_user_id','Quote Approver','relation',true],['is_courier_shipment','Courier Shipment','boolean'],['is_multimodal','Multimodal Shipment','boolean'],['multi_carrier_quote','Multi Carrier Quote','boolean'],['quote_for','Quote For','Shipment|Service Job'],['shipment_count','Shipment Count','Single|Multiple'],['date','Date','date'],['quote_expiry_date','Quote Expiry Date','date'],['user_id','Sales Agent','relation',true],['company_id','Company','relation',true],['team_id','Sales Team','relation',true],['tag_ids','Tags','text']]],
  ['Mode of Shipment', [['transport_mode_id','Transport Mode','relation',true],['consolidation_type_id','Consolidation Type','relation'],['shipment_type_id','Shipment Type','relation',true],['cargo_type_id','Cargo Type','relation',true]]],
  ['Shipper / Consignee', [['shipper_id','Shipper','relation'],['shipper_address_id','Shipper Address','relation'],['consignee_id','Consignee','relation'],['consignee_address_id','Consignee Address','relation']]],
  ['General Information', [['service_mode_id','Service Mode','relation'],['estimated_pickup','Estimated Pickup','date'],['origin_country_id','Origin Country','relation',true],['transit_time','Transit Time','text'],['portal_cancel_reason','Cancel Reason','text'],['reference_number','Reference Number','text'],['expected_delivery','Expected Delivery','date'],['destination_country_id','Destination Country','relation',true],['incoterm_id','Incoterms','relation',true]]],
  ['Additional Info', [['product_ids','Additional Services','text'],['free_day','Free Day','text']]],
  ['Agent / CoLoader', [['agent_id','Agent','relation'],['agent_address_id','Agent Address','relation'],['co_loader_id','CoLoader','relation'],['co_loader_address_id','CoLoader Address','relation']]],
  ['More Details', [['is_dangerous_good','HAZ?','boolean'],['is_stackables','Stackables?','boolean'],['is_temperature_control','Temperature Control?','boolean']]],
  ['Monetary Details', [['goods_value','Goods Value','money'],['insurance_value','Insurance Value','money']]],
  ['Declared Weight & Volume', [['pack_unit','Packs','integer'],['gross_weight_unit','Gross Weight','number'],['net_weight_unit','Net Weight','number'],['volume_unit','Volume','number'],['cargo_spec','Cargo Specification','text'],['weight_volume_unit','Volumetric Weight','number']]],
];
export function validateQuote(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Quotation must be an object.');
  const output = {};
  for (const [, fields] of sections) for (const [key, label, type, required] of fields) {
    const value = input[key];
    if (required && (value === undefined || value === null || value === '')) throw new Error(`${label} is required.`);
    if (value === undefined || value === null || value === '') continue;
    if (type === 'boolean') { if (typeof value !== 'boolean') throw new Error(`${label} must be a boolean.`); }
    else if (type === 'relation') { if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${label} must be a valid selection.`); }
    else if (type === 'date') { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value) throw new Error(`${label} must be a valid date.`); }
    else if (['money','number','integer'].includes(type)) {
      const pattern = type === 'integer' ? /^\d{1,9}$/ : type === 'money' ? /^\d{1,9}(\.\d{1,2})?$/ : /^\d{1,9}(\.\d{1,4})?$/;
      if (typeof value !== 'string' || !pattern.test(value)) throw new Error(`${label} must be a non-negative ${type === 'integer' ? 'whole number' : 'decimal'}.`);
    } else if (typeof value !== 'string' || value.length > 2000 || (type.includes('|') && !type.split('|').includes(value))) throw new Error(`${label} is invalid.`);
    output[key] = value;
  }
  for (const key of ['note','remarks']) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'string' || input[key].length > 20000) throw new Error(`${key} is too long.`);
      output[key] = input[key];
    }
  }
  return output;
}
