import { faAngry, faChalkboardTeacher, faChartPie, faChild, faChildren, faCogs, faFeed, faHandsBubbles, faLock, faPlaneCircleExclamation, faUserCheck, faUserLarge, faUserPlus, faWeight } from "@fortawesome/free-solid-svg-icons";
import _admin_setting from "./_admin_setting";
import _admin_staff from "./_admin_staff";
import React from "react";
import { cilAirplay, cilBeachAccess, cilChart, cilChatBubble, cilChildFriendly, cilFace, cilFaceDead, cilHappy, cilHome, cilList, cilMoney, cilPlus, cilReportSlash, cilRuble, cilScreenDesktop, cilUserPlus } from "@coreui/icons";
import { staff_schema } from "./_schema";
import ActionButtons from "../components/tools/ActionButton";
import moment from "moment";
import { Input, TextArea } from "../components/form/Tanstack";



const Admission = React.lazy(() => import('../views/admin/Admission/Index'))
const DutyReport = React.lazy(() => import('../views/admin/DutyReport/Index'))
const PageEmployee = React.lazy(() => import('../views/admin/Staff/Index'))
const Student = React.lazy(() => import('../views/admin/Student/Index'))
const Career = React.lazy(() => import('../views/admin/Career/Index'))
const Dashboard = React.lazy(() => import('../views/admin/Index'))

const EmployeeHome = React.lazy(() => import('../views/admin/Staff/Index'))
const EmployeeList = React.lazy(() => import('../views/admin/Staff/List'))
const EmployeeLeave = React.lazy(() => import('../views/admin/Staff/ListLeave'))
const EmployeeAcademic = React.lazy(() => import('../views/admin/Staff/ListAcademic'))
const EmployeeProfessional = React.lazy(() => import('../views/admin/Staff/ListProfessional'))
const EmployeeDesignation = React.lazy(() => import('../views/admin/Staff/ListOffice'))
const EmployeeAccess = React.lazy(() => import('../views/admin/Staff/ListAccess'))
const EmployeeProfile = React.lazy(() => import('../views/admin/Staff/StaffProfilePage'))
const EmployeeAdd = React.lazy(() => import('../views/admin/Staff/Add'))
const EmployeeChart = React.lazy(() => import('../views/admin/Staff/Chart'))
const EmployeeRole = React.lazy(() => import('../views/admin/Staff/Role'))
const EmployeesLeave = React.lazy(() => import('../views/admin/Staff/Leave'))
const EmployeeWage = React.lazy(() => import('../views/admin/Staff/Wage'))
const EmployeeFeedback = React.lazy(() => import('../views/admin/Staff/Feedback'))
const EmployeeAppriasal = React.lazy(() => import('../views/admin/Staff/Appriasal'))

const StudentHome = React.lazy(() => import('../views/admin/Student/Index'))
const StudentList = React.lazy(() => import('../views/admin/Student/List'))
const StudentAdd = React.lazy(() => import('../views/admin/Student/Add'))
const StudentChart = React.lazy(() => import('../views/admin/Student/Chart'))
const StudentFeedback = React.lazy(() => import('../views/admin/Student/Feedback'))

const AdmissionHome = React.lazy(() => import('../views/admin/Admission/Index'))
const AdmissionList = React.lazy(() => import('../views/admin/Admission/List'))
const AdmissionAdd = React.lazy(() => import('../views/admin/Admission/Add'))
const AdmissionChart = React.lazy(() => import('../views/admin/Admission/Chart'))

const CareerHome = React.lazy(() => import('../views/admin/Career/Index'))
const CareerAbout = React.lazy(() => import('../views/admin/Career/About'))
const CareerList = React.lazy(() => import('../views/admin/Career/List'))
const CareerAdd = React.lazy(() => import('../views/admin/Career/Form'))
const CareerProfile = React.lazy(() => import('../views/admin/Career/Profile'))
const CareerChart = React.lazy(() => import('../views/admin/Career/Chart'))

