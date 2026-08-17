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
    USER_UPDATE_SUCCESS,
    USER_UPDATE_FAIL,
    USER_DELETE_SUCCESS,
    USER_DELETE_FAIL,
    USER_EDIT,
} from "../types/user";
import { MAIN_TOKEN, API_PATH_SETTING, axiosConfig, axiosConfig1 } from './common';

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
export const userLogin = data => (dispatch, getState) => {
    dispatch({type : USER_LOADING});
    
        axios.post(path, data, axiosConfig1)
            .then(res => {                                                                                                                                                                                                                                      
                dispatch({
                    type: USER_LOGIN,
                    payload: res.data.data,
                    token:'00'
                })
            })
            .catch(err => {
                dispatch({
                    type : USER_LOGIN_ERROR,
                    payload:err
                })
            })
};
export const userLoginSwitch = data => (dispatch, getState) => {
    dispatch({type : USER_LOADING});
        axios.post(path, data, axiosConfig1)
        .then(res => {                                                                                                                                                                                                                                      
            dispatch({
                type: USER_LOGIN_SWITCH,
                payload: res.data.data
            })
        })
        .catch(err => {
            
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
            alert(123)
            dispatch({
                type: USER_UPDATE_SUCCESS,
                payload: res.data.data
            })
        })
        .catch(err => {
            dispatch({
                type : USER_UPDATE_FAIL,
                payload: err
            })
        })
};
