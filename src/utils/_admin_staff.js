import React from 'react'
import { faBook, faChartPie, faLock, faUserLarge, faUserPlus } from "@fortawesome/free-solid-svg-icons";
const CareerList = React.lazy(() => import('../views/admin/Career/List'))
export default [
    {id:1, name:'List', icon:faUserLarge },
    {id:2, name:'Add Staff', icon:faUserPlus},
    {id:3, name:'Chart', icon:faChartPie},
    {id:4, name:'Access', icon:faLock},
    {id:7, name:'Education', icon:faBook},
    {id:8, name:'Professional', icon:'cil-badge'},
    {id:9, name:'Experience', icon:'cil-mug-tea'},
    {id:10, name:'Leave', icon:'cil-flight-takeoff'},
    {id:18, name:'Leave Details', icon:'cil-flight-takeoff'},
    {id:11, name:'Behavior', icon:'cil-mood-very-good'},
    {id:12, name:'Office', icon:'cil-star'},
    {id:13, name:'Level', icon:'cil-arrow-top'},
    {id:14, name:'Attendance', icon:'cil-wc'},
    {id:15, name:'Logs', icon:'cil-list'},
    {id:17, name:'Subject', icon:'cil-book'},
    {id:19, name:'Appriasal', icon:'cil-book'},
    {id:20, name:'Exit', icon:'cil-lock-locked'},
  ]