// src/config/navigationConfig.ts

export interface NavItem {
  id: number;
  name: string;
  icon: string;
  path?: string;
  parent_path_number: number;
  child_path_number: number;
  access_level?: 1 | 2 | 3; // 1=view only, 2=manage, 3=full access
  subItems?: {
    id: number;
    name: string;
    path: string;
    parent_path_number: number;
    child_path_number: number;
    pro?: boolean;
    new?: boolean;
  }[];
}

export interface AccessControl {
  user_id: number;
  location_id: number;
  parent_path_number: number;
  child_path_number: number;
  access_level: 1 | 2 | 3;
}

// ============================================
// NAVIGATION ITEMS WITH NUMERIC IDs - MAIN FIRST
// ============================================

export const navItems: NavItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: "LayoutGrid",
    path: "/",
    parent_path_number: 1,
    child_path_number: 0,
    access_level: 3,
  },
  {
    id: 2,
    name: "Bookings",
    icon: "BedDoubleIcon",
    parent_path_number: 2,
    child_path_number: 0,
    access_level: 3,
    subItems: [
      {
        id: 201,
        name: "Booking",
        path: "/bookings/booking",
        parent_path_number: 2,
        child_path_number: 1,
      },
      {
        id: 202,
        name: "Reports",
        path: "/bookings/report",
        parent_path_number: 2,
        child_path_number: 2,
      },
      {
        id: 203,
        name: "Client List",
        path: "/bookings/client",
        parent_path_number: 2,
        child_path_number: 3,
      },
      {
        id: 204,
        name: "Company List",
        path: "/bookings/company",
        parent_path_number: 2,
        child_path_number: 4,
      },
      {
        id: 205,
        name: "Services/Pricing",
        path: "/bookings/service",
        parent_path_number: 2,
        child_path_number: 5,
      },
    ],
  },
  {
    id: 3,
    name: "Requests & Documents",
    icon: "FileText",
    parent_path_number: 3,
    child_path_number: 0,
    access_level: 3,
    subItems: [
      {
        id: 301,
        name: "Requisitions",
        path: "/procurement/requisition",
        parent_path_number: 3,
        child_path_number: 1,
      },
      {
        id: 302,
        name: "Purchase Orders",
        path: "/procurement/purchaseorder",
        parent_path_number: 3,
        child_path_number: 2,
      },
      {
        id: 303,
        name: "Advance Requests",
        path: "/procurement/cashadvance",
        parent_path_number: 3,
        child_path_number: 3,
      },
      {
        id: 304,
        name: "Cash Transfers",
        path: "/procurement/cashtransfer",
        parent_path_number: 3,
        child_path_number: 4,
      },
      {
        id: 305,
        name: "Income Collection",
        path: "/procurement/income",
        parent_path_number: 3,
        child_path_number: 5,
      },
      {
        id: 306,
        name: "Stock",
        path: "/procurement/stock",
        parent_path_number: 3,
        child_path_number: 6,
      },
      {
        id: 307,
        name: "Budget",
        path: "/procurement/budgets",
        parent_path_number: 3,
        child_path_number: 7,
      },
      {
        id: 308,
        name: "Learn More",
        path: "/procurement/learnmore",
        parent_path_number: 3,
        child_path_number: 8,
      },
    ],
  },
  {
    id: 4,
    name: "Approvals",
    icon: "CheckSquare",
    parent_path_number: 4,
    child_path_number: 0,
    access_level: 3,
    subItems: [
      {
        id: 401,
        name: "My Approvals",
        path: "/procurement/approvals",
        parent_path_number: 4,
        child_path_number: 1,
      },
      {
        id: 402,
        name: "All Approvals",
        path: "/procurement/controls",
        parent_path_number: 4,
        child_path_number: 2,
      },
    ],
  },
  {
    id: 5,
    name: "Finance & Analytics",
    icon: "BarChart3",
    parent_path_number: 5,
    child_path_number: 0,
    access_level: 3,
    subItems: [
      {
        id: 501,
        name: "Expense vs Income",
        path: "/reports/expense-report",
        parent_path_number: 5,
        child_path_number: 1,
      },
      {
        id: 502,
        name: "Cash Flow",
        path: "/reports/cash-flow",
        parent_path_number: 5,
        child_path_number: 2,
      },
      {
        id: 503,
        name: "Budget Performance",
        path: "/reports/budget-performance",
        parent_path_number: 5,
        child_path_number: 3,
      },
    ],
  },
];

// ============================================
// OTHERS (SYSTEM) - COMING AFTER MAIN
// ============================================

export const othersItems: NavItem[] = [
  {
    id: 6,
    name: "Settings",
    icon: "Settings",
    path: "/setting",
    parent_path_number: 6,
    child_path_number: 0,
    access_level: 3,
  },
  {
    id: 7,
    name: "Logout",
    icon: "LogOut",
    path: "/logout",
    parent_path_number: 7,
    child_path_number: 0,
    access_level: 3,
  },
];

// ============================================
// COMBINED NAVIGATION - MAIN FIRST, OTHERS SECOND
// ============================================

export const allNavItems: NavItem[] = [...navItems, ...othersItems];

// ============================================
// FLAT NAVIGATION FOR ACCESS CONTROL
// ============================================

