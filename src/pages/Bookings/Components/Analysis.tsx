// src/pages/Procurement/Analysis.tsx

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import ErrorBoundary from '../../../utils/functions/ErrorBoundary';

// Lazy load recharts components for better performance
const BarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const Bar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const Legend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const PieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
const Pie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })));
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));
const LineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
const Line = lazy(() => import('recharts').then(mod => ({ default: mod.Line })));
const AreaChart = lazy(() => import('recharts').then(mod => ({ default: mod.AreaChart })));
const Area = lazy(() => import('recharts').then(mod => ({ default: mod.Area })));
const ComposedChart = lazy(() => import('recharts').then(mod => ({ default: mod.ComposedChart })));

// ==================== TYPES ====================

interface Booking {
  id: number;
  room_id: number;
  room_name: string;
  room_parent_id: number;
  date: string;
  client_id: number;
  client_name: string;
  client_phone: string;
  client_email: string;
  company_id?: string;
  company_name?: string;
  is_booked: 0 | 1;
  is_lodged: 0 | 1;
  is_vacated: 0 | 1;
}

interface AnalysisDashboardProps {
  data?: Booking[];
  analysisData?: Booking[];
}

// ==================== COLORS ====================

const COLORS = {
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  gray: '#6B7280',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  red: '#EF4444',
  orange: '#F97316',
  teal: '#14B8A6',
};

// ==================== LOADING & ERROR ====================

const ChartLoader = () => (
  <div className="flex items-center justify-center h-[400px]">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="mt-4 text-gray-600 dark:text-gray-400">Loading chart...</div>
    </div>
  </div>
);

const ChartErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex items-center justify-center h-[400px] bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
    <div className="text-center p-4">
      <div className="text-4xl mb-2">📊</div>
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Chart Error</h3>
      <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error?.message || 'Failed to load chart'}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
      >
        Retry
      </button>
    </div>
  </div>
);

