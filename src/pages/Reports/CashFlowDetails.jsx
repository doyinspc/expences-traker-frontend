// components/CashFlowAnalysis/CashFlowDetails.js
import React, { useState, useMemo } from 'react';

const CashFlowDetails = ({ items = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredItems = useMemo(() => {
    // Defensive: ensure items is an array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }

    try {
      return items.filter(item => {
        if (!item) return false;
        
        // Search filter
        const searchLower = (searchTerm || '').toLowerCase();
        const matchesSearch = !searchLower || 
          (item.item_name?.toLowerCase() || '').includes(searchLower) ||
          (item.account_name?.toLowerCase() || '').includes(searchLower) ||
          (item.category_name?.toLowerCase() || '').includes(searchLower) ||
          (item.document_type?.toLowerCase() || '').includes(searchLower);
        
        // Type filter - category_id = 0 is Debit, category_id = 1 is Credit
        const matchesType = filterType === 'all' || 
          (filterType === 'debit' && item.category_id === 0) ||
          (filterType === 'credit' && item.category_id === 1);
        
        return matchesSearch && matchesType;
      });
    } catch (error) {
      console.error('Error filtering items:', error);
      return [];
    }
  }, [items, searchTerm, filterType]);

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return '₦0.00';
    }
    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount);
    } catch (e) {
      return `₦${numAmount.toFixed(2)}`;
    }
  };

  return (
    <div className="pl-4">
      {/* Details Controls */}
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value || '')}
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
            onClick={() => setFilterType('debit')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filterType === 'debit' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Debit (Inflow)
          </button>
          <button
            onClick={() => setFilterType('credit')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filterType === 'credit' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Credit (Outflow)
          </button>
        </div>
        <span className="text-sm text-gray-500 self-center">
          {filteredItems.length || 0} items
        </span>
      </div>

      {/* Details Table - Removed Date Column */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-green-600 uppercase tracking-wider">Debit Amount</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-red-600 uppercase tracking-wider">Credit Amount</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-center text-sm text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                if (!item) return null;
                const isDebit = item.category_id === 0;
                const debitAmount = isDebit ? parseFloat(item.total_amount) : 0;
                const creditAmount = !isDebit ? parseFloat(item.credit_amount) : 0;
                
                return (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {item.item_name || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {item.account_name || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {item.category_name || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-green-700 text-right">
                      {isDebit ? formatCurrency(debitAmount) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-red-700 text-right">
                      {!isDebit ? formatCurrency(creditAmount) : '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isDebit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isDebit ? 'Debit' : 'Credit'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlowDetails;