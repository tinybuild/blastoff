const tabs = document.querySelectorAll('.agent-tab');
const panels = document.querySelectorAll('.agent-steps');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.agent;
    tabs.forEach(t => {
      const active = t.dataset.agent === target;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.agent === target));
  });
});
