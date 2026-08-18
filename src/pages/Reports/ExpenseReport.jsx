// components/ExpenseAnalysis/ExpenseAnalysis.js
import React, { useState, useEffect } from 'react';
import ExpenseFilters from './ExpenseFilters';
import ExpenseSummary from './ExpenseSummary';
import useReduxApiData from '../../hooks/useTanstackQuery';

const ExpenseAnalysis = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [step, setStep] = useState(1);
  
  // State for filters
  const [filters, setFilters] = useState({
    location_id: null,
    start_date: '',
    end_date: ''
  });

  // Load locations data
  const { 
    data: locationsData, 
    loadQuery: loadLocationData,
    isLoading: isLocationsLoading
  } = useReduxApiData({
    table: "locations",
    uniqueKey: 'location',
    queryType: 'gets',
    mainParam: { grp: 4, is_active: 0 },
    narration: 'get all locations data'
  });

  // Load expense data
  const { 
    data: expenseData, 
    loadQuery: loadExpenseData,
    isLoading: isExpenseLoading
  } = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: 'expense_analysis',
    queryType: 'getExpensesAnalysis',
    mainParam: filters,
    narration: 'get expense analysis data'
  });

  // Load locations on mount
  useEffect(() => {
    loadLocationData();
  }, []);

  // Update analysis data when expense data changes
  useEffect(() => {
    if (expenseData && expenseData.length > 0) {
      setAnalysisData(expenseData);
      setStep(2);
    }
  }, [expenseData]);

  const handleApplyFilters = async (filterData) => {
    // Update filters state
    const newFilters = {
      location_id: filterData.location_id || null,
      start_date: filterData.start_date || '',
      end_date: filterData.end_date || ''
    };
    
    setFilters(newFilters);
    setCurrentFilters(filterData);
    
    // Load expense data with new filters
    await loadExpenseData();
  };

  const handleExportCSV = () => {
    if (!analysisData.length) return;
    
    // Create CSV from data
    const headers = ['Category', 'Item', 'Account', 'Document Type', 'Total Amount', 'Type', 'Date', 'Location'];
    const rows = analysisData.map(item => [
      item.category_name || 'N/A',
      item.item_name || 'N/A',
      item.account_name || 'N/A',
      item.document_type || 'N/A',
      item.total_amount || 0,
      item.type === 0 ? 'OPEX' : 'CAPEX',
      item.resolved_at ? new Date(item.resolved_at).toLocaleDateString() : 'N/A',
      item.location_name || 'N/A'
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    setStep(1);
  };

  // Format locations data for the filter component
  const locations = locationsData?.map(loc => ({
    id: loc.id,
    name: loc.name
  })) || [];

  // Check if data is loading
  const isLoading = isLocationsLoading || isExpenseLoading;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Expense Analysis
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              Step 1: Filters
            </span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              Step 2: Results
            </span>
          </div>
        </div>

        {/* Step 1: Filters */}
        {step === 1 && (
          <ExpenseFilters
            locations={locations}
            onApplyFilters={handleApplyFilters}
            isLoading={isLoading}
          />
        )}

        {/* Step 2: Results */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Filters
              </button>
              <span className="text-sm text-gray-500">
                {analysisData.length} items found
              </span>
            </div>
            
            <ExpenseSummary
              data={analysisData}
              onExport={handleExportCSV}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalysis;