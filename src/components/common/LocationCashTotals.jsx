import React from 'react';
import { Link } from 'react-router';

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Add financial totals alongside existing dashboard content, retaining currency and access scope. */
export default function LocationCashTotals({ cash, year = 0 }) {
  if (!cash || !Object.values(cash.access || {}).some(Boolean)) return null;
  return <section aria-label="Location cash totals" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold text-gray-900 dark:text-white">Cash movements in this accounting year</h3>
      {cash.report_access && <Link to={`/reports/cash-flow?year=${year}`} className="min-h-11 content-center text-sm text-brand-600 dark:text-brand-300">Monthly report and transaction details →</Link>}
    </div>
    {cash.partial_access && <p role="status" className="text-xs text-amber-700 dark:text-amber-300">These totals cover only the financial modules your role can view.</p>}
    {!cash.totals?.length && <p className="text-sm text-gray-500 dark:text-gray-400">No recognised cash movements for your accessible modules in this year.</p>}
    {cash.totals?.map((group) => <div key={group.currency_id}>
      <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">{group.currency}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['cash_in', 'Cash In', `Income ${money(group.totals.income)} + transfers received ${money(group.totals.transfers_in)}`],
          ['expenses', 'Expenses', `Procurement ${money(group.totals.procurement)} + cash advances ${money(group.totals.cash_advances)}`],
          ['transfers_out', 'Transfers Out', 'Completed transfers to accounts at other locations'],
          ['net', 'Net Movement', 'Cash In − expenses − transfers out; opening cash is not included'],
        ].map(([key, label, description]) => {
          const content = <><p className="text-sm text-gray-600 dark:text-gray-300">{label}</p><p className="mt-2 text-xl font-semibold tabular-nums text-gray-900 dark:text-white">{money(group.totals[key])}</p><p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{description}</p></>;
          const style = 'rounded-xl border border-gray-200 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900';
          return cash.report_access
            ? <Link key={key} to={`/reports/cash-flow?year=${year}&metric=${key}`} className={`${style} hover:border-brand-400`}>{content}</Link>
            : <div key={key} className={style}>{content}</div>;
        })}
      </div>
    </div>)}
    <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">Expenses use recorded payments less returns, including disbursements whose approvals are still ongoing. Requisitions and transfers between accounts at the same location do not add location income or expense.</p>
  </section>;
}
