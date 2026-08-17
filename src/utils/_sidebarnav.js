import React from 'react';
import CIcon from '@coreui/icons-react';
import {
  cilGrid,
  cilUserPlus,
  cilUserX,
  cilLockLocked,
  cilArrowLeft,
  cilUser,
  cilList,
  cilBriefcase,
  cilSchool,
  cilMoney,
  cilBook,
  cilChart,
  cilSettings,
} from '@coreui/icons';
import { CNavGroup, CNavItem } from '@coreui/react';

// This is a dummy data source for admin_setting to make the code runnable.
// In a real application, you would import this from a separate file.
const admin_setting = [
  { id: 101, name: "General Settings", path: "general", group: "administration" },
  { id: 102, name: "User Management", path: "users", group: "administration" },
  { id: 201, name: "Course Settings", path: "courses", group: "academics" },
  { id: 301, name: "Billing", path: "billing", group: "accounts" },
];

// Employee Navigation converted to CoreUI format
export const _employee = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/admin/employee/",
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Current Employees",
    to: "/admin/employee/active",
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Ex-Employees",
    to: "/admin/employee/deactive",
    icon: <CIcon icon={cilUserX} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: "Access Control",
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Account Access",
        to: "/admin/employee/access/account",
      },
      {
        component: CNavItem,
        name: "Admin Access",
        to: "/admin/employee/access/admin",
      },
      {
        component: CNavItem,
        name: "Staff Access",
        to: "/admin/employee/access/staff",
      },
    ],
  },
  {
    component: CNavGroup,
    name: "Access Roles",
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Account Roles",
        to: "/admin/employee/role/account",
      },
      {
        component: CNavItem,
        name: "Admin Roles",
        to: "/admin/employee/role/admin",
      },
      {
        component: CNavItem,
        name: "Staff Roles",
        to: "/admin/employee/role/staff",
        
      },
    ],
  },
  {
    component: CNavItem,
    name: "Back",
    to: "/admin/",
    icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
  },
];

// Student Navigation converted to CoreUI format
export const _student = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/admin/students/",
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Current List",
    to: "/admin/students/active",
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "General List",
    to: "/admin/students/deactive",
    icon: <CIcon icon={cilUserX} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Back",
    to: "/admin/",
    icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
  },
];

// Logic to convert admin_group into a CoreUI-compatible format
const admin_group_coreui = [
  {
    component: CNavGroup,
    name: "Administration",
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
    items: admin_setting.filter(rw => rw.group === "administration").map(rw => ({
      component: CNavItem,
      name: rw.name,
      to: `/admin/setting/${rw.path}`,
    })),
  },
  {
    component: CNavGroup,
    name: "Academics",
    icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
    items: admin_setting.filter(rw => rw.group === "academics").map(rw => ({
      component: CNavItem,
      name: rw.name,
      to: `/admin/setting/${rw.path}`,
    })),
  },
  {
    component: CNavGroup,
    name: "Accounts",
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: admin_setting.filter(rw => rw.group === "accounts").map(rw => ({
      component: CNavItem,
      name: rw.name,
      to: `/admin/setting/${rw.path}`,
    })),
  },
  {
    component: CNavItem,
    name: "Back",
    to: "/admin/",
    icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
  }
];

// Admin Navigation converted to CoreUI format
const _admin = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/admin/",
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "User Profile",
    to: "/admin/profile",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: "Administration",
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Academic Calendar",
        to: "/admin/calender",
      },
      {
        component: CNavItem,
        name: "Staff",
        to: "/admin/employee",
        item: _employee, // Nested menu
      },
      {
        component: CNavItem,
        name: "Student",
        to: "/admin/students",
        item: _student, // Nested menu
      },
      {
        component: CNavItem,
        name: "Admission",
        to: "/admin/admission",
      },
      {
        component: CNavItem,
        name: "Recruitment",
        to: "/admin/recruitment",
      },
      {
        component: CNavItem,
        name: "Dairy",
        to: "/admin/dairy",
      },
    ],
  },
  {
    component: CNavGroup,
    name: "Academics",
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Syllabus",
        to: "/admin/syllabus",
      },
       {
        component: CNavItem,
        name: "Question Analysis",
        to: "/admin/questions",
      },
       {
        component: CNavItem,
        name: "Scheme",
        to: "/admin/scheme",
      },
      {
        component: CNavItem,
        name: "Lesson Plan",
        to: "/admin/plan/staff",
      },
      {
        component: CNavItem,
        name: "Test",
        to: "/admin/test",
      },
      {
        component: CNavItem,
        name: "Report",
        to: "/admin/report",
      },
     
    ],
  },
  {
    component: CNavGroup,
    name: "Accounts",
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Dashboard",
        to: "/admin/accounts/dashboard",
      },
      {
        component: CNavItem,
        name: "Wages",
        to: "/admin/accounts/wage",
      },
      {
        component: CNavItem,
        name: "School Fees",
        to: "/admin/accounts/fees",
      },
      {
        component: CNavItem,
        name: "Setting",
        to: "/admin/accounts/setting",
      },
    ],
  },
  {
    component: CNavItem,
    name: "Settings",
    to: "/admin/settings",
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
   {
    component: CNavItem,
    name: "Logout",
    to: "/admin/logout",
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
  },
];

// Setting Navigation converted to CoreUI format
export const _setting = admin_group_coreui;
export default _admin