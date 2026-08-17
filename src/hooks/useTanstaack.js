import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState, useCallback } from 'react'; // Import useCallback
import { API_PATH_SETTING, axiosConfig, axiosConfig1, MAIN_TOKEN } from '../actions/common';
import axios from 'axios';
import Swal from 'sweetalert2'; 

// Helper function for GET API calls
const loadApi = async ({ queryKey }) => { // Destructure queryKey to get parameters
    // queryKey will be in the format: [table, uniqueKey, initialParam]
    const [table, uniqueKey, currentQueryParam, queryType, mainParam, narration] = queryKey;

    // Deep merge mainParam and currentQueryParam
    const mergedParam = { ...mainParam, ...currentQueryParam };

    // Ensure 'cat' is correctly sourced; prefer currentQueryParam's cat if present
    const qt = mergedParam.hasOwnProperty('cat') ? mergedParam['cat'] : queryType;
    delete mergedParam.cat; // Remove redundant 'cat' from mergedParam if it's already used as qt

    try {
        // Parameters for axios.get should be a plain object, axios converts to URL query strings.
        // DO NOT stringify the data and assign it to a 'data' key for GET requests,
        // unless your backend explicitly requires it this way for GETs (which is unusual).
        // Based on previous iterations, it was requested to stringify. Re-confirming this
        // is indeed the case for YOUR backend's GET endpoint. If not, remove `data: JSON.stringify(...)`.
        const params = {
            data: JSON.stringify(mergedParam), // Re-applying stringify per user's explicit request
            cat: qt,
            table: table,
            narration: narration,
            token: MAIN_TOKEN,
        };
        
        const response = await axios.get(API_PATH_SETTING, { params }, axiosConfig);
        return response.data;
    } catch (error) {
        console.error('loadApi Error:', error);
        throw error;
    }
};

// Helper function for POST API calls (update, register, delete)
const updateApi = async (table, mutationCat, mainParam, param, narration) => {
    try {
        const formData = new FormData();
        formData.append('table', table);
        formData.append('cat', mutationCat); // Use the cat passed to the mutationFn

        Object.keys(mainParam).forEach((key) => formData.append(key, mainParam[key]));
        Object.keys(param).forEach((key) => {
            if (key !== 'cat' && key !== 'id') { // 'cat' handled, 'id' can be separate
                formData.append(key, String(param[key]));
            }
        });
        // If an ID is explicitly passed for update/delete, append it.
        if (param.id) {
            formData.append('id', String(param.id));
        }

        const response = await axios.post(API_PATH_SETTING, formData, axiosConfig1);
        return response.data; // Return the response data for cache updates
    } catch (error) {
        console.error('updateApi Error:', error);
        throw error;
    }
};


export default function useTanstackQuery(props) {
    const queryClient = useQueryClient();

    // Destructure props:
    // queryParams: Represents the dynamic parameters for the current query (e.g., { id: 1, filter: 'active' })
    // enabled: Controls whether the query should run.
    const { 
        table, 
        uniqueKey, 
        mainParam = {}, // Default to empty object
        narration, 
        onSuccess, 
        onError, 
        refetchInterval, 
        queryParams = {}, // New prop for dynamic query parameters, default to empty object
        enabled = true,   // New prop to explicitly enable/disable the query
        queryType // The base query type, passed to loadApi helper
    } = props;

    // The query key now includes dynamic queryParams and uniqueKey
    const queryKey = [table, uniqueKey, queryParams, queryType, mainParam, narration];

    const {
        data,
        isLoading,     // Initially loading (first fetch)
        isFetching,    // Currently fetching (includes initial load, refetch, invalidate)
        isPending,     // Alias for isLoading + isFetching
        refetch: tanstackRefetch, // Renamed to avoid clash with hook's refetch
        error: queryError,
        status,
    } = useQuery({
        queryKey: queryKey,
        queryFn: loadApi, // loadApi will now receive { queryKey } as its first argument
        refetchInterval: refetchInterval && refetchInterval > 0 ? refetchInterval : 1000 * 60 * 10,
        onError: (error) => {
            console.error('Query Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Query Failed!',
                text: error.message || 'Failed to fetch data.',
            });
            if (onError) {
                onError(error);
            }
        },
        enabled: enabled, // Controlled by the prop passed to the hook
        // Add staleTime/cacheTime as needed for your caching strategy
        // staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
        // cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
    });

    const {
        mutateAsync,
        isSuccess,
        isLoading: isLoadingUpdate, // Loading state for mutation
        isError,
        error: mutationError, // Error object for mutation
    } = useMutation({
        mutationFn: async (mutationParams) => 
            updateApi(table, mutationParams.cat || 'insert', mainParam, mutationParams, narration),
        onSuccess: (responseDatas, variables) => { 
            let responseData = responseDatas?.data || {};
            const cat = variables?.cat || "insert";
            const id = variables?.id || null;

            // Update the query cache to reflect changes immediately
            if (responseDatas) { // Ensure responseDatas is not null/undefined
                queryClient.setQueryData(queryKey, (oldData) => {
                    let currentData = Array.isArray(oldData) ? oldData : [];

                    if (cat.includes('insert') && responseData && responseData.id) {
                        // Prevent adding duplicates if data is already there (e.g., from refetch after insert)
                        if (!currentData.some(row => row.id === responseData.id)) {
                             return [...currentData, responseData];
                        }
                    } else if (cat.includes('update') && responseData && responseData.id) {
                        return currentData.map((row) =>
                            row.id === responseData.id ? responseData : row
                        );
                    } else if (cat.includes('delete') && id) {
                        return currentData.filter((row) => row.id !== id);
                    }
                    return currentData; 
                });
            }

            // Invalidate queries as a fallback or for related data if necessary.
            // Consider invalidating specific related queries instead of just the current one.
            queryClient.invalidateQueries({ queryKey: [table, uniqueKey] });

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Operation completed successfully!',
            });
            if (onSuccess) {
                onSuccess(responseDatas); // Pass full response to onSuccess
            }
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || error.message || 'Failed to complete operation.',
            });
            if (onError) {
                onError(error);
            }
        },
    });

    // Expose loadQuery and refetch via useCallback to ensure stable references
    // loadQuery will now take the dynamic part of the queryKey
    const loadQuery = useCallback(async (paramsForQuery = {}) => {
        // This will update the queryKey, triggering a refetch if 'enabled' is true
        queryClient.setQueryData([table, uniqueKey, paramsForQuery, queryType, mainParam, narration], (old) => old); // Update the queryKey itself
        tanstackRefetch(); // Explicitly refetch after updating the query key
    }, [queryClient, table, uniqueKey, queryType, mainParam, narration, tanstackRefetch]);

    // loadUpdate (mutation) remains the same, using mutateAsync
    const loadUpdate = useCallback(async (newParam) => {
        await mutateAsync(newParam);
    }, [mutateAsync]);

    const refetch = useCallback(() => {
        tanstackRefetch();
    }, [tanstackRefetch]);

    return {
        data,
        isLoading,
        isLoadingUpdate,
        isSuccess,       // Success state for mutation
        isError,         // Error state for mutation
        isFetching,
        isPending,
        error: queryError || mutationError, // Return combined error
        status,
        loadQuery,      // For triggering fetches with new params
        loadUpdate,     // For triggering mutations (update/insert/delete)
        refetch,        // For re-fetching current query data
    };
}
