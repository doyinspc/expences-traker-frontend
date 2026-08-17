import { faSortAlphaAsc, faSortAlphaDesc } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { flexRender } from '@tanstack/react-table';
import React from 'react';

function TableHeader(props) {
  const { table } = props;
  return (
    <thead className="bg-gray-100 dark:bg-gray-700">
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-600">
          {headerGroup.headers.map(header => (
            <th
              key={header.id}
              onClick={header.column.getToggleSortingHandler()}
              className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer relative"
              style={{ width: header.getSize(), ...header.column.columnDef?.meta?.style }}
            >
              <div className="flex items-center">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                {header.column.getIsSorted() && (
                  <span className="ml-2 text-gray-400 dark:text-gray-500">
                    <FontAwesomeIcon
                      icon={
                        header.column.getIsSorted() === 'asc'
                          ? faSortAlphaAsc
                          : faSortAlphaDesc
                      }
                    />
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

export default TableHeader;