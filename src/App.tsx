import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from "react";

// Layouts – keep static (they are shared and not too heavy)
import AppLayout from "./layout/AppLayout";
import AppLayoutHome from "./layout/AppLayoutHome";
import AppLayoutAdmin from "./layout/AppLayoutAdmin";
import AppLayoutSetting from "./layout/AppLayoutSetting";
import AppLayoutMIS from "./layout/AppLayoutMIS";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Lazy‑load all page components
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));

// Dashboard
const Home = lazy(() => import("./pages/Dashboard/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard.tsx"));
const Welcome = lazy(() => import("./pages/Dashboard/Location"));
const Profile = lazy(() => import("./pages/Teams/UserComponents/UserInfoPagePrivate.jsx"));

// Procurement
const ApprovalCenter = lazy(() => import("./pages/Procurement/ApprovalCenter.jsx"));
const ApprovalCenterDetails = lazy(() => import("./pages/Procurement/ApprovalCenterDetails.jsx"));
const ControlCenter = lazy(() => import("./pages/Procurement/ControlCenter.jsx"));
const Requisitions = lazy(() => import("./pages/Product/Requisition"));
const RequisitionItems = lazy(() => import("./pages/Product/RequisitionItems.tsx"));
const PurchaseOrders = lazy(() => import("./pages/Product/PurchaseOrder"));
const PurchaseOrderRequisitions = lazy(() => import("./pages/Product/PurchaseOrderRequisitions"));
const CashTransfer = lazy(() => import("./pages/Product/CashTransfer.jsx"));
const CashTransferItems = lazy(() => import("./pages/Product/CashTransferItems.tsx"));
const Incomes = lazy(() => import("./pages/Product/Income.jsx"));
const IncomeItems = lazy(() => import("./pages/Product/IncomeItems.tsx"));
const Stocks = lazy(() => import("./pages/Product/Stock.jsx"));
const StockItems = lazy(() => import("./pages/Product/StockItems.tsx"));
const CashAdvance = lazy(() => import("./pages/Product/CashAdvance.jsx"));
const BudgetList = lazy(() => import("./pages/Budgets/Budgets"));
const BudgetItems = lazy(() => import("./pages/Budgets/BudgetItems.jsx"));
const LearnMore = lazy(() => import("./pages/Product/LearnMore.tsx"));

// Settings
const SettingLanding = lazy(() => import("./pages/Settings/SettingsLanding.tsx"));
const SettingPage = lazy(() => import("./pages/Settings/Index.tsx"));
const SettingSubPage = lazy(() => import("./pages/Settings/IndexChild.tsx"));

// Bookings
const Booking = lazy(() => import("./pages/Bookings/Bookings.tsx"));
const BookingPage = lazy(() => import("./pages/Bookings/BookingsPage.tsx"));
const BookingReport = lazy(() => import("./pages/Bookings/Reports.tsx"));
const BookingClient = lazy(() => import("./pages/Bookings/Clients.tsx"));
const BookingCompany = lazy(() => import("./pages/Bookings/Companies.tsx"));

// Cash Advances
const AdvanceRequests = lazy(() => import("./pages/CashAdvances/AdvanceRequests"));

// Finance
const AccountsPayable = lazy(() => import("./pages/Finance/AccountsPayable"));
const Payments = lazy(() => import("./pages/Finance/Payments"));
const Budgets = lazy(() => import("./pages/Finance/Budgets"));

// Inventory
const GoodsReceived = lazy(() => import("./pages/Inventory/GoodsReceived"));
const FixedAssets = lazy(() => import("./pages/Inventory/FixedAssets"));
const StockLevels = lazy(() => import("./pages/Inventory/StockLevels"));
const Allocations = lazy(() => import("./pages/Inventory/Allocations"));

// Reports
const ExpenseAsset = lazy(() => import("./pages/Reports/ExpenseAsset"));
const CashFlow = lazy(() => import("./pages/Reports/CashFlow.jsx"));
const AuditTrails = lazy(() => import("./pages/Reports/AuditTrails"));
const ExpenseReport = lazy(() => import("./pages/Reports/ExpenseReport.jsx"));
const Opex = lazy(() => import("./pages/Reports/Opex"));
const Capex = lazy(() => import("./pages/Reports/Capex"));
const BudgetGraph = lazy(() => import("./pages/Reports/Budget.jsx"));

// Teams & Permissions
const UserDirectory = lazy(() => import("./pages/Teams/UserDirectory"));
const RolesAccess = lazy(() => import("./pages/Teams/RolesAccess"));
const Departments = lazy(() => import("./pages/Teams/Departments"));
const AuthorityDelegation = lazy(() => import("./pages/Teams/AuthorityDelegation"));

// System Settings (detail pages)
const SettingCompany = lazy(() => import("./pages/Settings/CompanyProfile"));
const WorkFlowPage = lazy(() => import("./pages/Settings/ApprovalWorkflows"));
const WorkFlowStepsPage = lazy(() => import("./pages/Settings/ApprovalWorkflowSteps.tsx"));
const ExpensePage = lazy(() => import("./pages/Settings/Expenses"));
const ExpenseItemsPage = lazy(() => import("./pages/Settings/ExpenseItems.tsx"));
const IncomePage = lazy(() => import("./pages/Settings/Incomes.tsx"));
const IncomeItemsPage = lazy(() => import("./pages/Settings/IncomeItems.tsx"));
const RoomPage = lazy(() => import("./pages/Settings/Rooms"));
const RoomItemsPage = lazy(() => import("./pages/Settings/RoomItems.tsx"));
const ServicePage = lazy(() => import("./pages/Settings/Services.tsx"));
const ServiceItemsPage = lazy(() => import("./pages/Settings/ServiceItems.tsx"));

