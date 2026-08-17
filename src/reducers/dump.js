
import {
    USER_LOGIN,
    USER_LOGIN_ERROR,
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
    USER_GET_MULTIPLE,
    USER_GET_ONE,
    USER_CHANGE_ONE,
    USER_REGISTER_SUCCESS,
    USER_REGISTER_FAIL,
    USER_LOADING,
    USER_LOADING_ERROR,
    USER_ACTIVATE_FAIL,
    USER_ACTIVATE_SUCCESS,
    USER_UPDATE_SUCCESS,
    USER_UPDATE_FAIL,
    USER_DELETE_SUCCESS,
    USER_DELETE_FAIL,
    USER_EDIT
} from "../types/user";
import {callSuccess, callError, callReg} from './../actions/common'

let auth = null;
let dropdownsStore = null;
let activetermStore = null;
let activeschoolStore = null;
let mySchoolStore = null;
let myDataStore = null;
let myTermStore = null
let user = null
let myregschx = null
let mscx = ''
let userx = sessionStorage['userx12345'] !== undefined && sessionStorage['userx12345']['data'] !== undefined && sessionStorage['userx12345']['data'].length > 0 ? JSON.parse(sessionStorage['userx12345']['data']) : null;
if(sessionStorage['userx12345'] !== undefined && sessionStorage['userx12345']['data'] !== undefined && sessionStorage['userx12345']['data'].length > 0){
auth = sessionStorage['userx12345'] !== undefined && sessionStorage['userx12345']['auth'] !== 'undefined' ? JSON.parse(sessionStorage['userx12345']['auth']) : false;
dropdownsStore = sessionStorage['userx12345'] !== undefined  ? JSON.parse(sessionStorage['userx12345']['dropdowns']): null;
activetermStore = sessionStorage['userx12345'] !== undefined  ? JSON.parse(sessionStorage['userx12345']['activeterm']): null;
activeschoolStore = sessionStorage['userx12345'] !== undefined  ?  JSON.parse(sessionStorage['userx12345']['activeschool']): null;
mySchoolStore = sessionStorage['userx12345'] !== undefined  ?  JSON.parse(sessionStorage['userx12345']['myschool']): null;
myDataStore = sessionStorage['userx12345'] !== undefined  ?  JSON.parse(sessionStorage['userx12345']['mydata']): null;
myTermStore = sessionStorage['userx12345'] !== undefined  ? JSON.parse(sessionStorage['userx12345']['myterm']): null;

if(userx !== null)
{
    user = userx;
    let accx = user.access !=='' ? JSON.parse(user.access):{};
    let schsx = Object.keys(accx);
    myregschx = user.schoolid && parseInt(user.schoolid) > 0 ? [...schsx, user.schoolid] : schsx;
    mscx = parseInt(user.is_admin) === 1 ? [1 ,2, 3, 4, 5, 6, 7, 8, 9, 10]: myregschx;
}     
}   

//localStorage.clear()
const initialState = {
    token: localStorage.getItem('token'),
    user: user  && user !== undefined && parseInt(user.id) > 0 ? userx: null,
    mid: user  && user !== undefined && parseInt(user.id) > 0 ? user.id: null,
    username: user  && user !== undefined && parseInt(user.id) > 0 ? user.surname+" "+user.firstname+" "+user.middlename: null,
    myschools:mscx && Array.isArray(mscx)? mscx : [],
    myTermData:myTermStore ? myTermStore : [],
    mySchoolData:mySchoolStore ? mySchoolStore : [],
    myData:myDataStore ? myDataStore : [],
    dropdowns:dropdownsStore ? dropdownsStore : [],
    activeschool: activeschoolStore ? activeschoolStore : {},
    activeterm: activetermStore && activetermStore !== null && activetermStore !== undefined ? activetermStore : {},
    isAuthenticated: auth  && parseInt(auth) === 1 ? true : false,
    isLoading: false,
    isRegistered: userx && parseInt(userx.id) > 0 ? true: false,
    isAdmin: user && 'is_admin' in user && parseInt(user.is_admin) === 1 ? true : false,
    dates: user !== null && 'dates' in user && user.dates ? user.dates : new Date('10-10-2020'),
    msg: null,
    isEdit:-1,
    ref:null,
}


