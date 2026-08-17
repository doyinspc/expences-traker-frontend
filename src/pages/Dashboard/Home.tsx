// src/pages/Dashboard/Home.tsx

import React, { useEffect, useState } from 'react';
import { Bell, ShoppingCart, Package, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import { useSelector } from 'react-redux';

// ============ METRICS COMPONENT ============
const EcommerceMetrics = () => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Pending Requisitions',
      value: '23',
      change: '+5',
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: 'Purchase Orders',
      value: '156',
      change: '+12',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Budget Used',
      value: '68%',
      change: '+8%',
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                  {metric.change}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${metric.bg}`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ USER PROFILE CARD ============
const UserProfileCard = () => {
  const { user } = useSelector((state: any) => state.auth);
  
  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Avatar with gradient border */}
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {getInitials(user?.displayName || 'User')}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-400 p-1 ring-2 ring-white">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold">{user?.displayName || 'Guest User'}</h3>
          <p className="text-sm text-white/80">{user?.email || 'guest@example.com'}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm">
              Admin
            </span>
          </div>
        </div>

        {/* Notification bell */}
        <button className="relative rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/30">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
      </div>
    </div>
  );
};

// ============ NOTIFICATION WIDGET ============
const NotificationWidget = () => {
  const notifications = [
    {
      id: 1,
      type: 'requisition',
      title: 'New Requisition Pending',
      description: 'Requisition #REQ-2024-001 requires your approval',
      time: '5 minutes ago',
      priority: 'high',
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      id: 2,
      type: 'budget',
      title: 'Budget Alert',
      description: 'Department budget at 85% utilization',
      time: '1 hour ago',
      priority: 'medium',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 3,
      type: 'order',
      title: 'Purchase Order Approved',
      description: 'PO #PO-2024-089 has been approved',
      time: '3 hours ago',
      priority: 'low',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      id: 4,
      type: 'requisition',
      title: 'Pending Requisitions',
      description: '5 requisitions waiting for your review',
      time: '5 hours ago',
      priority: 'high',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Notifications
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <div className={`rounded-lg p-2 ${notif.bg}`}>
                <Icon className={`h-4 w-4 ${notif.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {notif.title}
                  </p>
                  {notif.priority === 'high' && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notif.description}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {notif.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ PENDING REQUISITIONS WIDGET ============
const PendingRequisitionsWidget = () => {
  const requisitions = [
    {
      id: 'REQ-2024-001',
      department: 'IT Department',
      amount: '$12,500.00',
      date: '2024-01-15',
      status: 'pending',
      priority: 'high',
    },
    {
      id: 'REQ-2024-002',
      department: 'Marketing',
      amount: '$8,200.00',
      date: '2024-01-14',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 'REQ-2024-003',
      department: 'Operations',
      amount: '$15,750.00',
      date: '2024-01-13',
      status: 'pending',
      priority: 'low',
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pending Requisitions
        </h3>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          {requisitions.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        {requisitions.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {req.id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {req.department}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {req.amount}
                </span>
                <span className={`text-xs font-medium ${
                  req.priority === 'high' 
                    ? 'text-red-600 dark:text-red-400' 
                    : req.priority === 'medium'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)} Priority
                </span>
              </div>
            </div>
            <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700">
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ PURCHASE ORDERS WIDGET ============
const PurchaseOrdersWidget = () => {
  const orders = [
    {
      id: 'PO-2024-089',
      vendor: 'TechSupply Co.',
      amount: '$23,450.00',
      date: '2024-01-15',
      status: 'approved',
    },
    {
      id: 'PO-2024-088',
      vendor: 'OfficeDirect Inc.',
      amount: '$5,230.00',
      date: '2024-01-14',
      status: 'pending',
    },
    {
      id: 'PO-2024-087',
      vendor: 'Global Logistics',
      amount: '$18,900.00',
      date: '2024-01-13',
      status: 'processing',
    },
    {
      id: 'PO-2024-086',
      vendor: 'TechSupply Co.',
      amount: '$12,750.00',
      date: '2024-01-12',
      status: 'delivered',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
      pending: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
      processing: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      delivered: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Purchase Orders
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.id}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.vendor}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.amount}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {order.date}
                </span>
              </div>
            </div>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ BUDGET IMPORT WIDGET ============
const BudgetImportWidget = () => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Budget Import
        </h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          New
        </span>
      </div>

      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700'
        }`}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          // Handle file drop
          console.log('Files dropped:', e.dataTransfer.files);
        }}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Drop your budget file here
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Supports CSV, Excel, and PDF files
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            Choose File
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Import
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Maximum file size: 10MB
        </p>
      </div>

      {/* Recent imports */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Q4_Budget_2024.xlsx
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Imported 2 hours ago • 2.4 MB
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Success
          </span>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN DASHBOARD ============
export default function Home() {
  const { user } = useSelector((state: any) => state.auth);

  return (
    <>
      <PageMeta
        title="Dashboard | Procurement Management System"
        description="Comprehensive procurement dashboard with real-time metrics and notifications"
      />
      
      <div className="space-y-6">
        {/* User Profile Card - Full width */}
        <div className="col-span-12">
          <UserProfileCard />
        </div>

        {/* Metrics Grid */}
        <EcommerceMetrics />

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Left Column - Notifications & Requisitions */}
          <div className="col-span-12 space-y-6 lg:col-span-7">
            <NotificationWidget />
            <PendingRequisitionsWidget />
          </div>

          {/* Right Column - Purchase Orders & Budget Import */}
          <div className="col-span-12 space-y-6 lg:col-span-5">
            <PurchaseOrdersWidget />
            <BudgetImportWidget />
          </div>
        </div>
      </div>
    </>
  );
}