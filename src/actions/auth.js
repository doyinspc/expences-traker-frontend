// src/actions/auth.js

import { AUTH_TYPES, LOGIN_TYPES, USER_TYPES } from '../types/auth';

// Session storage helpers
const sessionStorageHelper = {
    set: (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Session storage set error:', e);
        }
    },
    get: (key) => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Session storage get error:', e);
            return null;
        }
    },
    remove: (key) => {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.error('Session storage remove error:', e);
        }
    },
    clear: () => {
        try {
            sessionStorage.clear();
        } catch (e) {
            console.error('Session storage clear error:', e);
        }
    }
};

// ==================== SYNC ACTIONS ====================

export const authActions = {
    // Admin Login
    adminLoginRequest: () => ({
        type: AUTH_TYPES.ADMIN_LOGIN_REQUEST,
    }),

    adminLoginSuccess: (data) => ({
        type: AUTH_TYPES.ADMIN_LOGIN_SUCCESS,
        payload: {
            user: data.user,
            token: data.token,
            jwt: data.jwt || null,
            userType: USER_TYPES.ADMIN,
            accountId: data.accountId || null,
            remember: data.remember || false,
        },
    }),

    adminLoginFailure: (error) => ({
        type: AUTH_TYPES.ADMIN_LOGIN_FAILURE,
        payload: error,
    }),

    // Tenant Login
    tenantLoginRequest: () => ({
        type: AUTH_TYPES.TENANT_LOGIN_REQUEST,
    }),

    tenantLoginSuccess: (data) => ({
        type: AUTH_TYPES.TENANT_LOGIN_SUCCESS,
        payload: {
            user: data.user,
            token: data.token,
            jwt: data.jwt || null,
            tenantDb: data.tenantDb || null,
            accountId: data.accountId || null,
            userType: USER_TYPES.TENANT,
            remember: data.remember || false,
        },
    }),

    tenantSwitchLocation: (data) => ({
        type: AUTH_TYPES.SWITCH_LOCATION_SUCCESS,
        payload: data || {}
    }),

    tenantSwitchRole: (data) => ({
        type: AUTH_TYPES.SWITCH_ROLE_SUCCESS,
        payload: data || {}
    }),

    tenantLoginFailure: (error) => ({
        type: AUTH_TYPES.TENANT_LOGIN_FAILURE,
        payload: error,
    }),

    // Logout
    logout: () => ({
        type: AUTH_TYPES.LOGOUT,
    }),

    // Register
    registerRequest: () => ({
        type: AUTH_TYPES.REGISTER_REQUEST,
    }),

    registerSuccess: (data) => ({
        type: AUTH_TYPES.REGISTER_SUCCESS,
        payload: data,
    }),

    registerFailure: (error) => ({
        type: AUTH_TYPES.REGISTER_FAILURE,
        payload: error,
    }),

    // Session
    checkAuth: (data) => ({
        type: AUTH_TYPES.CHECK_AUTH,
        payload: {
            user: data.user,
            token: data.token,
            jwt: data.jwt || null,
            tenantDb: data.tenantDb || null,
            accountId: data.accountId || null,
            userType: data.userType || USER_TYPES.TENANT,
            remember: data.remember || false,
        },
    }),

    setLoading: (loading) => ({
        type: AUTH_TYPES.SET_LOADING,
        payload: loading,
    }),

    clearError: () => ({
        type: AUTH_TYPES.CLEAR_ERROR,
    }),

    refreshToken: (token, jwt) => ({
        type: AUTH_TYPES.REFRESH_TOKEN,
        payload: { token, jwt },
    }),

    // Permissions
    setPermissions: (permissions, roles) => ({
        type: AUTH_TYPES.SET_PERMISSIONS,
        payload: { permissions, roles },
    }),

    updateUser: (userData) => ({
        type: AUTH_TYPES.UPDATE_USER,
        payload: userData,
    }),

    setUserType: (userType) => ({
        type: AUTH_TYPES.SET_USER_TYPE,
        payload: userType,
    }),
};

// ==================== ASYNC ACTIONS (Thunks) ====================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/index.php';
const TENANT_DB = import.meta.env.VITE_APP_TENANT_DB || 'expences1';

// Admin Login
// src/actions/auth.js

// Admin Login - accepts FormData directly
export const adminLogin = (formData) => {
    return async (dispatch) => {
        dispatch(authActions.adminLoginRequest());

        try {
            // FormData is already prepared, just send it
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.status === 'success') {
                const userData = {
                    user: result.data.user,
                    token: result.data.token,
                    jwt: result.data.jwt || null,
                    accountId: result.data.user?.account_id || null,
                    remember: formData.get('remember') === '1',
                };

                sessionStorage.setItem('token', userData.token);
                sessionStorage.setItem('jwt', userData.jwt);
                sessionStorageHelper.set('user', userData.user);
                sessionStorageHelper.set('userType', USER_TYPES.ADMIN);
                sessionStorageHelper.set('accountId', userData.accountId);
                if (userData.remember) {
                    sessionStorageHelper.set('remember', true);
                }

                dispatch(authActions.adminLoginSuccess(userData));
                return { success: true, data: result.data };
            } else {
                dispatch(authActions.adminLoginFailure(result.message || 'Admin login failed'));
                return { success: false, message: result.message || 'Admin login failed' };
            }
        } catch (error) {
            const errorMessage = error.message || 'An error occurred during admin login';
            dispatch(authActions.adminLoginFailure(errorMessage));
            return { success: false, message: errorMessage };
        }
    };
};

// Tenant Login
// src/actions/auth.js

// Tenant Login - accepts FormData directly
export const tenantLogin = (formData) => {
    return async (dispatch) => {
        dispatch(authActions.tenantLoginRequest());

        try {
            // FormData is already prepared, just send it
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData, // No Content-Type header - browser sets it
            });

            const result = await response.json();

            if (result.status === 'success') {
                const tenantDb = formData.get('tenant_db') || TENANT_DB;
                const userData = {
                    user: result.data.user,
                    token: result.data.token,
                    jwt: result.data.jwt || null,
                    tenantDb: tenantDb,
                    accountId: result.data.user?.account_id || null,
                    remember: formData.get('remember') === '1',
                };

                // Save to session storage
                sessionStorage.setItem('token', userData.token);
                sessionStorage.setItem('jwt', userData.jwt);
                sessionStorageHelper.set('user', userData.user);
                sessionStorage.setItem('tenantDb', userData.tenantDb);
                sessionStorageHelper.set('userType', USER_TYPES.TENANT);
                sessionStorageHelper.set('accountId', userData.accountId);
                if (userData.remember) {
                    sessionStorageHelper.set('remember', true);
                }

                dispatch(authActions.tenantLoginSuccess(userData));
                return { success: true, data: result.data };
            } else {
                dispatch(authActions.tenantLoginFailure(result.message || 'Tenant login failed'));
                return { success: false, message: result.message || 'Tenant login failed' };
            }
        } catch (error) {
            const errorMessage = error.message || 'An error occurred during tenant login';
            dispatch(authActions.tenantLoginFailure(errorMessage));
            return { success: false, message: errorMessage };
        }
    };
};

// Google Login
// src/actions/auth.js

// Google Login - accepts FormData directly
export const googleLogin = (formData) => {
    return async (dispatch) => {
        dispatch(authActions.tenantLoginRequest());

        try {
            // FormData is already prepared, just send it
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.status === 'success') {
                const tenantDb = formData.get('tenant_db') || TENANT_DB;
                const userData = {
                    user: result.data.user,
                    token: result.data.token,
                    jwt: result.data.jwt || null,
                    tenantDb: tenantDb,
                    accountId: result.data.user?.account_id || null,
                };

                sessionStorageHelper.set('token', userData.token);
                sessionStorageHelper.set('jwt', userData.jwt);
                sessionStorageHelper.set('user', userData.user);
                sessionStorageHelper.set('tenantDb', userData.tenantDb);
                sessionStorageHelper.set('userType', USER_TYPES.TENANT);
                sessionStorageHelper.set('accountId', userData.accountId);

                dispatch(authActions.tenantLoginSuccess(userData));
                return { success: true, data: result.data };
            } else {
                dispatch(authActions.tenantLoginFailure(result.message || 'Google login failed'));
                return { success: false, message: result.message || 'Google login failed' };
            }
        } catch (error) {
            const errorMessage = error.message || 'An error occurred during Google login';
            dispatch(authActions.tenantLoginFailure(errorMessage));
            return { success: false, message: errorMessage };
        }
    };
};

// Logout
export const logoutUser = () => {
    return async (dispatch) => {
        try {
            const token = sessionStorageHelper.get('token');
            const userType = sessionStorageHelper.get('userType');

            if (token) {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        table: 'login',
                        cat: 'logout',
                        token: token,
                        user_type: userType || USER_TYPES.TENANT,
                    }),
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            sessionStorageHelper.clear();
            dispatch(authActions.logout());
        }
    };
};

// Check Auth
export const checkAuth = () => {
    return (dispatch) => {
        try {
            const token = sessionStorageHelper.get('token');
            const user = sessionStorageHelper.get('user');
            const tenantDb = sessionStorageHelper.get('tenantDb');
            const accountId = sessionStorageHelper.get('accountId');
            const userType = sessionStorageHelper.get('userType') || USER_TYPES.TENANT;
            const remember = sessionStorageHelper.get('remember');

            if (token && user) {
                dispatch(authActions.checkAuth({
                    user,
                    token,
                    tenantDb,
                    accountId,
                    userType,
                    remember: remember || false,
                }));
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Check auth error:', error);
            return { success: false };
        }
    };
};

// Refresh Token
export const refreshToken = () => {
    return async (dispatch) => {
        try {
            const token = sessionStorageHelper.get('token');
            const userType = sessionStorageHelper.get('userType');

            if (!token) {
                return { success: false, message: 'No token to refresh' };
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table: 'login',
                    cat: 'refresh',
                    token: token,
                    user_type: userType || USER_TYPES.TENANT,
                }),
            });

            const result = await response.json();

            if (result.success) {
                sessionStorageHelper.set('token', result.data.token);
                if (result.data.jwt) {
                    sessionStorageHelper.set('jwt', result.data.jwt);
                }
                dispatch(authActions.refreshToken(result.data.token, result.data.jwt));
                return { success: true, data: result.data };
            } else {
                // If refresh fails, logout
                dispatch(logoutUser());
                return { success: false, message: result.message || 'Token refresh failed' };
            }
        } catch (error) {
            console.error('Refresh token error:', error);
            dispatch(logoutUser());
            return { success: false, message: error.message || 'Token refresh failed' };
        }
    };
};