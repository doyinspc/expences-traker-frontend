// components/BudgetAnalysis/BudgetAnalysis.js
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
    isLoading: isAnalysisLoading
  } = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: 'budget_analysis',
    queryType: 'getBudgetCategoryItemAnalysis',
    mainParam: { budget_id: selectedBudget },
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
    await loadBudgetAnalysis();
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

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

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
    period: budget.period
  })) || [];

  // Get selected budget name
  const selectedBudgetName = useMemo(() => {
    if (!selectedBudget) return null;
    const budget = budgetOptions.find(b => String(b.id) === String(selectedBudget));
    return budget ? budget.name : null;
  }, [selectedBudget, budgetOptions]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Budget vs Actual Analysis
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
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
            <div className="flex justify-between items-center bg-white rounded-lg shadow p-4 flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Budgets
                </button>
                {selectedBudgetName && (
                  <span className="text-sm font-medium text-gray-700">
                    Budget: {selectedBudgetName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex rounded-md shadow-sm border border-gray-200">
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-l-md transition-colors ${
                      viewMode === 'summary' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setViewMode('details')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-r-md transition-colors ${
                      viewMode === 'details' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
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