(() => {
  'use strict';
  const pageId=document.body.dataset.cmsPage;
  if(!pageId)return;
  const preview=new URLSearchParams(location.search).get('preview')==='1';
  window.pageContentReady=PageContentCMS.load({preview}).then(({data,schema})=>{
    const page=data.pages[pageId],definition=schema.pages[pageId];
    document.title=page.title;
    let description=document.querySelector('meta[name="description"]');
    if(!description){description=document.createElement('meta');description.name='description';document.head.append(description);}description.content=page.description;
    for(const field of definition.fields){
      const target=document.querySelector(`[data-cms-node="${CSS.escape(field.target)}"]`);if(!target)continue;
      const value=page.fields[field.id];
      if(field.attribute){target.setAttribute(field.attribute,value);if(target.tagName==='IMG'){const previewButton=target.closest('[data-image]');if(previewButton&&field.attribute==='src')previewButton.dataset.image=value;if(previewButton&&field.attribute==='alt')previewButton.dataset.caption=value;}continue;}
      const child=target.childNodes[field.index];if(child?.nodeType===Node.TEXT_NODE){let text=value;const leading=field.default.match(/^\s+/)?.[0]||'',trailing=field.default.match(/\s+$/)?.[0]||'';if(leading&&!/^\s/.test(text))text=leading+text;if(trailing&&!/\s$/.test(text))text+=trailing;child.nodeValue=text;}
      if(value!==field.default&&target.closest('.stats-mobile'))target.closest('.services-statistics')?.classList.add('cms-stats-live');
      if(field.outlined&&value!==field.default){
        const layer=target.closest('.text-layer');if(!layer)continue;
        layer.classList.add('cms-live-text');
        const style=field.style||{};target.style.fontSize=(style.fontSize||16)+'px';target.style.lineHeight=style.lineHeight?style.lineHeight+'px':'1.3';target.style.fontWeight=String(style.fontWeight||400);target.style.color=style.color||'#05191b';
        const action=target.closest('a[aria-label],button[aria-label]');if(action)action.setAttribute('aria-label',action.textContent.trim());
      }
    }
    for(const entry of document.querySelectorAll('.portfolio-entry')){const photo=entry.querySelector('.portfolio-photo>img'),title=entry.querySelector('h2')?.textContent?.trim();if(!photo)continue;for(const button of entry.querySelectorAll('[data-image]')){button.dataset.image=photo.getAttribute('src');button.dataset.caption=title||photo.alt;if(title)button.setAttribute('aria-label','View '+title);}}
    if(preview){const banner=document.createElement('div');banner.className='cms-preview-notice';banner.setAttribute('role','status');banner.textContent='Browser draft preview · Changes are not live';document.body.append(banner);}
    document.documentElement.dataset.cmsLoaded='true';
    document.dispatchEvent(new CustomEvent('cms:content-loaded',{detail:{pageId,preview}}));
  }).catch(error=>{
    console.error('Page CMS:',error);
    if(preview){const notice=document.createElement('div');notice.className='cms-preview-notice';notice.setAttribute('role','alert');notice.textContent='Draft preview could not load. Showing the page template. '+error.message;document.body.append(notice);}
    document.documentElement.dataset.cmsLoaded='error';
  });
})();
