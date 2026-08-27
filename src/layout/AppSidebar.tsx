import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "./../actions/auth";

// Imported icons from Lucide React - only used ones
import {
  LayoutGrid,
  FileText,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronDown,
  MoreHorizontal,
  LogOut,
  BedDoubleIcon,
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";

const { logout } = authActions;

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  parent_path_number: number;
  child_path_number: number;
  id: number;
  subItems?: {
    id: number;
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    parent_path_number: number;
    child_path_number: number;
  }[];
};

// ============================================
// MAIN NAVIGATION
// ============================================
const navItems: NavItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: <LayoutGrid size={24} strokeWidth={1.5} />,
    path: "/",
    parent_path_number: 1,
    child_path_number: 0,
  },
  {
    id: 2,
    name: "Bookings",
    icon: <BedDoubleIcon size={24} strokeWidth={1.5} />,
    parent_path_number: 2,
    child_path_number: 0,
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
    icon: <FileText size={24} strokeWidth={1.5} />,
    parent_path_number: 3,
    child_path_number: 0,
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
    icon: <CheckSquare size={24} strokeWidth={1.5} />,
    parent_path_number: 4,
    child_path_number: 0,
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
    icon: <BarChart3 size={24} strokeWidth={1.5} />,
    parent_path_number: 5,
    child_path_number: 0,
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
// SYSTEM
// ============================================
const othersItems: NavItem[] = [
  {
    id: 6,
    name: "Settings",
    icon: <Settings size={24} strokeWidth={1.5} />,
    path: "/setting",
    parent_path_number: 6,
    child_path_number: 0,
  },
  {
    id: 7,
    name: "Logout",
    icon: <LogOut size={24} strokeWidth={1.5} />,
    path: "/logout",
    parent_path_number: 7,
    child_path_number: 0,
  },
];

// ============================================
// ID REFERENCE
// ============================================
// Parent IDs:
// 1 = Dashboard (ALWAYS VISIBLE)
// 2 = Bookings
// 3 = Requests & Documents
// 4 = Approvals
// 5 = Finance & Analytics
// 6 = Settings
// 7 = Logout (ALWAYS VISIBLE)

// Child IDs:
// 201-205 = Bookings sub-items
// 301-308 = Requests & Documents sub-items
// 401-402 = Approvals sub-items
// 501-503 = Finance & Analytics sub-items

// ============================================
// AppSidebar Component
// ============================================
const AppSidebar: React.FC = () => {
  const authState = useSelector((state: any) => state.auth);
  const { access, location_id, isAdmin = true } = authState;
  
  // Memoize current location access
  const current_location = useMemo(() => {
    return access?.filter((rw: any) => rw.location_id == location_id) || [];
  }, [access, location_id]);

  // Memoize filtered nav items
  const { navItems1, othersItems1 } = useMemo(() => {
    // If user is admin, return all items without filtering
    if (isAdmin) {
      return {
        navItems1: navItems,
        othersItems1: othersItems,
      };
    }

    // Helper function to check if user has access to a specific item
    const hasAccess = (parentPathNumber: number, childPathNumber: number = 0): boolean => {
      // Dashboard (id: 1) and Logout (id: 7) are always accessible
      if (parentPathNumber === 1 || parentPathNumber === 7) {
        return true;
      }

      // Check if user has access to this specific path
      return current_location.some(
        (rw: any) =>
          Number(rw.parent_path_number) === parentPathNumber &&
          Number(rw.child_path_number) === childPathNumber
      );
    };

    // Filter nav items based on access (Dashboard is ALWAYS included)
    const filteredNavItems: NavItem[] = [];
    navItems.forEach((rw: NavItem) => {
      // Dashboard (id: 1) is always visible
      if (rw.id === 1) {
        filteredNavItems.push(rw);
        return;
      }

      // Check if user has access to this parent
      const hasParentAccess = hasAccess(rw.parent_path_number, 0);

      if (hasParentAccess) {
        // Filter sub-items based on child access
        const filteredSubItems = rw.subItems?.filter((subItem) => {
          // Check if user has access to this specific child
          return hasAccess(subItem.parent_path_number, subItem.child_path_number);
        });

        // Only add the parent if it has at least one accessible child
        if (filteredSubItems && filteredSubItems.length > 0) {
          filteredNavItems.push({
            ...rw,
            subItems: filteredSubItems,
          });
        } else if (!rw.subItems || rw.subItems.length === 0) {
          // If no sub-items, just add the parent
          filteredNavItems.push(rw);
        }
      }
    });

    // Filter others items (Logout is ALWAYS included)
    const filteredOthersItems: NavItem[] = [];
    othersItems.forEach((rw: NavItem) => {
      // Logout (id: 7) is always visible
      if (rw.id === 7) {
        filteredOthersItems.push(rw);
        return;
      }

      // Check if user has access to this parent
      const hasParentAccess = hasAccess(rw.parent_path_number, 0);

      if (hasParentAccess) {
        // Settings has no sub-items
        filteredOthersItems.push(rw);
      }
    });

    return {
      navItems1: filteredNavItems,
      othersItems1: filteredOthersItems,
    };
  }, [current_location, isAdmin]);

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Reset open submenu when nav items change
  useEffect(() => {
    setOpenSubmenu(null);
  }, [navItems1, othersItems1]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems1 : othersItems1;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems1, othersItems1]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // ============================================
  // HANDLE LOGOUT
  // ============================================
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  // ============================================
  // HANDLE ITEM CLICK
  // ============================================
  const handleItemClick = useCallback(
    (nav: NavItem) => {
      if (nav.path === "/logout") {
        handleLogout();
        return;
      }
      if (nav.path) {
        navigate(nav.path);
      }
    },
    [handleLogout, navigate]
  );

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.id || nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  size={20}
                  strokeWidth={1.5}
                  className={`ml-auto transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            <div
              onClick={() => handleItemClick(nav)}
              className={`menu-item group cursor-pointer ${
                isActive(nav.path || "") ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive(nav.path || "")
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </div>
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.id || subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={100}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={100}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Main"
                ) : (
                  <MoreHorizontal size={24} strokeWidth={1.5} className="text-gray-400" />
                )}
              </h2>
              {renderMenuItems(navItems1, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "System"
                ) : (
                  <MoreHorizontal size={24} strokeWidth={1.5} className="text-gray-400" />
                )}
              </h2>
              {renderMenuItems(othersItems1, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;