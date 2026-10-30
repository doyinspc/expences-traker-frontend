import {mutationBody} from '../utils/functions/mutationBody';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { API_PATH_SETTING, axiosConfig, axiosConfig1, tokenHelpers } from '../actions/common';
import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================
// CONSTANT: Get tenant DB from sessionStorage or env
// ============================================
const getTenantDb = () => {
    return sessionStorage.getItem('tenantDb') || import.meta.env.VITE_APP_TENANT_DB || 'expences1';
};

// ============================================
// Toast notification functions using react-hot-toast
// ============================================
const showToast = (message, type = 'success', title = '') => {
    const styles = {
        success: {
            icon: '✅',
            style: {
                background: '#10B981',
                color: '#fff',
                fontWeight: '500',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
            },
        },
        error: {
            icon: '❌',
            style: {
                background: '#EF4444',
                color: '#fff',
                fontWeight: '500',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.35)',
            },
        },
    };

    const config = styles[type] || styles.success;
    
    // If title is provided, show it as bold text before the message
    const displayMessage = title ? `${title}\n${message}` : message;
    
    toast(displayMessage, {
        duration: 5000,
        position: 'bottom-center',
        style: config.style,
        icon: config.icon,
        className: 'custom-toast',
    });
};

const loadApi = async (table, queryType, mainParam, param, narration) => {
    const { cat: ignoredCat, ...readParams } = param || {};

    try {
        // Build the data object WITHOUT tenant_db in the JSON string
        const dataObj = { ...mainParam, ...readParams };
        
        const params = {
            data: JSON.stringify(dataObj),  // Only stringify the data object
            cat: queryType,
            table: table,
            narration: narration,
            timestamp: new Date().getTime(),
            tenant_db: getTenantDb(),  // tenant_db as a separate parameter, NOT stringified
        };
        
        //console.log('Request params:', params);  // Debug log
        
        const response = await axios.get(API_PATH_SETTING, { ...axiosConfig, params });
        if (response.data?.status === 'error' || response.data?.success === false) {
            throw new Error(response.data.message || 'The request failed.');
        }
        return response.data;
    } catch (error) {
        console.error('loadApi Error:', error);
        throw error;
    }
};

const updateApi = async (table, queryType, mainParam, param, narration) => {
    try {
        const body=mutationBody(table,queryType,mainParam,param,getTenantDb());
        const response = await axios.post(API_PATH_SETTING,body,body instanceof FormData?axiosConfig1:axiosConfig);
        if (response.data?.status === 'error' || response.data?.success === false) {
            throw new Error(response.data.message || 'The request failed.');
        }
        return response.data;
    } catch (error) {
        console.error('updateApi Error:', error);
        throw error;
    }
};

