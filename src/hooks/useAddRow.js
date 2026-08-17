import axios from "axios"
import { useCallback, useState } from "react"
import { useDispatch } from "react-redux"
import { API_PATH_SETTING, axiosConfig1 } from "../actions/common"


export default function useAddRow(props){
    
    const {reduxClass, table, paramConstant, querytype, redux} = props || undefined
    const dispatch = useDispatch()

    const [isLoading, setisLoading] = useState(false)
    const [error, seterror] = useState(null)
   
    const load = useCallback((param) => {
        let params = new FormData()
        params.append('cat', querytype || 'insert')
        params.append('table', table)
        if(param && Array.isArray(Object.keys(param)) && Object.keys(param).length > 0){
            Object.keys(param).forEach(element => {
                params.append(element, param[element])
            });
        }
        if(paramConstant && Array.isArray(Object.keys(paramConstant)) && Object.keys(paramConstant).length > 0){
            Object.keys(paramConstant).forEach(element => {
                params.append(element, paramConstant[element])
            });
        }
        if(redux){
            dispatch(reduxClass(params))
        }else{
            setisLoading(false)
            axios.post(API_PATH_SETTING, params, axiosConfig1)
            .then(res=>{seterror(null); setisLoading(false)})
            .catch(err=>{seterror('Failed'); setisLoading(false)})
        }
    },[table, paramConstant, querytype, dispatch, reduxClass],)
    

    return {isLoading, error, addRow:load};
}
