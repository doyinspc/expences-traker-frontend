import { flexRender } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

export default function TableHeader({ table }) {
  return <thead className="bg-gray-50 dark:bg-gray-900/60">{table.getHeaderGroups().map(group => <tr key={group.id} className="border-b border-gray-200 dark:border-gray-700">{group.headers.map(header => {
    const sorted = header.column.getIsSorted();
    const content = header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext());
    return <th key={header.id} scope="col" aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'} className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300" style={{ width: header.getSize(), ...header.column.columnDef?.meta?.style }}>
      {header.column.getCanSort() ? <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500" title={sorted === 'asc' ? 'Sort descending' : sorted === 'desc' ? 'Clear sorting' : 'Sort ascending'}>{content}{sorted === 'asc' ? <ArrowUp size={13} /> : sorted === 'desc' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} className="text-gray-400" />}</button> : content}
    </th>;
  })}</tr>)}</thead>;
}
