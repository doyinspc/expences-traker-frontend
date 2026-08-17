import { useCallback, useState} from "react"
import { useDispatch } from "react-redux"
import axios from "axios"
import { API_PATH_SETTING, axiosConfig } from "../actions/common"


export default function useFetchQuery(props){
  
    const {table, querytype, param, useredux, reduxClass,  narration=null} = props ||{}
    const dispatch = useDispatch()

    const [isLoading, setisLoading] = useState(false)
    const [data, setdata] = useState([])
    const [error, seterror] = useState('')
    
   
    const load = useCallback((pr) => {
        let newParam = typeof pr === 'object' && Array.isArray(Object.keys(pr)) ? {...param, ...pr} : param;
        console.log(newParam)
        let data  = JSON.stringify(newParam || {})
        let params = {
            data:data,
            table:table,
            cat:querytype,
            narration: narration
        }
        if(useredux){ dispatch(reduxClass(params))}
        else{
            setisLoading(true)
            axios.get(API_PATH_SETTING, {params}, axiosConfig)
            .then(res=>{
                setdata(res.data)
                seterror('')
                setisLoading(false)
            })
            .catch(err=>{
                setdata([])
                seterror('Failed')
                setisLoading(false)
            })
        }
    },[table, param, querytype, dispatch, reduxClass],)
    
    return {data, isLoading, error, load};
}