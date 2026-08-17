// src/actions/tenant.js

export const tenantActions = {
    setTenant: (tenant) => ({
        type: "TENANT_SET_TENANT",
        payload: tenant,
    }),
    
    setTenants: (tenants) => ({
        type: "TENANT_SET_TENANTS",
        payload: tenants,
    }),
    
    setSettings: (settings) => ({
        type: "TENANT_SET_SETTINGS",
        payload: settings,
    }),
    
    setFeatures: (features) => ({
        type: "TENANT_SET_FEATURES",
        payload: features,
    }),
    
    setSubscription: (subscription) => ({
        type: "TENANT_SET_SUBSCRIPTION",
        payload: subscription,
    }),
    
    setLimits: (limits) => ({
        type: "TENANT_SET_LIMITS",
        payload: limits,
    }),
    
    switchTenant: (tenant) => ({
        type: "TENANT_SWITCH",
        payload: tenant,
    }),
    
    loading: (loading) => ({
        type: "TENANT_LOADING",
        payload: loading,
    }),
    
    error: (error) => ({
        type: "TENANT_ERROR",
        payload: error,
    }),
    
    clearError: () => ({
        type: "TENANT_CLEAR_ERROR",
    }),
};