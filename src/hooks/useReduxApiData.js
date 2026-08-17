import {useCallback } from 'react';
import { isJsonParsable, MAIN_TOKEN } from '../actions/common';
import { useDispatch, useSelector } from 'react-redux';
import ActionCreators from '../actions/actionCreator';


export default function useReduxApiData(props) {
    const dispatch = useDispatch(); 

    const { 
        pth, 
        table, 
        queryType, 
        mainParam, 
        narration, 
        onSuccess = false, 
        enabled = false, 
        onComplete = ()=>{} 
    } = props;

    const actionTypes = new ActionCreators(pth.toUpperCase()); 

    const reducer = pth.toLowerCase() + 'Reducer';
    console.log('useReduxApiData - reducer:', reducer, 'actionTypes:', pth.toUpperCase());

    // REMOVED: localStorage.setItem(pth+"num", JSON.stringify(mainParam));
    // ^^^ Change: Removed direct localStorage write. This isn't necessary for preventing auto-load,
    // but it was executing on every render, which is generally not ideal in a hook's main body.
    
    const {
        datas: queryData, 
        data, 
        isLoading, 
        isProcessing,
        msg,       
        isError   
    } = useSelector(state => state[reducer] || {}); 

    const loadUpdate = useCallback(async (param) => {
        try {
            const formData = new FormData();
            formData.append('table', param.hasOwnProperty('table') ? param['table'] : table);
            formData.append('cat', param.hasOwnProperty('cat') ? param['cat'] : 'insert'); 
            
            Object.keys(mainParam).forEach((key) => formData.append(key, mainParam[key])); 
            Object.keys(param).forEach((key) => {
                if (key !== 'cat') {
                    formData.append(key, String(param[key]));
                }
            });
            await dispatch(actionTypes.updateData(formData));
            if(onSuccess){
                 // CHANGE: Modified how storedParam is retrieved as localStorage write was removed from above.
                 // This ensures loadQuery gets the correct data if onSuccess is true.
                const storedData = mainParam; 
                 // const storedParam = localStorage.getItem(pth+"num");
                 // const storedData  = isJsonParsable(storedParam) ? JSON.parse(storedParam) : {};
                 // ^^^ Change: Commented out original local storage logic. If you still need to fetch
                 // the *original* mainParam, this simplified change is fine. If you were relying on 
                 // the local storage to get a *modified* or *last set* parameter, you'll need to 
                 // re-introduce a write inside `loadQuery`.
                loadQuery(storedData);
            }
            
        } catch (error) {
            console.error('useReduxApiData - loadUpdate initiation error:', error);
        }
    }, [dispatch, actionTypes, table, mainParam]);

    const loadQuery = useCallback(async (param = {}) => {
    let qt = param.hasOwnProperty('cat') ? param['cat'] : queryType;
    
         // CHANGE: Added localStorage write here to ensure it only happens when loadQuery is explicitly called.
         // This reintroduces the original local storage logic but ties it to the execution of the query.
         localStorage.setItem(pth+"num", JSON.stringify({ ...mainParam, ...param }));

        try {
            const queryParams = {
                data: JSON.stringify({ ...mainParam, ...param }), 
                cat: qt,
                table: table,
                timestamp: new Date().getTime(), 
                narration: narration,
                token: MAIN_TOKEN,
            };
         await dispatch(actionTypes.getAllDatas(queryParams));
            
        } catch (error) {
            console.error('useReduxApiData - loadQuery initiation error:', error);
        }
    }, [dispatch, actionTypes, queryType, table, narration, MAIN_TOKEN, mainParam, pth]);
  
    const loadRegister = useCallback(async (param) => {
        try {

            await dispatch(actionTypes.clearItem());
            const formData = new FormData();
            formData.append('table', table);
            formData.append('cat', param.hasOwnProperty('cat') ? param['cat'] : 'insert'); 
            
            Object.keys(mainParam).forEach((key) => formData.append(key, mainParam[key])); 
            Object.keys(param).forEach((key) => {
                if (key !== 'cat') {
                    formData.append(key, String(param[key]));
                }
            });

            await dispatch(actionTypes.registerData(formData));

        } catch (error) {
            console.error('useReduxApiData - loadRegister initiation error:', error);
        }
    }, [dispatch, actionTypes, table, mainParam]);

    const deleteData = useCallback(async (param, idToDelete) => { 
        try {
            const formData = new FormData();
            formData.append('table', table);
            formData.append('cat', param.cat || 'delete');

            if (idToDelete) {
                formData.append('id', String(idToDelete)); 
            } else if (param && param.id) {
                formData.append('id', String(param.id));
                idToDelete = param.id;
            } else {
                console.warn("deleteData called without an 'id' for deletion or in param.");
                return; 
            }

            Object.keys(mainParam).forEach((key) => formData.append(key, mainParam[key]));
            Object.keys(param).forEach((key) => {
                if (key !== 'id' && key !== 'cat') {
                    formData.append(key, String(param[key]));
                }
            });

            await dispatch(actionTypes.deleteData(formData, idToDelete)); 
        } catch (error) {
            console.error('useReduxApiData - deleteData initiation error:', error);
        }
    }, [dispatch, actionTypes, table, mainParam]);

    const loadOne = useCallback(async (id = 0) => { 
        console.log(id,'ELDAERT ');
        try {
                alert(id)
                await dispatch(actionTypes.getOneData(id));
            
        } catch (error) {
            console.error('useReduxApiData - loadOne initiation error:', error);
        }
    }, [dispatch, actionTypes, queryType, table, narration, MAIN_TOKEN, mainParam, pth]);

    const refetch = useCallback((param = {}) => {
        loadQuery(param);
    }, []);

    const onFinish = () => {
        //onComplete(row);
    };

    return {
        data: queryData,      
        row: data,            
        isLoading,            
        isProcessing,         
        isError,              
        message: msg,         
        loadQuery,
        loadOne,
        loadUpdate,
        loadRegister,
        deleteData,
        refetch,
    };
}