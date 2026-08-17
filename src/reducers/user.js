import { callSuccess, callError, isJsonParsable } from "../actions/common";
import { isArrayWithValue } from "../utils/functions";
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
    USER_GET_TERM,
    USER_GET_DROPDOWNS,
    USER_GET_DATA,
    USER_GET_SCHOOL,
    USER_GET_TERM_ERROR,
    USER_GET_DROPDOWNS_ERROR,
    USER_GET_DATA_ERROR,
    USER_GET_SCHOOL_ERROR,
    USER_SET_TERM,
    USER_SET_SCHOOL,
    USER_REGISTER_FAIL,
    USER_LOADING,
    USER_LOADING_ERROR,
    USER_LOADING_SWITCH,
    USER_ACTIVATE_FAIL,
    USER_UPDATE_SUCCESS,
    USER_UPDATE_FAIL,
    USER_DELETE_FAIL,
    USER_CHANGE_TERM,
} from "./user_types";

 
let user = isJsonParsable(sessionStorage.getItem('userx12345')) ? JSON.parse(sessionStorage.getItem('userx12345')) : null;
let auth = isJsonParsable(sessionStorage.getItem('auth')) ? JSON.parse(sessionStorage.getItem('auth')) : false;
let school_data = isJsonParsable(sessionStorage.getItem('school_data')) ? JSON.parse(sessionStorage.getItem('school_data')) : false;
let term_data = isJsonParsable(sessionStorage.getItem('term_data')) ? JSON.parse(sessionStorage.getItem('term_data')) : false;
let term_data1 = isJsonParsable(sessionStorage.getItem('term_data1')) ? JSON.parse(sessionStorage.getItem('term_data1')) : false;
let access_data = isJsonParsable(sessionStorage.getItem('access_data')) ? JSON.parse(sessionStorage.getItem('access_data')) : false;
let role_data = isJsonParsable(sessionStorage.getItem('role_data')) ? JSON.parse(sessionStorage.getItem('role_data')) : false;
let session_data = isJsonParsable(sessionStorage.getItem('session_data')) ? JSON.parse(sessionStorage.getItem('session_data')) : false;
let log_status = isJsonParsable(sessionStorage.getItem('log_status')) ? JSON.parse(sessionStorage.getItem('log_status')) : 0;


//sessionStorage.clear()
const initialState = {
    token: sessionStorage.getItem('token'),
    isAuthenticated : auth || false,
    user: user  && user !== undefined && parseInt(user.id) > 0 ? user: null,
    username: user  && user !== undefined && parseInt(user.id) > 0 ? user.surname+" "+user.firstname+" "+user.middlename: null,
    isAdmin: user && parseInt(user.is_admin) === 1 ? true : false,
    school_data: school_data  && school_data !== undefined && parseInt(school_data.id) > 0 ? school_data: null,
    term_data: term_data  && term_data !== undefined && parseInt(term_data.id) > 0 ? term_data: null,
    term_data1: term_data1  && term_data1 !== undefined && parseInt(term_data1.id) > 0 ? term_data1 : (term_data ?? null),
    access_data: access_data  && access_data !== undefined && parseInt(access_data.id) > 0 ? access_data: null,
    role_data: role_data  && role_data !== undefined && isArrayWithValue(role_data) ? role_data: null,
    session_data: session_data  && session_data !== undefined && parseInt(session_data.id) > 0 ? session_data: null,
    log_status: log_status  && log_status !== undefined && parseInt(log_status) > 0 ? log_status: null,
    isForgotPassword:0,
    isChangePassword:0,
    error: null,
    isLoading: false,
    isSwitchLoading: false,
}



