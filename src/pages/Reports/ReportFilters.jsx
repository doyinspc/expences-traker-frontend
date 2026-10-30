import { useState } from 'react';
import { useSelector } from 'react-redux';
import AccountingPeriodPicker from '../../components/common/AccountingPeriodPicker';
import { reportPeriod } from '../../utils/functions/reportPeriods';
import { hasNavigationAccess } from '../../utils/functions/workflowUx';

export default function ReportFilters({locations=[],onApplyFilters,isLoading=false,cash=false,initialFilters=null}) {
  const auth=useSelector(state=>state.authReducer||{});
  const [period,setPeriod]=useState(initialFilters?.period||(cash?'60days':'30days'));
  const [dates,setDates]=useState(()=>initialFilters?.start_date&&initialFilters?.end_date?{start_date:initialFilters.start_date,end_date:initialFilters.end_date}:reportPeriod(cash?'60days':'30days'));
  const [selected,setSelected]=useState(()=>initialFilters?.location_id?(Array.isArray(initialFilters.location_id)?initialFilters.location_id:[initialFilters.location_id]).map(String):auth.location_id?[String(auth.location_id)]:[]);
  const [saving,setSaving]=useState(false),[error,setError]=useState('');
  const permitted=locations.filter(location=>(auth.isAdmin&&String(location.id)===String(auth.location_id))||Number(auth.locations?.find(row=>String(row.id)===String(location.id))?.is_admin??auth.locations?.find(row=>String(row.id)===String(location.id))?.is_active)===1||hasNavigationAccess(auth.access,location.id,5,1));
  const busy=saving||isLoading;
  const submit=async event=>{
    event.preventDefault();if(busy)return;setError('');
    if(!dates.start_date||!dates.end_date||dates.start_date>dates.end_date){setError('Choose a valid start and end date. The start must be on or before the end.');return;}
    setSaving(true);
    try {await onApplyFilters({...dates,period,...(cash?{account_id:null}:{location_id:selected.length?selected:auth.location_id||null})});}
    catch(failure){setError(failure.response?.data?.message||failure.message||'The report could not be loaded.');}
    finally{setSaving(false);}
  };
  const control='mt-1.5 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
  return <form noValidate onSubmit={submit} aria-busy={busy} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="font-semibold text-gray-900 dark:text-white">{cash?'Cash movement filters':'Income and expense filters'}</h2><p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{cash?'Review resolved cash-transfer entries by account. This report uses your selected working location.':'Review completed income, cash-advance expenses and procurement costs for the selected locations and dates. Income offsets expenses; requisitions, stock movements and cash transfers are excluded from the net balance.'}</p>
    {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
    <fieldset disabled={busy} className="space-y-5"><AccountingPeriodPicker value={period} disabled={busy} onSelect={(range,key)=>{setPeriod(key);if(range)setDates(range);setError('');}}/>
      <div className="grid gap-4 sm:grid-cols-2">{['start_date','end_date'].map(key=><label key={key} className="text-sm font-medium text-gray-700 dark:text-gray-200">{key==='start_date'?'Start date':'End date'} *<input type="date" required value={dates[key]} onChange={event=>{const value=event.target.value;setDates(previous=>({...previous,[key]:value}));setPeriod('custom');setError('');}} className={control}/></label>)}</div>
      {!cash&&<fieldset><legend className="text-sm font-medium text-gray-700 dark:text-gray-200">Locations</legend><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">If none are selected, the report uses your current location.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{permitted.map(location=><label key={location.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200"><input type="checkbox" checked={selected.includes(String(location.id))} onChange={event=>{const checked=event.target.checked;setSelected(previous=>checked?[...previous,String(location.id)]:previous.filter(id=>id!==String(location.id)));}} className="size-4 accent-brand-500"/>{location.name}</label>)}</div></fieldset>}
      <button type="submit" disabled={busy} className="min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{busy?'Generating report…':'Generate report'}</button>
    </fieldset>
  </form>;
}
