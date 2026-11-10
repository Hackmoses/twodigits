(() => {
 'use strict';
 const script=document.currentScript||document.querySelector('script[src$="case-media.js"]');
 let mapping={},responsive={};
 const ready=fetch(new URL('data/case-media.json',script.src)).then(response=>response.ok?response.json():{}).then(data=>{mapping=data.images||data;responsive=data.responsive||{}}).catch(()=>{});
 const resolve=src=>mapping[src]||src;
 const apply=(img,src,sizes)=>{img.src=resolve(src);const variants=responsive[src];if(variants){img.srcset=variants.map(v=>v.src+' '+v.width+'w').join(', ');img.sizes=sizes||'(max-width:1024px) calc(100vw - 40px), 1440px';}img.addEventListener('error',()=>{if(img.getAttribute('src')!==src){img.removeAttribute('srcset');img.src=src;}},{once:true});};
 window.CaseMedia={ready,resolve,apply};
})();
