import axios from 'axios';
import {
    USER_LOGIN,
    USER_LOGIN_SWITCH,
    USER_LOGIN_ERROR,
    USER_FORGOT_PASSWORD,
    USER_FORGOT_PASSWORD_ERROR,
    USER_CHANGE_PASSWORD,
    USER_CHANGE_PASSWORD_ERROR,
    USER_LOGOUT_SUCCESS,
    USER_LOGOUT_FAIL,
    USER_GET_ONE,
    USER_CHANGE_ONE,
    USER_GET_DROPDOWNS,
    USER_GET_DATA,
    USER_GET_SCHOOL,
    USER_GET_TERM,
    USER_GET_DROPDOWNS_ERROR,
    USER_GET_DATA_ERROR,
    USER_GET_SCHOOL_ERROR,
    USER_GET_TERM_ERROR,
    USER_SET_TERM,
    USER_SET_SCHOOL,
    USER_GET_MULTIPLE,
    USER_REGISTER_SUCCESS,
    USER_REGISTER_FAIL,
    USER_LOADING,
    USER_LOADING_ERROR,
    USER_LOADING_SWITCH,
    USER_UPDATE_SUCCESS,
    USER_UPDATE_FAIL,
    USER_DELETE_SUCCESS,
    USER_DELETE_FAIL,
    USER_EDIT,
    USER_CHANGE_TERM,
} from "./user_types";

import { MAIN_TOKEN, API_PATH_SETTING, axiosConfig, axiosConfig1, callSuccess } from '../actions/common';

let TABLE_NAME = 'user_types';
const path = API_PATH_SETTING;

let params = {
    data:{},
    cat:'all',
    table:TABLE_NAME,
    token:MAIN_TOKEN
  }
