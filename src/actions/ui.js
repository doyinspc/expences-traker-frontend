// src/actions/ui.js

export const uiActions = {
    toggleSidebar: () => ({
        type: "UI_TOGGLE_SIDEBAR",
    }),
    
    openModal: (content) => ({
        type: "UI_OPEN_MODAL",
        payload: content,
    }),
    
    closeModal: () => ({
        type: "UI_CLOSE_MODAL",
    }),
    
    setLoading: (loading) => ({
        type: "UI_SET_LOADING",
        payload: loading,
    }),
    
    setTheme: (theme) => ({
        type: "UI_SET_THEME",
        payload: theme,
    }),
    
    setLanguage: (language) => ({
        type: "UI_SET_LANGUAGE",
        payload: language,
    }),
    
    setPage: (page) => ({
        type: "UI_SET_PAGE",
        payload: page,
    }),
    
    setBreadcrumbs: (breadcrumbs) => ({
        type: "UI_SET_BREADCRUMBS",
        payload: breadcrumbs,
    }),
    
    setActiveTab: (tab) => ({
        type: "UI_SET_ACTIVE_TAB",
        payload: tab,
    }),
    
    showSnackbar: (message, severity = 'info') => ({
        type: "UI_SHOW_SNACKBAR",
        payload: { message, severity },
    }),
    
    hideSnackbar: () => ({
        type: "UI_HIDE_SNACKBAR",
    }),
    
    addNotification: (notification) => ({
        type: "UI_ADD_NOTIFICATION",
        payload: notification,
    }),
    
    removeNotification: (id) => ({
        type: "UI_REMOVE_NOTIFICATION",
        payload: id,
    }),
    
    clearNotifications: () => ({
        type: "UI_CLEAR_NOTIFICATIONS",
    }),
};