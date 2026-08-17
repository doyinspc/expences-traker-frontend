// src/reducers/auth.js

import { AUTH_TYPES, USER_TYPES } from '../types/auth';

const AUTH_STORAGE_KEY = 'app_auth_state';
const AUTH_TIME_KEY = 'app_auth_timestamp';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

const clearAuthStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(AUTH_TIME_KEY);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('jwt');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('tenantDb');
            sessionStorage.removeItem('accountId');
            sessionStorage.removeItem('userType');
            sessionStorage.removeItem('remember');
        } catch (err) {
            console.error('Failed to clear auth storage:', err);
        }
    }
};

const saveAuthToStorage = (state) => {
    if (typeof window !== 'undefined') {
        try {
            const stateToSave = {
                user: state.user,
                token: state.token,
                jwt: state.jwt,
                tenantDb: state.tenantDb,
                accountId: state.accountId,
                userType: state.userType,
                isAuthenticated: state.isAuthenticated,
                location_id: state.location_id,
                locations: state.locations,
                location: state.location,
                role_id: state.role_id,
                roles: state.roles,
                role: state.role,
                access: state.access,
                permissions: state.permissions,
                roles: state.roles,
                remember: state.remember,
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stateToSave));
            localStorage.setItem(AUTH_TIME_KEY, Date.now().toString());
        } catch (err) {
            console.error('Failed to save auth state:', err);
        }
    }
};

const loadPersistedState = () => {
    if (typeof window === 'undefined') return null;
    try {
        const timestamp = localStorage.getItem(AUTH_TIME_KEY);
        if (!timestamp) return null;

        if (Date.now() - parseInt(timestamp, 10) > TWO_HOURS_MS) {
            clearAuthStorage();
            return null;
        }

        const serializedState = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!serializedState) return null;

        return JSON.parse(serializedState);
    } catch (err) {
        console.error('Failed to load persisted auth state:', err);
        return null;
    }
};

const baseInitialState = {
    user: null,
    token: null,
    jwt: null,
    tenantDb: null,
    accountId: null,
    userType: USER_TYPES.GUEST,
    isAuthenticated: false,
    location_id: 0,
    locations: [],
    location: {},
    role_id: 0,
    roles: [],
    role: {},
    access:[],
    loading: false,
    error: null,
    permissions: [],
    roles: [],
    remember: false,
};

const persistedState = loadPersistedState();
const initialState = persistedState ? { ...baseInitialState, ...persistedState } : baseInitialState;

export default function auth(state = initialState, action) {
    switch (action.type) {
        // ==================== ADMIN LOGIN ====================
        case AUTH_TYPES.ADMIN_LOGIN_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case AUTH_TYPES.ADMIN_LOGIN_SUCCESS: {
            const newState = {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                jwt: action.payload.jwt || null,
                accountId: action.payload.accountId || null,
                userType: USER_TYPES.ADMIN,
                isAuthenticated: true,
                loading: false,
                error: null,
                remember: action.payload.remember || false,
            };
            saveAuthToStorage(newState);
            return newState;
        }

        case AUTH_TYPES.ADMIN_LOGIN_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                isAuthenticated: false,
            };

        // ==================== TENANT LOGIN ====================
        case AUTH_TYPES.TENANT_LOGIN_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case AUTH_TYPES.TENANT_LOGIN_SUCCESS: {
            let default_location  = action?.payload.user?.location_id || 0;
            let default_role  = action?.payload.user?.role_id || 0;
            let default_location_details = action?.payload.user?.locations.find(rw =>rw.id == default_location)
            let default_role_details = action?.payload.user?.roles.find(rw =>rw.id == default_role)

            const newState = {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                locations: action.payload.user?.locations,
                roles: action.payload.user?.roles,
                access: action.payload.user?.access,
                location: default_location_details,
                role: default_role_details,
                location_id:default_location,
                role_id:default_role,
                jwt: action.payload.jwt || null,
                tenantDb: action.payload.tenantDb || null,
                accountId: action.payload.accountId || null,
                userType: USER_TYPES.TENANT,
                isAuthenticated: true,
                loading: false,
                error: null,
                remember: action.payload.remember || false,
            };
            saveAuthToStorage(newState);
            return newState;
        }

        case AUTH_TYPES.TENANT_LOGIN_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                isAuthenticated: false,
            };
        case AUTH_TYPES.SWITCH_LOCATION_SUCCESS:
            let df = action?.payload
            let new_role = state.roles.find(rw=>rw.location_id == action?.payload.id) || {}
            let updateState = {
                ...state,
                location: action?.payload,
                location_id: action?.payload.id,
                role:new_role,
                role_id:new_role?.id || 0,
                error: null,
            };
            saveAuthToStorage(updateState);
            return updateState;
         case AUTH_TYPES.SWITCH_ROLE_SUCCESS:
            let df1 = action?.payload
            let updateRoleState = {
                ...state,
                role: action?.payload,
                role_id: action?.payload.id,
                error: null,
            };
            saveAuthToStorage(updateRoleState);
            return updateRoleState;
        // ==================== REGISTER ====================
        case AUTH_TYPES.REGISTER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case AUTH_TYPES.REGISTER_SUCCESS: {
            const newState = {
                ...state,
                user: action.payload.user || action.payload,
                token: action.payload.token || null,
                jwt: action.payload.jwt || null,
                tenantDb: action.payload.tenantDb || null,
                isAuthenticated: !!action.payload.token,
                loading: false,
                error: null,
            };
            if (newState.isAuthenticated) {
                saveAuthToStorage(newState);
            }
            return newState;
        }

        case AUTH_TYPES.REGISTER_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ==================== LOGOUT ====================
        case AUTH_TYPES.LOGOUT:
            clearAuthStorage();
            return {
                ...baseInitialState,
            };

        // ==================== SESSION ====================
        case AUTH_TYPES.CHECK_AUTH: {
            const newState = {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                jwt: action.payload.jwt || null,
                tenantDb: action.payload.tenantDb || null,
                accountId: action.payload.accountId || null,
                userType: action.payload.userType || USER_TYPES.TENANT,
                isAuthenticated: true,
                loading: false,
                error: null,
                remember: action.payload.remember || false,
            };
            saveAuthToStorage(newState);
            return newState;
        }

        case AUTH_TYPES.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            };

        case AUTH_TYPES.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        case AUTH_TYPES.REFRESH_TOKEN: {
            const newState = {
                ...state,
                token: action.payload.token,
                jwt: action.payload.jwt || state.jwt,
            };
            saveAuthToStorage(newState);
            return newState;
        }

        case AUTH_TYPES.SET_USER_TYPE: {
            const newState = {
                ...state,
                userType: action.payload,
            };
            saveAuthToStorage(newState);
            return newState;
        }

        // ==================== PERMISSIONS ====================
        case AUTH_TYPES.SET_PERMISSIONS: {
            const newState = {
                ...state,
                permissions: action.payload.permissions || [],
                roles: action.payload.roles || [],
            };
            saveAuthToStorage(newState);
            return newState;
        }

        case AUTH_TYPES.UPDATE_USER: {
            const newState = {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload,
                },
            };
            saveAuthToStorage(newState);
            return newState;
        }

        default:
            return state;
    }
}