// Optional: a global loading fallback component
const PageLoader = () => <div className="loading-spinner">Loading...</div>;

export default function App() {
  return (
    <Router >
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Dashboard Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index path="/welcome" element={<Home />} />
            <Route index path="/" element={<Welcome />} />
            <Route index path="/dashboard" element={<Dashboard />} />
            <Route index path="/profile" element={<Profile />} />

            {/* Procurement */}
            <Route path="/procurement/cashadvance" element={<CashAdvance />} />
            <Route path="/procurement/cashadvance/:id" element={<RequisitionItems />} />
            <Route path="/procurement/requisition" element={<Requisitions />} />
            <Route path="/procurement/requisition/:id" element={<RequisitionItems />} />
            <Route path="/procurement/income" element={<Incomes />} />
            <Route path="/procurement/income/:id" element={<IncomeItems />} />
            <Route path="/procurement/stock" element={<Stocks />} />
            <Route path="/procurement/stock/:id" element={<StockItems />} />
            <Route path="/procurement/purchaseorder" element={<PurchaseOrders />} />
            <Route path="/procurement/purchaseorder/:id" element={<PurchaseOrderRequisitions />} />
            <Route path="/procurement/cashtransfer" element={<CashTransfer />} />
            <Route path="/procurement/cashtransfer/:id" element={<CashTransferItems />} />
            <Route path="/procurement/budgets" element={<BudgetList />} />
            <Route path="/procurement/budgets/:budgetId" element={<BudgetItems />} />
            <Route path="/procurement/learnmore" element={<LearnMore />} />
            <Route path="/procurement/approvals" element={<ApprovalCenter />} />
            <Route path="/procurement/approvals/:workflow_id" element={<ApprovalCenterDetails />} />
            <Route path="/procurement/controls" element={<ControlCenter />} />

            {/* Cash & Advances */}
            <Route path="/procurement/requests" element={<AdvanceRequests />} />

            {/* Bookings */}
            <Route path="/bookings/booking" element={<Booking />} />
            <Route path="/bookings/booking/:id" element={<BookingPage />} />
            <Route path="/bookings/report" element={<BookingReport />} />
            <Route path="/bookings/client" element={<BookingClient />} />
            <Route path="/bookings/company" element={<BookingCompany />} />

            {/* Finance & Expenses */}
            <Route path="/finance/payable" element={<AccountsPayable />} />
            <Route path="/finance/opex" element={<Opex />} />
            <Route path="/finance/payments" element={<Payments />} />
            <Route path="/finance/budgets" element={<Budgets />} />

            {/* Inventory & Assets */}
            <Route path="/inventory/grn" element={<GoodsReceived />} />
            <Route path="/inventory/fixed-assets" element={<FixedAssets />} />
            <Route path="/inventory/stock" element={<StockLevels />} />
            <Route path="/inventory/allocations" element={<Allocations />} />

            {/* Reports & Analytics */}
            <Route path="/reports/expense-asset" element={<ExpenseAsset />} />
            <Route path="/reports/cash-flow" element={<CashFlow />} />
            <Route path="/reports/audit" element={<AuditTrails />} />
            <Route path="/reports/expense-report" element={<ExpenseReport />} />
            <Route path="/reports/capex" element={<Capex />} />
            <Route path="/reports/opex" element={<Opex />} />
            <Route path="/reports/budget-performance" element={<BudgetGraph />} />

            {/* Teams & Permissions */}
            <Route path="/teams/directory" element={<UserDirectory />} />
            <Route path="/teams/roles" element={<RolesAccess />} />
            <Route path="/teams/departments" element={<Departments />} />
            <Route path="/teams/delegation" element={<AuthorityDelegation />} />
          </Route>

          {/* Settings Layout */}
          <Route path="/setting" element={<AppLayoutSetting />}>
            <Route index path="/setting/" element={<SettingLanding />} />
            <Route index path="/setting/company-profile" element={<SettingCompany />} />
            <Route path="/setting/chart-of-accounts" element={<Navigate replace to="/setting/page/7" />} />
            <Route path="/setting/page/:grp" element={<SettingPage />} />
            <Route path="/setting/page/:grp/:page_id" element={<SettingSubPage />} />
            <Route path="/setting/user" element={<UserDirectory />} />
            <Route path="/setting/workflow" element={<WorkFlowPage />} />
            <Route path="/setting/workflow/:page_id" element={<WorkFlowStepsPage />} />
            <Route path="/setting/expense" element={<ExpensePage />} />
            <Route path="/setting/expense/:page_id" element={<ExpenseItemsPage />} />
            <Route path="/setting/income" element={<IncomePage />} />
            <Route path="/setting/income/:page_id" element={<IncomeItemsPage />} />
            <Route path="/setting/room" element={<RoomPage />} />
            <Route path="/setting/room/:page_id" element={<RoomItemsPage />} />
            <Route path="/setting/service" element={<ServicePage />} />
            <Route path="/setting/service/:page_id" element={<ServiceItemsPage />} />
          </Route>

          <Route path="/admin" element={<AppLayoutAdmin />} />
          <Route path="/home" element={<AppLayoutHome />} />
          <Route path="/mis" element={<AppLayoutMIS />} />

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}