// src/constants/requisitionConstants.js

export const REQUISITION_TYPES = {
    1: 'REQUISITIONS', // data in  requisitions table with requisition_type 1
    2: 'PURCHASE ORDER', //data in budgets table
    3: 'CASH ADVANCE', // data in  requisitions table with requisition_type 2
    4: 'BUDGET', // data in  requisitions table with requisition_type 1
    5: 'USER', //data in users table
    6: 'CASH TRANSFERS', // data in requisitions table with requisition_type 3
};
// src/config/documentTypes.js

export const DOCUMENT_TYPE_CONFIG = {
    1: {
        id: 1,
        code: 'REQUISITION',
        name: 'Requisitions',
        table: 'requisitions',
        number_column: 'requisition_number',
        title_column: 'title',
        amount_column: 'total_amount',
        currency_column: 'currency_code',
        status_column: 'status',
        icon: 'FileText',
        view_component: 'RequisitionViewWithDetails'
    },
    2: {
        id: 2,
        code: 'PURCHASE_ORDER',
        name: 'Purchase Orders',
        table: 'purchase_orders',
        number_column: 'po_number',
        title_column: 'title',
        amount_column: 'grand_total',
        currency_column: 'currency_id',
        status_column: 'status_id',
        icon: 'ShoppingCart',
        view_component: 'PurchaseOrderViewWithDetails'
    },
    3: {
        id: 3,
        code: 'CASH_ADVANCE',
        name: 'Cash Advances',
        table: 'cash_advances',
        number_column: 'advance_number',
        title_column: 'purpose',
        amount_column: 'amount',
        currency_column: 'currency_code',
        status_column: 'status',
        icon: 'Wallet',
        view_component: 'CashAdvanceViewWithDetails'
    },
    4: {
        id: 4,
        code: 'BUDGET',
        name: 'Budgets',
        table: 'budgets',
        number_column: 'budget_code',
        title_column: 'budget_name',
        amount_column: 'allocated_amount',
        currency_column: 'currency_code',
        status_column: 'status',
        icon: 'PieChart',
        view_component: 'BudgetViewWithDetails'
    },
    5: {
        id: 5,
        code: 'USER',
        name: 'Users',
        table: 'users',
        number_column: 'employee_id',
        title_column: 'CONCAT(first_name, " ", last_name)',
        amount_column: null,
        currency_column: null,
        status_column: 'is_active',
        icon: 'User',
        view_component: 'UserViewWithDetails'
    },
    6: {
        id: 6,
        code: 'CASH_TRANSFER',
        name: 'Cash Transfers',
        table: 'cash_transfers',
        number_column: 'transfer_number',
        title_column: 'description',
        amount_column: 'amount',
        currency_column: 'currency_code',
        status_column: 'status',
        icon: 'ArrowRightLeft',
        view_component: 'CashTransferViewWithDetails'
    },
    7: {
        id: 7,
        code: 'INCOME',
        name: 'Cash Transfers',
        table: 'cash_transfers',
        number_column: 'transfer_number',
        title_column: 'description',
        amount_column: 'amount',
        currency_column: 'currency_code',
        status_column: 'status',
        icon: 'ArrowRightLeft',
        view_component: 'CashTransferViewWithDetails'
    },
};

export const PRIORITIES = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
    5: 'Critical'
};

export const REQUISITION_STATUS = {
    O: 'UNDETERMINED',
    1: 'Draft',
    2: 'Pending Approval',
    3: 'Approved',
    4: 'Rejected',
    5: 'Converted to PO',
    6: 'Closed',
    7: 'Cancelled'
};

// Helper function to get label by value
export const getRequisitionTypeLabel = (value) => REQUISITION_TYPES[value] || value;
export const getPriorityLabel = (value) => PRIORITIES[value] || value;
export const getStatusLabel = (value) => REQUISITION_STATUS[value] || value;

// Options arrays for select dropdowns
export const REQUISITION_TYPE_OPTIONS = Object.entries(REQUISITION_TYPES).map(([value, label]) => ({
    value: parseInt(value),
    label
}));

export const PRIORITY_OPTIONS = Object.entries(PRIORITIES).map(([value, label]) => ({
    value: parseInt(value),
    label
}));

export const STATUS_OPTIONS = Object.entries(REQUISITION_STATUS).map(([value, label]) => ({
    value: parseInt(value),
    label
}));