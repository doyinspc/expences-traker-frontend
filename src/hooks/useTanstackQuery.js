import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { API_PATH_SETTING, axiosConfig, axiosConfig1, MAIN_TOKEN } from '../actions/common';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

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
    if (param && param.hasOwnProperty('cat')) {
        delete param['cat'];
    }

    try {
        // Build the data object WITHOUT tenant_db in the JSON string
        const dataObj = { ...mainParam, ...param };
        
        const params = {
            data: JSON.stringify(dataObj),  // Only stringify the data object
            cat: queryType,
            table: table,
            narration: narration,
            timestamp: new Date().getTime(),
            token: MAIN_TOKEN,
            tenant_db: getTenantDb(),  // tenant_db as a separate parameter, NOT stringified
        };
        
        //console.log('Request params:', params);  // Debug log
        
        const response = await axios.get(API_PATH_SETTING, { params }, axiosConfig);
        return response.data;
    } catch (error) {
        console.error('loadApi Error:', error);
        throw error;
    }
};

const updateApi = async (table, queryType, mainParam, param, narration) => {
    try {
        const formData = new FormData();
        formData.append('table', table);
        formData.append('tenant_db', getTenantDb());  // tenant_db as form data
        
        if (param.hasOwnProperty('cat')) {
            formData.append('cat', param['cat']);
            delete param['cat'];
        } else {
            formData.append('cat', "insert");
        }

        // Append main parameters
        Object.keys(mainParam).forEach((key) => formData.append(key, mainParam[key]));

        // Handle parameters and specifically check for the binary file
        Object.keys(param).forEach((key) => {
            if (key === 'file' && param[key]) {
                // Append the raw File/Blob object directly
                formData.append('file', param[key]);
            } else {
                formData.append(key, param[key]);
            }
        });
    
        const response = await axios.post(API_PATH_SETTING, formData, axiosConfig1);
        return response.data;
    } catch (error) {
        console.error('updateApi Error:', error);
        throw error;
    }
};

export default function useTanstackQuery(props) {
    const queryClient = useQueryClient();

    const { table, queryType, uniqueKey, mainParam, narration, onSuccess, onError, refetchInterval, enabled } = props;

    const [param, setParam] = useState({});
    const [isEnabled, setIsEnabled] = useState(enabled);

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
        queryKey: [table, uniqueKey],
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
        isLoading: isLoadingUpdate,
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
                const cached = queryClient.getQueryData([table, uniqueKey]);
                const payload = cached?.data ?? cached;
                if (Array.isArray(payload) && id) {
                    const match = payload.find((r) => String(r.id) === String(id)) ?? null;
                    setRow(match);
                }
            }

            // ============================================
            // UNCHANGED: cache update (insert / update / delete)
            // ============================================
            if (cat && data) {
                queryClient.setQueryData([table, uniqueKey], (oldData) => {
                    let currentData = Array.isArray(oldData) ? oldData : [];

                    if (cat.includes('insert') && responseData && responseData.id) {
                        if (currentData.some(row => row.id == id)) {
                            currentData = currentData.map(row =>
                                row.id === responseData.id ? responseData : row
                            );
                            return currentData;
                        } else {
                            return [...currentData, responseData];
                        }
                    } else if (cat.includes('update') && responseData && responseData.id) {
                        console.log('updated cache');
                        return currentData.map((row) =>
                            row.id === responseData.id ? responseData : row
                        );
                    } else if (cat.includes('delete') && id) {
                        return currentData.filter((row) => row.id !== id);
                    }
                    return currentData;
                });
            }

            queryClient.invalidateQueries({ queryKey: [table, uniqueKey] });

            // Success toast with react-hot-toast
            const action = cat.includes('insert') && id == null ? 'Created' : cat.includes('update') ? 'Updated' : cat.includes('delete') || act == 3 ? 'Deleted' : 'Processed';
            showToast(`Data ${action.toLowerCase()} successfully!`, 'success', `${action} ✓`);
            
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error) => {
            // Error toast with react-hot-toast
            showToast('Failed to update data. Please try again.', 'error', 'Error ✕');
            
            if (onError) {
                onError(error);
            }
        },
    });

    const killQuery = () => {
        setIsEnabled(false);
        queryClient.removeQueries({ queryKey: [table, uniqueKey] });
        setParam({});
    };

    const loadQuery = (newParam) => {
        killQuery();
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
        const cached = queryClient.getQueryData([table, uniqueKey]) ?? data;

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
        isSuccess,
        isError,
        isFetching,
        isPending,
        error: queryError,
        status,
        killQuery,
        loadQuery,
        loadUpdate,
        refetch,
        getOne,
        row,
    };
}