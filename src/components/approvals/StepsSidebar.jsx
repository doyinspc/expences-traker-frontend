// src/components/Approval/StepsSidebar.jsx

import React, { useState } from 'react';
import { 
    CheckCircle, XCircle, Clock, Loader2, 
    Calendar, User, MessageSquare, ChevronDown,
    AlertCircle, Shield, UserCheck, Info,
    Ban, ArrowUpCircle
} from 'lucide-react';
import { isJsonParsable } from '../../utils/functions';

// ==================== HELPERS ====================
const getStatusName = (statusesData, id) => {
    if (!statusesData || !Array.isArray(statusesData)) return 'Unknown';
    const status = statusesData.find((s) => parseInt(s.id) === parseInt(id));
    return status?.name || 'Unknown';
};

const getStatusColor = (statusesData, id) => {
    if (!statusesData || !Array.isArray(statusesData)) return '#6B7280';
    const status = statusesData.find((s) => parseInt(s.id) === parseInt(id));
    return status?.text_1 || '#6B7280';
};

const getReasonName = (reasonsData, id) => {
    if (!reasonsData || !Array.isArray(reasonsData)) return 'Unknown';
    const reason = reasonsData.find((r) => parseInt(r.id) === parseInt(id));
    return reason?.name || 'Unknown';
};

// Safely parse to integer
const safeParseInt = (value) => {
    if (value === null || value === undefined) return 0;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
};

// Safely check if is_active is 1 (completed)
const isStepCompleted = (value) => {
    return safeParseInt(value) === 1;
};

// Safely check if value is null or empty
const isEmpty = (value) => {
    return value === null || value === undefined || value === '' || value === '0000-00-00 00:00:00';
};

// ============================================
// FIXED: Parse rejection comments safely
// ============================================
const parseRejectionComments = (rejectionComments) => {
    // If null, undefined, or empty string, return empty array
    if (!rejectionComments) return [];
    
    // If it's already an array, return it
    if (Array.isArray(rejectionComments)) return rejectionComments;
    
    // If it's a string, try to parse it
    if (typeof rejectionComments === 'string') {
        // Check if it's a valid JSON string
        if (isJsonParsable(rejectionComments)) {
            try {
                const parsed = JSON.parse(rejectionComments);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                // If parsing fails, return empty array
                return [];
            }
        }
        // If it's not JSON but has content, return as a single comment
        if (rejectionComments.trim()) {
            return [{
                reason_name: 'Unknown',
                comments: rejectionComments,
                created_at: null,
                created_by_name: null
            }];
        }
        return [];
    }
    
    // If it's an object, return as array
    if (typeof rejectionComments === 'object') {
        return [rejectionComments];
    }
    
    return [];
};

