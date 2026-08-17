// Import the ActionCreators class. This class will provide the action type strings.
import ActionCreators from '../actions/actionCreator';
import { isJsonParsable } from '../actions/common';

/**
 * A factory class to create dynamic Redux reducers.
 * This class assumes a fixed state shape where the single item is under 'data'
 * and the array of items is under 'datas'.
 */
class ReducerCreator {
    #actionTypes;       // Instance of ActionCreators for dynamic action types
    #localStorageKey;   // e.g., 'itemStorage', 'userStorage'

    // Fixed keys for the state shape - these will always be 'data' and 'datas'
    #singularItemKey = 'data';
    #pluralItemsKey = 'datas';

    /**
     * Creates an instance of ReducerCreator.
     * @param {string} typePrefix - The prefix used for generating Redux action types (e.g., "ITEM", "USER").
     * @param {string} localStoragePrefix - The prefix for the localStorage key (e.g., "item", "user", "account").
     * This will be appended with "Storage" to form the full key.
     */
    constructor(typePrefix, localStoragePrefix) {
        if (typeof typePrefix !== 'string' || typePrefix.trim() === '') {
            throw new Error("ReducerCreator: 'typePrefix' must be a non-empty string.");
        }
        if (typeof localStoragePrefix !== 'string' || localStoragePrefix.trim() === '') {
            throw new Error("ReducerCreator: 'localStoragePrefix' must be a non-empty string.");
        }

        this.#actionTypes = new ActionCreators(typePrefix);
        this.#localStorageKey = localStoragePrefix + "Storage";
    }

