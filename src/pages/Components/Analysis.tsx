// src/pages/Components/Analysis.tsx

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet } from 'lucide-react';

// ==================== TYPES ====================

interface AnalysisProps {
  data: any[];           // processedRows from parent
  analysisData: any;     // from generateAnalysisData()
  loading?: boolean;
  className?: string;
}

// ==================== COLORS ====================

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#6366F1', '#14B8A6', '#F472B6', '#34D399'
];

// ==================== COMPONENT ====================

const Analysis: React.FC<AnalysisProps> = ({
  data = [],
  analysisData = {},
  loading = false,
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // 🛡️ DEFENSIVE: Extract data from analysisData or generate fallbacks
  const { 
    chartData = [], 
    summary = null, 
    categories = [], 
    trend = [],
    metrics = null
  } = useMemo(() => {
    // If analysisData has the expected structure
    if (analysisData && typeof analysisData === 'object') {
      return {
        chartData: analysisData.chartData || analysisData.data || [],
        summary: analysisData.summary || null,
        categories: analysisData.categories || analysisData.chartData || [],
        trend: analysisData.trend || analysisData.trendData || [],
        metrics: analysisData.metrics || null,
      };
    }
    return { chartData: [], summary: null, categories: [], trend: [], metrics: null };
  }, [analysisData]);

  // 🛡️ DEFENSIVE: Generate fallback summary from raw data
  const fallbackSummary = useMemo(() => {
    if (summary) return summary;

    if (data && data.length > 0) {
      const total = data.reduce((sum, item) => {
        const val = parseFloat(item.amount) || parseFloat(item.total) || parseFloat(item.value) || 0;
        return sum + val;
      }, 0);

      const amounts = data.map(item => 
        parseFloat(item.amount) || parseFloat(item.total) || parseFloat(item.value) || 0
      );

      return {
        totalExpenses: total,
        recordCount: data.length,
        averageExpense: data.length > 0 ? total / data.length : 0,
        highestAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
        lowestAmount: amounts.length > 0 ? Math.min(...amounts) : 0,
      };
    }

    return {
      totalExpenses: 0,
      recordCount: 0,
      averageExpense: 0,
      highestAmount: 0,
      lowestAmount: 0,
    };
  }, [data, summary]);

  // 🛡️ DEFENSIVE: Get display data (prefer analysisData, fallback to raw)
  const displayData = useMemo(() => {
    // If analysisData has data, use it
    if (chartData && chartData.length > 0) {
      return chartData;
    }

    // Generate from raw data
    if (data && data.length > 0) {
      // Try to find a grouping field
      const groupBy = analysisData?.groupBy || 'category';
      const metric = analysisData?.metric || 'amount';

      const map: Record<string, number> = {};
      data.forEach((item) => {
        const key = item[groupBy] || item.category || item.type || 'Other';
        const value = parseFloat(item[metric]) || parseFloat(item.amount) || parseFloat(item.total) || 0;
        map[key] = (map[key] || 0) + value;
      });

      return Object.entries(map).map(([name, value]) => ({
        name,
        value,
        count: data.filter(item => (item[groupBy] || item.category || 'Other') === name).length,
      }));
    }

    return [];
  }, [data, analysisData, chartData]);

  // 🛡️ DEFENSIVE: Get trend data
  const trendData = useMemo(() => {
    if (trend && trend.length > 0) {
      return trend;
    }

    if (data && data.length > 0) {
      const map: Record<string, number> = {};
      data.forEach((item) => {
        const date = item.date || item.created_at || item.updated_at;
        if (date) {
          const d = new Date(date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const value = parseFloat(item.amount) || parseFloat(item.total) || parseFloat(item.value) || 0;
          map[key] = (map[key] || 0) + value;
        }
      });

      return Object.entries(map)
        .map(([date, expenses]) => ({ date, expenses }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    return [];
  }, [data, trend]);

  // ==================== RENDER HELPERS ====================

  const formatCurrency = (value: number) => {
    if (!value) return '₦0';
    return `₦${value.toLocaleString()}`;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Data Available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            There are no records to analyze. Add some data to see insights and trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {data.length} records analyzed
          </span>
          {analysisData?.groupBy && (
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              Group: {analysisData.groupBy}
            </span>
          )}
          {analysisData?.metric && (
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              Metric: {analysisData.metric}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(fallbackSummary.totalExpenses)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {fallbackSummary.recordCount || data.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Expense</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(fallbackSummary.averageExpense)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Wallet className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Highest Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(fallbackSummary.highestAmount)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {analysisData?.groupBy ? `By ${analysisData.groupBy}` : 'Category Breakdown'}
          </h3>
          <div className="h-[300px]">
            {displayData && displayData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {displayData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                No data to display
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart - Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense Trend
          </h3>
          <div className="h-[300px]">
            {trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  />
                  <Bar dataKey="expenses" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Preview ({data.length} records)
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Showing first 5 records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {data[0] && Object.keys(data[0]).slice(0, 6).map((key) => (
                  <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.slice(0, 5).map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  {Object.keys(item).slice(0, 6).map((key) => (
                    <td key={key} className="px-4 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                      {typeof item[key] === 'object' 
                        ? JSON.stringify(item[key]).slice(0, 50) 
                        : String(item[key] || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 5 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/30 text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                + {data.length - 5} more records
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;