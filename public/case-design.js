(() => {
 'use strict';
 const css=n=>`calc(${n} * var(--case-unit))`;
 const safe=window.CaseStudiesCMS.safeMedia;
 function richText(element,n,value){
  const formatting=n.rich,lines=value.split('\n');
  if(!formatting||!((formatting.runs||[]).length||formatting.lines.some(l=>l.type?.includes('LIST'))||value.includes('\n\n')||value.includes('\u2028')))return;
  element.replaceChildren();element.classList.add('case-rich');
  const rgb=(n.color||'').match(/[\d.]+/g);element.style.setProperty('--case-rich-heading-color',rgb&&rgb.slice(0,3).reduce((a,v)=>a+Number(v),0)/3>180?n.color:'var(--ink)');
  const original=value===n.text,sourceLines=n.text.split('\n'),sameLines=lines.length===sourceLines.length,headings=new Map();let sourceOffset=0;
  sourceLines.forEach((line,index)=>{const first=line.split('\u2028')[0];if(first.trim()&&formatting.runs.some(r=>r.weight>=600&&r.start<=sourceOffset&&r.end>=sourceOffset+first.length))headings.set(index,{name:first.trim(),list:formatting.lines[index+1]?.type?.includes('LIST')?formatting.lines[index+1].type:null});sourceOffset+=line.length+1;});
  const append=(target,text,start,heading=false)=>{let position=start;text.split('\u2028').forEach((part,i)=>{if(i)target.append(document.createElement('br'));if(!original&&heading&&i===0){const strong=document.createElement('span');strong.style.fontWeight=600;strong.textContent=part;target.append(strong);}else{let cursor=0;for(const run of original?formatting.runs:[]){const a=Math.max(position,run.start),b=Math.min(position+part.length,run.end);if(b<=a)continue;if(a-position>cursor)target.append(document.createTextNode(part.slice(cursor,a-position)));const span=document.createElement('span');span.textContent=part.slice(a-position,b-position);if(run.weight)span.style.fontWeight=run.weight;if(run.italic)span.style.fontStyle='italic';if(run.color)span.style.color=run.color;target.append(span);cursor=b-position;}if(cursor<part.length)target.append(document.createTextNode(part.slice(cursor)));}position+=part.length+1;});};
  let offset=0,list=null,paragraph=null,listContext=null;
  lines.forEach((line,index)=>{if(!line.trim()){list=null;paragraph=null;listContext=null;offset+=line.length+1;return;}
   const first=line.split('\u2028')[0].trim(),heading=sameLines?headings.get(index):[...headings.values()].find(h=>h.name===first),info=sameLines?formatting.lines[index]:null,marker=!original&&line.match(/^\s*[-*]\s+(.+)/),isList=!heading&&(info?.type?.includes('LIST')||marker||listContext);
   if(isList){paragraph=null;const type=(info?.type||listContext)==='ORDERED_LIST'?'ol':'ul';if(!list||list.tagName.toLowerCase()!==type){list=document.createElement(type);element.append(list);}const item=document.createElement('li'),text=marker?marker[1]:line.trimStart();append(item,text,offset+line.indexOf(text));list.append(item);
   }else{list=null;if(!paragraph||heading){paragraph=document.createElement('p');element.append(paragraph);}else paragraph.append(document.createElement('br'));append(paragraph,line,offset,!!heading);if(heading){paragraph.classList.add('case-rich-heading');paragraph=null;listContext=heading.list;}}
   offset+=line.length+1;
  });
 }
 function nodeElement(n,overrides,adaptive=false,depth=0,section='',parent=null){
  if(depth===1)section=n.name;
  const action=n.text&&/let[’']s work together/i.test(n.text);const e=document.createElement(action?'a':n.text?'div':n.art?'figure':'div');if(action)e.href='contact.html#project-form';e.className='case-node '+(n.text?'case-text':n.art?'case-art':'case-frame');if(n.art&&Math.max(n.w,n.h)<80)e.classList.add('case-decoration');
  if(adaptive&&!n.text&&!n.art){
   const white=!n.bg||/^rgba\(255,255,255,/.test(n.bg);
   if(depth>1&&n.w>180&&n.h>80&&(n.border||!white))e.classList.add('case-card');
   const inline=n.name==='Section-Label'||(n.kids||[]).some(c=>c.text?.trim()==='•')||(n.stack==='HORIZONTAL'&&n.h<85&&(n.kids||[]).every(c=>c.w<220));
   if(inline)e.classList.add('case-inline');else if(n.stack==='HORIZONTAL'&&(n.kids||[]).length>1)e.classList.add('case-columns');
   if(n.name==='metadata-grid')e.classList.add('case-metadata');if(n.name==='Section-Label'&&n.kids?.some(c=>c.size>=22)){e.setAttribute('role','heading');e.setAttribute('aria-level','2');}
  }e.dataset.sourceNode=n.id;e.dataset.sourceName=n.name||'';e.style.left=css(n.x);e.style.top=css(n.y);e.style.width=css(n.w);e.style.height=n.text?'auto':css(n.h);e.style.minHeight=n.text?css(n.h):'0';e.style.opacity=n.opacity??1;if(n.bg)e.style.background=n.bg;if(n.radius)e.style.borderRadius=css(n.radius);if(n.clip)e.style.overflow='hidden';if(n.border)e.style.boxShadow=`inset 0 0 0 ${css(n.border.width)} ${n.border.color}`;
  if(n.text){e.dataset.originalText=n.text;e.style.setProperty('--source-font-size',n.size);if(n.size>=14&&n.size<=20&&n.text.length>70)e.classList.add('case-reading-copy');e.textContent=overrides.text?.[n.id]??n.text;e.style.fontFamily=`'${n.font}', sans-serif`;e.style.fontSize=css(n.size);e.style.lineHeight=css(n.line);e.style.fontWeight=n.weight;e.style.textAlign=n.align;e.style.letterSpacing=css(n.letter);e.style.color=n.color;if(/^\d{1,2}$/.test(n.text.trim())||(n.size<=14&&!n.text.includes('\n')&&n.h<=n.line*1.3))e.style.whiteSpace='pre';if(adaptive){const label=parent?.name==='Section-Label';const title=section==='01-Overview'&&n.size>=60;const role=title?'title':label?(n.size>=22?'section-heading':'label'):n.size<=13?'label':n.text.length<80&&n.size>=24?'heading':n.text.length<100&&n.weight>=600&&n.size>=16?'subheading':n.size>=24?'lead':'body';e.dataset.textRole=role;e.removeAttribute('role');e.removeAttribute('aria-level');}
   e.style.setProperty('--mobile-size',(n.size>=60?40:n.size>=32?28:n.size>=22?22:n.size>=18?18:n.size<=12?12:16)+'px');if(n.size>=70){e.setAttribute('role','heading');e.setAttribute('aria-level','1');}else if(n.size>=28){e.setAttribute('role','heading');e.setAttribute('aria-level','2');}}
  const src=overrides.images?.[n.id]||n.asset||n.image;if(src&&safe(src)){const im=document.createElement('img');if(window.CaseMedia)CaseMedia.apply(im,src,`(max-width:1024px) calc(100vw - 40px), ${Math.ceil(n.w)}px`);else im.src=src;im.dataset.masterSrc=src;im.alt=n.name||'Original project design';im.width=n.w;im.height=n.h;im.loading=section==='01-Overview'&&n.w>400?'eager':'lazy';im.decoding='async';if(n.imageMode==='STRETCH')im.style.objectFit='fill';e.append(im);}
  if(adaptive&&n.kids?.length===2&&n.kids[0].stack==='HORIZONTAL'&&n.kids[0].kids?.length>1&&n.kids[0].kids.every(c=>c.name==='Section-Label')&&n.kids[1].kids?.length===n.kids[0].kids.length){
   e.classList.add('case-paired-grid');const headings=[...n.kids[0].kids].sort((a,b)=>a.x-b.x),cards=[...n.kids[1].kids].sort((a,b)=>a.x-b.x);headings.forEach((heading,i)=>{const pair=document.createElement('section');pair.className='case-pair';pair.append(nodeElement(heading,overrides,true,depth+2,section,n.kids[0]),nodeElement(cards[i],overrides,true,depth+2,section,n.kids[1]));e.append(pair);});
  }else for(const c of n.kids||[])e.append(nodeElement(c,overrides,adaptive,depth+1,section,n));
  if(adaptive&&n.text){if(e.dataset.textRole==='title'){e.setAttribute('role','heading');e.setAttribute('aria-level','1');}else if(e.dataset.textRole==='heading'){e.setAttribute('role','heading');e.setAttribute('aria-level','2');}else{e.removeAttribute('role');e.removeAttribute('aria-level');}}
  if(n.text)richText(e,n,e.textContent);
  if(depth===1){const label=(n.kids||[]).find(c=>c.name==='Section-Label'),labelText=label?.kids?.find(c=>c.text&&!/^\d+$/.test(c.text.trim())),name=labelText?(overrides.text?.[labelText.id]??labelText.text).trim():null;if(name){let repeated=false;function check(c){if(c!==label&&c.text&&(overrides.text?.[c.id]??c.text).trim()===name&&c.size>=24)repeated=true;(c.kids||[]).forEach(check);}for(const child of n.kids||[])if(child!==label)check(child);if(repeated)e.querySelector(`[data-source-node="${label.id}"]`)?.classList.add('case-repeated-label');}}
  e._layout=n;return e;
 }
 function reflow(e){const n=e._layout;if(!n)return 0;const unit=Math.min(1,innerWidth/1440);if(innerWidth<=1024){e.style.height='auto';return 0;}if(n.text)return Math.max(n.h,e.getBoundingClientRect().height/unit);
  const items=[...e.children].filter(c=>c._layout),sizes=new Map();for(const c of items)sizes.set(c,reflow(c));let bottom=n.h;
  for(const c of items){const a=c._layout;let shift=0;for(const prior of items){const p=prior._layout;if(prior!==c&&p.y+p.h<=a.y+1&&p.y<a.y&&p.w>0){const horizontal=p.x<a.x+a.w&&p.x+p.w>a.x;const amount=(sizes.get(prior)||p.h)-p.h;if(horizontal&&amount>0)shift=Math.max(shift,amount+(prior._shift||0));}}c._shift=shift;c.style.top=css(a.y+shift);bottom=Math.max(bottom,a.y+shift+(sizes.get(c)||a.h));}
  e.style.height=css(bottom);return bottom;
 }
 async function render(c,data,preview){
  const key=c.design?.template||(['blomgram','ai-patient-intake','sellflo','vpn-medical'].includes(c.id)?c.id:'');if(!key)return false;
  await window.CaseMedia?.ready;
  const response=await fetch(`data/case-layouts/${key}.json`);if(!response.ok)throw Error('The original case-study layout could not load. Please reload.');const layout=await response.json();
  const original=layout.defaults;const bindings=layout.bindings||{};if(original)CaseStudiesCMS.migrateFields(c,{defaults:original,bindings});const overrides={text:{...(c.design?.text||{})},images:{...(c.design?.images||{})}};
  const texts=[];function visit(n){if(n.text)texts.push(n);(n.kids||[]).forEach(visit);}visit(layout);
  if(original){for(const field of ['title','summary'])if(bindings[field])overrides.text[bindings[field]]=c[field];for(const [key,id] of Object.entries(bindings.metadata||{}))if(id&&c.metadata[key]!==undefined)overrides.text[id]=c.metadata[key];
   if(bindings.cover&&c.cover.src&&c.cover.src!==original.cover.src)overrides.images[bindings.cover]=c.cover.src;
   // Existing body edits remain visible; new precise edits use the source-layout fields.
   for(const s of c.sections){const base=original.sections.find(x=>x.id===s.id);if(base&&s.heading!==base.heading){const heading=texts.find(n=>n.text.trim().replace(/^—\s*/,'')===base.heading.trim());if(heading)overrides.text[heading.id]=s.heading;}if(base&&s.body!==base.body){const section=layout.kids.find(n=>n.id.replace(':','-')===s.id);if(section){const candidates=[];function leaves(n){if(n.text&&n.size>=14)candidates.push(n);(n.kids||[]).forEach(leaves);}leaves(section);if(candidates.length){const paragraphs=s.body.split(/\n\n/);candidates.forEach((n,i)=>overrides.text[n.id]=paragraphs[i]||'');if(paragraphs.length>candidates.length)overrides.text[candidates.at(-1).id]=paragraphs.slice(candidates.length-1).join('\n\n');}}}}
  }
  const target=document.querySelector('#case-study');target.classList.remove('case-custom');target.classList.add('case-canvas');document.body.classList.add('has-source-case');
  let root,adaptive;
  const resize=()=>{const next=innerWidth<=1024;if(!root||next!==adaptive){adaptive=next;root=nodeElement(layout,overrides,adaptive);root.classList.add('case-root');root.style.left='0';root.style.top='0';target.replaceChildren(root);target.classList.toggle('case-adaptive',adaptive);}if(!adaptive)reflow(root);};
  resize();target.setAttribute('aria-busy','false');document.body.classList.remove('case-loading');document.fonts.ready.then(()=>{if(!adaptive)reflow(root);});addEventListener('resize',resize);document.querySelector('#status').textContent='';document.documentElement.dataset.caseDesignLoaded='true';return true;
 }
 window.CaseDesign={render};
})();
