import ItemEvidencePanel from '../../components/procurement/ItemEvidencePanel';
import { useEffect, useRef, useState } from 'react';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {API_PATH_SETTING,axiosConfig,tokenHelpers} from '../../actions/common';
import Loader from '../../components/ui/Loader';
import { purchasingStageLabels } from '../../utils/functions/workflowPresentation';
import StockReportCharts from '../Reports/StockReportCharts';

const control='min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white';
const button='min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50';
const quantity=value=>Number(value||0).toLocaleString();
const key=()=>globalThis.crypto.randomUUID().replaceAll('-','');
async function stockRequest(operation,payload={},write=false){
  const response=write?await axios.post(API_PATH_SETTING,{table:'stockledger',cat:operation,...payload},axiosConfig):await axios.get(API_PATH_SETTING,{...axiosConfig,params:{table:'stockledger',cat:'state',data:JSON.stringify(payload)}});
  if(response.data?.success===false||response.data?.status==='error')throw new Error(response.data.message||'Stock could not be loaded.');
  return response.data.data;
}
export function stockReportCsv(rows,year,asof,location){
  const columns=['Item','Category','Unit','Opening quantity','Received from procurement','Issued to requisitions','Closing quantity','Accounting year','As of','Location'];
  const body=rows.map(r=>[r.item_name,r.category_name,r.unit,r.opening_quantity,r.received_quantity,r.issued_quantity,r.closing_quantity,year,asof,location]);
  const cell=v=>'"'+String(v??'').replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"';
  return '\uFEFF'+[columns,...body].map(r=>r.map(cell).join(',')).join('\r\n');
}
function download(rows,year,asof,location){
  const url=URL.createObjectURL(new Blob([stockReportCsv(rows,year,asof,location)],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`Prokure-stock-${asof}.csv`;link.click();URL.revokeObjectURL(url);
}

export default function StockLedgerPanel({documentId=null,documentType=null,onChanged,reportOnly=false}){
  const auth=useSelector(state=>state.auth);
  const location=(auth?.user?.locations||[]).find(row=>String(row.id)===String(auth?.location_id));
  const locationLabel=location?.name || `Location ${auth?.location_id || 'not selected'}`;
  const scope=[auth?.user?.id,auth?.location_id,auth?.role_id,tokenHelpers.getTenantDb(),tokenHelpers.getToken()].join(':');
  return <StockLedgerScope key={scope} scope={scope} documentId={documentId} documentType={documentType} onChanged={onChanged} reportOnly={reportOnly} locationLabel={locationLabel}/>;
}
function StockReviewForm({ line, disabled, onReview }) {
  const [approvedQuantity, setApprovedQuantity] = useState(String(line.stock_review_quantity));
  const [unitPrice, setUnitPrice] = useState(line.stock_review_price ?? '');
  const [reason, setReason] = useState('');
  const released = Math.max(0, Number(approvedQuantity) - Number(line.processed_quantity));
  return (
    <form className="space-y-3 border-t pt-3 dark:border-gray-700" onSubmit={event => {
      event.preventDefault();
      onReview({
        line_id: line.id,
        approved_quantity: approvedQuantity,
        unit_price: unitPrice,
        reason,
        finalize: event.nativeEvent.submitter?.value === 'finalize',
      });
    }}>
      <h4 className="font-medium">Stock review</h4>
      <p className="text-xs">Originally requested {quantity(line.requested_quantity)} {line.unit}.
        {Number(approvedQuantity) > Number(line.requested_quantity) && ' · Quantity increased'}
      </p>
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-sm">Approved quantity
          <input className={control} type="number" min={line.requested_quantity} max="999999999" step="1"
            value={approvedQuantity} onChange={event => setApprovedQuantity(event.target.value)} required disabled={disabled} />
        </label>
        <label className="grid gap-1 text-sm">Estimated unit price
          <input className={control} type="number" min="0" step="0.01"
            value={unitPrice} onChange={event => setUnitPrice(event.target.value)} disabled={disabled} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">Reason
        <textarea className={control} maxLength={2000} required value={reason}
          onChange={event => setReason(event.target.value)} disabled={disabled} />
      </label>
      <p className="text-xs">Record any available issue first. Completing this review will release {quantity(released)} {line.unit} to Purchasing.</p>
      <div className="flex flex-wrap gap-2">
        <button className={control} value="save" disabled={disabled}>Save Stock review</button>
        <button className={button} value="finalize" disabled={disabled}>Complete Stock review</button>
      </div>
    </form>
  );
}

function openingCategoryKey(item) {
  return String(item.category_id ?? item.category_name ?? '');
}

function OpeningStockPicker({ items, itemId, onItemChange, amount, onAmountChange, onAdd, disabled }) {
  const [category, setCategory] = useState('');
  const categories = new Map(items.map(item => [openingCategoryKey(item), item.category_name]));
  const choices = items.filter(item => !category || openingCategoryKey(item) === category);
  if (!items.length) return <p className="text-sm">No stockable catalogue items are available. In Expense/Income Settings, set up a Goods child item with a unit of measure.</p>;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="grid min-w-40 gap-1 text-sm">
        Category filter
        <select className={control} value={category} disabled={disabled} onChange={event => {
          setCategory(event.target.value);
          onItemChange('');
        }}>
          <option value="">All categories</option>
          {[...categories].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <label className="grid min-w-48 flex-1 gap-1 text-sm">
        Goods item
        <select aria-label="Opening stock item" className={control} value={itemId} disabled={disabled}
          onChange={event => onItemChange(event.target.value)}>
          <option value="">Choose the specific item</option>
          {choices.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.unit}{!category && item.category_name ? ' · ' + item.category_name : ''}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Opening quantity
        <input className={control + ' w-36'} type="number" min="1" max="999999999" step="1"
          value={amount} disabled={disabled} onChange={event => onAmountChange(event.target.value)} />
      </label>
      <button className={control} disabled={disabled || !itemId || !amount} onClick={onAdd}>Add opening row</button>
    </div>
  );
}

function StockLedgerScope({scope,documentId,documentType,onChanged,reportOnly,locationLabel}){
  const initialTab = reportOnly ? 'balance' : [2, 9].includes(Number(documentType)) ? 'receipt' : 'issue';
  const [year,setYear]=useState(0),[asof,setAsof]=useState(''),[tab,setTab]=useState(initialTab);
  const [search,setSearch]=useState(''),[line,setLine]=useState(null),[amount,setAmount]=useState(''),[date,setDate]=useState(''),[direct,setDirect]=useState(false);
  const [queueFilter, setQueueFilter] = useState('all');
  const [evidenceIds,setEvidenceIds]=useState([]);
  const [receiptId, setReceiptId] = useState('');
  const [delivery,setDelivery]=useState(''),[receivedNew,setReceivedNew]=useState(false);
  const [openRows,setOpenRows]=useState([]),[itemId,setItemId]=useState(''),[openingAmount,setOpeningAmount]=useState('');
  const [review,setReview]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const stockDialog = useRef(null);
  const lineHeading = useRef(null);
  const confirmHeading = useRef(null);
  useEffect(() => {
    const dialog = stockDialog.current;
    if (line || review) {
      if (!dialog.open) dialog.showModal();
      (review ? confirmHeading : lineHeading).current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [line, review]);

  function closeStockDialog() {
    if (busy) return;
    setLine(null);
    setReview(null);
    setError('');
  }

  const query=useQuery({queryKey:['stock-ledger',scope,year,asof,tab==='issue'?'issue':'receipt',documentId],queryFn:()=>stockRequest('state',{year_offset:year,...(documentId?{document_id:documentId}:{}),...(asof?{as_of:asof}:{}),candidate_type:tab==='issue'?'issue':'receipt'}),staleTime:0});
  const data=query.data,period=data?.active_period,range=data?.period;
  // Opening controls physical movements. The approval queue can be reviewed before opening.
  const mainStock = !reportOnly && !documentId;
  const view = mainStock ? tab : !period && tab !== 'issue' ? 'opening' : period && tab === 'opening' ? initialTab : tab;
  const views = mainStock
    ? [['issue', 'Requisition queue'], ['receipt', 'Receive goods'], ['balance', 'Stock balances'],
      ['history', 'Movement history'], ['opening', 'Opening stock']]
    : period
    ? (reportOnly
      ? [['balance', 'Balance report'], ['history', 'Movement history']]
      : [['issue', 'Requisition queue'], ['receipt', 'Receive goods'], ['balance', 'Stock balances'], ['history', 'Movement history']])
    : [['issue', 'Requisition queue'], ['opening', 'Opening stock']];
  const changeTab=value=>{setTab(value);if(value==='issue')setAsof('');setReview(null);setLine(null);setError('');setMessage('');};
  const changeYear=value=>{setYear(Number(value));if(tab==='opening')setTab(initialTab);setAsof('');setReview(null);setLine(null);setOpenRows([]);setItemId('');setOpeningAmount('');setError('');setMessage('');};
  const reviewMovement=()=>{
    if(!line||!/^\d+$/.test(amount)||Number(amount)<1||Number(amount)>Number(line.remaining_quantity)){setError('Enter a positive whole quantity up to the outstanding quantity.');return;}
    if(!date){setError('Choose the actual receipt or issue date.');return;}
    if (tab === 'issue' && line.stock_review_finalized_at && !receiptId) {
      setError('Choose the confirmed Procurement receipt for this issue.');
      return;
    }
    if(tab==='receipt'&&(!delivery.trim()||!receivedNew)){setError('Enter the delivery reference and confirm the goods have not already been counted.');return;}
    setError('');setMessage('');setReview({operation:tab==='issue'?'issue':'receive',label:`${tab==='issue'?'Issue':'Receive'} ${quantity(amount)} ${line.unit} of ${line.item_name}${tab==='receipt'?' · Delivery '+delivery.trim():''}`,payload:{year_offset:year,line_id:line.id,...(receiptId && tab === 'issue' ? { source_line_id: receiptId } : {}),quantity:amount,unit:line.unit,movement_date:date,fulfil_request:tab==='receipt'&&direct&&!Number(line.procurement_id),evidence_ids:evidenceIds,delivery_reference:delivery.trim(),not_in_opening:receivedNew,request_key:key()}});
  };
  const addOpening=()=>{
    const item=data?.items.find(r=>String(r.id)===itemId);
    if(!item||!/^\d+$/.test(openingAmount)||Number(openingAmount)<1){setError('Choose an item and a positive whole opening quantity.');return;}
    if(openRows.some(r=>r.item_id===item.id)){setError('This item is already in the opening list. Remove its row before correcting it.');return;}
    setOpenRows([...openRows,{item_id:item.id,name:item.name,unit:item.unit,quantity:openingAmount}]);setItemId('');setOpeningAmount('');setReview(null);setError('');
  };
  const reviewOpening=mode=>{setError('');setMessage('');setReview({operation:'open',label:mode==='carry'?`Close the previous stock year and carry its closing quantities into ${range.label}`:`Confirm ${openRows.length?openRows.length+' counted opening item(s)':'a ZERO opening balance'} for ${range.label}`,payload:{year_offset:year,opening_mode:mode,opening_rows:mode==='manual'?openRows.map(({item_id,unit,quantity})=>({item_id,unit,quantity})):[],request_key:key()}});};
  function reviewStockDecision(payload) {
    setError('');
    setReview({
      operation: 'review',
      payload,
      label: payload.finalize ? 'Complete the Stock review and release any unissued quantity to Purchasing.'
        : 'Save the approved quantity and estimated price before issuing stock.',
    });
  }
  const confirm=async()=>{
    if(busy||!review)return;setBusy(true);setError('');
    try{const result=await stockRequest(review.operation,{...review.payload,confirmation:review.operation==='prepare'?'PREPARE_STOCK':review.operation==='review'?'CONFIRM_STOCK_REVIEW':'CONFIRM_STOCK'},true);setMessage(result.message);setReview(null);setLine(null);setOpenRows([]);setAmount('');if(review.operation==='open')setTab(initialTab);await query.refetch();onChanged?.();}
    catch(failure){setError(failure.response?.data?.message||failure.message||'Stock could not be saved.');}
    finally{setBusy(false);}
  };
  const matches=row=>[row.item_name,row.category_name,row.unit,row.title,row.document_id,row.reference].join(' ').toLowerCase().includes(search.trim().toLowerCase());
  const rows=(data?.rows||[]).filter(matches);
  const matchingCandidates=(data?.candidates||[]).filter(row=>(!documentId||Number(row.document_id)===Number(documentId))&&matches(row));
  function queueStatus(row) {
    if (row.linked_receipts?.length) return 'ready';
    if (row.stock_review_finalized_at) return 'purchasing';
    return 'review';
  }
  const candidates = view === 'issue' && queueFilter !== 'all'
    ? matchingCandidates.filter(row => queueStatus(row) === queueFilter)
    : matchingCandidates;
  const writable=data?.can_write&&period&&!period.closed_at;
  const canReviewLine = row => view === 'issue' && data.can_review && row.stock_review_id && !row.stock_review_finalized_at;
  function stockOnHand(item) {
    if (!period) return null;
    const itemBalances = (data?.rows || []).filter(row => Number(row.item_id) === Number(item.item_id));
    if (itemBalances.some(row => Number(row.unit_mismatch) || Number(row.closing_quantity) < 0)) return null;
    return Number(itemBalances.find(row => row.unit === item.unit)?.closing_quantity || 0);
  }
  const stockTabs = (
          <div className="flex flex-wrap gap-2" aria-label="Stock views">
            {views.map(([value, label]) => (
              <button key={value} disabled={busy} aria-pressed={view === value}
                className={control + (view === value ? ' border-blue-500 font-semibold text-blue-700 dark:text-blue-300' : '')}
                onClick={() => changeTab(value)}>{label}</button>
            ))}
          </div>
  );
  const errorNotice = error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  return <section aria-label="Stock balances and movements" aria-busy={busy} className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:p-5">
    <p className="text-sm font-medium">{locationLabel}</p>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{reportOnly?'Stock balance report':'Stock balances & movements'}</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Review approved Goods for the selected location. Confirm the accounting year’s opening balance before recording physical receipts or issues. Each quantity uses the item’s saved unit.</p></div><button className={control} disabled={busy||query.isFetching} onClick={()=>{setReview(null);query.refetch();}}>Refresh stock</button></div>
    {mainStock && stockTabs}
    {query.isPending?<div className="relative min-h-48"><Loader text="Loading stock balances…"/></div>:query.error?<p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{query.error.response?.data?.message||query.error.message} <button className="underline" onClick={()=>query.refetch()}>Retry</button></p>:data&&<>
      {!data.schema_ready?<div role="alert" className="space-y-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"><p>The stock quantity history has not been prepared on this server. No stock balance can be verified yet.</p>{!reportOnly&&data.can_prepare?<><p>Keep a current database backup before preparing stock tracking. This adds quantity history and a procurement quantity field; it retains existing users, settings, documents and workflows.</p><button disabled={busy} className={button} onClick={()=>setReview({operation:'prepare',label:'Prepare stock tracking while retaining existing records',payload:{}})}>Review stock setup</button></>:<p>A Super Admin with Full Stock access can prepare stock tracking here.</p>}</div>:!range?<p role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">Set the accounting-year start in Company Profile before opening stock.</p>:<>
        <div className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-sm">Accounting year<select aria-label="Stock accounting year" value={year} disabled={busy} className={control} onChange={e=>changeYear(e.target.value)}>{data.years.map(r=><option key={r.offset} value={r.offset}>{r.label} · {r.start_date} to {r.end_date}</option>)}</select></label><label className="grid gap-1 text-sm">Find an item<input aria-label="Find stock item" className={control} value={search} onChange={e=>setSearch(e.target.value)} placeholder={view === 'issue' ? 'Requisition or item' : view === 'receipt' ? 'Procurement or item' : 'Item, category or reference'}/></label>{period&&<span className={`rounded-full px-3 py-1 text-xs font-medium ${period.closed_at?'bg-gray-100 dark:bg-gray-700':'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'}`}>{period.closed_at?'Closed stock year':'Open stock year'}</span>}</div>

        {Number(data.unverified_legacy_lines)>0&&<p role="status" className="rounded-lg border border-amber-300 p-3 text-sm text-amber-800 dark:border-amber-700 dark:text-amber-200">{data.unverified_legacy_lines} older stock-linked line(s) are retained for reference. Their old links do not prove physical receipts or issues. This report uses confirmed opening quantities and evidenced movements; avoid entering goods already included in the opening balance as another receipt.</p>}
        {!mainStock && (!reportOnly || period) && stockTabs}
        {mainStock && !period && !['issue', 'opening'].includes(view) ? (
          <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-sm">Confirm this location’s opening stock to use this tab.</p>
            <button className={control} onClick={() => changeTab('opening')}>Set opening stock</button>
          </div>
        ) : view === 'opening' && period ? (
          <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h3 className="font-semibold">Opening stock confirmed</h3>
            <p className="text-sm">See each item’s opening quantity in Stock balances.</p>
            <button className={control} onClick={() => changeTab('balance')}>View stock balances</button>
          </div>
        ) : view === 'opening' ? <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/20"><h3 className="font-semibold">Opening balance required</h3><p className="text-sm leading-6">Confirm quantities held at the start of this accounting year. Opening balances do not create purchases or expenses. Once confirmed, quantities are protected from direct editing.</p>
          {reportOnly?<p className="text-sm">Open Stock under Requests &amp; Documents to confirm this location’s opening balance before generating a stock report.</p>:!data.can_open?<p className="text-sm">A staff member with Full Stock access must confirm this location’s opening balance.</p>:data.previous_period?<><p className="text-sm">The preceding stock year is available. Review its closing report before carrying it forward. Carrying closes that year and prevents later postings to it.</p><button disabled={busy} className={button} onClick={()=>reviewOpening('carry')}>Review carry forward</button></>:data.has_history?<p role="alert" className="text-sm text-amber-700 dark:text-amber-200">Stock history already exists at this location. Select and carry forward each consecutive accounting year; a second manual opening is not allowed.</p>:<>
            <p className="text-sm">For first-time setup, enter the counted stock at {range.start_date}. Choose a previous year above if you need to start there. Do not include receipts that you will record separately.</p>
            <OpeningStockPicker key={year} items={data.items} itemId={itemId} amount={openingAmount} disabled={busy}
              onItemChange={value => { setItemId(value); setReview(null); setError(''); }}
              onAmountChange={value => { setOpeningAmount(value); setReview(null); }} onAdd={addOpening} />
            {openRows.length>0&&<ul className="divide-y divide-gray-200 dark:divide-gray-700">{openRows.map(r=><li key={r.item_id} className="flex items-center justify-between gap-3 py-2 text-sm"><span>{r.name} — {quantity(r.quantity)} {r.unit}</span><button disabled={busy} className="min-h-11 px-2 text-red-600 dark:text-red-300" onClick={()=>{setOpenRows(openRows.filter(i=>i.item_id!==r.item_id));setReview(null);}}>Remove {r.name}</button></li>)}</ul>}
            <button disabled={busy} className={button} onClick={()=>reviewOpening('manual')}>Review {openRows.length?'opening balance':'zero opening balance'}</button>
          </>}
        </div>:<>
          {query.isFetching?<p role="status" className="py-8 text-sm">Refreshing stock details…</p>:tab==='balance'?<>
            <div className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-sm">Report as of<input aria-label="Stock report as of" type="date" min={range.start_date} max={range.end_date<data.today?range.end_date:data.today} value={asof||data.as_of||''} disabled={busy} className={control} onChange={e=>setAsof(e.target.value)}/></label><button className={control} disabled={!rows.length||rows.some(r=>Number(r.unit_mismatch)||Number(r.closing_quantity)<0)} onClick={()=>download(rows,range.label,data.as_of,locationLabel)}>Export stock report</button></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="py-3 text-left text-xs text-gray-500 dark:text-gray-300">{locationLabel} · {range.label} · As of {data.as_of}. Zero and missing records are distinguished by the confirmed opening year.</caption><thead className="bg-gray-50 dark:bg-gray-900"><tr>{['Item / category','Unit','Opening','Received','Issued','Closing'].map(t=><th key={t} className="whitespace-nowrap px-3 py-3">{t}</th>)}</tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">{rows.map(r=><tr key={`${r.item_id}:${r.unit}`}><td className="px-3 py-3"><span className="font-medium">{r.item_name}</span><span className="block text-xs text-gray-500 dark:text-gray-300">{r.category_name}</span></td><td className="px-3 py-3">{r.unit}</td>{[r.opening_quantity,r.received_quantity,r.issued_quantity].map((n,i)=><td key={i} className="px-3 py-3 tabular-nums">{quantity(n)}</td>)}<td className="px-3 py-3 font-semibold tabular-nums">{Number(r.unit_mismatch)||Number(r.closing_quantity)<0?<span className="text-red-600 dark:text-red-300">Needs reconciliation</span>:quantity(r.closing_quantity)}</td></tr>)}</tbody></table>{!rows.length&&<p className="py-6 text-sm text-gray-500 dark:text-gray-300">No matching stock movements in this confirmed stock year by the selected date.</p>}</div>
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-300">Closing stock = opening stock + receipts − issues. Quantities retain their saved units. Change location using the location selector in the app header.</p>
            {reportOnly&&<StockReportCharts rows={rows}/>}
          </>:tab==='history'?<>
            <p className="text-xs text-gray-500 dark:text-gray-300">Latest {data.movements.length} of {data.movement_count||0} recorded movements through {data.as_of}. Every entry retains its item, unit, source and staff member.</p>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 dark:bg-gray-900"><tr>{['Date','Item','Movement','Quantity / unit','Reference','Recorded by'].map(t=><th className="px-3 py-3" key={t}>{t}</th>)}</tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">{data.movements.filter(matches).map(m=><tr key={m.id}><td className="whitespace-nowrap px-3 py-3">{m.movement_date}</td><td className="px-3 py-3">{m.item_name}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs ${m.movement_type==='ISSUE'?'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100':m.movement_type==='RECEIPT'?'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100':'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100'}`}>{m.movement_type}</span></td><td className="whitespace-nowrap px-3 py-3 tabular-nums">{Number(m.quantity)>0?'+':''}{quantity(m.quantity)} {m.unit}</td><td className="px-3 py-3">{m.reference}</td><td className="px-3 py-3">{[m.first_name,m.last_name].filter(Boolean).join(' ')||'Staff #'+m.created_by}</td></tr>)}</tbody></table></div>
          </>:<>
            {view === 'issue' && <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Approved stock requisitions</h3>
              <select aria-label="Filter requisitions by status" className={control} value={queueFilter}
                onChange={event => setQueueFilter(event.target.value)}>
                <option value="all">All outstanding</option>
                <option value="review">Needs Stock review</option>
                <option value="purchasing">Sent to Purchasing</option>
                <option value="ready">Ready to issue from receipt</option>
              </select>
            </div>}
            {view === 'receipt' && <h3 className="font-semibold">Outstanding Procurement deliveries</h3>}
            <p className="text-sm leading-6">{view === 'receipt'
              ? 'Record deliveries against approved Procurement. Received goods can then be issued to requisitions.'
              : 'Issue available Goods first. Complete the review to send any shortfall to Purchase Order.'}</p>
            {!writable && <p role="status" className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">
              {!period ? 'Confirm opening stock before recording issues. You can review requests now.'
                : period.closed_at ? 'This stock year is closed. Its quantities remain available for reporting.'
                : 'Stock create/update permission is required to record movements.'}
            </p>}
            {!period && view === 'issue' && <button className={control} onClick={() => changeTab('opening')}>Set opening stock</button>}
            {data.more_candidates&&<p role="status" className="text-sm text-amber-700 dark:text-amber-200">Showing the latest 500 eligible lines. Open the relevant procurement or requisition to record an older line.</p>}
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 dark:bg-gray-900"><tr>{[[view === 'receipt' ? 'Procurement / item' : 'Requisition / item', false], [view === 'receipt' ? 'Expected' : 'Approved', true], [view === 'receipt' ? 'Received' : 'Issued', true], ['Outstanding', false], ['Action', false]].map(([label, desktop]) => <th scope="col" key={label} className={'px-2 py-2 text-xs sm:px-3' + (desktop ? ' hidden sm:table-cell' : '')}>{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">{candidates.map(r=><tr key={r.id}><td className="px-3 py-3"><span className="font-medium">#{r.document_id} · {r.title}</span><span className="block text-xs text-gray-500 dark:text-gray-300">{r.item_name}{view === 'receipt' && r.account_name ? ' · ' + r.account_name : ''}</span>
              {(purchasingStageLabels[r.stock_review_stage_id] || r.linked_receipts?.length) && (
                <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-200">{r.linked_receipts?.length ? 'Ready to issue' : purchasingStageLabels[r.stock_review_stage_id]}</span>
              )}
              </td><td className="hidden px-3 py-2 sm:table-cell">{quantity(r.quantity)} {r.unit}
                {view === 'issue' && Number(r.requested_quantity) !== Number(r.quantity) && (
                  <span className="block text-xs text-gray-500 dark:text-gray-300">Requested {quantity(r.requested_quantity)}</span>
                )}</td><td className="hidden px-3 py-2 sm:table-cell">{quantity(r.processed_quantity)}</td><td className="px-3 py-3 font-medium">{quantity(r.remaining_quantity)} {r.unit}
              {tab === 'issue' && year === 0 && (() => {
                const onHand = stockOnHand(r);
                const shortfall = Number(r.remaining_quantity) - (onHand ?? 0);
                return <span className="mt-1 block text-xs font-normal text-gray-600 dark:text-gray-300">
                  {!period ? 'Opening stock unconfirmed' : onHand == null ? 'Check stock balance' : `${quantity(onHand)} on hand`}
                  {onHand != null && shortfall > 0 ? ` · ${quantity(shortfall)} short` : ''}
                </span>;
              })()}
              </td><td className="px-3 py-3"><button disabled={busy || (!writable && !canReviewLine(r))} className={control} aria-label={(view === 'receipt' ? 'Receive ' : canReviewLine(r) ? 'Review ' : 'Issue ') + r.item_name} onClick={()=>{setLine(r);setReceiptId('');setEvidenceIds([]);setAmount('');setDelivery('');setReceivedNew(false);setDate(data.today<=range.end_date?data.today:range.end_date);setDirect(false);setReview(null);setError('');}}>{view === 'receipt' ? 'Receive' : canReviewLine(r) ? 'Review' : 'Issue'}</button></td></tr>)}</tbody></table></div>
            {!candidates.length&&<p className="py-4 text-sm text-gray-500 dark:text-gray-300">{matchingCandidates.length && queueFilter !== 'all' ? 'No requisitions match this status.' : data.can_read_candidate_documents === false
                ? 'Document view access at this location is required to see these lines.'
                : view === 'issue'
                  ? 'No outstanding approved Goods for this location. The requisition workflow must be complete, and the Goods item must have a saved unit.'
                  : 'No outstanding stockable lines from approved Procurement at this location.'}</p>}

          </>}
        </>}
      </>}
    </>}
    <dialog ref={stockDialog} aria-label={line ? 'Stock item' : 'Stock confirmation'}
      onCancel={event => { event.preventDefault(); closeStockDialog(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl bg-white p-4 text-gray-900 shadow-xl backdrop:bg-black/60 dark:bg-gray-900 dark:text-white sm:p-6">
      {line&&<div hidden={Boolean(review)} className="space-y-3"><div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 ref={lineHeading} tabIndex={-1} className="font-semibold">{line.item_name} · {line.unit}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">#{line.document_id} · {line.title}</p>
                </div>
                <button className={control} disabled={busy} onClick={closeStockDialog}>
                  Close item
                </button>
              </div>
              <dl className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800 sm:grid-cols-4">
                {[[view === 'receipt' ? 'Expected' : 'Requested', line.requested_quantity],
                  [view === 'receipt' ? 'To receive' : 'Approved', line.quantity],
                  [view === 'receipt' ? 'Received' : 'Issued', line.processed_quantity],
                  ['Outstanding', line.remaining_quantity]].map(([label, amount]) => (
                  <div key={label}><dt>{label}</dt><dd className="font-semibold">{quantity(amount)} {line.unit}</dd></div>
                ))}
              </dl>
              {canReviewLine(line) && (
                <StockReviewForm key={line.id} line={line} disabled={busy} onReview={reviewStockDecision} />
              )}
              {writable && view === 'issue' && line.stock_review_finalized_at && (
                line.linked_receipts?.length ? <label className="grid gap-1 text-sm">
                  Confirmed Procurement receipt
                  <select className={control} value={receiptId} disabled={busy}
                    onChange={event => { setReceiptId(event.target.value); setReview(null); }}>
                    <option value="">Select the receipt supplying this requisition</option>
                    {line.linked_receipts.map(receipt => <option key={receipt.id} value={receipt.id}>
                      {receipt.title} · {quantity(receipt.quantity)} {line.unit} available
                    </option>)}
                  </select>
                </label> : <p className="text-sm">Waiting for a confirmed receipt from the linked Procurement.</p>
              )}
              {writable && (view === 'receipt' || Number(line.remaining_quantity) > 0) && <><p className="text-sm">Outstanding: {quantity(line.remaining_quantity)} {line.unit}. {tab==='issue'?`Current stock: ${stockOnHand(line) == null ? 'check balance' : quantity(stockOnHand(line))} ${line.unit}.`:''}</p><div className="flex flex-wrap gap-3"><label className="grid gap-1 text-sm">{tab==='issue'?'Quantity to issue':'Quantity received'} ({line.unit})<input aria-label="Stock movement quantity" type="number" min="1" max={line.remaining_quantity} step="1" disabled={busy} className={control} value={amount} onChange={e=>{setAmount(e.target.value);setReview(null);}}/></label><label className="grid gap-1 text-sm">Actual movement date<input aria-label="Stock movement date" type="date" min={range.start_date} max={range.end_date<data.today?range.end_date:data.today} value={date} disabled={busy} className={control} onChange={e=>{setDate(e.target.value);setReview(null);}}/></label></div>
              {tab==='receipt'&&<><label className="grid gap-1 text-sm">Delivery note / receipt reference<input aria-label="Delivery reference" maxLength={100} value={delivery} disabled={busy} className={control} placeholder="Supplier delivery note or receipt number" onChange={e=>{setDelivery(e.target.value);setReview(null);}}/></label><label className="flex min-h-11 items-start gap-2 text-sm leading-6"><input className="mt-1" type="checkbox" checked={receivedNew} disabled={busy} onChange={e=>{setReceivedNew(e.target.checked);setReview(null);}}/>These goods were physically received and are not already included in opening stock or another receipt.</label></>}
              {tab==='receipt'&&!Number(line.procurement_id)&&Number(line.purchaseorder_id)>0&&Number(line.requisition_id)>0&&Number(line.requisition_id)!==Number(line.purchaseorder_id)&&<label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={direct} disabled={busy} onChange={e=>{setDirect(e.target.checked);setReview(null);}}/>This delivery directly fulfils the linked requisition. Record receipt and issue together.</label>}
              {tab==='receipt' && <ItemEvidencePanel key={line.id} documentId={line.document_id} itemId={line.id} itemName={line.item_name} stockMode initiallyOpen onUploaded={id => {setEvidenceIds(previous => [...new Set([...previous,id])]);setReview(null);}}/>}
              <button disabled={busy || (tab === 'issue' && line.stock_review_finalized_at && !receiptId)} className={button} onClick={reviewMovement}>Review stock {tab==='issue'?'issue':'receipt'}</button>
              </>}
            </div>}
      {review&&<div role="region" aria-label="Review stock movement" className="space-y-3 rounded-lg border-2 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950"><h3 ref={confirmHeading} tabIndex={-1} className="font-semibold">Review before confirming</h3><p className="text-sm">{review.label}</p>{review.operation==='prepare'?<p className="text-sm">Confirm that you have a current database backup. Preparing stock tracking retains existing data and does not invent opening quantities or post expenses. Only a Super Admin with Full Stock access can complete this setup.</p>:review.operation==='review'?<p className="text-sm">The original request and all confirmed issues remain in the record.</p>:review.operation==='open'?<p className="text-sm">{review.payload.opening_mode==='carry'?'The previous year will be locked. Its closing quantities become this year’s opening quantities, without creating an expense.':'Only confirm quantities physically held at the year’s start. A zero opening explicitly means there was no stock then.'}</p>:<p className="text-sm">Date: {review.payload.movement_date}. {review.payload.fulfil_request?'This records both receipt and issue to the linked requisition.':'This changes the stock balance at the selected location.'} The server will recheck approval, unit, outstanding quantity and stock before saving.</p>}<div className="flex flex-wrap gap-2"><button disabled={busy} className={button} onClick={confirm}>{busy?'Recording…':review.operation==='prepare'?'Confirm stock setup':review.operation==='review'?'Confirm Stock review':'Confirm stock movement'}</button><button disabled={busy} className={control} onClick={()=>setReview(null)}>Back to editing</button></div></div>}
      {(line || review) && errorNotice}
    </dialog>
    {!line && !review && errorNotice}
    {message&&<p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">{message}</p>}
  </section>;
}
