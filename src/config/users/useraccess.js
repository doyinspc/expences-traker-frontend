// src/config/tables/users.js

const userlocations = {
    frontendRoutes: ['/teams/directory', '/advances/balances'],
    description: 'System users with authentication and permissions',
    form: 'UserForm',
    tableName: 'user_datas',
    displayName: 'Users',
    grp: 42,
    icon: 'Users',
    defaultSort: { field: 'location', direction: 'ASC' },
    analysisConfig: {
        enabled: true,
        defaultGroupBy: 'department_id',
        defaultMetric: 'count',
        chartTypes: ['bar', 'pie', 'table'],
        availableMetrics: ['count', 'active_count', 'inactive_count'],
        availableDimensions: ['department_id', 'is_active', 'created_at', 'employment_type'],
    },
    fields: {
        // ==================== IDENTITY ====================
        id: {
            label: 'ID',
            type: 'text',
            hidden: true,
            showInTable: false,
            showInForm: false,
            filterable: false,
            analyzable: false,
        },
        user_id: {
            label: 'Employee ID',
            placeholder: 'EMP-001',
            type: 'text',
            required: true,
            description: 'Unique employee identifier',
            showInTable: true,
            showInForm: false,
            tableWidth: '120px',
            filterable: true,
            filterType: 'text',
            analyzable: false,
        },
        itemid1: {
            label: 'Location',
            placeholder: 'Lagos',
            type: 'text',
            description: 'User location',
            showInTable: false,
            showInForm: true,
            tableWidth: '120px',
            filterable: true,
            filterType: 'text',
            analyzable: false,
        },
        itemname1: {
            label: 'Location',
            placeholder: 'Lagos',
            type: 'text',
            description: 'User location',
            showInTable: true,
            showInForm: false,
            tableWidth: '120px',
            filterable: true,
            filterType: 'text',
            analyzable: false,
        },
        // ==================== STATUS ====================
        is_active: {
            label: 'Active',
            type: 'toggle',
            default: true,
            hidden:true,
            description: 'Whether the user account is active',
            showInTable: false,
            showInForm: true,
            tableWidth: '80px',
            tableFormat: function(value) {
                return value ? '✅' : '❌';
            },
            filterable: true,
            filterType: 'boolean',
            filterOptions: 'yes_no',
            analyzable: true,
            analysisType: 'percentage',
            analysisGroup: 'status',
        },

        // ==================== AUDIT ====================
        created_at: {
            label: 'Created Date',
            type: 'datetime',
            hidden:true,
            disabled: true,
            showInTable: false,
            showInForm: false,
            tableWidth: '150px',
            tableFormat: function(value) {
                if (!value) return '';
                var date = new Date(value);
                return date.toLocaleString();
            },
            filterable: true,
            filterType: 'date',
            analyzable: true,
            analysisType: 'trend',
            analysisGroup: 'activity',
        },
        updated_at: {
            label: 'Updated Date',
            type: 'datetime',
            hidden:true,
            disabled: true,
            showInTable: false,
            showInForm: false,
            filterable: false,
            analyzable: false,
        },
    },
};

export default userlocations;