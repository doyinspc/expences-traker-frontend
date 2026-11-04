import React, {useState} from 'react';

export function stockChartData(rows, requestedUnit) {
  const units=[...new Set(rows.map(row=>String(row.unit||'').trim()).filter(Boolean))].sort();
  const unit=units.includes(requestedUnit)?requestedUnit:units[0]||'';
  const selected=rows.filter(row=>String(row.unit||'').trim()===unit);
  const valid=selected.filter(row=>!Number(row.unit_mismatch)&&['closing_quantity','received_quantity','issued_quantity'].every(key=>row[key]!==null&&row[key]!==''&&Number.isFinite(Number(row[key]))&&Number(row[key])>=0));
  const byStock=[...valid].sort((a,b)=>Number(b.closing_quantity)-Number(a.closing_quantity)).slice(0,8);
  const byMovement=[...valid].sort((a,b)=>(Number(b.received_quantity)+Number(b.issued_quantity))-(Number(a.received_quantity)+Number(a.issued_quantity))).slice(0,8);
  return {units,unit,byStock,byMovement,total:valid.length,excluded:selected.length-valid.length};
}
const number=value=>Number(value).toLocaleString();
const card='min-w-0 rounded-lg border border-gray-200 p-4 dark:border-gray-700';
function Bar({label,value,max,colour}) {
  return <div className="grid grid-cols-[4rem_minmax(0,1fr)_4rem] items-center gap-2 text-xs"><span>{label}</span><div className="h-3 overflow-hidden rounded bg-gray-100 dark:bg-gray-900"><div className={`h-full rounded ${colour}`} style={{width:`${max>0?Number(value)/max*100:0}%`}} /></div><span className="text-right tabular-nums">{number(value)}</span></div>;
}
export default function StockReportCharts({rows=[]}) {
  const [selected,setSelected]=useState('');
  const data=stockChartData(rows,selected);
  if(!data.unit)return null;
  const stockMax=Math.max(1,...data.byStock.map(row=>Number(row.closing_quantity)));
  const movementMax=Math.max(1,...data.byMovement.flatMap(row=>[Number(row.received_quantity),Number(row.issued_quantity)]));
  return <section aria-label="Stock report charts" className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-semibold">Stock charts</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-300">Charts follow the report date and item search. Different units stay separate.</p></div><label className="grid gap-1 text-sm">Chart unit<select aria-label="Stock chart unit" className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-600 dark:bg-gray-900" value={data.unit} onChange={event=>setSelected(event.target.value)}>{data.units.map(unit=><option key={unit} value={unit}>{unit}</option>)}</select></label></div>
    {data.excluded>0&&<p role="status" className="text-xs text-amber-700 dark:text-amber-200">{data.excluded} item(s) need quantity or unit reconciliation and are excluded from these charts. Review them in the table.</p>}
    <div className="grid gap-4 xl:grid-cols-2">
      <div className={card}><h4 className="font-medium">Stock on hand by item · {data.unit}</h4><ul className="mt-4 space-y-4">{data.byStock.map(row=><li key={row.item_id}><p className="mb-1 break-words text-sm">{row.item_name}</p><Bar label="Closing" value={row.closing_quantity} max={stockMax} colour="bg-blue-500" /></li>)}</ul><p className="mt-4 text-xs text-gray-500 dark:text-gray-300">Highest closing balances · {data.byStock.length} of {data.total} items.</p></div>
      <div className={card}><h4 className="font-medium">Received versus issued · {data.unit}</h4><ul className="mt-4 space-y-4">{data.byMovement.map(row=><li key={row.item_id}><p className="mb-1 break-words text-sm">{row.item_name}</p><div className="space-y-1"><Bar label="Received" value={row.received_quantity} max={movementMax} colour="bg-emerald-500" /><Bar label="Issued" value={row.issued_quantity} max={movementMax} colour="bg-amber-500" /></div></li>)}</ul><p className="mt-4 text-xs text-gray-500 dark:text-gray-300">Highest movement quantities · {data.byMovement.length} of {data.total} items.</p></div>
    </div>
  </section>;
}
