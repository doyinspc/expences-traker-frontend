import { cilCalendar, cilLibraryBuilding, cilListHighPriority, cilPenAlt, cilPenNib, cilReportSlash, cilSchool, cilTablet, cilUser } from "@coreui/icons";
import { faAtlas, faBlackboard, faBookAtlas, faBookBookmark, faBookOpenReader, faCertificate, faGlobeAfrica, faGolfBallTee } from "@fortawesome/free-solid-svg-icons";
import React from 'react'
import {
  cilBriefcase,
  cilList,
  cilFile,
  cilBell,
  cilClipboard,
  cilGroup,
  cilSpeedometer,
} from '@coreui/icons';
import { CNavItem } from "@coreui/react";

const Clasz= React.lazy(() => import('../views/academic/Clasz/Index'))
const Subjects = React.lazy(() => import('../views/academic/Subject/Index'))
const Test = React.lazy(() => import('../views/academic/Test/Index'))
const TestList = React.lazy(() => import('../views/academic/Test/TestList'))
const ReportCard = React.lazy(() => import('../views/academic/Report/Index'))
const Syllabus = React.lazy(() => import('../views/academic/Syllabus/Index'))
const Scheme = React.lazy(() => import('../views/academic/Scheme/Index'))
const Assessment = React.lazy(() => import('../views/academic/Plan/Index'))
const Plan = React.lazy(() => import('../views/academic/Plan/Index'))

const PlanWeek = React.lazy(() => import('../views/academic/Plan/PortalWeek'))
const PlanSubject = React.lazy(() => import('../views/academic/Plan/PortalSubject'))
const PlanClass = React.lazy(() => import('../views/academic/Plan/PortalClass'))
const PlanStaff = React.lazy(() => import('../views/academic/Plan/PortalStaff'))

const color = 'teal'
const __clasz = [
    {id:0, name:'Weekly', icon:'Lesson Plan', path:'/lesson_plan_week', color:color},
    {id:1, name:'Department', icon:'Lesson Plan', path:'/lesson_plan', color:color},
    {id:2, name:'Class', icon:'Lesson Plan', path:'/lesson_plan_class' , color:color },
    {id:3, name:'Staff', icon:'Lesson Plan', path:'/lesson_plan_staff', color:color},
]
export const __plan = [
    {id:0, name:'Weekly', displayName:CNavItem, icon:cilCalendar, path:'lesson_plan_week', color:color, element:PlanWeek},
    {id:1, name:'Subject', displayName:CNavItem, icon:cilReportSlash, path:'lesson_plan_subject', color:color, element:PlanSubject},
    {id:2, name:'Class', displayName:CNavItem, icon:cilSchool, path:'lesson_plan_class' , color:color, element:PlanClass },
    {id:3, name:'Staff', displayName:CNavItem, icon:cilUser, path:'lesson_plan_staff', color:color, element:PlanStaff},
]
export const __test = [
    {id:0, name:'TestList', icon:cilPenNib, path:':cbtid', color:color, element:TestList},
]


export default [
  {
    id: 1,
    name: "Dashboard",
    icon: cilSpeedometer,
    path: "dashboard",
  },
  {
    id: 2,
    name: "Profile",
    icon: cilUser,
    path: "profile",
  },
  {
    id: 3,
    name: "Subject Allocation",
    icon: cilBriefcase,
    item: [{
      id: 1, name:'Pa', path:"/pa", color:color
    }]
  },
  {
    id: 6,
    name: "Scheme of Work",
    icon: cilList,
    path: "scheme-of-work",
  },
  {
    id: 7,
    name: "Syllabus",
    icon: cilFile,
    path: "syllabus",
  },
  {
    id: 8,
    name: "Notifications",
    icon: cilBell,
    path: "notifications",
  },
  {
    id: 9,
    name: "Time Table",
    icon: cilCalendar,
    path: "time-table",
  },
  {
    id: 10,
    name: "Student Assessment",
    icon: cilClipboard,
    path: "student-assessment",
  },
  {
    id: 11,
    name: "Class Management",
    icon: cilGroup,
    path: "class-management",
  },
];


