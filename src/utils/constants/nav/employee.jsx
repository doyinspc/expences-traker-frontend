
import React from 'react';
import { CNavGroup, CNavItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilBell,
    cilBriefcase,
    cilCalendar,
    cilGroup,
    cilSpeedometer,
    cilUser,
    cilText,
    cilExitToApp,
    cilThumbUp,
    cilThumbDown,
    cilClipboard,
    cilLockLocked,
    cilSnowflake,
    cilUserX,
    cilArrowLeft, // New icon for Ex Employees
} from '@coreui/icons';

export const _staffs = [
    {
        component: CNavItem,
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        name: "Dashboard",
        path: "/admin/employee/dashboard",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        name: "Current Employees",
        path: "/admin/employee/active",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilUserX} customClassName="nav-icon" />,
        name: "Ex Employees",
        path: "/admin/employee/eactive",
    },
    {
        component: CNavGroup,
        icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        name: "Access Control",
        items: [
            { component: CNavItem, name: "Admin", to: "/admin/employee/access/admin" },
            { component: CNavItem, name: "Account", to: "/admin/employee/access/account" },
            { component: CNavItem, name: "Teaching Staff", to: "/admin/employee/access/staff" }
        ]
    },
    {
        component: CNavGroup,
        icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
        name: "Roles",
       // path: "/admin/employee/role",
        items: [
            { component: CNavItem, name: "Admin Roles", to: "/admin/employee/role/3" },
            { component: CNavItem, name: "Account Roles", to: "/admin/employee/role/4" },
            { component: CNavItem, name: "Teaching Staff Roles", to: "/admin/employee/role/2" }
        ]
    },
    {
        component: CNavGroup,
        icon: <CIcon icon={cilExitToApp} customClassName="nav-icon" />,
        name: "Leave Management",
        items: [
            { component: CNavItem, name: "Approved", to: "/admin/employee/leave/approved" },
            { component: CNavItem, name: "Not Approved", to: "/admin/employee/leave/not-approved" },
            { component: CNavItem, name: "Pending", to: "/admin/employee/leave/pending" }
        ]
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
        name: "Attendance",
        path: "/admin/employee/attendance",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
        name: "Time Table",
        path: "/admin/employee/time-table",
    },
     {
        component: CNavItem,
        icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
        name: "Back",
        path: "/admin/",
    },
];

const _employeeNav = _staffs.map(item => {
    if (item.component === CNavGroup) {
      return {
        ...item,
        items: item.items.map(subItem => ({
          component: subItem.component,
          name: subItem.name,
          to: subItem.to,
          icon: subItem.icon,
        }))
      };
    }
    return {
      component: item.component,
      name: item.name,
      to: item.path,
      icon: item.icon,
    };
});

export default _employeeNav;