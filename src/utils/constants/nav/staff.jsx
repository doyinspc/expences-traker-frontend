import React from 'react';
import { CNavGroup, CNavItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilBell,
  cilBriefcase,
  cilCalendar,
  cilCheckCircle,
  cilFile,
  cilGroup,
  cilSpeedometer,
  cilUser,
  cilText,
  cilExitToApp, // Icon for Leave
  cilThumbUp,
  cilThumbDown,
  cilClipboard,
  cilLockLocked,
  cilSnowflake,
  cilFolderOpen,
  cilEyedropper,
  cilChatBubble, // Icon for Attendance
} from '@coreui/icons';
import { ClipboardPenLine } from 'lucide-react';

export const _staffs = [
  {
    component: CNavItem,
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    name: "Dashboard",
    path: "/staff/dashboard",
  },
  {
    component: CNavItem,
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    name: "Profile",
    path: "/staff/profile",
  },
   {
    component: CNavItem,
    icon: <CIcon icon={cilEyedropper} customClassName="nav-icon" />,
    name: "Duty Report",
    path: "/staff/duty",
  },
  {
    component: CNavItem,
    icon: <CIcon icon={cilCheckCircle} customClassName="nav-icon" />,
    name: "Student Assessment",
    path: "/staff/student",
  },
  {
    component: CNavItem,
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    name: "Class Management",
    path: "/staff/class",
  },
  {
    component: CNavGroup,
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
    name: "Academic Planning",
    items: [
      { component: CNavItem, name: "Syllabus", to: "/staff/syllabus" },
      { component: CNavItem, name: "Scheme of Work", to: "/staff/scheme" },
      { component: CNavItem, name: "Lesson Plan", to: "/staff/plan" }
    ]
  },
  {
    component: CNavGroup,
    icon: <CIcon icon={ClipboardPenLine} customClassName="nav-icon" />,
    name: "Questions Manager",
    items: [
      { component: CNavItem, name: "Level 1 Vetter (Local)", to: "/staff/local_auditor" },
      { component: CNavItem, name: "Level 2 Vetter (External)", to: "/staff/external_auditor" },
      { component: CNavItem, name: "Corrections", to: "/staff/corrections" },
    ]
  },
   {
    component: CNavItem,
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
    name: "Test Analytics",
    path: "/staff/test",
  },
  {
    component: CNavGroup, // New Group for Leave Management
    icon: <CIcon icon={cilExitToApp} customClassName="nav-icon" />,
    name: "Leave Management",
    items: [
      { component: CNavItem, icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />, name: "Apply for Leave", to: "/staff/leave/apply" },
      { component: CNavItem, icon: <CIcon icon={cilSnowflake} customClassName="nav-icon" />, name: "Pending", to: "/staff/leaves/0" },
      { component: CNavItem, icon: <CIcon icon={cilThumbUp} customClassName="nav-icon" />, name: "Approved", to: "/staff/leaves/1" },
      { component: CNavItem, icon: <CIcon icon={cilThumbDown} customClassName="nav-icon" />, name: "Not Approved", to: "/staff/leaves/2" },
    ]
  },{
    component: CNavGroup,
    icon: <CIcon icon={cilText} customClassName="nav-icon" />,
    name: "Communication",
    items: [
      { component: CNavItem, name: "Policies", to: "/staff/policy" },
      { component: CNavItem, name: "Standard Operating Procedures", to: "/staff/sop" },
      { component: CNavItem, name: "Announcements", to: "/staff/announcements" },
      { component: CNavItem, name: "Messages", to: "/staff/messages" },
      { component: CNavItem, name: "Notifications", to: "/staff/notifications" }
    ]
  },
  {
    component: CNavItem, // New Item for Attendance
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    name: "Attendance",
    path: "/staff/attendance",
  },
  {
    component: CNavItem,
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    name: "Log Out",
    path: "/staff/logout",
  },
];

const _staffNav = _staffs.map(item => {
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

export default _staffNav;