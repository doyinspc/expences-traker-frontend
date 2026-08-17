import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { API_PATH_SETTING, axiosConfig, axiosConfig1, MAIN_TOKEN } from '../actions/common';
import axios from 'axios';
import Swal from 'sweetalert2';

// ============================================
// CONSTANT: Get tenant DB from sessionStorage or env
// ============================================
const getTenantDb = () => {
    return sessionStorage.getItem('tenantDb') || import.meta.env.VITE_APP_TENANT_DB || 'expences1';
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

            if (cat && data) {
                queryClient.setQueryData([table, uniqueKey], (oldData) => {
                    let currentData = Array.isArray(oldData) ? oldData : [];

                    if (cat.includes('insert') && responseData && responseData.id) {
                        console.log('insert into cache', oldData);
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

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Data updated successfully! ',
            });
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to update data.'
            });
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

    const loadUpdate = async (newParam) => {
        await mutateAsync(newParam);
    };

    const refetch = () => {
        refetchQuery();
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
    };
}