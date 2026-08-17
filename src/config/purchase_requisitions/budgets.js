// config/budgets.js

const budgets = {
    tableName: 'budgets',
    displayName: 'Budgets',
    primaryKey: 'id',
    icon: 'Wallet',
    description: 'Manage budget records',
    
    // Default columns visible in table - this works with your existing buildColumnVisibility
    defaultColumns: ['budget_name', 'total_amount', 'start_date', 'end_date'],
    
    // Add columnVisibility to control which columns show by default
    // Your buildColumnVisibility function will use this if available
    columnVisibility: {
        budget_name: { default: true, required: true },
        total_amount: { default: true, required: true },
        start_date: { default: true, required: true },
        end_date: { default: true, required: true },
        location_id: { default: false, required: false },
        is_active: { default: false, required: false },
        is_completed: { default: false, required: false },
        is_approved: { default: false, required: false },
        approved_by_id: { default: false, required: false },
        approved_date: { default: false, required: false },
        is_closed: { default: false, required: false },
        closed_date: { default: false, required: false },
        created_at: { default: false, required: false },
        created_by_id: { default: false, required: false },
        updated_at: { default: false, required: false },
        updated_by_id: { default: false, required: false }
    },
    
    formConfig: {
        layout: 'grid',
        columns: 2,
        sections: [
            {
                title: 'Basic Information',
                fields: ['budget_name', 'description', 'location_id', 'total_amount']
            },
            {
                title: 'Budget Period',
                fields: ['start_date', 'end_date']
            },
            {
                title: 'Status & Approval',
                fields: ['is_active', 'is_approved', 'is_completed', 'is_closed']
            },
            {
                title: 'Approval Details',
                fields: ['approved_by_id', 'approved_date', 'closed_date', 'final_comments']
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
        budget_name: {
            type: 'text',
            label: 'Budget Name',
            placeholder: 'Enter budget name',
            required: true,
            showInTable: true,
            showInForm: true,
            tableWidth: '200px',
            sortable: true,
            filterable: true,
            validation: {
                minLength: 3,
                maxLength: 255
            }
        },
        description: {
            type: 'textarea',
            label: 'Description',
            placeholder: 'Enter budget description',
            required: false,
            showInTable: false,
            showInForm: true,
            rows: 3
        },
        location_id: {
            type: 'select',
            label: 'Location',
            placeholder: 'Select location',
            required: false,
            showInTable: true,
            showInForm: true,
            tableWidth: '150px',
            sortable: true,
            filterable: true,
            options: 'locations',
            displayField: 'name',
            valueField: 'id'
        },
        total_amount: {
            type: 'number',
            label: 'Total Amount',
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
        start_date: {
            type: 'date',
            label: 'Start Date',
            required: true,
            showInTable: true,
            showInForm: true,
            tableWidth: '130px',
            sortable: true,
            filterable: true
        },
        end_date: {
            type: 'date',
            label: 'End Date',
            required: true,
            showInTable: true,
            showInForm: true,
            tableWidth: '130px',
            sortable: true,
            filterable: true
        },
        is_active: {
            type: 'hidden',
            label: 'Active',
            default: true,
            showInTable: true,
            showInForm: false,
            tableWidth: '100px',
            sortable: true,
            filterable: true,
            trueLabel: 'Active',
            falseLabel: 'Inactive'
        },
        is_completed: {
            type: 'hidden',
            label: 'Completed',
            default: false,
            showInTable: true,
            showInForm: false,
            tableWidth: '100px',
            sortable: true,
            filterable: true,
            trueLabel: 'Completed',
            falseLabel: 'Pending'
        },
        is_approved: {
            type: 'hidden',
            label: 'Approved',
            default: false,
            showInTable: true,
            showInForm: false,
            tableWidth: '100px',
            sortable: true,
            filterable: true,
            trueLabel: 'Approved',
            falseLabel: 'Pending'
        },
        approved_by_id: {
            type: 'hidden',
            label: 'Approved By',
            placeholder: 'Select approver',
            required: false,
            showInTable: true,
            showInForm: false,
            tableWidth: '150px',
            sortable: true,
            filterable: true,
            options: 'users',
            displayField: 'name',
            valueField: 'id'
        },
         priority: {
            label: 'Priority',
            placeholder: 'Select priority',
            type: 'select',
            options: 'priorities',
            description: 'Priority level of the request',
            showInTable: true,
            showInForm: true,
            tableWidth: '120px',
            filterable: true,
            filterType: 'select',
            filterOptions: 'priorities',
            analyzable: true,
            analysisType: 'group',
            analysisGroup: 'priority',
        },
        priority_name: {
            label: 'Priority',
            placeholder: 'Select priority',
            type: 'select',
            options: 'priorities',
            description: 'Priority level of the request',
            showInTable: true,
            showInForm: false,
            tableWidth: '120px',
            filterable: true,
            filterType: 'select',
            filterOptions: 'priorities',
            analyzable: true,
            analysisType: 'group',
            analysisGroup: 'priority',
        },
        status: {
            label: 'Status',
            placeholder: 'draft',
            type: 'select',
            options: 'requisition_status',
            description: 'Current status of the requisition',
            showInTable: true,
            showInForm: true,
            tableWidth: '150px',
            filterable: true,
            filterType: 'select',
            filterOptions: 'requisition_status',
            analyzable: true,
            analysisType: 'group',
            analysisGroup: 'status',
        },
        status_name: {
            label: 'Status',
            placeholder: 'draft',
            type: 'select',
            options: 'requisition_status',
            disabled: true,
            description: 'Current status of the requisition',
            showInTable: true,
            showInForm: false,
            tableWidth: '150px',
            filterable: true,
            filterType: 'select',
            filterOptions: 'requisition_status',
            analyzable: true,
            analysisType: 'group',
            analysisGroup: 'status',
        },
        approval_workflow_id: {
            label: 'Approval Workflow',
            placeholder: 'Select workflow',
            hidden:true,
            type: 'select',
            options: 'approval_workflows',
            description: 'Approval workflow to follow',
            showInTable: false,
            showInForm: true,
            filterable: true,
            filterType: 'select',
            filterOptions: 'approval_workflows',
            analyzable: false,
            nameField: 'approval_workflow_name',
        },
        approval_workflow_name: {
            label: 'Workflow Name',
            type: 'text',
            hidden:true,
            hidden: false, // ✅ Changed from true to false
            disabled: true,
            description: 'Approval workflow name',
            showInTable: true,
            showInForm: false, // ✅ Explicitly set to false
            filterable: false,
            analyzable: false,
        },
        approved_date: {
            type: 'hidden',
            label: 'Approved Date',
            required: false,
            showInTable: true,
            showInForm: false,
            tableWidth: '160px',
            sortable: true,
            filterable: true
        },
        is_complete: {
            type: 'hidden',
            label: 'Closed',
            default: false,
            showInTable: true,
            showInForm: false,
            tableWidth: '100px',
            sortable: true,
            filterable: true,
            trueLabel: 'Closed',
            falseLabel: 'Open'
        },
        closed_date: {
            type: 'hidden',
            label: 'Closed Date',
            required: false,
            showInTable: true,
            showInForm: false,
            tableWidth: '160px',
            sortable: true,
            filterable: true
        },
        final_comments: {
            type: 'hidden',
            label: 'Final Comments',
            placeholder: 'Enter final comments',
            required: false,
            showInTable: false,
            showInForm: false,
            rows: 3
        },
        created_at: {
            type: 'hidden',
            label: 'Created At',
            showInTable: true,
            showInForm: false,
            tableWidth: '160px',
            sortable: true,
            filterable: true
        },
        created_by_id: {
            type: 'hidden',
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
            type: 'hidden',
            label: 'Updated At',
            showInTable: true,
            showInForm: false,
            tableWidth: '160px',
            sortable: true,
            filterable: true
        },
        updated_by_id: {
            type: 'hidden',
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
};

export default budgets;