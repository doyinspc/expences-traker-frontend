import React, { useId } from 'react';
import Input from '../form/input/InputField';
export default function TableSearch({ globalFilter, setGlobalFilter }) {
  const id = useId();
  return <div className="relative"><label htmlFor={id} className="sr-only">Search records</label><Input id={id} type="search" placeholder="Search records…" value={globalFilter} onChange={event => setGlobalFilter(event.target.value)} className="block min-h-11 w-full rounded-lg sm:min-w-56 dark:bg-gray-900 dark:text-white" /></div>;
}