// ==================== COMPONENT ====================

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  data = [],
  analysisData = [],
}) => {
  // Use the data prop
  const bookings = useMemo(() => {
    try {
      return Array.isArray(data) && data.length > 0 ? data : [];
    } catch {
      return [];
    }
  }, [data]);

  // ==================== STATE ====================
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [activeChart, setActiveChart] = useState<'occupancy' | 'status' | 'rooms' | 'trend' | 'usage'>('occupancy');
  const [startDate, setStartDate] = useState<string>(() => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  });
  const [endDate, setEndDate] = useState<string>(() => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch {
      return '';
    }
  });

  // ==================== FILTERED DATA ====================

  const filteredBookings = useMemo(() => {
    try {
      if (!bookings || bookings.length === 0) return [];
      return bookings.filter((booking) => {
        try {
          const bookingDate = booking?.date || '';
          return bookingDate >= startDate && bookingDate <= endDate;
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }, [bookings, startDate, endDate]);

  // ==================== OCCUPANCY DATA ====================

  // Daily occupancy data
  const dailyOccupancy = useMemo(() => {
    try {
      const dataMap = new Map<string, { date: string; booked: number; lodged: number; vacated: number; total: number; usage_percentage: number }>();
      
      filteredBookings.forEach((booking) => {
        try {
          const date = booking?.date || '';
          if (!date) return;
          
          if (!dataMap.has(date)) {
            dataMap.set(date, { date, booked: 0, lodged: 0, vacated: 0, total: 0, usage_percentage: 0 });
          }
          const entry = dataMap.get(date)!;
          entry.total++;
          if (booking?.is_booked === 1) entry.booked++;
          if (booking?.is_lodged === 1) entry.lodged++;
          if (booking?.is_vacated === 1) entry.vacated++;
        } catch {
          // Skip
        }
      });

      // Calculate usage percentage (assuming max possible bookings per day is 100)
      const maxDaily = 100;
      return Array.from(dataMap.values())
        .map(entry => ({
          ...entry,
          usage_percentage: Math.min(Math.round((entry.total / maxDaily) * 100), 100)
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // Weekly occupancy data
  const weeklyOccupancy = useMemo(() => {
    try {
      const dataMap = new Map<string, { week: string; booked: number; lodged: number; vacated: number; total: number; usage_percentage: number }>();
      
      filteredBookings.forEach((booking) => {
        try {
          const date = booking?.date || '';
          if (!date) return;
          
          const d = new Date(date);
          const week = `${d.getFullYear()}-W${String(Math.ceil((d.getDate() + 6 - d.getDay()) / 7)).padStart(2, '0')}`;
          
          if (!dataMap.has(week)) {
            dataMap.set(week, { week, booked: 0, lodged: 0, vacated: 0, total: 0, usage_percentage: 0 });
          }
          const entry = dataMap.get(week)!;
          entry.total++;
          if (booking?.is_booked === 1) entry.booked++;
          if (booking?.is_lodged === 1) entry.lodged++;
          if (booking?.is_vacated === 1) entry.vacated++;
        } catch {
          // Skip
        }
      });

      const maxWeekly = 700;
      return Array.from(dataMap.values())
        .map(entry => ({
          ...entry,
          usage_percentage: Math.min(Math.round((entry.total / maxWeekly) * 100), 100)
        }))
        .sort((a, b) => a.week.localeCompare(b.week));
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // Monthly occupancy data
  const monthlyOccupancy = useMemo(() => {
    try {
      const dataMap = new Map<string, { month: string; booked: number; lodged: number; vacated: number; total: number; usage_percentage: number }>();
      
      filteredBookings.forEach((booking) => {
        try {
          const date = booking?.date || '';
          if (!date) return;
          
          const month = date.substring(0, 7);
          
          if (!dataMap.has(month)) {
            dataMap.set(month, { month, booked: 0, lodged: 0, vacated: 0, total: 0, usage_percentage: 0 });
          }
          const entry = dataMap.get(month)!;
          entry.total++;
          if (booking?.is_booked === 1) entry.booked++;
          if (booking?.is_lodged === 1) entry.lodged++;
          if (booking?.is_vacated === 1) entry.vacated++;
        } catch {
          // Skip
        }
      });

      const maxMonthly = 3000;
      return Array.from(dataMap.values())
        .map(entry => ({
          ...entry,
          usage_percentage: Math.min(Math.round((entry.total / maxMonthly) * 100), 100)
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // Yearly occupancy data
  const yearlyOccupancy = useMemo(() => {
    try {
      const dataMap = new Map<string, { year: string; booked: number; lodged: number; vacated: number; total: number; usage_percentage: number }>();
      
      filteredBookings.forEach((booking) => {
        try {
          const date = booking?.date || '';
          if (!date) return;
          
          const year = date.substring(0, 4);
          
          if (!dataMap.has(year)) {
            dataMap.set(year, { year, booked: 0, lodged: 0, vacated: 0, total: 0, usage_percentage: 0 });
          }
          const entry = dataMap.get(year)!;
          entry.total++;
          if (booking?.is_booked === 1) entry.booked++;
          if (booking?.is_lodged === 1) entry.lodged++;
          if (booking?.is_vacated === 1) entry.vacated++;
        } catch {
          // Skip
        }
      });

      const maxYearly = 36500;
      return Array.from(dataMap.values())
        .map(entry => ({
          ...entry,
          usage_percentage: Math.min(Math.round((entry.total / maxYearly) * 100), 100)
        }))
        .sort((a, b) => a.year.localeCompare(b.year));
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // ==================== ROOM USAGE ANALYSIS ====================

  const roomUsageAnalysis = useMemo(() => {
    try {
      const roomMap = new Map<string, { 
        room_name: string; 
        total: number; 
        booked: number; 
        lodged: number; 
        vacated: number;
        daily_avg: number;
        monthly_avg: number;
        yearly_avg: number;
        usage_percentage: number;
        peak_day: string;
        peak_month: string;
      }>();
      
      // Get date range for averages
      const dates = filteredBookings.map(b => b?.date || '').filter(d => d);
      const uniqueDates = new Set(dates);
      const uniqueMonths = new Set(dates.map(d => d.substring(0, 7)));
      const uniqueYears = new Set(dates.map(d => d.substring(0, 4)));
      
      const dayCount = uniqueDates.size || 1;
      const monthCount = uniqueMonths.size || 1;
      const yearCount = uniqueYears.size || 1;
      
      filteredBookings.forEach((booking) => {
        try {
          const roomName = booking?.room_name || 'Unknown';
          const date = booking?.date || '';
          
          if (!roomMap.has(roomName)) {
            roomMap.set(roomName, { 
              room_name: roomName, 
              total: 0, 
              booked: 0, 
              lodged: 0, 
              vacated: 0,
              daily_avg: 0,
              monthly_avg: 0,
              yearly_avg: 0,
              usage_percentage: 0,
              peak_day: '',
              peak_month: ''
            });
          }
          const entry = roomMap.get(roomName)!;
          entry.total++;
          if (booking?.is_booked === 1) entry.booked++;
          if (booking?.is_lodged === 1) entry.lodged++;
          if (booking?.is_vacated === 1) entry.vacated++;
        } catch {
          // Skip
        }
      });

      // Calculate averages and percentages
      return Array.from(roomMap.values())
        .map(room => ({
          ...room,
          daily_avg: Math.round((room.total / dayCount) * 10) / 10,
          monthly_avg: Math.round((room.total / monthCount) * 10) / 10,
          yearly_avg: Math.round((room.total / yearCount) * 10) / 10,
          usage_percentage: room.total > 0 ? Math.min(Math.round((room.total / Math.max(...Array.from(roomMap.values()).map(r => r.total))) * 100), 100) : 0
        }))
        .sort((a, b) => b.total - a.total);
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // ==================== ROOM HEAT MAP DATA ====================

  const roomHeatMap = useMemo(() => {
    try {
      const roomMap = new Map<string, { 
        room_name: string; 
        total: number; 
        booked: number; 
        lodged: number; 
        vacated: number;
        occupancy_rate: number;
      }>();
      
      filteredBookings.forEach((booking) => {
        try {
          const roomName = booking?.room_name || 'Unknown';
          if (!roomMap.has(roomName)) {
            roomMap.set(roomName, { 
              room_name: roomName, 
              total: 0, 
              booked: 0, 
              lodged: 0, 
              vacated: 0,
              occupancy_rate: 0
            });
          }
          const entry = roomMap.get(roomName)!;
          entry.total++;
          if (booking?.is_booked === 1) entry.booked++;
          if (booking?.is_lodged === 1) entry.lodged++;
          if (booking?.is_vacated === 1) entry.vacated++;
        } catch {
          // Skip
        }
      });

      return Array.from(roomMap.values())
        .map(room => ({
          ...room,
          occupancy_rate: room.total > 0 ? Math.round((room.booked / room.total) * 100) : 0
        }))
        .sort((a, b) => b.total - a.total);
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // ==================== STATUS DISTRIBUTION ====================

  const statusDistribution = useMemo(() => {
    try {
      const total = filteredBookings.length;
      const booked = filteredBookings.filter(b => b?.is_booked === 1).length;
      const lodged = filteredBookings.filter(b => b?.is_lodged === 1).length;
      const vacated = filteredBookings.filter(b => b?.is_vacated === 1).length;
      const notBooked = total - booked;
      
      return [
        { name: 'Booked', value: booked, color: COLORS.blue },
        { name: 'Lodged', value: lodged, color: COLORS.yellow },
        { name: 'Vacated', value: vacated, color: COLORS.gray },
        { name: 'Not Booked', value: notBooked, color: COLORS.green },
      ].filter(item => item.value > 0);
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // ==================== TREND DATA ====================

  const trendData = useMemo(() => {
    try {
      if (dailyOccupancy.length === 0) return [];
      
      return dailyOccupancy.map((day, index) => {
        let rollingAvg = 0;
        if (index >= 6) {
          const sum = dailyOccupancy.slice(index - 6, index + 1).reduce((acc, d) => acc + d.total, 0);
          rollingAvg = Math.round(sum / 7);
        }
        return {
          ...day,
          rolling_avg: rollingAvg,
        };
      });
    } catch {
      return [];
    }
  }, [dailyOccupancy]);

  // ==================== CLIENT BOOKING STATS ====================

  const topClients = useMemo(() => {
    try {
      const clientMap = new Map<string, { name: string; bookings: number; rooms: Set<string> }>();
      
      filteredBookings.forEach((booking) => {
        try {
          const clientName = booking?.client_name || 'Unknown';
          const roomName = booking?.room_name || 'Unknown';
          
          if (!clientMap.has(clientName)) {
            clientMap.set(clientName, { name: clientName, bookings: 0, rooms: new Set() });
          }
          const entry = clientMap.get(clientName)!;
          entry.bookings++;
          entry.rooms.add(roomName);
        } catch {
          // Skip
        }
      });

      return Array.from(clientMap.values())
        .map(client => ({
          ...client,
          rooms_count: client.rooms.size
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 10);
    } catch {
      return [];
    }
  }, [filteredBookings]);

  // ==================== STATISTICS SUMMARY ====================

  const summaryStats = useMemo(() => {
    try {
      const total = filteredBookings.length;
      const booked = filteredBookings.filter(b => b?.is_booked === 1).length;
      const lodged = filteredBookings.filter(b => b?.is_lodged === 1).length;
      const vacated = filteredBookings.filter(b => b?.is_vacated === 1).length;
      const uniqueRooms = new Set(filteredBookings.map(b => b?.room_name)).size;
      const uniqueClients = new Set(filteredBookings.map(b => b?.client_name)).size;
      
      // Calculate usage percentage based on total possible bookings
      const dates = filteredBookings.map(b => b?.date || '').filter(d => d);
      const uniqueDays = new Set(dates).size;
      const maxPossible = uniqueDays * uniqueRooms; // Max possible bookings if all rooms booked every day
      const usagePercentage = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
      
      return {
        total,
        booked,
        lodged,
        vacated,
        uniqueRooms,
        uniqueClients,
        occupancyRate: total > 0 ? ((booked / total) * 100).toFixed(1) : '0',
        avgDaily: uniqueDays > 0 ? Math.round(total / uniqueDays) : 0,
        usagePercentage: usagePercentage,
      };
    } catch {
      return { total: 0, booked: 0, lodged: 0, vacated: 0, uniqueRooms: 0, uniqueClients: 0, occupancyRate: '0', avgDaily: 0, usagePercentage: 0 };
    }
  }, [filteredBookings]);

  // ==================== GET DISPLAY DATA ====================

  const getDisplayData = () => {
    switch (viewType) {
      case 'daily': return dailyOccupancy;
      case 'weekly': return weeklyOccupancy;
      case 'monthly': return monthlyOccupancy;
      case 'yearly': return yearlyOccupancy;
      default: return dailyOccupancy;
    }
  };

  const displayData = getDisplayData();
  const dataKey = viewType === 'daily' ? 'date' : viewType === 'weekly' ? 'week' : viewType === 'monthly' ? 'month' : 'year';

  // ==================== CHART RENDERER ====================

  const renderChart = () => {
    try {
      if (displayData.length === 0) {
        return (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            No data available for the selected period
          </div>
        );
      }

      switch (activeChart) {
        case 'occupancy':
          return (
            <Suspense fallback={<ChartLoader />}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey={dataKey} stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="booked" stackId="a" fill={COLORS.blue} name="Booked" />
                  <Bar dataKey="lodged" stackId="a" fill={COLORS.yellow} name="Lodged" />
                  <Bar dataKey="vacated" stackId="a" fill={COLORS.gray} name="Vacated" />
                  <Line type="monotone" dataKey="total" stroke={COLORS.purple} name="Total" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Suspense>
          );

        case 'status':
          return (
            <Suspense fallback={<ChartLoader />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Suspense>
          );

        case 'rooms':
          return (
            <Suspense fallback={<ChartLoader />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomHeatMap.slice(0, 15)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis type="category" dataKey="room_name" stroke="#6B7280" fontSize={11} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="total" fill={COLORS.blue} name="Total Bookings" />
                  <Bar dataKey="booked" fill={COLORS.green} name="Booked" />
                  <Bar dataKey="lodged" fill={COLORS.yellow} name="Lodged" />
                </BarChart>
              </ResponsiveContainer>
            </Suspense>
          );

        case 'trend':
          return (
            <Suspense fallback={<ChartLoader />}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="total" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.3} name="Daily Bookings" />
                  <Line type="monotone" dataKey="rolling_avg" stroke={COLORS.purple} name="7-Day Avg" strokeWidth={2} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </Suspense>
          );

        case 'usage':
          return (
            <Suspense fallback={<ChartLoader />}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey={dataKey} stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="usage_percentage" fill={COLORS.blue} name="Usage %" />
                  <Line type="monotone" dataKey="usage_percentage" stroke={COLORS.purple} name="Trend" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Suspense>
          );

        default:
          return null;
      }
    } catch {
      return (
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          Unable to render chart
        </div>
      );
    }
  };

  // ==================== CUSTOM TOOLTIP ====================

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      try {
        return (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {entry.value}
                {entry.dataKey === 'usage_percentage' && '%'}
              </p>
            ))}
          </div>
        );
      } catch {
        return null;
      }
    }
    return null;
  };

  // ==================== RENDER ====================

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Data Available</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">There are no bookings to analyze.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-blue-500">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{summaryStats.total}</div>
          <div className="text-[10px] text-gray-400">Bookings</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-blue-600">
          <div className="text-xs text-gray-500 dark:text-gray-400">Booked</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{summaryStats.booked}</div>
          <div className="text-[10px] text-gray-400">{summaryStats.occupancyRate}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-yellow-500">
          <div className="text-xs text-gray-500 dark:text-gray-400">Lodged</div>
          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{summaryStats.lodged}</div>
          <div className="text-[10px] text-gray-400">Checked In</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-gray-400">
          <div className="text-xs text-gray-500 dark:text-gray-400">Vacated</div>
          <div className="text-xl font-bold text-gray-600 dark:text-gray-400">{summaryStats.vacated}</div>
          <div className="text-[10px] text-gray-400">Checked Out</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-purple-500">
          <div className="text-xs text-gray-500 dark:text-gray-400">Rooms</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{summaryStats.uniqueRooms}</div>
          <div className="text-[10px] text-gray-400">Used</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-green-500">
          <div className="text-xs text-gray-500 dark:text-gray-400">Clients</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{summaryStats.uniqueClients}</div>
          <div className="text-[10px] text-gray-400">Unique</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-orange-500">
          <div className="text-xs text-gray-500 dark:text-gray-400">Daily Avg</div>
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{summaryStats.avgDaily}</div>
          <div className="text-[10px] text-gray-400">Per Day</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-center border-l-4 border-red-500">
          <div className="text-xs text-gray-500 dark:text-gray-400">Usage</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">{summaryStats.usagePercentage}%</div>
          <div className="text-[10px] text-gray-400">Overall</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Date:</label>
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[130px]"
            />
            <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[130px]"
            />
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex gap-1">
            <button
              onClick={() => setViewType('daily')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewType === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewType('weekly')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewType === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewType === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewType('yearly')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewType === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Yearly
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex gap-1">
            <button
              onClick={() => setActiveChart('occupancy')}
              className={`px-2 py-1 text-xs rounded transition-colors ${activeChart === 'occupancy' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Occupancy
            </button>
            <button
              onClick={() => setActiveChart('status')}
              className={`px-2 py-1 text-xs rounded transition-colors ${activeChart === 'status' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveChart('rooms')}
              className={`px-2 py-1 text-xs rounded transition-colors ${activeChart === 'rooms' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Rooms
            </button>
            <button
              onClick={() => setActiveChart('trend')}
              className={`px-2 py-1 text-xs rounded transition-colors ${activeChart === 'trend' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Trend
            </button>
            <button
              onClick={() => setActiveChart('usage')}
              className={`px-2 py-1 text-xs rounded transition-colors ${activeChart === 'usage' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Usage %
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {filteredBookings.length} bookings
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="h-[400px]">
          <ErrorBoundary
            FallbackComponent={ChartErrorFallback}
            onReset={() => setActiveChart('occupancy')}
            resetKeys={[activeChart]}
          >
            {renderChart()}
          </ErrorBoundary>
        </div>
      </div>

      {/* Room Usage Analysis Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 Room Usage Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Room</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Daily Avg</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Monthly Avg</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Yearly Avg</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Usage %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {roomUsageAnalysis.slice(0, 20).map((room) => (
                <tr key={room.room_name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{room.room_name}</td>
                  <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400">{room.total}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{room.daily_avg}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{room.monthly_avg}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{room.yearly_avg}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${room.usage_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[35px]">
                        {room.usage_percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {roomUsageAnalysis.length > 20 && (
          <div className="text-center text-xs text-gray-400 mt-2">
            Showing top 20 of {roomUsageAnalysis.length} rooms
          </div>
        )}
      </div>

      {/* Room Heat Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🔥 Room Heat Map - Usage Frequency</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {roomHeatMap.slice(0, 18).map((room) => (
            <div
              key={room.room_name}
              className="p-2 rounded-lg text-center border transition-all hover:scale-105"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${room.occupancy_rate / 100})`,
                borderColor: room.occupancy_rate > 50 ? '#3B82F6' : '#E5E7EB'
              }}
            >
              <div className="text-xs font-medium truncate text-gray-800 dark:text-gray-200">{room.room_name}</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{room.total}</div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">{room.occupancy_rate}%</div>
            </div>
          ))}
        </div>
        {roomHeatMap.length > 18 && (
          <div className="text-center text-xs text-gray-400 mt-2">
            Showing top 18 of {roomHeatMap.length} rooms
          </div>
        )}
      </div>

      {/* Top Clients */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">👤 Top Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Client Name</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Bookings</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Rooms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topClients.slice(0, 10).map((client, index) => (
                <tr key={client.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{index + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{client.name}</td>
                  <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400">{client.bookings}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{client.rooms_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;