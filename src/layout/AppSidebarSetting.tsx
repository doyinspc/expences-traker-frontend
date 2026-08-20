import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router"; // or "react-router-dom" depending on your version

// Imported icons from Lucide React
import {
  Banknote,
  Users,
  Settings,
  ChevronDown,
  MoreHorizontal,
  Database,
  ArrowLeft,
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  // Changed from Function to a specific void function for better TS safety
  path?: string | (() => void); 
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate(); // Moved inside the component

  // Wrap settingsItems in useMemo so it can safely access 'navigate'
  const settingsItems: NavItem[] = useMemo(
    () => [
      // ============================================
      // User Management (grp 1-9)
      // ============================================
      {
        icon: <Users size={24} strokeWidth={1.5} />,
        name: "User Management",
        subItems: [
          { name: "Roles", path: "/setting/page/1" },
          { name: "Departments", path: "/setting/page/2" },
          { name: "Locations", path: "/setting/page/4" },
          { name: "User", path: "/setting/user" },
        ],
      },
      // ============================================
      // Financial Settings (grp 8-9)
      // ============================================
      {
        icon: <Banknote size={24} strokeWidth={1.5} />,
        name: "Financial Settings",
        subItems: [
          { name: "Expense/Income Types", path: "/setting/expense" },
          { name: "Currency", path: "/setting/page/6" },
          { name: "Accounts/Banks", path: "/setting/page/7" },
        ],
      },
      // ============================================
      // Reference Data (grp 10-19)
      // ============================================
      {
        icon: <Database size={24} strokeWidth={1.5} />,
        name: "Reference Data",
        subItems: [
          { name: "Document Types", path: "/setting/page/10" },
          { name: "Workflow Status", path: "/setting/page/11" },
          { name: "Approval Actions", path: "/setting/page/12" },
          { name: "Document Status", path: "/setting/page/13" },
          { name: "Priority Levels", path: "/setting/page/14" },
          { name: "Workflow Types", path: "/setting/page/15" },
          { name: "Notification Types", path: "/setting/page/16" },
          { name: "Escalation Reasons", path: "/setting/page/17" },
          { name: "Rejection Reasons", path: "/setting/page/18" },
          { name: "Document Categories", path: "/setting/page/19" },
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
          { name: "Approval Workflows", path: "/setting/workflow" },
          { name: "Chart of Accounts", path: "/setting/chart-of-accounts" },
          { name: "Tax & Deductions", path: "/setting/taxes" },
          { name: "Audit Trail", path: "/setting/audit" },
          { name: "Vendors", path: "/setting/page/8" },
        ],
      },
      // ============================================
      // Back Button
      // ============================================
      {
        icon: <ArrowLeft size={24} strokeWidth={1.5} />,
        name: "Back",
        path: () => navigate('/'), // Now safely accesses the navigate hook
      },
    ],
    [navigate]
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "settings";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string | (() => void) | undefined) => {
      if (typeof path === "string") return location.pathname === path;
      return false;
    },
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
  }, [location, isActive, settingsItems]);

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
          ) : typeof nav.path === "function" ? (
            <button
              type="button"
              onClick={nav.path}
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
            </button>
          ) : typeof nav.path === "string" && nav.path !== "" ? (
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
          ) : null}
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