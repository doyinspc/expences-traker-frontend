// components/ExpenseAnalysis/ExpenseSummary.js
import React, { useState, useMemo } from 'react';
import ExpenseDetails from './ExpenseDetails';
import { isArrayWithValue } from '../../actions/common';

const ExpenseSummary = ({ data = [], onExport, isLoading = false }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'total_amount', direction: 'desc' });

  // Group data by category
  const summaryData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const grouped =  isArrayWithValue(data) && (data?.reduce((acc, item) => {
      const key = item.category_name || 'Uncategorized';
      if (!acc[key]) {
        acc[key] = {
          category: key,
          count: 0,
          total_amount: 0,
          opex_count: 0,
          capex_count: 0,
          items: []
        };
      }
      acc[key].count += 1;
      acc[key].total_amount += parseFloat(item.total_amount) || 0;
      acc[key].items.push(item);
      
      if (item.type === 0) acc[key].opex_count += 1;
      if (item.type === 1) acc[key].capex_count += 1;
      
      return acc;
    }, {}))|| 0;

    return Object.values(grouped);
  }, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    return summaryData.reduce((acc, cat) => ({
      count: acc.count + cat.count,
      total_amount: acc.total_amount + cat.total_amount,
      opex_count: acc.opex_count + cat.opex_count,
      capex_count: acc.capex_count + cat.capex_count
    }), { count: 0, total_amount: 0, opex_count: 0, capex_count: 0 });
  }, [summaryData]);

  // Sort data
  const sortedSummary = useMemo(() => {
    return [...summaryData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [summaryData, sortConfig]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading expense data...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">Select locations and date range to generate analysis.</p>
      </div>
    );
  }

  const toggleRow = (category) => {
    setExpandedRows(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Summary Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Expense Summary
          </h2>
          <button
            onClick={onExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Export CSV
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600">Total Expenses</p>
            <p className="text-lg font-bold text-blue-800">{formatCurrency(totals.total_amount)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm text-purple-600">Total Items</p>
            <p className="text-lg font-bold text-purple-800">{totals.count}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-600">OPEX Items</p>
            <p className="text-lg font-bold text-green-800">{totals.opex_count}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-sm text-orange-600">CAPEX Items</p>
            <p className="text-lg font-bold text-orange-800">{totals.capex_count}</p>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('count')}
              >
                Items {sortConfig.key === 'count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_amount')}
              >
                Total Amount {sortConfig.key === 'total_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                OPEX/CAPEX
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSummary.map((category) => (
              <React.Fragment key={category.category}>
                {/* Main Row */}
                <tr 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(category.category)}
                >
                  <td className="px-4 py-3 text-center">
                    <svg 
                      className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedRows[category.category] ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {category.count}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(category.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        OPEX: {category.opex_count}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        CAPEX: {category.capex_count}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {formatCurrency(category.total_amount / category.count)}
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {expandedRows[category.category] && (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 bg-gray-50">
                      <ExpenseDetails items={category.items} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseSummary;