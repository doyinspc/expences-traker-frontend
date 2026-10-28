export function currentStep(workflow) {
  return workflow?.steps?.find(step => Number(step.id) === Number(workflow.current_step_id)) || null;
}
export function workflowState(workflow) {
  if (Number(workflow.is_completed) === 1) return 'Completed';
  if (workflow.cancelled_at && !String(workflow.cancelled_at).startsWith('0000')) return 'Cancelled';
  if (Number(workflow.is_active) !== 1) return 'Rejected';
  if (workflow.escalation?.state === 'pending') return 'Escalated';
  const step = currentStep(workflow);
  if (step && Number(step.assigned_to_user_id) === 1 && Number(step.is_active) === 0) return Number(workflow.is_overdue) === 1 ? 'Overdue' : 'Awaiting approval';
  return 'Needs review';
}
export function authSelection(user, locationId, roleId) {
  const locations = Array.isArray(user?.locations) ? user.locations : [];
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const location = locations.find(row => Number(row.id) === Number(locationId)) || locations.find(row => Number(row.id) === Number(user?.location_id)) || locations[0] || {};
  const localRoles = roles.filter(row => Number(row.location_id) === Number(location.id));
  const role = localRoles.find(row => Number(row.id) === Number(roleId)) || localRoles.find(row => Number(row.id) === Number(user?.role_id)) || localRoles[0] || {};
  return { locations, roles, access: user?.access || [], location, location_id: location.id || 0, role, role_id: role.id || 0, isAdmin: Number(location.is_admin ?? location.is_active ?? 0) === 1 };
}
