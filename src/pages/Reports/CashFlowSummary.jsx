// components/CashFlowAnalysis/CashFlowSummary.js
import React, { useState, useMemo } from 'react';
import CashFlowDetails from './CashFlowDetails';

const CashFlowSummary = ({ data = [], onExport, isLoading = false }) => {
  // All hooks MUST be called at the top level, before any conditional returns
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'resolved_date', direction: 'desc' });
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'flat'

  // Calculate summary statistics - VERY DEFENSIVE
  const summary = useMemo(() => {
    // Guard against invalid data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    try {
      // category_id = 0 is Debit (Inflow) - uses total_amount
      // category_id = 1 is Credit (Outflow) - uses credit_amount
      const totalDebit = data.reduce((sum, item) => {
        if (!item) return sum;
        const amount = parseFloat(item.total_amount);
        return sum + (item.category_id === 0 && !isNaN(amount) ? amount : 0);
      }, 0);

      const totalCredit = data.reduce((sum, item) => {
        if (!item) return sum;
        const amount = parseFloat(item.credit_amount);
        return sum + (item.category_id === 1 && !isNaN(amount) ? amount : 0);
      }, 0);

      const netCashFlow = totalDebit - totalCredit;

      // Group by date - with null safety
      const groupedByDate = data.reduce((acc, item) => {
        if (!item) return acc;
        
        let dateKey = 'Unknown';
        try {
          if (item.resolved_date) {
            dateKey = new Date(item.resolved_date).toISOString().split('T')[0];
          }
        } catch (e) {
          dateKey = 'Unknown';
        }
        
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            debit: 0,
            credit: 0,
            items: [],
            count: 0
          };
        }
        
        // Add amounts with null safety
        if (item.category_id === 0) {
          const amount = parseFloat(item.total_amount);
          if (!isNaN(amount)) {
            acc[dateKey].debit += amount;
          }
        } else if (item.category_id === 1) {
          const amount = parseFloat(item.credit_amount);
          if (!isNaN(amount)) {
            acc[dateKey].credit += amount;
          }
        }
        
        acc[dateKey].items.push(item);
        acc[dateKey].count += 1;
        return acc;
      }, {});

      return {
        totalDebit: isNaN(totalDebit) ? 0 : totalDebit,
        totalCredit: isNaN(totalCredit) ? 0 : totalCredit,
        netCashFlow: isNaN(netCashFlow) ? 0 : netCashFlow,
        transactionCount: data.length || 0,
        groupedByDate: Object.values(groupedByDate) || [],
        flatData: data || []
      };
    } catch (error) {
      console.error('Error calculating summary:', error);
      return null;
    }
  }, [data]);

  // Helper functions (defined after hooks)
  const toggleRow = (key) => {
    if (!key) return;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Sort grouped data - defensive
  const sortedGroupedData = useMemo(() => {
    if (!summary || !summary.groupedByDate) return [];
    try {
      return [...summary.groupedByDate].sort((a, b) => {
        if (!a || !b) return 0;
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } catch (e) {
      return summary.groupedByDate || [];
    }
  }, [summary, sortConfig]);

  // Sort flat data - defensive
  const sortedFlatData = useMemo(() => {
    if (!summary || !summary.flatData) return [];
    try {
      return [...summary.flatData].sort((a, b) => {
        if (!a || !b) return 0;
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } catch (e) {
      return summary.flatData || [];
    }
  }, [summary, sortConfig]);

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grouped' ? 'flat' : 'grouped');
    setExpandedRows({}); // Reset expanded rows when switching views
  };

  // ALL conditional returns MUST come AFTER all hooks
  // Defensive guard for loading
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading cash flow data...</span>
        </div>
      </div>
    );
  }

  // Defensive guard for no data
  if (!summary || (!summary.groupedByDate?.length && !summary.flatData?.length)) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No cash flow data available</h3>
        <p className="mt-1 text-sm text-gray-500">Select a date range to generate cash flow analysis.</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Summary Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-xl font-bold text-gray-800">
            Cash Flow Summary
          </h2>
          <div className="flex items-center gap-3">
            {/* View Toggle Button */}
            <button
              onClick={toggleViewMode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors border border-blue-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {viewMode === 'grouped' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                )}
              </svg>
              {viewMode === 'grouped' ? 'Show Flat List' : 'Group by Date'}
            </button>
            
            <button
              onClick={onExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-600">Total Debit (Inflow)</p>
            <p className="text-lg font-bold text-green-800">{formatCurrency(summary.totalDebit)}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-sm text-red-600">Total Credit (Outflow)</p>
            <p className="text-lg font-bold text-red-800">{formatCurrency(summary.totalCredit)}</p>
          </div>
          <div className={`rounded-lg p-3 ${summary.netCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className={`text-sm ${summary.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Net Cash Flow
            </p>
            <p className={`text-lg font-bold ${summary.netCashFlow >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              {formatCurrency(summary.netCashFlow)}
            </p>
          </div>
        </div>
        
        {/* View mode indicator */}
        <div className="mt-3 text-sm text-gray-500">
          Viewing: <span className="font-medium">{viewMode === 'grouped' ? 'Grouped by Date' : 'Flat List (All Items)'}</span>
          <span className="ml-2 text-gray-400">|</span>
          <span className="ml-2">{summary.transactionCount} items total</span>
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'grouped' ? (
        // GROUPED VIEW - Grouped by Date
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('count')}
                >
                  Items {sortConfig.key === 'count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                  Debit (Inflow)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-red-600 uppercase tracking-wider">
                  Credit (Outflow)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedGroupedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                sortedGroupedData.map((group) => {
                  if (!group) return null;
                  return (
                    <React.Fragment key={group.date || 'unknown'}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => toggleRow(group.date)}
                      >
                        <td className="px-4 py-3 text-center">
                          <svg 
                            className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedRows[group.date] ? 'rotate-90' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatDate(group.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {group.count || 0}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-700 text-right">
                          {formatCurrency(group.debit || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-700 text-right">
                          {formatCurrency(group.credit || 0)}
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {expandedRows[group.date] && group.items && group.items.length > 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-3 bg-gray-50">
                            <CashFlowDetails items={group.items} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // FLAT VIEW - All items as a flat list
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('resolved_date')}
                >
                  Date {sortConfig.key === 'resolved_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('item_name')}
                >
                  Item {sortConfig.key === 'item_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('account_name')}
                >
                  Account {sortConfig.key === 'account_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category_name')}
                >
                  Category {sortConfig.key === 'category_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-red-600 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFlatData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-3 text-center text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                sortedFlatData.map((item, index) => {
                  if (!item) return null;
                  const isDebit = item.category_id === 0;
                  const rowKey = item.id || `item-${index}`;
                  
                  return (
                    <React.Fragment key={rowKey}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleRow(rowKey)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg 
                              className={`h-5 w-5 transform transition-transform ${expandedRows[rowKey] ? 'rotate-90' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTime(item.resolved_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.item_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.account_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.category_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-700 text-right">
                          {isDebit ? formatCurrency(item.total_amount) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-700 text-right">
                          {!isDebit ? formatCurrency(item.credit_amount) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isDebit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isDebit ? 'Debit' : 'Credit'}
                          </span>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row - Shows full item details */}
                      {expandedRows[rowKey] && (
                        <tr>
                          <td colSpan="8" className="px-4 py-3 bg-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-500">Item:</span>
                                <span className="ml-2 text-gray-900">{item.item_name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Account:</span>
                                <span className="ml-2 text-gray-900">{item.account_name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Category:</span>
                                <span className="ml-2 text-gray-900">{item.category_name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Document Type:</span>
                                <span className="ml-2 text-gray-900">{item.document_type || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Debit Amount:</span>
                                <span className="ml-2 text-green-700 font-semibold">
                                  {isDebit ? formatCurrency(item.total_amount) : '-'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Credit Amount:</span>
                                <span className="ml-2 text-red-700 font-semibold">
                                  {!isDebit ? formatCurrency(item.credit_amount) : '-'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Type:</span>
                                <span className={`ml-2 font-semibold ${isDebit ? 'text-green-700' : 'text-red-700'}`}>
                                  {isDebit ? 'Debit (Inflow)' : 'Credit (Outflow)'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Resolved:</span>
                                <span className="ml-2 text-gray-900">{formatDateTime(item.resolved_date)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashFlowSummary;