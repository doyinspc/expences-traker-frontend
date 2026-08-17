import {useCallback } from 'react';
import { isJsonParsable, MAIN_TOKEN } from '../actions/common';
import { useDispatch, useSelector } from 'react-redux';
import ActionCreators from '../actions/actionCreator';


export default function useReduxApiData(props) {
    const dispatch = useDispatch(); 

    const { pth, table, queryType, mainParam, narration, onSuccess = false, enabled = false } = props;

    const actionTypes = new ActionCreators(pth.toUpperCase()); 

    const reducer = pth.toLowerCase() + 'Reducer';

    localStorage.setItem(pth+"num", JSON.stringify(mainParam));
    
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
                const storedParam = localStorage.getItem(pth+"num");
                const storedData  = isJsonParsable(storedParam) ? JSON.parse(storedParam) : {};
                loadQuery(storedData);
            }
            
        } catch (error) {
            console.error('useReduxApiData - loadUpdate initiation error:', error);
        }
    }, [dispatch, actionTypes, table, mainParam]);

    const loadQuery = useCallback(async (param = {}) => {
    let qt = param.hasOwnProperty('cat') ? param['cat'] : queryType;
    

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
    }, [dispatch, actionTypes, queryType, table, narration, MAIN_TOKEN, mainParam]);

    const loadRegister = useCallback(async (param) => {
        try {
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

    const refetch = useCallback((param = {}) => {
        loadQuery(param);
    }, []);
   

    // All SweetAlert logic has been removed from this file.

    return {
        data: queryData,      
        row: data,            
        isLoading,            
        isProcessing,         
        isError,              
        message: msg,         
        loadQuery,
        loadUpdate,
        loadRegister,
        deleteData,
        refetch,
    };
}