import {useEffect,useState} from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {API_PATH_SETTING,axiosConfig,tokenHelpers} from '../actions/common';

export default function useTeamUpdates(){
 const auth=useSelector(state=>state.authReducer||state.auth||{});
 const [visible,setVisible]=useState(()=>typeof document==='undefined'||document.visibilityState!=='hidden');
 useEffect(()=>{const update=()=>setVisible(document.visibilityState!=='hidden');document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 return useQuery({queryKey:['team-updates',tokenHelpers.getTenantDb(),tokenHelpers.getToken(),auth.user?.id,auth.location_id,auth.role_id],enabled:Boolean(visible&&auth.isAuthenticated&&auth.user?.id&&tokenHelpers.getToken()),staleTime:45000,refetchInterval:60000,refetchIntervalInBackground:false,retry:1,
  queryFn:async()=>{const {data}=await axios.post(API_PATH_SETTING,{table:'teamupdates',cat:'heartbeat'},axiosConfig);if(data?.success===false||data?.status==='error')throw new Error(data.message||'Team updates are unavailable.');return data.data;}});
}
