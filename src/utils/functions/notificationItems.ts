type Identifier = string | number;
interface ApprovalStep {
  id: Identifier;
  role_id?: Identifier;
  assigned_to_user_id?: Identifier | null;
  is_active?: Identifier;
}
interface ApprovalRecord {
  id: Identifier;
  is_active?: Identifier;
  is_completed?: Identifier;
  current_step_id?: Identifier;
  cancelled_at?: string | null;
  rejected_at?: string | null;
  document_name?: string;
  document_data?: { title?: string };
  steps?: ApprovalStep[];
}
export function getPendingApprovalNotifications(items: unknown, roleId: Identifier | undefined) {
  const payload = items && typeof items === 'object' && 'data' in items ? items.data : items;
  const rows: ApprovalRecord[] = Array.isArray(payload) ? payload : [];
  return rows.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const hasDate = (value: unknown) => Boolean(value && !String(value).startsWith('0000-00-00'));
    if (Number(item.is_active) !== 1 || Number(item.is_completed || 0) > 0 || hasDate(item.cancelled_at)) return false;
    const current = item.steps?.find((step) => String(step.id) === String(item.current_step_id));
    return current && Number(current.assigned_to_user_id) === 1 && Number(current.is_active) === 0 && String(current.role_id) === String(roleId);
  }).map((item) => ({
    id: String(item.id),
    title: item.document_data?.title || item.document_name || 'Approval request',
    description: 'A document is waiting for your review.',
    path: `/procurement/approvals/${encodeURIComponent(item.id)}`,
  }));
}
