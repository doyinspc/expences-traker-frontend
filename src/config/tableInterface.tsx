export interface FormField {
    label: string;
    placeholder?: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'toggle' | 'date' | 'datetime' | 'phone' | 'file' | 'json' | 'password';
    required?: boolean;
    disabled?: boolean;
    options?: string;
    description?: string;
    icon?: string;
    accept?: string;
    hidden?: boolean;
    default?: any;
    min?: number;
    max?: number;
    step?: number;
    // Table display options
    showInTable?: boolean;
    showInForm?: boolean;
    tableWidth?: string;
    tableAlign?: 'left' | 'center' | 'right';
    tableFormat?: (value: any) => string;
    // Filter options
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'range';
    filterOptions?: Array<{ value: any; label: string }>;
    // Analysis options
    analyzable?: boolean;
    analysisType?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'group' | 'percentage' | 'trend';
    analysisGroup?: string;
    // Validation
    validation?: {
        pattern?: RegExp;
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
        custom?: (value: any) => boolean;
        message?: string;
    };
}

export interface TableMapping {
    frontendRoutes: string[];
    grp:number | null;
    description: string;
    form: string | null;
    tableName: string;
    displayName: string;
    icon?: string;
    // Filter configuration
    defaultFilters?: Record<string, any>;
    defaultSort?: { field: string; direction: 'ASC' | 'DESC' };
    // Analysis configuration
    analysisConfig?: {
        enabled: boolean;
        defaultGroupBy?: string;
        defaultMetric?: string;
        chartTypes?: string[];
        availableMetrics?: string[];
        availableDimensions?: string[];
    };
    fields: Record<string, FormField>;
}

export interface TableMappingMap {
    [tableName: string]: TableMapping;
}