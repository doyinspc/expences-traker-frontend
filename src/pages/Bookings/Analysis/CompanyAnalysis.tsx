// ==================== COMPANY ANALYSIS COMPONENT ====================

import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
} from 'recharts';

interface AnalysisProps {
  data: any[];
  isLoading?: boolean;
}

interface CompanyStats {
  name: string;
  companyCount: number;
  totalClients: number;
  totalBookings: number;
  avgBookingsPerClient: number;
  clientEfficiency: number; // bookings per client ratio
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6', '#F472B6', '#8B5CF6'];

// ==================== HELPER FUNCTIONS ====================

// Safe number parser - converts any value to number or returns 0
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Format number with commas
const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Format number with decimal places
const formatDecimal = (value: number, decimals: number = 1): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format percentage
const formatPercentage = (value: number): string => {
  return value.toFixed(1) + '%';
};

const CompanyAnalysis: React.FC<AnalysisProps> = ({ data = [], isLoading = false }) => {
  const [timeRange, setTimeRange] = useState<'all' | 'top10' | 'top25'>('all');

  // ==================== DATA PROCESSING ====================

  const processedData = useMemo(() => {
    // Defensive: ensure data is an array
    const safeData = Array.isArray(data) ? data : [];
    
    if (safeData.length === 0) {
      return {
        companyStats: [],
        totalCompanies: 0,
        totalClients: 0,
        totalBookings: 0,
        avgClientsPerCompany: 0,
        avgBookingsPerCompany: 0,
        avgBookingsPerClient: 0,
        topCompaniesByClients: [],
        topCompaniesByBookings: [],
        topCompaniesByEfficiency: [],
        clientDistribution: [],
        bookingDistribution: [],
      };
    }

    // Process each company
    const companyStatsMap = new Map<string, CompanyStats>();
    let totalClients = 0;
    let totalBookings = 0;

    safeData.forEach((company) => {
      // Skip if no name
      if (!company.name) return;

      const companyName = company.name || 'Unnamed Company';
      
      // Use total_clients as the field name
      const clients = safeNumber(company.total_clients);
      const bookings = safeNumber(company.total_bookings);

      totalClients += clients;
      totalBookings += bookings;

      if (!companyStatsMap.has(companyName)) {
        companyStatsMap.set(companyName, {
          name: companyName,
          companyCount: 0,
          totalClients: 0,
          totalBookings: 0,
          avgBookingsPerClient: 0,
          clientEfficiency: 0,
        });
      }
      const stats = companyStatsMap.get(companyName)!;
      stats.companyCount += 1;
      stats.totalClients += clients;
      stats.totalBookings += bookings;
      stats.avgBookingsPerClient = stats.totalClients > 0 
        ? stats.totalBookings / stats.totalClients 
        : 0;
      stats.clientEfficiency = stats.totalClients > 0
        ? (stats.totalBookings / stats.totalClients) * 100
        : 0;
    });

    // Convert to array and sort
    const companyStats: CompanyStats[] = Array.from(companyStatsMap.entries())
      .map(([name, data]) => data)
      .sort((a, b) => b.totalClients - a.totalClients);

    // Get top companies by different metrics
    const topCompaniesByClients = [...companyStats]
      .filter(c => c.totalClients > 0)
      .sort((a, b) => b.totalClients - a.totalClients)
      .slice(0, 10);

    const topCompaniesByBookings = [...companyStats]
      .filter(c => c.totalBookings > 0)
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 10);

    const topCompaniesByEfficiency = [...companyStats]
      .filter(c => c.totalClients > 0 && c.totalBookings > 0)
      .sort((a, b) => b.avgBookingsPerClient - a.avgBookingsPerClient)
      .slice(0, 10);

    // Prepare distribution data
    const clientDistribution = companyStats
      .filter(c => c.totalClients > 0)
      .map(c => ({
        name: c.name,
        value: c.totalClients,
      }));

    const bookingDistribution = companyStats
      .filter(c => c.totalBookings > 0)
      .map(c => ({
        name: c.name,
        value: c.totalBookings,
      }));

    // Calculate averages
    const totalCompanies = companyStats.length;
    const avgClientsPerCompany = totalCompanies > 0 ? totalClients / totalCompanies : 0;
    const avgBookingsPerCompany = totalCompanies > 0 ? totalBookings / totalCompanies : 0;
    const avgBookingsPerClient = totalClients > 0 ? totalBookings / totalClients : 0;

    return {
      companyStats,
      totalCompanies,
      totalClients,
      totalBookings,
      avgClientsPerCompany,
      avgBookingsPerCompany,
      avgBookingsPerClient,
      topCompaniesByClients,
      topCompaniesByBookings,
      topCompaniesByEfficiency,
      clientDistribution,
      bookingDistribution,
    };
  }, [data]);

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-gray-600 dark:text-gray-400">Loading Analysis...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <div className="text-gray-600 dark:text-gray-400 text-lg">No companies available for analysis</div>
          <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start adding companies to see insights</div>
        </div>
      </div>
    );
  }

  // Check if we have any data with clients or bookings
  const hasData = processedData.companyStats.some(c => c.totalClients > 0 || c.totalBookings > 0);

  if (!hasData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-gray-600 dark:text-gray-400 text-lg">No client or booking data available</div>
          <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">Companies exist but no client/booking statistics found</div>
          <div className="text-gray-400 dark:text-gray-600 text-xs mt-4">
            Expected fields: total_clients, total_bookings
          </div>
        </div>
      </div>
    );
  }

  const getDisplayData = () => {
    switch (timeRange) {
      case 'top10':
        return processedData.companyStats.slice(0, 10);
      case 'top25':
        return processedData.companyStats.slice(0, 25);
      default:
        return processedData.companyStats;
    }
  };

  const displayData = getDisplayData();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(processedData.totalCompanies)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(processedData.totalClients)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(processedData.totalBookings)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Bookings/Client</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatDecimal(processedData.avgBookingsPerClient, 1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Clients per Company</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatDecimal(processedData.avgClientsPerCompany, 1)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Bookings per Company</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatDecimal(processedData.avgBookingsPerCompany, 1)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Companies with Data</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(processedData.companyStats.filter(c => c.totalClients > 0 || c.totalBookings > 0).length)}
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 w-fit">
        {['all', 'top10', 'top25'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {range === 'all' ? 'All Companies' : range === 'top10' ? 'Top 10' : 'Top 25'}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Clients by Company
          </h3>
          <div className="h-80">
            {displayData.filter(c => c.totalClients > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData.filter(c => c.totalClients > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#6B7280" 
                    fontSize={10} 
                    tick={{ fill: '#6B7280' }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value) => formatNumber(safeNumber(value))}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                  <Bar dataKey="totalClients" name="Clients" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                    {displayData.filter(c => c.totalClients > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No client data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Bookings by Company
          </h3>
          <div className="h-80">
            {displayData.filter(c => c.totalBookings > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData.filter(c => c.totalBookings > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#6B7280" 
                    fontSize={10} 
                    tick={{ fill: '#6B7280' }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value) => formatNumber(safeNumber(value))}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                  <Bar dataKey="totalBookings" name="Bookings" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                    {displayData.filter(c => c.totalBookings > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No booking data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Combined View - Clients vs Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Clients vs Bookings Comparison
          </h3>
          <div className="h-80">
            {displayData.filter(c => c.totalClients > 0 || c.totalBookings > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayData.filter(c => c.totalClients > 0 || c.totalBookings > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tick={{ fill: '#6B7280' }} />
                  <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      const formatted = formatNumber(safeNumber(value));
                      const label = name === 'totalClients' ? 'Clients' : 
                                   name === 'totalBookings' ? 'Bookings' : 
                                   name === 'avgBookingsPerClient' ? 'Avg Bookings/Client' : name;
                      return [formatted, label];
                    }}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalClients" name="Clients" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="totalBookings" name="Bookings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avgBookingsPerClient" name="Avg Bookings/Client" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No data available for comparison</p>
              </div>
            )}
          </div>
        </div>

        {/* Efficiency Ranking */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Top Companies by Efficiency (Bookings per Client)
          </h3>
          <div className="h-80">
            {processedData.topCompaniesByEfficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.topCompaniesByEfficiency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#6B7280" 
                    fontSize={10} 
                    tick={{ fill: '#6B7280' }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value) => formatDecimal(safeNumber(value), 2)}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                  <Bar dataKey="avgBookingsPerClient" name="Avg Bookings/Client" fill="#EC4899" radius={[0, 4, 4, 0]}>
                    {processedData.topCompaniesByEfficiency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No efficiency data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Distribution Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Client Distribution
          </h3>
          <div className="h-80">
            {processedData.clientDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData.clientDistribution.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${formatPercentage((percent || 0) * 100)}`}
                  >
                    {processedData.clientDistribution.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatNumber(safeNumber(value))}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No client distribution data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Company Performance Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Company Name</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Clients</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Bookings</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Avg Bookings/Client</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Efficiency Score</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayData.map((company, index) => {
                const clientPercentage = processedData.totalClients > 0 
                  ? (safeNumber(company.totalClients) / processedData.totalClients) * 100 
                  : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                      {company.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 text-right font-medium">
                      {formatNumber(safeNumber(company.totalClients))}
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400 text-right font-medium">
                      {formatNumber(safeNumber(company.totalBookings))}
                    </td>
                    <td className="px-4 py-3 text-sm text-amber-600 dark:text-amber-400 text-right font-medium">
                      {formatDecimal(safeNumber(company.avgBookingsPerClient), 2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-rose-600 dark:text-rose-400 text-right font-medium">
                      {formatDecimal(safeNumber(company.clientEfficiency), 1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {formatPercentage(clientPercentage)}
                    </td>
                  </tr>
                );
              })}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No company data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalysis;