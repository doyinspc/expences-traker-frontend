import axios from 'axios';
import {
  API_PATH_SETTING,
  axiosConfig,
  tokenHelpers,
} from '../../actions/common';

/** Use the existing tenant/session headers; the backend rechecks document location and quantities. */
export async function purchasingRequest(operation, data = {}, write = false) {
  const values = {
    ...data,
    table: 'purchasing',
    cat: operation,
    tenant_db: tokenHelpers.getTenantDb(),
  };
  const response = write
    ? await axios.post(API_PATH_SETTING, values, axiosConfig)
    : await axios.get(API_PATH_SETTING, {
        ...axiosConfig,
        params: {
          table: values.table,
          cat: operation,
          tenant_db: values.tenant_db,
          data: JSON.stringify(data),
        },
      });
  if (response.data?.status === 'error' || response.data?.success === false)
    throw new Error(
      response.data.message || 'The purchasing request could not be completed.',
    );
  return response.data.data;
}
