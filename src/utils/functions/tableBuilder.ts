// src/utils/tableBuilder.ts

import { getFormFields, getTableMapping } from '../../config/tableMapping';
import { createColumnHelper } from '@tanstack/react-table';
import React from 'react';

// ==================== TYPES ====================

export interface TableColumn {
    label: string;
    name: string;
    type: string;
    showForm: boolean;
    showTable: boolean;
    editable: boolean;
    element: React.ReactNode | ((props: any) => any) | null; // FIXED: Allow function or null
    isSelect?: boolean;
    options?: string;
    isToggle?: boolean;
    isDisabled?: boolean;
    required?: boolean;
    description?: string;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    format?: (value: any) => string;
}

export interface FilterConfig {
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'range';
    options?: Array<{ value: any; label: string }>;
}

export interface TableFilterConfig {
    defaultFilters: Record<string, any>;
    defaultSort: { field: string; direction: 'ASC' | 'DESC' };
    filterableFields: FilterConfig[];
}

export interface AnalysisConfig {
    enabled: boolean;
    defaultGroupBy?: string;
    defaultMetric?: string;
    chartTypes?: string[];
    availableMetrics?: string[];
    availableDimensions?: string[];
}

// ==================== TYPE GUARDS ====================

interface FormField {
    label: string;
    placeholder?: string;
    type: string;
    required?: boolean;
    disabled?: boolean;
    options?: string;
    description?: string;
    icon?: string;
    accept?: string;
    hidden?: boolean;
    default?: any;
    showInTable?: boolean;
    tableWidth?: string | number;
    tableAlign?: 'left' | 'center' | 'right';
    tableFormat?: (value: any) => string;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'range';
    filterOptions?: Array<{ value: any; label: string }>;
    analyzable?: boolean;
    analysisType?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'group' | 'percentage' | 'trend';
    analysisGroup?: string;
}

function isFormField(field: any): field is FormField {
    return field && typeof field === 'object' && 'label' in field && 'type' in field;
}

// ==================== CORE FUNCTIONS ====================

/**
 * Build table columns from tableMapping configuration
 */
export const buildTableDataFromMapping = (tableName: string): TableColumn[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];

    const tableData: TableColumn[] = [];

    // Add ID field (hidden)
    tableData.push({
        label: 'ID',
        name: 'id',
        type: 'text',
        showForm: false,
        showTable: false,
        editable: true,
        element: null,
    });

    // Build fields from table mapping
    Object.entries(fields).forEach(([fieldName, field]) => {
        // Skip if not a valid form field
        if (!isFormField(field)) return;
        
        // Skip hidden fields
        if (field.hidden) return;

        // Determine if field should show in table
        const showTable = field.showInTable !== undefined 
            ? field.showInTable 
            : (field.type !== 'toggle' && field.type !== 'file' && field.type !== 'json' && field.type !== 'textarea');

        // Determine if field should show in form
        const showForm = true;

        // Map field type to table display type
        let tableType = 'text';
        if (field.type === 'number') tableType = 'number';
        if (field.type === 'toggle') tableType = 'boolean';
        if (field.type === 'date' || field.type === 'datetime') tableType = 'date';

        // For select fields, we'll show the display value in table
        const isSelect = field.type === 'select';

        // Build element for table cell rendering
        let element: React.ReactNode | ((props: any) => any) | null = null; // FIXED: Explicit type
        if (isSelect || field.type === 'toggle') {
            element = null;
        } else if (field.type === 'number') {
            element = (props: any) => ({ ...props, type: 'number' });
        } else if (field.type === 'email') {
            element = (props: any) => ({ ...props, type: 'email' });
        } else {
            element = (props: any) => props;
        }

        // Get width (convert string to number if needed)
        let width: string | number = field.tableWidth || 'auto'; // FIXED: Explicit type
        if (typeof width === 'string' && width !== 'auto') {
            const parsed = parseInt(width, 10);
            width = isNaN(parsed) ? 'auto' : parsed;
        }

        tableData.push({
            label: field.label,
            name: fieldName,
            type: tableType,
            showForm: showForm,
            showTable: showTable,
            editable: !field.disabled && field.type !== 'toggle',
            element: element,
            isSelect: isSelect,
            options: field.options,
            isToggle: field.type === 'toggle',
            isDisabled: field.disabled || false,
            required: field.required || false,
            description: field.description || '',
            width: width,
            align: field.tableAlign || 'left',
            format: field.tableFormat || undefined,
        });
    });

    return tableData;
};

/**
 * Build TanStack Table columns from table mapping
 * This is the bridge between tableBuilder and columnBuilder
 */
export const buildTanStackColumns = (
    tableName: string, 
    actions: any = null, 
    showSelect: boolean = false,
    tableWidth: any = null
) => {
    // Get the table data from mapping
    const tableData = buildTableDataFromMapping(tableName);
    const tableAction = actions?.table_action || null;
    const columnHelper = createColumnHelper();

    // 1. Select column
    const sel = columnHelper.display({
        id: 'select-col',
        size: tableWidth?.select ?? 1,
        header: ({ table }) => {
            return React.createElement('input', {
                type: 'checkbox',
                className: 'form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded-sm',
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
            });
        },
        cell: ({ row }) => React.createElement('input', {
            type: 'checkbox',
            className: 'form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded-sm',
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            onChange: row.getToggleSelectedHandler(),
        }),
    });

    // 2. Serial Number column - FIXED WIDTH WITH FORCED STYLING
    const snWidth = 40; // Fixed width in pixels
    const nm = columnHelper.display({
        id: 'sn',
        header: () => {
            return React.createElement('div', {
                style: {
                    width: `${snWidth}px`,
                    minWidth: `${snWidth}px`,
                    maxWidth: `${snWidth}px`,
                    textAlign: 'center',
                    display: 'inline-block',
                    flexShrink: 0,
                    flexGrow: 0,
                }
            }, 'SN');
        },
        meta: {
            style: {
                textAlign: 'center',
                width: `${snWidth}px`,
                minWidth: `${snWidth}px`,
                maxWidth: `${snWidth}px`,
                flexShrink: 0,
                flexGrow: 0,
            }
        },
        size: snWidth,
        minSize: snWidth,
        maxSize: snWidth,
        cell: ({ row }) => {
            return React.createElement('div', {
                style: {
                    width: `${snWidth}px`,
                    minWidth: `${snWidth}px`,
                    maxWidth: `${snWidth}px`,
                    textAlign: 'center',
                    flexShrink: 0,
                    flexGrow: 0,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }
            }, row.index + 1);
        },
    });

    let columns: any[] = []; // FIXED: Explicitly typed as any[]

    // Add select column if enabled
    if (showSelect === true) {
        columns.push(sel);
    }

    // Add SN column
    columns.push(nm);

    // 3. Data columns from mapping
    tableData.forEach((element) => {
        if (element.showTable) {
            // Check if width is specified for this specific column
            let columnSize = 1;
            if (tableWidth?.columns && tableWidth.columns[element.name]) {
                columnSize = tableWidth.columns[element.name];
            } else if (element.width && element.width !== 'auto') {
                columnSize = typeof element.width === 'number' ? element.width : 1;
            }

            let row = columnHelper.accessor(element.name.toString(), {
                id: element.name.toString(),
                header: element.label,
                meta: { 
                    ...element,
                    align: element.align || 'left' 
                },
                size: columnSize,
                cell: element.format 
    ? (props: any) => {
        const { getValue } = props;
        const value = getValue();
        // Type guard to ensure format exists
        if (typeof element.format === 'function') {
            return element.format(value);
        }
        return value;
    }
    : ({ getValue }: any) => getValue(),
            });
            columns.push(row);
        }
    });

    // 4. Action column
    if (actions && tableAction) {
        const actionCol = columnHelper.display({
            id: 'action',
            header: 'Actions',
            size: tableWidth?.action ?? 2,
            cell: ({ row }) => {
                if (!tableAction) return null; // FIXED: Added null check
                return tableAction({ row: row.original, ...actions });
            },
        });
        columns.push(actionCol);
    }

    return columns;
};

/**
 * Build column visibility configuration for tables
 */
export const buildColumnVisibility = (tableName: string): Record<string, boolean> => {
    const fields = getFormFields(tableName);
    if (!fields) return {};

    const visibility: Record<string, boolean> = {};
    
    // Always hide ID
    visibility['id'] = false;
    
    // Check if we have fields from mapping
    Object.entries(fields).forEach(([fieldName, field]) => {
        if (!isFormField(field)) return;
        
        // Hide hidden fields
        if (field.hidden) {
            visibility[fieldName] = false;
            return;
        }
        
        // Hide select fields (we show _display versions)
        if (field.type === 'select') {
            visibility[fieldName] = false;
            return;
        }
        
        // Hide textarea fields from table
        if (field.type === 'textarea') {
            visibility[fieldName] = false;
            return;
        }
        
        // Hide file fields from table
        if (field.type === 'file') {
            visibility[fieldName] = false;
            return;
        }
        
        // Hide JSON fields from table
        if (field.type === 'json') {
            visibility[fieldName] = false;
            return;
        }
        
        // For all other fields, use showInTable config or default to true
        if (field.showInTable !== undefined) {
            visibility[fieldName] = field.showInTable;
        } else {
            visibility[fieldName] = true;
        }
    });

    return visibility;
};

/**
 * Get columns that should be displayed in table (excluding hidden ones)
 */
export const getVisibleTableColumns = (tableName: string): TableColumn[] => {
    const columns = buildTableDataFromMapping(tableName);
    const visibility = buildColumnVisibility(tableName);
    
    return columns.filter(col => {
        // If column is specifically set to false in visibility, hide it
        if (visibility[col.name] === false) return false;
        // If column's showTable is false, hide it
        if (!col.showTable) return false;
        return true;
    });
};

/**
 * Get columns that should be displayed in form (excluding hidden ones)
 */
export const getVisibleFormFields = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];

    return Object.entries(fields)
        .filter(([_, field]) => {
            if (!isFormField(field)) return false;
            return !field.hidden;
        })
        .map(([fieldName]) => fieldName);
};

/**
 * Get display name for a field (for table headers)
 */
export const getFieldDisplayName = (tableName: string, fieldName: string): string => {
    const fields = getFormFields(tableName);
    if (!fields) return fieldName;
    
    const field = fields[fieldName];
    if (!isFormField(field)) return fieldName;
    
    return field.label || fieldName;
};

/**
 * Format a value based on field configuration
 */
export const formatFieldValue = (tableName: string, fieldName: string, value: any): string => {
    const fields = getFormFields(tableName);
    if (!fields) return String(value);
    
    const field = fields[fieldName];
    if (!isFormField(field)) return String(value);
    
    if (field.tableFormat) {
        return field.tableFormat(value);
    }
    
    // Default formatting based on type
    if (field.type === 'date' || field.type === 'datetime') {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        return date.toLocaleString();
    }
    
    if (field.type === 'number') {
        if (value === undefined || value === null || value === '') return '';
        const num = parseFloat(value);
        if (isNaN(num)) return String(value);
        return num.toFixed(2);
    }
    
    if (field.type === 'toggle') {
        return value ? 'Yes' : 'No';
    }
    
    return String(value);
};

/**
 * Get filter configuration for a table
 */
export const getTableFilterConfig = (tableName: string): TableFilterConfig | null => {
    const table = getTableMapping(tableName);
    if (!table) return null;
    
    const filterableFields: FilterConfig[] = [];
    
    Object.entries(table.fields).forEach(([fieldName, field]) => {
        if (!isFormField(field)) return;
        if (field.filterable) {
            filterableFields.push({
                name: fieldName,
                label: field.label,
                type: field.filterType || 'text',
                options: field.filterOptions || [],
            });
        }
    });
    
    return {
        defaultFilters: table.defaultFilters || {},
        defaultSort: table.defaultSort || { field: 'id', direction: 'DESC' },
        filterableFields: filterableFields,
    };
};

/**
 * Get analysis configuration for a table
 */
export const getTableAnalysisConfig = (tableName: string): AnalysisConfig | null => {
    const table = getTableMapping(tableName);
    if (!table) return null;
    
    return table.analysisConfig || null;
};

/**
 * Get table display name
 */
export const getTableDisplayName = (tableName: string): string => {
    const table = getTableMapping(tableName);
    if (!table) return tableName;
    return table.displayName || tableName;
};

/**
 * Get table icon
 */
export const getTableIcon = (tableName: string): string | undefined => {
    const table = getTableMapping(tableName);
    if (!table) return undefined;
    return table.icon;
};

/**
 * Get default sort configuration
 */
export const getDefaultSort = (tableName: string): { field: string; direction: 'ASC' | 'DESC' } => {
    const table = getTableMapping(tableName);
    if (!table) return { field: 'id', direction: 'DESC' };
    return table.defaultSort || { field: 'id', direction: 'DESC' };
};

/**
 * Get default filters
 */
export const getDefaultFilters = (tableName: string): Record<string, any> => {
    const table = getTableMapping(tableName);
    if (!table) return {};
    return table.defaultFilters || {};
};

/**
 * Check if a field is sortable
 */
export const isFieldSortable = (tableName: string, fieldName: string): boolean => {
    const fields = getFormFields(tableName);
    if (!fields) return false;
    
    const field = fields[fieldName];
    if (!isFormField(field)) return false;
    
    // Don't allow sorting on certain field types
    if (field.type === 'toggle') return false;
    if (field.type === 'file') return false;
    if (field.type === 'json') return false;
    if (field.type === 'textarea') return false;
    if (field.hidden) return false;
    
    return true;
};

/**
 * Get available sort fields for a table
 */
export const getSortableFields = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];
    
    return Object.entries(fields)
        .filter(([_, field]) => {
            if (!isFormField(field)) return false;
            if (field.hidden) return false;
            if (field.type === 'toggle') return false;
            if (field.type === 'file') return false;
            if (field.type === 'json') return false;
            if (field.type === 'textarea') return false;
            return true;
        })
        .map(([fieldName]) => fieldName);
};

/**
 * Get available filter fields for a table
 */
export const getFilterableFields = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];
    
    return Object.entries(fields)
        .filter(([_, field]) => {
            if (!isFormField(field)) return false;
            return field.filterable;
        })
        .map(([fieldName]) => fieldName);
};

/**
 * Get available analysis fields for a table
 */
export const getAnalyzableFields = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];
    
    return Object.entries(fields)
        .filter(([_, field]) => {
            if (!isFormField(field)) return false;
            return field.analyzable;
        })
        .map(([fieldName]) => fieldName);
};

/**
 * Get analysis groups for a table
 */
export const getAnalysisGroups = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];
    
    const groups = new Set<string>();
    Object.entries(fields).forEach(([_, field]) => {
        if (!isFormField(field)) return;
        if (field.analysisGroup) {
            groups.add(field.analysisGroup);
        }
    });
    return Array.from(groups);
};

/**
 * Get all required fields for a table
 */
export const getRequiredFields = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];
    
    return Object.entries(fields)
        .filter(([_, field]) => {
            if (!isFormField(field)) return false;
            return field.required;
        })
        .map(([fieldName]) => fieldName);
};

/**
 * Get all disabled fields for a table
 */
export const getDisabledFields = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];
    
    return Object.entries(fields)
        .filter(([_, field]) => {
            if (!isFormField(field)) return false;
            return field.disabled;
        })
        .map(([fieldName]) => fieldName);
};

/**
 * Get all hidden fields for a table
 */
export const getHiddenFields = (tableName: string): string[] => {
    const fields = getFormFields(tableName);
    if (!fields) return [];
    
    return Object.entries(fields)
        .filter(([_, field]) => {
            if (!isFormField(field)) return false;
            return field.hidden;
        })
        .map(([fieldName]) => fieldName);
};

/**
 * Get field options for a select field
 */
export const getFieldOptions = (tableName: string, fieldName: string): Array<{ value: any; label: string }> | null => {
    const fields = getFormFields(tableName);
    if (!fields) return null;
    
    const field = fields[fieldName];
    if (!isFormField(field)) return null;
    if (!field.options) return null;
    
    // This would need to import OPTION_DATA from the config
    // For now, return null and let the caller handle it
    return null;
};

/**
 * Check if a table has analysis enabled
 */
export const hasAnalysisEnabled = (tableName: string): boolean => {
    const config = getTableAnalysisConfig(tableName);
    if (!config) return false;
    return config.enabled || false;
};

/**
 * Get available metrics for analysis
 */
export const getAvailableMetrics = (tableName: string): string[] => {
    const config = getTableAnalysisConfig(tableName);
    if (!config) return [];
    return config.availableMetrics || [];
};

/**
 * Get available dimensions for analysis
 */
export const getAvailableDimensions = (tableName: string): string[] => {
    const config = getTableAnalysisConfig(tableName);
    if (!config) return [];
    return config.availableDimensions || [];
};

/**
 * Get initial column visibility for a table
 */
export const getInitialColumnVisibility = (tableName: string): Record<string, boolean> => {
    const fields = getFormFields(tableName);
    if (!fields) return {};

    const visibility: Record<string, boolean> = {};
    
    Object.entries(fields).forEach(([fieldName, field]) => {
        if (!isFormField(field)) return;
        
        // Only show columns that are meant to be shown in table
        if (field.showInTable === false) {
            visibility[fieldName] = false;
        } else if (field.type === 'select' || field.type === 'file' || field.type === 'json' || field.type === 'textarea') {
            visibility[fieldName] = false;
        } else {
            visibility[fieldName] = true;
        }
    });
    
    // Always hide ID
    visibility['id'] = false;
    
    return visibility;
};

/**
 * Get the table schema for API calls
 */
export const getTableSchema = (tableName: string): Record<string, any> => {
    const fields = getFormFields(tableName);
    if (!fields) return {};

    const schema: Record<string, any> = {};
    
    Object.entries(fields).forEach(([fieldName, field]) => {
        if (!isFormField(field)) return;
        
        schema[fieldName] = {
            type: field.type,
            required: field.required || false,
            disabled: field.disabled || false,
            options: field.options || null,
            description: field.description || '',
        };
    });
    
    return schema;
};

/**
 * Get table primary key
 */
export const getTablePrimaryKey = (tableName: string): string => {
    const table = getTableMapping(tableName);
    if (!table) return 'id';
    return 'id';
};

// ==================== EXPORT ====================

export default {
    buildTableDataFromMapping,
    buildTanStackColumns,
    buildColumnVisibility,
    getVisibleTableColumns,
    getVisibleFormFields,
    getFieldDisplayName,
    formatFieldValue,
    getTableFilterConfig,
    getTableAnalysisConfig,
    getTableDisplayName,
    getTableIcon,
    getDefaultSort,
    getDefaultFilters,
    isFieldSortable,
    getSortableFields,
    getFilterableFields,
    getAnalyzableFields,
    getAnalysisGroups,
    getRequiredFields,
    getDisabledFields,
    getHiddenFields,
    getFieldOptions,
    hasAnalysisEnabled,
    getAvailableMetrics,
    getAvailableDimensions,
    getInitialColumnVisibility,
    getTableSchema,
    getTablePrimaryKey,
};