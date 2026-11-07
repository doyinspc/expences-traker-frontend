export function currentStep(workflow) {
  return workflow?.steps?.find(step => Number(step.id) === Number(workflow.current_step_id)) || null;
}
export function workflowState(workflow) {
  if (Number(workflow.is_completed) === 1) return A.COMPLETED;
  if (workflow.cancelled_at && !String(workflow.cancelled_at).startsWith('0000')) return A.CANCELLED;
  if (Number(workflow.is_active) !== 1) return A.REJECTED;
  if (workflow.escalation?.state === 'pending') return A.ESCALATED;
  const step = currentStep(workflow);
  if (step && Number(step.assigned_to_user_id) === 1 && Number(step.is_active) === 0) {
    return Number(workflow.is_overdue) === 1 ? A.OVERDUE : A.AWAITING_APPROVAL;
  }
  return A.NEEDS_REVIEW;
}
export function authSelection(user, locationId, roleId) {
  const locations = Array.isArray(user?.locations) ? user.locations : [];
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const location = locations.find(row => Number(row.id) === Number(locationId)) || locations.find(row => Number(row.id) === Number(user?.location_id)) || locations[0] || {};
  const localRoles = roles.filter(row => Number(row.location_id) === Number(location.id));
  const role = localRoles.find(row => Number(row.id) === Number(roleId)) || localRoles.find(row => Number(row.id) === Number(user?.role_id)) || localRoles[0] || {};
  return { locations, roles, access: user?.access || [], location, location_id: location.id || 0, role, role_id: role.id || 0, isAdmin: Number(location.is_admin ?? location.is_active ?? 0) === 1 };
}

export const DOCUMENT_APPROVAL_STATE = Object.freeze({
  DRAFT: 10,
  AWAITING_APPROVAL: 20,
  RETURNED_FOR_REVIEW: 30,
  ESCALATED: 40,
  COMPLETED: 50,
  REJECTED: 60,
  CANCELLED: 70,
  HISTORY_UNAVAILABLE: 80,
  OVERDUE: 90,
  NEEDS_REVIEW: 100,
});

const A = DOCUMENT_APPROVAL_STATE;
export const documentApprovalStates = Object.freeze({
  [A.DRAFT]: 'Draft',
  [A.AWAITING_APPROVAL]: 'Awaiting approval',
  [A.RETURNED_FOR_REVIEW]: 'Returned for review',
  [A.ESCALATED]: 'Escalated',
  [A.COMPLETED]: 'Completed',
  [A.REJECTED]: 'Rejected',
  [A.CANCELLED]: 'Cancelled',
  [A.HISTORY_UNAVAILABLE]: 'Approval history unavailable',
});

export const workflowStateLabels = Object.freeze({
  ...documentApprovalStates,
  [A.OVERDUE]: 'Overdue',
  [A.NEEDS_REVIEW]: 'Needs review',
});

export const purchasingStageLabels = Object.freeze({
  10: 'Awaiting Stock review',
  20: 'Resolved from stock',
  30: 'Partially fulfilled',
  40: 'Forwarded to Purchase Order',
  50: 'Resolved after Procurement',
  60: 'Ready for Procurement',
  70: 'Allocated to Procurement',
  80: 'Sent to Stock',
  90: 'Received into Stock',
  100: 'Service Procurement completed',
});

export function documentApprovalState(document) {
  const id = Number(document?.approval_state_id);
  return documentApprovalStates[id] ? id : (Number(document?.is_active) === 1 ? A.HISTORY_UNAVAILABLE : A.DRAFT);
}

/** Present the server-owned state and current step, or the date of final approval. */
export function documentApprovalLabel(document) {
  const state = documentApprovalState(document);
  const label = documentApprovalStates[state];
  if (state === A.COMPLETED) {
    const date = String(document.approval_completed_at || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !date.startsWith('0000')) {
      const completed = new Date(`${date}T00:00:00Z`);
      if (!Number.isNaN(completed.getTime())) {
        return `${label} · ${new Intl.DateTimeFormat('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
        }).format(completed)}`;
      }
    }
    return label;
  }
  if ([A.AWAITING_APPROVAL, A.RETURNED_FOR_REVIEW, A.ESCALATED].includes(state)) {
    const name = document.approval_step_name?.trim();
    if (!name) return label;
    const number = Number(document.approval_step_number);
    const step = number > 0 ? `Step ${number} · ${name}` : name;
    return state === A.AWAITING_APPROVAL ? step : `${label} · ${step}`;
  }
  return label;
}
