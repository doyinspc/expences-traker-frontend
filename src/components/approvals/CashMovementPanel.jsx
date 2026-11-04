import React, {useRef,useState} from 'react';
import {formatReportMoney,reportDecimal} from '../../utils/functions/incomeExpenseReport';

const control='mt-1 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
/**
 * Purpose: show actual item cash and offer only server-authorised payment/return actions.
 *
 * Algorithm:
 * 1. Keep local kind/item/amount/date/reference/confirmation state; hide the panel when
 *    the backend has not configured the cash milestone or supplied a cash summary.
 * 2. Build action choices from can_pay/can_refund and the saved balances. A payment pause
 *    or return requirement therefore cannot be bypassed by changing a local dropdown.
 * 3. Offer only items with remaining allowance: planned minus gross paid for payment,
 *    or paid minus already returned for a return. Keep rejected paid lines visible for refunds.
 * 4. Display approved/payable, gross paid, returned, net paid, unpaid and money due for return.
 * 5. Require actual-movement confirmation and submit a stable request key for safe retry.
 * 6. Show immutable event history with dates, references and actors; do not treat final
 *    closure as another payment or a returned amount as income.
 *
 * The server independently checks every cap, role, location, date and workflow version.
 * These controls record money already moved; they do not initiate a bank transaction.
 */
export default function CashMovementPanel({workflow,onSave,isLoading=false}) {
  const cash=workflow.cash_movements;
  const [kind,setKind]=useState('payment'),[itemId,setItemId]=useState(''),[amount,setAmount]=useState(''),[date,setDate]=useState(cash?.today||''),[reference,setReference]=useState(''),[confirmed,setConfirmed]=useState(false),[error,setError]=useState('');
  const requestKey=useRef(''),saving=useRef(false);
  if(!cash||!workflow.finance?.enabled)return null;
  const currency=workflow.document_data?.currency_code||'';
  const options=[...(cash.can_pay&&Number(cash.unpaid)>0?[['payment','Record payment']]:[]),...(cash.can_refund&&Number(cash.net_paid)>0?[['refund','Record money returned']]:[])];
  const action=options.some(([value])=>value===kind)?kind:options[0]?.[0];
  const items=(workflow.document_items||[]).filter(item=>{const value=cash.lines?.[item.id];return value&&(action==='payment'?value.planned-value.paid:value.paid-value.returned)>0;});
  const selected=cash.lines?.[itemId],available=selected?(action==='payment'?selected.planned-selected.paid:selected.paid-selected.returned):0;
  const busy=isLoading||saving.current;
  /**
   * Purpose: submit one confirmed actual cash event with a retry-safe UI request key.
   *
   * Algorithm: prevent duplicate submission; validate selected item, positive decimal amount,
   * actual date, reference and confirmation; create a request key once; await the parent save;
   * clear completed inputs/key only on success; retain error/key for safe retry on failure;
   * always release the synchronous saving guard. The backend detects changed-key reuse and
   * stale versions, and the parent refreshes the authoritative cash summary after a save.
   */
  const submit=async event=>{
    event.preventDefault();if(saving.current||isLoading)return;setError('');
    if(!itemId||!/^\d+(?:\.\d{1,2})?$/.test(amount)||Number(amount)<=0||!date||!reference.trim()||!confirmed){setError('Choose the item, amount, actual date and reference, then confirm the cash movement.');return;}
    if(!requestKey.current)requestKey.current=globalThis.crypto.randomUUID().replaceAll('-','');
    saving.current=true;
    try{await onSave({kind:action,item_id:itemId,amount,movement_date:date,reference:reference.trim(),confirmation:'RECORD_CASH',request_key:requestKey.current});requestKey.current='';setAmount('');setReference('');setConfirmed(false);}
    catch(failure){setError(failure.response?.data?.message||failure.message||'Cash movement could not be saved.');}
    finally{saving.current=false;}
  };
  const names=new Map((workflow.document_items||[]).map(item=>[String(item.id),item.item_name||item.name||item.description||`Item ${item.id}`]));
  return <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900" aria-label="Payments and refunds">
    <div><h2 className="font-semibold">Payments and money returned</h2><p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Record the actual amount against each item. Returns reduce spending and budget usage on their recorded date. These entries record cash already moved; they do not send a bank payment.</p></div>
    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{[['Approved amount',cash.planned],['Paid',cash.paid],['Returned',cash.refunded],['Net paid',cash.net_paid],...(Number(cash.refund_due)>0?[['Money due for return',cash.refund_due]]:[]),[cash.unpaid_cancelled?'Unpaid balance closed':'Not yet disbursed',cash.unpaid]].map(([label,value])=><div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"><dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt><dd className="mt-1 font-semibold tabular-nums">{formatReportMoney(value,currency)}</dd></div>)}</dl>
    {options.length>0?<form onSubmit={submit} className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800"><fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Action<select className={control} value={action} onChange={event=>{setKind(event.target.value);setItemId('');setAmount('');setConfirmed(false);requestKey.current='';}}>{options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm">Item *<select required className={control} value={itemId} onChange={event=>{setItemId(event.target.value);setAmount('');setConfirmed(false);requestKey.current='';}}><option value="">Choose item</option>{items.map(item=><option key={item.id} value={item.id}>{names.get(String(item.id))}</option>)}</select></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Amount *<input required inputMode="decimal" type="number" min="0.01" step="0.01" max={reportDecimal(available)||undefined} value={amount} onChange={event=>setAmount(event.target.value)} className={control}/>{itemId&&<span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">Maximum: {formatReportMoney(reportDecimal(available),currency)}</span>}</label><label className="text-sm">Actual payment / return date *<input required type="date" max={cash.today} value={date} onChange={event=>setDate(event.target.value)} className={control}/></label></div>
      <label className="block text-sm">Payment / return reference or explanation *<input required maxLength={200} value={reference} onChange={event=>setReference(event.target.value)} className={control}/></label>
      <label className="flex min-h-11 items-start gap-2 text-sm"><input required type="checkbox" className="mt-1" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/><span>I confirm this money has actually been {action==='refund'?'returned':'paid'}. The entry will update spending and budget usage.</span></label>
      {error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={busy}>{busy?'Saving…':action==='refund'?'Record return':'Record payment'}</button>
    </fieldset></form>:<p className="text-xs text-gray-500 dark:text-gray-400">Payments require the configured disbursement role. That role or the current reconciliation approver can record returns. After closure, the disbursement role can record a financial return.</p>}
    {cash.entries.length>0&&<div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="py-2 text-left font-medium">Payment and return history</caption><thead><tr>{['Date','Entry','Item','Amount','Reference','Recorded by'].map(label=><th key={label} className="whitespace-nowrap px-2 py-2 text-xs text-gray-500 dark:text-gray-400">{label}</th>)}</tr></thead><tbody>{cash.entries.flatMap(entry=>entry.lines.map(line=><tr key={`${entry.key}:${line.id}`} className="border-t border-gray-100 dark:border-gray-800"><td className="whitespace-nowrap px-2 py-3">{entry.at}</td><td className="px-2 py-3">{entry.kind==='refund'?'Return':'Payment'}</td><td className="px-2 py-3">{names.get(String(line.id))||`Item ${line.id}`}</td><td className="whitespace-nowrap px-2 py-3 tabular-nums">{entry.kind==='refund'?'−':''}{formatReportMoney(line.amount,currency)}</td><td className="px-2 py-3">{entry.reference}</td><td className="px-2 py-3">{entry.actor_name||`Staff ${entry.by}`}</td></tr>))}</tbody></table></div>}
  </section>;
}
