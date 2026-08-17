import React from 'react';
import { CNavGroup, CNavItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilSpeedometer,
    cilGroup,
    cilArrowLeft,
    cilClipboard,
    cilTask, // Suggested new icon for Approved
    cilMagnifyingGlass, // Suggested new icon for Review
    cilShortText,
    cilVerticalAlignBottom,
    cilBan,
    cilBarChart
} from '@coreui/icons';

export const _questions = [
    {
        component: CNavItem,
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        name: "Overview", // Changed from "Dashboard" for a cleaner feel
        path: "/admin/questions/",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        name: "Assign Level 1 Vetter (Local)", // Changed from "Question Allocation"
        path: "/admin/questions/allocation",
    },
     {
        component: CNavItem,
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        name: "Assign Level 2 Vetter (Ext.)", // Changed from "Question Allocation"
        path: "/admin/questions/external",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilMagnifyingGlass} customClassName="nav-icon" />, // Changed from cilUserX
        name: "Vetted Questions (Final)", // Changed from "Review Process"
        path: "/admin/questions/review",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />, // Changed from cilUserX
        name: "Termly Analysis", // Changed from "Review Process"
        path: "/admin/questions/termlyanalysis",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilBan} customClassName="nav-icon" />, // Changed from cilUserX
        name: "Rejected Questions", // Changed from "Rejected"
        path: "/admin/questions/corrections",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilShortText} customClassName="nav-icon" />, // Changed from cilUserX
        name: "Prepare Examination", // Changed from "Review Process"
        path: "/admin/questions/test",
    },
  {
        component: CNavItem,
        icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
        name: "Back", // Changed from "Back"
        path: "/admin/",
    },
];

const _questionNav = _questions.map(item => {
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

export default _questionNav;