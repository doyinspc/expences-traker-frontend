// components/ExpenseAnalysis/ExpenseDetails.js
import React, { useState, useMemo } from 'react';

const ExpenseDetails = ({ items = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, opex, capex

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || 
                         (filterType === 'opex' && item.type === 0) ||
                         (filterType === 'capex' && item.type === 1);
      
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, filterType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pl-4">
      {/* Details Controls */}
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('opex')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filterType === 'opex' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            OPEX
          </button>
          <button
            onClick={() => setFilterType('capex')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filterType === 'capex' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            CAPEX
          </button>
        </div>
        <span className="text-sm text-gray-500 self-center">
          {filteredItems.length} items
        </span>
      </div>

      {/* Details Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc Type</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-3 py-4 text-center text-sm text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">{item.item_name || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{item.account_name || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{item.document_type || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm text-gray-600 text-right">
                    {formatCurrency(item.unit_amount || 0)}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.total_amount || 0)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {item.type === 0 ? 'OPEX' : 'CAPEX'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600 text-center">
                    {formatDate(item.resolved_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseDetails;