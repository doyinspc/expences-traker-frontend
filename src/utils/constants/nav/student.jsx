import { cilArrowLeft, cilGroup, cilLockLocked, cilSpeedometer, cilUser, cilBook, cilChartLine, cilDollar, cilCalendar, cilCheck, cilLibrary, cilNotes, cilPencil } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CNavGroup, CNavItem } from "@coreui/react";

export const _students = [
    {
        component: CNavItem,
        // Using cilSpeedometer for Dashboard is appropriate
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        name: "Dashboard",
        path: "/student/dashboard",
    },
    {
        component: CNavItem,
        // Changed from cilGroup to cilUser (Profile)
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        name: "Profile",
        path: "/student/profile",
    },
    {
        component: CNavItem,
        // Changed from cilUserX to cilBook (Academics/Subjects)
        icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
        name: "Academics",
        path: "/student/academics",
    },
    {
        component: CNavItem,
        // Changed from cilUserX to cilChartLine (Assessment/Grades)
        icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
        name: "Assessment",
        path: "/student/assessment",
    },
    {
        component: CNavItem,
        // Changed from cilUserX to cilNotes (Report Card/Notes)
        icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
        name: "Report",
        path: "/student/report",
    },
    {
        component: CNavItem,
        // Changed from cilUserX to cilLibrary (Learning Management System)
        icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
        name: "CBE/CBT Scores",
        path: "/student/test",
    },
    {
        component: CNavItem,
        // Changed from cilUserX to cilLibrary (Learning Management System)
        icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
        name: "LMS",
        path: "/student/lms",
    },
    {
        component: CNavItem,
        // Changed from cilUserX to cilCheck (Attendance)
        icon: <CIcon icon={cilCheck} customClassName="nav-icon" />,
        name: "Attendance",
        path: "/student/attendance",
    },
    {
        component: CNavItem,
        // Changed from cilUserX to cilDollar (Fees/Finance)
        icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
        name: "Fees",
        path: "/student/fee",
    },
    {
        component: CNavItem,
        icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        name: "Log Out",
        path: "/student/logout",
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