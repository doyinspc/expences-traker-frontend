/** Allow ordinary HTTP(S) attachment links; reject executable schemes and credentials. */
export function safeHttpUrl(value, base) {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u007f\\]/.test(value)) return '';
  const input = value.trim();
  // Protocol-relative addresses can silently leave the expected attachment host.
  if (input.startsWith('//')) return '';
  try {
    const url = base ? new URL(input, base) : new URL(input);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    return url.href;
  } catch { return ''; }
}

export function openAttachment(value, base) {
  const url = safeHttpUrl(value, base);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