const DutyReportHome = React.lazy(() => import('../views/admin/DutyReport/Index'))
const DutyReportList = React.lazy(() => import('../views/admin/DutyReport/List'))
const DutyReportAdd = React.lazy(() => import('../views/admin/DutyReport/Add'))
const DutyReportChart = React.lazy(() => import('../views/admin/DutyReport/Chart'))


const color = 'orange'

export const _staff = [
  {id:0, name:'Home', icon: cilHome, path:'/', color:color, element:EmployeeHome},
  {id:1, name:'List', icon: cilList, path:'list', color:color, element:EmployeeList, table_param :['schoolid'],
        table_name : 'staffs',
        table_data : staff_schema,
        table_action : null, 
      submenu:[
        {id:1, name:'Staff Leave', icon: cilList, path:'leave/:route1', color:color, element:EmployeeLeave},
        {id:2, name:'Staff Academics', icon: cilList, path:'academic/:route1', color:color, element:EmployeeAcademic},
        {id:3, name:'Staff Professionals', icon: cilList, path:'professional/:route1', color:color, element:EmployeeProfessional},
        {id:4, name:'Staff Designation', icon: cilList, path:'office/:route1', color:color, element:EmployeeDesignation},
        {id:5, name:'Staff Access', icon: cilList, path:'access/:route1', color:color, element:EmployeeAccess},
        {id:6, name:'Staff Profile', icon: cilList, path:'profile/:route1', color:color, element:EmployeeProfile}
      ]},
  {id:2, name:'Attendance', icon:cilPlus, path:'attendance', color:color, element:EmployeeAdd},
  {id:3, name:'Chart', icon:cilChart, path:'chart', color:color, element:EmployeeChart},
  {id:4, name:'Access', icon:cilBeachAccess, path:'role', color:color, element:EmployeeRole},
  {id:5, name:'Leave', icon:cilAirplay, path:'leave', color:color, element:EmployeeLeave},
  {id:6, name:'Leave', icon:cilAirplay, path:'leave', color:color, element:EmployeeLeave},
  {id:7, name:'Wage', icon:cilMoney, path:'wage', color:color, element:EmployeeWage},
  {id:8, name:'Feedback', icon:cilHappy, path:'feedback', color:color, element:EmployeeFeedback},
  {id:9, name:'Appriasal', icon:cilFace, path:'appriasal', color:color, element:EmployeeAppriasal},
]

export const _student = [
  {id:0, name:'Home', icon: cilHome, path:':route', color:color, element:StudentHome},
  {id:1, name:'List', icon:cilList, path:':route', color:color, element:StudentList },
  {id:2, name:'Add Staff', icon:cilPlus, path:':route', color:color, element:StudentAdd},
  {id:3, name:'Chart', icon:cilChart, path:':route', color:color, element:StudentChart},
  {id:5, name:'Feedback', icon:cilHappy, path:':route', color:color, element:StudentFeedback},
]

