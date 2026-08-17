import React from "react";
import moment from "moment";
import ActionButtons from "../components/tools/ActionButton";
import { cilAirplaneMode, cilBookmark, cilCalendar, cilCog, cilFaceDead, cilPen, cilSchool, cilTrash } from "@coreui/icons";
import { Input } from "../components/form/Tanstack";
import { CBadge, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { academic, skill, behavior, studentfee, classallocation, subjectallocation, report, studentreport } from "./academic_setting/Index";

const Calendar = React.lazy(() => import('../views/admin/Setting/Page1'))
const School = React.lazy(() => import('../views/admin/Setting/School'))
const Page2 = React.lazy(() => import('../views/admin/Setting/Page2'))
const Page3 = React.lazy(() => import('../views/admin/Setting/Page3'))
const Department = React.lazy(() => import('../views/admin/Setting/Department'))
const Unit = React.lazy(() => import('../views/admin/Setting/Unit'))
const Level = React.lazy(() => import('../views/admin/Setting/Level'))
const Step = React.lazy(() => import('../views/admin/Setting/Step'))
const Subject = React.lazy(() => import('../views/admin/Setting/Subject'))
const Account = React.lazy(() => import('../views/admin/Setting/Account'))
const Pension = React.lazy(() => import('../views/admin/Setting/Pension'))
const Bank = React.lazy(() => import('../views/admin/Setting/Bank'))
const Reason = React.lazy(() => import('../views/admin/Setting/Reason'))
const Nature = React.lazy(() => import('../views/admin/Setting/Nature'))
const Timing = React.lazy(() => import('../views/admin/Setting/Timing'))
const Clasz = React.lazy(() => import('../views/admin/Setting/Clasz'))
const Claszunit = React.lazy(() => import('../views/admin/Setting/Claszunit'))
const Role = React.lazy(() => import('../views/admin/Setting/Role'))
const Roleunit = React.lazy(() => import('../views/admin/Setting/Roleunit'))
const Grade = React.lazy(() => import('../views/admin/Setting/Grade'))
const Gradeunit = React.lazy(() => import('../views/admin/Setting/Gradeunit'))
const Session = React.lazy(() => import('../views/admin/Setting/Session'))
const Term = React.lazy(() => import('../views/admin/Setting/Term'))
const Termassessment = React.lazy(() => import('../views/admin/Setting/Termassessment'))



const admin_setting = [
    {
      id:3,
      name:'Session',
      icon:cilCalendar,
      path:'session',
      uid:'session',
      description:'Create, Modify Session, Terms, Assessments',
      element : Session,
      uniqueKey: 'gets',
      table_param :['schoolid'],
      table_name : 'sessions',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'school ID', name:'schoolid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Session Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Date Started', name:'started', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
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
      submenu:[
      {
        id:1,
        name:'Terms Manager',
        icon:'/icons/calendar.png',
        path:':route',
        uniqueKey: 'gets',
        uid:'term',
        description:'Add, Modify Term',
        element : Term,
        table_param :[{name:'route', new_name:'sessionid', fixed:false}],
        table_name : 'terms',
        table_data : [
          {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
          {label: 'Session ID', name:'sessionid', type:'text', showForm:false, showTable:false, editable:false, element:null},
          {label: 'Term Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Date Started', name:'started', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Date Ended', name:'ended', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        ],
        table_action : ({row, onNext, onEdit, onDelete})=>{
          return <span>
           {row?.pop && (<CBadge color="primary">{row?.pop || 0}</CBadge>)}
          <CDropdown style={{margin:'0px'}} size="sm">
                       <CDropdownToggle size="sm" color="secondary"> 
                        <CIcon icon={cilCog}/>{" "}Action</CDropdownToggle>
                       <CDropdownMenu>
                       <CDropdownItem size="sm" onClick={()=>onEdit(row)}>
                           <CIcon icon={cilPen}/>{" "}Edit
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onDelete(row)}>
                           <CIcon icon={cilTrash}/>{" "}Delete
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'academic')}>
                           <CIcon icon={cilBookmark}/>{" "}Academic Assessments
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'behavior')}>
                           <CIcon icon={cilBookmark}/>{" "}Behavioral Assessments
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'skill')}>
                           <CIcon icon={cilBookmark}/>{" "}Psychomotor Assessments
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'studentreport')}>
                           <CIcon icon={cilBookmark}/>{" "}Student Report
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row,'teacher')}>
                           <CIcon icon={cilSchool}/>{" "}Class Teacher Allocation
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'classfee')}>
                           <CIcon icon={cilSchool}/>{" "}Class Fee Allocation
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'subjectallocation')}>
                           <CIcon icon={cilBookmark}/>{" "}Subject Teacher Allocation
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'classallocation')}>
                           <CIcon icon={cilBookmark}/>{" "}Class Manager Allocation
                       </CDropdownItem>
                       <CDropdownItem size="sm" onClick={()=>onNext(row, 'studentallocation')}>
                           <CIcon icon={cilBookmark}/>{" "}Student Class Allocation
                       </CDropdownItem>
                   </CDropdownMenu>
               </CDropdown>
               </span>
        },
        submenu:[
          academic, 
          {...skill}, 
          behavior, 
          studentfee, 
          classallocation, 
          subjectallocation, 
          report, 
          studentreport
        ]
      }
    ]
    },
    {
      id:4, 
      name:'School', 
      icon:cilSchool, 
      path:'school', 
      description:'Add & Modify a school',
      element : School,
      table_param :[],
      table_name : 'schools',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Name', name:'name', type:'text', showForm:true, showTable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, element:(e)=>Input(e)},
        {label: 'Date Started', name:'started', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, element:(e)=>Input(e)},
        {label: 'Date Ended', name:'ended', type:'date', format:(e)=>moment(e).format('DD/MM/YYYY'), showForm:true, showTable:true, element:(e)=>Input(e)},
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
         </ActionButtons>
      },
    },
    {
      id:5,
      name:'Departments',
      icon:cilFaceDead,
      path:'department',
      uniqueKey:'gets',
      description:'Add & modify departments and units',
      element : Department,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Type', name:'schoolid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Department Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
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
        name:'Unit',
        icon:'/icons/department.png',
        path:':route',
        uniqueKey:'gets',
        uid:'unit',
        description:'Add & Modify units',
        element : Unit,
        table_param :[{name:'route', new_name:'parent_id', fixed:false}],
        table_name : 'datas',
        table_data : [
          {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
          {label: 'Department ID', name:'parent_id', type:'text', showForm:false, showTable:false, editable:false, element:null},
          {label: 'Unit Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
          return <ActionButtons 
              onEdit={()=>onEdit(row)}
              onActivate={()=>onActivate(row)}
              onDelete={()=>onDelete(row)}
              onNext={()=>onNext(row)}
            >
              <ActionButtons.Edit />
              <ActionButtons.Activate/>
              <ActionButtons.Delete />
          </ActionButtons>
        },
      }]
    },
    {
      id:6,
      name:'Subject',
      icon:cilFaceDead,
      path:'subject',
      uniqueKey:'gets',
      description:'Add & modify Subjects',
      element : Subject,
      table_param :['typeid'],
      table_name : 'subjects',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Name', name:'schoolid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'School Type', name:'typeid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Subject Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
       
      ],
      table_action : ({row, onEdit, onActivate, onDelete})=>{
         return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
          >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
         </ActionButtons>
      },
    },
    {
      id:7,
      name:'Account',
      icon:cilFaceDead,
      path:'account',
      uniqueKey:'gets',
      description:'Add & Modify Bank Accounts',
      element : Account,
      table_param :['code'],
      table_name : 'accounts',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Name', name:'schoolid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'School Type', name:'code', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Account or Bank Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias/Account Number', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
      ],
      table_action : ({row, onEdit, onActivate, onDelete})=>{
         return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
          >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
         </ActionButtons>
      },
    },
    {
      id:8,
      name:'Pension',
      icon:cilFaceDead,
      path:'pension',
      uniqueKey:'gets',
      description:'Add & Modify Pension Managers',
      element : Pension,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Name', name:'schoolid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Pension Manager', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
      ],
      table_action : ({row, onEdit, onActivate, onDelete})=>{
         return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
          >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
         </ActionButtons>
      },
    },
    {
      id:9,
      name:'Class',
      icon:cilFaceDead,
      path:'clasz',
      uniqueKey:'gets',
      description:'Add & modify class and units',
      element : Clasz,
      table_param :['typeid'],
      table_name : 'claszs',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Type', name:'typeid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Class Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
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
        name:'Class',
        icon:'/icons/department.png',
        path:':route',
        uniqueKey:'gets',
        uid:'claszunit',
        description:'Add & Modify Class Units',
        element : Claszunit,
        table_param :[{name:'route', new_name:'claszid', fixed:false}],
        table_name : 'datas',
        table_data : [
          {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
          {label: 'Class ID', name:'claszid', type:'text', showForm:false, showTable:false, editable:false, element:null},
          {label: 'Class Unit Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
          return <ActionButtons 
              onEdit={()=>onEdit(row)}
              onActivate={()=>onActivate(row)}
              onDelete={()=>onDelete(row)}
              onNext={()=>onNext(row)}
            >
              <ActionButtons.Edit />
              <ActionButtons.Activate/>
              <ActionButtons.Delete />
          </ActionButtons>
        },
      }]
    },
    {
      id:10,
      name:'Grades',
      icon:cilFaceDead,
      path:'Grade',
      uniqueKey:'gets',
      description:'Add & modify Grades and units',
      element : Grade,
      table_param :['group_id', 'rid'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Type', name:'rid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Grade Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
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
        name:'Grade Unit',
        icon:'/icons/department.png',
        path:':route',
        uniqueKey:'gets',
        uid:'gradeunit',
        description:'Add & Modify Grade Units',
        element : Gradeunit,
        table_param :[{name:'route', new_name:'parent_id', fixed:false}],
        table_name : 'datas',
        table_data : [
          {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
          {label: 'Grade ID', name:'parent_id', type:'text', showForm:false, showTable:false, editable:false, element:null},
          {label: 'Grade Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Grade Maximum', name:'data1', type:'number', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Grade Minimum', name:'data2', type:'number', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Class', name:'store', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
          return <ActionButtons 
              onEdit={()=>onEdit(row)}
              onActivate={()=>onActivate(row)}
              onDelete={()=>onDelete(row)}
              onNext={()=>onNext(row)}
            >
              <ActionButtons.Edit />
              <ActionButtons.Activate/>
              <ActionButtons.Delete />
          </ActionButtons>
        },
      }]
    },
    {
      id:11,
      name:'Role',
      icon:cilFaceDead,
      path:'role',
      uid:'role',
      uniqueKey:'gets',
      description:'Add & modify Role and Access',
      element : Role,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'School Type', name:'rid', type:'text', showForm:false, showTable:false, editable:false, element:null},
        {label: 'Role Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
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
        name:'Access',
        icon:'/icons/department.png',
        path:':route',
        uniqueKey:'gets',
        uid:'access',
        description:'Add & Modify Access Level',
        element : Roleunit,
        table_param :[{name:'route', new_name:'roleid', fixed:false}],
        table_name : 'roleunits',
        table_data : [
          {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
          {label: 'Grade ID', name:'parent_id', type:'text', showForm:false, showTable:false, editable:false, element:null},
          {label: 'Grade Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
          return <ActionButtons 
              onEdit={()=>onEdit(row)}
              onActivate={()=>onActivate(row)}
              onDelete={()=>onDelete(row)}
              onNext={()=>onNext(row)}
            >
              <ActionButtons.Edit />
              <ActionButtons.Activate/>
              <ActionButtons.Delete />
          </ActionButtons>
        },
      }]
    },  
    {
      id:12,
      name:'Levels',
      icon:cilFaceDead,
      path:'level',
      uniqueKey:'gets',
      description:'Add & modify levels and units',
      element : Level,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'level Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
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
        name:'Steps',
        icon:'/icons/department.png',
        path:':route',
        uniqueKey:'gets',
        uid:'step',
        description:'Add & Modify Steps',
        element : Step,
        table_param :[{name:'route', new_name:'parent_id', fixed:false}],
        table_name : 'datas',
        table_data : [
          {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
          {label: 'Level ID', name:'parent_id', type:'text', showForm:false, showTable:false, editable:false, element:null},
          {label: 'step Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
          {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        ],
        table_action : ({row, onEdit, onActivate, onDelete})=>{
          return <ActionButtons 
              onEdit={()=>onEdit(row)}
              onActivate={()=>onActivate(row)}
              onDelete={()=>onDelete(row)}
              onNext={()=>onNext(row)}
            >
              <ActionButtons.Edit />
              <ActionButtons.Activate/>
              <ActionButtons.Delete />
          </ActionButtons>
        },
      }]
    },  
    {
      id:13,
      name:'Nature of Employment',
      icon:cilFaceDead,
      path:'nature',
      uniqueKey:'gets',
      description:'Add & Modify Nature of Employment',
      element : Nature,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
      ],
      table_action : ({row, onEdit, onActivate, onDelete})=>{
         return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
          >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
         </ActionButtons>
      },
    },  
    {
      id:14,
      name:'Timing',
      icon:cilFaceDead,
      path:'timing',
      uniqueKey:'gets',
      description:'Add & Modify Time',
      element : Timing,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
      ],
      table_action : ({row, onEdit, onActivate, onDelete})=>{
         return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
          >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
         </ActionButtons>
      },
    }, 
    {
      id:15,
      name:'Banks',
      icon:cilFaceDead,
      path:'bank',
      uniqueKey:'gets',
      description:'Add & Modify Banks',
      element : Bank,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
      ],
      table_action : ({row, onEdit, onActivate, onDelete})=>{
         return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
          >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
         </ActionButtons>
      },
    }, 
    {
      id:16,
      name:'Reason for Leaving',
      icon:cilFaceDead,
      path:'reason',
      uniqueKey:'gets',
      description:'Add & Modify Reasons for Leaving',
      element : Reason,
      table_param :['group_id'],
      table_name : 'datas',
      table_data : [
        {label: 'id', name:'id', type:'text', showForm:false, showTable:false, editable:true, element:null},
        {label: 'Name', name:'name', type:'text', showForm:true, showTable:true, editable:true, element:(e)=>Input(e)},
        {label: 'Alias', name:'abbrv', type:'text', showForm:true, showTable:true, editable:true,  element:(e)=>Input(e)},
      ],
      table_action : ({row, onEdit, onActivate, onDelete})=>{
         return <ActionButtons 
            onEdit={()=>onEdit(row)}
            onActivate={()=>onActivate(row)}
            onDelete={()=>onDelete(row)}
            onNext={()=>onNext(row)}
          >
            <ActionButtons.Edit />
            <ActionButtons.Activate/>
            <ActionButtons.Delete />
         </ActionButtons>
      },
    },   
    
]
export default admin_setting