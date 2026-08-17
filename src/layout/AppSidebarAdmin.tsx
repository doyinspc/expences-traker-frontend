import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Imported icons from Lucide React
import {
  Banknote,
  Users,
  Settings,
  ChevronDown,
  MoreHorizontal,
  Database
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// ============================================
// SETTINGS ONLY - All Groups (grp 1-19)
// ============================================
const settingsItems: NavItem[] = [
  // ============================================
  // User Management (grp 1-9)
  // ============================================
  {
    icon: <Users size={24} strokeWidth={1.5} />,
    name: "User Management",
    subItems: [
      // grp 1: Roles
      { name: "Roles", path: "/setting/roles/1" },
      // grp 2: Departments
      { name: "Departments", path: "/setting/departments/2" },
      // grp 3: Locations
      { name: "Locations", path: "/setting/locations/3" },
      // grp 4: User Locations
      { name: "User Locations", path: "/setting/userlocations/4" },
      // grp 5: User Departments
      { name: "User Departments", path: "/setting/userdepartments/5" },
      // grp 6: User Managers
      { name: "User Managers", path: "/setting/usermanagers/6" },
      // grp 7: User Access
      { name: "User Access", path: "/setting/useraccess/7" },
    ],
  },
  // ============================================
  // Financial Settings (grp 8-9)
  // ============================================
  {
    icon: <Banknote size={24} strokeWidth={1.5} />,
    name: "Financial Settings",
    subItems: [
      // grp 8: Expense Types
      { name: "Expense Types", path: "/setting/expensetypes/8" },
      // grp 9: Currency
      { name: "Currency", path: "/setting/currency/9" },
    ],
  },
  // ============================================
  // Reference Data (grp 10-19)
  // ============================================
  {
    icon: <Database size={24} strokeWidth={1.5} />,
    name: "Reference Data",
    subItems: [
      // grp 10: Document Types
      { name: "Document Types", path: "/setting/documenttypes/10" },
      // grp 11: Workflow Status
      { name: "Workflow Status", path: "/setting/workflowstatus/11" },
      // grp 12: Approval Actions
      { name: "Approval Actions", path: "/setting/approvalactions/12" },
      // grp 13: Document Status
      { name: "Document Status", path: "/setting/documentstatus/13" },
      // grp 14: Priority Levels
      { name: "Priority Levels", path: "/setting/prioritylevels/14" },
      // grp 15: Workflow Types
      { name: "Workflow Types", path: "/setting/workflowtypes/15" },
      // grp 16: Notification Types
      { name: "Notification Types", path: "/setting/notificationtypes/16" },
      // grp 17: Escalation Reasons
      { name: "Escalation Reasons", path: "/setting/escalationreasons/17" },
      // grp 18: Rejection Reasons
      { name: "Rejection Reasons", path: "/setting/rejectionreasons/18" },
      // grp 19: Document Categories
      { name: "Document Categories", path: "/setting/documentcategories/19" },
    ],
  },
  // ============================================
  // System Settings
  // ============================================
  {
    icon: <Settings size={24} strokeWidth={1.5} />,
    name: "System Settings",
    subItems: [
      { name: "Company Profile", path: "/setting/company-profile" },
      { name: "Approval Workflows", path: "/setting/workflows" },
      { name: "Chart of Accounts", path: "/setting/chart-of-accounts" },
      { name: "Tax & Deductions", path: "/setting/taxes" },
      { name: "Audit Trail", path: "/setting/audit" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "settings";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    settingsItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "settings",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

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

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === "settings" &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: "settings", index };
    });
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {settingsItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu?.type === "settings" && openSubmenu?.index === index
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
                  openSubmenu?.type === "settings" && openSubmenu?.index === index
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
                    openSubmenu?.type === "settings" &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`settings-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === "settings" && openSubmenu?.index === index
                    ? `${subMenuHeight[`settings-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
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
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
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
                  "Settings"
                ) : (
                  <MoreHorizontal size={24} strokeWidth={1.5} className="text-gray-400" />
                )}
              </h2>
              {renderMenuItems()}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;