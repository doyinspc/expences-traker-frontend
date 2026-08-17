// ==================== HELPER FUNCTIONS ====================

export function getFormFields(tableName: string): Record<string, FormField> | null {
    const table = tableMapping[tableName];
    if (!table) return null;
    return table.fields;
}

export function getTableMapping(tableName: string): TableMapping | null {
    return tableMapping[tableName] || null;
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