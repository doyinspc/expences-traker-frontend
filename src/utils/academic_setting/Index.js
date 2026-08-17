import React from "react"
import { cilAirplaneMode } from "@coreui/icons"
import ActionButtons from "../../components/tools/ActionButton"

const Termstudent = React.lazy(() => import('../../views/admin/Setting/Termstudent.js'))
const Termstudentitem = React.lazy(() => import('../../views/admin/Setting/Termstudentitem.js'))
const Termstudentfee = React.lazy(() => import('../../views/admin/Setting/Termstudentfee.js'))
const Termstudentfeeitem = React.lazy(() => import('../../views/admin/Setting/Termstudentfee.js'))
const Termstudentreport = React.lazy(() => import('../../views/admin/Setting/Termstudentreport.js'))
const Termstudentreportitem = React.lazy(() => import('../../views/admin/Setting/Termstudentreportitem.js'))
const Termreport = React.lazy(() => import('../../views/admin/Setting/Termreport'))
const Termreportitem = React.lazy(() => import('../../views/admin/Setting/Termreportitem'))
const Termschoolfee = React.lazy(() => import('../../views/admin/Setting/Termschoolfee'))
const Termassessment = React.lazy(() => import('./../../views/admin/Setting/Termassessment'))
const Termassessmentitem = React.lazy(() => import('../../views/admin/Setting/Termassessmentitem'))
const Termskill = React.lazy(() => import('../../views/admin/Setting/Termskill'))
const Termskillitem = React.lazy(() => import('../../views/admin/Setting/Termskillitem'))
const Termbehavior = React.lazy(() => import('../../views/admin/Setting/Termbehavior'))
const Termbehavioritem = React.lazy(() => import('../../views/admin/Setting/Termbehavioritem.js'))
const Termsubjectallocation = React.lazy(() => import('../../views/admin/Setting/Termsubjectallocation'))
const Termclassallocation = React.lazy(() => import('../../views/admin/Setting/Termclassallocation'))


