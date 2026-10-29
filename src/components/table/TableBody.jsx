import { flexRender } from '@tanstack/react-table';
import React from 'react';

export default function TableBody({ table, searchTerm, onClearSearch }) {
  const rows = table.getRowModel().rows;
  const filtered = Boolean(searchTerm || table.getState().globalFilter);
  return <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{rows.length === 0 ? <tr><td colSpan={Math.max(1, table.getVisibleLeafColumns().length)} className="px-6 py-14 text-center"><p className="font-medium text-gray-800 dark:text-gray-200">{filtered ? 'No matching records' : 'No records yet'}</p><p className="mt-2 text-sm text-gray-500">{filtered ? 'Try another search or clear the search to see all records.' : 'Records will appear here when available.'}</p>{filtered && <button type="button" onClick={() => onClearSearch ? onClearSearch() : table.setGlobalFilter('')} className="mt-4 text-sm font-medium text-brand-600 underline">Clear search</button>}</td></tr> : rows.map(row => <tr key={row.id} aria-selected={row.getIsSelected()} className={row.getIsSelected() ? 'bg-brand-50 dark:bg-brand-900/20' : 'odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/60 dark:odd:bg-gray-800 dark:even:bg-gray-900/30 dark:hover:bg-gray-700/50'}>{row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3 align-middle text-sm text-gray-700 dark:text-gray-300">{cell.isPlaceholder ? null : flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>;
}
