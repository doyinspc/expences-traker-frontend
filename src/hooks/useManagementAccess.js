import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../actions/common';

export default function useManagementAccess() {
  const auth = useSelector(state => state.auth || {});
  return useQuery({
    queryKey: ['management-capabilities', tokenHelpers.getTenantDb(), tokenHelpers.getToken()],
    enabled: Boolean(auth.isAuthenticated && tokenHelpers.getToken()),
    staleTime: 30000,
    queryFn: async () => {
      const { data } = await axios.get(API_PATH_SETTING, { ...axiosConfig, params: { table: 'users', cat: 'getManagementCapabilities', data: '{}' } });
      if (data?.success === false || data?.status === 'error') throw new Error(data.message || 'Access information could not be loaded.');
      return data;
    },
  });
}