export interface FlatNavItem {
  id: number;
  name: string;
  path: string;
  parent_path_number: number;
  child_path_number: number;
  icon: string;
  isParent: boolean;
}

// Flatten all navigation items for easier access control
export const flatNavItems: FlatNavItem[] = [];

// Add main nav items (first)
navItems.forEach((item) => {
  flatNavItems.push({
    id: item.id,
    name: item.name,
    path: item.path || `/${item.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`,
    parent_path_number: item.parent_path_number,
    child_path_number: 0,
    icon: item.icon,
    isParent: true,
  });

  // Add sub-items
  if (item.subItems) {
    item.subItems.forEach((subItem) => {
      flatNavItems.push({
        id: subItem.id,
        name: subItem.name,
        path: subItem.path,
        parent_path_number: subItem.parent_path_number,
        child_path_number: subItem.child_path_number,
        icon: item.icon,
        isParent: false,
      });
    });
  }
});

// Add others items (second)
othersItems.forEach((item) => {
  flatNavItems.push({
    id: item.id,
    name: item.name,
    path: item.path || `/${item.name.toLowerCase()}`,
    parent_path_number: item.parent_path_number,
    child_path_number: 0,
    icon: item.icon,
    isParent: true,
  });
});

// ============================================
// ACCESS CONTROL FUNCTIONS
// ============================================

export interface UserAccess {
  userId: number;
  locationId: number;
  access: {
    parentPathNumber: number;
    childPathNumber: number;
    accessLevel: 1 | 2 | 3;
  }[];
}

// Get user access for a specific path
export const getUserAccessForPath = (
  userAccess: UserAccess[],
  userId: number,
  locationId: number,
  parentPathNumber: number,
  childPathNumber: number = 0
): number | null => {
  const user = userAccess.find(
    (u) => u.userId === userId && u.locationId === locationId
  );
  if (!user) return null;

  const access = user.access.find(
    (a) =>
      a.parentPathNumber === parentPathNumber &&
      a.childPathNumber === childPathNumber
  );
  return access ? access.accessLevel : null;
};

// Check if user has access to a specific path
export const hasAccess = (
  userAccess: UserAccess[],
  userId: number,
  locationId: number,
  parentPathNumber: number,
  childPathNumber: number = 0,
  requiredLevel: 1 | 2 | 3 = 1
): boolean => {
  const level = getUserAccessForPath(
    userAccess,
    userId,
    locationId,
    parentPathNumber,
    childPathNumber
  );
  if (level === null) return false;
  return level >= requiredLevel;
};

// Get all accessible paths for a user
export const getAccessiblePaths = (
  userAccess: UserAccess[],
  userId: number,
  locationId: number
): string[] => {
  const user = userAccess.find(
    (u) => u.userId === userId && u.locationId === locationId
  );
  if (!user) return [];

  const accessiblePaths: string[] = [];

  user.access.forEach((access) => {
    flatNavItems.forEach((item) => {
      if (
        item.parent_path_number === access.parentPathNumber &&
        (access.childPathNumber === 0 || item.child_path_number === access.childPathNumber)
      ) {
        if (access.accessLevel >= 1) {
          accessiblePaths.push(item.path);
        }
      }
    });
  });

  return accessiblePaths;
};

// ============================================
// EXAMPLE ACCESS CONTROL DATA
// ============================================

export const createAccessControl = (
  userId: number,
  locationId: number,
  parentPathNumber: number,
  childPathNumber: number,
  accessLevel: 1 | 2 | 3
): AccessControl => ({
  user_id: userId,
  location_id: locationId,
  parent_path_number: parentPathNumber,
  child_path_number: childPathNumber,
  access_level: accessLevel,
});

// Generate access control entries for all navigation items
export const generateFullAccess = (userId: number, locationId: number): AccessControl[] => {
  const accessControls: AccessControl[] = [];

  // Add main nav items (first)
  navItems.forEach((item) => {
    accessControls.push({
      user_id: userId,
      location_id: locationId,
      parent_path_number: item.parent_path_number,
      child_path_number: 0,
      access_level: 3,
    });

    if (item.subItems) {
      item.subItems.forEach((subItem) => {
        accessControls.push({
          user_id: userId,
          location_id: locationId,
          parent_path_number: subItem.parent_path_number,
          child_path_number: subItem.child_path_number,
          access_level: 3,
        });
      });
    }
  });

  // Add others items (second)
  othersItems.forEach((item) => {
    accessControls.push({
      user_id: userId,
      location_id: locationId,
      parent_path_number: item.parent_path_number,
      child_path_number: 0,
      access_level: 3,
    });
  });

  return accessControls;
};

// ============================================
// GET PARENT ITEMS ONLY (for main menu)
// ============================================

export const getParentItems = (): NavItem[] => {
  return navItems;
};

// ============================================
// GET CHILD ITEMS FOR A PARENT
// ============================================

export const getChildItems = (parentId: number): { id: number; name: string; path: string; parent_path_number: number; child_path_number: number; pro?: boolean; new?: boolean; }[] => {
  const parent = navItems.find(item => item.id === parentId);
  return parent?.subItems || [];
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  navItems,
  othersItems,
  allNavItems,
  flatNavItems,
  getUserAccessForPath,
  hasAccess,
  getAccessiblePaths,
  createAccessControl,
  generateFullAccess,
  getParentItems,
  getChildItems,
};