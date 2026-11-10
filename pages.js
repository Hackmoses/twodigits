(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const entries = [...document.querySelectorAll('.portfolio-entry')];
  const gallery = document.querySelector('.portfolio-gallery');
  const empty = document.querySelector('.portfolio-empty');
  const status = document.querySelector('#filter-count');
  filters.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    let visible = 0;
    entries.forEach(entry => {
      const show = selected === 'All' || entry.dataset.categories.split('|').includes(selected);
      entry.hidden = !show;
      if (show) visible += 1;
    });
    gallery.classList.toggle('is-filtered', selected !== 'All');
    gallery.classList.toggle('is-empty', visible === 0);
    empty.hidden = visible !== 0;
    status.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}${selected === 'All' ? '' : ` in ${selected}`}`;
  }));
})();
