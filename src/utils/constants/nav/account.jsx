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
  cilChatBubble,
  cilLockLocked,
} from '@coreui/icons';
import { CNavGroup, CNavItem } from '@coreui/react';

const customClassName = "nav-icon";

// NOTE: This file uses direct React/CoreUI component imports and JSX 
// as requested, which may cause unresolved module errors in this environment.
const accountNav = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/account/",
    icon: <CIcon icon={cilGrid} customClassName={customClassName} />,
  },
  {
    component: CNavItem,
    name: "User Profile",
    to: "/account/profile",
    icon: <CIcon icon={cilUser} customClassName={customClassName} />,
  },
  // {
  //   component: CNavItem,
  //   name: "Income",
  //   to: "/account/income",
  //   icon: <CIcon icon={cilMoney} customClassName={customClassName} />,
  // },
   {
      component: CNavItem,
      icon: <CIcon icon={cilChatBubble} customClassName={customClassName} />,
      name: "Admission Finance",
      to: "/account/admission",
    },
  {
    component: CNavGroup,
    name: "Expenses",
    icon: <CIcon icon={cilBriefcase} customClassName={customClassName} />,
    items: [
      {
        component: CNavItem,
        name: "Transactions",
        to: "/account/expense/transaction",
      },
      {
        component: CNavItem,
        name: "Purchase Order",
        to: "/account/expense/po",
      },
      {
        component: CNavItem,
        name: "Transfers",
        to: "/account/expense/transfer",
      },
       {
        component: CNavItem,
        name: "Summary",
        to: "/account/expense/summary",
      },
    ]
  },
  {
    component: CNavGroup,
    name: "Budgeting",
    icon: <CIcon icon={cilChart} customClassName={customClassName} />,
    items: [
      {
        component: CNavItem,
        name: "New Budget",
        to: "/account/budget",
      },
      {
        component: CNavItem,
        name: "Budget List",
        to: "/account/budget/list",
      },
    ]
  },
  {
    component: CNavGroup,
    name: "Fees & Collection",
    icon: <CIcon icon={cilSchool} customClassName={customClassName} />,
    items: [
      {
        component: CNavItem,
        name: "Collect Fees",
        to: "/account/fee/clasz",
      },
      {
        component: CNavItem,
        name: "Approve Fee Collection",
        to: "/account/fee/unapproved",
      },
       {
        component: CNavItem,
        name: "Set Class Fee",
        to: "/account/fee/fees",
      },
       {
        component: CNavItem,
        name: "Fee Summary",
        to: "/account/fee/summary",
      },
    ]
  },
  {
    component: CNavGroup,
    name: "Stock & Inventory",
    icon: <CIcon icon={cilBasket} customClassName={customClassName} />,
    items: [
      {
        component: CNavItem,
        name: "Stock Entry",
        to: "/account/stock/list",
      },
      {
        component: CNavItem,
        name: "Current Stock",
        to: "/account/stock/summary",
      },
    ]
  },
  {
    component: CNavGroup,
    name: "Settings",
    icon: <CIcon icon={cilCog} customClassName={customClassName} />,
    items: [
      {
        component: CNavItem,
        name: "Accounts",
        to: "/account/settings/accounts",
      },
      {
        component: CNavItem,
        name: "Banking Organizations",
        to: "/account/settings/banks",
      },
      {
        component: CNavItem,
        name: "Expenses",
        to: "/account/settings/expenses",
      },
      {
        component: CNavItem,
        name: "Fee Types",
        to: "/account/settings/fees",
      },
      {
        component: CNavItem,
        name: "Pension Organizations",
        to: "/account/settings/insurances",
      },
      {
        component: CNavItem,
        name: "Wage Types",
        to: "/account/settings/wages",
      },
    ]
  },
  {
    component: CNavItem,
    name: "Salary",
    to: "/account/salary",
    icon: <CIcon icon={cilMoney} customClassName={customClassName} />,
  },
  {
    component: CNavItem,
    name: "Reports",
    to: "/account/reports",
    icon: <CIcon icon={cilList} customClassName={customClassName} />,
  },
   {
      component: CNavItem,
      icon: <CIcon icon={cilLockLocked} customClassName={customClassName} />,
      name: "Logout",
      to: "/account/logout",
    },
];

export default accountNav;
