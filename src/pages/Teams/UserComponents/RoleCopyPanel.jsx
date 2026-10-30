import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../../../actions/common';

const inputClass='min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

export default function RoleCopyPanel({ staffId, source, scopeKey, onClose, onCopied }) {
  const [selected,setSelected]=useState([]),[review,setReview]=useState(null),[search,setSearch]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const query=useQuery({
    queryKey:['role-copy-targets',tokenHelpers.getTenantDb(),tokenHelpers.getToken(),scopeKey,staffId,source.id],
    queryFn:async()=>{
      const {data}=await axios.get(API_PATH_SETTING,{...axiosConfig,params:{table:'users',cat:'getRoleCopyTargets',data:JSON.stringify({user_id:staffId,source_assignment_id:source.id})}});
      if(data?.success===false||data?.status==='error')throw new Error(data.message||'Locations could not be loaded.');
      return data.data;
    },
    staleTime:0,
  });
  const plan=query.data,locations=plan?.locations||[];
  const visible=locations.filter(row=>[row.name,row.code].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  const change=(id,checked)=>{setReview(null);setSelected(previous=>checked?[...new Set([...previous,id])]:previous.filter(value=>value!==id));};
  const chooseVisible=()=>{setReview(null);setSelected(previous=>[...new Set([...previous,...visible.filter(row=>!row.already_assigned).map(row=>row.id)])]);};
  const startReview=()=>{const rows=locations.filter(row=>selected.includes(row.id)&&!row.already_assigned);setReview(rows.length?rows:null);setError('');setMessage('');};
  const copy=async()=>{
    if(busy||!review?.length)return;
    setBusy(true);setError('');
    try{
      const {data}=await axios.post(API_PATH_SETTING,{table:'users',cat:'copyRoleAssignments',user_id:staffId,source_assignment_id:source.id,target_location_ids:review.map(row=>row.id),confirmation:'COPY_ROLE_ASSIGNMENTS'},axiosConfig);
      if(data?.success===false||data?.status==='error')throw new Error(data.message||'The role could not be copied.');
      setMessage(`${data.data.created} location(s) added; ${data.data.skipped} existing assignment(s) skipped. The role and workflow are unchanged. Module access is managed separately. Refresh the staff member’s session to load newly assigned roles.`);
      setReview(null);setSelected([]);await query.refetch();onCopied?.();
    }catch(failure){setError(failure.response?.data?.message||failure.message||'The role could not be copied.');}
    finally{setBusy(false);}
  };
  return <section aria-label="Copy staff role to other locations" aria-busy={busy} className="mb-5 space-y-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/20">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-gray-900 dark:text-white">Copy role to other locations</h3><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{plan?`${plan.source.staff_name} · ${plan.source.role_name} · From ${plan.source.location_name}`:source.itemname2||'Selected role'}</p></div><button type="button" disabled={busy} onClick={onClose} className="min-h-11 px-3 text-sm text-gray-600 dark:text-gray-300">Close role copy</button></div>
    <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">Choose school locations already assigned to this staff member. This reuses the same role; it does not create a new role, change workflow stages, copy module permissions or grant Super Admin access. Only locations you can manage are listed.</p>
    {query.isPending?<p role="status" className="py-5 text-sm text-gray-500 dark:text-gray-300">Loading assigned locations…</p>:query.error?<p role="alert" className="text-sm text-red-700 dark:text-red-300">{query.error.response?.data?.message||query.error.message} <button type="button" onClick={()=>query.refetch()} className="min-h-11 underline">Try again</button></p>:plan&&<>
      {review?<div className="space-y-3 rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-900 dark:bg-gray-900"><h4 className="text-sm font-semibold text-gray-900 dark:text-white">Review {review.length} selected location(s)</h4><ul className="max-h-60 overflow-y-auto text-sm text-gray-700 dark:text-gray-200">{review.map(row=><li key={row.id} className="py-1">{row.name}{row.code?` · ${row.code}`:''}</li>)}</ul><div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={copy} className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{busy?'Copying role…':'Confirm copy role'}</button><button type="button" disabled={busy} onClick={()=>setReview(null)} className="min-h-11 px-3 text-sm text-gray-700 dark:text-gray-200">Back to location selection</button></div></div>:<>
        <div className="flex flex-wrap gap-2"><label className="flex flex-1 flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">Find a location<input type="search" value={search} onChange={event=>setSearch(event.target.value)} className={inputClass}/></label><button type="button" onClick={chooseVisible} disabled={!visible.some(row=>!row.already_assigned)} className={`${inputClass} mt-5 disabled:opacity-50`}>Select available results</button><button type="button" onClick={()=>setSelected([])} className={`${inputClass} mt-5`}>Clear selection</button></div>
        {!locations.length?<p className="text-sm text-gray-500 dark:text-gray-300">No other assigned locations are available within your management access. Add the staff member’s school locations first.</p>:<div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">{!visible.length?<p className="p-3 text-sm text-gray-500 dark:text-gray-300">No locations match this search.</p>:visible.map(row=><label key={row.id} className="flex min-h-11 items-start gap-3 rounded-lg px-2 py-3 text-sm text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"><input type="checkbox" className="mt-0.5 size-4" checked={row.already_assigned||selected.includes(row.id)} disabled={row.already_assigned} onChange={event=>change(row.id,event.target.checked)}/><span className="min-w-0 break-words">{row.name}{row.code?` · ${row.code}`:''}{row.already_assigned&&<span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{row.inactive_assignment?'Inactive assignment exists; manage it separately.':'Already assigned; will be skipped.'}</span>}</span></label>)}</div>}
        <button type="button" disabled={!selected.length} onClick={startReview} className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Review selected locations ({selected.length})</button>
      </>}
    </>}
    {error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    {message&&<p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
  </section>;
}
