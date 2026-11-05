import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../actions/common';
import {
  parentDocumentRoute,
  selectParentDocument,
} from '../utils/functions/parentDocumentContext.js';

/**
 * Purpose: resolve the exact parent shown by a routed item/settings page.
 * Algorithm:
 * 1. Derive the resource, parent ID and document type from the current URL.
 * 2. Read through the existing authenticated gets endpoint. Its location/role rules
 *    remain authoritative; closed parents are included because their items remain viewable.
 * 3. Key the cache by parent, tenant, login, location and role. Never keep a previous
 *    parent's result while another URL is loading or reuse the browser's saved title row.
 * 4. Select the exact ID/type from the response, including older list-style responses.
 *    Surface denied/missing records explicitly and expose retry through the query result.
 * No record is written and no backend deployment or database change is required.
 */
export default function useParentDocumentContext() {
  const { pathname } = useLocation();
  const route = parentDocumentRoute(pathname);
  const auth = useSelector((state) => state.authReducer || state.auth || {});
  const tenant = tokenHelpers.getTenantDb();
  const token = tokenHelpers.getToken();
  const canRead = Boolean(
    route?.id && token && (route.table === 'commons' || auth.location_id),
  );
  const query = useQuery({
    queryKey: [
      route?.table || 'parent',
      'document-context',
      tenant,
      token,
      auth.location_id,
      auth.role_id,
      route?.id,
      route?.type,
    ],
    enabled: canRead,
    staleTime: 30000,
    retry: 1,
    queryFn: async () => {
      const filters = {
        id: route.id,
        ...(route.type ? { requisition_type: route.type } : {}),
      };
      const { data } = await axios.get(API_PATH_SETTING, {
        ...axiosConfig,
        params: {
          table: route.table,
          cat: 'gets',
          tenant_db: tenant,
          data: JSON.stringify(filters),
        },
      });
      const document = selectParentDocument(data, route);
      if (!document)
        throw new Error(
          'This record was not found or is not available in your current location.',
        );
      return document;
    },
  });
  return {
    ...query,
    route,
    id: route?.id || 0,
    document: query.data || null,
    canRead,
  };
}
