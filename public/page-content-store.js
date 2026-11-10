/* Shared content contract for the homepage, landing page and contact page. */
(() => {
  'use strict';
  const DRAFT_KEY='two-digitals.pages.draft.v1';
  const script=document.querySelector('script[src$="page-content-store.js"]');
  const base=new URL('.',script.src);
  const safeImage=value=>typeof value==='string'&&(/^assets\/[a-zA-Z0-9_./-]+$/.test(value)&&!value.includes('..')||/^https:\/\/[^\s]+$/i.test(value));
  const safeLink=value=>typeof value==='string'&&!/[\s<>\\]/.test(value)&&(/^(https?:\/\/|mailto:|tel:)/i.test(value)||/^(?!\/\/)[a-zA-Z0-9_./?&#=%+~-]*$/.test(value)&&!value.includes(':'));
  async function json(file){const r=await fetch(new URL('data/'+file,base),{cache:'no-cache'});if(!r.ok)throw Error('Page content could not be loaded. Try reloading.');return r.json();}
  function validate(data,schema){
    if(!data||data.version!==1||!data.pages||typeof data.pages!=='object'||Array.isArray(data.pages))throw Error('Choose a version 1 pages.json file.');
    const output={version:1,pages:{}};
    for(const [id,definition] of Object.entries(schema.pages)){
      const p=data.pages[id];
      if(!p||typeof p.title!=='string'||!p.title.trim()||p.title.length>180||typeof p.description!=='string'||p.description.length>500||!p.fields||typeof p.fields!=='object'||Array.isArray(p.fields))throw Error(`Check the title, description and fields for ${definition.name}.`);
      const fields={};
      for(const f of definition.fields){const value=p.fields[f.id];if(typeof value!=='string'||value.length>20000)throw Error(`Check “${f.label}” on ${definition.name}.`);if(f.type==='image'&&!safeImage(value))throw Error(`Use an assets/ path or HTTPS URL for “${f.label}”.`);if(f.type==='link'&&!safeLink(value))throw Error(`Use a website path, anchor, HTTPS, email or phone link for “${f.label}”.`);fields[f.id]=value;}
      output.pages[id]={title:p.title,description:p.description,fields};
    }
    return output;
  }
  function upgrade(data,published){
    if(!data||data.version!==1||!data.pages||typeof data.pages!=='object'||Array.isArray(data.pages))throw Error('Choose a version 1 pages.json file.');
    const pages={...published.pages,...data.pages};
    for(const [id,page] of Object.entries(data.pages)){if(page&&page.fields&&typeof page.fields==='object'&&!Array.isArray(page.fields)&&published.pages[id])pages[id]={...page,fields:{...published.pages[id].fields,...page.fields}};}
    // Migrate the original service-card email destinations in older browser drafts.
    for(const id of ['home','landing']){const fields=pages[id]?.fields;if(!fields)continue;for(const [key,value] of Object.entries(fields)){if(published.pages[id]?.fields[key]==='contact.html'&&typeof value==='string'&&/^mailto:hello@nexora\.io\?subject=.+%20inquiry$/.test(value))fields[key]='contact.html';}}
    return {...data,pages};
  }
  async function load({preview=false}={}){
    const [schema,data]=await Promise.all([json('page-schema.json'),json('pages.json')]);
    if(preview){const saved=localStorage.getItem(DRAFT_KEY);if(saved)return {schema,data:validate(upgrade(JSON.parse(saved),data),schema)};}
    return {schema,data:validate(data,schema)};
  }
  window.PageContentCMS=Object.freeze({load,validate,upgrade,safeImage,safeLink,DRAFT_KEY});
})();
