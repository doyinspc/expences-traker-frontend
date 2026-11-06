import { PROCUREMENT_DOCUMENT_LABEL } from './documentLabels.js';
export const financialDocumentNames={2:PROCUREMENT_DOCUMENT_LABEL,3:'Cash advance',7:'Income'};

export function reportCents(value) {
  const text=String(value??'').trim();
  if(!/^-?\d+(?:\.\d{1,2})?$/.test(text))return null;
  const negative=text.startsWith('-'),[whole,fraction='']=text.replace(/^-/,'').split('.');
  const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  return Number.isSafeInteger(cents)?(negative?-cents:cents):null;
}
export function reportDecimal(cents) {
  if(!Number.isSafeInteger(cents))return null;
  const value=Math.abs(cents);
  return `${cents<0?'-':''}${Math.floor(value/100)}.${String(value%100).padStart(2,'0')}`;
}
export function formatReportMoney(value,currency='') {
  if(value===null||value===undefined||!Number.isFinite(Number(value)))return '—';
  const code=String(currency||'').toUpperCase();
  try{return new Intl.NumberFormat(undefined,{...( /^[A-Z]{3}$/.test(code)?{style:'currency',currency:code}:{}),minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value));}
  catch{return Number(value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
}
export function incomeExpenseGroups(data=[]) {
  const groups=new Map();
  for(const row of data){
    const type=Number(row.document_type);
    if(![2,3,7].includes(type)||row.resolved!==undefined&&Number(row.resolved)!==1)continue;
    const currency=String(row.currency_code||'').trim().toUpperCase();
    const currencyId=Number(row.currency_id)||0;
    const key=currencyId>0?`id:${currencyId}`:/^[A-Z]{3}$/.test(currency)?`code:${currency}`:'unassigned';
    if(!groups.has(key))groups.set(key,{key,currency,currencyId,label:currency|| (currencyId?`Currency #${currencyId}`:'Currency not set'),rows:[],expenses:[],income:[],procurementCents:0,advanceCents:0,incomeCents:0,invalidAmounts:0});
    const group=groups.get(key);group.rows.push(row);
    (type===7?group.income:group.expenses).push(row);
    const value=reportCents(type===7?(row.income_amount??row.credit_amount):(row.expense_amount??row.total_amount));
    if(value===null){group.invalidAmounts++;continue;}
    const field=type===7?'incomeCents':type===2?'procurementCents':'advanceCents';
    if(!Number.isSafeInteger(group[field]+value)){group.invalidAmounts++;continue;}
    group[field]+=value;
  }
  return [...groups.values()].map(group=>{
    const expenseCents=group.procurementCents+group.advanceCents,netCents=group.incomeCents-expenseCents;
    const valid=/^[A-Z]{3}$/.test(group.currency)&&group.invalidAmounts===0&&Number.isSafeInteger(expenseCents)&&Number.isSafeInteger(netCents);
    return {...group,valid,totals:{income:valid?reportDecimal(group.incomeCents):null,procurement:valid?reportDecimal(group.procurementCents):null,cashAdvances:valid?reportDecimal(group.advanceCents):null,expenses:valid?reportDecimal(expenseCents):null,net:valid?reportDecimal(netCents):null}};
  });
}

/**
 * Group recognised income and expense events by the financial event month.
 * Returns integer-cent totals so monthly net balances do not accumulate
 * floating-point rounding errors. Undated rows stay visible in a separate bucket.
 */
export function incomeExpenseMonthlyReconciliation(rows=[]) {
  const months=new Map();
  for(const row of rows){
    const type=Number(row.document_type);
    if(![2,3,7].includes(type)||row.resolved!==undefined&&Number(row.resolved)!==1)continue;
    const date=String(row.resolved_date||'').slice(0,10);
    const key=/^\d{4}-\d{2}-\d{2}$/.test(date)?date.slice(0,7):'undated';
    if(!months.has(key))months.set(key,{key,label:key==='undated'?'Date not recorded':new Date(`${key}-01T00:00:00`).toLocaleDateString(undefined,{year:'numeric',month:'long'}),incomeCents:0,expenseCents:0,count:0,invalidAmounts:0});
    const month=months.get(key);
    month.count++;
    const cents=reportCents(type===7?(row.income_amount??row.credit_amount):(row.expense_amount??row.total_amount));
    if(cents===null){month.invalidAmounts++;continue;}
    const field=type===7?'incomeCents':'expenseCents';
    if(!Number.isSafeInteger(month[field]+cents)){month.invalidAmounts++;continue;}
    month[field]+=cents;
  }
  return [...months.values()].sort((a,b)=>a.key==='undated'?1:b.key==='undated'?-1:b.key.localeCompare(a.key)).map(month=>{
    const netCents=month.incomeCents-month.expenseCents;
    const valid=month.invalidAmounts===0&&Number.isSafeInteger(netCents);
    return {...month,valid,totals:{income:valid?reportDecimal(month.incomeCents):null,expenses:valid?reportDecimal(month.expenseCents):null,net:valid?reportDecimal(netCents):null}};
  });
}

export function incomeExpenseCsvRows(rows=[]) {
  return rows.filter(row=>[2,3,7].includes(Number(row.document_type))).map(row=>{
    const income=Number(row.document_type)===7;
    const cents=reportCents(income?(row.income_amount??row.credit_amount):(row.expense_amount??row.total_amount));
    const amount=reportDecimal(cents);
    const classification=income?'Income':row.type!==null&&row.type!==undefined&&row.type!==''&&Number(row.type)===0?'OPEX':Number(row.type)===1?'CAPEX':'Not classified';
    return [row.category_name||'Uncategorized',row.item_name||'',row.account_name||'',financialDocumentNames[Number(row.document_type)],amount,classification,row.resolved_date||'',row.location_name||'',row.currency_code||(row.currency_id?`Currency #${row.currency_id}`:'Currency not set'),income?'0.00':amount,income?amount:'0.00',cents===null?'':reportDecimal(income?cents:-cents),row.workflow_state||'Historical record',row.financial_kind||'Historical entry',row.payment_reference||''];
  });
}
