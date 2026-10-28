import { currentStep, workflowState } from './workflowPresentation';

export function matchesWorkflowFilter(row, filter) {
  if (!filter) return true;
  if (filter === 'Overdue') return Number(row.is_overdue) === 1 && Number(row.is_active) === 1 && Number(row.is_completed) === 0;
  return workflowState(row) === filter;
}
export function hasNavigationAccess(access, locationId, parent, child = 0) {
  return (access || []).some(row => Number(row.location_id) === Number(locationId) && Number(row.parent_path_number) === parent && Number(row.child_path_number) === child && Number(row.is_active ?? 1) === 1 && Number(row.access_level) >= 1);
}
export function formatWorkflowDate(value, time = false) {
  if (!value || String(value).startsWith('0000')) return 'Not set';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Not set';
  return time ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
export function workflowProgress(row) {
  const steps = row.steps || [];
  const completed = steps.filter(step => Number(step.is_active) === 1).length;
  return { completed, total: steps.length, percent: steps.length ? Math.round(completed / steps.length * 100) : 0, current: currentStep(row) };
}
