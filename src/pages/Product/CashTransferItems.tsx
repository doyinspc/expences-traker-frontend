// src/pages/Finance/CashTransfers.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Edit2, Trash2, Eye, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import useReduxApiData from "../../hooks/useTanstackQuery.js";
import { moneyFunction, getTitleRow } from "../../utils/functions/basci.jsx";

// ==================== CONSTANTS ====================
const TABLE_NAME = "requisitionitems";
const TABLE_PATH = "requisitionitem";
const PAGE_CODE = "CT";

// ==================== TOAST COMPONENT ====================
interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md animate-slide-in ${getColors()}`}>
            <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// ==================== COMPONENT ====================
const CashTransfers: React.FC = () => {
    const nav = useNavigate();
    const { id: paramId } = useParams();
    const { user } = useSelector((state: any) => state.authReducer);
    const { id: user_id } = user || {};
    
    const { currency_code, name: title } = getTitleRow(1);

    const parentId = paramId || 0;

    // ==================== STATE ====================
    const [showForm, setShowForm] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        transfer_group_id: '',
    });

    // ==================== API HOOKS ====================
    const { data, loadQuery, loadUpdate, isLoading } = useReduxApiData({
        table: TABLE_NAME,
        pth: TABLE_PATH,
        queryType: 'gets',
        mainParam: { requisition_id: parentId },
        narration: 'get all cash transfers'
    });

    const { data: accountData, loadQuery: loadAccount } = useReduxApiData({
        table: "commons",
        uniqueKey: 'accounts',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 7 },
        narration: 'get all accounts'
    });

    // ==================== TOAST HELPERS ====================
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    // ==================== HELPERS ====================
    const generateGroupId = () => {
        return `CTG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // ==================== HANDLERS ====================
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            from_account_id: '',
            to_account_id: '',
            amount: '',
            transfer_group_id: '',
        });
        setIsEdit(false);
        setSelectedRow(null);
        setShowForm(false);
    };

    const handleAdd = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEdit = (row: any) => {
        const pair = processedRows.filter((r: any) => r.special_instructions === row.special_instructions);
        const debit = pair.find((r: any) => r.category_id === 0 || (r.total_price > 0 && r.credit_price === 0));
        const credit = pair.find((r: any) => r.category_id === 1 || (r.credit_price > 0 && r.total_price === 0));

        setIsEdit(true);
        setSelectedRow(row);
        setFormData({
            from_account_id: debit?.account_id || row.account_id || '',
            to_account_id: credit?.account_id || row.account_id || '',
            amount: debit?.total_price ? debit.total_price.toString() : (credit?.credit_price || 0).toString(),
            transfer_group_id: row.special_instructions || '',
        });
        setShowForm(true);
    };

    const handleView = (row: any) => {
        const pair = processedRows.filter((r: any) => r.special_instructions === row.special_instructions);
        setSelectedRow({ ...row, pair });
        setShowViewModal(true);
    };

    const handleDelete = (row: any) => {
        if (window.confirm(`Are you sure you want to delete this transfer and its pair?`)) {
            const pair = processedRows.filter((r: any) => r.special_instructions === row.special_instructions);
            pair.forEach((item: any) => {
                loadUpdate({ id: item.id, cat: 'delete' });
            });
            showToast('Transfer deleted successfully!', 'success');
        }
    };

    const handleSubmit = () => {
        if (!formData.from_account_id || !formData.to_account_id || !formData.amount) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (formData.from_account_id === formData.to_account_id) {
            showToast('From Account and To Account cannot be the same', 'error');
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        const groupId = isEdit ? formData.transfer_group_id : generateGroupId();

        if (isEdit && selectedRow) {
            const oldPair = processedRows.filter((r: any) => r.special_instructions === groupId);
            oldPair.forEach((item: any) => {
                loadUpdate({ id: item.id, cat: 'delete' });
            });
        }

        const fromData = {
            account_id: formData.from_account_id,
            item_id: formData.from_account_id,
            credit_price: 0,
            total_price: amount,
            category_id: 0,
            requisition_id: parentId,
            created_by_id: user_id || null,
            quantity: 0,
            special_instructions: groupId,
        };

        const toData = {
            account_id: formData.to_account_id,
            item_id: formData.to_account_id,
            credit_price: amount,
            total_price: 0,
            category_id: 1,
            requisition_id: parentId,
            created_by_id: user_id || null,
            quantity: 0,
            special_instructions: groupId,
        };

        loadUpdate(fromData);
        loadUpdate(toData);

        resetForm();
        showToast(isEdit ? 'Transfer updated successfully!' : 'Transfer saved successfully!', 'success');
    };

    const handleReload = () => {
        loadQuery();
        loadAccount();
        showToast('Data refreshed', 'info');
    };

    const goBack = () => nav(-1);

    // ==================== DATA PROCESSING ====================
    const accountMap = useMemo(() => {
        const map = new Map();
        if (Array.isArray(accountData)) {
            accountData.forEach((acc: any) => {
                map.set(String(acc.id), acc);
            });
        }
        return map;
    }, [accountData]);

    const processedRows = useMemo(() => {
        const rows = Array.isArray(data) ? data : [];
        
        return rows.map((row: any) => {
            const groupId = row.special_instructions || '';
            
            const isDebit = row.category_id === 0 || (parseFloat(row.total_price) > 0 && parseFloat(row.credit_price) === 0);
            const isCredit = row.category_id === 1 || (parseFloat(row.credit_price) > 0 && parseFloat(row.total_price) === 0);
            
            let amount = 0;
            if (isDebit) {
                amount = parseFloat(row.total_price) || 0;
            } else if (isCredit) {
                amount = parseFloat(row.credit_price) || 0;
            }
            
            return {
                ...row,
                transfer_group_id: groupId,
                from_account_name: row.account_name || 'N/A',
                to_account_name: row.account_name || 'N/A',
                amount_display: amount,
                is_debit: isDebit,
                is_credit: isCredit,
                amount: isDebit ? -amount : amount,
                category_label: isDebit ? 'Debit' : (isCredit ? 'Credit' : 'Unknown'),
                created_at_formatted: formatDate(row.created_at),
            };
        });
    }, [data]);

    const transferGroups = useMemo(() => {
        const groups = new Map();
        processedRows.forEach((row: any) => {
            const groupId = row.special_instructions;
            if (groupId && groupId !== '') {
                if (!groups.has(groupId)) {
                    groups.set(groupId, []);
                }
                groups.get(groupId).push(row);
            }
        });
        return groups;
    }, [processedRows]);

    const uniqueTransfers = useMemo(() => {
        const uniqueList: any[] = [];
        transferGroups.forEach((entries: any[], groupId: string) => {
            const debit = entries.find((r: any) => r.is_debit);
            const credit = entries.find((r: any) => r.is_credit);
            
            if (debit || credit) {
                const primaryEntry = debit || credit;
                
                uniqueList.push({
                    ...primaryEntry,
                    transfer_group_id: groupId,
                    from_account_name: debit?.account_name || 'N/A',
                    to_account_name: credit?.account_name || 'N/A',
                    from_account_id: debit?.account_id || null,
                    to_account_id: credit?.account_id || null,
                    amount_display: debit?.amount_display || credit?.amount_display || 0,
                    created_at: primaryEntry?.created_at,
                    created_at_formatted: primaryEntry?.created_at_formatted || 'N/A',
                    created_by_name: primaryEntry?.created_by_name,
                    debit_entry: debit,
                    credit_entry: credit,
                });
            }
        });
        return uniqueList;
    }, [transferGroups]);

    // ==================== SUMMARY ====================
    const summary = useMemo(() => {
        let totalOutgoing = 0;
        let totalIncoming = 0;

        processedRows.forEach((row: any) => {
            if (row.is_debit) {
                totalOutgoing += row.amount_display;
            } else if (row.is_credit) {
                totalIncoming += row.amount_display;
            }
        });

        return {
            totalTransfers: transferGroups.size,
            totalOutgoing,
            totalIncoming,
            netAmount: totalIncoming - totalOutgoing,
        };
    }, [processedRows, transferGroups]);

    // ==================== EFFECTS ====================
    useEffect(() => {
        handleReload();
    }, [parentId]);

    // ==================== RENDER FORM ====================
    const renderForm = () => {
        const availableToAccounts = Array.isArray(accountData) 
            ? accountData.filter((acc: any) => String(acc.id) !== String(formData.from_account_id))
            : [];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isEdit ? 'Edit Cash Transfer' : 'New Cash Transfer'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                From Account <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="from_account_id"
                                value={formData.from_account_id}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Account</option>
                                {Array.isArray(accountData) && accountData.map((acc: any) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                To Account <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="to_account_id"
                                value={formData.to_account_id}
                                onChange={handleInputChange}
                                disabled={!formData.from_account_id}
                                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                                    !formData.from_account_id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <option value="">
                                    {formData.from_account_id ? 'Select Account' : 'Select From Account First'}
                                </option>
                                {availableToAccounts.map((acc: any) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name}
                                    </option>
                                ))}
                            </select>
                            {!formData.from_account_id && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                    Please select a From Account first
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="Enter amount"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                <strong>Note:</strong> This will create two linked entries:
                                <br />- Debit entry: category_id = 0, total_price = amount, credit_price = 0
                                <br />- Credit entry: category_id = 1, total_price = 0, credit_price = amount
                                <br />- They will be linked with the same special_instructions (group ID)
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            {isEdit ? 'Update Transfer' : 'Save Transfer'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER VIEW MODAL ====================
    const renderViewModal = () => {
        if (!selectedRow) return null;
        const pair = selectedRow.pair || [];
        const debit = pair.find((r: any) => r.is_debit);
        const credit = pair.find((r: any) => r.is_credit);

        const groupId = selectedRow.special_instructions || 'N/A';

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Transfer Details
                        </h2>
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 space-y-3">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Transfer Group ID</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {groupId}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">From Account</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {debit?.account_name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">To Account</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {credit?.account_name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {moneyFunction(selectedRow.amount_display || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedRow.created_at_formatted || 'N/A'}
                            </p>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Entries</p>
                            <div className="space-y-2">
                                {pair.map((entry: any) => (
                                    <div key={entry.id} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {entry.is_debit ? 'Debit (Outgoing)' : 'Credit (Incoming)'}
                                            <span className="text-xs text-gray-400 ml-2">
                                                (category: {entry.category_id})
                                            </span>
                                        </span>
                                        <span className={`font-semibold ${entry.is_debit ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {entry.is_debit ? '- ' : '+ '}{moneyFunction(entry.amount_display)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created By</p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {selectedRow.created_by_name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {selectedRow.created_at_formatted || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER TABLE ====================
    const renderTable = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-500">Loading...</span>
                </div>
            );
        }

        if (uniqueTransfers.length === 0) {
            return (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No cash transfers found</p>
                    <button
                        onClick={handleAdd}
                        className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Create First Transfer
                    </button>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Group ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From Account</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To Account</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {uniqueTransfers.map((row: any, index: number) => {
                            const displayGroupId = row.special_instructions || 'N/A';
                            const shortGroupId = typeof displayGroupId === 'string' && displayGroupId !== 'N/A' 
                                ? displayGroupId.substring(0, 15) + '...' 
                                : displayGroupId;

                            return (
                                <tr key={row.special_instructions || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            {shortGroupId}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.from_account_name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.to_account_name}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-right text-green-600 dark:text-green-400">
                                        {moneyFunction(row.amount_display)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {row.created_at_formatted}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleView(row)}
                                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(row)}
                                                className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(row)}
                                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // ==================== RENDER SUMMARY ====================
    const renderSummary = () => {
        const { totalTransfers, totalOutgoing, totalIncoming, netAmount } = summary;
        const currency = currency_code || 'NGN';

        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Transfers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalTransfers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Outgoing</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {currency} {totalOutgoing.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Incoming</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {currency} {totalIncoming.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Net Amount</p>
                    <p className={`text-2xl font-bold mt-1 ${netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {currency} {netAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>
        );
    };

    // ==================== MAIN RENDER ====================
    return (
        <div className="p-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Transfers</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage cash transfers for this document
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goBack}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Transfer
                    </button>
                    <button
                        onClick={handleReload}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
                        title="Reload"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {renderTable()}
            {uniqueTransfers.length > 0 && renderSummary()}
            {showForm && renderForm()}
            {showViewModal && renderViewModal()}
        </div>
    );
};

export default CashTransfers;