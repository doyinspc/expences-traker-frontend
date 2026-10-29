import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../../actions/common';

const localDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export default function UserActivityPage() {
  const { userId } = useParams();
  const location = useSelector(s => s.authReducer?.location_id || s.auth?.location_id);
  const role = useSelector(s => s.authReducer?.role_id || s.auth?.role_id);
  const [dates, setDates] = useState(() => { const end = new Date(), start = new Date(); start.setMonth(start.getMonth() - 3); return { start_date: localDate(start), end_date: localDate(end) }; });
  const [period, setPeriod] = useState(dates), [page, setPage] = useState(1), [error, setError] = useState('');
  const query = useQuery({
    queryKey: ['staff-activity', tokenHelpers.getTenantDb(), tokenHelpers.getToken(), userId, location, role, period, page],
    queryFn: async () => {
      const { data } = await axios.get(API_PATH_SETTING, { ...axiosConfig, params: { table: 'users', cat: 'getUserActivity', data: JSON.stringify({ user_id: Number(userId), ...period, page }) } });
      if (data?.success === false || data?.status === 'error') throw new Error(data.message || 'Activity could not be loaded.');
      return data.data;
    },
  });
  const details = query.data, rows = details?.rows || [];
  const field = 'min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white';
  return <section className="space-y-5">
    <Link to="/setting/user" className="inline-flex min-h-11 items-center text-sm text-brand-600 dark:text-brand-300">← Back to Users</Link>
    <div><h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Staff activity</h1><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{details?.user?.name || `Staff member ${userId}`} {details?.user?.employee_id && `· ${details.user.employee_id}`}</p></div>
    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">Recorded workflow actions you may view at the selected location. Super Admins can also see recorded account-security actions. This is not a record of every click or login.</p>
    <form onSubmit={e => { e.preventDefault(); if (!dates.start_date || !dates.end_date || dates.start_date > dates.end_date) { setError('Choose valid dates with the end on or after the start.'); return; } setError(''); setPeriod({ ...dates }); setPage(1); }} className="flex flex-wrap items-end gap-3">
      {['start_date', 'end_date'].map(key => <label key={key} className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">{key === 'start_date' ? 'Start date' : 'End date'}<input required type="date" value={dates[key]} onChange={e => setDates(d => ({ ...d, [key]: e.target.value }))} className={field}/></label>)}
      <button className="min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white">Apply period</button>
      <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className={field}>Refresh activity</button>
    </form>
    {(error || query.error) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error || query.error.response?.data?.message || query.error.message}</p>}
    {query.isFetching && <p role="status" className="text-sm text-gray-500 dark:text-gray-300">Loading staff activity…</p>}
    {!query.isPending && !query.isError && <><p className="text-sm text-gray-600 dark:text-gray-300">{details?.total || 0} recorded action(s) · {period.start_date} to {period.end_date}</p>
      {!rows.length ? <p role="status" className="rounded-lg border border-gray-200 p-5 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">No recorded activity is available within your permissions for this period. Expand the dates or check the selected location.</p> : <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800"><table className="w-full text-left text-sm text-gray-700 dark:text-gray-200"><thead className="bg-gray-50 dark:bg-gray-800"><tr>{['Date and time', 'Action', 'Reference / target', 'Role', 'Comment'].map(x => <th key={x} scope="col" className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800"><td className="whitespace-nowrap px-4 py-3">{row.created_at}</td><td className="px-4 py-3">{String(row.action_name || '').replaceAll('_', ' ')}</td><td className="px-4 py-3">{row.record_identifier || `${row.table_name || 'Record'} ${row.record_id || ''}`}</td><td className="px-4 py-3">{row.role_name || '—'}</td><td className="min-w-52 whitespace-pre-wrap break-words px-4 py-3">{row.comments || '—'}</td></tr>)}</tbody></table></div>}
      <nav aria-label="Activity pages" className="flex flex-wrap items-center gap-3"><button disabled={page <= 1 || query.isFetching} onClick={() => setPage(p => p - 1)} className={`${field} disabled:opacity-50`}>Previous page</button><span className="text-sm text-gray-600 dark:text-gray-300">Page {page}</span><button disabled={page * 100 >= (details?.total || 0) || query.isFetching} onClick={() => setPage(p => p + 1)} className={`${field} disabled:opacity-50`}>Next page</button></nav></>}
  </section>;
}
