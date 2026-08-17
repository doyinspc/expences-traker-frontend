// src/reducers/index.js

import { combineReducers } from 'redux';
import ReducerCreator from './reducerCreator';

// --- Reducers that are NOT handled by ReducerCreator ---
import auth from "./auth";
import tenant from "./tenant";
import ui from "./ui";

// --- Dynamically Created Reducers using ReducerCreator ---

// Identity & Access
const userReducerFactory = new ReducerCreator("USER", "user");
const userReducer = userReducerFactory.createReducer();

const userlocationReducerFactory = new ReducerCreator("USERLOCATION", "userlocation");
const userlocationReducer = userlocationReducerFactory.createReducer();

const userdepartmentReducerFactory = new ReducerCreator("USERDEPARTMENT", "userdepartment");
const userdepartmentReducer = userdepartmentReducerFactory.createReducer();

const useremploymenttypeReducerFactory = new ReducerCreator("USEREMPLOYMENTTYPE", "useremploymenttype");
const useremploymenttypeReducer = useremploymenttypeReducerFactory.createReducer();

const userstatusReducerFactory = new ReducerCreator("USERSTATUS", "userstatus");
const userstatusReducer = userstatusReducerFactory.createReducer();

const userroleReducerFactory = new ReducerCreator("USERROLE", "userrole");
const userroleReducer = userroleReducerFactory.createReducer();

const userpermissionReducerFactory = new ReducerCreator("USERPERMISSION", "userpermission");
const userpermissionReducer = userpermissionReducerFactory.createReducer();

const useraccessReducerFactory = new ReducerCreator("USERACCESS", "useraccess");
const useraccessReducer = useraccessReducerFactory.createReducer();

const usermanagerReducerFactory = new ReducerCreator("USERMANAGER", "usermanager");
const usermanagerReducer = usermanagerReducerFactory.createReducer();

const roleReducerFactory = new ReducerCreator("ROLE", "role");
const roleReducer = roleReducerFactory.createReducer();

const departmentReducerFactory = new ReducerCreator("DEPARTMENT", "department");
const departmentReducer = departmentReducerFactory.createReducer();

const locationReducerFactory = new ReducerCreator("LOCATION", "location");
const locationReducer = locationReducerFactory.createReducer();

// Procurement
const vendorReducerFactory = new ReducerCreator("VENDOR", "vendor");
const vendorReducer = vendorReducerFactory.createReducer();

const itemCategoryReducerFactory = new ReducerCreator("ITEM_CATEGORY", "itemCategory");
const itemCategoryReducer = itemCategoryReducerFactory.createReducer();

const expencesReducerFactory = new ReducerCreator("EXPENSE", "expense");
const expencesReducer = expencesReducerFactory.createReducer();

const expenceitemsReducerFactory = new ReducerCreator("EXPENSEITEM", "expenseItem");
const expenceitemsReducer = expenceitemsReducerFactory.createReducer();

const accountReducerFactory = new ReducerCreator("ACCOUNT", "account");
const accountReducer = accountReducerFactory.createReducer();

const skuReducerFactory = new ReducerCreator("SKU", "sku");
const skuReducer = skuReducerFactory.createReducer();

const purchaseRequisitionReducerFactory = new ReducerCreator("PURCHASE_REQUISITION", "purchaseRequisition");
const purchaseRequisitionReducer = purchaseRequisitionReducerFactory.createReducer();

const purchaseOrderReducerFactory = new ReducerCreator("PURCHASE_ORDER", "purchaseOrder");
const purchaseOrderReducer = purchaseOrderReducerFactory.createReducer();

const poItemReducerFactory = new ReducerCreator("PO_ITEM", "poItem");
const poItemReducer = poItemReducerFactory.createReducer();

// Receiving & Inventory
const grnReducerFactory = new ReducerCreator("GRN", "grn");
const grnReducer = grnReducerFactory.createReducer();

const grnItemReducerFactory = new ReducerCreator("GRN_ITEM", "grnItem");
const grnItemReducer = grnItemReducerFactory.createReducer();

const fixedAssetReducerFactory = new ReducerCreator("FIXED_ASSET", "fixedAsset");
const fixedAssetReducer = fixedAssetReducerFactory.createReducer();

