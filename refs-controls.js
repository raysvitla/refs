(() => {
  const root = document.documentElement;
  const controls = document.querySelector('.controls');
  const filters = document.querySelector('.filters');
  const gridSize = document.querySelector('.grid-size');
  if (!controls || !filters || !gridSize) return;

  // Collection selector retains the original buttons as the actual filtering engine.
  const collection = document.createElement('select');
  collection.className = 'refs-select refs-collection-select';
  collection.setAttribute('aria-label', 'Collection');
  [...filters.querySelectorAll('button[data-filter]')].forEach(button => {
    const option = document.createElement('option');
    option.value = button.dataset.filter;
    option.textContent = button.textContent.replace(/\s+/g, ' ').trim();
    collection.appendChild(option);
  });
  collection.addEventListener('change', () => {
    const button = filters.querySelector(`button[data-filter="${CSS.escape(collection.value)}"]`);
    button?.click();
  });
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (button) collection.value = button.dataset.filter;
  });

  // Auto means local time: light 08:00–18:59, dark after 19:00 / before 08:00.
  const theme = document.createElement('select');
  theme.className = 'refs-select refs-theme-select';
  theme.setAttribute('aria-label', 'Appearance');
  theme.innerHTML = '<option value="auto">auto</option><option value="light">light</option><option value="dark">dark</option>';
  const stored = localStorage.getItem('ray-refs-theme') || 'auto';
  theme.value = stored;
  function effectiveTheme(preference = theme.value) {
    if (preference !== 'auto') return preference;
    const hour = new Date().getHours();
    return hour >= 8 && hour < 19 ? 'light' : 'dark';
  }
  function applyTheme() {
    root.dataset.theme = effectiveTheme();
    root.dataset.themePreference = theme.value;
  }
  function redrawActiveSpatialView() {
    const active = document.querySelector('.view-tabs button.active');
    if (active?.dataset.view === 'graphView' || active?.dataset.view === 'spaceView') active.click();
  }
  theme.addEventListener('change', () => {
    localStorage.setItem('ray-refs-theme', theme.value);
    applyTheme();
    requestAnimationFrame(redrawActiveSpatialView);
  });
  applyTheme();
  window.setInterval(() => { if (theme.value === 'auto') { const before = root.dataset.theme; applyTheme(); if (root.dataset.theme !== before) redrawActiveSpatialView(); } }, 60_000);

  const view = document.createElement('select');
  view.className = 'refs-select refs-view-select';
  view.setAttribute('aria-label', 'View');
  view.innerHTML = [...document.querySelectorAll('button[data-view]')].map(button => `<option value="${button.dataset.view}">${button.textContent.trim()}</option>`).join('');
  view.value = document.querySelector('button[data-view].active')?.dataset.view || 'gridView';
  view.addEventListener('change', () => document.querySelector(`button[data-view="${CSS.escape(view.value)}"]`)?.click());

  controls.append(collection, theme, view);

  function syncArenaOnlyControls() {
    const active = document.querySelector('.view-tabs button.active');
    gridSize.hidden = active?.dataset.view !== 'gridView';
    if (active?.dataset.view) view.value = active.dataset.view;
  }
  document.querySelectorAll('button[data-view]').forEach(button => button.addEventListener('click', syncArenaOnlyControls));
  syncArenaOnlyControls();
})();
