// BudgetItemApproval.jsx

import React, { useEffect, useState, useMemo } from 'react';
import useReduxApiData from '../../hooks/useTanstackQuery';
import { useSelector } from 'react-redux';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw,
  Clock,
  Filter,
  Search,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function BudgetItemApproval(props) {
  const { user } = useSelector((state) => state.authReducer);
  const { row, onClose } = props || {};
  const { id: budget_id, budget_name, total_amount, currency } = row || {};
  const { id: user_id } = user || {};

  // State
  const [budgetItems, setBudgetItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);
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

  const { data, loadQuery, loadUpdate, isLoading } = useReduxApiData({
    table: "budgetitems",
    pth: "budgetitems",
    queryType: 'getBudgetItems',
    mainParam: { budget_id },
    narration: 'get all budgetitems already stored for this particular budget id'
  });

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

  // Handle approve item
  const handleApprove = (item) => {
    if (!window.confirm(`Approve "${item.item_name || item.description}"?`)) return;
    
    setProcessingId(item.id);
    
    const updatedItem = {
      ...item,
      is_approved: 1,
      approved_by_id: user_id,
      approved_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      notes: approvalNotes || item.notes || 'Approved',
      updated_by_id: user_id
    };
    
    loadUpdate(updatedItem);
    setBudgetItems(prev => prev.map(i => 
      i.id === item.id ? { ...updatedItem } : i
    ));
    
    setProcessingId(null);
    setApprovalNotes('');
    if (showItemDetail) {
      setShowItemDetail(false);
      setSelectedItem(null);
    }
  };

  // Handle reject item
  const handleReject = (item) => {
    if (!approvalNotes && !item.notes) {
      const notes = prompt('Please provide a reason for rejection:');
      if (notes === null) return;
      if (!notes.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      setApprovalNotes(notes);
    }
    
    if (!window.confirm(`Reject "${item.item_name || item.description}"?`)) return;
    
    setProcessingId(item.id);
    
    const updatedItem = {
      ...item,
      is_approved: 2,
      approved_by_id: user_id,
      approved_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      notes: approvalNotes || item.notes || 'Rejected',
      updated_by_id: user_id
    };
    
    loadUpdate(updatedItem);
    setBudgetItems(prev => prev.map(i => 
      i.id === item.id ? { ...updatedItem } : i
    ));
    
    setProcessingId(null);
    setApprovalNotes('');
    if (showItemDetail) {
      setShowItemDetail(false);
      setSelectedItem(null);
    }
  };

  // Handle view item details
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowItemDetail(true);
    setApprovalNotes(item.notes || '');
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Load data
  useEffect(() => {
    loadQuery();
    loadExpenses();
  }, [budget_id]);

  // Update budget items when data loads
  useEffect(() => {
    if (data) {
      setBudgetItems(data);
    }
  }, [data]);

  // Status color helper
  const getStatusColor = (status) => {
    switch(status) {
      case 0: return 'yellow';
      case 1: return 'green';
      case 2: return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      0: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      1: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      2: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    };
    const icons = {
      0: <Clock size={12} />,
      1: <CheckCircle size={12} />,
      2: <XCircle size={12} />
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {icons[status]}
        {getStatusLabel(status)}
      </span>
    );
  };

  // Loading state
  if (isLoadingExpenses || isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budget Item Approval
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {budget_name || 'Untitled Budget'}
          </p>
        </div>
        
        <div className="flex items-center gap-6 flex-wrap">
          {/* Summary Stats */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {currency || '₦'} {totalAllocated.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {currency || '₦'} {totalApproved.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                {currency || '₦'} {totalPending.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {currency || '₦'} {totalRejected.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              loadQuery();
              loadExpenses();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by category, item name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500 dark:text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            <option value="all">All ({getAllBudgetItemsWithAmounts().length})</option>
            <option value="pending">Pending ({budgetItems.filter(item => item.item_id !== null && item.is_approved === 0).length})</option>
            <option value="approved">Approved ({budgetItems.filter(item => item.item_id !== null && item.is_approved === 1).length})</option>
            <option value="rejected">Rejected ({budgetItems.filter(item => item.item_id !== null && item.is_approved === 2).length})</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredItems.length} items
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  Category
                  {getSortIcon('category')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort('item')}
              >
                <div className="flex items-center gap-1">
                  Item Name
                  {getSortIcon('item')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  Amount
                  {getSortIcon('amount')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center justify-center gap-1">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No items found</p>
                  <p className="text-sm mt-1">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'No budget items with allocated amounts'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const isPending = item.is_approved === 0;
                const isApproved = item.is_approved === 1;
                const isRejected = item.is_approved === 2;
                const isProcessing = processingId === item.id;
                
                return (
                  <tr 
                    key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                      ${isPending ? 'border-l-4 border-yellow-400' : ''}
                      ${isApproved ? 'border-l-4 border-green-400' : ''}
                      ${isRejected ? 'border-l-4 border-red-400' : ''}
                    `}
                  >
                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {getCategoryName(item.category_id)}
                      </span>
                    </td>
                    
                    {/* Item Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.item_name || item.description || 'Unnamed'}
                      </span>
                    </td>
                    
                    {/* Description */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.description || '-'}
                      </span>
                    </td>
                    
                    {/* Amount */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currency || '₦'} {parseFloat(item.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {getStatusBadge(item.is_approved)}
                      {item.notes && isRejected && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[100px]">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewItem(item)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 
                                     dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                     rounded transition-colors"
                          title="View details"
                          disabled={isProcessing}
                        >
                          <Eye size={16} />
                        </button>
                        
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={isProcessing}
                              className={`px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded 
                                         text-xs font-medium flex items-center gap-1 transition-colors
                                         ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              disabled={isProcessing}
                              className={`px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded 
                                         text-xs font-medium flex items-center gap-1 transition-colors
                                         ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {isApproved && (
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 
                                         text-green-700 dark:text-green-300 rounded font-medium">
                            ✓ Approved
                          </span>
                        )}
                        
                        {isRejected && (
                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 
                                         text-red-700 dark:text-red-300 rounded font-medium">
                            ✗ Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Item Detail Modal */}
      {showItemDetail && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Item Details
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getCategoryName(selectedItem.category_id)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowItemDetail(false);
                    setSelectedItem(null);
                    setApprovalNotes('');
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <XCircle size={24} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Item Name</label>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {selectedItem.item_name || selectedItem.description}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {currency || '₦'} {parseFloat(selectedItem.amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {selectedItem.description || 'No description provided'}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                <div className="mt-1">
                  {getStatusBadge(selectedItem.is_approved)}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {selectedItem.is_approved === 0 ? 'Approval/Rejection Notes' : 'Notes'}
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add notes for approval or rejection..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 
                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  disabled={selectedItem.is_approved !== 0}
                />
              </div>
              
              {selectedItem.notes && selectedItem.is_approved !== 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Previous Notes</label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {selectedItem.notes}
                  </p>
                </div>
              )}
              
              {selectedItem.is_approved === 0 && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleApprove(selectedItem)}
                    disabled={processingId === selectedItem.id}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                               font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedItem)}
                    disabled={processingId === selectedItem.id}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                               font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
              
              {selectedItem.is_approved === 1 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle size={18} />
                    <span className="font-medium">This item has been approved</span>
                  </div>
                  {selectedItem.approved_date && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Approved on: {new Date(selectedItem.approved_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              
              {selectedItem.is_approved === 2 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle size={18} />
                    <span className="font-medium">This item has been rejected</span>
                  </div>
                  {selectedItem.approved_date && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Rejected on: {new Date(selectedItem.approved_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowItemDetail(false);
                  setSelectedItem(null);
                  setApprovalNotes('');
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 
                           dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Items: {getAllBudgetItemsWithAmounts().length} | 
          Pending: {budgetItems.filter(item => item.item_id !== null && item.is_approved === 0).length} |
          Approved: {budgetItems.filter(item => item.item_id !== null && item.is_approved === 1).length} |
          Rejected: {budgetItems.filter(item => item.item_id !== null && item.is_approved === 2).length}
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 
                     dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
        >
          Close
        </button>
      </div>

      {/* Custom Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}