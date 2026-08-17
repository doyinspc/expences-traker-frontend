import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { API_PATH_SETTING, axiosConfig, axiosConfig1, MAIN_TOKEN } from '../actions/common';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert

// Import Redux specific hooks and your ActionCreators
import { useDispatch } from 'react-redux';
import ActionCreators from '../actions/actionCreator';
// Adjust this path if your ActionCreators class is located elsewhere
// Make sure this ActionCreators class is the one that generates types like "ITEM_GET_MULTIPLE" etc.

// --- API Functions (remain largely the same) ---
const loadApi = async (table, queryType, mainParam, param, narration) => {
  if (param && param.hasOwnProperty('cat')) {
    delete param['cat'];
  }

  try {
    const params = {
      data: JSON.stringify({ ...mainParam, ...param }),
      cat: queryType,
      table: table,
      narration: narration,
      token: MAIN_TOKEN,
    };
    const response = await axios.get(API_PATH_SETTING, { params }, axiosConfig);
    return response.data; // This data will be used to update Redux 'datas'
  } catch (error) {
    console.error('loadApi Error:', error);
    throw error;
  }
};

const updateApi = async (table, queryType, mainParam, param, narration) => {
  try {
    const formData = new FormData();
    formData.append('table', table);
    if (param.hasOwnProperty('cat')) {
      formData.append('cat', param['cat']);
      delete param['cat'];
    } else {
      formData.append('cat', queryType);
    }
    Object.keys(mainParam).forEach((key) => formData.append(key, mainParam[key]));
    // Ensure all values appended to FormData are strings if they are not files or blobs
    // This can prevent issues with numbers, booleans, etc.
    Object.keys(param).forEach((key) => formData.append(key, String(param[key])));
    const response = await axios.post(API_PATH_SETTING, formData, axiosConfig1);
    return response.data; // Return the response data for cache updates and Redux updates
  } catch (error) {
    console.error('updateApi Error:', error);
    throw error;
  }
};

