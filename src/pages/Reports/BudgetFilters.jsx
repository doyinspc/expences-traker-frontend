// components/BudgetAnalysis/BudgetFilters.js
import React, { useState } from 'react';

const BudgetFilters = ({ budgets = [], onSelectBudget, isLoading = false }) => {
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [error, setError] = useState('');
  console.log(budgets)

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedBudgetId) {
      setError('Please select a budget');
      return;
    }
    
    setError('');
    onSelectBudget(selectedBudgetId);
  };

  const formatBudgetLabel = (budget) => {
    let label = budget?.name || `Budget ${budget.id}`;
    if (budget.amount) {
      label += ` (${budget.amount})`;
    }
    if (budget.period) {
      label += ` - ${budget.period}`;
    }
    return label;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Select Budget for Analysis
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Budget Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose a Budget
          </label>
          
          <div className="relative">
            <select
              value={selectedBudgetId}
              onChange={(e) => {
                setSelectedBudgetId(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Select a budget...</option>
              {budgets.map((budget) => (
                <option key={budget.description || budget.id } value={budget.id}>
                  {formatBudgetLabel(budget)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          {budgets.length === 0 && !isLoading && (
            <p className="mt-2 text-sm text-gray-500">No budgets available. Please create a budget first.</p>
          )}
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">About this analysis:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Shows budgeted amounts vs actual spending</li>
            <li>• Includes requisitions (Type 3) and purchase orders (Type 2)</li>
            <li>• Variance = Budgeted - Spent (Positive = Under budget)</li>
            <li>• Percentage spent shows how much of the budget has been used</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || budgets.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            'Analyze Budget'
          )}
        </button>
      </form>
    </div>
  );
};

export default BudgetFilters;