export const academic = {
    id:1,
    uid:'academic',
    name:'Assessment',
    icon: cilAirplaneMode,
    path:'academic/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Assessments',
    element:Termassessment,
    table_param :[{name:'route1', new_name:'termid', fixed:false}],
    table_name : 'cas',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Termid', name:'termid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Assessment Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Maxscore', name:'maxscore', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
            onPop ={row?.pop || 0}
        >
            <ActionButtons.Pop />
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    },
    submenu:[{
        id:1,
        name:'Assessment Item',
        icon:'/icons/department.png',
        path:':route2',
        uniqueKey:'gets',
        uid:'assessmentitem',
        description:'Add & Modify Assessment',
        element : Termassessmentitem,
        table_param :[{name:'route2', new_name:'caid', fixed:false}],
        table_name : 'caunits',
        table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Assessment ID', name:'caid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Assessment Item ID', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Max Score', name:'maxscore', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
        return <ActionButtons 
                onEdit={()=>onEdit(row)}
                onActivate={()=>onActivate(row)}
                onDelete={()=>onDelete(row)}
            >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
        </ActionButtons>
        },
    }]
}
export const behavior = {
    id:2,
    uid:'behavior',
    name:'Behavior',
    icon: cilAirplaneMode,
    path:'behavior/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Behaviors',
    element : Termbehavior,
    table_param :[{name:'route1', new_name:'termid', fixed:false}],
    table_name : 'cas',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Termid', name:'termid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Behavior Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'maxscore', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    },
    submenu:[{
        id:1,
        name:'Behavior item',
        icon:'/icons/department.png',
        path:':route2',
        uniqueKey:'gets',
        uid:'behavioritem',
        description:'Add & Modify Behavior',
        element : Termbehavioritem,
        table_param :[{name:'route2', new_name:'caid', fixed:false}],
        table_name : 'caunits',
        table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Behavior ID', name:'caid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Behavior Item ID', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Max Score', name:'maxscore', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
        </ActionButtons>
        },
    }]
}
export const skill = {
    id:3,
    uid:'skill',
    name:'Skill',
    icon: cilAirplaneMode,
    path:'skill/:route1', 
    uniqueKey:'gets',
    description:'Add & Modify Term Skills',
    element : Termskill,
    table_param :[{name:'route1', new_name:'termid', fixed:false}],
    table_name : 'cas',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Termid', name:'termid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Skill Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Maxscore', name:'maxscore', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    },
    submenu:[{
        id:1,
        name:'Skill item',
        icon:'/icons/department.png',
        path:':route2',
        uniqueKey:'gets',
        uid:'skillitem',
        description:'Add & Modify Skill',
        element : Termskillitem,
        table_param :[{name:'route2', new_name:'caid', fixed:false}],
        table_name : 'caunits',
        table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Skill ID', name:'caid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Skill Item ID', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Max Score', name:'maxscore', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
        </ActionButtons>
        },
    }]
}
export const student = {
    id:4,
    uid:'student',
    name:'Student Table',
    icon: cilAirplaneMode,
    path:'student/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Students',
    element : Termstudent,
    table_param :['typeid'],
    table_name : 'claszs',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Student Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Admission Number', name:'admission_no', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'maxscore', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.View />
            <ActionButtons.Remove />
        </ActionButtons>
    },
    submenu:[{
        id:1,
        name:'Student item',
        icon:'/icons/department.png',
        path:':route3',
        uniqueKey:'gets',
        uid:'student',
        description:'Add & Modify Student',
        element : Termstudentitem,
        table_param :[{name:'route3', new_name:'caid', fixed:false}],
        table_name : 'caunits',
        table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Student ID', name:'caid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Student Item ID', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Max Score', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
        </ActionButtons>
        },
    }]
}
export const schoolfee = {
    id:5,
    uid:'schoolfee',
    name:'Schoolfee Table',
    icon: cilAirplaneMode,
    path:'schoolfee/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Schoolfees',
    element : Termschoolfee,
    table_param :['typeid'],
    table_name : 'claszs',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Termid', name:'termid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Schoolfee Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'maxscore', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    },
   
}
export const report = {
    id:5,
    uid:'report',
    name:'Report Table',
    icon: cilAirplaneMode,
    path:'report/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Reports',
    element : Termreport,
    table_param :['typeid'],
    table_name : 'claszs',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Termid', name:'termid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Report Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'maxscore', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    },
    submenu:[{
        id:1,
        name:'Report item',
        icon:'/icons/department.png',
        path:':route3',
        uniqueKey:'gets',
        uid:'report',
        description:'Add & Modify Report',
        element : Termreportitem,
        table_param :[{name:'route3', new_name:'caid', fixed:false}],
        table_name : 'caunits',
        table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Report ID', name:'caid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Report Item ID', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Max Score', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
        </ActionButtons>
        },
    }]
}
export const studentfee = {
    id:6,
    uid:'studentfee',
    name:'Studentfee Table',
    icon: cilAirplaneMode,
    path:'studentfee/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Studentfees',
    element : Termstudentfee,
    table_param :['typeid'],
    table_name : 'claszs',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Termid', name:'termid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Studentfee Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'maxscore', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    },
    submenu:[{
        id:1,
        name:'Studentfee item',
        icon:'/icons/department.png',
        path:':route3',
        uniqueKey:'gets',
        uid:'studentfee',
        description:'Add & Modify Studentfee',
        element : Termstudentfeeitem,
        table_param :[{name:'route3', new_name:'caid', fixed:false}],
        table_name : 'caunits',
        table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Studentfee ID', name:'caid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Studentfee Item ID', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Max Score', name:'abbrv', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Start Date', name:'started', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
        </ActionButtons>
        },
    }]
}
export const studentreport = {
    id:7,
    uid:'studentreport',
    name:'Student Report Table',
    icon: cilAirplaneMode,
    path:'studentreport/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Studentreports',
    element : Termstudentreport,
    table_param :[{name:'route1', new_name:'termid', fixed:false}],
    table_name : 'reports',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Report Title', name:'title', type:'text', showForm:true, showTable:true, editable:true, element:null},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    },
    submenu:[{
        id:1,
        name:'Subjects Report',
        icon:'/icons/department.png',
        path:':route2',
        uniqueKey:'gets',
        uid:'studentreportitem',
        description:'Display Subject Performance',
        element : Termstudentreportitem,
        table_param :[{name:'route2', new_name:'reportid', fixed:false}, {name:'termid', new_name:'termid', fixed:false}, {name:'sessionid', new_name:'sessionid', fixed:false}],
        table_name : 'reports',
        table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Subject Name', name:'subjectname', type:'text', showForm:true, showTable:true, editable:true, element:null},
        {label: 'Population', name:'students', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Recorded', name:'students1', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
    ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
        </ActionButtons>
        },
    }]
}
export const subjectallocation = {
    id:5,
    uid:'subjectallocation',
    name:'Subject Allocation Table',
    icon: cilAirplaneMode,
    path:'subjectallocation/:route1',
    uniqueKey:'gets',
    description:'Add & modify Term Subjectallocations',
    element : Termsubjectallocation,
    table_param :[{name:'route1', new_name:'termid', fixed:false}, {name:'route', new_name:'sessionid', fixed:false}],
    table_name : 'termsubjectallocations',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Staff Name', name:'staffname', type:'text', showForm:true, showTable:true, editable:true, element:null},
        {label: 'Subject Name', name:'subjectname', type:'text', showForm:true, showTable:true, editable:true, element:null},
        {label: 'Class Name', name:'claszunitname', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Weekly Period', name:'contact', type:'number', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Population', name:'pop', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit, onActivate, onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    }
}
export const classallocation = {
    id:5,
    uid:'classallocation',
    name:'Class Manager Allocation',
    icon: cilAirplaneMode,
    path:'classallocation/:route1',
    uniqueKey:'gets',
    description:'Add & Modify STaff Class Allocations',
    element : Termclassallocation,
    table_param :[{name:'route1', new_name:'termid', fixed:false}, {name:'route', new_name:'sessionid', fixed:false}],
    table_name : 'termclassallocation',
    table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Staff Name', name:'staffname', type:'text', showForm:true, showTable:true, editable:true, element:null},
        {label: 'Class Name', name:'claszunitname', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Population', name:'pop', type:'number', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
    ],
    table_action : ({row, onEdit,  onDelete, onNext})=>{
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    }
}