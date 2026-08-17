// src/pages/Approval/ApprovalCenterDetails.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, Loader2, AlertTriangle, 
    FileText, CheckCircle, XCircle, Clock,
    Menu, X, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import useTanstackQuery from '../../hooks/useTanstackQuery';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import RequisitionViewWithDetails from './RequisitionComponents/RequistionViewWithDetails';
import PurchaseOrderViewWithDetails from './PurchaseOrder/PurchaseOrderWithDetails';
import StepsSidebar from '../../components/approvals/StepsSidebar';
import ApprovalActions from '../../components/approvals/ApprovalActions';

function getStepContext(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return { current: null, previous: null, next: null };
  }

  const sortedSteps = [...steps].sort((a, b) => parseInt(a.id) - parseInt(b.id));
  const currentIndex = sortedSteps.findIndex(step => parseInt(step.is_active) === 0);

  if (currentIndex === -1) {
    return { current: null, previous: null, next: null };
  }

  const current = sortedSteps[currentIndex];
  let previous = null;
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (parseInt(sortedSteps[i].is_active) === 1) {
      previous = sortedSteps[i];
      break;
    }
  }

  const next = currentIndex < sortedSteps.length - 1 ? sortedSteps[currentIndex + 1] : null;

  return {
    current,
    previous,
    next
  };
}

export default function ApprovalCenterDetails() {
    const { workflow_id } = useParams();
    const navigate = useNavigate();
    const { user, role_id } = useSelector((state) => state.authReducer || {});
    const userId = user?.id;
   
    
    // State for mobile sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isSidebarOpen]);

    // ==================== FETCH DATA ====================
    const { data: workflow, loadQuery: loadApprovalItems, loadUpdate, isLoading } = useTanstackQuery({
        table: 'approvalcenter',
        pth: 'approvalItem' + workflow_id,
        queryType: 'getSingleApprovalItem',
        mainParam: { id: workflow_id },
        autoLoad: false,
    });

    const { data: statusData, loadQuery: loadstatusData } = useTanstackQuery({
        table: "commons",
        uniqueKey: 'status',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 13 },
        narration: 'get all status data'
    });

    const { data: priorityData, loadQuery: loadpriorityData } = useTanstackQuery({
        table: "commons",
        uniqueKey: 'priority',
        queryType: 'gets',
        mainParam: { is_active: 1, grp: 14 },
        narration: 'get all priority data'
    });

    useEffect(() => {
        loadApprovalItems();
        loadstatusData();
        loadpriorityData();
    }, [workflow_id]);

    // ==================== PROCESS DATA ====================
    const workflowInstance = workflow || {};
    const requisition_type = workflowInstance.document_type_id;
    const document = workflowInstance?.document_data || {};
    const document_name = workflowInstance?.document_name || 'Document';
    const steps = workflowInstance?.steps || [];
    
    const { previous: previousStep, current: activeStep, next: nextStep } = getStepContext(steps);
    
    const canApprove = activeStep && 
                       activeStep.role_id === role_id &&
                       workflowInstance.is_active === 1 &&
                       workflowInstance.is_completed === 0;
    
    const isCompleted = workflowInstance.is_completed === 1;
    const isRejected = false;
    const canEscalate = true;
    const canReassign = true;

    // ==================== HANDLERS ====================
    const handleBack = () => {
        navigate('/procurement/approvals');
    };

    const handleSubmit = async (formData) => {
        formData.workflow_id = workflow_id;
        await loadUpdate(formData);
        loadApprovalItems();
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // ==================== RENDER ====================
    if (isLoading) {
        return (
            <>
                <PageBreadcrumb pageTitle="Loading..." />
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-500">Loading approval details...</span>
                </div>
            </>
        );
    }

    if (!workflowInstance.id) {
        return (
            <>
                <PageBreadcrumb pageTitle="Not Found" />
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Approval item not found</h3>
                    <p className="text-gray-500 dark:text-gray-400">The workflow instance you're looking for doesn't exist.</p>
                    <button 
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Approval Center
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <PageBreadcrumb pageTitle={document_name} />
            
            <div className="space-y-6">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Approval Center
                    </button>
                    
                    {/* Mobile Sidebar Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Menu className="w-4 h-4" />
                        <span className="text-sm font-medium">Workflow Steps</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Main layout: Document + Steps Sidebar */}
                <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Document Details - 3 columns */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Document header with status */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {document_name}
                                        </h2>
                                        <span className="text-xs text-gray-400">#{workflowInstance.document_number || workflow_id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {workflowInstance.is_active === 1 && workflowInstance.is_completed === 0 && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Active
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Completed
                                            </span>
                                        )}
                                        {isRejected && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Rejected
                                            </span>
                                        )}
                                        {canApprove && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse">
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                Awaiting Your Approval
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Document content */}
                            <div className="p-4">
                                {requisition_type == 1 || requisition_type == 3 || requisition_type == 6 ? (
                                    <RequisitionViewWithDetails 
                                        requisition={document}
                                        onClose={() => navigate('/approval')}
                                        title={document_name}
                                        showDeactivate={true}
                                        statusData={statusData || []}
                                        priorityData={priorityData || []}
                                    />
                                ) : requisition_type == 2 ? (
                                    <PurchaseOrderViewWithDetails
                                        purchaseOrder={document}
                                        onClose={() => navigate('/approval')}
                                        title={document_name}
                                        showDeactivate={true}
                                        statusData={statusData || []}
                                        priorityData={priorityData || []}
                                    />
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Document type {requisition_type} not supported for preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Steps Sidebar - Desktop */}
                    <div className="hidden lg:block lg:col-span-1">
                        <StepsSidebar 
                            steps={steps}
                            role_id={role_id}
                            statusData={statusData || []}
                            activeStep={activeStep}
                            isCompleted={isCompleted}
                        />
                    </div>
                </div>

                {/* Mobile Sidebar - Fly-in Overlay */}
                {/* Backdrop */}
                <div 
                    className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
                        isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                    onClick={toggleSidebar}
                />
                
                {/* Sidebar Panel */}
                <div 
                    className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
                        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Workflow Progress
                        </h3>
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                    
                    {/* Sidebar Content */}
                    <div className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
                        <StepsSidebar 
                            steps={steps}
                            role_id={role_id}
                            statusData={statusData || []
}
                            activeStep={activeStep}
                            isCompleted={isCompleted}
                        />
                    </div>
                </div>

                {/* Approval Actions - Bottom */}
                <ApprovalActions
                    instanceId={workflow_id}
                    activeStep={activeStep}
                    previousStep={previousStep}
                    nextStep={nextStep}
                    steps={steps}
                    userId={userId}
                    role_id={role_id}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    isCompleted={isCompleted}
                    isRejected={isRejected}
                    canApprove={canApprove}
                    canEscalate={canEscalate}
                    canReassign={canReassign}
                    statusesData={statusData}
                />
            </div>
        </>
    );
}