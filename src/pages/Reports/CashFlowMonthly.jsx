import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../../actions/common';
import LocationCashTotals from '../../components/common/LocationCashTotals';
import { cashFlowAmountCents, printCashFlowDetail } from '../../utils/functions/cashFlowPrint';

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const metrics = [['income', 'Income'], ['transfers_in', 'Transfers In'], ['cash_in', 'Cash In'], ['procurement', 'Procurement'], ['cash_advances', 'Cash Advances'], ['expenses', 'Expenses'], ['transfers_out', 'Transfers Out'], ['cash_out', 'Cash Out'], ['net', 'Net Movement']];
async function read(data) {
  const response = await axios.get(API_PATH_SETTING, { ...axiosConfig, params: { table: 'dashboard', cat: 'getCashFlow', data: JSON.stringify(data), tenant_db: tokenHelpers.getTenantDb() } });
  if (response.data?.status === 'error' || response.data?.success === false) throw new Error(response.data.message || 'Cash-flow data could not be loaded.');
  return response.data.data;
}

/**
 * Purpose: reconcile each accounting-year month and expose its exact financial events.
 * Algorithm: scope queries/cache to session, role, location and company year; open a
 * separate paginated detail query for the clicked month, currency and metric. For print,
 * fetch every page of that same selection and verify its row count and monetary total
 * before creating an isolated print document. All financial totals originate on the server.
 */
export default function CashFlowMonthly() {
  const auth = useSelector((state) => state.authReducer || {});
  const [search] = useSearchParams();
  const initialYear = Number(search.get('year') || 0);
  const [year, setYear] = useState(Number.isInteger(initialYear) && initialYear >= -10 && initialYear <= 1 ? initialYear : 0);
  const [selection, setSelection] = useState(null);
  const [page, setPage] = useState(1);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState('');
  const currentScope = useRef('');
  currentScope.current = JSON.stringify([auth.location_id, auth.role_id, year, selection]);
  useEffect(() => { setSelection(null); setPage(1); setPrintError(''); }, [auth.location_id, auth.role_id, year]);
  const scope = [tokenHelpers.getTenantDb(), tokenHelpers.getToken(), auth.location_id, auth.role_id];
  const enabled = Boolean(auth.isAuthenticated && auth.location_id && auth.role_id);
  const query = useQuery({ queryKey: ['location-cash-flow', ...scope, year], enabled, queryFn: () => read({ year_offset: year }) });
  const detail = useQuery({ queryKey: ['location-cash-flow-detail', ...scope, year, selection, page], enabled: enabled && Boolean(selection), queryFn: () => read({ year_offset: year, ...selection, page }) });
  const result = query.data;
  const activeDetail = detail.data?.detail;
  const location = auth.location?.name || auth.user?.locations?.find((row) => String(row.id) === String(auth.location_id))?.name || `Location ${auth.location_id}`;
  const select = (row, metric) => { setSelection({ month: row.month, currency_id: row.currency_id, metric }); setPage(1); setPrintError(''); };
  const print = async () => {
    if (!activeDetail || printing) return;
    const printScope = currentScope.current;
    setPrinting(true); setPrintError('');
    try {
      const first = await read({ year_offset: year, ...selection, page: 1 });
      let rows = [...first.detail.rows];
      for (let next = 2; rows.length < first.detail.total; next++) {
        const batch = await read({ year_offset: year, ...selection, page: next });
        if (batch.detail.total !== first.detail.total || batch.detail.amount !== first.detail.amount || !batch.detail.rows.length) throw new Error('The transactions changed. Refresh the detail before printing.');
        rows.push(...batch.detail.rows);
      }
      const sum = rows.reduce((total, row) => total + cashFlowAmountCents(row.amount), 0n);
      if (rows.length !== first.detail.total || sum !== cashFlowAmountCents(first.detail.amount) || new Set(rows.map((row) => row.id)).size !== rows.length) throw new Error('The transactions changed. Refresh the detail before printing.');
      if (printScope !== currentScope.current) return;
      printCashFlowDetail({ company: result.company_name, location, period: result.period, month: selection.month, metric: metrics.find(([key]) => key === selection.metric)?.[1], currency: result.totals.find((row) => row.currency_id === selection.currency_id)?.currency || '', amount: first.detail.amount, rows });
    } catch (error) { setPrintError(error.message || 'The printable report could not be prepared.'); }
    finally { setPrinting(false); }
  };
  const control = 'min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900';
  return <section aria-label="Monthly location cash flow" className="space-y-5 text-gray-900 dark:text-white">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-semibold">Monthly Cash Flow</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{location} · Click a month or amount to see its transactions.</p></div><label className="text-xs">Accounting year<select value={year} onChange={(event) => setYear(Number(event.target.value))} className={`${control} ml-2`}>{result?.years?.map((item) => <option key={item.offset} value={item.offset}>{item.label}</option>) || <option value="0">Current company year</option>}</select></label></div>
    {!enabled ? <p>Choose your working location and role.</p> : query.isPending ? <p role="status" className="min-h-40 p-5">Loading monthly cash flow…</p> : query.error ? <p role="alert">{query.error.message}</p> : result?.setup_required ? <p>Set the accounting-year start in Company Profile first.</p> : result && <>
      <LocationCashTotals cash={{ ...result, report_access: false }} year={year} />
      <p className="text-xs text-gray-500 dark:text-gray-400">{result.period.start_date} to {result.period.end_date}. Each currency remains separate. These are cash movements, not opening or closing account balances.</p>
      {!result.months.length ? <p>No recognised cash movements in this accounting year.</p> : <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700"><table className="min-w-full text-left text-sm"><thead className="bg-gray-50 dark:bg-gray-900"><tr>{['Month / currency', ...metrics.map(([, label]) => label)].map((label) => <th key={label} className="whitespace-nowrap px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{result.months.map((row) => <tr key={`${row.month}-${row.currency_id}`} className="border-t border-gray-200 dark:border-gray-700"><th className="whitespace-nowrap px-3 py-2"><button type="button" onClick={() => select(row, 'net')} className="min-h-11 text-left text-brand-600 dark:text-brand-300">{row.label}<span className="block text-xs text-gray-500">{row.currency}</span></button></th>{metrics.map(([key, label]) => <td key={key} className="px-3 py-2"><button type="button" aria-label={`${row.label} ${row.currency} ${label}`} onClick={() => select(row, key)} className="min-h-11 tabular-nums text-brand-600 underline decoration-dotted underline-offset-4 dark:text-brand-300">{money(row.totals[key])}</button></td>)}</tr>)}</tbody></table></div>}
      {selection && <section aria-label="Monthly cash-flow transactions" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{selection.month} · {metrics.find(([key]) => key === selection.metric)?.[1]}</h2><div className="flex gap-3"><button type="button" disabled={printing || detail.isFetching || !activeDetail} onClick={print} className={`${control} disabled:opacity-50`}>{printing ? 'Preparing all transactions…' : 'Print month detail'}</button><button type="button" onClick={() => setSelection(null)} className={control}>Close detail</button></div></div>
        {printError && <p role="alert" className="text-sm text-red-600">{printError}</p>}
        {detail.isPending ? <p role="status" className="min-h-40">Loading transactions…</p> : detail.error ? <p role="alert">{detail.error.message}</p> : activeDetail && <><p className="text-sm">{activeDetail.total} event(s) · Selected total: {money(activeDetail.amount)}</p><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr>{['Date', 'Type / status', 'Reference / document', 'Account / From', 'To', 'Amount'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{activeDetail.rows.map((row) => <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700"><td className="whitespace-nowrap p-3">{row.date}</td><td className="p-3">{metrics.find(([key]) => key === row.kind)?.[1]}<p className="text-xs text-gray-500">{row.workflow_state}</p></td><td className="p-3">{row.reference}<p>{row.title}</p></td><td className="p-3">{row.from_account || row.account || '—'}</td><td className="p-3">{row.to_account || '—'}</td><td className="whitespace-nowrap p-3 tabular-nums">{row.currency} {money(row.amount)}</td></tr>)}</tbody></table></div>{!activeDetail.rows.length && <p className="py-4 text-sm">No matching events for this month and category.</p>}<div className="flex items-center gap-3"><button className={control} disabled={page === 1 || detail.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</button><span className="text-xs">Page {page}</span><button className={control} disabled={page * activeDetail.page_size >= activeDetail.total || detail.isFetching} onClick={() => setPage((value) => value + 1)}>Next</button></div></>}
      </section>}
    </>}
  </section>;
}
