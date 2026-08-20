// src/config/tableMapping.ts
import {TableMappingMap, FormField, TableMapping} from "./tableInterface";

// Import all table configurations from users folder
import userlocations from "./users/userlocation";
import userdepartments from "./users/userdepartment";
import usermanagers from "./users/usermanager";
import userroles from "./users/useerrole.js";
import useraccesss from "./users/useraccess";
import users from "./users/users";
import roles from "./users/roles";
import departments from "./users/departments";
import locations from "./users/locations";
import expenses from "./users/expenses.js";
import expenseitems from "./users/expenseitems.js";
import currencys from "./users/currency.js";
import vendors from "./users/vendors";
import accounts from "./users/accounts";

// Import commons groups (grp 10-19) from users folder
import documenttypes from "./users/documenttypes";
import workflowstatus from "./users/workflowstatus";
import approvalactions from "./users/approvalactions";
import documentstatus from "./users/documentstatus";
import prioritylevels from "./users/prioritylevels";
import workflows from "./users/workflows";
import workflowsteps from "./users/workflowsteps";
import workflowtypes from "./users/workflowtypes";
import workflowinstances from "./users/workflowinstances";
import workflowinstancesteps from "./users/workflowinstancesteps";
import notificationtypes from "./users/notificationtypes";
import escalationreasons from "./users/escalationreasons";
import rejectionreasons from "./users/rejectionreasons";
import documentcategories from "./users/documentcategories";

// Purchase requisitions imports
import requisitions from "./purchase_requisitions/requisitions.js";
import stocks from "./purchase_requisitions/stocks.js";
import incomes from "./purchase_requisitions/incomes.js";
import incomeitems from "./purchase_requisitions/incomeitems.js";
import cashtransfers from "./purchase_requisitions/cashtransfers.js";
import requisitionitems from "./purchase_requisitions/requisitionitems.js";
import budgets from "./purchase_requisitions/budgets";
import budgetitems from "./purchase_requisitions/budgetitems";
import purchaseOrders from "./purchase_requisitions/purchaseorders.js";
import fixedAssets from "./purchase_requisitions/fixedAssets";
import invoices from "./purchase_requisitions/invoices";
import payments from "./purchase_requisitions/payments";
import auditTrail from "./purchase_requisitions/auditTrail";
import approvalWorkflows from "./purchase_requisitions/approvalWorkflows";
import grns from "./purchase_requisitions/grns";
import skus from "./purchase_requisitions/skus";
import chartOfAccounts from "./purchase_requisitions/chartOfAccounts";
import adminAccounts from "./purchase_requisitions/adminAccounts";
import cashadvances from "./purchase_requisitions/cashadvance.js";

// ==================== TABLE MAPPING ====================

export const tableMapping = {
    // User management
    users,
    userlocations,
    userroles,
    userdepartments,
    usermanagers,
    useraccesss,
    roles,
    departments,
    locations,
    accounts,
    
    // Financial
    expenses,
    expenseitems,
    currencys,
    vendors,
    
    // Commons Reference Groups (grp 10-19)
    documenttypes,          // grp: 10
    workflowstatus,         // grp: 11
    approvalactions,        // grp: 12
    documentstatus,         // grp: 13
    prioritylevels,         // grp: 14
    workflowtypes,          // grp: 15
    notificationtypes,      // grp: 16
    escalationreasons,      // grp: 17
    rejectionreasons,       // grp: 18
    documentcategories,     // grp: 19
    workflows,              // grp: 20
    workflowsteps,          // grp: 21

    workflowinstances,
    workflowinstancesteps,

    // Purchase Requisitions
    cashtransfers,
    cashadvances,
    requisitions,
    requisitionitems,
    incomes,
    incomeitems,
    stocks,
    budgets,
    budgetitems,
    purchaseorders: purchaseOrders,
    fixed_assets: fixedAssets,
    invoices,
    payments,
    audit_trail: auditTrail,
    approval_workflows: approvalWorkflows,
    grns,
    skus,
    chart_of_accounts: chartOfAccounts,
    admin_accounts: adminAccounts,
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get table configuration by name
 */
export const getTableConfig = (tableName: string): TableMapping | undefined => {
    return tableMapping[tableName];
};

/**
 * Get all table names
 */
export const getTableNames = (): string[] => {
    return Object.keys(tableMapping);
};



/**
 * Get tables by category (group)
 */
export const getTablesByCategory = (category: string): TableMapping[] => {
    const configs: TableMapping[] = [];
    
    // Define categories based on folder structure
    const categoryMap: { [key: string]: string[] } = {
        users: ['users', 'userlocations', 'userdepartments', 'usermanagers', 'useraccesss', 
                'roles', 'departments', 'locations'],
        financial: ['expenses', 'expenseitems', 'currencys', 'vendors'],
        commons: ['documenttypes', 'workflowstatus', 'approvalactions', 'documentstatus', 
                  'prioritylevels', 'workflowtypes', 'notificationtypes', 'escalationreasons', 
                  'rejectionreasons', 'documentcategories'],
        requisitions: ['requisitions', 'requisitionitems', 'budgets', 'budgetitems', 
                       'purchase_orders', 'fixed_assets', 'invoices', 'payments', 'grns', 'skus'],
        accounting: ['chart_of_accounts', 'admin_accounts'],
        audit: ['audit_trail', 'approval_workflows']
    };
    
    const tables = categoryMap[category] || [];
    tables.forEach(tableName => {
        const config = tableMapping[tableName];
        if (config) {
            configs.push(config);
        }
    });
    
    return configs;
};
// ==================== HELPER FUNCTIONS ====================

export function getFormFields(tableName: string): Record<string, FormField> | null {
    const table = tableMapping[tableName];
    if (!table) return null;
    return table.fields;
}

export function getTableMapping(tableName: string): TableMapping | null {
    return tableMapping[tableName] || null;
}
export function getTableMappingByGRP(grp: number): TableMapping | null {
    for (const key of Object.keys(tableMapping)) {
        const table = (tableMapping as Record<string, any>)[key];
        if (table && table.grp === grp) {
            return table;
        }
    }
    return null;
}
export function getTableKeyByGRP(grp: number): string | null {
    for (const [key, table] of Object.entries(tableMapping)) {
        if (table && table.grp === grp) {
            return key; // Returns 'requisitions', 'documenttypes', etc.
        }
    }
    return null;
}
export function getAllTableNames(): string[] {
    return Object.keys(tableMapping);
}

export function getFilterableFields(tableName: string): string[] {
    const table = tableMapping[tableName];
    if (!table) return [];
    
    return Object.entries(table.fields)
        .filter(([_, field]) => field.filterable)
        .map(([fieldName]) => fieldName);
}

export function getAnalyzableFields(tableName: string): string[] {
    const table = tableMapping[tableName];
    if (!table) return [];
    
    return Object.entries(table.fields)
        .filter(([_, field]) => field.analyzable)
        .map(([fieldName]) => fieldName);
}

export function getAnalysisGroups(tableName: string): string[] {
    const table = tableMapping[tableName];
    if (!table) return [];
    
    const groups = new Set<string>();
    Object.entries(table.fields).forEach(([_, field]) => {
        if (field.analysisGroup) {
            groups.add(field.analysisGroup);
        }
    });
    return Array.from(groups);
}

export function getRequiredFields(tableName: string): string[] {
    const table = tableMapping[tableName];
    if (!table) return [];
    
    return Object.entries(table.fields)
        .filter(([_, field]) => field.required)
        .map(([fieldName]) => fieldName);
}

export function getDisabledFields(tableName: string): string[] {
    const table = tableMapping[tableName];
    if (!table) return [];
    
    return Object.entries(table.fields)
        .filter(([_, field]) => field.disabled)
        .map(([fieldName]) => fieldName);
}

export function getHiddenFields(tableName: string): string[] {
    const table = tableMapping[tableName];
    if (!table) return [];
    
    return Object.entries(table.fields)
        .filter(([_, field]) => field.hidden)
        .map(([fieldName]) => fieldName);
}

export function getFieldDefaults(tableName: string): Record<string, any> {
    const table = tableMapping[tableName];
    if (!table) return {};
    
    const defaults: Record<string, any> = {};
    Object.entries(table.fields).forEach(([fieldName, field]) => {
        if (field.default !== undefined) {
            defaults[fieldName] = field.default;
        }
    });
    return defaults;
}

export function getFilterOptions(tableName: string, fieldName: string): Array<{ value: any; label: string }> | null {
    const table = tableMapping[tableName];
    if (!table) return null;
    const field = table.fields[fieldName];
    if (!field || !field.filterOptions) return null;
    return field.filterOptions;
}

export function getTableDisplayName(tableName: string): string {
    const table = tableMapping[tableName];
    if (!table) return tableName;
    return table.displayName;
}

export function getTableIcon(tableName: string): string | undefined {
    const table = tableMapping[tableName];
    if (!table) return undefined;
    return table.icon;
}

export function getAnalysisConfig(tableName: string): any {
    const table = tableMapping[tableName];
    if (!table) return null;
    return table.analysisConfig;
}

export function getDefaultFilters(tableName: string): Record<string, any> {
    const table = tableMapping[tableName];
    if (!table) return {};
    return table.defaultFilters || {};
}

export function getDefaultSort(tableName: string): { field: string; direction: 'ASC' | 'DESC' } {
    const table = tableMapping[tableName];
    if (!table) return { field: 'id', direction: 'DESC' };
    return table.defaultSort || { field: 'id', direction: 'DESC' };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a table configuration is a commons group (has grp property)
 */
export const isCommonsGroup = (config: TableMapping): boolean => {
    return config && typeof config.grp === 'number' && config.grp >= 1 && config.grp <= 21;
};

/**
 * Get all commons group configurations from table mapping
 */
export const getCommonsGroupConfigs = (): TableMapping[] => {
    const configs: TableMapping[] = [];
    
    for (const key in tableMapping) {
        const config = tableMapping[key];
        if (isCommonsGroup(config)) {
            configs.push(config);
        }
    }
    
    return configs;
};

/**
 * Get a commons group by grp number
 */
export const getCommonsGroupByGrp = (grp: number): TableMapping | undefined => {
    for (const key in tableMapping) {
        const config = tableMapping[key];
        if (isCommonsGroup(config) && config.grp === grp) {
            return config;
        }
    }
    return undefined;
};

/**
 * Get a commons group by table name
 */
export const getCommonsGroupByTableName = (tableName: string): TableMapping | undefined => {
    return tableMapping[tableName];
};

/**
 * Get all commons group IDs (grp values)
 */
export const getCommonsGroupIds = (): number[] => {
    const ids: number[] = [];
    
    for (const key in tableMapping) {
        const config = tableMapping[key];
        if (isCommonsGroup(config) && config.grp !== undefined) {
            ids.push(config.grp);
        }
    }
    
    return ids.sort((a, b) => a - b);
};

/**
 * Get all commons group names (displayName)
 */
export const getCommonsGroupNames = (): Record<number, string> => {
    const names: Record<number, string> = {};
    
    for (const key in tableMapping) {
        const config = tableMapping[key];
        if (isCommonsGroup(config) && config.grp !== undefined) {
            names[config.grp] = config.displayName || config.name || `Group ${config.grp}`;
        }
    }
    
    return names;
};

/**
 * Get mapping of table names to grp values
 */
export const getTableNameToGrpMap = (): Record<string, number> => {
    const map: Record<string, number> = {};
    
    for (const key in tableMapping) {
        const config = tableMapping[key];
        if (isCommonsGroup(config) && config.grp !== undefined) {
            map[key] = config.grp;
        }
    }
    
    return map;
};