// --- Custom TanStack Query Hook ---
export default function useTanstackReduxQuery(props) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch(); // Initialize useDispatch hook

  // Initialize ActionCreators dynamically based on the table name
  // Assuming 'table' prop corresponds to the typePrefix (e.g., 'item' -> 'ITEM')
  const actionTypes = new ActionCreators(props.path.toUpperCase()); 

  const { table, queryType, uniqueKey, mainParam, narration, onSuccess, onError, refetchInterval, isEnabled: enable } = props;

  const [param, setParam] = useState({});
  const [isEnabled, setIsEnabled] = useState(enable);

  // --- useQuery for Data Fetching ---
  const {
    data: queryData, // Renamed 'data' to 'queryData' to avoid conflict with Redux 'data'
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
    onSuccess: (dataFromApi) => { // Data received from loadApi call
      console.log(`Query for ${table} successful. Updating Redux with GET_MULTIPLE.`, dataFromApi);
      // Dispatch the GET_MULTIPLE action with the fetched data
      // Your reducer will store this in the 'datas' array
      dispatch({ type: actionTypes.GET_MULTIPLE, payload: dataFromApi }); 
      if (onSuccess) {
        onSuccess(dataFromApi);
      }
    },
    onError: (error) => {
      console.error('Query Error:', error);
      // Dispatch a generic loading error for Redux state
      dispatch({ type: actionTypes.LOADING_ERROR, msg: error.message || 'Failed to load data.' });
      if (onError) {
        onError(error);
      }
    },
    enabled: isEnabled,
  });

  // --- useMutation for Data Updates (Insert, Update, Delete) ---
  const {
    mutateAsync,
    isSuccess,
    isLoading: isLoadingUpdate,
    isError,
    error,
  } = useMutation({
    mutationFn: async (param) => updateApi(table, param.cat || 'insert', mainParam, param, narration),
    onSuccess: (responseDatas, variables) => {
      // responseDatas is the full response from updateApi (e.g., { data: {id: 1, ...}, msg: 'success' })
      // variables are the params passed to mutateAsync (e.g., { cat: 'insert', ... })

      let responseData = responseDatas?.data || {}; // The actual item data (e.g., the new/updated object)
      let responseMsg = responseDatas?.msg || '';   // Message from the API
      const cat = variables?.cat || "insert";
      const id = variables?.id || null;

      // --- TanStack Query Cache Update Logic (for immediate UI response) ---
      // This part updates the TanStack Query cache directly for a snappier UI
      if (queryData) { // Check if queryData exists (meaning the list was already loaded)
        queryClient.setQueryData([table, uniqueKey], (oldData) => {
          let currentData = Array.isArray(oldData) ? oldData : [];

          if (cat.includes('insert') && responseData && responseData.id) {
            // Add the new record to the cache if it has an ID
            if(currentData.some(row => row.id === responseData.id)) { // Use strict equality
                // If item with this ID already exists, update it (e.g., for optimistic update fallback)
                return currentData.map(row =>
                    row.id === responseData.id ? responseData : row
                );
            } else {
                return [...currentData, responseData]; // Add new item
            }
          } else if (cat.includes('update') && responseData && responseData.id) {
            // Replace the updated record in the cache
            return currentData.map((row) =>
              row.id === responseData.id ? responseData : row
            );
          } else if (cat.includes('delete') && id) {
            // Remove the deleted record from the cache
            return currentData.filter((row) => row.id !== id);
          }
          return currentData; // Return current data if no specific action matched
        });
      }

      // --- Redux Store Update Logic ---
      // This part dispatches actions to update your Redux store
      if (cat.includes('insert') && responseData && responseData.id) {
        console.log(`Dispatching REGISTER_SUCCESS for ${table}.`);
        dispatch({ type: actionTypes.REGISTER_SUCCESS, payload: responseData, msg: responseMsg });
      } else if (cat.includes('update') && responseData && responseData.id) {
        console.log(`Dispatching UPDATE_SUCCESS for ${table}.`);
        dispatch({ type: actionTypes.UPDATE_SUCCESS, payload: responseData, msg: responseMsg });
      } else if (cat.includes('delete') && id) {
        console.log(`Dispatching DELETE_SUCCESS for ${table}.`);
        dispatch({ type: actionTypes.DELETE_SUCCESS, payload: id, msg: responseMsg }); // payload is just the ID for delete
      } else if (cat.includes('activate') && responseData && responseData.id) { // Assuming 'activate' also returns full data
        console.log(`Dispatching ACTIVATE_SUCCESS for ${table}.`);
        dispatch({ type: actionTypes.ACTIVATE_SUCCESS, payload: responseData, msg: responseMsg });
      }


      // Invalidate queries as a fallback or for related data if necessary
      // This triggers a fresh fetch from the server after the mutation, ensuring data consistency.
      queryClient.invalidateQueries({ queryKey: [table, uniqueKey] });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: responseMsg || 'Data updated successfully!',
      });
      if (onSuccess) {
        onSuccess(responseDatas); // Pass full response to external callback
      }
    },
    onError: (error) => {
      console.error('Mutation Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to update data.', // Display general or specific error message
      });
      // Dispatch a generic failure action for Redux state
      // You might want more specific fail actions like REGISTER_FAIL, UPDATE_FAIL, DELETE_FAIL
      dispatch({ type: actionTypes.LOADING_ERROR, msg: error.message || 'Failed to update data.' }); 
      if (onError) {
        onError(error);
      }
    },
  });

  // --- Query Control Functions ---
  const killQuery = () => {
    setIsEnabled(false);
    queryClient.removeQueries({ queryKey: [table, uniqueKey] });
    setParam({});
  };

  const loadQuery = (newParam) => {
    killQuery(); // Clear previous state and cache
    setParam(newParam); // Set new parameters
    setIsEnabled(true); // Enable query to trigger new fetch
  };

  const loadUpdate = async (newParam) => {
    await mutateAsync(newParam);
  };

  const refetch = () => {
    refetchQuery();
  };

  return {
    data: queryData, // Return the data from useQuery
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