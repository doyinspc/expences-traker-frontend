import React from 'react';
import Input from '../form/input/InputField';

function TableSearch(props) {
  const { globalFilter } = props;

  return (
    <Input
      type="text"
      size="sm"
      placeholder="Search..."
      value={globalFilter}
      onChange={(e) => props.setGlobalFilter(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    />
  );
}

export default TableSearch;