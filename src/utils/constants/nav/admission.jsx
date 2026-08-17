import {
  CheckCircleIcon,
  BookOpenIcon,
  UserCircleIcon,
  CreditCardIcon,
  UserCircle2Icon
} from "lucide-react";

export const _admission = [
  {
    id: 1,
    icon: <UserCircleIcon />,
    name: "Profile",
    path: "/admission/profile",
  },
  {
    id: 2,
    icon: <UserCircle2Icon />,
    name: "Update Details",
    path: "/admission/update-details",
  },
  {
    id: 3,
    icon: <CreditCardIcon />,
    name: "Pay Fee",
    path: "/admission/pay-fee",
  },
  {
    id: 4,
    icon: <BookOpenIcon />,
    name: "Take Test",
    path: "/admission/test",
  },
  {
    id: 5,
    icon: <CheckCircleIcon />,
    name: "Admission Status",
    path: "/admission/status",
  },
];
