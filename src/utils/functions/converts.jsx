import { isArrayWithValue, isJsonParsable } from "../../actions/common";

// export const convertCaToObject =(data)=>{
//      let main_array = {};
//         if (isArrayWithValue(data)) {
//             data.forEach((row) => {
//                 if (!row || !row.caid ) {
//                     return; 
//                 }
                
//                 if (!main_array[row.caid]) {
//                     main_array[row.caid] = [];
//                 }

//                 main_array[row.caid].push(row);
//             });
//         }
//     return main_array;

// }
export const convertCasToObject =(data)=>{
     let main_array = {};
        if (isArrayWithValue(data)) {
            let d = data.filter(rw=> rw && rw?.id > 0);
            //confirm it has a subunit

            d.forEach((row) => {
                if (!row || !row.typeid || !(parseInt(row.typeid) > 0) || !row.caid || !(parseInt(row.caid) > 0) ) {
                    return; 
                }
                if (main_array.hasOwnProperty(row?.typeid)){
                    if (main_array[row?.typeid].hasOwnProperty(row?.caid)){
                        main_array[row?.typeid][row?.caid].rows.push(row);
                    }else{
                        main_array[row?.typeid][row?.caid] = {...row};
                        main_array[row?.typeid][row?.caid].rows = []
                        main_array[row?.typeid][row?.caid].rows.push(row);
                    }
                } 
                else{
                        main_array[row?.typeid] = {}
                        main_array[row?.typeid][row?.caid] = {...row};
                        main_array[row?.typeid][row?.caid].rows = []
                        main_array[row?.typeid][row?.caid].rows.push(row);
                }
            });
        }
    return main_array;
}
export const convertScoreToObject =(data)=>{
     let main_array = {};
        if (isArrayWithValue(data)) {
            let d = data.filter(rw=> rw && rw?.id > 0);
            d.forEach((row) => {
                if (!row || !row.clientid1 || !(parseInt(row.clientid1) > 0) || !row.itemid1 || !(parseInt(row.itemid1) > 0) ) {
                    return; 
                }

                if (main_array.hasOwnProperty(row?.clientid1)){
                    if (main_array[row?.clientid1].hasOwnProperty(row?.itemid1)){
                       
                    }else{
                        main_array[row?.clientid1][row?.itemid1] = {...row};
                    }
                } 
                else{
                    main_array[row?.clientid1] = {}
                    main_array[row?.clientid1][row?.itemid1] = {...row};
                }
            });
        }
    return main_array;
}
export const convertClaszToObject =(data)=>{
     let main_array = {};
        if (isArrayWithValue(data)) {
            data.filter(rw=>!(rw?.id > 0)).forEach((row) => {
                if (!row || !row.claszid || !row.id ) {
                    return; 
                }
                
                if (!main_array[row.claszid][row.id]) {
                    main_array[row.claszid][row.id] = {};
                }

                main_array[row.claszid][row.id] = row;
                
            });
        }
    return main_array;
}