export default function(state = initialState, action){
    switch (action.type) {
        case USER_LOADING:
            return {
                ...state,
                isLoading : true
            };
        case USER_LOADING_SWITCH:
            return {
                ...state,
                isSwitchLoading : true
            };
        case USER_FORGOT_PASSWORD:
            callSuccess("Please Check your email")
            return {
                ...state,
                isForgotPassword : 2
            };
        case USER_CHANGE_PASSWORD:
            callSuccess("Password change successful")
            return {
                ...state,
                isChangePassword : 2
        };
        case USER_FORGOT_PASSWORD_ERROR:
            callError(action.msg)
            return {
                ...state,
                isForgotPassword : 3
            };
        case USER_CHANGE_PASSWORD_ERROR:
            callError(action.msg)
            return {
                ...state,
                isChangePassword : 3
        };
        case USER_CHANGE_TERM:
            sessionStorage.setItem('term_data1', JSON.stringify(action.payload));
            sessionStorage.setItem('term_data', JSON.stringify(action.payload));
            return {
                ...state,
                term_data1 : action.payload,
                term_data : action.payload,
        };
        case USER_LOGIN:
            const { school_data, term_data, access_data, ...userData } = action.payload;

            // Correctly determine isAdmin based on the user data from the payload
            const isAdmin = parseInt(userData.is_admin) === 1;
            const username = `${userData.surname || ''} ${userData.firstname || ''} ${userData.middlename || ''}`.trim();

            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: userData,
                school_data: school_data,
                term_data: term_data,
                term_data1: term_data,
                access_data: access_data,
                log_status: action.typeid,
                username: username,
                isAdmin: isAdmin,
                error: null,
            };
        case USER_LOGIN_SWITCH:
                
                let  {school_data:school_data1, term_data:term_data1, access_data:access_data1, session_data:session_data1} = action.payload || {}   
                
                sessionStorage.setItem('school_data', JSON.stringify(school_data1));
                sessionStorage.setItem('term_data', JSON.stringify(term_data1));
                sessionStorage.setItem('access_data', JSON.stringify(access_data1));
                sessionStorage.setItem('session_data', JSON.stringify(session_data1));
                
                return {
                    ...state,
                    isSwitchLoading: false,
                    school_data:school_data1,
                    term_data:term_data1,
                    term_data1:term_data1,
                    access_data: access_data1,
                    session_data: session_data1,
                    isAuthenticated: true
                }; 
            
        case USER_LOADING_ERROR:
        case USER_ACTIVATE_FAIL:
        case USER_REGISTER_FAIL:
        case USER_DELETE_FAIL:
        case USER_UPDATE_FAIL:

            return {
                ...state,
                isLoading: false,
                msg: action.msg
            };
       
         case USER_UPDATE_SUCCESS:
            const { school_data:school_data_update, term_data:term_data_update, access_data:access_data_update, ...userDataUpdate } = action.payload;

            // Correctly determine isAdmin based on the user data from the payload
            const usernameUpdate = `${userDataUpdate.surname || ''} ${userDataUpdate.firstname || ''} ${userDataUpdate.middlename || ''}`.trim();

            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: userDataUpdate,
                school_data: school_data_update,
                term_data: term_data_update,
                term_data1: term_data_update,
                access_data: access_data_update,
                log_status: action.typeid,
                username: usernameUpdate,
                error: null,
            }; 
         case USER_GET_DROPDOWNS:
            sessionStorage.setItem('dropdowns', JSON.stringify(action.payload));
            let tm = action.payload[3] && action.payload[3].length > 0 ? action.payload[3][0]:{}
            sessionStorage.setItem('activeterm', JSON.stringify(tm));
            return {
                ...state,
                dropdowns : action.payload,
                activeterm : tm
            };
          case USER_GET_DROPDOWNS_ERROR:
            sessionStorage.setItem('dropdowns', JSON.stringify([]));
            return {
                ...state,
                dropdowns : []
            };
          case USER_GET_DATA:
            sessionStorage.setItem('mydata', JSON.stringify(action.payload));
            return {
                ...state,
                myData : action.payload
            };
          case USER_GET_DATA_ERROR:
            sessionStorage.setItem('mydata', JSON.stringify([]));
            return {
                ...state,
                myData : []
            };
          case USER_GET_SCHOOL:
            sessionStorage.setItem('myschool', JSON.stringify(action.payload));
            return {
                ...state,
                mySchoolData : action.payload
            };
          case USER_GET_SCHOOL_ERROR:
            sessionStorage.setItem('myschool', JSON.stringify([]));
            return {
                ...state,
                mySchoolData : []
            };
          case USER_GET_TERM:
            sessionStorage.setItem('activeterm', JSON.stringify(action.payload));
            return {
                ...state,
                myTermData : action.payload
            };
          case USER_GET_TERM_ERROR:
            sessionStorage.setItem('activeterm', JSON.stringify([]));
            return {
                ...state,
                myTermData : []
            };
          case USER_SET_TERM:
            sessionStorage.setItem('activeterm', JSON.stringify(action.payload));
            return {
                ...state,
                activeterm : JSON.parse(sessionStorage.getItem('activeterm'))
            };
          case USER_SET_SCHOOL:
            if(action.payload && Array.isArray(Object.keys(action.payload)))
            {
                sessionStorage.setItem('activeschool', JSON.stringify(action.payload));
            }
            return {
                ...state,
                activeschool : JSON.parse(sessionStorage.getItem('activeschool'))
            };
        case USER_LOGIN_ERROR:
            sessionStorage.clear()
            return{
                ...state,
                isLoading: false,
                isSwitchLoading :false,
                isAuthenticated: false,
                user: null,
                school_data: null,
                term_data: null,
                access_data: null,
                log_status: 0,
                username: null,
                isAdmin: false,
                error: action.payload
            } 
        case USER_LOGOUT_SUCCESS:
        case USER_LOGOUT_FAIL:
            sessionStorage.removeItem('activeschool')
            sessionStorage.clear()
            localStorage.clear()
            
            return initialState; 
        default:
            return state;
    }

}