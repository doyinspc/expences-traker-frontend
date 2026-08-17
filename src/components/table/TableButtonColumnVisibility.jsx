import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCaretDown, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function TableButtonColumnVisibility(props) {
  const { table } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative inline-block text-left py-auto my-auto" ref={dropdownRef}>
      {/* Smaller, icon-based button */}
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <FontAwesomeIcon icon={faEye} className="mr-1" />
        Columns
        <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-150">
          {/* Constrained dropdown with a scrollbar */}
          <div className="py-2 max-h-100 overflow-y-auto">
            {table.getAllLeafColumns().map(column => (
              <button
                key={column.id}
                as="checkbox"
                onClick={column.getToggleVisibilityHandler()}
                className={`flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left dark:text-gray-200 ${
                  column.getIsVisible() ? 'bg-indigo-100 dark:bg-indigo-700 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {column.getIsVisible() && <FontAwesomeIcon icon={faCheck} className="mr-2 text-indigo-600" />}
                {column.columnDef.header}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}