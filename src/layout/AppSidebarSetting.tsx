import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSelector } from 'react-redux';

// Imported icons from Lucide React
import {
  Banknote,
  Users,
  Settings,
  ChevronDown,
  MoreHorizontal,
  Database,
  ArrowLeft,
  Building2,
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";
import { SERVER_URL } from "../actions/common";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string | (() => void);
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, isMobile, toggleMobileSidebar } = useSidebar();
  useEffect(() => {
    if (!isMobileOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { toggleMobileSidebar(); document.getElementById("navigation-toggle")?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [isMobileOpen, toggleMobileSidebar]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user and company data from Redux
  const { user } = useSelector((state: any) => state.auth);
  const company = user?.company || {};
  const companyName = company.name || 'Company';
  const shortName = company.short_name || '';
  const logoPath = company.logo_path || '';
  const companyLogo = logoPath ? SERVER_URL + logoPath : null;

  // State for logo error – fallback to default icon
  const [logoError, setLogoError] = useState(false);

  // Determine if we should show the company logo or fallback
  const showCompanyLogo = companyLogo && !logoError;

  // Get initials for fallback
  const getInitials = (name: string) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Settings items (unchanged)
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
          { name: "Chart of Accounts", path: "/setting/page/7" },
        ],
      },
      // ============================================
      // GUEST HOUSE Settings (grp 30 & 31)
      // ============================================
      {
        icon: <Banknote size={24} strokeWidth={1.5} />,
        name: "Guest House Settings",
        subItems: [
          { name: "Buildings and Rooms", path: "/setting/room" },
          { name: "Services and Pricing", path: "/setting/service" },
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
          { name: "Vendors", path: "/setting/page/8" },
        ],
      },
      // ============================================
      // Back Button
      // ============================================
      {
        icon: <ArrowLeft size={24} strokeWidth={1.5} />,
        name: "Back",
        path: () => navigate('/'),
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
      if (typeof path === "string") return location.pathname === path || (path !== "/" && location.pathname.startsWith(`${path}/`));
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

  // Circular logo container styles
  const logoContainerClass = `
    flex items-center justify-center
    w-10 h-10
    rounded-full
    overflow-hidden
    bg-gray-100 dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    flex-shrink-0
    transition-all duration-300
  `;

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {settingsItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              type="button"
              aria-label={nav.name}
              aria-expanded={openSubmenu?.index === index}
              aria-controls={`settings-nav-${index}`}
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
              aria-label={nav.name}
              onClick={() => { if (isMobileOpen) toggleMobileSidebar(); if (typeof nav.path === "function") nav.path(); }}
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
              id={`settings-nav-${index}`}
              inert={openSubmenu?.index !== index}
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
                      onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
                      aria-current={isActive(subItem.path) ? "page" : undefined}
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
    <aside id="app-navigation" aria-label="Settings navigation" inert={isMobile && !isMobileOpen}
      className={`fixed bottom-0 top-16 lg:top-0 min-h-0 flex flex-col px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 transition-all duration-300 ease-in-out z-50 border-r border-gray-200
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
      {/* Logo Area with Company Logo and Short Name */}
      <div
        className={`shrink-0 py-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          {/* Circular Logo */}
          <div className={logoContainerClass}>
            {showCompanyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </div>

          {/* Company Short Name - Only visible when expanded or hovered */}
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">
                {shortName || companyName}
              </span>
              {shortName && shortName !== companyName && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                  {companyName}
                </span>
              )}
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div tabIndex={0} aria-label="Scrollable Settings menu" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y custom-scrollbar pt-4 pb-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
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
