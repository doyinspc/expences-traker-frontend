// components/BudgetAnalysis/BudgetAnalysis.js
import { buildReportCsv } from '../../utils/functions/reportExport';
import React, { useState, useEffect, useMemo } from 'react';
import BudgetFilters from './BudgetFilters';
import BudgetSummary from './BudgetSummary';
import useReduxApiData from '../../hooks/useTanstackQuery';

const BudgetAnalysis = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'details'

  // Load budgets list
  const { 
    data: budgetsData, 
    loadQuery: loadBudgets,
    isLoading: isBudgetsLoading
  } = useReduxApiData({
    table: 'budgets',
    uniqueKey: 'budgets',
    queryType: 'gets',
    mainParam: { is_active: 1 },
    narration: 'get all budgets'
  });

  // Load budget analysis data
  const { 
    data: budgetAnalysis, 
    loadQuery: loadBudgetAnalysis,
    error: reportError,
    isLoading: isAnalysisLoading
  } = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: 'budget_analysis',
    queryType: 'getBudgetCategoryItemAnalysis',
    mainParam: {},
    autoLoad: false,
    narration: 'get budget analysis data'
  });

  // Load budgets on mount
  useEffect(() => {
    loadBudgets();
  }, []);

  // Update analysis data when budget analysis changes
  useEffect(() => {
    if (budgetAnalysis && Array.isArray(budgetAnalysis)) {
      setAnalysisData(budgetAnalysis);
      if (budgetAnalysis.length > 0) {
        setStep(2);
      } else {
        setStep(2);
      }
    }
  }, [budgetAnalysis]);

  const handleBudgetSelect = async (budgetId) => {
    setSelectedBudget(budgetId);
    setCurrentFilters({ budget_id: budgetId });
    await loadBudgetAnalysis({budget_id:budgetId});
  };

  const handleExportCSV = () => {
    if (!analysisData || analysisData.length === 0) return;

    try {
      const headers = ['Category', 'Item', 'Budgeted Amount', 'Amount Spent', 'Variance', 'Percentage Spent'];
      const rows = analysisData.map(item => {
        if (!item) return null;
        return [
          item.category_name || 'N/A',
          item.item_name || 'N/A',
          item.budgeted_amount || 0,
          item.amount_spent || 0,
          item.variance || 0,
          item.percentage_spent || 0
        ];
      }).filter(row => row !== null);

      const csv = buildReportCsv(headers,rows);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-analysis-${new Date().toISOString().split('T')[0]}.csv`;
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
    setSelectedBudget(null);
    setAnalysisData([]);
  };

  // Format budgets for dropdown
  const budgetOptions = budgetsData?.map(budget => ({
    id: budget.id,
    name: budget.budget_name || `Budget ${budget.id}`,
    amount: budget.total_amount,
    period: budget.start_date && budget.end_date ? `${budget.start_date} to ${budget.end_date}` : budget.period
  })) || [];

  // Get selected budget name
  const selectedBudgetName = useMemo(() => {
    if (!selectedBudget) return null;
    const budget = budgetOptions.find(b => String(b.id) === String(selectedBudget));
    return budget ? budget.name : null;
  }, [selectedBudget, budgetOptions]);

  return (
    <div className="min-w-0">
      <div className="max-w-7xl mx-auto space-y-6">
        {reportError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"><p>{reportError.response?.data?.message || reportError.message || "The report could not be loaded."}</p><button type="button" onClick={() => loadBudgetAnalysis({budget_id:selectedBudget})} className="mt-2 min-h-11 underline">Try again</button></div>}
        {/* Header */}
        <div className="flex flex-wrap gap-3 justify-between items-center bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Budget vs Actual Analysis
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              Step 1: Select Budget
            </span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              Step 2: Results
            </span>
          </div>
        </div>

        {/* Step 1: Select Budget */}
        {step === 1 && (
          <BudgetFilters
            budgets={budgetOptions}
            onSelectBudget={handleBudgetSelect}
            isLoading={isBudgetsLoading || isAnalysisLoading}
          />
        )}

        {/* Step 2: Results */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-between items-center bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-800 transition-colors"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Budgets
                </button>
                {selectedBudgetName && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Budget: {selectedBudgetName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex rounded-md shadow-sm border border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-l-md transition-colors ${
                      viewMode === 'summary' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setViewMode('details')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-r-md transition-colors ${
                      viewMode === 'details' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Details
                  </button>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <BudgetSummary
              data={analysisData}
              viewMode={viewMode}
              onExport={handleExportCSV}
              isLoading={isAnalysisLoading}
              budgetName={selectedBudgetName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetAnalysis;