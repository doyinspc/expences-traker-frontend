import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../../actions/common';
import useCompanyPeriod from '../../hooks/useCompanyPeriod';
import AccountingPeriodPicker from '../../components/common/AccountingPeriodPicker';
import { reportPeriod } from '../../utils/functions/reportPeriods';
import { transferAccountLabel } from '../../utils/functions/transferAccountLabel.js';

/**
 * Purpose: show completed cash transfers at the menu landing page for the working location.
 *
 * Algorithm:
 * 1. Load the company's accounting-year setting and default the period to that full year.
 *    Require a configured year or a valid custom range before querying; never silently
 *    substitute all-time records when the company setup is missing or still loading.
 * 2. Fetch the existing completed-transfer register using the authenticated API context.
 *    Include location, role, session and dates in the cache key so changing location cannot
 *    reuse another location's results. The backend independently authorises that location.
 * 3. Partition the response into Cash In and Cash Out. Show both accounts and locations
 *    with the completion date, reference and saved amount; do not combine currencies.
 * 4. Keep loading, request failures and empty results distinct, and allow manual refresh.
 *
 * This is a read-only register. The main document list retains draft creation and approval
 * actions; this component neither creates a second document nor changes cash balances.
 */
export default function CashTransferRegister() {
  const auth = useSelector((state) => state.authReducer || {});
  const company = useCompanyPeriod();
  const [tab, setTab] = useState('incoming');
  const [preset, setPreset] = useState('fy');
  const [customDates, setCustomDates] = useState({ start_date: '', end_date: '' });
  const dates = preset === 'custom'
    ? customDates
    : reportPeriod(preset, company.data?.fiscal_year_start);
  const validRange = Boolean(dates?.start_date && dates?.end_date && dates.start_date <= dates.end_date);
  const locationId = auth.location_id || 0;
  const register = useQuery({
    queryKey: ['requisitionitems', 'cash-transfer-main-register', tokenHelpers.getTenantDb(),
      tokenHelpers.getToken(), locationId, auth.role_id, dates?.start_date, dates?.end_date],
    enabled: Boolean(auth.isAuthenticated && locationId && validRange),
    queryFn: async () => {
      const response = await axios.get(API_PATH_SETTING, {
        ...axiosConfig,
        params: {
          table: 'requisitionitems', cat: 'getCashTransferRegister',
          tenant_db: tokenHelpers.getTenantDb(),
          data: JSON.stringify({ location_id: locationId, start_date: dates.start_date, end_date: dates.end_date }),
        },
      });
      const payload = response.data;
      if (payload?.status === 'error' || payload?.success === false) {
        throw new Error(payload.message || 'Cash transfers could not be loaded.');
      }
      const rows = Array.isArray(payload) ? payload : payload?.data;
      if (!Array.isArray(rows)) throw new Error('The transfer register returned an unexpected response.');
      return rows;
    },
  });
  const rows = (register.data || []).filter((row) => row.direction === tab);
  const changeDate = (key, value) => {
    setCustomDates({ start_date: dates?.start_date || '', end_date: dates?.end_date || '', [key]: value });
    setPreset('custom');
  };
  const fieldClass = 'mt-1.5 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900';

  return (
    <section aria-label="Completed transfer register" className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
      <div className="space-y-4 border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Cash In / Cash Out</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Completed transfers for your current location. Drafts and pending approvals remain in the main list above.</p>
          </div>
          <button type="button" disabled={!validRange || !locationId || register.isFetching} onClick={() => register.refetch()} className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm disabled:opacity-50 dark:border-gray-600">Refresh transfers</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <AccountingPeriodPicker value={preset} label="Transfer period" onSelect={(range, selection) => {
            if (selection === 'custom') setCustomDates({ start_date: dates?.start_date || '', end_date: dates?.end_date || '' });
            setPreset(selection);
          }} />
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">From date<input type="date" value={dates?.start_date || ''} onChange={(event) => changeDate('start_date', event.target.value)} className={fieldClass} /></label>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">To date<input type="date" value={dates?.end_date || ''} onChange={(event) => changeDate('end_date', event.target.value)} className={fieldClass} /></label>
        </div>
        <div className="flex gap-2" role="group" aria-label="Transfer direction">
          {['incoming', 'outgoing'].map((direction) => (
            <button key={direction} type="button" aria-pressed={tab === direction} onClick={() => setTab(direction)} className={`min-h-11 rounded-lg px-4 text-sm font-medium ${tab === direction ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'}`}>
              {direction === 'incoming' ? 'Cash In' : 'Cash Out'}
            </button>
          ))}
        </div>
      </div>
      {!locationId ? <p className="p-5 text-sm">Choose a working location to view its transfers.</p>
        : !validRange ? <p role="status" className="p-5 text-sm">{company.isLoading ? 'Loading accounting-year settings…' : 'Set the accounting year in Company Profile or choose valid custom dates.'}</p>
        : register.isLoading ? <p role="status" className="min-h-40 p-6 text-sm">Loading completed transfers…</p>
        : register.error ? <p role="alert" className="p-5 text-sm text-red-600 dark:text-red-300">{register.error.message || 'Cash transfers could not be loaded. Use Refresh transfers to try again.'}</p>
        : !rows.length ? <p className="p-5 text-sm text-gray-500 dark:text-gray-400">No completed {tab} transfers for this location and period.</p>
        : <div className="overflow-x-auto" aria-busy={register.isFetching}>
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <caption className="sr-only">Completed {tab} transfers for the selected location and dates</caption>
            <thead className="bg-gray-50 dark:bg-gray-900"><tr>{['Completed', 'Reference / purpose', 'From account / location', 'To account / location', 'Amount'].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{rows.map((row) => (
              <tr key={`${row.document_id}-${row.transfer_reference}`}>
                <td className="whitespace-nowrap px-4 py-3">{row.completed_at || 'Date not recorded'}</td>
                <td className="px-4 py-3"><p className="font-medium">{row.document_reference || row.transfer_reference}</p><p className="text-xs text-gray-500 dark:text-gray-400">{row.document_title}</p></td>
                <td className="px-4 py-3">{transferAccountLabel({ account_name: row.from_account_name, account_alias: row.from_account_alias, location_name: row.from_location_name })}</td>
                <td className="px-4 py-3">{transferAccountLabel({ account_name: row.to_account_name, account_alias: row.to_account_alias, location_name: row.to_location_name })}</td>
                <td className={`whitespace-nowrap px-4 py-3 font-semibold tabular-nums ${tab === 'incoming' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{row.currency_code || ''} {Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
    </section>
  );
}
