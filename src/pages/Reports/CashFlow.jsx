// components/CashFlowAnalysis/CashFlowAnalysis.js
import React, { useState, useEffect, useMemo } from 'react';
import CashFlowFilters from './CashFlowFilters';
import CashFlowSummary from './CashFlowSummary';
import useReduxApiData from '../../hooks/useTanstackQuery';

const CashFlowAnalysis = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('');
  
  // State for filters
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    account_id: null
  });

  // Load cash flow data
  const { 
    data: cashFlowData, 
    loadQuery: loadCashFlowData,
    isLoading: isCashFlowLoading
  } = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: 'cash_flow_analysis',
    queryType: 'getCashFlowAnalysis',
    mainParam: filters,
    narration: 'get cash flow analysis data'
  });

  // Update analysis data when cash flow data changes
  useEffect(() => {
    if (cashFlowData && Array.isArray(cashFlowData)) {
      setAnalysisData(cashFlowData);
      if (cashFlowData.length > 0) {
        setStep(2);
      } else {
        setStep(2); // Still go to step 2 to show empty state
      }
    }
  }, [cashFlowData]);

  // Extract unique accounts from the data - with defensive checks
  const uniqueAccounts = useMemo(() => {
    if (!analysisData || !Array.isArray(analysisData) || analysisData.length === 0) {
      return [];
    }

    try {
      const accountMap = new Map();
      
      analysisData.forEach(item => {
        if (!item) return;
        const accountId = item.account_id;
        const accountName = item.account_name;
        const accountCode = item.account_code;
        
        if (accountId && accountName && !accountMap.has(accountId)) {
          accountMap.set(accountId, {
            id: accountId,
            name: accountName,
            code: accountCode || ''
          });
        }
      });

      // Convert to array and sort by name
      return Array.from(accountMap.values()).sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
    } catch (error) {
      console.error('Error extracting unique accounts:', error);
      return [];
    }
  }, [analysisData]);

  const handleApplyFilters = async (filterData) => {
    // Update filters state
    const newFilters = {
      start_date: filterData.start_date || '',
      end_date: filterData.end_date || '',
      account_id: filterData.account_id || null
    };
    
    setFilters(newFilters);
    setCurrentFilters(filterData);
    setSelectedAccountFilter(filterData.account_id || '');
    
    // Load cash flow data with new filters
    await loadCashFlowData();
  };

  const handleAccountFilterChange = (accountId) => {
    setSelectedAccountFilter(accountId);
    // You could auto-apply here if needed
  };

  const handleExportCSV = () => {
    if (!analysisData || analysisData.length === 0) return;
    
    try {
      // Create CSV from data
      const headers = ['Date', 'Item', 'Account', 'Category', 'Document Type', 'Debit Amount', 'Credit Amount', 'Type'];
      const rows = analysisData.map(item => {
        if (!item) return null;
        return [
          item.resolved_date ? new Date(item.resolved_date).toLocaleDateString() : 'N/A',
          item.item_name || 'N/A',
          item.account_name || 'N/A',
          item.category_name || 'N/A',
          item.document_type || 'N/A',
          item.category_id === 0 ? (item.total_amount || 0) : '-',
          item.category_id === 1 ? (item.credit_amount || 0) : '-',
          item.category_id === 0 ? 'Debit' : 'Credit'
        ];
      }).filter(row => row !== null);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cash-flow-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  // Get the selected account name for display
  const selectedAccountName = useMemo(() => {
    if (!selectedAccountFilter) return null;
    const account = uniqueAccounts.find(a => String(a.id) === String(selectedAccountFilter));
    return account ? account.name : null;
  }, [selectedAccountFilter, uniqueAccounts]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Cash Flow Analysis
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
          <CashFlowFilters
            onApplyFilters={handleApplyFilters}
            isLoading={isCashFlowLoading}
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
              <div className="flex items-center space-x-4">
                {selectedAccountName && (
                  <span className="text-sm text-gray-500">
                    Account: {selectedAccountName}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {analysisData?.length || 0} items found
                </span>
              </div>
            </div>
            
            {/* Account Filter Dropdown (populated from data) */}
            {uniqueAccounts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Filter by Account:
                  </label>
                  <select
                    value={selectedAccountFilter}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedAccountFilter(value);
                      // Re-apply filter with selected account
                      const newFilters = {
                        ...filters,
                        account_id: value || null
                      };
                      setFilters(newFilters);
                      setCurrentFilters({
                        ...currentFilters,
                        account_id: value || null
                      });
                      loadCashFlowData();
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Accounts</option>
                    {uniqueAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code ? `${account.code} - ${account.name}` : account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <CashFlowSummary
              data={analysisData}
              onExport={handleExportCSV}
              isLoading={isCashFlowLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowAnalysis;