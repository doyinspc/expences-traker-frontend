import { createRecordAnalysis, analysisFlag } from './recordAnalysis';
// src/utils/dataHelpers.ts

import { getFormFields } from '../../config/tableMapping';

// ==================== PROCESS ROWS ====================
export const processRows = (data: any[], tableName: string): any[] => {
    if (!Array.isArray(data)) return [];

    const fields = getFormFields(tableName);
    if (!fields) return data;

    return data.map((element: any) => {
        const processed = { ...element };

        Object.entries(fields).forEach(([fieldName, field]) => {
            // Process select fields for display
            if (field.type === 'select' && element[fieldName] !== undefined) {
                const value = element[fieldName];
                if (field.tableFormat) {
                    processed[`${fieldName}_display`] = field.tableFormat(value);
                }
            }

            // Format dates
            if ((field.type === 'date' || field.type === 'datetime') && element[fieldName]) {
                const date = new Date(element[fieldName]);
                if (!isNaN(date.getTime())) {
                    if (field.tableFormat) {
                        processed[`${fieldName}_formatted`] = field.tableFormat(element[fieldName]);
                    } else {
                        processed[`${fieldName}_formatted`] = date.toLocaleString();
                    }
                }
            }

            // Format numbers
            if (field.type === 'number' && element[fieldName] !== undefined) {
                if (field.tableFormat) {
                    processed[`${fieldName}_formatted`] = field.tableFormat(element[fieldName]);
                }
            }
        });

        return processed;
    });
};

// ==================== FILTER DATA ====================
export const filterData = (
    rows: any[], 
    filters: Record<string, any>, 
    searchTerm: string, 
    filterConfig: any
): any[] => {
    if (!Array.isArray(rows)) return [];
    
    return rows.filter(item => {
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const match = Object.values(item).some(value => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(searchLower);
            });
            if (!match) return false;
        }

        // Apply field filters from filterConfig
        for (const [key, value] of Object.entries(filters)) {
            if (value === undefined || value === null || value === '') continue;
            if (item[key] === undefined || item[key] === null) return false;
            
            const filterField = filterConfig?.filterableFields?.find((f: any) => f.name === key);
            if (filterField) {
                switch (filterField.type) {
                    case 'select':
                        if (String(item[key]) !== String(value)) return false;
                        break;
                    case 'boolean':
                        if (analysisFlag(item[key]) === null || analysisFlag(item[key]) !== analysisFlag(value)) return false;
                        break;
                    case 'number':
                        const numValue = parseFloat(value);
                        if (isNaN(numValue) || Number(item[key]) !== numValue) return false;
                        break;
                    case 'date':
                        if (new Date(item[key]) < new Date(value)) return false;
                        break;
                    case 'range':
                        if (value.min && item[key] < value.min) return false;
                        if (value.max && item[key] > value.max) return false;
                        break;
                    default:
                        if (!String(item[key]).toLowerCase().includes(String(value).toLowerCase())) {
                            return false;
                        }
                }
            } else {
                if (typeof value === 'string' && !String(item[key]).toLowerCase().includes(value.toLowerCase())) {
                    return false;
                } else if (item[key] !== value) {
                    return false;
                }
            }
        }

        return true;
    });
};

// ==================== ANALYSIS DATA ====================
export const generateAnalysisData = (
    filteredRows: any[],
    analysisConfig: any,
    analysisGroupBy: string,
    analysisMetric: string,
    availableDimensions: string[],
    availableMetrics: string[],
    tableName: string
): any => {
    if (!analysisConfig?.enabled) return null;
    const fields = getFormFields(tableName);
    if (!fields) return null;
    return createRecordAnalysis(filteredRows, {tableName,fields,groups:availableDimensions,metrics:availableMetrics,defaultGroup:analysisConfig.defaultGroupBy,defaultMetric:analysisConfig.defaultMetric}, analysisGroupBy, analysisMetric);
};

// ==================== COUNT ACTIVE FILTERS ====================
export const countActiveFilters = (filters: Record<string, any>, searchTerm: string): number => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            count++;
        }
    });
    if (searchTerm) count++;
    return count;
};