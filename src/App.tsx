import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import AppLayoutHome from "./layout/AppLayoutHome";
import AppLayoutAdmin from "./layout/AppLayoutAdmin";
import AppLayoutSetting from "./layout/AppLayoutSetting";
import AppLayoutMIS from "./layout/AppLayoutMIS";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Dashboard
import Home from "./pages/Dashboard/Home";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import Welcome from "./pages/Dashboard/Location";

// Procurement
// import Requisitions from "./pages/Procurement/Requisitions";
import ApprovalCenter from "./pages/Procurement/ApprovalCenter.jsx";
import ApprovalCenterDetails from "./pages/Procurement/ApprovalCenterDetails.jsx";
import ControlCenter from "./pages/Procurement/ControlCenter.jsx";
//import CashTransfer from "./pages/Procurement/CashTransfer.tsx";

import Requisitions from "./pages/Product/Requisition";
import RequisitionItems from "./pages/Product/RequisitionItems.tsx";
import PurchaseOrders from "./pages/Product/PurchaseOrder";
import PurchaseOrderRequisitions from "./pages/Product/PurchaseOrderRequisitions";
import CashTransfer from "./pages/Product/CashTransfer.jsx";
import CashTransferItems from "./pages/Product/CashTransItems.tsx";
import CashAdvance from "./pages/Product/CashAdvance.jsx";

import SettingLanding from "./pages/Settings/SettingsLanding.tsx";
import SettingPage from "./pages/Settings/Index.tsx";
import SettingSubPage from "./pages/Settings/IndexChild.tsx";

// Cash & Advances
import AdvanceRequests from "./pages/CashAdvances/AdvanceRequests";

// Finance & Expenses
import AccountsPayable from "./pages/Finance/AccountsPayable";
import Opex from "./pages/Finance/Opex";
import Payments from "./pages/Finance/Payments";
import Budgets from "./pages/Finance/Budgets";

// Budgets
import BudgetList from "./pages/Budgets/Budgets";
import BudgetItems from "./pages/Budgets/BudgetItems.jsx";

// Inventory & Assets
import GoodsReceived from "./pages/Inventory/GoodsReceived";
import FixedAssets from "./pages/Inventory/FixedAssets";
import StockLevels from "./pages/Inventory/StockLevels";
import Allocations from "./pages/Inventory/Allocations";

// Reports & Analytics
import ExpenseAsset from "./pages/Reports/ExpenseAsset";
import CashFlow from "./pages/Reports/CashFlow";
import AuditTrails from "./pages/Reports/AuditTrails";

// Teams & Permissions
import UserDirectory from "./pages/Teams/UserDirectory";
import RolesAccess from "./pages/Teams/RolesAccess";
import Departments from "./pages/Teams/Departments";
import AuthorityDelegation from "./pages/Teams/AuthorityDelegation";

// System Settings
import CompanyProfile from "./pages/Settings/CompanyProfile";
import WorkFlowPage from "./pages/Settings/ApprovalWorkflows";
import WorkFlowStepsPage from "./pages/Settings/ApprovalWorkflowSteps.tsx";
import Vendors from "./pages/Settings/Vendors.tsx";
import PurchaseOrderItems from "./pages/Procurement/PurchaseOrderRequisitions";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index path="/welcome" element={<Home />} />
            <Route index path="/" element={<Welcome />} />
            <Route index path="/dashboard" element={<Dashboard />} />

            {/* Procurement */}
            <Route path="/procurement/cashadvance" element={<CashAdvance />} />
            <Route path="/procurement/cashadvance/:id" element={<RequisitionItems />} />
            <Route path="/procurement/requisition" element={<Requisitions />} />
            <Route path="/procurement/requisition/:id" element={<RequisitionItems />} />
            <Route path="/procurement/purchaseorder" element={<PurchaseOrders />} />
            <Route path="/procurement/purchaseorder/:id" element={<PurchaseOrderRequisitions />} />
            <Route path="/procurement/cashtransfer" element={<CashTransfer />} />
            <Route path="/procurement/cashtransfer/:id" element={<CashTransferItems />} />
            <Route path="/procurement/budgets" element={<BudgetList />} />
            <Route path="/procurement/budgets/:budgetId" element={<BudgetItems />} />

            <Route path="/procurement/approvals" element={<ApprovalCenter />} />
            <Route path="/procurement/approvals/:workflow_id" element={<ApprovalCenterDetails />} />
            <Route path="/procurement/controls" element={<ControlCenter />} />

            {/* Cash & Advances */}
            <Route path="/procurement/requests" element={<AdvanceRequests />} />

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

            {/* Teams & Permissions */}
            <Route path="/teams/directory" element={<UserDirectory />} />
            <Route path="/teams/roles" element={<RolesAccess />} />
            <Route path="/teams/departments" element={<Departments />} />
            <Route path="/teams/delegation" element={<AuthorityDelegation />} />

            {/* System Settings */}
          </Route>
          <Route path="/setting" element={<AppLayoutSetting />}>
            <Route index path="/setting/" element={<SettingLanding />} />
            <Route path="/setting/page/:grp" element={<SettingPage />} />
            <Route path="/setting/page/:grp/:page_id" element={<SettingSubPage />} />
            <Route path="/setting/user" element={<UserDirectory />} />
            <Route path="/setting/workflow" element={<WorkFlowPage />} />
            <Route path="/setting/workflow/:page_id" element={<WorkFlowStepsPage />} />
          </Route>
          <Route path="/admin" element={<AppLayoutAdmin />}>
          </Route>
          <Route path="/home" element={<AppLayoutHome />}>
          </Route>
          <Route path="/mis" element={<AppLayoutMIS />}>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}