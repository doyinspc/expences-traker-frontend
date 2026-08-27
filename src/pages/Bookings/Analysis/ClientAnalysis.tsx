// ==================== ANALYSIS COMPONENT ====================

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
} from 'recharts';

interface AnalysisProps {
  data: any[];
  isLoading?: boolean;
}

interface ChartData {
  date: string;
  count: number;
}

interface CompanyData {
  name: string;
  value: number;
  totalBookings: number;
  activeBookings: number;
  lodgedBookings: number;
  vacatedBookings: number;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6', '#F472B6', '#8B5CF6'];

// ==================== HELPER FUNCTIONS ====================

// Safe number parser - converts any value to number or returns 0
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Safe integer parser
const safeInt = (value: any): number => {
  return Math.floor(safeNumber(value));
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

const getWeekNumber = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const formatMonth = (monthStr: string): string => {
  if (!monthStr) return '';
  try {
    const [year, month] = monthStr.split('-');
    if (!year || !month) return monthStr;
    return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  } catch {
    return monthStr;
  }
};

const Analysis: React.FC<AnalysisProps> = ({ data = [], isLoading = false }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // ==================== DATA PROCESSING ====================

  const processedData = useMemo(() => {
    // Defensive: ensure data is an array
    const safeData = Array.isArray(data) ? data : [];
    
    if (safeData.length === 0) {
      return {
        dailyData: [],
        weeklyData: [],
        monthlyData: [],
        companyData: [],
        totalClients: 0,
        newClientsToday: 0,
        newClientsThisWeek: 0,
        newClientsThisMonth: 0,
        mostActiveDay: '',
        topCompanies: [],
        growthRate: 0,
        totalBookings: 0,
        activeBookings: 0,
        lodgedBookings: 0,
        vacatedBookings: 0,
        bookingsByCompany: [],
      };
    }

    // Sort data by created_at
    const sortedData = [...safeData].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateA - dateB;
    });

    // Group by day
    const dailyMap = new Map<string, number>();
    const weeklyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    const companyMap = new Map<string, CompanyData>();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    let newClientsToday = 0;
    let newClientsThisWeek = 0;
    let newClientsThisMonth = 0;
    let totalBookings = 0;
    let activeBookings = 0;
    let lodgedBookings = 0;
    let vacatedBookings = 0;

    sortedData.forEach((client) => {
      // Defensive: skip if no created_at
      if (!client.created_at) return;

      try {
        const date = new Date(client.created_at);
        if (isNaN(date.getTime())) return;

        const dateStr = date.toISOString().split('T')[0];
        
        const weekNumber = getWeekNumber(date);
        const weekKey = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        // Count daily
        dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);

        // Count new clients
        if (dateStr === todayStr) newClientsToday++;
        if (date >= weekAgo) newClientsThisWeek++;
        if (date >= monthAgo) newClientsThisMonth++;

        // Safe booking counts - using safeNumber to prevent NaN
        const clientTotalBookings = safeNumber(client.total_bookings);
        const clientActiveBookings = safeNumber(client.active_bookings);
        const clientLodgedBookings = safeNumber(client.lodged_bookings);
        const clientVacatedBookings = safeNumber(client.vacated_bookings);

        totalBookings += clientTotalBookings;
        activeBookings += clientActiveBookings;
        lodgedBookings += clientLodgedBookings;
        vacatedBookings += clientVacatedBookings;

        // Count by company with booking stats
        const companyName = client.company_name || 'No Company';
        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, {
            name: companyName,
            value: 0,
            totalBookings: 0,
            activeBookings: 0,
            lodgedBookings: 0,
            vacatedBookings: 0,
          });
        }
        const companyData = companyMap.get(companyName)!;
        companyData.value += 1;
        companyData.totalBookings += clientTotalBookings;
        companyData.activeBookings += clientActiveBookings;
        companyData.lodgedBookings += clientLodgedBookings;
        companyData.vacatedBookings += clientVacatedBookings;
      } catch (error) {
        console.warn('Error processing client data:', error);
      }
    });

    // Convert to chart data
    const dailyData: ChartData[] = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const weeklyData: ChartData[] = Array.from(weeklyMap.entries())
      .map(([week, count]) => ({ date: week, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const monthlyData: ChartData[] = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ date: month, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Company data for charts
    const companyData: CompanyData[] = Array.from(companyMap.entries())
      .map(([name, data]) => data)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Find most active day
    let mostActiveDay = '';
    let maxCount = 0;
    dailyMap.forEach((count, date) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = date;
      }
    });

    // Calculate growth rate
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentClients = safeData.filter(client => {
      if (!client.created_at) return false;
      try {
        const date = new Date(client.created_at);
        if (isNaN(date.getTime())) return false;
        return date >= thirtyDaysAgo && date <= now;
      } catch {
        return false;
      }
    });

    const previousClients = safeData.filter(client => {
      if (!client.created_at) return false;
      try {
        const date = new Date(client.created_at);
        if (isNaN(date.getTime())) return false;
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      } catch {
        return false;
      }
    });

    const growthRate = previousClients.length > 0 
      ? ((recentClients.length - previousClients.length) / previousClients.length) * 100
      : 0;

    // Defensive: ensure companyData is properly formatted with numbers
    const safeCompanyData = companyData.map(item => ({
      ...item,
      value: safeNumber(item.value),
      totalBookings: safeNumber(item.totalBookings),
      activeBookings: safeNumber(item.activeBookings),
      lodgedBookings: safeNumber(item.lodgedBookings),
      vacatedBookings: safeNumber(item.vacatedBookings),
    }));

    return {
      dailyData,
      weeklyData,
      monthlyData,
      companyData: safeCompanyData,
      totalClients: safeData.length,
      newClientsToday,
      newClientsThisWeek,
      newClientsThisMonth,
      mostActiveDay: mostActiveDay ? formatDate(mostActiveDay) : 'N/A',
      topCompanies: safeCompanyData.slice(0, 5),
      growthRate,
      totalBookings,
      activeBookings,
      lodgedBookings,
      vacatedBookings,
      bookingsByCompany: safeCompanyData,
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
          <div className="text-6xl mb-4">📊</div>
          <div className="text-gray-600 dark:text-gray-400 text-lg">No data available for analysis</div>
          <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start adding clients to see insights</div>
        </div>
      </div>
    );
  }

  const getChartData = () => {
    switch (timeRange) {
      case 'week':
        return processedData.dailyData.slice(-7);
      case 'month':
        return processedData.dailyData.slice(-30);
      case 'year':
        return processedData.monthlyData;
      default:
        return processedData.dailyData.slice(-30);
    }
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* Stats Cards - Updated with Booking Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(processedData.totalClients)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className={`font-medium ${processedData.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {processedData.growthRate >= 0 ? '↑' : '↓'} {formatDecimal(Math.abs(processedData.growthRate))}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last 30 days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(processedData.newClientsToday)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{formatNumber(processedData.newClientsThisWeek)} this week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(processedData.newClientsThisMonth)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">new clients added</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Peak Day</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{processedData.mostActiveDay}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">most registrations</span>
          </div>
        </div>
      </div>

      {/* Booking Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(processedData.totalBookings)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Bookings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(processedData.activeBookings)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lodged</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatNumber(processedData.lodgedBookings)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vacated</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{formatNumber(processedData.vacatedBookings)}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 w-fit">
        {['week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily/Weekly/Monthly Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Daily' : 'Monthly'} Client Registrations
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={timeRange === 'year' ? formatMonth : formatDate}
                  stroke="#6B7280"
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  labelFormatter={(label) => timeRange === 'year' ? formatMonth(label) : formatDate(label)}
                  formatter={(value) => formatNumber(safeNumber(value))}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="url(#colorCount)" 
                  name="Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Clients by Company
          </h3>
          <div className="h-80">
            {processedData.companyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData.companyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${formatPercentage((percent || 0) * 100)}`}
                  >
                    {processedData.companyData.map((entry, index) => (
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
                <p className="text-gray-500 dark:text-gray-400">No company data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Companies Bar Chart with Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Top Companies by Client Count & Bookings
          </h3>
          <div className="h-80">
            {processedData.topCompanies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.topCompanies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <YAxis stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    formatter={(value) => formatNumber(safeNumber(value))}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Clients" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalBookings" name="Total Bookings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No company data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Booking Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: safeNumber(processedData.activeBookings) },
                    { name: 'Lodged', value: safeNumber(processedData.lodgedBookings) },
                    { name: 'Vacated', value: safeNumber(processedData.vacatedBookings) },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${formatPercentage((percent || 0) * 100)}`}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#6B7280" />
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
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Client Population Distribution
          </h3>
          <div className="h-80">
            {processedData.companyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={processedData.companyData.slice(0, 6)}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" stroke="#6B7280" fontSize={10} />
                  <PolarRadiusAxis stroke="#6B7280" fontSize={10} />
                  <Radar
                    name="Clients"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
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
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No company data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Table - Updated with Booking Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Company Summary with Booking Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Company Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Company ID</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Clients</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Total Bookings</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Lodged</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Vacated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processedData.companyData.map((company, index) => {
                const percentage = processedData.totalClients > 0 
                  ? (safeNumber(company.value) / processedData.totalClients) * 100 
                  : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {company.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {(() => {
                        const found = data.find(d => d.company_name === company.name);
                        return found?.company_id || '-';
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right font-medium">
                      {formatNumber(safeNumber(company.value))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right font-medium">
                      {formatNumber(safeNumber(company.totalBookings))}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 text-right font-medium">
                      {formatNumber(safeNumber(company.activeBookings))}
                    </td>
                    <td className="px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400 text-right font-medium">
                      {formatNumber(safeNumber(company.lodgedBookings))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {formatNumber(safeNumber(company.vacatedBookings))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {formatPercentage(percentage)}
                    </td>
                  </tr>
                );
              })}
              {processedData.companyData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 dark:text-gray-400 py-8">
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

export default Analysis;