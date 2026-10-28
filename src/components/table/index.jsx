import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableSearch from './TableSearch';
import TableButtonColumnVisibility from './TableButtonColumnVisibility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDownload, faFileExcel, faHome, faPlus, faPrint } from '@fortawesome/free-solid-svg-icons';
import { DownloadExcel } from './../../utils/functions/index';
import { CheckIcon } from 'lucide-react';

function Index(props) {
  const { rows, columns, pageSize, cV, selectedRows } = props;
  const [data, setdata] = useState(rows || []);
  const [sorting, setsorting] = useState([]);
  const [rowSelection, setrowSelection] = useState({});
  const [globalFilter, setglobalFilter] = useState('');
  const [columnOrder, setcolumnOrder] = useState([]);
  const [columnVisibility, setcolumnVisibility] = useState({ ...cV });

  useEffect(() => {
    setdata(Array.isArray(rows) ? rows : []);
  }, [rows, columns]);

  const table = useReactTable({
    data,
    columns,
    sortDescFirst: false,
    state: {
      sorting,
      globalFilter,
      columnOrder,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize || 100
      },
      columnVisibility: cV,
    },
    onRowSelectionChange: setrowSelection, // This line is crucial. Keep the default behavior.
    getRowId: row => row.id,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setsorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setglobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnOrderChange: setcolumnOrder,
    onColumnVisibilityChange: setcolumnVisibility
  });

  // New function to handle the selection and transform the data
  const handleSelectedRows = () => {
    // Transform the selected rows into the desired object format here.
    const selectedRowsObject = table.getSelectedRowModel().rows.reduce((acc, row) => {
      acc[row.id] = row.original;
      return acc;
    }, {});
    props.selected?.(selectedRowsObject);
  };

  const download = () => DownloadExcel(table, data);
  const num_rows = Object.keys(rowSelection).length;

  return (
    <div id="dropdown-root" className="rounded-lg shadow-md bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-grow flex flex-wrap gap-2">
            <div className="flex items-center space-x-1">
              <button
                className="min-h-11 min-w-11 rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-brand-500 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                type="button" title="Return to overview" aria-label="Return to overview" disabled={!props.home} onClick={() => props.home?.()}
              >
                <FontAwesomeIcon icon={faHome} />
              </button>
              <button
                className="min-h-11 min-w-11 rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-brand-500 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                type="button" title="Add record" aria-label="Add record" disabled={!props.onAdd} onClick={() => props.onAdd?.()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button
                className="min-h-11 min-w-11 rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-brand-500 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                type="button" title="Refresh records" aria-label="Refresh records" disabled={!props.reload} onClick={() => props.reload?.()}
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
              <button
                className="min-h-11 min-w-11 rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-brand-500 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                type="button" title="Print table" aria-label="Print table" onClick={() => window.print()}
              >
                <FontAwesomeIcon icon={faPrint} />
              </button>
              {num_rows > 0 && (
                <button
                  className="min-h-11 min-w-11 rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-brand-500 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white relative"
                  onClick={handleSelectedRows}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {num_rows}
                  </span><span style={{ color: "teal", fontWeight: 'bolder' }}> View selected records.</span>
                </button>
              )}
            </div>
            <button
              className="min-h-11 min-w-11 rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-brand-500 text-gray-500 hover:text-green-900 dark:text-green-400 dark:hover:text-white relative0"
              onClick={() => download()}
            >
              <FontAwesomeIcon icon={faFileExcel} className="mr-2" /> Excel
            </button>
            <TableButtonColumnVisibility table={table} />
          </div>
          <div className="w-full sm:w-auto" >
            <TableSearch
              globalFilter={globalFilter}
              setGlobalFilter={(e) => setglobalFilter(e)}
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div role="region" aria-label="Records table" tabIndex={0} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm text-gray-900 dark:text-gray-200">
            <TableHeader table={table} columns={columns} />
            <TableBody
              table={table}
              data={data}
            />
          </table>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-700" aria-live="polite"><span>{table.getFilteredRowModel().rows.length} of {data.length} loaded records{num_rows > 0 ? ` · ${num_rows} selected` : ''}</span><span>Sort with column headings · Choose columns to customise your view</span></div>
      {/* Floating button for selected rows */}
      {num_rows > 0 && (
        <button
          className="fixed bottom-9 right-4 z-50 flex items-center bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-5 rounded-full shadow-lg transition-transform transform hover:scale-105"
          onClick={handleSelectedRows}
        >
          <CheckIcon className="mr-2" />
          <span>View selected records ({num_rows})</span>
        </button>
      )}
    </div>
  );
}

export default Index;