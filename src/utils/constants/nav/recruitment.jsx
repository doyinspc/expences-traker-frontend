import {
  CheckCircleIcon,
  ListChecksIcon,
  FileUpIcon,
  BriefcaseIcon,
  SchoolIcon,
  UsersIcon,
  BookOpenIcon,
  BriefcaseBusinessIcon,
} from "lucide-react";

export const _recruitment = [
  {
    id: 1,
    icon: <CheckCircleIcon />,
    name: "Application List",
    path: "/recruitment/status",
  },
  {
    id: 2,
    icon: <ListChecksIcon />,
    name: "Update Personal Data",
    path: "/recruitment/update-data",
  },
  {
    id: 3,
    icon: <FileUpIcon />,
    name: "Upload CV/Resume",
    path: "/recruitment/upload-cv",
  },
  {
    id: 4,
    icon: <BriefcaseIcon />,
    name: "Update Work Experience",
    path: "/recruitment/work-experience",
  },
  {
    id: 5,
    icon: <SchoolIcon />,
    name: "Update Education",
    path: "/recruitment/education",
  },
  {
    id: 6,
    icon: <UsersIcon />,
    name: "Update References",
    path: "/recruitment/references",
  },
  {
    id: 7,
    icon: <BookOpenIcon />,
    name: "Take Test",
    path: "/recruitment/test",
  },
  {
    id: 8,
    icon: <BriefcaseBusinessIcon />,
    name: "Employment Status",
    path: "/recruitment/employment-status",
  },
];
