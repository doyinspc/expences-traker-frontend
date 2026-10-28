import { useEffect, useId, useRef, useState } from 'react';
import { Columns3, ChevronDown } from 'lucide-react';

export default function TableButtonColumnVisibility({ table }) {
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef(null), trigger = useRef(null);
  const id = useId();
  useEffect(() => {
    const outside = event => { if (!container.current?.contains(event.target)) setIsOpen(false); };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);
  return <div ref={container} className="relative my-auto text-left" onKeyDown={event => { if (event.key === 'Escape') { setIsOpen(false); trigger.current?.focus(); } }}>
    <button type="button" ref={trigger} onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls={id} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"><Columns3 size={16} aria-hidden="true" />Columns<ChevronDown size={14} aria-hidden="true" /></button>
    {isOpen && <fieldset id={id} aria-label="Visible columns" className="z-150 mt-2 max-h-80 w-60 max-w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg sm:absolute sm:right-0 sm:max-w-none dark:border-gray-700 dark:bg-gray-800"><legend className="sr-only">Visible columns</legend><p className="px-2 py-2 text-xs text-gray-500">Keep at least one column visible.</p>{table.getAllLeafColumns().map(column => <label key={column.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"><input type="checkbox" checked={column.getIsVisible()} disabled={!column.getCanHide() || (column.getIsVisible() && table.getVisibleLeafColumns().length === 1)} onChange={column.getToggleVisibilityHandler()} className="size-4 accent-brand-500 disabled:opacity-50" /><span>{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id.replaceAll('_', ' ')}</span></label>)}</fieldset>}
  </div>;
}
