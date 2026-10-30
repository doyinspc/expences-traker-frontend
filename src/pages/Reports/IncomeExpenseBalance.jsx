import {useMemo,useState} from 'react';
import ExpenseSummary from './ExpenseSummary';
import ExpenseDetails from './ExpenseDetails';
import {incomeExpenseGroups,formatReportMoney} from '../../utils/functions/incomeExpenseReport';

export default function IncomeExpenseBalance({data=[],onExport,isLoading=false}) {
  const groups=useMemo(()=>incomeExpenseGroups(data),[data]);
  const [selected,setSelected]=useState('');
  const group=groups.find(row=>row.key===selected)||groups[0];
  const backendSupportsBalance=!data.length||data.some(row=>Object.prototype.hasOwnProperty.call(row,'expense_amount')&&Object.prototype.hasOwnProperty.call(row,'income_amount'));
  if(!isLoading&&!backendSupportsBalance)return <div className="space-y-4"><p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">The existing expense summary is available. Install the matching backend update to enable income and net-balance reporting.</p><ExpenseSummary data={data} onExport={()=>onExport?.(data)} /></div>;
  if(isLoading)return <ExpenseSummary data={[]} onExport={onExport} isLoading/>;
  if(!group)return <ExpenseSummary data={[]} onExport={onExport} isLoading={isLoading}/>;
  return <div className="space-y-6">
    <section aria-label="Income and expense balance" className="rounded-lg border border-gray-200 bg-white p-5 shadow dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Income and expense balance</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">Completed income offsets procurement and cash-advance expenses in the selected period. Cash transfers move money between accounts; requisitions and stock movements are excluded from this balance.</p></div>
        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">Report currency<select value={group.key} onChange={event=>setSelected(event.target.value)} className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">{groups.map(row=><option key={row.key} value={row.key}>{row.label} · {row.rows.length} entries</option>)}</select></label>
      </div>
      {groups.length>1&&<p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Currencies stay separate. The summary, detail tables and CSV use the selected currency.</p>}
      {!group.valid&&<p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Monetary totals are withheld because the currency or recorded amounts need review. The underlying entries remain available below.</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">{[
        ['Total income',group.totals.income,'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200'],
        ['Total expenses',group.totals.expenses,'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200'],
        ['Net balance · Income − expenses',group.totals.net,'bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-200']
      ].map(([label,value,style])=><div key={label} className={`rounded-lg p-4 ${style}`}><p className="text-sm">{label}</p><p className="mt-2 break-words text-xl font-bold tabular-nums">{formatReportMoney(value,group.currency)}</p></div>)}</div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300"><p>Procurement: <strong>{formatReportMoney(group.totals.procurement,group.currency)}</strong></p><p>Cash advances: <strong>{formatReportMoney(group.totals.cashAdvances,group.currency)}</strong></p></div>
    </section>
    <ExpenseSummary data={group.expenses} emptyTitle="No expense entries" emptyMessage="No completed procurement or cash-advance expense entries for this currency and period." currency={group.currency} suppressTotals={!group.valid} onExport={()=>onExport?.(group.rows)} isLoading={isLoading}/>
    <details className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-800 dark:bg-gray-900"><summary className="cursor-pointer p-5 font-semibold text-gray-800 dark:text-gray-200">Income entries ({group.income.length})</summary><div className="p-4 pt-0">{group.income.length?<ExpenseDetails items={group.income} currency={group.currency} income/>:<p className="text-sm text-gray-500 dark:text-gray-400">No completed income entries for this currency and period.</p>}</div></details>
  </div>;
}
