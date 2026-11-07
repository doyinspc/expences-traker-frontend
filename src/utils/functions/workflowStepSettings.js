export const allowsCashDisbursement = documentType => [3, 9].includes(Number(documentType));

export function workflowStepPayload(values, documentType) {
  return allowsCashDisbursement(documentType) ? values : {...values, text_4: 'approval'};
}

export const WORKFLOW_STEP_GROUP = 21;

/** Keep only real steps and older unclassified step rows under this workflow. */
export function workflowStepRows(value, workflowId) {
  const rows = Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
  if (!Number.isSafeInteger(Number(workflowId)) || Number(workflowId) < 1) return [];
  return rows
    .filter(row => Number(row.parent_id) === Number(workflowId) &&
      [0, WORKFLOW_STEP_GROUP].includes(Number(row.grp ?? 0)))
    .sort((a, b) => Number(a.item_id2) - Number(b.item_id2) || Number(a.id) - Number(b.id));
}

export function isActiveWorkflowStep(row) {
  return Number(row.grp) === WORKFLOW_STEP_GROUP && Number(row.is_active) === 1;
}

/**
 * Save a step under the verified workflow opened in Settings. The form can set
 * its role, order and active state, but cannot choose another group or parent.
 * Editing an older unclassified step repairs its group; it stays inactive unless
 * the administrator explicitly turns on Active. New steps default to Active.
 */
export function workflowStepWrite(values, workflow) {
  const workflowId = Number(workflow?.id);
  if (Number(workflow?.grp) !== 20 || !Number.isSafeInteger(workflowId) || workflowId < 1) {
    throw new Error('Open the workflow in Settings before saving a step.');
  }
  const role = Number(values.item_id1);
  const serial = Number(values.item_id2);
  if (!Number.isSafeInteger(role) || role < 1) throw new Error('Choose an approver role.');
  if (!Number.isSafeInteger(serial) || serial < 1) throw new Error('Enter a positive whole number for the approval order.');
  return workflowStepPayload({
    ...values,
    grp: WORKFLOW_STEP_GROUP,
    parent_id: workflowId,
    item_id1: role,
    item_id2: serial,
    is_active: Number(values.is_active ?? (values.id ? 0 : 1)) === 1 ? 1 : 0,
  }, workflow.item_id1);
}
