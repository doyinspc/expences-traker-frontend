import {
  ArrowBigLeftIcon,
  BanknoteIcon,
  BookAIcon,
  BriefcaseBusinessIcon,
  ChartGanttIcon,
  CogIcon,
  LayoutGrid,
  ListIcon,
  School2Icon,
  UserCircleIcon,
  UserMinus2Icon,
  UserPlus2Icon,
  User2Icon,
  LockIcon,
} from "lucide-react";
import admin_setting from "./admin_setting";

export const _employee = [
  {
    id: 1,
    icon: <LayoutGrid />,
    name: "Dashboard",
    path: "/admin/employee/",
  },
  {
    id: 2,
    icon: <UserPlus2Icon />,
    name: "Current Employees",
    path: "/admin/employee/active",
  },
  {
    id: 3,
    icon: <UserMinus2Icon />,
    name: "Ex-Employees",
    path: "/admin/employee/deactive",
  },
  {
    id: 4,
    icon: <User2Icon />,
    name: "Access Control",
    subItems: [
      { id: 41, name: "Account Access", path: "access/account", pro: false },
      { id: 42, name: "Admin Access", path: "access/admin", pro: false },
      { id: 43, name: "Staff Access", path: "access/staff", pro: false },
    ],
  },
  {
    id: 5,
    icon: <User2Icon />,
    name: "Access Roles",
    subItems: [
      { id: 51, name: "Account Roles", path: "role/account", pro: false },
      { id: 52, name: "Admin Roles", path: "role/admin", pro: false },
      { id: 53, name: "Staff Roles", path: "role/staff", pro: false },
    ],
  },
  {
    id: 6,
    icon: <ArrowBigLeftIcon />,
    name: "Back",
    path: "/admin/",
  },
];

export const _student = [
  {
    id: 1,
    icon: <LayoutGrid />,
    name: "Dashboard",
    path: "/admin/students/",
  },
  {
    id: 2,
    icon: <UserPlus2Icon />,
    name: "Current List",
    path: "/admin/students/active",
  },
  {
    id: 3,
    icon: <UserMinus2Icon />,
    name: "General List",
    path: "/admin/students/deactive",
  },
  {
    id: 4,
    icon: <ArrowBigLeftIcon />,
    name: "Back",
    path: "/admin/",
  },
];

let admin_group = [
  {
    icon: <BriefcaseBusinessIcon />,
    name: "Administration",
    group: "administration",
    subItems: [],
  },
  {
    icon: <School2Icon />,
    name: "Academics",
    group: "academics",
    subItems: [],
  },
  {
    icon: <BanknoteIcon />,
    name: "Accounts",
    group: "accounts",
    subItems: [],
  },
  {
    icon:<ArrowBigLeftIcon />,
    name:'Back',
    path:'/admin/'
  }

]
let admin_array = []
admin_group.forEach(rw1 =>{
  let r = {...rw1}
  admin_setting.filter(rw => rw.group === rw1.group).forEach( rw => 
    {
      let subr = {}
      subr.id = rw.id
      subr.icon = rw.icon
      subr.name = rw.name
      subr.path = `/admin/setting/${rw.path}`
      r.subItems.push(subr)
    }
  )
  admin_array.push(r)
})



export const _admin = [
  {
    id: 1,
    icon: <LayoutGrid />,
    name: "Dashboard",
    path: "/admin/",
  },
  {
    id: 2,
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/admin/profile",
  },
  {
    id: 3,
    name: "Administration",
    icon: <ListIcon />,
    subItems: [
      { id: 31, name: "Academic Calender", path: "calender", pro: false },
      {
        id: 32,
        name: "Staff",
        path: "employee",
        pro: false,
        submenu: _employee,
      },
      {
        id: 33,
        name: "Student",
        path: "student",
        pro: false,
        submenu: _student,
      },
      { id: 34, name: "Admission", path: "admission", pro: false },
      { id: 35, name: "Recruitment", path: "recruitment", pro: false },
      { id: 36, name: "Diary", path: "dairy", pro: false },
    ],
  },
  {
    id: 4,
    name: "Academics",
    icon: <BookAIcon />,
    subItems: [
      { id: 41, name: "Class", path: "/", pro: false },
      { id: 42, name: "Report", path: "report", pro: false },
      { id: 43, name: "Syllabus", path: "syllabus", pro: false },
      { id: 44, name: "Scheme", path: "scheme", pro: false },
      { id: 45, name: "Lesson Plan", path: "plan", pro: false },
    ],
  },
  {
    id: 5,
    name: "Accounts",
    icon: <ChartGanttIcon />,
    subItems: [
      { id: 51, name: "Dashboard", path: "/", pro: false },
      { id: 52, name: "Wages", path: "wage", pro: false },
      { id: 53, name: "School Fees", path: "fees", pro: false },
      { id: 54, name: "Expenses", path: "expense", pro: false },
      { id: 54, name: "Budget", path: "budget", pro: false },
    ],
  },
  {
    id: 6,
    name: "Settings",
    icon: <CogIcon />,
    path: "/admin/settings",
  },
   {
    id: 71,
    name: "Logout",
    icon: <LockIcon />,
    path: "/admin/logout",
  },
];



export const _setting = admin_array