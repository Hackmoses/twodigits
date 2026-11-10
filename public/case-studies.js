(() => {
  'use strict';
  const cms = window.CaseStudiesCMS, params = new URLSearchParams(location.search), preview = params.get('preview') === '1';
  const status = document.querySelector('#status');
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
  function image(media, eager = false) { const img = el('img'); if(window.CaseMedia)CaseMedia.apply(img,media.src,'(max-width:650px) calc(100vw - 40px), 620px');else img.src=media.src; img.alt = media.alt; img.loading = eager ? 'eager' : 'lazy'; img.decoding = 'async'; return img; }
  const url = slug => cms.detailUrl(slug) + (preview ? '&preview=1' : '');
  cms.load({preview}).then(async data => {
    await window.CaseMedia?.ready;
    document.querySelector('#preview-banner').hidden = !preview;
    const list = document.querySelector('#case-studies');
    if (list) {
      const cases = preview ? [...data.caseStudies].sort((a,b)=>a.order-b.order) : cms.published(data);
      const select = document.querySelector('#category');
      [...new Set(cases.map(c=>c.category))].sort().forEach(c => { const o=el('option',c); o.value=c; select.append(o); });
      function render() {
        list.replaceChildren();
        const visible = cases.filter(c=>!select.value || c.category === select.value);
        for (const c of visible) { const link=el('a',null,'study-card'); link.href=url(c.slug); if(c.cover.src) link.append(image(c.cover)); link.append(el('span',c.category,'category'),el('h2',c.title),el('p',c.summary.split('\n\n')[0]),el('span','View case study','read-link')); list.append(link); }
        status.textContent = visible.length ? `${visible.length} case ${visible.length === 1 ? 'study' : 'studies'}` : 'No case studies in this industry yet.';
      }
      select.addEventListener('change',render); render(); return;
    }
    const c = data.caseStudies.find(c=>c.slug===params.get('slug') && (preview || c.status==='published'));
    if (!c) { document.body.classList.remove('case-loading');document.querySelector('#case-study').replaceChildren();document.querySelector('#case-study').setAttribute('aria-busy','false');status.textContent='This case study is unavailable. Browse all case studies using the link above.'; document.title='Case study unavailable — Two Digitals'; return; }
    document.title=`${c.title} — Two Digitals`;const loadingTitle=document.querySelector('.case-loading-title');if(loadingTitle)loadingTitle.textContent=c.title;
    document.querySelector('meta[name="description"]').content=c.summary.slice(0,160);
    if(window.CaseDesign && await CaseDesign.render(c,data,preview))return;
    const article=document.querySelector('#case-study');article.replaceChildren();article.setAttribute('aria-busy','false');document.body.classList.remove('case-loading');
    article.append(el('p',c.category,'category'),el('h1',c.title),el('p',c.summary,'intro'));
    if(c.cover.src) article.append(image(c.cover,true));
    const meta=el('dl',null,'metadata'); for(const [k,v] of Object.entries(c.metadata)){const pair=el('div');pair.append(el('dt',k),el('dd',v));meta.append(pair);} article.append(meta);
    for(const s of c.sections){const section=el('section',null,'story-section');section.append(el('h2',s.heading));if(s.body)section.append(el('p',s.body,'story-body'));for(const m of s.images)section.append(image(m));article.append(section);}
    const ordered=preview ? [...data.caseStudies].sort((a,b)=>a.order-b.order) : cms.published(data);const next=ordered[(ordered.findIndex(n=>n.id===c.id)+1)%ordered.length];if(next&&next.id!==c.id){const a=el('a',`Next case study · ${next.title}`,'next-study');a.href=url(next.slug);article.append(a);}status.textContent='';
  }).catch(error=>{document.body.classList.remove('case-loading');const article=document.querySelector('#case-study');if(article){article.replaceChildren();article.setAttribute('aria-busy','false');}status.textContent=error.message;const retry=el('button','Try again');retry.addEventListener('click',()=>location.reload());status.append(' ',retry);});
})();
