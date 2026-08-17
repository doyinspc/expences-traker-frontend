
import { Input } from "../../../components/form/SimpleInput";
import moment from "moment";
import ReusableSelect from "../../../components/ReusableSelectTanstack";
import { moneyFunction } from "../../functions/basci";

//TEACHERS ASSIGN CLASSES TO MANAGE
export const classManagerTermFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Staff Name', name: 'staffname', type: 'text', showForm: false, meta:{style:{minWidth:'100px', backgroundColor:'green'}}, showTable: true, editable: false, element: null },
    { label: 'Class Name', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Class', name: 'itemid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'clasz', 
            pth:'claszunit', 
            table:'claszunits', 
            queryType:'getClaszunitDropdown', 
            isMulti:true,
            isSearchable:true, 
            param:[{col:'typeid', val:'typeid', type:false}]} },
    { label: 'Staff', name: 'clientid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'staff', 
            pth:'staff', 
            table:'staffs', 
            queryType:'getStaffDropdownAll', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'schoolid', val:'schoolid', type:false}]}
     },
    { label: 'Students', name: 'pop', type: 'text', showForm: false, showTable: true, editable: true, element: null },
    { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//STUDENTS ASSIGN CLASSES FOR THE TERM
export const studentClassManagerTermFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Admission No.', name: 'admission_no', type: 'text', showForm: false, meta:{}, showTable: true, editable: false, element: null },
    { label: 'Student Name', name: 'studentname', type: 'text', showForm: false, meta:{style:{minWidth:'100px', backgroundColor:'green'}}, showTable: true, editable: false, element: null },
    { label: 'Gender', name: 'gender', type: 'text', showForm: false, meta:{}, showTable: true, editable: false, element: null },
    { label: 'Birth Date', name: 'dob', type: 'text', showForm: false, meta:{}, showTable: true, editable: false, element: null },
    { label: 'State', name: 'soo', type: 'text', showForm: false, meta:{}, showTable: true, editable: false, element: null },
    { label: 'LGA', name: 'lga', type: 'text', showForm: false, meta:{}, showTable: true, editable: false, element: null },
    { label: 'Class Name', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Student', name: 'clientid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'student', 
            pth:'student', 
            table:'students', 
            queryType:'getStudentDropdown', 
            isMulti:true,
            isSearchable:true, 
            param:[{col:'schoolid', val:'schoolid', type:false}]}
     },
    { label: 'Class', name: 'itemid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'clasz', 
            pth:'claszunit', 
            table:'claszunits', 
            queryType:'getClaszunitDropdown', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'typeid', val:'typeid', type:false}]} },
    { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//TEACHERS ASSIGN SUBJECT TO TEACH WITH THE CLASS 
export const subjectManagerTermFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Staff Name', name: 'staffname', type: 'text', showForm: false, meta:{style:{minWidth:'100px', backgroundColor:'green'}}, showTable: true, editable: false, element: null },
    { label: 'Class Name/Venue', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Subject', name: 'item1_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Staff', name: 'clientid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'staff', 
            pth:'staff', 
            table:'staffs', 
            queryType:'getStaffDropdownAll', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'schoolid', val:'schoolid', type:false}]}
     },
    { label: 'Subject', name: 'itemid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'subject', 
            pth:'subject', 
            table:'subjects', 
            queryType:'gets', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'typeid', val:'typeid', type:false}]}},
    { label: 'Class', name: 'itemid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'clasz', 
            pth:'claszunit', 
            table:'claszunits', 
            queryType:'getClaszunitDropdown', 
            isMulti:true,
            isSearchable:true, 
            param:[{col:'typeid', val:'typeid', type:false}]} },
     { label: 'Period?Week', name: 'contact', type: 'number', showForm: true, showTable: true, editable: true, element: Input },
     { label: 'Students', name: 'pop', type: 'text', showForm: false, showTable: true, editable: true, element: null },
     { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//TEACHERS ASSIGN STUDENTS PER SUBJECT FOR ASSESSMENT
export const studentSubjectManagerTermFields = [
    { label: 'id', name:'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Staff Name', name: 'staffname', type: 'text', showForm: false, meta:{style:{minWidth:'100px', backgroundColor:'green'}}, showTable: true, editable: false, element: null },
    { label: 'Student Name', name: 'studentname', type: 'text', showForm: false, meta:{style:{minWidth:'100px', backgroundColor:'green'}}, showTable: true, editable: false, element: null },
    { label: 'Class', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Subject', name: 'item1_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Staff', name: 'clientid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'staff', 
            pth:'staff', 
            table:'staffs', 
            queryType:'getStaffDropdown', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'schoolid', val:'schoolid', type:false}]}
     },
     {label: 'Student', name: 'clientid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'student', 
            pth:'student', 
            table:'students', 
            queryType:'getStudentDropdown', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'schoolid', val:'schoolid', type:false}]}
     },
     { label: 'Class', name: 'itemid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'clasz', 
            pth:'data', 
            table:'datas', 
            queryType:'getDropdown', 
            isMulti:true,
            isSearchable:true, 
            param:[{col:'log_id', val:'typeid', type:false}, {col:'group_id', val:9, type:true}]} },
    { label: 'Subject', name: 'itemid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'subject', 
            pth:'data', 
            table:'datas', 
            queryType:'getDropdownSingle', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'log_id', val:'typeid', type:false}, {col:'group_id', val:6, type:true}]} },
     { label: 'Period?Week', name: 'contact', type: 'number', showForm: true, showTable: true, editable: true, element: Input },
     { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//ASSIGN FEE TO BE PAID PER CLASS 
export const classFeeManagerTermFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Class Name', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Fee Type', name: 'item1_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Student No.', name: 'pop', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'No. Recorded', name: 'pop_fee', type: 'number', showForm: false, showTable: true, editable: true, element: null },
    { label: 'Total Fee', name: 'fee', type: 'number', showForm: false, showTable: true, editable: true, element: null, format: moneyFunction },
    { label: 'No. Paid', name: 'pop_paid', type: 'number', showForm: false, showTable: true, editable: true, element: null },
    { label: 'Total Paid', name: 'paid', type: 'number', showForm: false, showTable: true, editable: true, element: Input , format: moneyFunction },
    { label: 'Balance', name: 'balance', type: 'number', showForm: false, showTable: true, editable: true, element: Input , format: moneyFunction },
    
    { label: 'Class', name: 'itemid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'clasz', 
            pth:'claszunit', 
            table:'claszunits', 
            queryType:'getClaszunitDropdown', 
            isMulti:true,
            isSearchable:true, 
            param:[{col:'typeid', val:'typeid', type:false}]} },
    { label: 'Fee', name: 'itemid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'fee', 
            pth:'data', 
            table:'datas', 
            queryType:'getDropdownSingle', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'group_id', val:21, type:true}]} },
     { label: 'Amount', name: 'contact', type: 'number', showForm: true, showTable: true, editable: true, element: Input, format: moneyFunction },
     { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//ASSIGN FEE TO BE PAID PER CLASS 
export const budgetManagerTermFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Expenses Group', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Amount', name: 'item1_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Student No.', name: 'pop', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Amount', name: 'balance', type: 'number', showForm: false, showTable: true, editable: true, element: Input , format: moneyFunction },
    
    { label: 'Expense Group', name: 'itemid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'expense', 
            pth:'expense', 
            table:'expenses', 
            queryType:'getExpenseDropdown', 
            isMulti:true,
            isSearchable:true, 
            param:[{col:'typeid', val:'typeid', type:false}]} },
    { label: 'Fee', name: 'itemid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'fee', 
            pth:'data', 
            table:'datas', 
            queryType:'getDropdownSingle', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'group_id', val:21, type:true}]} },
     { label: 'Amount', name: 'contact', type: 'number', showForm: true, showTable: true, editable: true, element: Input, format: moneyFunction },
     { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//VIEW TOTAL FEE/PAID FEE PER CLASS 
export const classFeeTotalManagerTermFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Class Name', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Student No.', name: 'student_population', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Total Fee', name: 'total_fee', type: 'number', showForm: false, showTable: true, editable: true, element: null },
    { label: 'Total Paid', name: 'total_paid', type: 'number', showForm: false, showTable: true, editable: true, element: Input },
    { label: 'Balance', name: 'balance', type: 'number', showForm: false, showTable: true, editable: true, element: Input },
    { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//ASSIGN FEE TO BE PAID PER STUDENT 
export const studentFeeManagerTermFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Admission N0.', name: 'studentnumber', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Student', name: 'studentname', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Fee Type', name: 'item1_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Class', name: 'itemid', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'clasz', 
            pth:'data', 
            table:'datas', 
            queryType:'getDropdown', 
            isMulti:true,
            isSearchable:true, 
            param:[{col:'log_id', val:'typeid', type:false}, {col:'group_id', val:9, type:true}]} },
    { label: 'Fee', name: 'itemid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'fee', 
            pth:'data', 
            table:'datas', 
            queryType:'getDropdownSingle', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'group_id', val:21, type:true}]} },
     { label: 'Amount', name: 'contact', type: 'number', showForm: true, showTable: true, editable: true, element: Input },
     { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//STUDENT ASSESSMENT SCORE MANAGER
export const assessmentScoreManagerTermFields = [
    { label: 'id', name:'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Student Name', name: 'studentname', type: 'text', showForm: false, meta:{style:{minWidth:'100px', backgroundColor:'green'}}, showTable: true, editable: false, element: null },
    { label: 'Assessment', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Subject', name: 'item1_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Student', name: 'clientid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'student', 
            pth:'student', 
            table:'students', 
            queryType:'getStudentDropdown', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'schoolid', val:'schoolid', type:false}]}},
    { label: 'Assessment', name: 'itemid', type: 'text', showForm: false, showTable: false, editable: true, element: Input},
    { label: 'Subject', name: 'itemid1', type: 'text', showForm: true, showTable: false, editable: true, 
        element: ReusableSelect, 
        dropdown:{
            id:'subject', 
            pth:'data', 
            table:'datas', 
            queryType:'getDropdownSingle', 
            isMulti:false,
            isSearchable:true, 
            param:[{col:'log_id', val:'typeid', type:false}, {col:'group_id', val:6, type:true}]} },
     { label: 'Score', name: 'contact', type: 'number', showForm: true, showTable: true, editable: true, element: Input, max:{fixed:false, val:'data1'}},
     { label: 'staffid', name: 'staffid', type: 'text', showForm: false, showTable: false, editable: true, element: null },
];
//STUDENT ASSESSMENT SCORE SUMMARY MANAGER
export const assessmentScoreSummaryManagerTermFields = [
    { label: 'id', name:'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Assessment', name: 'item_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Subject', name: 'item1_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Class', name: 'class_name', type: 'text', showForm: false, meta:{style:{minWidth:'100px'}}, showTable: true, editable: false, element: null },
    { label: 'Population', name: 'pop', type: 'number', showForm: false, showTable: true, editable: true, element: Input, max:{fixed:false, val:'data1'}},
    { label: 'Average', name: 'contact', type: 'number', showForm: false, showTable: true, editable: true, element: Input, max:{fixed:false, val:'data1'}},
];
export const commonFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Name', name: 'name', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Alias', name: 'abbrv', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
];
export const sessionFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Name', name: 'name', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Date Started', name: 'started', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Date Ended', name: 'ended', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input, min:{fixed:false, val:'startdate'} },
];
export const termFields = [
    { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
    { label: 'Name', name: 'name', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Session', name: 'sessionid', type: 'text', showForm: false, showTable: false, editable: true, element: Input },
    { label: 'Date Started', name: 'started', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Date Ended', name: 'ended', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input, min:{fixed:false, val:'startdate'} },
];
export const dateFields = [
    { label: 'Date Started', name: 'startdate', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Date Ended', name: 'endate', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input, min:{fixed:false, val:'startdate'} },
];
export const termCommonFields = [
    { label: 'grp', name: 'grp', type: 'text', showForm: false, showTable: false, editable: false, element: null },
    { label: 'termid', name: 'termid', type: 'text', showForm: false, showTable: false, editable: false, element: null }
];
export const MaxScoreFields = [{ 
    label: 'Maximum Score', name: 'maxscore', type: 'number', showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Date Started', name: 'started', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input },
    { label: 'Date Ended', name: 'ended', type: 'date', format: (e) => moment(e).format('DD/MM/YYYY'), showForm: true, showTable: true, editable: true, element: Input, min:{fixed:false, val:'startdate'} },
]