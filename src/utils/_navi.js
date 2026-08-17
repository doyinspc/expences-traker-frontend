// This file contains all navigation data for the CoreUI sidebar.
// It is a single, self-contained module.

import CIcon from '@coreui/icons-react';
import {
  CNavGroup,
  CNavItem,
} from '@coreui/react';
import {
  cilArrowLeft,
  cilBriefcase,
  cilGrid,
  cilList,
  cilUser,
  cilUserMinus,
  cilUserPlus,
  cilUserUnfollow,
  cilHouse,
  cilWallet,
  cilBook,
  cilChart,
  cilSettings,
} from '@coreui/icons';

// Dummy data for admin_setting, as it was used in your previous logic
const admin_setting = [
  { id: 101, name: "General Settings", path: "general", group: "administration" },
  { id: 102, name: "User Management", path: "users", group: "administration" },
  { id: 201, name: "Course Settings", path: "courses", group: "academics" },
  { id: 301, name: "Billing", path: "billing", group: "accounts" },
];

// Employee Navigation
const employeeNav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/admin/employee/',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Current Employees',
    to: '/admin/employee/active',
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Ex-Employees',
    to: '/admin/employee/deactive',
    icon: <CIcon icon={cilUserMinus} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Access Control',
    icon: <CIcon icon={cilUserUnfollow} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Account Access',
        to: '/admin/employee/access/account',
      },
      {
        component: CNavItem,
        name: 'Admin Access',
        to: '/admin/employee/access/admin',
      },
      {
        component: CNavItem,
        name: 'Staff Access',
        to: '/admin/employee/access/staff',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Access Roles',
    icon: <CIcon icon={cilUserUnfollow} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Account Roles',
        to: '/admin/employee/role/account',
      },
      {
        component: CNavItem,
        name: 'Admin Roles',
        to: '/admin/employee/role/admin',
      },
      {
        component: CNavItem,
        name: 'Staff Roles',
        to: '/admin/employee/role/staff',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Back',
    to: '/admin/',
    icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
  },
];

// Student Navigation
const studentNav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/admin/students/',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Current List',
    to: '/admin/students/active',
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'General List',
    to: '/admin/students/deactive',
    icon: <CIcon icon={cilUserMinus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Back',
    to: '/admin/',
    icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
  },
];

// Setting Navigation
const adminSettingGroups = [
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

const settingNav = adminSettingGroups.map(group => {
  if (group.path) {
    return {
      component: CNavItem,
      name: group.name,
      to: group.path,
      icon: group.icon,
    };
  }

  const subItems = admin_setting
    .filter(item => item.group === group.group)
    .map(item => ({
      component: CNavItem,
      name: item.name,
      to: `/admin/setting/${item.path}`,
    }));

  return {
    component: CNavGroup,
    name: group.name,
    icon: group.icon,
    items: subItems,
  };
});

// Main Admin Navigation
export const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/admin/',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'User Profile',
    to: '/admin/profile',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Administration',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Academic Calendar',
        to: '/admin/calender',
      },
      {
        component: CNavGroup,
        name: 'Staff',
        to: '/admin/employee',
        items: employeeNav,
      },
      {
        component: CNavGroup,
        name: 'Student',
        to: '/admin/student',
        items: studentNav,
      },
      {
        component: CNavItem,
        name: 'Admission',
        to: '/admin/admission',
      },
      {
        component: CNavItem,
        name: 'Recruitment',
        to: '/admin/recruitment',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Academics',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Class',
        to: '/admin/class',
      },
      {
        component: CNavItem,
        name: 'Report',
        to: '/admin/report',
      },
      {
        component: CNavItem,
        name: 'Syllabus',
        to: '/admin/syllabus',
      },
      {
        component: CNavItem,
        name: 'Setting',
        to: '/admin/setting',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Accounts',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/admin/accounts/dashboard',
      },
      {
        component: CNavItem,
        name: 'Wages',
        to: '/admin/accounts/wage',
      },
      {
        component: CNavItem,
        name: 'School Fees',
        to: '/admin/accounts/fees',
      },
      {
        component: CNavItem,
        name: 'Setting',
        to: '/admin/accounts/setting',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Settings',
    to: '/admin/setting',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: settingNav,
  },
];