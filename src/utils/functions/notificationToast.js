// Notification messages can come from API responses. Render them as text, never HTML.
export function showToast(message, type = 'success') {
  document.querySelector('.custom-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `custom-toast fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`;
  toast.setAttribute('role', type === 'success' ? 'status' : 'alert');
  const content = document.createElement('div');
  content.className = 'flex items-center space-x-3';
  const icon = document.createElement('span');
  icon.className = 'text-xl'; icon.textContent = type === 'success' ? '✓' : '✕';
  icon.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.className = 'font-medium'; text.textContent = String(message ?? '');
  content.append(icon, text); toast.appendChild(content); document.body.appendChild(toast);
  setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 10);
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => { toast.remove(); }, 500);
  }, 3000);
}
