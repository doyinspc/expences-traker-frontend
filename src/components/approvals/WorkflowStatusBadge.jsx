import { CheckCircle2, Clock3, AlertTriangle, ArrowUpRight, XCircle, RotateCcw, CircleHelp } from 'lucide-react';
import { workflowState } from '../../utils/functions/workflowPresentation';

const styles = {
  'Awaiting approval': [Clock3, 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200'],
  Overdue: [AlertTriangle, 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'],
  Escalated: [ArrowUpRight, 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200'],
  Completed: [CheckCircle2, 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'],
  Cancelled: [XCircle, 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'],
  Rejected: [RotateCcw, 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'],
  'Needs review': [CircleHelp, 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'],
};
export default function WorkflowStatusBadge({ workflow }) {
  const status = workflowState(workflow);
  const [Icon, colour] = styles[status] || styles['Needs review'];
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${colour}`}><Icon size={13} aria-hidden="true" />{status}</span>;
}
