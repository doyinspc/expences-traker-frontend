import { gender_store, marital_store } from "../actions/common";
import { FormSelect, FormSelectAsync, Input } from "../components/form/Tanstack1";

export const staff_schema = {
    'Administration' :[
        {label: 'id', name:'id', type:'text', showForm:false, clasz:3, showTable:false, editable:true, element:null},
        {label: 'School', name:'schoolid', type:'text', showForm:false, clasz:3, showTable:false, editable:false, element:null},
        {label: 'Employment Number', name:'employment_no', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Surname', name:'surname', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Firstname', name:'firstname', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Middlename', name:'middlename', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date of Employment', name:'dob', type:'date', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Department', name:'department', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>FormSelectAsync({table:'department', param:{typeid:1}})},
        {label: 'Marital', name:'marital', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>FormSelect({...e, data: marital_store, structure:['label', 'value'], filters:[]})},
        {label: 'National Identification Number', name:'nin', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    'Bio-data' :[
        {label: 'Date of Birth', name:'dob', type:'date', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Gender', name:'gender', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>FormSelect({...e, data: gender_store, structure:['label', 'value'], filters:[]})},
        {label: 'Marital', name:'marital', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>FormSelect({...e, data: marital_store, structure:['label', 'value'], filters:[]})},
        {label: 'Title', name:'title', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    'Accounts' :[
        {label: 'Account Number', name:'account', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Sort Code', name:'sortcode', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Bank', name:'bank', type:'text', showForm:true, clasz:3, showTable:true, editable:true,  element:(e)=>FormSelect({...e,  data: marital_store, structure:['label', 'value'], filters:[]})}, 
    ],
}