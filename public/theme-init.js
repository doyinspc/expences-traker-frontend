(function () {
  var theme = 'dark';
  try { var saved = localStorage.getItem('theme'); if (saved === 'light' || saved === 'dark') theme = saved; } catch (_) {}
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
})();
