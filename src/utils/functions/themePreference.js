export function readThemePreference(storage) {
  try { const value = storage?.getItem('theme'); return value === 'light' || value === 'dark' ? value : 'dark'; }
  catch { return 'dark'; }
}