export default function useTanstackQuery(props) {
    const queryClient = useQueryClient();

    const { table, queryType, uniqueKey, mainParam, narration, onSuccess, onError, refetchInterval, enabled, autoLoad = true } = props;

    const [param, setParam] = useState({});
    const [isEnabled, setIsEnabled] = useState(enabled ?? autoLoad);

    const selected = useSelector(state => state.auth || {});
    const localSettings = table === 'commons' && ([30, 31, 51].includes(Number(mainParam?.grp)) || ['room', 'roomitems', 'service', 'serviceitems'].includes(uniqueKey));
    const queryScope = ['commons', 'company', 'locations'].includes(table) && !localSettings ? 'company' : [selected.location_id || 0, selected.role_id || 0];
    const queryKey = [table, queryScope, uniqueKey, getTenantDb(), tokenHelpers.getToken(), queryType, mainParam || {}, param || {}];

    // Holds the last single row (set by getOne or loadUpdate)
    const [row, setRow] = useState(null);

    const {
        data,
        isLoading,
        isFetching,
        isPending,
        refetch: refetchQuery,
        error: queryError,
        status,
    } = useQuery({
        queryKey,
        queryFn: async () => loadApi(table, queryType, mainParam, param, narration),
        refetchInterval: refetchInterval && refetchInterval > 0 ? refetchInterval : 1000 * 60 * 10,
        onError: (error) => {
            console.error('Query Error:', error);
            if (onError) {
                onError(error);
            }
        },
        enabled: isEnabled,
    });

    const {
        mutateAsync,
        isSuccess,
        isPending: isLoadingUpdate,
        isError,
        error,
    } = useMutation({
        mutationFn: async (param) => updateApi(table, param.cat || 'insert', mainParam, param, narration),
        onSuccess: (responseDatas, variables) => {
            let responseData = responseDatas?.data || {};
            const cat = variables?.cat || "insert";
            const id = variables?.id || null;
            const act = variables?.act || null;

            // ============================================
            // Surface the affected row as `row` for ALL actions:
            // insert, update, delete — as long as we got a usable object
            // ============================================
            const rowPayload = responseData?.data ?? responseData;

            if (rowPayload && !Array.isArray(rowPayload) && typeof rowPayload === 'object') {
                // insert / update → single object returned
                setRow(rowPayload);
            } else if (Array.isArray(rowPayload) && rowPayload.length > 0) {
                // insert / update → array returned, take the match by id or first
                const match =
                    rowPayload.find((r) => String(r.id) === String(id ?? rowPayload[0]?.id)) ??
                    rowPayload[0];
                setRow(match);
            } else if (cat.includes('delete') && id) {
                // delete → clear the current row if it was the one removed
                setRow((prev) => (prev && String(prev.id) === String(id) ? null : prev));
            } else {
                // fallback: keep whatever is already in cache as `row`
                const cached = queryClient.getQueryData(queryKey);
                const payload = cached?.data ?? cached;
                if (Array.isArray(payload) && id) {
                    const match = payload.find((r) => String(r.id) === String(id)) ?? null;
                    setRow(match);
                }
            }

            // ============================================
            // UNCHANGED: cache update (insert / update / delete)
            // ============================================
            queryClient.invalidateQueries({ queryKey: [table] });
            if (table === 'approvalcenter' || table === 'requisitions') queryClient.invalidateQueries({ queryKey: ['controlcenter'] });

            // Success toast with react-hot-toast
            const action = cat.includes('insert') && id == null ? 'Created' : cat.includes('update') ? 'Updated' : cat.includes('delete') || act == 3 ? 'Deleted' : 'Processed';
            showToast(`Data ${action.toLowerCase()} successfully!`, 'success', `${action} ✓`);
            
            if (Number(responseDatas?.notifications?.failed) > 0) {
                toast('Saved, but an email notification could not be delivered. Please contact your administrator.', { icon: '⚠️', duration: 7000 });
            }

            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error) => {
            // Error toast with react-hot-toast
            showToast(error.response?.data?.message || error.message || 'Failed to update data. Please try again.', 'error', 'Error ✕');
            
            if (onError) {
                onError(error);
            }
        },
    });

    const killQuery = () => {
        setIsEnabled(false);
        queryClient.removeQueries({ queryKey: [table, queryScope, uniqueKey] });
        setParam({});
    };

    const loadQuery = (newParam = {}) => {
        setParam(newParam);
        setIsEnabled(true);
    };

    // ============================================
    // LOAD UPDATE: mutate + always set `row`
    // Cache update (insert / update / delete) is handled inside the mutation's onSuccess
    // ============================================
    const loadUpdate = async (newParam) => {
        const result = await mutateAsync(newParam);
        const cat = newParam?.cat || 'insert';
        const id = newParam?.id ?? null;

        const payload = result?.data ?? result;

        if (payload && !Array.isArray(payload) && typeof payload === 'object') {
            // insert / update → single row object
            setRow(payload);
        } else if (Array.isArray(payload) && payload.length > 0) {
            // array response → pick the matching id, else first
            const match =
                payload.find((r) => String(r.id) === String(id)) ?? payload[0];
            setRow(match);
        } else if (cat.includes('delete') && id) {
            setRow((prev) => (prev && String(prev.id) === String(id) ? null : prev));
        }

        return result;
    };

    const refetch = () => {
        refetchQuery();
    };

    // ============================================
    // GET ONE: read a single row from cached state
    // Also sets `row` so it can be destructured from the hook
    // Returns { row: <object|null> }
    // ============================================
    const getOne = (id) => {
        // Prefer live cache, fall back to the hook's `data`
        const cached = queryClient.getQueryData(queryKey) ?? data;

        let match = null;

        if (cached) {
            const payload = cached?.data ?? cached;

            if (Array.isArray(payload)) {
                match = payload.find((r) => String(r.id) === String(id)) ?? null;
            } else if (payload && typeof payload === 'object') {
                match = String(payload.id) === String(id) ? payload : null;
            }
        }

        setRow(match);
        return { row: match };
    };

    return {
        data,
        isLoading,
        isLoadingUpdate,
        isProcessing: isLoadingUpdate,
        isSuccess,
        isError,
        isFetching,
        isPending,
        error: queryError || error,
        status,
        killQuery,
        loadQuery,
        loadUpdate,
        refetch,
        getOne,
        row,
    };
}