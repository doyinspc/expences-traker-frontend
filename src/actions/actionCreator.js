import axios from "axios";
import Swal from 'sweetalert2';
import { API_PATH_SETTING, axiosConfig, axiosConfig1 } from "./common";

// ============================================
// CONSTANT: Get tenant DB from sessionStorage or env
// ============================================
const getTenantDb = () => {
    return sessionStorage.getItem('tenantDb') || import.meta.env.VITE_APP_TENANT_DB || 'expences1';
};

/**
 * Manages Redux action creators for item-related operations.
 * These actions are pure functions that return action objects,
 * designed to be dispatched after API calls managed by TanStack Query.
 */
class ActionCreators {

    GET_ONE;
    CLEAR_ONE;
    GET_MULTIPLE;
    REGISTER_SUCCESS;
    REGISTER_FAIL;
    LOADING;
    LOADING_ERROR;
    UPDATE_SUCCESS;
    UPDATE_FAIL;
    DELETE_SUCCESS;
    DELETE_FAIL;
    ACTIVATE_SUCCESS;
    PROCESSING;
    CLEAR_MESSAGE;
    
    constructor(prefix) {
        if (typeof prefix !== 'string' || prefix.trim() === '') {
            console.error("ActionCreators constructor: 'prefix' must be a non-empty string.");
        }

        const normalizedPrefix = prefix.trim().toUpperCase();

        this.GET_ONE = `${normalizedPrefix}_GET_ONE`;
        this.CLEAR_ONE = `${normalizedPrefix}_CLEAR_ONE`;
        this.GET_MULTIPLE = `${normalizedPrefix}_GET_MULTIPLE`;
        this.REGISTER_SUCCESS = `${normalizedPrefix}_REGISTER_SUCCESS`;
        this.REGISTER_FAIL = `${normalizedPrefix}_REGISTER_FAIL`;
        this.LOADING = `${normalizedPrefix}_LOADING`;
        this.PROCESSING = `${normalizedPrefix}_PROCESSING`;
        this.LOADING_ERROR = `${normalizedPrefix}_LOADING_ERROR`;
        this.UPDATE_SUCCESS = `${normalizedPrefix}_UPDATE_SUCCESS`;
        this.UPDATE_FAIL = `${normalizedPrefix}_UPDATE_FAIL`;
        this.DELETE_SUCCESS = `${normalizedPrefix}_DELETE_SUCCESS`;
        this.DELETE_FAIL = `${normalizedPrefix}_DELETE_FAIL`;
        this.ACTIVATE_SUCCESS = `${normalizedPrefix}_ACTIVATE_SUCCESS`;
        this.CLEAR_MESSAGE = `${normalizedPrefix}_CLEAR_MESSAGE`;
    }

    setItems(itemsData) {
        return {
            type: this.GET_MULTIPLE,
            payload: itemsData
        };
    }

    getItemById(id) {
        return {
            type: this.GET_ONE,
            payload: id
        };
    }

    clearItem() {
        return {
            type: this.CLEAR_ONE,
            payload: {}
        };
    }

    deleteItemSuccess(id) {
        return {
            type: this.DELETE_SUCCESS,
            payload: id
        };
    }

    registerItemSuccess(newItemData) {
        return {
            type: this.REGISTER_SUCCESS,
            payload: newItemData
        };
    }

    updateItemSuccess(updatedItemData) {
       
        return {
            type: this.UPDATE_SUCCESS,
            payload: updatedItemData
        };
    }

    itemLoading() {
        return { type: this.LOADING };
    }

    itemProcessing() {
        return { type: this.PROCESSING };
    }

    itemLoadingError(error) {
        return { type: this.LOADING_ERROR, payload: error };
    }

    itemRegisterFail(error) {
        return { type: this.REGISTER_FAIL, payload: error };
    }

    itemUpdateFail(error) {
        return { type: this.UPDATE_FAIL, payload: error };
    }

    itemDeleteFail(error) {
        return { type: this.DELETE_FAIL, payload: error };
    }

    activateItemSuccess(activatedItemData) {
        return {
            type: this.ACTIVATE_SUCCESS,
            payload: activatedItemData
        };
    }

    clearMessage() {
        return { type: this.CLEAR_MESSAGE };
    }

    getAllDatas = (params) => async (dispatch) => {
        dispatch(this.itemLoading());
        try {
            const res = await axios.get(API_PATH_SETTING, { 
                params: {
                    ...params,
                    tenant_db: getTenantDb()
                }
            }, axiosConfig());  // <-- CALL THE FUNCTION
            dispatch(this.setItems(res.data));
        } catch (err) {
            console.log(err)
            dispatch(this.itemLoadingError(err));
        }
    };

    getOneData = (id) => (dispatch) => {
        dispatch(this.itemProcessing());
        dispatch(this.getItemById(id));
    }

    registerData = (params) => (dispatch) => {
        dispatch(this.itemProcessing());
        const data = {
            ...params,
            tenant_db: getTenantDb()
        };
        axios.post(API_PATH_SETTING, data, axiosConfig1())  // <-- CALL THE FUNCTION
        .then(res => {
            dispatch(this.registerItemSuccess(res.data.data));
            this.successAlert(res.data);
        })
        .catch(err => {
            dispatch(this.itemRegisterFail(err));
            this.failAlert(err.response ? err.response.data : { msg: "An error occurred." });
        });
    }

    updateData = (params) => (dispatch) => {
        dispatch(this.itemProcessing());
        const data = {
            ...params,
            tenant_db: getTenantDb()
        };
        axios.post(API_PATH_SETTING, data, axiosConfig1())  // <-- CALL THE FUNCTION
        .then(res => {
            dispatch(this.updateItemSuccess(res.data.data));
            this.successAlert(res.data);
        })
        .catch(err => {
            dispatch(this.itemUpdateFail(err));
            this.failAlert(err.response ? err.response.data : { msg: "An error occurred." });
        });
    }

    deleteData = (params, id) => (dispatch) => {
        dispatch(this.itemProcessing());
        const data = {
            ...params,
            tenant_db: getTenantDb()
        };
        axios.post(API_PATH_SETTING, data, axiosConfig1())  // <-- CALL THE FUNCTION
            .then(res => {
                dispatch(this.deleteItemSuccess(id)); 
                this.successAlert(res.data);
            })
            .catch(err => {
                dispatch(this.itemDeleteFail(err));
                this.failAlert(err.response ? err.response.data : { msg: "An error occurred." });
            });
    }

    activateData = (params) => (dispatch) => {
        dispatch(this.itemProcessing());
        const data = {
            ...params,
            tenant_db: getTenantDb()
        };
        axios.post(API_PATH_SETTING, data, axiosConfig1())  // <-- CALL THE FUNCTION
            .then(res => {
                dispatch(this.activateItemSuccess(res.data.data));
                this.successAlert(res.data);
            })
            .catch(err => {
                dispatch(this.itemUpdateFail(err));
                this.failAlert(err.response ? err.response.data : { msg: "An error occurred." });
            });
    }

    successAlert = (res) => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: res.msg || 'Operation was successful!',
            timer: 3000,
            showConfirmButton: false,
        });
    }
    
    failAlert = (err) => {
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: err.msg || 'An unknown error occurred.',
            timer: 3000,
            showConfirmButton: false,
        });
    }
}

export default ActionCreators;