export default function(state = initialState, action){
    switch (action.type) {
        case USER_LOADING:
            return {
                ...state,
                isLoading : true
            };
        case USER_LOGIN:
            
            //user logged in successfully
            console.log(action.payload);
            sessionStorage.setItem('userx12345', {})
            sessionStorage['userx12345']['token'] = action.token;
            sessionStorage['userx12345']['auth'] = JSON.stringify(1);
            
            console.log(sessionStorage['userx12345']);
            if(sessionStorage['userx12345']['data'] === null)
            {
                sessionStorage['userx12345']['data'] = JSON.stringify(action.payload);
            }

            // let acc = action.payload.access !== '' ? JSON.parse(action.payload.access):{};
            // let schs = Object.keys(acc);
            // let myregsch = [];
            
            // if(Array.isArray(schs) && schs.length > 0)
            // {
            //     myregsch = action.payload.schoolid && parseInt(action.payload.schoolid) > 0 ? [...schs, action.payload.schoolid] : schs;
            // }else
            // {
            //     myregsch.push(action.payload.schoolid);
            // }
            
            let fname = action.payload.surname+" "+action.payload.firstname+" "+action.payload.middlename
            let msc = parseInt(action.payload.is_admin) === 1 ? [1 ,2, 3, 4, 5, 6, 7, 8, 9, 10] : [];
            console.log(sessionStorage['userx12345']['data']);
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                mid:action.payload.id,
                user: JSON.parse(sessionStorage['userx12345']['data']) ,
                username: fname,
                myschools: msc,
                ref:23,
                isAdmin: parseInt(action.payload.is_admin) === 1 ? true : false,
                dates: action.payload.dates
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
            sessionStorage['userx12345']['data'] =  JSON.stringify(action.payload);
            callSuccess()
            return {
                ...state,
                ...action.payload,
                user : action.payload
            }; 
         case USER_GET_DROPDOWNS:
            sessionStorage['userx12345']['dropdowns'] = JSON.stringify(action.payload);
            //localStorage.setItem('dropdowns', JSON.stringify(action.payload));
            let tm = action.payload[3] && action.payload[3].length > 0 ? action.payload[3][0]:{}
            sessionStorage['userx12345']['activeterm'] = JSON.stringify(tm);
            //localStorage.setItem('activeterm', JSON.stringify(tm));
            return {
                ...state,
                dropdowns : action.payload,
                activeterm : tm
            };
          case USER_GET_DROPDOWNS_ERROR:
            //localStorage.setItem('dropdowns', JSON.stringify([]));
            sessionStorage['userx12345']['activeterm'] = JSON.stringify([]);
            return {
                ...state,
                dropdowns : []
            };
          case USER_GET_DATA:
            //localStorage.setItem('mydata', JSON.stringify(action.payload));
            sessionStorage['userx12345']['mydata'] = JSON.stringify(action.payload);
            return {
                ...state,
                myData : action.payload
            };
          case USER_GET_DATA_ERROR:
            //localStorage.setItem('mydata', JSON.stringify([]));
            sessionStorage['userx12345']['mydata'] = JSON.stringify([]);
            return {
                ...state,
                myData : []
            };
          case USER_GET_SCHOOL:
            //localStorage.setItem('myschool', JSON.stringify(action.payload));
            sessionStorage['userx12345']['myschool'] = JSON.stringify(action.payload);
            return {
                ...state,
                mySchoolData : action.payload
            };
          case USER_GET_SCHOOL_ERROR:
            sessionStorage['userx12345']['myschool'] = JSON.stringify([]);
            //localStorage.setItem('myschool', JSON.stringify([]));
            return {
                ...state,
                mySchoolData : []
            };
          case USER_GET_TERM:
            //localStorage.setItem('activeterm', JSON.stringify(action.payload));
            sessionStorage['userx12345']['activeterm'] = JSON.stringify(action.payload);
            return {
                ...state,
                myTermData : action.payload
            };
          case USER_GET_TERM_ERROR:
            //localStorage.setItem('activeterm', JSON.stringify([]));
            sessionStorage['userx12345']['activeterm'] = JSON.stringify([]);
            return {
                ...state,
                myTermData : []
            };
          case USER_SET_TERM:
            localStorage.setItem('activeterm', JSON.stringify(action.payload));
            sessionStorage['userx12345']['activeterm'] = JSON.stringify(action.payload);
            return {
                ...state,
                activeterm : JSON.parse(sessionStorage['activeterm'])
            };
          case USER_SET_SCHOOL:
            if(action.payload && Array.isArray(Object.keys(action.payload)))
            {
                localStorage.setItem('activeschool', JSON.stringify(action.payload));
            }
            return {
                ...state,
                activeschool : JSON.parse(sessionStorage['activeschool'])
            };
        case USER_LOGIN_ERROR:
        case USER_LOGOUT_SUCCESS:
        case USER_LOGOUT_FAIL:
            localStorage.removeItem('token')
            localStorage.removeItem('auth')
            localStorage.removeItem('user')
            localStorage.removeItem('dropdowns')
            localStorage.removeItem('activeterm')
            localStorage.removeItem('activeschool')
            localStorage.removeItem('myterm')
            localStorage.removeItem('myschool')
            localStorage.removeItem('mydata')
            localStorage.clear()
            
            //callError(action.payload);
            return{
                ...state,
                token: null,
                isRegistered: false,
                isAuthenticated: false,
                isLoading: false,
                user: {},
                user: {},
                isAdmin : null,
                mid:null
            } 
        default:
            return state;
    }

}