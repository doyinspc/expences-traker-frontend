
import React from 'react';
import { CNavGroup, CNavItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilArrowLeft,
    cilGroup,
    cilSpeedometer,
    cilUserX,
} from '@coreui/icons';

export const _plans = [
    {
        component: CNavItem,
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        name: "Staff",
        path: "/admin/plan/staff",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        name: "Class",
        path: "/admin/plan/class",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilUserX} customClassName="nav-icon" />,
        name: "Subject",
        path: "/admin/plan/subject",
    },
    {
            component: CNavItem,
            icon: <CIcon icon={cilArrowLeft} customClassName="nav-icon" />,
            name: "Back",
            path: "/admin/",
        },
];

const _planNav = _plans.map(item => {
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

export default _planNav;