    /**
     * A helper function for changing the 'is_active' state of an item in an array.
     * @private
     * @param {Array<Object>} currentItemsArray - The current array of items in the state.
     * @param {Object} activatedItemData - The item data containing 'id' and 'is_active'.
     * @returns {Array<Object>} A new array with the updated item.
     */
    #changeState(currentItemsArray, activatedItemData) {
        return currentItemsArray.map(item => {
            if (item.id === activatedItemData.id) {
                return { ...item, is_active: activatedItemData.is_active };
            }
            return item;
        });
    }

    /**
     * Creates and returns a Redux reducer function for the specified entity.
     * @returns {function(Object, Object): Object} A Redux reducer function.
     */
    createReducer() {
        // Dynamically load initial data from localStorage for this specific reducer instance
        const storedData = isJsonParsable(localStorage.getItem(this.#localStorageKey))
            ? JSON.parse(localStorage.getItem(this.#localStorageKey))
            : [];
           
        // Define the initial state structure using the fixed 'datas' and 'data' keys
        const initialState = {
            isLoading: false,
            [this.#pluralItemsKey]: storedData, // This will always be 'datas'
            [this.#singularItemKey]: {},       // This will always be 'data'
            msg: null,
            isEdit: -1,
            ref: null,
            isError: false,
        };

        const self = this; // Capture `this` for use in the returned reducer function

        // Return the actual Redux reducer function
        return function(state = initialState, action) {
            switch (action.type) {
                case self.#actionTypes.EDIT:
                    return {
                        ...state,
                        isEdit: action.payload,
                        isError:false,
                    };
                case self.#actionTypes.LOADING:
                    return {
                        ...state,
                        isLoading: true,
                        isError:false,
                    };
                case self.#actionTypes.CLEAR_MESSAGE: // Add this new case
                    return {
                        ...state,
                        msg: null,
                        isError: false,
                    };
                case self.#actionTypes.PROCESSING:
                    return {
                        ...state,
                        isProcessing: true,
                        isError:false,
                    };
                case self.#actionTypes.GET_MULTIPLE:
                    localStorage.setItem(self.#localStorageKey, JSON.stringify(action.payload));
                    return {
                        ...state,
                        [self.#pluralItemsKey]: action.payload,
                        [self.#singularItemKey]: {},
                        isLoading: false,
                        msg: 'DONE!!!',
                        isError:false,
                    };
                case self.#actionTypes.GET_ONE:
                    const allItemsForGetOne = state[self.#pluralItemsKey];
                    const selectedItem = allItemsForGetOne.find(row => row.id == action.payload);
                    console.log("WISKEY PEAK", selectedItem, action.payload, allItemsForGetOne);
                    return {
                        ...state,
                        [self.#singularItemKey]: selectedItem,
                        isProcessing: false,
                        msg: "DONE!!!",
                        isError:false,
                    };
                case self.#actionTypes.CLEAR_ONE:
                   return {
                        ...state,
                        [self.#singularItemKey]: {},
                        isProcessing: false,
                        msg: "DONE!!!",
                        isError:false,
                    };
               case self.#actionTypes.REGISTER_SUCCESS:
                    // Ensure action and action.payload exist
                    if (!action || !action.payload) {
                        return state;
                    }
                    
                    const newItemsAfterRegister = [...(state[self.#pluralItemsKey] || []), action.payload];
                    localStorage.setItem(self.#localStorageKey, JSON.stringify(newItemsAfterRegister));
                    
                    return {
                        ...state,
                        [self.#pluralItemsKey]: newItemsAfterRegister,
                        [self.#singularItemKey]: action.payload,
                        isProcessing: false,
                        msg: action.msg || 'DONE!!!',
                        isError: false,
                    };
                case self.#actionTypes.ACTIVATE_SUCCESS:
                    const itemsAfterActivate = self.#changeState(state[self.#pluralItemsKey], action.payload);
                    localStorage.setItem(self.#localStorageKey, JSON.stringify(itemsAfterActivate));
                    return {
                        ...state,
                        msg: 'DONE!!!',
                        [self.#pluralItemsKey]: itemsAfterActivate,
                        isProcessing: false,
                        isError:false,
                    };
                case self.#actionTypes.DELETE_SUCCESS:
                    const remainingItems = state[self.#pluralItemsKey].filter(item => item.id !== action.payload);
                    localStorage.setItem(self.#localStorageKey, JSON.stringify(remainingItems));
                    return {
                        ...state,
                        msg: 'DONE!!!',
                        [self.#pluralItemsKey]: remainingItems,
                        isProcessing: false,
                        isError:false,
                    };
                case self.#actionTypes.UPDATE_SUCCESS: {
                    const payload = action.payload;
                    
                    // 1. Verify payload is a strict object with a numerical ID
                    const isValidPayload = 
                        payload !== null && 
                        typeof payload === 'object' && 
                        !Array.isArray(payload) && 
                        payload.id !== undefined && 
                        !isNaN(parseInt(payload.id, 10));

                    // 2. Reject malformed payloads immediately
                    if (!isValidPayload) {
                        console.warn("UPDATE_SUCCESS aborted: payload must be an object with a numerical id.", payload);
                        return state;
                    }

                    // 3. Ensure we are working with an array
                    const currentItems = Array.isArray(state[self.#pluralItemsKey]) 
                        ? state[self.#pluralItemsKey] 
                        : [];

                    let updatedItemsArray = [...currentItems];

                    // 4. Find the index safely
                    const findIndex = currentItems.findIndex(item => 
                        item && 
                        typeof item === 'object' && 
                        item.id !== undefined && 
                        parseInt(item.id, 10) === parseInt(payload.id, 10)
                    );

                    // 5. Update or append
                    if (findIndex > -1) {
                        updatedItemsArray[findIndex] = payload;
                    } else {
                        updatedItemsArray.push(payload);
                    }

                    // 6. Update Persistence and State
                    localStorage.setItem(self.#localStorageKey, JSON.stringify(updatedItemsArray));
                    
                    return {
                        ...state,
                        [self.#pluralItemsKey]: updatedItemsArray,
                        [self.#singularItemKey]: payload,
                        isProcessing: false,
                        isError: false,
                    };
                } 
                case self.#actionTypes.LOADING_ERROR:
                case self.#actionTypes.ACTIVATE_FAIL:
                case self.#actionTypes.REGISTER_FAIL:
                case self.#actionTypes.DELETE_FAIL:
                case self.#actionTypes.UPDATE_FAIL:
                    return {
                        ...state,
                        isLoading: false,
                        isProcessing: false,
                        isError:true,
                        msg: action.msg || 'An error occurred.'
                    };
                default:
                    return state;
            }
        };
    }
}

export default ReducerCreator;