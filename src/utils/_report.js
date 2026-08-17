import { cilMoney, cilPenNib,  cilSchool, cilTablet, cilUser } from "@coreui/icons";
import React from 'react'

const Student= React.lazy(() => import('../views/report/Student/Index'))
const Staff= React.lazy(() => import('../views/report/Staff/Index'))
const Admission= React.lazy(() => import('../views/report/Staff/Index'))
const Finance= React.lazy(() => import('../views/report/Staff/Index'))

const StaffPerformance = React.lazy(() => import('../views/report/Staff/StaffPerformance'))
const StaffLeaveReport = React.lazy(() => import('../views/report/Staff/StaffLeaveReport'))
const StaffAttendanceReport = React.lazy(() => import('../views/report/Staff/StaffAttendanceReport'))


const color = 'teal'
const __clasz = [
    {id:0, name:'Weekly', icon:'Lesson Plan', path:'/lesson_plan_week', color:color},
    {id:1, name:'Department', icon:'Lesson Plan', path:'/lesson_plan', color:color},
    {id:2, name:'Class', icon:'Lesson Plan', path:'/lesson_plan_class' , color:color },
    {id:3, name:'Staff', icon:'Lesson Plan', path:'/lesson_plan_staff', color:color},
]
const __staff = [
    {id:0, name:'Attendance', icon:'Lesson Plan', path:'attendance', color:color, },
    {id:1, name:'Appraisal', icon:'Lesson Plan', path:'appraisal', color:color, },
    {id:2, name:'Academic Performance', icon:'Lesson Plan', path:'performance' , color:color, element: StaffPerformance  },
    {id:3, name:'Leave', icon:'Lesson Plan', path:'leave', color:color, element: StaffLeaveReport },
]

export default [
    {id:0, name:'Student', icon: cilSchool, path:'students', color:color, element:Student, submenu:__clasz},
    {id:1, name:'Staff', icon: cilTablet, path:'staff', color:color, element:Staff, submenu:__staff},
    {id:7, name:'Admission', icon: cilPenNib, path:'admission', color:color, element:Admission},
    {id:2, name:'Finance', icon: cilMoney, path:'finance' , color:color, element:Finance },
]

