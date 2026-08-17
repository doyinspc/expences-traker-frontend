// Accounts Navigation data structure for CoreUI Sidebar.
import React from 'react';
import CIcon from '@coreui/icons-react';
import {
  cilGrid,
  cilUser,
  cilMoney,
  cilBriefcase,
  cilChart,
  cilSchool,
  cilBasket,
  cilList,
  cilCog,
  cilLockLocked,
  cilFile,
} from '@coreui/icons';
import { CNavGroup, CNavItem } from '@coreui/react';

const customClassName = "nav-icon";

// NOTE: This file uses direct React/CoreUI component imports and JSX 
// as requested, which may cause unresolved module errors in this environment.
const admissionportalNav = [
  {
    component: CNavItem,
    name: "Home",
    to: "/admission_portal/",
    icon: <CIcon icon={cilGrid} customClassName={customClassName} />,
  },
  {
    component: CNavItem,
    name: "User Profile",
    to: "/admission_portal/profile",
    icon: <CIcon icon={cilUser} customClassName={customClassName} />,
  },
  {
    component: CNavItem,
    name: "Add Photo",
    to: "/admission_portal/income",
    icon: <CIcon icon={cilMoney} customClassName={customClassName} />,
  },
   {
    component: CNavItem,
    name: "Result",
    to: "/admission_portal/result",
    icon: <CIcon icon={cilFile} customClassName={customClassName} />,
  },
  {
      component: CNavItem,
      icon: <CIcon icon={cilLockLocked} customClassName={customClassName} />,
      name: "Log Out",
      to: "/admission_portal/logout",
    },
];

export default admissionportalNav;
