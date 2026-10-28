import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router';
import { Bell, RefreshCw, X } from 'lucide-react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../../actions/common';
import { getPendingApprovalNotifications } from '../../utils/functions/notificationItems';

interface NotificationAuth {
  user?: { id: string | number };
  role_id?: string | number;
  location_id?: string | number;
  isAuthenticated?: boolean;
}
export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role_id, location_id, isAuthenticated } = useSelector((state: { authReducer?: NotificationAuth }) => state.authReducer || {});
  const tenant = tokenHelpers.getTenantDb();
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ['approvalcenter', 'header-notifications', tenant, user?.id, location_id, role_id],
    enabled: Boolean(isAuthenticated && user?.id && location_id && role_id),
    queryFn: async () => {
      const response = await axios.get(API_PATH_SETTING, {
        ...axiosConfig,
        params: { table: 'approvalcenter', cat: 'getApprovalItems', tenant_db: tenant,
          data: JSON.stringify({ user_id: user?.id, location_id, role_id }) },
      });
      if (response.data?.status === 'error' || response.data?.success === false) throw new Error('Notifications could not be loaded.');
      return response.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
  const notifications = getPendingApprovalNotifications(data, role_id);
  const hasContext = Boolean(isAuthenticated && user?.id && location_id && role_id);
  return (
    <div className="relative">
      <button type="button" aria-label={`Notifications, ${notifications.length} pending approvals`} aria-expanded={isOpen} aria-controls="approval-notifications" onClick={() => setIsOpen(!isOpen)} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <Bell size={20} />
        {notifications.length > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-brand-500 px-1 text-xs leading-5 text-white">{notifications.length > 99 ? '99+' : notifications.length}</span>}
      </button>
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="absolute right-0 mt-3 w-[min(360px,calc(100vw-32px))] rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div id="approval-notifications">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-gray-900 dark:text-white">Your notifications</h2><button type="button" aria-label="Close notifications" onClick={() => setIsOpen(false)}><X size={18} /></button></div>
          <p className="mb-3 text-xs text-gray-500">Pending approvals for your selected location and role.</p>
          <div aria-live="polite" className="max-h-80 overflow-y-auto">
            {!hasContext ? <p className="py-6 text-sm text-gray-500">Select a location and role to see your notifications.</p>
              : error ? <div role="alert" className="py-4 text-sm text-red-600">Notifications could not be loaded. <button type="button" onClick={() => refetch()} className="underline">Try again</button></div>
              : isPending ? <p className="py-6 text-sm text-gray-500">Loading notifications…</p>
              : notifications.length === 0 ? <p className="py-6 text-sm text-gray-500">You’re up to date. No approvals are waiting for your action.</p>
              : <ul className="divide-y divide-gray-100 dark:divide-gray-800">{notifications.map((item) => <li key={item.id}><Link to={item.path} onClick={() => setIsOpen(false)} className="block rounded-lg px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"><span className="block text-sm font-medium text-gray-900 dark:text-white">{item.title}</span><span className="mt-1 block text-xs text-gray-500">{item.description}</span></Link></li>)}</ul>}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm dark:border-gray-800"><Link to="/procurement/approvals" onClick={() => setIsOpen(false)} className="font-medium text-brand-600">View approval centre</Link><button type="button" disabled={!hasContext || isFetching} onClick={() => refetch()} aria-label="Refresh notifications" className="p-1 disabled:opacity-40"><RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /></button></div>
        </div>
      </Dropdown>
    </div>
  );
}
