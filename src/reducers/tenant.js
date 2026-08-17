// src/reducers/tenant.js

const initialState = {
    currentTenant: null,
    availableTenants: [],
    settings: {},
    features: [],
    subscription: {
        plan: 'basic',
        status: 'active',
        expiresAt: null,
    },
    limits: {
        maxUsers: 10,
        maxStorage: 5,
    },
    loading: false,
    error: null,
};

export default function tenant(state = initialState, action) {
    switch (action.type) {
        case "TENANT_SET_TENANT":
            return {
                ...state,
                currentTenant: action.payload,
                loading: false,
                error: null,
            };

        case "TENANT_SET_TENANTS":
            return {
                ...state,
                availableTenants: action.payload,
                loading: false,
                error: null,
            };

        case "TENANT_SET_SETTINGS":
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.payload,
                },
            };

        case "TENANT_SET_FEATURES":
            return {
                ...state,
                features: action.payload,
            };

        case "TENANT_SET_SUBSCRIPTION":
            return {
                ...state,
                subscription: {
                    ...state.subscription,
                    ...action.payload,
                },
            };

        case "TENANT_SET_LIMITS":
            return {
                ...state,
                limits: {
                    ...state.limits,
                    ...action.payload,
                },
            };

        case "TENANT_LOADING":
            return {
                ...state,
                loading: action.payload,
            };

        case "TENANT_ERROR":
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case "TENANT_CLEAR_ERROR":
            return {
                ...state,
                error: null,
            };

        case "TENANT_SWITCH":
            return {
                ...state,
                currentTenant: action.payload,
                loading: false,
                error: null,
            };

        default:
            return state;
    }
}