import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import useReduxApiData from '../../hooks/useTanstackQuery';
import { useSelector } from 'react-redux';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Save, 
  Edit,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Lock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

// ============ MAIN COMPONENT ============
export default function BudgetItemsForm(props) {
  const { user } = useSelector((state) => state.authReducer);
  const { row, onClose } = props || {};
  const { id: budget_id, budget_name, total_amount, currency } = row || {};
  const { id: user_id } = user || {};

  // ============ STATE ============
  const [budgetItems, setBudgetItems] = useState([]);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [editingItemId, setEditingItemId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    show: false,
    category_id: null,
    item_id: null,
    amount: '',
    description: '',
    parent_id: null
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  // ============ API HOOKS ============
  const {
    data: expenseData,
    loadQuery: loadExpenses,
    isLoading: isLoadingExpenses,
    error: expenseError
  } = useReduxApiData({
    table: "expenses",
    pth: "expense",
    queryType: 'getRowsWithChildrenStructured',
    mainParam: { grp: 5, is_active: 1 },
    narration: 'get all expenses categories and expenses items in a structured manner'
  });

  const {
    data: budgetData,
    loadQuery: loadBudgetItems,
    loadUpdate: saveBudgetItem,
    isLoading: isLoadingBudget,
    error: budgetError
  } = useReduxApiData({
    table: "budgetitems",
    pth: "budgetitems",
    queryType: 'gets',
    mainParam: { budget_id },
    narration: 'get all budgetitems already stored for this particular budget id'
  });

  // ============ DATA PROCESSING ============

  // Build category tree from expense data
  const categoryTree = useMemo(() => {
    if (!expenseData || expenseData.length === 0) return [];

    if (expenseData[0]?.children !== undefined) {
      return expenseData;
    }

    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    return buildTree(expenseData);
  }, [expenseData]);

  // Get flat list of all expense items
  const flatExpenseItems = useMemo(() => {
    const flatten = (items) => {
      let result = [];
      items.forEach(item => {
        result.push(item);
        if (item.children?.length > 0) {
          result = result.concat(flatten(item.children));
        }
      });
      return result;
    };
    return categoryTree.length > 0 ? flatten(categoryTree) : [];
  }, [categoryTree]);

  // ============ BUDGET HELPERS ============

  // Get budget for a specific expense item
  const getBudget = useCallback((expenseId, isChild = false) => {
    if (isChild) {
      return budgetItems.find(item => item.item_id === expenseId);
    } else {
      return budgetItems.find(
        item => item.category_id === expenseId && item.item_id === null
      );
    }
  }, [budgetItems]);

  // Get all child budgets for a category
  const getChildBudgets = useCallback((categoryId) => {
    return budgetItems.filter(
      item => item.category_id === categoryId && item.item_id !== null
    );
  }, [budgetItems]);

  // Get category budget amount
  const getCategoryBudgetAmount = useCallback((categoryId) => {
    const budget = getBudget(categoryId, false);
    return budget ? parseFloat(budget.amount || 0) : 0;
  }, [getBudget]);

  // Get total of all child budgets for a category
  const getChildBudgetsTotal = useCallback((categoryId) => {
    const childBudgets = getChildBudgets(categoryId);
    return childBudgets.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [getChildBudgets]);

  // Calculate remaining budget for a category
  const getRemainingBudget = useCallback((categoryId) => {
    const categoryAmount = getCategoryBudgetAmount(categoryId);
    if (categoryAmount === 0) return null;
    const childTotal = getChildBudgetsTotal(categoryId);
    return categoryAmount - childTotal;
  }, [getCategoryBudgetAmount, getChildBudgetsTotal]);

  // Check if category has budget
  const hasCategoryBudget = useCallback((categoryId) => {
    return budgetItems.some(
      item => item.category_id === categoryId && item.item_id === null
    );
  }, [budgetItems]);

  // Get expense item name
  const getExpenseItemName = useCallback((expenseId) => {
    const item = flatExpenseItems.find(e => e.id === expenseId);
    return item ? item.name : 'Unknown';
  }, [flatExpenseItems]);

  // Check if item is approved
  const isItemApproved = useCallback((item) => {
    return item?.is_approved === 1;
  }, []);

  // ============ VALIDATION FUNCTIONS ============

  const validateCategoryBudget = useCallback((categoryId, amount, excludeItemId = null) => {
    const childTotal = getChildBudgetsTotal(categoryId);
    const parsedAmount = parseFloat(amount) || 0;

    // Cannot set category budget less than child total
    if (parsedAmount < childTotal) {
      return {
        valid: false,
        message: `Category budget cannot be less than child budgets total (${currency || '₦'} ${childTotal.toFixed(2)})`,
        childTotal,
        remaining: 0,
        type: 'CATEGORY_LESS_THAN_CHILDREN'
      };
    }

    // Check against overall budget
    const currentCategoryTotal = budgetItems
      .filter(item => item.category_id !== categoryId || item.id === excludeItemId)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    const newOverallTotal = currentCategoryTotal + parsedAmount;
    const budgetTotal = parseFloat(total_amount || 0);

    if (budgetTotal > 0 && newOverallTotal > budgetTotal) {
      return {
        valid: false,
        message: `Total budget (${currency || '₦'} ${newOverallTotal.toFixed(2)}) exceeds overall budget (${currency || '₦'} ${budgetTotal.toFixed(2)})`,
        remaining: budgetTotal - currentCategoryTotal,
        type: 'EXCEEDS_OVERALL_BUDGET'
      };
    }

    return {
      valid: true,
      message: 'Valid category budget',
      childTotal,
      remaining: parsedAmount - childTotal
    };
  }, [getChildBudgetsTotal, budgetItems, total_amount, currency]);

  const validateChildBudget = useCallback((categoryId, amount, excludeItemId = null) => {
    // Check if category budget exists
    if (!hasCategoryBudget(categoryId)) {
      return {
        valid: false,
        message: 'Please set a category budget first before adding child budgets',
        remaining: 0,
        type: 'NO_CATEGORY_BUDGET'
      };
    }

    const categoryAmount = getCategoryBudgetAmount(categoryId);
    const childBudgets = getChildBudgets(categoryId);
    const currentTotal = childBudgets
      .filter(item => item.id !== excludeItemId)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const newTotal = currentTotal + parseFloat(amount || 0);
    const remaining = categoryAmount - currentTotal;

    if (newTotal > categoryAmount) {
      return {
        valid: false,
        message: `Amount exceeds remaining budget. Available: ${currency || '₦'} ${remaining.toFixed(2)}`,
        remaining,
        currentTotal,
        categoryAmount,
        newTotal,
        type: 'EXCEEDS_CATEGORY_BUDGET'
      };
    }

    return {
      valid: true,
      message: 'Valid child budget',
      remaining,
      currentTotal,
      categoryAmount,
      newTotal
    };
  }, [hasCategoryBudget, getCategoryBudgetAmount, getChildBudgets, currency]);

  const validateDelete = useCallback((item) => {
    if (item.item_id === null) {
      // Category budget deletion
      const childBudgets = getChildBudgets(item.category_id);
      if (childBudgets.length > 0) {
        return {
          valid: false,
          message: 'Cannot delete category budget with child budgets. Delete child budgets first.'
        };
      }
    }
    return { valid: true };
  }, [getChildBudgets]);

  // ============ TOAST NOTIFICATION ============

  const showToast = useCallback((message, type = 'success') => {
    // Clear existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    // Show toast
    setToast({ show: true, message, type });

    // Auto-hide after 5 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
      toastTimeoutRef.current = null;
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    // Clear timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // ============ HANDLERS ============

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set();
    const collectIds = (items) => {
      items.forEach(item => {
        allIds.add(item.id);
        if (item.children?.length > 0) {
          collectIds(item.children);
        }
      });
    };
    if (categoryTree.length > 0) collectIds(categoryTree);
    setExpandedCategories(allIds);
  }, [categoryTree]);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  // ============ CRUD OPERATIONS ============

  // ==== CATEGORY BUDGET OPERATIONS ====

  const handleSaveCategory = useCallback(async () => {
    if (!newItemForm.description?.trim() || !newItemForm.amount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const amount = parseFloat(newItemForm.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }

    const categoryId = newItemForm.category_id;

    // Check if category budget already exists
    if (hasCategoryBudget(categoryId)) {
      showToast('A budget for this category already exists. Please edit it instead.', 'error');
      return;
    }

    const validation = validateCategoryBudget(categoryId, amount);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }

    const newItem = {
      budget_id: budget_id,
      item_name: newItemForm.description,
      description: newItemForm.description,
      amount: amount,
      category_id: categoryId,
      item_id: null,
      is_active: 1,
      is_completed: 0,
      is_approved: 0,
      created_by_id: user_id,
      updated_by_id: user_id,
    };

    setIsSaving(true);

    try {
      const response = await saveBudgetItem(newItem);

      if (response?.error) {
        showToast(`Failed to save: ${response.error}`, 'error');
        setIsSaving(false);
        return;
      }

      // Add the new item to state
      const savedItem = response?.data || response;
      if (savedItem?.id) {
        setBudgetItems(prev => [...prev, savedItem]);
      }

      // Reset form
      setNewItemForm({
        show: false,
        category_id: null,
        item_id: null,
        amount: '',
        description: '',
        parent_id: null
      });

      showToast('Category budget saved successfully!', 'success');
    } catch (error) {
      showToast(`An error occurred while saving: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [newItemForm, budget_id, user_id, saveBudgetItem, validateCategoryBudget, hasCategoryBudget, showToast]);

  const handleEditCategory = useCallback(async (item) => {
    if (!item.description?.trim() || !item.amount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const amount = parseFloat(item.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }

    const categoryId = item.category_id;
    const validation = validateCategoryBudget(categoryId, amount, item.id);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }

    const updatedItem = {
      id: item.id,
      budget_id: item.budget_id,
      item_name: item.description || item.item_name,
      description: item.description,
      amount: amount,
      category_id: categoryId,
      item_id: null,
      is_active: item.is_active || 1,
      is_completed: item.is_completed || 0,
      is_approved: item.is_approved || 0,
      updated_by_id: user_id,
    };

    setIsSaving(true);

    try {
      const response = await saveBudgetItem(updatedItem);

      if (response?.error) {
        showToast(`Failed to update: ${response.error}`, 'error');
        setIsSaving(false);
        return;
      }

      // Update the item in state
      const savedItem = response?.data || response;
      if (savedItem?.id) {
        setBudgetItems(prev => prev.map(i => 
          i.id === item.id ? { ...savedItem } : i
        ));
      }

      setEditingItemId(null);
      showToast('Category budget updated successfully!', 'success');
    } catch (error) {
      showToast(`An error occurred while updating: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user_id, saveBudgetItem, validateCategoryBudget, showToast]);

  const handleDeleteCategory = useCallback(async (item) => {
    // Validate deletion
    const validation = validateDelete(item);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }

    const itemName = item.description || item.item_name || 'Unnamed budget';
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await saveBudgetItem({ id: item.id, act: 3 });

      if (response?.error) {
        showToast(`Failed to delete: ${response.error}`, 'error');
        setIsDeleting(false);
        return;
      }

      // Remove the item from state
      setBudgetItems(prev => prev.filter(i => i.id !== item.id));

      if (editingItemId === item.id) setEditingItemId(null);
      showToast('Category budget deleted successfully!', 'success');
    } catch (error) {
      showToast(`An error occurred while deleting: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [validateDelete, saveBudgetItem, editingItemId, showToast]);

  // ==== CHILD ITEM BUDGET OPERATIONS ====

  const handleSaveItem = useCallback(async () => {
    if (!newItemForm.description?.trim() || !newItemForm.amount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const amount = parseFloat(newItemForm.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }

    const categoryId = newItemForm.category_id;
    const childExpenseId = newItemForm.item_id;

    // Validate child budget
    const validation = validateChildBudget(categoryId, amount);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }

    const newItem = {
      budget_id: budget_id,
      item_name: newItemForm.description,
      description: newItemForm.description,
      amount: amount,
      category_id: categoryId,
      item_id: childExpenseId,
      is_active: 1,
      is_completed: 0,
      is_approved: 0,
      created_by_id: user_id,
      updated_by_id: user_id,
    };

    setIsSaving(true);

    try {
      const response = await saveBudgetItem(newItem);

      if (response?.error) {
        showToast(`Failed to save: ${response.error}`, 'error');
        setIsSaving(false);
        return;
      }

      // Add the new item to state
      const savedItem = response?.data || response;
      if (savedItem?.id) {
        setBudgetItems(prev => [...prev, savedItem]);
      }

      // Reset form
      setNewItemForm({
        show: false,
        category_id: null,
        item_id: null,
        amount: '',
        description: '',
        parent_id: null
      });

      showToast('Item budget saved successfully!', 'success');
    } catch (error) {
      showToast(`An error occurred while saving: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [newItemForm, budget_id, user_id, saveBudgetItem, validateChildBudget, showToast]);

  const handleEditItem = useCallback(async (item) => {
    if (!item.description?.trim() || !item.amount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const amount = parseFloat(item.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }

    const categoryId = item.category_id;
    const validation = validateChildBudget(categoryId, amount, item.id);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }

    const updatedItem = {
      id: item.id,
      budget_id: item.budget_id,
      item_name: item.description || item.item_name,
      description: item.description,
      amount: amount,
      category_id: categoryId,
      item_id: item.item_id,
      is_active: item.is_active || 1,
      is_completed: item.is_completed || 0,
      is_approved: item.is_approved || 0,
      updated_by_id: user_id,
    };

    setIsSaving(true);

    try {
      const response = await saveBudgetItem(updatedItem);

      if (response?.error) {
        showToast(`Failed to update: ${response.error}`, 'error');
        setIsSaving(false);
        return;
      }

      // Update the item in state
      const savedItem = response?.data || response;
      if (savedItem?.id) {
        setBudgetItems(prev => prev.map(i => 
          i.id === item.id ? { ...savedItem } : i
        ));
      }

      setEditingItemId(null);
      showToast('Item budget updated successfully!', 'success');
    } catch (error) {
      showToast(`An error occurred while updating: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user_id, saveBudgetItem, validateChildBudget, showToast]);

  const handleDeleteItem = useCallback(async (item) => {
    const itemName = item.description || item.item_name || 'Unnamed budget';
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await saveBudgetItem({ id: item.id, act: 3 });

      if (response?.error) {
        showToast(`Failed to delete: ${response.error}`, 'error');
        setIsDeleting(false);
        return;
      }

      // Remove the item from state
      setBudgetItems(prev => prev.filter(i => i.id !== item.id));

      if (editingItemId === item.id) setEditingItemId(null);
      showToast('Item budget deleted successfully!', 'success');
    } catch (error) {
      showToast(`An error occurred while deleting: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [saveBudgetItem, editingItemId, showToast]);

  // ============ COMPUTED VALUES ============

  const grandTotal = useMemo(() => {
    // Only count child budgets (item_id is not null) to avoid double counting
    const childTotal = budgetItems
      .filter(item => item.item_id !== null)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const categoryTotal = budgetItems
      .filter(item => item.item_id === null)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    return { childTotal, categoryTotal, overall: childTotal + categoryTotal };
  }, [budgetItems]);

  const isOverBudget = useMemo(() => {
    const budgetTotal = parseFloat(total_amount || 0);
    return budgetTotal > 0 && grandTotal.overall > budgetTotal;
  }, [grandTotal.overall, total_amount]);

  // ============ EFFECTS ============

  useEffect(() => {
    if (budget_id) {
      loadBudgetItems();
      loadExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget_id]);

  useEffect(() => {
    if (budgetData && Array.isArray(budgetData)) {
      setBudgetItems(budgetData);
    }
  }, [budgetData]);

  useEffect(() => {
    if (budgetError || expenseError) {
      const errorMsg = budgetError || expenseError;
      setError(errorMsg);
      showToast(`Error loading data: ${errorMsg}`, 'error');
    }
  }, [budgetError, expenseError, showToast]);

  useEffect(() => {
    if (categoryTree && categoryTree.length > 0) {
      const rootIds = categoryTree
        .filter(item => item.parent_id === null)
        .map(item => item.id);
      setExpandedCategories(new Set(rootIds));
    }
  }, [categoryTree]);

  // ============ RENDER FUNCTIONS ============

  const renderCategory = useCallback((category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    const categoryBudget = getBudget(category.id, false);
    const childBudgets = getChildBudgets(category.id);
    const categoryAmount = getCategoryBudgetAmount(category.id);
    const childTotal = getChildBudgetsTotal(category.id);
    const remaining = getRemainingBudget(category.id);
    const total = categoryAmount + childTotal;
    const isOverBudgetCategory = remaining !== null && remaining < 0;
    const hasCategoryBudgetSet = categoryBudget !== undefined;
    const isApproved = isItemApproved(categoryBudget);

    // Determine which handler to use based on the action
    const handleSave = () => {
      if (newItemForm.item_id) {
        handleSaveItem();
      } else {
        handleSaveCategory();
      }
    };

    return (
      <div key={category.id} className="mb-1">
        {/* Category Header */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer
            ${level === 0
              ? 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              : 'bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }
            ${isOverBudgetCategory ? 'border-l-4 border-red-500' : ''}
            ${isApproved ? 'opacity-75' : ''}
          `}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => toggleCategory(category.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
          {!hasChildren && <div className="w-7" />}

          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 dark:text-white">
              {category.name}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({childBudgets.length} child budgets)
            </span>
            {hasCategoryBudgetSet && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 
                             text-blue-700 dark:text-blue-300 rounded-full">
                Budget: {currency || '₦'} {categoryAmount.toFixed(2)}
              </span>
            )}
            {!hasCategoryBudgetSet && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 
                             text-gray-600 dark:text-gray-400 rounded-full">
                No budget set
              </span>
            )}
            {childTotal > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 
                             text-purple-700 dark:text-purple-300 rounded-full">
                Allocated: {currency || '₦'} {childTotal.toFixed(2)}
              </span>
            )}
            {remaining !== null && remaining >= 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 
                             text-green-700 dark:text-green-300 rounded-full">
                Remaining: {currency || '₦'} {remaining.toFixed(2)}
              </span>
            )}
            {remaining === null && hasCategoryBudgetSet && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 
                             text-yellow-700 dark:text-yellow-300 rounded-full">
                No category budget
              </span>
            )}
            {isOverBudgetCategory && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 
                             text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
                <AlertTriangle size={12} />
                Over budget by {currency || '₦'} {Math.abs(remaining).toFixed(2)}
              </span>
            )}
            {isApproved && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 
                             text-green-700 dark:text-green-300 rounded-full inline-flex items-center gap-1">
                <CheckCircle size={12} />
                Approved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-sm font-semibold ${isOverBudgetCategory ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {currency || '₦'} {total.toFixed(2)}
            </span>

            {/* Set Category Budget Button */}
            {!hasCategoryBudgetSet && !isApproved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewItemForm({
                    show: true,
                    category_id: category.id,
                    item_id: null,
                    amount: '',
                    description: `Budget for ${category.name}`,
                    parent_id: null
                  });
                }}
                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 
                           hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Set category budget"
                aria-label="Set category budget"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Content */}
        {isExpanded && (
          <div className="ml-4">
            {/* New Item Form */}
            {newItemForm.show && newItemForm.category_id === category.id && (
              <div className="mx-3 my-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newItemForm.description}
                      onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                      placeholder="Enter budget description..."
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                      autoFocus
                      disabled={isSaving}
                    />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount ({currency || '₦'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newItemForm.amount}
                      onChange={(e) => setNewItemForm({ ...newItemForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                      disabled={isSaving}
                    />
                  </div>
                  {newItemForm.item_id && remaining !== null && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Available: {currency || '₦'} {Math.max(0, remaining).toFixed(2)}
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 
                               disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium 
                               flex items-center gap-1 transition-colors"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setNewItemForm({
                        show: false,
                        category_id: null,
                        item_id: null,
                        amount: '',
                        description: '',
                        parent_id: null
                      });
                    }}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 
                               dark:hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Child Budgets */}
            {childBudgets.map(budget => {
              const isApproved = isItemApproved(budget);
              const expenseItem = flatExpenseItems.find(e => e.id === budget.item_id);
              const isEditing = editingItemId === budget.id && !isApproved;

              return (
                <div key={budget.id} className="mx-3 my-1">
                  {isEditing ? (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex flex-wrap gap-2 items-end">
                        <div className="flex-1 min-w-[180px]">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={budget.description || ''}
                            onChange={(e) => {
                              setBudgetItems(prev => prev.map(item =>
                                item.id === budget.id ? { ...item, description: e.target.value } : item
                              ));
                            }}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                       focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent"
                            autoFocus
                            disabled={isSaving}
                          />
                        </div>
                        <div className="w-36">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount ({currency || '₦'})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={budget.amount}
                            onChange={(e) => {
                              setBudgetItems(prev => prev.map(item =>
                                item.id === budget.id ? { ...item, amount: parseFloat(e.target.value) || 0 } : item
                              ));
                            }}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                       focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent"
                            disabled={isSaving}
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (budget.item_id) {
                              handleEditItem(budget);
                            } else {
                              handleEditCategory(budget);
                            }
                          }}
                          disabled={isSaving}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 
                                     disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium 
                                     flex items-center gap-1 transition-colors"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          {isSaving ? 'Updating...' : 'Update'}
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          disabled={isSaving}
                          className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 
                                     dark:hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors group
                        ${isApproved
                          ? 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }
                        ${budget.isOptimistic ? 'opacity-75 animate-pulse' : ''}
                      `}
                      style={{ marginLeft: '16px' }}
                    >
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${isApproved ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {budget.description || budget.item_name || 'Unnamed budget'}
                        </span>
                        {expenseItem && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 
                                         text-indigo-700 dark:text-indigo-300 rounded-full">
                            {expenseItem.name}
                          </span>
                        )}
                        {isApproved && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 
                                         text-green-700 dark:text-green-300 rounded-full inline-flex items-center gap-1">
                            <CheckCircle size={12} />
                            Approved
                          </span>
                        )}
                        {budget.is_completed === 1 && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 
                                         text-green-700 dark:text-green-300 rounded-full">
                            Completed
                          </span>
                        )}
                        {budget.isOptimistic && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 
                                         text-yellow-700 dark:text-yellow-300 rounded-full">
                            Saving...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-sm font-medium ${isApproved ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {currency || '₦'} {parseFloat(budget.amount || 0).toFixed(2)}
                        </span>

                        {!isApproved && !isSaving && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingItemId(budget.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 
                                         dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              aria-label="Edit budget item"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (budget.item_id) {
                                  handleDeleteItem(budget);
                                } else {
                                  handleDeleteCategory(budget);
                                }
                              }}
                              disabled={isDeleting}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 
                                         dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Delete budget item"
                              title="Delete"
                            >
                              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        )}

                        {isApproved && (
                          <span className="text-green-600 dark:text-green-400" title="Approved - Read only">
                            <Lock size={15} />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Child items without budgets */}
            {hasChildren && (
              <div className="ml-4 mt-2">
                {category.children.map(child => {
                  const hasBudgetItem = getBudget(child.id, true) !== undefined;
                  if (hasBudgetItem) return null;

                  const remainingBudget = getRemainingBudget(category.id);
                  const canAddBudget = hasCategoryBudget(category.id) && 
                                      (remainingBudget === null || remainingBudget > 0);

                  return (
                    <div key={child.id} className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          └─ {child.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                          No budget set
                        </span>
                      </div>
                      {canAddBudget && (
                        <button
                          onClick={() => {
                            setNewItemForm({
                              show: true,
                              category_id: category.id,
                              item_id: child.id,
                              amount: '',
                              description: `Budget for ${child.name}`,
                              parent_id: null
                            });
                          }}
                          disabled={isSaving}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 
                                     dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 
                                     rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Add budget for child"
                          aria-label="Add budget for child"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                      {!canAddBudget && hasCategoryBudget(category.id) && (
                        <span className="text-xs text-red-400 dark:text-red-500">
                          No remaining budget
                        </span>
                      )}
                      {!hasCategoryBudget(category.id) && (
                        <span className="text-xs text-yellow-400 dark:text-yellow-500">
                          Set category budget first
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Child Categories - Recursive */}
            {hasChildren && isExpanded && (
              <div className="ml-2">
                {category.children.map(child => renderCategory(child, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [
    expandedCategories,
    getBudget,
    getChildBudgets,
    getCategoryBudgetAmount,
    getChildBudgetsTotal,
    getRemainingBudget,
    hasCategoryBudget,
    isItemApproved,
    toggleCategory,
    newItemForm,
    isSaving,
    isDeleting,
    editingItemId,
    currency,
    flatExpenseItems,
    handleSaveCategory,
    handleSaveItem,
    handleEditCategory,
    handleEditItem,
    handleDeleteCategory,
    handleDeleteItem,
    setBudgetItems,
    setNewItemForm,
    setEditingItemId
  ]);

  // ============ MAIN RENDER ============

  if (isLoadingExpenses || isLoadingBudget) {
    return (
      <div className="flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-6xl mx-auto">
        <RefreshCw className="animate-spin text-blue-600" size={48} />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading budget data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <XCircle className="text-red-500" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Error Loading Data</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadBudgetItems();
              loadExpenses();
            }}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-6xl mx-auto relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 
          ${toast.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={20} className="flex-shrink-0" /> : <AlertCircle size={20} className="flex-shrink-0" />}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={hideToast}
            className="ml-4 hover:opacity-70 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {budget_name || 'Untitled Budget'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Budget Items Management
          </p>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currency || '₦'} {parseFloat(total_amount || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Category Budgets</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {currency || '₦'} {grandTotal.categoryTotal.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Child Budgets</p>
              <p className={`text-lg font-bold ${
                isOverBudget
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {currency || '₦'} {grandTotal.childTotal.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Overall Total</p>
              <p className={`text-lg font-bold ${
                isOverBudget
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-purple-600 dark:text-purple-400'
              }`}>
                {currency || '₦'} {grandTotal.overall.toFixed(2)}
              </p>
            </div>
            {isOverBudget && (
              <div className="text-right">
                <p className="text-xs text-red-500 dark:text-red-400">Over Budget</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {currency || '₦'} {(parseFloat(total_amount || 0) - grandTotal.overall).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              aria-label="Expand all categories"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              aria-label="Collapse all categories"
            >
              Collapse All
            </button>
            <button
              onClick={() => {
                loadBudgetItems();
                loadExpenses();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Category Budget (item_id = null)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 rounded border border-purple-200 dark:border-purple-800"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Child Item Budget (item_id = child_id)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-800"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Approved (Read Only)</span>
          <Lock size={12} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-l-4 border-red-500 rounded"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Over Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800 animate-pulse"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Saving in progress</span>
        </div>
      </div>

      {/* Warning - Over Budget */}
      {isOverBudget && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 
                       flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">
            Warning: Overall allocated amount ({currency || '₦'} {grandTotal.overall.toFixed(2)}) exceeds budget total ({currency || '₦'} {parseFloat(total_amount || 0).toFixed(2)})!
          </span>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {categoryTree.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No expense categories found</p>
            <p className="text-sm mt-2">Please add expense categories first to start budgeting</p>
          </div>
        ) : (
          categoryTree.map(category => renderCategory(category))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Budget Items: {budgetItems.length}
          {budgetItems.some(item => item.isOptimistic) && (
            <span className="ml-2 text-yellow-600 dark:text-yellow-400">(Saving...)</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
        >
          Close
        </button>
      </div>

      {/* Inline Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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