// ==================== COMPONENT ====================
const StepsSidebar = ({ 
    steps = [], 
    role_id = null, 
    statusData = [],
    rejectionReasonsData = [],
    escalationReasonsData = [],
    activeStep = null,
    isWorkflowCompleted = false
}) => {
    const [expandedSteps, setExpandedSteps] = useState({});

    const toggleStepExpand = (stepId) => {
        setExpandedSteps(prev => ({
            ...prev,
            [stepId]: !prev[stepId]
        }));
    };

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">No workflow steps available</p>
            </div>
        );
    }

    // Count completed steps (is_active = 1 means completed/approved)
    const completedCount = steps.filter(s => isStepCompleted(s.is_active)).length;
    const totalCount = steps.length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Workflow Progress
                <span className="ml-auto text-xs text-gray-400">
                    {completedCount} / {totalCount} complete
                </span>
            </h4>
            
            <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute left-1.5 top-2 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                <div className="space-y-3">
                    {steps.map((step, index) => {
                        // Safely parse all values
                        const isActiveValue = safeParseInt(step.is_active);
                        const assignedToUserId = safeParseInt(step.assigned_to_user_id);
                        const stepRoleId = safeParseInt(step.role_id);
                        const userRoleId = safeParseInt(role_id);
                        const statusId = safeParseInt(step.status_id);
                        const rejectionReasonId = safeParseInt(step.rejection_reason_id);
                        const actionId = safeParseInt(step.action_id);
                        
                        // Step status based on backend logic:
                        // is_active = 1 → Completed/Approved
                        // is_active = 0 AND assigned_to_user_id > 0 → Assigned/Active
                        // is_active = 0 AND assigned_to_user_id = 0 → Waiting
                        const isStepCompletedStatus = isActiveValue === 1;
                        const isStepAssigned = assignedToUserId > 0;
                        const isStepWaiting = isActiveValue === 0 && assignedToUserId === 0;
                        
                        // Check if this is the active step (assigned and not completed)
                        const isStepActive = isStepAssigned && !isStepCompletedStatus;
                        
                        // Check if rejected (status_id = 226)
                        const isStepRejected = rejectionReasonId > 0 || step.rejection_comments;
                        
                        // Check if escalated
                        const isStepEscalated = !isEmpty(step.escalated_at);
                        
                        // Check if user's role matches
                        const isUserStep = stepRoleId === userRoleId;
                        
                        const isExpanded = expandedSteps[step.id] || false;
                        
                        // Get names from IDs
                        const statusName = getStatusName(statusData, step.status_id);
                        const statusColor = getStatusColor(statusData, step.status_id);
                        const rejectionReasonName = getReasonName(rejectionReasonsData, step.rejection_reason_id);
                        const escalationReasonName = getReasonName(escalationReasonsData, step.escalation_reason_id);
                        
                        // ============================================
                        // FIXED: Parse rejection comments
                        // ============================================
                        const rejectionsComments = parseRejectionComments(step.rejection_comments);
                        
                        // Check if this step has comments/actions
                        const hasComments = step.comments || step.action_id || step.rejection_comments || step.escalation_comments;
                        
                        // Determine the step status for display
                        let statusColorClass = '';
                        let bgColorClass = '';
                        let statusLabel = '';
                        
                        if (isStepCompletedStatus) {
                            statusColorClass = 'bg-green-500';
                            bgColorClass = 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
                            statusLabel = 'Completed';
                        } else if (isStepRejected) {
                            statusColorClass = 'bg-red-500';
                            bgColorClass = 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
                            statusLabel = 'Rejected';
                        } else if (isStepEscalated) {
                            statusColorClass = 'bg-orange-500';
                            bgColorClass = 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800';
                            statusLabel = 'Escalated';
                        } else if (isStepAssigned) {
                            statusColorClass = 'bg-blue-500 animate-pulse';
                            bgColorClass = 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
                            statusLabel = 'Active';
                        } else {
                            statusColorClass = 'bg-gray-300 dark:bg-gray-600';
                            bgColorClass = 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600';
                            statusLabel = 'Waiting';
                        }
                        
                        // Check if overdue
                        const isOverdue = step.due_date && new Date(step.due_date) < new Date() && !isStepCompletedStatus;
                        
                        return (
                            <div key={step.id || index} className="relative">
                                {/* Step indicator */}
                                <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full flex items-center justify-center z-10 ${statusColorClass}`}>
                                    {isStepCompletedStatus && <CheckCircle className="w-3 h-3 text-white" />}
                                    {isStepAssigned && !isStepCompletedStatus && <Loader2 className="w-3 h-3 text-white animate-spin" />}
                                    {isStepRejected && <XCircle className="w-3 h-3 text-white" />}
                                    {isStepEscalated && <ArrowUpCircle className="w-3 h-3 text-white" />}
                                    {isStepWaiting && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                
                                {/* Step content */}
                                <div 
                                    className={`ml-4 p-3 rounded-lg cursor-pointer transition-all ${bgColorClass}`}
                                    onClick={() => toggleStepExpand(step.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Step {safeParseInt(step.step_serial_number) || index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {step.step_name || `Step ${index + 1}`}
                                                </span>
                                                {isUserStep && isStepAssigned && !isStepCompletedStatus && (
                                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-1.5 py-0.5 rounded-full animate-pulse">
                                                        Your Turn
                                                    </span>
                                                )}
                                                {isUserStep && isStepCompletedStatus && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                                                        You Completed
                                                    </span>
                                                )}
                                                {isStepCompletedStatus && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                                                        ✓ Done
                                                    </span>
                                                )}
                                                {isStepAssigned && !isStepCompletedStatus && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded-full animate-pulse">
                                                        Active
                                                    </span>
                                                )}
                                                {isStepRejected && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded-full">
                                                        ✗ Rejected
                                                    </span>
                                                )}
                                                {isStepEscalated && (
                                                    <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-1.5 py-0.5 rounded-full">
                                                        ⬆ Escalated
                                                    </span>
                                                )}
                                                {isStepWaiting && (
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                                                        Waiting
                                                    </span>
                                                )}
                                                {isOverdue && !isStepCompletedStatus && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded-full animate-pulse">
                                                        ⚠️ Overdue
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                {statusName && statusName !== 'Unknown' && (
                                                    <span 
                                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-white text-[10px]"
                                                        style={{ backgroundColor: statusColor }}
                                                    >
                                                        {statusName}
                                                    </span>
                                                )}
                                                {step.due_date && (
                                                    <span className={`flex items-center gap-0.5 ${isOverdue ? 'text-red-500' : ''}`}>
                                                        <Calendar className="w-3 h-3" />
                                                        Due: {new Date(step.due_date).toLocaleDateString()}
                                                        {isOverdue && (
                                                            <AlertCircle className="w-3 h-3 text-red-500" />
                                                        )}
                                                    </span>
                                                )}
                                                {assignedToUserId > 0 && (
                                                    <span className="flex items-center gap-0.5">
                                                        <UserCheck className="w-3 h-3" />
                                                        Assigned: User #{assignedToUserId}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Comments/actions summary */}
                                            {hasComments && (
                                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    <span>Has {step.rejection_comments ? 'rejection' : step.escalation_comments ? 'escalation' : 'comments'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
                                            {/* Step Description */}
                                            {step.step_description && (
                                                <div className="bg-white dark:bg-gray-800/50 p-2 rounded text-xs">
                                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Description:</p>
                                                    <p className="text-gray-700 dark:text-gray-300 mt-0.5">{step.step_description}</p>
                                                </div>
                                            )}
                                            
                                            {/* Status Name */}
                                            {statusName && statusName !== 'Unknown' && (
                                                <div className="bg-white dark:bg-gray-800/50 p-2 rounded text-xs flex items-center gap-2">
                                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Status:</span>
                                                    <span 
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-white text-[10px]"
                                                        style={{ backgroundColor: statusColor }}
                                                    >
                                                        {statusName}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Comments */}
                                            {step.comments && (
                                                <div className="bg-white dark:bg-gray-800/50 p-2 rounded text-xs">
                                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Comments:</p>
                                                    <p className="text-gray-700 dark:text-gray-300 mt-0.5">{step.comments}</p>
                                                </div>
                                            )}
                                            
                                            {/* ============================================
                                                FIXED: Rejection Details
                                                ============================================ */}
                                            {rejectionsComments.length > 0 && (
                                                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs border border-red-200 dark:border-red-800">
                                                    <p className="text-red-600 dark:text-red-400 font-medium">Rejection Details:</p>
                                                    {rejectionsComments.map((comment, idx) => {
                                                        const reasonName = comment.reason_name || getReasonName(rejectionReasonsData, comment.reason_id) || 'Unknown';
                                                        return (
                                                            <div key={idx} className="mt-1">
                                                                {reasonName && reasonName !== 'Unknown' && (
                                                                    <p className="text-red-700 dark:text-red-300">
                                                                        <span className="font-medium">Reason:</span> {reasonName}
                                                                    </p>
                                                                )}
                                                                {comment.comments && (
                                                                    <p className="text-red-700 dark:text-red-300 mt-0.5">
                                                                        <span className="font-medium">Comments:</span> {comment.comments}
                                                                    </p>
                                                                )}
                                                                {comment.created_by_name && (
                                                                    <p className="text-red-500 dark:text-red-400 text-[10px] mt-0.5">
                                                                        By: {comment.created_by_name}
                                                                        {comment.created_at && ` • ${new Date(comment.created_at).toLocaleString()}`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {/* Also show the reason name from ID if available */}
                                                    {rejectionReasonName && rejectionReasonName !== 'Unknown' && rejectionsComments.length === 0 && (
                                                        <p className="text-red-700 dark:text-red-300 mt-0.5">
                                                            <span className="font-medium">Reason:</span> {rejectionReasonName}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* ============================================
                                                Escalation Details
                                                ============================================ */}
                                            {(step.escalation_comments || step.escalation_reason_id) && (
                                                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-xs border border-orange-200 dark:border-orange-800">
                                                    <p className="text-orange-600 dark:text-orange-400 font-medium">Escalation Details:</p>
                                                    {escalationReasonName && escalationReasonName !== 'Unknown' && (
                                                        <p className="text-orange-700 dark:text-orange-300 mt-0.5">
                                                            <span className="font-medium">Reason:</span> {escalationReasonName}
                                                        </p>
                                                    )}
                                                    {step.escalation_comments && (
                                                        <p className="text-orange-700 dark:text-orange-300 mt-0.5">
                                                            <span className="font-medium">Comments:</span> {step.escalation_comments}
                                                        </p>
                                                    )}
                                                    {step.escalated_by_name && (
                                                        <p className="text-orange-500 dark:text-orange-400 text-[10px] mt-0.5">
                                                            By: {step.escalated_by_name}
                                                            {step.escalated_at && ` • ${new Date(step.escalated_at).toLocaleString()}`}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Performed By */}
                                            {step.performed_by && safeParseInt(step.performed_by) > 0 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Performed by: User #{safeParseInt(step.performed_by_name)}
                                                </div>
                                            )}
                                            
                                            {/* Assigned To */}
                                            {assignedToUserId > 0 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <UserCheck className="w-3 h-3" />
                                                    Assigned to: User #{assignedToUserId}
                                                </div>
                                            )}
                                            
                                            {/* Timestamps */}
                                            {step.assigned_at && !isEmpty(step.assigned_at) && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Assigned: {new Date(step.assigned_at).toLocaleString()}
                                                </div>
                                            )}
                                            
                                            {step.started_at && !isEmpty(step.started_at) && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Started: {new Date(step.started_at).toLocaleString()}
                                                </div>
                                            )}
                                            
                                            {step.completed_at && !isEmpty(step.completed_at) && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Completed: {new Date(step.completed_at).toLocaleString()}
                                                </div>
                                            )}
                                            
                                            {step.escalated_at && !isEmpty(step.escalated_at) && (
                                                <div className="text-xs text-orange-500 dark:text-orange-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Escalated: {new Date(step.escalated_at).toLocaleString()}
                                                </div>
                                            )}
                                            
                                            {step.expected_days && safeParseInt(step.expected_days) > 0 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Expected days: {safeParseInt(step.expected_days)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StepsSidebar;