const budgetitems = {
        tableName: 'budget_items',
        displayName: 'Budget Items',
        primaryKey: 'id',
        icon: 'ClipboardList',
        description: 'Manage budget line items',
        parentField: 'budget_id',
        parentTable: 'budgets',
        formConfig: {
            layout: 'grid',
            columns: 2,
            sections: [
                {
                    title: 'Item Details',
                    fields: ['budget_id', 'item_name', 'description', 'amount', 'category_id']
                },
                {
                    title: 'Status & Dates',
                    fields: ['is_active', 'is_approved', 'is_completed', 'expected_date', 'actual_date']
                },
                {
                    title: 'Approval Details',
                    fields: ['approved_by_id', 'approved_date', 'notes']
                }
            ]
        },
        fields: {
            id: {
                type: 'hidden',
                label: 'ID',
                showInTable: true,
                showInForm: false,
                tableWidth: '80px',
                sortable: true,
                filterable: true
            },
            budget_id: {
                type: 'select',
                label: 'Budget',
                placeholder: 'Select budget',
                required: true,
                showInTable: true,
                showInForm: true,
                tableWidth: '150px',
                sortable: true,
                filterable: true,
                options: 'budgets',
                displayField: 'budget_name',
                valueField: 'id'
            },
            item_name: {
                type: 'text',
                label: 'Item Name',
                placeholder: 'Enter item name',
                required: true,
                showInTable: true,
                showInForm: true,
                tableWidth: '200px',
                sortable: true,
                filterable: true,
                validation: {
                    minLength: 2,
                    maxLength: 255
                }
            },
            description: {
                type: 'textarea',
                label: 'Description',
                placeholder: 'Enter item description',
                required: false,
                showInTable: false,
                showInForm: true,
                rows: 3
            },
            amount: {
                type: 'number',
                label: 'Amount',
                placeholder: '0.00',
                required: true,
                showInTable: true,
                showInForm: true,
                tableWidth: '150px',
                tableAlign: 'right',
                sortable: true,
                filterable: true,
                step: '0.01',
                min: 0,
                format: 'currency',
                currency: 'USD'
            },
            category_id: {
                type: 'select',
                label: 'Category',
                placeholder: 'Select category',
                required: false,
                showInTable: true,
                showInForm: true,
                tableWidth: '150px',
                sortable: true,
                filterable: true,
                options: 'categories',
                displayField: 'name',
                valueField: 'id'
            },
            is_active: {
                type: 'toggle',
                label: 'Active',
                default: true,
                showInTable: true,
                showInForm: true,
                tableWidth: '100px',
                sortable: true,
                filterable: true,
                trueLabel: 'Active',
                falseLabel: 'Inactive'
            },
            is_completed: {
                type: 'toggle',
                label: 'Completed',
                default: false,
                showInTable: true,
                showInForm: true,
                tableWidth: '100px',
                sortable: true,
                filterable: true,
                trueLabel: 'Completed',
                falseLabel: 'Pending'
            },
            is_approved: {
                type: 'toggle',
                label: 'Approved',
                default: false,
                showInTable: true,
                showInForm: true,
                tableWidth: '100px',
                sortable: true,
                filterable: true,
                trueLabel: 'Approved',
                falseLabel: 'Pending'
            },
            approved_by_id: {
                type: 'select',
                label: 'Approved By',
                placeholder: 'Select approver',
                required: false,
                showInTable: true,
                showInForm: true,
                tableWidth: '150px',
                sortable: true,
                filterable: true,
                options: 'users',
                displayField: 'name',
                valueField: 'id'
            },
            approved_date: {
                type: 'datetime',
                label: 'Approved Date',
                required: false,
                showInTable: true,
                showInForm: true,
                tableWidth: '160px',
                sortable: true,
                filterable: true
            },
            expected_date: {
                type: 'date',
                label: 'Expected Date',
                required: false,
                showInTable: true,
                showInForm: true,
                tableWidth: '130px',
                sortable: true,
                filterable: true
            },
            actual_date: {
                type: 'date',
                label: 'Actual Date',
                required: false,
                showInTable: true,
                showInForm: true,
                tableWidth: '130px',
                sortable: true,
                filterable: true
            },
            notes: {
                type: 'textarea',
                label: 'Notes',
                placeholder: 'Enter additional notes',
                required: false,
                showInTable: false,
                showInForm: true,
                rows: 3
            },
            created_at: {
                type: 'datetime',
                label: 'Created At',
                showInTable: true,
                showInForm: false,
                tableWidth: '160px',
                sortable: true,
                filterable: true
            },
            created_by_id: {
                type: 'select',
                label: 'Created By',
                showInTable: true,
                showInForm: false,
                tableWidth: '150px',
                sortable: true,
                filterable: true,
                options: 'users',
                displayField: 'name',
                valueField: 'id'
            },
            updated_at: {
                type: 'datetime',
                label: 'Updated At',
                showInTable: true,
                showInForm: false,
                tableWidth: '160px',
                sortable: true,
                filterable: true
            },
            updated_by_id: {
                type: 'select',
                label: 'Updated By',
                showInTable: true,
                showInForm: false,
                tableWidth: '150px',
                sortable: true,
                filterable: true,
                options: 'users',
                displayField: 'name',
                valueField: 'id'
            }
        },
        defaultSort: { field: 'created_at', direction: 'DESC' },
        defaultFilters: { is_active: 1 },
        actions: ['view', 'edit', 'delete', 'activate', 'deactivate', 'approve']
    }
export default budgetitems;

