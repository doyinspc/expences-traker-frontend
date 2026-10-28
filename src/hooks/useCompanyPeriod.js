import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../actions/common';
export default function useCompanyPeriod(enabled=true) {
  const auth=useSelector(state=>state.authReducer||{});
  return useQuery({queryKey:['company','accounting-period',tokenHelpers.getTenantDb(),tokenHelpers.getToken()],enabled:enabled&&Boolean(auth.isAuthenticated),staleTime:300000,queryFn:async()=>{const {data}=await axios.get(API_PATH_SETTING,{...axiosConfig,params:{table:'company',cat:'gets',data:'{}'}});if(data?.status==='error')throw new Error(data.message);const rows=Array.isArray(data)?data:data?.data;return Array.isArray(rows)?rows[0]||null:rows||null;}});
}
