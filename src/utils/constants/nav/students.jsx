
import React from 'react';
import { CNavGroup, CNavItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilBell,
    cilBriefcase,
    cilCalendar,
    cilGroup,
    cilSpeedometer,
    cilExitToApp,
    cilClipboard,
    cilLockLocked,
    cilSnowflake,
    cilUserX,
    cilArrowLeft, // New icon for Ex students
} from '@coreui/icons';

export const _students = [
    {
        component: CNavItem,
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        name: "Dashboard",
        path: "/admin/students/dashboard",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        name: "Current Students",
        path: "/admin/students/active",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilUserX} customClassName="nav-icon" />,
        name: "All students",
        path: "/admin/students/eactive",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
        name: "Attendance",
        path: "/admin/students/attendance",
    },
     {
        component: CNavItem,
        icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
        name: "Back",
        path: "/admin/",
    },
];

const _studentNav = _students.map(item => {
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

export default _studentNav;