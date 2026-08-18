// components/CashFlowAnalysis/CashFlowFilters.js
import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CashFlowFilters = ({ onApplyFilters, isLoading = false }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Set default dates (last 60 days)
  useEffect(() => {
    const today = new Date();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    setStartDate(sixtyDaysAgo);
    setEndDate(today);
  }, []);

  const validateDates = () => {
    const newErrors = {};
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (startDate && endDate && startDate > endDate) {
      newErrors.dateRange = 'Start date cannot be after end date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDates()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Format dates for API
    const formatDate = (date) => {
      if (!date) return '';
      return date.toISOString().split('T')[0];
    };
    
    const filters = {
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      account_id: selectedAccount || null
    };
    
    await onApplyFilters(filters);
    setIsSubmitting(false);
  };

  // Quick date range presets
  const setDateRange = (days) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    
    setStartDate(pastDate);
    setEndDate(today);
    setErrors({});
  };

  // Custom date input
  const CustomDateInput = ({ value, onClick, placeholder, isError }) => (
    <div 
      className={`w-full px-3 py-2 border rounded-md cursor-pointer focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${
        isError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      }`}
      onClick={onClick}
    >
      <span className={value ? 'text-gray-900' : 'text-gray-400'}>
        {value || placeholder}
      </span>
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Cash Flow Filters
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Date Range Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDateRange(7)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange(30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange(60)}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              Last 60 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange(90)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 90 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange(365)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last Year
            </button>
          </div>
        </div>

        {/* Date Range with Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                setErrors({});
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || new Date()}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select start date"
              customInput={
                <CustomDateInput 
                  isError={!!errors.startDate}
                  placeholder="Select start date"
                />
              }
              className="w-full"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                setErrors({});
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select end date"
              customInput={
                <CustomDateInput 
                  isError={!!errors.endDate}
                  placeholder="Select end date"
                />
              }
              className="w-full"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Account Filter - No backend call, will be populated after data loads */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Account
          </label>
          <div className="relative">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Accounts</option>
              {/* This will be populated by the parent component after data loads */}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Date Range Error */}
        {errors.dateRange && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.dateRange}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Note:</span> This analysis shows cash flow for requisition type 4.
            <br />
            <span className="font-semibold text-green-600">Debit (category_id=0):</span> Uses total_amount (Inflow)
            <br />
            <span className="font-semibold text-red-600">Credit (category_id=1):</span> Uses credit_amount (Outflow)
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading || !startDate || !endDate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            'Generate Cash Flow Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default CashFlowFilters;