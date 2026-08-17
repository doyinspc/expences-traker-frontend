// src/reducers/ui.js

const initialState = {
    sidebarOpen: true,
    modalOpen: false,
    modalContent: null,
    loading: false,
    theme: 'light',
    language: 'en',
    currentPage: 'dashboard',
    breadcrumbs: [],
    activeTab: null,
    snackbar: {
        open: false,
        message: '',
        severity: 'info',
    },
    notifications: [],
};

export default function ui(state = initialState, action) {
    switch (action.type) {
        case "UI_TOGGLE_SIDEBAR":
            return {
                ...state,
                sidebarOpen: !state.sidebarOpen,
            };

        case "UI_OPEN_MODAL":
            return {
                ...state,
                modalOpen: true,
                modalContent: action.payload,
            };

        case "UI_CLOSE_MODAL":
            return {
                ...state,
                modalOpen: false,
                modalContent: null,
            };

        case "UI_SET_LOADING":
            return {
                ...state,
                loading: action.payload,
            };

        case "UI_SET_THEME":
            return {
                ...state,
                theme: action.payload,
            };

        case "UI_SET_LANGUAGE":
            return {
                ...state,
                language: action.payload,
            };

        case "UI_SET_PAGE":
            return {
                ...state,
                currentPage: action.payload,
            };

        case "UI_SET_BREADCRUMBS":
            return {
                ...state,
                breadcrumbs: action.payload,
            };

        case "UI_SET_ACTIVE_TAB":
            return {
                ...state,
                activeTab: action.payload,
            };

        case "UI_SHOW_SNACKBAR":
            return {
                ...state,
                snackbar: {
                    open: true,
                    message: action.payload.message,
                    severity: action.payload.severity || 'info',
                },
            };

        case "UI_HIDE_SNACKBAR":
            return {
                ...state,
                snackbar: {
                    ...state.snackbar,
                    open: false,
                },
            };

        case "UI_ADD_NOTIFICATION":
            return {
                ...state,
                notifications: [
                    {
                        id: Date.now(),
                        ...action.payload,
                    },
                    ...state.notifications,
                ],
            };

        case "UI_REMOVE_NOTIFICATION":
            return {
                ...state,
                notifications: state.notifications.filter(
                    n => n.id !== action.payload
                ),
            };

        case "UI_CLEAR_NOTIFICATIONS":
            return {
                ...state,
                notifications: [],
            };

        default:
            return state;
    }
}