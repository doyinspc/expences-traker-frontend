// The instance's current_step_id is authoritative. assigned_to_user_id is a
// routing flag in this system, so it must never be displayed as a staff ID.
export function workflowGuide(workflow = {}) {
  const steps = [...(workflow.steps || [])].sort((a, b) =>
    (Number(a.step_serial_number) - Number(b.step_serial_number)) || Number(a.id) - Number(b.id));
  const closed = Number(workflow.is_completed) === 1 || Number(workflow.is_active) === 0;
  const index = steps.findIndex(step => Number(step.id) === Number(workflow.current_step_id));
  const current = !closed && index >= 0 ? steps[index] : null;
  const previous = current ? steps.slice(0, index).reverse().find(step => Number(step.is_active) === 1) || null : null;
  const next = current ? steps[index + 1] || null : null;
  const state = Number(workflow.is_completed) === 1 ? 'Completed' : workflow.cancelled_at && !String(workflow.cancelled_at).startsWith('0000') ? 'Cancelled' : closed ? 'Rejected' : 'In progress';
  return { steps, closed, current, previous, next, closedStep: closed && index >= 0 ? steps[index] : null, state,
    escalated: Boolean(current && workflow.escalation?.state === 'pending') };
}

export function workflowStage(guide, step) {
  if (Number(step.is_active) === 1) return 'completed';
  if (guide.closed && guide.state === 'Rejected' && Number(guide.closedStep?.id) === Number(step.id)) return 'rejected';
  if (Number(guide.current?.id) === Number(step.id)) return guide.escalated ? 'escalated' : 'current';
  if (Number(guide.next?.id) === Number(step.id)) return 'next';
  return 'waiting';
}
