import { flexRender } from '@tanstack/react-table';
import React from 'react';

function TableBody(props) {
  const { table } = props;
  return (
    <tbody>
      {
        table.getRowModel().rows.map(row => {
          return (
            <tr key={row.id}>
              {
                row.getVisibleCells().map(cell => {
                  return (
                    <td key={cell.id} className="p-1">
                      {
                        cell.isPlaceholder
                          ? null
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                      }
                    </td>
                  );
                })
              }
            </tr>
          );
        })
      }
    </tbody>
  );
}

export default TableBody;