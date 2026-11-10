(() => {
  const config = window.TWO_DIGITALS || {};
  const nav = document.querySelector('#main-nav');
  const menu = document.querySelector('.menu-toggle');
  const projectAction=document.querySelector('.header>.button');
  if(nav&&projectAction){const compact=projectAction.cloneNode(true);compact.removeAttribute('data-cms-node');compact.className='compact-project-link';compact.querySelectorAll('[data-cms-node]').forEach(n=>n.removeAttribute('data-cms-node'));nav.append(compact);const syncProject=()=>compact.href=projectAction.href;document.addEventListener('cms:content-loaded',syncProject);syncProject();}

  const closeMenu = () => {
    menu?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('open');
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('open', open);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); menu?.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  const wide = matchMedia('(min-width:1024px)');
  wide.addEventListener('change', closeMenu);
  const normalizeNav = () => {
    const order = ['Services','Portfolio','Case Studies','About','Insights','Contact'];
    [...(nav?.children || [])].sort((a,b) => order.indexOf(a.textContent.trim()) - order.indexOf(b.textContent.trim())).forEach(link => nav.append(link));
  };
  normalizeNav(); document.addEventListener('cms:content-loaded', normalizeNav);
  const validUrl = value => { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } };
  let toastTimer;
  const notify = text => {
    const toast = document.querySelector('.toast');
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
  };
  document.querySelectorAll('[data-social]').forEach(link => {
    const url = config.social?.[link.dataset.social];
    if (validUrl(url)) { link.href = url; link.rel = 'noopener noreferrer'; }
    else link.addEventListener('click', event => { if(/^https?:\/\//i.test(link.getAttribute('href')))return;event.preventDefault(); notify('This social profile has not been added yet. You can reach us by email.'); });
  });
  const dialog = document.querySelector('#project-dialog');
  const preview = document.querySelector('#project-preview');
  const caption = document.querySelector('#project-caption');
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    preview.src = button.dataset.image;
    preview.alt = button.dataset.caption;
    caption.textContent = button.dataset.caption;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  const closeDialog = () => dialog?.close();
  dialog?.querySelector('.dialog-close')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  dialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));
})();
