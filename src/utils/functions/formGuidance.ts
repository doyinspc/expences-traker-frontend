import { settingColour } from './settingColours';
export const fieldGuidance: Record<string, string> = {
  title: 'Use a short, specific title so reviewers can identify this record.',
  description: 'Explain what is needed and why. Include enough context for someone reviewing this record.',
  email: 'Use an address this person checks regularly. Prokure uses it for relevant email notifications.',
  location_id: 'Choose the location responsible for this record. Available roles and approvals depend on the location.',
  role_id: 'Choose the role for this location. A role determines approval responsibilities; menu access is assigned separately.',
  department_id: 'Select the department responsible for this request or cost.',
  vendor_id: 'Select the supplier associated with this record.',
  requester_id: 'Select the person responsible for the request.',
  budget_id: 'Select the budget this cost should be tracked against.',
  currency_id: 'Select the currency used for all amounts on this record.',
  total_amount: 'Enter the amount in the selected currency. Check the supporting details before saving.',
  expected_delivery_date: 'Choose the date the goods or service are needed.',
  notes: 'Add supporting context that will help the next person working on this record.',
};

export function validateFieldValue(field: { label: string; type: string; required?: boolean; disabled?: boolean }, value: unknown): string | null {
  if (field.disabled) return null;
  const empty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
  if (field.required && empty) return `${field.label} is required.`;
  if (empty) return null;
  if (field.type === 'color' && !settingColour(value)) return `Choose a colour or enter a valid hex code for ${field.label}.`;
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return `Enter a valid email address for ${field.label}.`;
  if (field.type === 'number' && !Number.isFinite(Number(value))) return `${field.label} must be a valid number.`;
  if (field.type === 'json') { try { JSON.parse(typeof value === 'string' ? value : JSON.stringify(value)); } catch { return `${field.label} must contain valid JSON.`; } }
  return null;
}