// Finance
const chartOfAccountReducerFactory = new ReducerCreator("CHART_OF_ACCOUNT", "chartOfAccount");
const chartOfAccountReducer = chartOfAccountReducerFactory.createReducer();

const invoiceReducerFactory = new ReducerCreator("INVOICE", "invoice");
const invoiceReducer = invoiceReducerFactory.createReducer();

const paymentReducerFactory = new ReducerCreator("PAYMENT", "payment");
const paymentReducer = paymentReducerFactory.createReducer();

const cashAdvanceReducerFactory = new ReducerCreator("CASH_ADVANCE", "cashAdvance");
const cashAdvanceReducer = cashAdvanceReducerFactory.createReducer();

const cashAdvanceRetirementReducerFactory = new ReducerCreator("CASH_ADVANCE_RETIREMENT", "cashAdvanceRetirement");
const cashAdvanceRetirementReducer = cashAdvanceRetirementReducerFactory.createReducer();

// Workflow & Approval
const approvalWorkflowReducerFactory = new ReducerCreator("APPROVAL_WORKFLOW", "approvalWorkflow");
const approvalWorkflowReducer = approvalWorkflowReducerFactory.createReducer();

const workflowStepReducerFactory = new ReducerCreator("WORKFLOW_STEP", "workflowStep");
const workflowStepReducer = workflowStepReducerFactory.createReducer();

const approvalRecordReducerFactory = new ReducerCreator("APPROVAL_RECORD", "approvalRecord");
const approvalRecordReducer = approvalRecordReducerFactory.createReducer();

// Audit & Logging
const auditTrailReducerFactory = new ReducerCreator("AUDIT_TRAIL", "auditTrail");
const auditTrailReducer = auditTrailReducerFactory.createReducer();

const systemLogReducerFactory = new ReducerCreator("SYSTEM_LOG", "systemLog");
const systemLogReducer = systemLogReducerFactory.createReducer();

const sessionLogReducerFactory = new ReducerCreator("SESSION_LOG", "sessionLog");
const sessionLogReducer = sessionLogReducerFactory.createReducer();


// --- Combine all Reducers ---
export default combineReducers({

    // Custom Reducers
    auth,
    authReducer:auth,
    tenant,
    ui,

    // Identity & Access
    userReducer: userReducer,
    userdepartmentReducer: userdepartmentReducer,
    useremploymenttypeReducer: useremploymenttypeReducer,
    userstatusReducer: userstatusReducer,
    userroleReducer: userroleReducer,
    userpermissionReducer: userpermissionReducer,
    useraccessReducer: useraccessReducer,
    usermanagerReducer: usermanagerReducer,
    roleReducer: roleReducer,
    departmentReducer: departmentReducer,
    locationReducer: locationReducer,
    expencesReducer: expencesReducer,
    expenceitemsReducer: expenceitemsReducer,
    accountReducer: accountReducer,
    userlocationReducer: userlocationReducer,

    // Procurement
    vendorReducer: vendorReducer,
    itemCategoryReducer: itemCategoryReducer,
    skuReducer: skuReducer,
    purchaseRequisitionReducer: purchaseRequisitionReducer,
    purchaseOrderReducer: purchaseOrderReducer,
    poItemReducer: poItemReducer,

    // Receiving & Inventory
    grnReducer: grnReducer,
    grnItemReducer: grnItemReducer,
    fixedAssetReducer: fixedAssetReducer,

    // Finance
    chartOfAccountReducer: chartOfAccountReducer,
    invoiceReducer: invoiceReducer,
    paymentReducer: paymentReducer,
    cashAdvanceReducer: cashAdvanceReducer,
    cashAdvanceRetirementReducer: cashAdvanceRetirementReducer,

    // Workflow & Approval
    approvalWorkflowReducer: approvalWorkflowReducer,
    workflowStepReducer: workflowStepReducer,
    approvalRecordReducer: approvalRecordReducer,

    // Audit & Logging
    auditTrailReducer: auditTrailReducer,
    systemLogReducer: systemLogReducer,
    sessionLogReducer: sessionLogReducer,
    
});