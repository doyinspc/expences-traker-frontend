// BudgetItemReport.jsx

import React, { useEffect, useState, useMemo } from 'react';
import useReduxApiData from '../../hooks/useTanstackQuery';
import { useSelector } from 'react-redux';
import { 
  Printer, 
  Download, 
  RefreshCw,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { getTitleRow } from '../../utils/functions/basci.jsx';

export default function BudgetItemReport(props) {
  const nav = useNavigate();
  const { user } = useSelector((state) => state.authReducer);
  const row = getTitleRow(1);
  
  if (Array.isArray(Object.keys(row)) && Object(row).hasOwnProperty('id')) {}
  else { nav(-1) }
  
  const { id: budget_id, budget_name, total_amount, currency, approved_by_name, approved_by_date } = row || {};
  const { id: user_id } = user || {};

  // State
  const [budgetItems, setBudgetItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('category');
  const [sortDirection, setSortDirection] = useState('asc');

  // API hooks
  const { data: expenseData, loadQuery: loadExpenses, isLoading: isLoadingExpenses } = useReduxApiData({
    table: "expenses",
    pth: "expense",
    queryType: 'getRowsWithChildrenStructured',
    mainParam: { grp: 5, is_active: 1 },
    narration: 'get all expenses categories and expenses items in a structured manner'
  });

  const { data, loadQuery, isLoading } = useReduxApiData({
    table: "budgetitems",
    pth: "budgetitems",
    queryType: 'gets',
    mainParam: { budget_id },
    narration: 'get all budgetitems already stored for this particular budget id'
  });

  const { data: usersData, loadQuery: loadUsers } = useReduxApiData({
    table: "users",
    pth: "users",
    queryType: 'gets',
    mainParam: { is_active: 1 },
    narration: 'get all users for approver names'
  });

  const onClose = () => nav(-1);

  // Get flat list of all categories
  const flatCategories = useMemo(() => {
    if (!expenseData) return [];
    
    const flatten = (items) => {
      let result = [];
      items.forEach(item => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          result = result.concat(flatten(item.children));
        }
      });
      return result;
    };
    
    if (expenseData[0] && expenseData[0].children !== undefined) {
      return flatten(expenseData);
    }
    return expenseData;
  }, [expenseData]);

  // Get user name by ID
  const getUserName = (userId) => {
    if (!usersData) return 'Unknown';
    const user = usersData.find(u => u.id === userId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown' : 'Unknown';
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = flatCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Get all budget items with amounts (sub-items)
  const getAllBudgetItemsWithAmounts = () => {
    return budgetItems.filter(item => item.item_id !== null);
  };

  // Calculate totals
  const totalAllocated = useMemo(() => {
    return budgetItems
      .filter(item => item.item_id !== null)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [budgetItems]);

  const totalApproved = useMemo(() => {
    return budgetItems
      .filter(item => item.item_id !== null && item.is_approved === 1)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [budgetItems]);

  const totalPending = useMemo(() => {
    return budgetItems
      .filter(item => item.item_id !== null && item.is_approved === 0)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [budgetItems]);

  const totalRejected = useMemo(() => {
    return budgetItems
      .filter(item => item.item_id !== null && item.is_approved === 2)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [budgetItems]);

  // Get filtered and sorted items
  const filteredItems = useMemo(() => {
    let items = getAllBudgetItemsWithAmounts();
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        (item.description || item.item_name || '').toLowerCase().includes(term) ||
        getCategoryName(item.category_id).toLowerCase().includes(term) ||
        (item.item_name || '').toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (filterStatus === 'pending') {
      items = items.filter(item => item.is_approved === 0);
    } else if (filterStatus === 'approved') {
      items = items.filter(item => item.is_approved === 1);
    } else if (filterStatus === 'rejected') {
      items = items.filter(item => item.is_approved === 2);
    }
    
    // Sort
    items.sort((a, b) => {
      let aVal, bVal;
      switch(sortField) {
        case 'category':
          aVal = getCategoryName(a.category_id);
          bVal = getCategoryName(b.category_id);
          break;
        case 'item':
          aVal = a.item_name || a.description || '';
          bVal = b.item_name || b.description || '';
          break;
        case 'amount':
          aVal = parseFloat(a.amount || 0);
          bVal = parseFloat(b.amount || 0);
          break;
        case 'status':
          aVal = a.is_approved;
          bVal = b.is_approved;
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return items;
  }, [budgetItems, searchTerm, filterStatus, sortField, sortDirection]);

  // Get status badge - Made slightly more compact
  const getStatusBadge = (status) => {
    const configs = {
      0: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', label: 'Pending', icon: Clock },
      1: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Approved', icon: CheckCircle },
      2: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', label: 'Rejected', icon: XCircle }
    };
    const config = configs[status];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${config.bg} ${config.text} border border-transparent whitespace-nowrap`}>
        <Icon size={12} className="stroke-[2.5]" />
        {config.label}
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Item Name', 'Description', 'Amount', 'Status', 'Approved By', 'Approved Date', 'Notes'];
    const rows = filteredItems.map(item => [
      `"${getCategoryName(item.category_id)}"`,
      `"${item.item_name || item.description || ''}"`,
      `"${item.description || ''}"`,
      parseFloat(item.amount || 0).toFixed(2),
      ['Pending', 'Approved', 'Rejected'][item.is_approved] || 'Unknown',
      `"${item.is_approved > 0 ? getUserName(item.approved_by_id) : '-'}"`,
      item.approved_date ? new Date(item.approved_date).toLocaleDateString() : '-',
      `"${item.notes || ''}"`
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_report_${(budget_name || 'budget').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadQuery();
    loadExpenses();
    loadUsers();
  }, [budget_id]);

  useEffect(() => {
    if (data) {
      setBudgetItems(data);
    }
  }, [data]);

  if (isLoadingExpenses || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <RefreshCw className="animate-spin text-blue-600 dark:text-blue-500" size={40} />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 print:space-y-4 bg-gray-50/50 dark:bg-gray-900 min-h-screen p-3 sm:p-4 lg:p-6">
      
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:shadow-none print:border-none print:bg-transparent print:p-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Budget Report
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{budget_name || 'Untitled Budget'}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            <span>Generated {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium flex items-center justify-center gap-1.5 transition-all focus:outline-none"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center justify-center gap-1.5 transition-all focus:outline-none"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => { loadQuery(); loadExpenses(); loadUsers(); }}
            className="p-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded transition-colors bg-white dark:bg-gray-800 focus:outline-none"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Summary Cards - Fixed layout for robust printing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-3">
        {/* Allocated */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm flex items-center justify-between print:border-gray-300 print:shadow-none print:break-inside-avoid">
          <div className="flex-1 overflow-hidden pr-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Allocated</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate print:whitespace-nowrap">
              {currency || '₦'}{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="shrink-0 flex items-center justify-center p-2 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 print:border print:border-gray-300 print:bg-transparent print:text-gray-700">
            <DollarSign size={18} className="stroke-[2]" />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm flex items-center justify-between print:border-gray-300 print:shadow-none print:break-inside-avoid">
          <div className="flex-1 overflow-hidden pr-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Approved</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate print:whitespace-nowrap">
              {currency || '₦'}{totalApproved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="shrink-0 flex items-center justify-center p-2 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 print:border print:border-gray-300 print:bg-transparent print:text-gray-700">
            <CheckCircle size={18} className="stroke-[2]" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm flex items-center justify-between print:border-gray-300 print:shadow-none print:break-inside-avoid">
          <div className="flex-1 overflow-hidden pr-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Pending</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate print:whitespace-nowrap">
              {currency || '₦'}{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="shrink-0 flex items-center justify-center p-2 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 print:border print:border-gray-300 print:bg-transparent print:text-gray-700">
            <Clock size={18} className="stroke-[2]" />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm flex items-center justify-between print:border-gray-300 print:shadow-none print:break-inside-avoid">
          <div className="flex-1 overflow-hidden pr-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Rejected</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate print:whitespace-nowrap">
              {currency || '₦'}{totalRejected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="shrink-0 flex items-center justify-center p-2 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 print:border print:border-gray-300 print:bg-transparent print:text-gray-700">
            <XCircle size={18} className="stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Main Table Area - Compact Layout */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden print:shadow-none print:border-none print:bg-transparent">
        
        {/* Filters (Hidden in print) */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center gap-3 print:hidden">
          <div className="relative flex-1 w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Filter size={14} className="text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-8 pr-6 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 print:static print:bg-transparent print:border-b-2 print:border-gray-300">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold tracking-wider w-[5%] whitespace-nowrap">#</th>
                <th scope="col" className="px-3 py-2 font-semibold tracking-wider w-[55%]">Item & Category</th>
                <th scope="col" className="px-3 py-2 font-semibold tracking-wider w-[15%] whitespace-nowrap text-right">Amount</th>
                <th scope="col" className="px-3 py-2 font-semibold tracking-wider w-[10%] whitespace-nowrap text-center">Status</th>
                <th scope="col" className="px-3 py-2 font-semibold tracking-wider w-[15%] whitespace-nowrap">Approver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm font-medium">No items found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors print:border-b print:border-gray-200 print:break-inside-avoid">
                    <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap align-top">{index + 1}</td>
                    
                    {/* Merged Category and Item Details */}
                    <td className="px-3 py-2 whitespace-normal break-words align-top">
                      <div className="mb-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 print:border-none print:bg-transparent print:p-0 print:text-gray-500">
                          {getCategoryName(item.category_id)}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
                        {item.item_name || item.description || 'Unnamed'}
                      </p>
                      {item.description && item.description !== item.item_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      )}
                    </td>
                    
                    <td className="px-3 py-2 text-right whitespace-nowrap align-top">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                        {currency || '₦'}{parseFloat(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    
                    <td className="px-3 py-2 whitespace-nowrap text-center align-top">
                      {getStatusBadge(item.is_approved)}
                    </td>
                    
                    <td className="px-3 py-2 whitespace-nowrap align-top">
                      <p className="text-gray-900 dark:text-white font-medium text-xs">
                        {item.is_approved > 0 ? getUserName(item.approved_by_id) : '-'}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.approved_date ? new Date(item.approved_date).toLocaleDateString() : '-'}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-900/50 sticky bottom-0 z-10 print:static print:bg-transparent print:border-t-2 print:border-gray-300">
                <tr>
                  <td colSpan="2" className="px-3 py-2 text-right font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px] whitespace-nowrap">
                    Filtered Total
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {currency || '₦'}{filteredItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td colSpan="2" className="px-3 py-2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center pt-2 print:hidden">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Showing {filteredItems.length} of {getAllBudgetItemsWithAmounts().length} items
        </p>
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded transition-colors font-medium focus:outline-none"
        >
          Close View
        </button>
      </div>

      {/* Styles for custom scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}