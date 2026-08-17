// src/hooks/useCommonsData.ts

import { useReduxApiData } from './useReduxApiData';
import { 
    getCommonsGroupByGrp, 
    getCommonsGroupNames,
    getCommonsGroupIds,
    isCommonsGroup
} from '../config/tableMapping';

interface UseCommonsDataOptions {
    // Primary filters
    grp?: number;
    parent_id?: number;
    
    // Secondary filters
    id?: number;
    is_active?: boolean | number;
    sort_order?: 'ASC' | 'DESC';
    
    // Additional params (merged with main)
    additionalParams?: Record<string, any>;
    
    // Behavior
    autoLoad?: boolean;
    narration?: string;
    
    // Query type (get single or multiple)
    queryType?: 'gets' | 'get';
}

interface UseCommonsDataReturn {
    data: any[];
    loadQuery: () => void;
    isLoading: boolean;
    error: any;
    refresh: () => void;
    groupName: string;
    config: any;
}

/**
 * Enhanced hook to fetch data from commons table
 * Supports filtering by grp and/or parent_id
 * 
 * @example
 * // Fetch all roles (grp=1)
 * const { data: roles } = useCommonsData({ grp: 1 });
 * 
 * // Fetch workflow steps for a specific workflow (parent_id)
 * const { data: steps } = useCommonsData({ parent_id: 123 });
 * 
 * // Fetch steps for a specific workflow and grp
 * const { data: steps } = useCommonsData({ grp: 21, parent_id: 123 });
 * 
 * // Fetch a single item by ID
 * const { data: item } = useCommonsData({ id: 456, queryType: 'get' });
 */
export const useCommonsData = (options: UseCommonsDataOptions): UseCommonsDataReturn => {
    const {
        grp,
        parent_id,
        id,
        is_active = 1,
        sort_order = 'ASC',
        additionalParams = {},
        autoLoad = true,
        narration,
        queryType = 'gets',
    } = options;

    // Get group configuration from tableMapping
    const config = grp ? getCommonsGroupByGrp(grp) : null;
    const groupName = config?.displayName || config?.name || (grp ? `Group ${grp}` : 'Commons Data');
    const defaultNarration = narration || `Fetching ${groupName}${parent_id ? ` (parent: ${parent_id})` : ''}`;

    // Build the main params
    const mainParam: Record<string, any> = {
        ...additionalParams,
    };

    // Add filters if provided
    if (grp !== undefined) {
        mainParam.grp = grp;
    }
    
    if (parent_id !== undefined) {
        mainParam.parent_id = parent_id;
    }
    
    if (id !== undefined) {
        mainParam.id = id;
    }
    
    if (is_active !== undefined) {
        mainParam.is_active = typeof is_active === 'boolean' ? (is_active ? 1 : 0) : is_active;
    }
    
    if (sort_order && !id) {
        mainParam.sort_order = sort_order;
    }

    const { data, loadQuery, isLoading, error } = useReduxApiData({
        table: "commons",
        pth: 'common',
        queryType: queryType,
        mainParam: mainParam,
        narration: defaultNarration,
        autoLoad: autoLoad,
    });

    return {
        data: data || [],
        loadQuery,
        isLoading,
        error,
        refresh: loadQuery,
        groupName,
        config,
    };
};

/**
 * Hook to fetch workflow steps for a specific workflow
 * Convenience wrapper around useCommonsData
 */
export const useWorkflowSteps = (workflowId: number, options?: Omit<UseCommonsDataOptions, 'grp' | 'parent_id'>) => {
    return useCommonsData({
        grp: 21, // Workflow Steps
        parent_id: workflowId,
        ...options,
    });
};

/**
 * Hook to fetch children of a parent
 */
export const useCommonsChildren = (parentId: number, grp?: number, options?: Omit<UseCommonsDataOptions, 'parent_id' | 'grp'>) => {
    return useCommonsData({
        parent_id: parentId,
        grp: grp,
        ...options,
    });
};

/**
 * Hook to fetch a single commons item by ID
 */
export const useCommonsItem = (id: number, options?: Omit<UseCommonsDataOptions, 'id' | 'queryType'>) => {
    return useCommonsData({
        id: id,
        queryType: 'gets',
        ...options,
    });
};

/**
 * Hook to fetch data by table name (auto-detects grp)
 */
export const useCommonsDataByTableName = (
    tableName: string, 
    options: Omit<UseCommonsDataOptions, 'grp'>
) => {
    const config = getCommonsGroupByTableName(tableName);
    
    if (!config || !isCommonsGroup(config)) {
        throw new Error(`Table "${tableName}" is not a valid commons group`);
    }
    
    return useCommonsData({
        grp: config.grp!,
        ...options,
    });
};