const _admission_table_action = ({row, onEdit, onActivate, onDeactivate, onDelete, onNext})=>{
  const {is_active} = row
  return <ActionButtons 
      onEdit={()=>onEdit(row)}
      onActivate={()=>onActivate(row)}
      onDeactivate={()=>onDeactivate(row)}
      onDelete={()=>onDelete(row)}
      onNext={()=>onNext(row)}
      row={row}
    >
      <ActionButtons.Edit />
      {is_active == 0 ? <ActionButtons.Activate/>: <ActionButtons.Deactivate/>}
      <ActionButtons.Delete />
      <ActionButtons.Next />
  </ActionButtons>
};
export const _admission_table_data = [
  {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
  {label: 'School ID', name:'schoolid', type:'text', showForm:false, showTable:false, editable:false, element:null},
  {label: 'Admission Title', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
  {label: 'About', name:'about', type:'text', showForm:true, showTable:false, editable:true, element:(e)=>TextArea(e)},
  {label: 'Info', name:'info', type:'text', showForm:true, showTable:false, editable:true, element:(e)=>TextArea(e)},
  {label: 'Total Applications', name:'population', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
  {label: 'Form Fee Paid', name:'total_feepaid', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
  {label: 'Passed', name:'total_passed', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
  {label: 'Fee Paid', name:'total_paid', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
  {label: 'Admitted', name:'total_accepted', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
  {label: 'Staff', name:'staffname', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
  {label: 'Date Started', name:'started', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
  {label: 'Date Ended', name:'ended', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
];
export const _admission = [
  {id:0, name:'Home', icon: faHandsBubbles, path:':adminid', color:color, element:AdmissionList,  
    table_name:'admissions', table_data:_admission_table_data, table_action:null, queryType:'getAdmissionGroups'},
]

export const _dutyreport = [
  {id:0, name:'Home', icon: faHandsBubbles, path:'home', color:color, element:DutyReportHome},
  {id:1, name:'List', icon:faUserLarge, path:'list', color:color, element:DutyReportList },
  {id:2, name:'Add Staff', icon:faUserPlus, path:'add', color:color, element:DutyReportAdd},
  {id:3, name:'Chart', icon:faChartPie, path:'chart', color:color, element:DutyReportChart},
]

const _career_list = [
  {id:0, name:'Home', icon: faHandsBubbles, path:':route/about', color:color, element:CareerList},
  {id:1, name:'List', icon: faHandsBubbles, path:'/:route', color:color, element:CareerList},
  {id:2, name:'Add', icon: faHandsBubbles, path:':route/add', color:color, element:CareerAdd},
  {id:3, name:'Profile', icon: faHandsBubbles, path:':route/:id', color:color, element:CareerProfile},
]

export const _career = [
  {id:0, name:'Home', icon: faHandsBubbles, path:'/', color:color, element:CareerHome, submenu: _career_list},
  {id:1, name:'List', icon: faHandsBubbles, path:':route', color:color, element:CareerList},
  {id:3, name:'Chart', icon:faChartPie, path:'chart', color:color, element:CareerChart},
]

export const _career_table_data = [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School ID', name:'schoolid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Title', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'About', name:'about', type:'text', showForm:true, showTable:false, editable:true, element:(e)=>TextArea(e)},
        {label: 'Info', name:'info', type:'text', showForm:true, showTable:false, editable:true, element:(e)=>TextArea(e)},
        {label: 'Select Subject', name:'subjectid', type:'text', showForm:false, showTable:false, editable:true, element:(e)=>Input(e)},
        {label: 'Select Staff', name:'staffid', type:'text', showForm:false, showTable:false, editable:true, element:(e)=>Input(e)},
        {label: 'Subject', name:'subjectname', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
        {label: 'Staff', name:'staffname', type:'text', showForm:false, showTable:true, editable:false, element:(e)=>Input(e)},
        {label: 'Date Started', name:'started', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
      ];
export const _career_table_action = ({row, onEdit, onActivate, onDeactivate, onDelete, onNext})=>{
        const {is_active} = row
        return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDeactivate={()=>onDeactivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
            row={row}
          >
            <ActionButtons.Edit />
            {is_active == 0 ? <ActionButtons.Activate/>: <ActionButtons.Deactivate/>}
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
      };

export default [
    {id:0, name:'Home', returns:true, icon: cilHome, path:'/', color:color, element:Dashboard},
    {id:1, name:'Admission', icon: cilScreenDesktop, path:'admission', color:color, element:AdmissionHome, submenu: _admission },
    {id:2, name:'Duty Report', icon: cilReportSlash, path:'dairy', color:color, element:DutyReport, submenu: _dutyreport},
    {id:3, name:'Employees', icon: cilUserPlus, path:'staff', color:color, element:PageEmployee, submenu: _staff },
    {id:4, name:'Students', icon: cilChildFriendly, path:'studentmenus' , color:color, element:Student , submenu: _student},
    {id:5, name:'Career', icon: cilRuble, path:'career' , color:color, element:CareerHome, submenu:  _career, 
    table_name:'employments', table_data:_career_table_data, table_action:_career_table_action, queryType:'getEmploymentGroups'}
  ]


 