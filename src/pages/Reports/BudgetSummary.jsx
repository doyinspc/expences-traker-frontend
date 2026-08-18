// components/BudgetAnalysis/BudgetSummary.js
import React, { useState, useMemo } from 'react';

const BudgetSummary = ({ data = [], viewMode = 'summary', isLoading = false, budgetName = '' }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'category_name', direction: 'asc' });
  const [filterCategory, setFilterCategory] = useState('');

  // Calculate summary totals
  const summary = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    try {
      const totalBudgeted = data.reduce((sum, item) => {
        return sum + (parseFloat(item.budgeted_amount) || 0);
      }, 0);

      const totalSpent = data.reduce((sum, item) => {
        return sum + (parseFloat(item.amount_spent) || 0);
      }, 0);

      const totalVariance = totalBudgeted - totalSpent;
      const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

      // Group by category
      const groupedByCategory = data.reduce((acc, item) => {
        const key = item.category_name || 'Uncategorized';
        if (!acc[key]) {
          acc[key] = {
            category: key,
            items: [],
            budgeted: 0,
            spent: 0,
            count: 0
          };
        }
        acc[key].items.push(item);
        acc[key].budgeted += parseFloat(item.budgeted_amount) || 0;
        acc[key].spent += parseFloat(item.amount_spent) || 0;
        acc[key].count += 1;
        return acc;
      }, {});

      return {
        totalBudgeted,
        totalSpent,
        totalVariance,
        overallPercentage,
        groupedByCategory: Object.values(groupedByCategory),
        allItems: data
      };
    } catch (error) {
      console.error('Error calculating summary:', error);
      return null;
    }
  }, [data]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!summary || !summary.groupedByCategory) return [];
    return summary.groupedByCategory.map(g => g.category);
  }, [summary]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!summary) return [];
    
    let items = summary.allItems || [];
    
    // Filter by category
    if (filterCategory) {
      items = items.filter(item => item.category_name === filterCategory);
    }
    
    // Sort
    try {
      return [...items].sort((a, b) => {
        if (!a || !b) return 0;
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } catch (e) {
      return items;
    }
  }, [summary, filterCategory, sortConfig]);

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

  const formatPercentage = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0%';
    return `${num.toFixed(1)}%`;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleRow = (key) => {
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getStatusColor = (percentage) => {
    const num = parseFloat(percentage);
    if (isNaN(num)) return 'text-gray-600';
    if (num >= 100) return 'text-red-600';
    if (num >= 80) return 'text-orange-600';
    if (num >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (percentage) => {
    const num = parseFloat(percentage);
    if (isNaN(num)) return { color: 'bg-gray-100 text-gray-800', label: 'N/A' };
    if (num >= 100) return { color: 'bg-red-100 text-red-800', label: 'Exceeded' };
    if (num >= 80) return { color: 'bg-orange-100 text-orange-800', label: 'Near Limit' };
    if (num >= 50) return { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' };
    return { color: 'bg-green-100 text-green-800', label: 'Under Budget' };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading budget data...</span>
        </div>
      </div>
    );
  }

  if (!summary || summary.allItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No budget data available</h3>
        <p className="mt-1 text-sm text-gray-500">No items found for this budget.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total Budgeted</p>
            <p className="text-xl font-bold text-blue-800">{formatCurrency(summary.totalBudgeted)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600">Total Spent</p>
            <p className="text-xl font-bold text-purple-800">{formatCurrency(summary.totalSpent)}</p>
          </div>
          <div className={`rounded-lg p-4 ${summary.totalVariance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${summary.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Variance
            </p>
            <p className={`text-xl font-bold ${summary.totalVariance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(summary.totalVariance)}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600">Overall Usage</p>
            <p className={`text-xl font-bold ${getStatusColor(summary.overallPercentage)}`}>
              {formatPercentage(summary.overallPercentage)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {filterCategory && (
          <button
            onClick={() => setFilterCategory('')}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear
          </button>
        )}
        <span className="text-sm text-gray-500 ml-auto">
          {filteredData.length} items
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {viewMode === 'summary' ? (
                // Summary View - Grouped by Category
                <>
                  <th className="w-10 px-4 py-3"></th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category_name')}
                  >
                    Category {sortConfig.key === 'category_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('item_name')}
                  >
                    Item {sortConfig.key === 'item_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('budgeted_amount')}
                  >
                    Budgeted {sortConfig.key === 'budgeted_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-purple-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount_spent')}
                  >
                    Spent {sortConfig.key === 'amount_spent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('variance')}
                  >
                    Variance {sortConfig.key === 'variance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </>
              ) : (
                // Details View - All items with more columns
                <>
                  <th className="w-10 px-4 py-3"></th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category_name')}
                  >
                    Category {sortConfig.key === 'category_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('item_name')}
                  >
                    Item {sortConfig.key === 'item_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('budgeted_amount')}
                  >
                    Budgeted {sortConfig.key === 'budgeted_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-purple-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount_spent')}
                  >
                    Spent {sortConfig.key === 'amount_spent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('variance')}
                  >
                    Variance {sortConfig.key === 'variance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('percentage_spent')}
                  >
                    Usage {sortConfig.key === 'percentage_spent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={viewMode === 'summary' ? 7 : 8} className="px-4 py-3 text-center text-sm text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => {
                if (!item) return null;
                const rowKey = item.item_id || `item-${index}`;
                const percentage = parseFloat(item.percentage_spent) || 0;
                const status = getStatusBadge(percentage);
                const isExpanded = expandedRows[rowKey];

                return (
                  <React.Fragment key={rowKey}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleRow(rowKey)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg 
                            className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.category_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.item_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-700 text-right">
                        {formatCurrency(item.budgeted_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-purple-700 text-right">
                        {formatCurrency(item.amount_spent)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold text-right ${parseFloat(item.variance) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(item.variance)}
                      </td>
                      {viewMode === 'details' && (
                        <td className={`px-4 py-3 text-sm font-semibold text-right ${getStatusColor(percentage)}`}>
                          {formatPercentage(percentage)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={viewMode === 'summary' ? 7 : 8} className="px-4 py-3 bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-500">Category:</span>
                              <span className="ml-2 text-gray-900">{item.category_name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Item:</span>
                              <span className="ml-2 text-gray-900">{item.item_name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Budgeted:</span>
                              <span className="ml-2 text-blue-700 font-semibold">{formatCurrency(item.budgeted_amount)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Spent:</span>
                              <span className="ml-2 text-purple-700 font-semibold">{formatCurrency(item.amount_spent)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Variance:</span>
                              <span className={`ml-2 font-semibold ${parseFloat(item.variance) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(item.variance)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Usage:</span>
                              <span className={`ml-2 font-semibold ${getStatusColor(percentage)}`}>
                                {formatPercentage(percentage)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Status:</span>
                              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
        Showing {filteredData.length} of {summary.allItems.length} items
        {filterCategory && ` (filtered by: ${filterCategory})`}
      </div>
    </div>
  );
};

export default BudgetSummary;