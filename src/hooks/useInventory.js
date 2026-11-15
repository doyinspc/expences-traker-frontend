import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from "../actions/common";

/** Location/role/session form the cache boundary for every inventory report and alert. */
export async function inventoryRequest(operation, data = {}, write = false) {
  const response = write
    ? await axios.post(
        API_PATH_SETTING,
        { table: "inventory", cat: operation, ...data },
        axiosConfig,
      )
    : await axios.get(API_PATH_SETTING, {
        ...axiosConfig,
        params: {
          table: "inventory",
          cat: operation,
          data: JSON.stringify(data),
        },
      });
  if (response.data?.success === false || response.data?.status === "error") {
    throw new Error(response.data.message || "Inventory could not be loaded.");
  }
  return response.data.data;
}

export default function useInventory(
  filters = {},
  operation = "state",
  enabled = true,
) {
  const auth = useSelector((state) => state.authReducer || state.auth || {});
  const query = useQuery({
    queryKey: [
      "inventory",
      operation,
      tokenHelpers.getTenantDb(),
      tokenHelpers.getToken(),
      auth.user?.id,
      auth.location_id,
      auth.role_id,
      filters,
    ],
    queryFn: () => inventoryRequest(operation, filters),
    enabled: Boolean(
      enabled && auth.isAuthenticated && auth.location_id && auth.role_id,
    ),
    staleTime: 30000,
    refetchInterval: 60000,
    retry: false,
  });
  return { ...query, auth };
}
