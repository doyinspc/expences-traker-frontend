import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebarSetting";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 xl:flex dark:bg-gray-950">
      <a href="#main-content" className="sr-only z-[100000] rounded-lg bg-brand-600 p-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <main inert={isMobile && isMobileOpen} id="main-content" tabIndex={-1} className="min-w-0 p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