// ==================== SELECTORS ====================

/**
 * Get full auth state
 */
export const selectAuth = (state) => state.auth;

/**
 * Get current user
 */
export const selectUser = (state) => state.auth.user;

/**
 * Get authentication token
 */
export const selectToken = (state) => state.auth.token;

/**
 * Get JWT token
 */
export const selectJwt = (state) => state.auth.jwt;

/**
 * Get tenant database name
 */
export const selectTenantDb = (state) => state.auth.tenantDb;

/**
 * Get account ID
 */
export const selectAccountId = (state) => state.auth.accountId;

/**
 * Get user type (admin | tenant | guest)
 */
export const selectUserType = (state) => state.auth.userType;

/**
 * Check if user is authenticated
 */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

/**
 * Check if loading
 */
export const selectLoading = (state) => state.auth.loading;

/**
 * Get error message
 */
export const selectError = (state) => state.auth.error;

/**
 * Get user permissions
 */
export const selectPermissions = (state) => state.auth.permissions;

/**
 * Get user roles
 */
export const selectRoles = (state) => state.auth.roles;

/**
 * Check if user is admin
 */
export const selectIsAdmin = (state) => state.auth.userType === USER_TYPES.ADMIN;

/**
 * Check if user is tenant
 */
export const selectIsTenant = (state) => state.auth.userType === USER_TYPES.TENANT;

/**
 * Check if user is guest (not logged in)
 */
export const selectIsGuest = (state) => state.auth.userType === USER_TYPES.GUEST;

/**
 * Get remember me status
 */
export const selectRemember = (state) => state.auth.remember;

/**
 * Get user full name
 */
export const selectUserFullName = (state) => {
    const user = state.auth.user;
    if (!user) return '';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email || '';
};

/**
 * Get user display name
 */
export const selectUserDisplayName = (state) => {
    const user = state.auth.user;
    if (!user) return 'Guest';
    return user.first_name || user.username || user.email || 'User';
};

/**
 * Check if user has specific permission
 */
export const selectHasPermission = (state, permission) => {
    return state.auth.permissions.includes(permission);
};

/**
 * Check if user has any of the given permissions
 */
export const selectHasAnyPermission = (state, permissions) => {
    return permissions.some(p => state.auth.permissions.includes(p));
};

/**
 * Check if user has all of the given permissions
 */
export const selectHasAllPermissions = (state, permissions) => {
    return permissions.every(p => state.auth.permissions.includes(p));
};

/**
 * Check if user has specific role
 */
export const selectHasRole = (state, role) => {
    return state.auth.roles.includes(role);
};

/**
 * Get user avatar/photo URL
 */
export const selectUserAvatar = (state) => {
    const user = state.auth.user;
    if (!user) return null;
    return user.photo || user.avatar || null;
};

/**
 * Get user email
 */
export const selectUserEmail = (state) => {
    const user = state.auth.user;
    if (!user) return null;
    return user.email || null;
};

/**
 * Get user ID
 */
export const selectUserId = (state) => {
    const user = state.auth.user;
    if (!user) return null;
    return user.id || null;
};

// Export all selectors as a group
export const authSelectors = {
    selectAuth,
    selectUser,
    selectToken,
    selectJwt,
    selectTenantDb,
    selectAccountId,
    selectUserType,
    selectIsAuthenticated,
    selectLoading,
    selectError,
    selectPermissions,
    selectRoles,
    selectIsAdmin,
    selectIsTenant,
    selectIsGuest,
    selectRemember,
    selectUserFullName,
    selectUserDisplayName,
    selectHasPermission,
    selectHasAnyPermission,
    selectHasAllPermissions,
    selectHasRole,
    selectUserAvatar,
    selectUserEmail,
    selectUserId,
};

export { USER_TYPES };