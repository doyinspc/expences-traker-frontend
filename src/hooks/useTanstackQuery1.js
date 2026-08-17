import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { API_PATH_SETTING, axiosConfig, axiosConfig1, MAIN_TOKEN } from '../actions/common';
import axios from 'axios';

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
    if (param.hasOwnProperty('cat')) {
      formData.append('cat', param['cat']);
      delete param['cat'];
    }else{
      formData.append('cat', queryType);
    }
    Object.keys(mainParam).forEach((key) => formData.append(key, mainParam[key]));
    Object.keys(param).forEach((key) => formData.append(key, param[key]));
    await axios.post(API_PATH_SETTING, formData, axiosConfig1);
    return true;
  } catch (error) {
    console.error('updateApi Error:', error);
    throw error;
  }
};


export default function useTanstackQuery(props) {

  const queryClient = useQueryClient();
 
  const { table, queryType, uniqueKey, mainParam, narration, enabled, onSuccess } = props;
  
  const [param, setParam] = useState({});
  const [isEnabled, setIsEnabled] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    isPending,
    refetch: refetchQuery, 
    error: queryError,
  } = useQuery({
    queryKey: [table, uniqueKey],
    queryFn: async () => loadApi(table, queryType, mainParam, param, narration),
    refetchInterval: 30000,
    onError: (error) => console.error('Query Error:', error),
    enabled: isEnabled,
    //enabled: enabled && enabled == false ? false : true
  });

  const {
    mutateAsync,
    isSuccess,
    isLoading: isLoadingUpdate,
    isError: mutationError,
    error: mutationErrorData,
  } = useMutation({
    mutationFn: async (param) => updateApi(table, 'insert', mainParam, param, narration),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [table, uniqueKey]});
      onSuccess()
    },
    onError: (error) => console.error('Mutation Error:', error),
  });

  const loadQuery = (newParam) => {
    setParam(newParam);
    setIsEnabled(true);
  };
  const killQuery = () => {
    setParam();
    setIsEnabled(false);
  };

  const loadUpdate = async (newParam) => {
    await mutateAsync(newParam);
  };

  const refetch = () => {
    refetchQuery();
  }

  return {
    data,
    isLoading,
    isLoadingUpdate,
    isSuccess,
    isFetching,
    isPending,
    error: queryError,
    mutationError,
    mutationErrorData,
    killQuery,
    loadQuery,
    loadUpdate,
    refetch, 
  };
}