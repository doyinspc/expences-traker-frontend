import _academic from "./_academic";
import _account from "./_account";
import _admin from "./_admin";
import _admin_setting from "./_admin_setting";
import _policy from "./_policy";
import _report from "./_report";
import _sop from "./_sop";
import React from 'react'

const MenuPage = React.lazy(() => import('../components/tools/MenuPage'))
const AdminPage = React.lazy(() => import('../views/admin/Index'))
import CIcon from "@coreui/icons-react";
import {
  cilArrowLeft,
  cilBriefcase,
  cilGrid,
  cilList,
  cilUser,
  cilUserPlus,
  cilUserUnfollow,
  cilHouse,
  cilWallet,
  cilBook,
  cilChart,
  cilSettings,
  cilUserX,
} from "@coreui/icons";
//import admin_setting from "./admin_setting";

export const _employee = [
  {
    id: 1,
    icon: <CIcon icon={cilGrid} />,
    name: "Dashboard",
    path: "/admin/employee/",
  },
  {
    id: 2,
    icon: <CIcon icon={cilUserPlus} />,
    name: "Current Employees",
    path: "/admin/employee/active",
  },
  {
    id: 3,
    icon: <CIcon icon={cilUserX} />,
    name: "Ex-Employees",
    path: "/admin/employee/deactive",
  },
  {
    id: 4,
    icon: <CIcon icon={cilUserUnfollow} />,
    name: "Access Control",
    subItems: [
      { id: 41, name: "Account Access", path: "access/account", pro: false },
      { id: 42, name: "Admin Access", path: "access/admin", pro: false },
      { id: 43, name: "Staff Access", path: "access/staff", pro: false },
    ],
  },
  {
    id: 5,
    icon: <CIcon icon={cilUserUnfollow} />,
    name: "Access Roles",
    subItems: [
      { id: 51, name: "Account Roles", path: "role/account", pro: false },
      { id: 52, name: "Admin Roles", path: "role/admin", pro: false },
      { id: 53, name: "Staff Roles", path: "role/staff", pro: false },
    ],
  },
  {
    id: 6,
    icon: <CIcon icon={cilArrowLeft} />,
    name: "Back",
    path: "/admin/",
  },
];

export const _student = [
  {
    id: 1,
    icon: <CIcon icon={cilGrid} />,
    name: "Dashboard",
    path: "/admin/students/",
  },
  {
    id: 2,
    icon: <CIcon icon={cilUserPlus} />,
    name: "Current List",
    path: "/admin/students/active",
  },
  {
    id: 3,
    icon: <CIcon icon={cilUserX} />,
    name: "General List",
    path: "/admin/students/deactive",
  },
  {
    id: 4,
    icon: <CIcon icon={cilArrowLeft} />,
    name: "Back",
    path: "/admin/",
  },
];

let admin_group = [
  {
    icon: <CIcon icon={cilBriefcase} />,
    name: "Administration",
    group: "administration",
    subItems: [],
  },
  {
    icon: <CIcon icon={cilHouse} />,
    name: "Academics",
    group: "academics",
    subItems: [],
  },
  {
    icon: <CIcon icon={cilWallet} />,
    name: "Accounts",
    group: "accounts",
    subItems: [],
  },
  {
    icon: <CIcon icon={cilArrowLeft} />,
    name: "Back",
    path: "/admin/",
  },
];
let admin_array = [];
// admin_group.forEach((rw1) => {
//   let r = { ...rw1 };
//   admin_setting
//     .filter((rw) => rw.group === rw1.group)
//     .forEach((rw) => {
//       let subr = {};
//       subr.id = rw.id;
//       subr.icon = rw.icon;
//       subr.name = rw.name;
//       subr.path = `/admin/setting/${rw.path}`;
//       r.subItems.push(subr);
//     });
//   admin_array.push(r);
// });

export default [
  {
    id: 1,
    icon: <CIcon icon={cilGrid} />,
    name: "Dashboard",
    path: "/admin/",
  },
  {
    id: 2,
    icon: <CIcon icon={cilUser} />,
    name: "User Profile",
    path: "/admin/profile",
  },
  {
    id: 3,
    name: "Administration",
    icon: <CIcon icon={cilList} />,
    subItems: [
      { id: 31, name: "Academic Calender", path: "calender", pro: false },
      {
        id: 32,
        name: "Staff",
        path: "employee",
        pro: false,
        submenu: _employee,
      },
      {
        id: 33,
        name: "Student",
        path: "student",
        pro: false,
        submenu: _student,
      },
      { id: 34, name: "Admission", path: "admission", pro: false },
      { id: 35, name: "Recruitment", path: "recruitment", pro: false },
    ],
  },
  {
    id: 4,
    name: "Academics",
    icon: <CIcon icon={cilBook} />,
    subItems: [
      { id: 41, name: "Class", path: "/", pro: false },
      { id: 42, name: "Report", path: "report", pro: false },
      { id: 43, name: "Syllabus", path: "syllabus", pro: false },
      { id: 44, name: "Setting", path: "setting", pro: false },
    ],
  },
  {
    id: 5,
    name: "Accounts",
    icon: <CIcon icon={cilChart} />,
    subItems: [
      { id: 51, name: "Dashboard", path: "/", pro: false },
      { id: 52, name: "Wages", path: "wage", pro: false },
      { id: 53, name: "School Fees", path: "fees", pro: false },
      { id: 54, name: "Setting", path: "setting", pro: false },
    ],
  },
  {
    id: 6,
    name: "Settings",
    icon: <CIcon icon={cilSettings} />,
    path: "/admin/setting",
  },
];

export const _setting = admin_array;
// export default {
//     'admin': {
//       id:1,
//       name:'Admin',
//       path: '/admin',
//       submenu:_admin,
//       element:AdminPage
//     },
//     'academic': {
//       id:2,
//       name:'Academics',
//       path:'/academic',
//       submenu: _academic,
//       element:MenuPage
//     },
//     'account': {
//       id:3,
//       name:'Accounts',
//       path:'/account',
//       submenu: _account,
//       element:MenuPage
//     },
//     'policy': {
//         id:4,
//         name:'Policies',
//         path:'/policy',
//         submenu: _policy,
//         element:MenuPage
//       },
//     'sop': {
//         id:5,
//         name:'SOP',
//         path:'/sop',
//         submenu: _account,
//         element:MenuPage
//       },
//     'setting': {
//         id:6,
//         name:'Setting',
//         path:'/setting',
//         submenu: _admin_setting,
//         element:MenuPage
//       },
//       'report': {
//         id:7,
//         name:'Report',
//         path:'/report',
//         submenu: _report,
//         element:MenuPage
//       },
// }