//GET ALL USER 
export const getUsers = params => (dispatch, getState) => {
        axios.get(path, {params}, axiosConfig)
            .then(res => {                                                                                                                                                                                                                                        
                dispatch({
                    type: USER_GET_MULTIPLE,
                    payload: res.data
                })
            })
            .catch(err => {
                dispatch({
                    type : USER_LOADING_ERROR,
                    payload:err
                })
            })
};
//GET ALL DROPDOWNS
export const getUserdropdowns = params => (dispatch, getState) => {
        axios.get(path, {params}, axiosConfig)
            .then(res => {                                                                                                                                                                                                                                        
                dispatch({
                    type: USER_GET_DROPDOWNS,
                    payload: res.data
                })
            })
            .catch(err => {
                dispatch({
                    type : USER_GET_DROPDOWNS_ERROR,
                    payload:err
                })
            })
};
//GET ALL TERMS
export const getUserTerms = params => (dispatch, getState) => { 
    axios.get(path, {params}, axiosConfig)
        .then(res => {                                                                                                                                                                                                                                        
            dispatch({
                type: USER_GET_TERM,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type : USER_GET_TERM_ERROR,
                payload:err
            })
        })
};
//GET ALL SCHOOLS
export const getUserSchools = params => (dispatch, getState) => { 
        axios.get(path, {params}, axiosConfig)
            .then(res => {                                                                                                                                                                                                                                        
                dispatch({
                    type: USER_GET_SCHOOL,
                    payload: res.data
                })
            })
            .catch(err => {
                dispatch({
                    type : USER_GET_SCHOOL_ERROR,
                    payload:err
                })
            })
};
//GET ALL DATA
export const getUserDatas = params => (dispatch, getState) => {
    axios.get(path, {params}, axiosConfig)
        .then(res => {                                                                                                                                                                                                                                        
            dispatch({
                type: USER_GET_DATA,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type : USER_GET_DATA_ERROR,
                payload:err
            })
        })
};
export const userLogin = (data, typeid) => (dispatch, getState) => {
        dispatch({type : USER_LOADING});
        axios.post(path, data, axiosConfig1)
            .then(res => {
                if (res.status === 200 && res.data.status === 'success') {
                const { school_data, term_data, access_data, role_data, ...userData } = res.data.data;

                // Save all data to sessionStorage here.
                sessionStorage.setItem('token', res.data.token || 'some_default_token');
                sessionStorage.setItem('userx12345', JSON.stringify(userData));
                sessionStorage.setItem('school_data', JSON.stringify(school_data));
                sessionStorage.setItem('term_data', JSON.stringify(term_data));
                sessionStorage.setItem('term_data1', JSON.stringify(term_data));
                sessionStorage.setItem('access_data', JSON.stringify(access_data));
                sessionStorage.setItem('role_data', JSON.stringify(role_data));
                sessionStorage.setItem('log_status', JSON.stringify(typeid));
                sessionStorage.setItem('tokentime', new Date().getTime() + (120 * 60 * 1000));
                sessionStorage.setItem('auth', JSON.stringify(1));
                
                // Dispatch a success action with the data and redirect URL
                dispatch({
                    type: USER_LOGIN,
                    payload: res.data.data,
                    typeid : typeid,
                    token : '00'
                }); 
                }else {
                    // Failure: Dispatch a failure action.
                    dispatch({
                        type: USER_LOGIN_ERROR,
                        payload: res?.data?.message || 'Login failed',
                    });
                }                                                                                                                                                                                                                                    
            })
            .catch(err => {
                dispatch({
                    type : USER_LOGIN_ERROR,
                    payload: err?.response?.data?.message || 'Login failed',
                })
            })
};
export const userLoginSwitch = data => (dispatch, getState) => {
    dispatch({type : USER_LOADING_SWITCH});
        axios.post(path, data, axiosConfig1)
        .then(res => {  
            if (res.status === 200 && res.data.status === 'success') {
                const { school_data, term_data, access_data, role_data, session_data, ...userData } = res.data.data;

                sessionStorage.setItem('school_data', JSON.stringify(school_data));
                sessionStorage.setItem('term_data', JSON.stringify(term_data));
                sessionStorage.setItem('access_data', JSON.stringify(access_data));
                sessionStorage.setItem('role_data', JSON.stringify(role_data));
                sessionStorage.setItem('session_data', JSON.stringify(session_data));
                
                // Dispatch a success action with the data and redirect URL
                dispatch({
                    type: USER_LOGIN_SWITCH,
                    payload: res.data.data,
                    typeid : typeid,
                    token : '00'
                }); 
            }else {
                dispatch({
                    type : USER_LOGIN_ERROR,
                    payload: 'Login failed',
                });
            }
        })
        .catch(err => {
            dispatch({
                type : USER_LOGIN_ERROR,
                payload: err?.response?.data?.message || 'Login failed',
            });
        })
};
export const forgetPassword = data => (dispatch, getState) => {
        axios.post(path, data, axiosConfig1)
            .then(res => {                                                                                                                                                                                                                                      
                dispatch({
                    type: USER_FORGOT_PASSWORD
                })
            })
            .catch(err => {
                dispatch({
                    type : USER_FORGOT_PASSWORD_ERROR,
                    payload:err,
                    msg:err.message
                })
            })
};
export const changePassword = data => (dispatch, getState) => {
        axios.post(path, data, axiosConfig1)
            .then(res => {                                                                                                                                                                                                                                      
                dispatch({
                    type: USER_CHANGE_PASSWORD
                })
            })
            .catch(err => {
                dispatch({
                    type : USER_CHANGE_PASSWORD_ERROR,
                    payload:err,
                    msg:err.message
                })
            })
};
export const userLogout = () => (dispatch, getState) => {
    dispatch({
        type: USER_LOGOUT_SUCCESS
    })
       
};
//GET SINGLE USER 
export const getUser = id => (dispatch, getState) => {
    //SET PAGE LOADING
    dispatch(
        {
        type : USER_GET_ONE,
        payload: id
    });  
};
//SET SESSION
export const setTerm = id => (dispatch, getState) => {
    let params = {
        data:JSON.stringify({
            id:id
        }),
        'table' :'datas',
        'cat': 'getOneTerm',
        "narration": "",
    }
    axios.get(path, {params}, axiosConfig)
        .then(res => {    
            //window.location.reload()                                                                                                                                                                                                                                    
            dispatch({
                type: USER_CHANGE_TERM,
                payload: res.data
            })
        })
        .catch(err => {

        })
};
export const settTerm = data => (dispatch, getState) => {
    dispatch(
        {
        type : USER_SET_TERM,
        payload: data
        });  
};
//SET SCHOOL
export const settSchool = data => (dispatch, getState) => {
    dispatch(
        {
        type : USER_SET_SCHOOL,
        payload: data
    });  
};
//USER DELETE
export const deleteUser = data => (dispatch, getState) =>{
    dispatch({type : USER_LOADING});
    axios.get(path, JSON.stringify({data}), {params})
        .then(res => {
            dispatch({
                type: USER_DELETE_SUCCESS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type : USER_DELETE_FAIL,
                payload : err
            })
        })
        
}
//USER REGISTER
export const registerUser = data => dispatch => {
    dispatch({type : USER_LOADING});
    axios.post(path, data, axiosConfig1)
        .then(res => {
            dispatch({
                type: USER_REGISTER_SUCCESS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type : USER_REGISTER_FAIL,
                payload: err
            })
        })
};
//USER REGISTER
export const registerUserPost = data => dispatch => {
    axios.post(path, data, axiosConfig1)
        .then(res => {
            dispatch({
                type: USER_LOGIN,
                payload: res.data.data,
                token: res.data.token
            })
        })
        .catch(err => {
            dispatch({
                type : USER_UPDATE_FAIL,
                payload: err
            })
        })
};
 //USER UPDATE
export const updateUser = params => (dispatch, getState) => {
    //body
 
    axios.post(path, params, axiosConfig1)
        .then(res => {
            if (res.status === 200 && res.data.status === 'success') {
                const { school_data, term_data, access_data, ...userData } = res.data.data;

                // Save all data to sessionStorage here.
                sessionStorage.setItem('token', res.data.token || 'some_default_token');
                sessionStorage.setItem('userx12345', JSON.stringify(userData));
                sessionStorage.setItem('school_data', JSON.stringify(school_data));
                sessionStorage.setItem('term_data', JSON.stringify(term_data));
                sessionStorage.setItem('term_data1', JSON.stringify(term_data));
                sessionStorage.setItem('access_data', JSON.stringify(access_data));
                sessionStorage.setItem('log_status', JSON.stringify(typeid));
                sessionStorage.setItem('tokentime', new Date().getTime() + (120 * 60 * 1000));
                sessionStorage.setItem('auth', JSON.stringify(1));
                callSuccess('')
                
                // Dispatch a success action with the data and redirect URL
                dispatch({
                    type: USER_UPDATE_SUCCESS,
                    payload: res.data.data,
                    token : '00'
                }); 
                }else {
                    // Failure: Dispatch a failure action.
                    dispatch({
                        type: USER_UPDATE_FAIL,
                        payload: res?.data?.message || 'Login failed',
                    });
                } 
        })
        .catch(err => {
            dispatch({
                type : USER_UPDATE_FAIL,
                payload: err
            })
        })
};
