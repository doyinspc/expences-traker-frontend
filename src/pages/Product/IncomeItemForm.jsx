import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { X, Loader2, Plus, AlertCircle, Info, Calendar, ChevronDown } from 'lucide-react';
import { API_PATH_SETTING, axiosConfig } from '../../actions/common';
import { useSelector } from 'react-redux';
import useReduxApiData from '../../hooks/useTanstackQuery';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// ==================== COMPONENT ====================
const RequisitionItemForm = ({
    requisitionId,
    parent_row,
    initialData,
    onSave,
    onCancel,
    isEdit = false,
    isLoading = false,
    onError,
}) => {
    
    const { tenantDb } = useSelector(state => state.auth);
    const { budget_id, currency_name:currency } = parent_row || {};
   

    // ==================== STATE ====================
    const [category_id, setcategory_id] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [touched, setTouched] = useState({});
    const [showInfo, setShowInfo] = useState(true);

    // ==================== FORM DATA ====================
    const [formData, setFormData] = useState(() => ({
        requisition_id: requisitionId || 0,
        category_id: initialData?.category_id ?? null,
        item_id: initialData?.item_id ?? null,
        is_type: 2, // 0 for OPEX, 1 for CAPEX 2 INCOME
        quantity: initialData?.quantity ?? null,
        unit_price: initialData?.unit_price ?? null,
        credit_price: initialData?.credit_price ?? null,
        delivery_required_by: initialData?.delivery_required_by ? new Date(initialData.delivery_required_by) : null,
        special_instructions: initialData?.special_instructions ?? '',
        sku_id: initialData?.sku_id ?? '',
        created_by_id: initialData?.created_by_id ?? undefined,
    }));

    const [errors, setErrors] = useState({});

    const {
        data: expenseData,
        loadQuery: loadExpenses,
        isLoading: loadingCategories,
        error: expenseError
      } = useReduxApiData({
        table: "expenses",
        pth: "expense",
        queryType: 'getRowsWithChildrenStructuredIncome',
        mainParam: { grp: 5, is_active: 1},
        narration: 'get all expenses categories and expenses items in a structured manner'
      });

      const categories = Array.isArray(expenseData) && expenseData.length > 0 ? expenseData : [];
      const items = useMemo(() => {
        let items = categories?.find(rw=>rw.id == formData?.category_id);
        return items?.children || [];
      }, [formData?.category_id, categories])

    // ==================== FILTER ITEMS BY CATEGORY ====================
    useEffect(() => {
        if (formData.category_id && items.length > 0) {
            const filtered = items.filter(
                item => parseInt(item.category_id) === parseInt(formData.category_id)
            );
            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
    }, [formData.category_id, items]);

    // ==================== HANDLE CATEGORY CHANGE ====================
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        const categoryId = value ? parseInt(value, 10) : null;
        
        if (value && isNaN(categoryId)) {
            console.warn('Invalid category ID:', value);
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            item_id: null, 
            sku_id: '',
        }));
        
        setTouched(prev => ({ ...prev, category_id: true }));
    };

    // ==================== HANDLE ITEM CHANGE ====================
    const handleItemChange = (e) => {
        const value = e.target.value;
        const itemId = value || null;
        
        const selectedItem = items.find(item => String(item.id) === String(itemId));
        
        setFormData(prev => ({
            ...prev,
            item_id: itemId,
            sku_id: selectedItem?.sku_id ?? prev.sku_id ?? '',
            unit_price: selectedItem?.unit_price ?? prev.unit_price ?? null,
        }));
        
        setTouched(prev => ({ ...prev, item_id: true }));
    };

    // ==================== HANDLE INPUT CHANGE ====================
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        
        const allowedFields = ['quantity', 'unit_price', 'credit_price', 'is_type', 'special_instructions'];
        if (!allowedFields.includes(name) && name !== 'sku_id') {
            console.warn('Unknown field:', name);
            return;
        }
        
        if (type === 'number' || name === 'is_type') {
            const numValue = value === '' ? null : Number(value);
            if (value !== '' && isNaN(numValue)) return;
            
            setFormData(prev => ({
                ...prev,
                [name]: numValue,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
        
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // ==================== HANDLE DATE CHANGE ====================
    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            delivery_required_by: date,
        }));
        setTouched(prev => ({ ...prev, delivery_required_by: true }));
    };

    // ==================== CALCULATE TOTAL PRICE ====================
    useEffect(() => {
        const quantity = formData.quantity;
        const unitPrice = formData.unit_price;
        
        if (quantity !== null && unitPrice !== null && quantity > 0 && unitPrice > 0) {
            const total = quantity * unitPrice;
            const roundedTotal = Math.round(total * 100) / 100;
            setFormData(prev => ({
                ...prev,
                credit_price: roundedTotal,
            }));
        }
    }, [formData.quantity, formData.unit_price]);
    
    // ==================== VALIDATE FORM ====================
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!requisitionId || requisitionId <= 0) {
            newErrors.requisition_id = 'Invalid requisition (Must be assigned to a requisition)';
        }

        if (!formData.category_id > 0) {
            newErrors.category_id = 'Please select a category';
        } else if (!categories.some(c => c.id === formData.category_id)) {
            newErrors.category_id = 'Selected category is invalid';
        }

        if (!formData.item_id) {
            newErrors.item_id = 'Please select an item';
        } else if (!items.some(i => String(i.id) === String(formData.item_id))) {
            newErrors.item_id = 'Selected item is invalid';
        }

        if (!formData.credit_price && !formData.unit_price) {
            newErrors.credit_price = 'A Total Price or Unit Price is required';
        }

        if (formData.unit_price !== null && formData.unit_price < 0) {
            newErrors.unit_price = 'Unit price cannot be negative';
        }

        if (formData.credit_price !== null && formData.credit_price < 0) {
            newErrors.credit_price = 'Total price cannot be negative';
        }

        if (formData.quantity !== null && formData.quantity !== undefined && formData.quantity < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
        }

        if (formData.delivery_required_by) {
            const date = new Date(formData.delivery_required_by);
            if (isNaN(date.getTime())) {
                newErrors.delivery_required_by = 'Invalid date format';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, requisitionId, categories, items]);

    // ==================== HANDLE BLUR FOR VALIDATION ====================
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateForm();
    };

    // ==================== HANDLE SUBMIT ====================
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);
        
        if (!validateForm()) {
            const firstError = document.querySelector('[data-error="true"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const submitData = {
            requisition_id: requisitionId,
            category_id: formData.category_id,
            item_id: formData.item_id,
            is_type: formData.is_type,
            quantity: formData.quantity,
            unit_price: formData.unit_price,
            credit_price: formData.credit_price ?? (formData.quantity ?? 0) * (formData.unit_price ?? 0),
            delivery_required_by: formData.delivery_required_by,
            special_instructions: formData.special_instructions?.trim() ?? '',
            created_by_id: formData.created_by_id,
        };

        onSave(submitData);
    };

    useEffect(() => {
      loadExpenses()
    }, [])
    

    const isFormDisabled = isLoading || loadingCategories || loadingItems;

    // ==================== RENDER ====================
    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            
            {/* ==================== INFO BAR ==================== */}
            {showInfo && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                    How to Add Income
                                </h4>
                                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                                    <li>
                                        <span className="font-medium">Income Type:</span> Select whether this is an OPEX (operational) or CAPEX (capital) expense
                                    </li>
                                    <li>
                                        <span className="font-medium">Category &amp; Item:</span> First choose a category, then select the specific item from the filtered list
                                    </li>
                                    <li>
                                        <span className="font-medium">Pricing:</span> Enter quantity and either unit price or total price (the other will auto-calculate)
                                    </li>
                                    <li>
                                        <span className="font-medium">Date:</span> Use the calendar dropdown to select when the item is paid
                                    </li>
                                    <li>
                                        <span className="font-medium">Special Instructions:</span> Add any additional notes or requirements for this item
                                    </li>
                                </ul>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    <span className="text-red-500">*</span> Fields marked with an asterisk are required
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowInfo(false)}
                            className="flex-shrink-0 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                            aria-label="Dismiss info"
                        >
                            <X size={16} className="text-blue-500 dark:text-blue-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Learn More / Show Info Button (when info is hidden) */}
            {!showInfo && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setShowInfo(true)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                    >
                        <Info size={14} />
                        <span>Show help &amp; instructions</span>
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Requisition Item' : 'Add Requisition Item'}
                </h3>
                <div className="flex items-center gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isFormDisabled}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {fetchError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                        <p className="font-medium">Error loading data</p>
                        <p>{fetchError}</p>
                        <button
                            type="button"
                            onClick={() => {
                                loadExpenses();
                            }}
                            className="mt-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Validation Banner if Requisition ID is invalid upon submit attempt */}
            {errors.requisition_id && touched.requisition_id && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                        <p className="font-medium">Submission Error</p>
                        <p>{errors.requisition_id}</p>
                    </div>
                </div>
            )}

            {/* Form Grid - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Expense Type */}
                {/* <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expense Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="is_type"
                        value={formData.is_type ?? 0}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        disabled={isFormDisabled}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value={0}>OPEX</option>
                        <option value={1}>CAPEX</option>
                    </select>
                </div> */}

                {/* Category Select */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="category_id"
                        value={formData.category_id ?? ''}
                        onChange={handleCategoryChange}
                        onBlur={handleBlur}
                        disabled={isFormDisabled || !categories.length}
                        data-error={!!errors.category_id}
                        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 
                            focus:border-brand-500 transition-colors
                            ${errors.category_id && touched.category_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <option value="">{loadingCategories ? 'Loading...' : 'Select Category...'}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name || `Category ${category.id}`}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && touched.category_id && (
                        <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>
                    )}
                    {!categories.length && !loadingCategories && !fetchError && (
                        <p className="mt-1 text-xs text-gray-400">No categories available</p>
                    )}
                </div>

                {/* Item Select (Cascading) */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Item <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="item_id"
                        value={formData.item_id ?? ''}
                        onChange={handleItemChange}
                        onBlur={handleBlur}
                        disabled={!formData.category_id || isFormDisabled || !items.length}
                        data-error={!!errors.item_id}
                        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 
                            focus:border-brand-500 transition-colors
                            ${errors.item_id && touched.item_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <option value="">
                            {!formData.category_id 
                                ? 'Select category first...' 
                                : loadingItems 
                                    ? 'Loading...' 
                                    : 'Select Item...'}
                        </option>
                        {items.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name || `Item ${item.id}`}
                                {item.sku_id ? ` (${item.sku_id})` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.item_id && touched.item_id && (
                        <p className="mt-1 text-xs text-red-500">{errors.item_id}</p>
                    )}
                    {formData.category_id && !filteredItems.length && !loadingItems && (
                        <p className="mt-1 text-xs text-gray-400">No items in this category</p>
                    )}
                </div>

                {/* Quantity */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                    </label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity ?? ''}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="0"
                        min="0"
                        step="1"
                        disabled={isFormDisabled}
                        data-error={!!errors.quantity}
                        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 
                            focus:border-brand-500 transition-colors
                            ${errors.quantity && touched.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {errors.quantity && touched.quantity && (
                        <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                    )}
                </div>

                {/* Unit Price */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit Price
                    </label>
                    <input
                        type="number"
                        name="unit_price"
                        value={formData.unit_price ?? ''}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={isFormDisabled}
                        data-error={!!errors.unit_price}
                        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 
                            focus:border-brand-500 transition-colors
                            ${errors.unit_price && touched.unit_price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {errors.unit_price && touched.unit_price && (
                        <p className="mt-1 text-xs text-red-500">{errors.unit_price}</p>
                    )}
                </div>

                {/* Total Price (Manual or Auto-calculated) */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            {currency}
                        </span>
                        <input
                            type="number"
                            name="credit_price"
                            value={formData.credit_price ?? ''}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isFormDisabled}
                            data-error={!!errors.credit_price}
                            className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 
                                text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 
                                focus:border-brand-500 transition-colors
                                ${errors.credit_price && touched.credit_price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                    </div>
                    {errors.credit_price && touched.credit_price && (
                        <p className="mt-1 text-xs text-red-500">{errors.credit_price}</p>
                    )}
                </div>

                {/* Delivery Required By - React DatePicker */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Delivery Required By
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={formData.delivery_required_by}
                            onChange={handleDateChange}
                            onBlur={() => setTouched(prev => ({ ...prev, delivery_required_by: true }))}
                           
                            placeholderText="Select date..."
                            dateFormat="MMM d, yyyy"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            isClearable
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 
                                text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 
                                focus:border-brand-500 transition-colors
                                ${errors.delivery_required_by && touched.delivery_required_by 
                                    ? 'border-red-500' 
                                    : 'border-gray-300 dark:border-gray-600'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                            popperClassName="react-datepicker-popper"
                            wrapperClassName="w-full"
                        />
                        <Calendar 
                            size={18} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                        />
                    </div>
                    {errors.delivery_required_by && touched.delivery_required_by && (
                        <p className="mt-1 text-xs text-red-500">{errors.delivery_required_by}</p>
                    )}
                </div>

                {/* Special Instructions - Full Width */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Special Instructions
                    </label>
                    <textarea
                        name="special_instructions"
                        value={formData.special_instructions ?? ''}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Any special requirements or instructions..."
                        rows={2}
                        disabled={isFormDisabled}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 
                            rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors
                            resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isFormDisabled}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                            bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                            rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isFormDisabled || !!fetchError}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-600 
                        hover:bg-brand-700 rounded-lg transition-colors 
                        flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {isEdit ? 'Updating...' : 'Adding...'}
                        </>
                    ) : (
                        <>
                            <Plus size={16} />
                            {isEdit ? 'Update Item' : 'Add Item'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default RequisitionItemForm;