/**
 * Purpose: distinguish accounts at different branches even when bank names match.
 * Algorithm: combine the bank/account name, saved abbrv alias and location in that order.
 * Accept catalogue rows and enriched transaction rows; omit blank or repeated parts.
 * Never infer a branch from the bank name or substitute the user's working location
 * for a receiving account whose location has not been supplied.
 */
export function transferAccountLabel(account, locationFallback = '') {
  if (!account) return 'Not assigned';
  const name = account.account_name || account.name || (account.account_id ? `Account ${account.account_id}` : 'Account');
  const alias = account.account_alias || account.text_1 || account.abbrv;
  const location = account.account_location_name || account.location_name || account.location?.name || locationFallback ||
    (account.location_id ? `Location ${account.location_id}` : '');
  return [...new Set([name, alias, location].map((value) => String(value || '').trim()).filter(Boolean))].join(' — ');
}
