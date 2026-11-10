/* Shared CMS contract. Public pages read published JSON; editor drafts stay in this browser. */
(() => {
  'use strict';
  const DRAFT_KEY = 'two-digitals.case-studies.draft.v1';
  const copy = value => JSON.parse(JSON.stringify(value));
  const safeMedia = value => typeof value === 'string' && (/^assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..') || /^https:\/\/[^\s]+$/i.test(value));
  function validate(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.caseStudies)) throw Error('Choose a version 1 case-studies JSON file.');
    const ids = new Set(), slugs = new Set();
    for (const c of data.caseStudies) {
      if (!c || typeof c.id !== 'string' || !/^[a-z0-9-]+$/.test(c.id) || ids.has(c.id)) throw Error('Each study needs a unique ID using lowercase letters, numbers and hyphens.');
      if (typeof c.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug) || slugs.has(c.slug)) throw Error('Each study needs a unique URL slug using lowercase letters, numbers and hyphens.');
      ids.add(c.id); slugs.add(c.slug);
      for (const field of ['title','summary','category']) if (typeof c[field] !== 'string' || !c[field].trim()) throw Error(`Add a ${field} to ${c.title || 'every study'}.`);
      if (!['draft','published'].includes(c.status) || !Number.isFinite(c.order) || typeof c.featured !== 'boolean') throw Error('Check publication status, featured setting and display order.');
      if (!c.cover || typeof c.cover.src !== 'string' || typeof c.cover.alt !== 'string' || c.cover.src && !safeMedia(c.cover.src)) throw Error('Cover images must use assets/ paths or HTTPS URLs.');
      if (c.status === 'published' && (!c.cover.src || !c.cover.alt.trim())) throw Error(`Add a cover image and description before publishing ${c.title}.`);
      if (!c.metadata || typeof c.metadata !== 'object' || Array.isArray(c.metadata) || Object.values(c.metadata).some(v=>typeof v!=='string')) throw Error('Project metadata must contain text values.');
      if(c.template!==undefined&&c.template!=='figma-shared')throw Error('All studies use the shared Figma template.');
      if(c.accent!==undefined&&!/^#[a-f0-9]{6}$/i.test(c.accent))throw Error('Use a six-digit project accent color.');
      if(c.design){
        if(!['blomgram','ai-patient-intake','sellflo','vpn-medical'].includes(c.design.template))throw Error('Choose a valid original case-study layout.');
        for(const kind of ['text','images']){const values=c.design[kind];if(values!==undefined&&(!values||typeof values!=='object'||Array.isArray(values)))throw Error('Check original-layout content.');for(const [key,value] of Object.entries(values||{})){if(!/^\d+:\d+$/.test(key)||typeof value!=='string'||value.length>20000||kind==='images'&&!safeMedia(value))throw Error('Check original-layout text and image paths.');}}
      }
      if (!Array.isArray(c.sections)) throw Error('Each study needs a sections array.');
      const sectionIds = new Set();
      for (const s of c.sections) {
        if (!s || typeof s.id !== 'string' || sectionIds.has(s.id) || typeof s.heading !== 'string' || typeof s.body !== 'string' || !Array.isArray(s.images)) throw Error('Check section IDs, headings, body text and images.');
        sectionIds.add(s.id);
        if(s.cards!==undefined&&(!Array.isArray(s.cards)||s.cards.some(card=>!card||typeof card.title!=='string'||typeof card.body!=='string'||card.image&&(!safeMedia(card.image.src)||typeof card.image.alt!=='string'||!card.image.alt.trim()))))throw Error('Check card headings, text and image descriptions.');
        if(s.palette!==undefined&&(!Array.isArray(s.palette)||s.palette.some(color=>!color||typeof color.group!=='string'||typeof color.name!=='string'||!/^#[a-f0-9]{6}$/i.test(color.color))))throw Error('Each palette color needs a name and a six-digit hex value.');
        if(s.typography!==undefined&&(!Array.isArray(s.typography)||s.typography.some(sample=>!sample||typeof sample.label!=='string'||!Number.isFinite(sample.size)||sample.size<10||sample.size>88)))throw Error('Typography samples need a label and a size from 10 to 88.');
        if(s.buttons!==undefined&&(!Array.isArray(s.buttons)||s.buttons.some(label=>typeof label!=='string')))throw Error('Component labels must be text.');

        for (const m of s.images) if (!m || !safeMedia(m.src) || typeof m.alt !== 'string' || !m.alt.trim()) throw Error('Every section image needs a safe path and image description.');
      }
    }
    return copy(data);
  }
  function migrateFields(c,definition){const base=definition.defaults,bindings=definition.bindings;if(!base||!bindings)return c;for(const field of ['title','summary']){const alias=c.design?.text?.[bindings[field]];if(alias!==undefined&&c[field]===base[field])c[field]=alias;}for(const [key,id] of Object.entries(bindings.metadata||{})){const alias=c.design?.text?.[id];if(alias!==undefined&&c.metadata[key]===base.metadata[key])c.metadata[key]=alias;}const cover=c.design?.images?.[bindings.cover];if(cover&&c.cover.src===base.cover.src)c.cover.src=cover;return c;}
  async function load({ preview = false } = {}) {
    if (preview) { const saved = localStorage.getItem(DRAFT_KEY); if (saved) return validate(JSON.parse(saved)); }
    const response = await fetch(new URL('data/case-studies.json', document.querySelector('script[src$="case-studies-store.js"]').src), { cache: 'no-cache' });
    if (!response.ok) throw Error('Case studies could not be loaded. Please try again.');
    return validate(await response.json());
  }
  function published(data, { category, featured } = {}) {
    return data.caseStudies.filter(c => c.status === 'published' && (!category || c.category === category) && (!featured || c.featured)).sort((a,b) => a.order-b.order || a.title.localeCompare(b.title));
  }
  window.CaseStudiesCMS = Object.freeze({ load, validate, migrateFields, published, safeMedia, DRAFT_KEY, detailUrl: slug => `case-study.html?slug=${encodeURIComponent(slug)}` });
})();
