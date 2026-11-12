/* One Figma-based case-study template and an adapter for older content files. */
(()=>{
 'use strict';
 const TEMPLATE='figma-shared';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const all=n=>[n,...(n.kids||[]).flatMap(all)];
 const value=(n,edits)=>edits.text?.[n.id]??n.text??'';
 const textNodes=(n,edits)=>all(n).filter(x=>x.text&&value(x,edits).trim());
 function markdown(n,edits){
  const text=value(n,edits).replace(/\u2028/g,'\n').trim();if(!text)return '';
  const lines=text.split('\n'),original=value(n,edits)===n.text,formats=original?n.rich?.lines||[]:[];
  const headings=new Set();let sourceOffset=0;for(const line of (n.text||'').split('\n')){const first=line.split('\u2028')[0].trim(),start=sourceOffset+line.indexOf(first);if(first&&(n.rich?.runs||[]).some(run=>run.weight>=600&&run.start<=start&&run.end>=start+first.length))headings.add(first.replace(/:$/,''));sourceOffset+=line.length+1;}
  let count=0;
  return lines.map((line,i)=>{line=line.trim();if(!line)return '';const type=formats[i]?.type;if(type==='UNORDERED_LIST')return '- '+line;if(type==='ORDERED_LIST')return (++count)+'. '+line;count=0;if(headings.has(line.replace(/:$/,''))||/^(Goal|Pain Points|Needs|Profile|Goals|Challenges|Design rationale|Research objectives):?$/i.test(line))return '**'+line.replace(/:$/,'')+'**';return line;}).join('\n').replace(/([^\n])\n(?=[^-\n\d*])/g,'$1\n\n');
 }
 function media(n,edits){return {src:edits.images?.[n.id]||n.asset||n.image,alt:n.name||'Original project interface'};}
 const artwork=(n,edits)=>all(n).filter(x=>(x.art||x.image)&&x.w>=240&&x.h>=110).map(x=>media(x,edits));
 const clean=s=>s.trim().replace(/^\s*(?:\d+\s*)?[—–]\s*/,'').replace(/\s+/g,' ');
 function chapterFromSource(section,edits){
  const nodes=all(section),labelNodes=new Set(nodes.filter(n=>n.name==='Section-Label').flatMap(all).map(n=>n.id));
  const texts=textNodes(section,edits).filter(n=>!labelNodes.has(n.id)&&value(n,edits).trim()!=='•');
  const title=texts.find(n=>n.size>=28&&value(n,edits).length<120&&!/^\d+$/.test(value(n,edits).trim()));
  const label=nodes.find(n=>n.name==='Section-Label');const labelText=label&&textNodes(label,edits).find(n=>!/^\d+$/.test(value(n,edits).trim()));
  let heading=title?clean(value(title,edits)):labelText?clean(value(labelText,edits)):'';
  if(!heading)heading=/wireframe/i.test(section.name)?'Wireframes':'Product screens';
  const chapter={id:'chapter-'+section.id.replace(':','-'),heading,body:'',cards:[],images:[],palette:[],typography:[],buttons:[]};
  if(section.name==='07-Design-System'){
   chapter.body=texts.filter(n=>n!==title&&n.text.length>60&&!n.text.startsWith('Lorem')&&n.size>=14).map(n=>markdown(n,edits)).slice(0,1).join('\n\n');
   let group='Brand palette';
   for(const n of nodes){
    if(n.text&&['ColorS','Colors','Color Space','Primary,','Neutral, Gray','Yellow','Red','Green'].includes(n.text.trim()))group=n.text.trim()==='ColorS'?'Brand palette':n.text.trim();
    const chip=(n.kids||[]).find(x=>x.bg&&!x.kids?.length&&!x.text&&x.h>=60&&x.h<=110);if(!chip)continue;
    const labels=textNodes(n,edits),hex=labels.find(x=>/#?([a-f0-9]{6})\s*$/i.test(value(x,edits)));if(!hex)continue;
    const match=value(hex,edits).match(/#?([a-f0-9]{6})\s*$/i),name=labels.find(x=>x!==hex);
    chapter.palette.push({group,name:clean(name?value(name,edits):value(hex,edits).replace(/#?[a-f0-9]{6}\s*$/i,'')),color:'#'+match[1]});
   }
   chapter.typography=texts.filter(n=>/^Inter[ —]/.test(n.text)).map(n=>({label:value(n,edits),size:n.size>=28?36:n.size>=14?16:12}));
   chapter.buttons=texts.filter(n=>['Primary CTA','Secondary'].includes(n.text.trim())&&n.size>=12).map(n=>value(n,edits));
   return chapter;
  }
  const pairs=new Map();
  for(const n of nodes){if(n.kids?.length===2&&n.kids[0].kids?.every(x=>x.name==='Section-Label')&&n.kids[0].kids.length===n.kids[1].kids?.length){n.kids[1].kids.forEach((card,i)=>pairs.set(card.id,textNodes(n.kids[0].kids[i],edits).map(x=>value(x,edits)).filter(x=>!/^\d+$/.test(x.trim())).join(' ')));}}
  const cardIds=new Set();const roots=[];
  function findCards(n,inside=false){const hasText=textNodes(n,edits).some(x=>value(x,edits).length>50);const isCard=!inside&&n!==section&&n.w>180&&n.h>80&&hasText&&(n.border||n.bg&&!/^rgba\(255,255,255,/.test(n.bg));if(isCard){roots.push(n);all(n).forEach(x=>cardIds.add(x.id));}else for(const c of n.kids||[])findCards(c,inside);}
  findCards(section);
  for(const n of roots){const leaves=textNodes(n,edits).filter(x=>!labelNodes.has(x.id)&&value(x,edits).trim()!=='•');const name=leaves.find(x=>x.size>=16&&x.weight>=600&&value(x,edits).length<100);const titleText=pairs.get(n.id)|| (name?value(name,edits):'');const body=leaves.filter(x=>x!==name||pairs.has(n.id)).map(x=>markdown(x,edits)).join('\n\n');const portrait=all(n).find(x=>(x.art||x.image)&&x.w>=40&&x.w<150&&x.h>=40);chapter.cards.push({title:clean(titleText),body,image:portrait?media(portrait,edits):null});}
  chapter.body=texts.filter(n=>n!==title&&!cardIds.has(n.id)).map(n=>{const text=markdown(n,edits);return n.size>=18&&n.weight>=600&&text.length<100?'**'+text+'**':text;}).join('\n\n');
  chapter.images=nodes.filter(n=>(n.art||n.image)&&n.w>=240&&n.h>=110).map(n=>media(n,edits));
  if(chapter.cards.length&&pairs.size)chapter.heading='Challenge and product goals';
  return chapter;
 }
 async function normalize(record,loadLayout){
  if(record.template===TEMPLATE)return clone(record);
  const c=clone(record),key=c.design?.template||(['blomgram','ai-patient-intake','sellflo','vpn-medical'].includes(c.id)?c.id:null);
  if(!key){c.template=TEMPLATE;delete c.design;return c;}
  const layout=await loadLayout(key);window.CaseStudiesCMS?.migrateFields(c,{defaults:layout.defaults,bindings:layout.bindings});
  const edits={text:{...c.design?.text},images:{...c.design?.images}};
  for(const section of c.sections||[]){const base=layout.defaults?.sections.find(s=>s.id===section.id);if(!base)continue;const root=layout.kids.find(n=>n.id.replace(':','-')===section.id);if(root&&section.body!==base.body){const leaves=textNodes(root,edits).filter(n=>n.size>=14),paragraphs=section.body.split(/\n\n/);leaves.forEach((n,i)=>edits.text[n.id]=paragraphs[i]||'');if(paragraphs.length>leaves.length&&leaves.length)edits.text[leaves.at(-1).id]=paragraphs.slice(leaves.length-1).join('\n\n');}}
  const hidden=key==='ai-patient-intake'?['455:31074','455:31231']:[];
  const overview=layout.kids[0],coverNode=all(overview).find(n=>n.id===layout.bindings?.cover);
  if(coverNode&&c.cover.src===layout.defaults?.cover.src)c.cover={...c.cover,...media(coverNode,edits)};
  const chapters=[];
  for(const section of layout.kids.slice(1)){
   if(hidden.includes(section.id))continue;
   if(textNodes(section,edits).some(n=>/THANK YOU|LET[’']S WORK TOGETHER/i.test(n.text)))continue;
   const chapter=chapterFromSource(section,edits);
   if(!chapter.body&&!chapter.cards.length&&!chapter.palette.length&&!chapter.images.length)continue;
   const previous=chapters.at(-1);
   if(chapter.heading==='Product screens'&&!chapter.body&&!chapter.cards.length&&previous?.heading==='Product screens'){previous.images.push(...chapter.images);continue;}
   chapters.push(chapter);
  }
  const overviewExtras=artwork(overview,edits).filter(m=>m.src!==c.cover.src);if(overviewExtras.length)chapters.unshift({id:'project-preview',heading:'Project preview',body:'',images:overviewExtras});
  c.sections=chapters;c.template=TEMPLATE;c.accent=chapters.flatMap(s=>s.palette||[])[0]?.color||'#16263C';delete c.design;return c;
 }
 async function prepare(data){if(data.caseStudies.every(c=>c.template===TEMPLATE))return data;const script=document.querySelector('script[src$="case-template.js"]');const load=async key=>{const response=await fetch(new URL('data/case-layouts/'+key+'.json',script.src));if(!response.ok)throw Error('The original Figma content could not be imported.');return response.json();};return {...data,caseStudies:await Promise.all(data.caseStudies.map(c=>normalize(c,load)))};}
 const el=(tag,text,className)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;};
 function inline(target,text){for(const [i,part] of text.split('**').entries()){target.append(i%2?el('strong',part):document.createTextNode(part));}}
 function prose(text){const root=el('div',null,'fig-prose');let list=null;
  for(const block of text.split(/\n\s*\n/)){const lines=block.trim().split('\n');for(const line of lines){if(!line.trim())continue;const item=line.match(/^\s*(?:[-•*]|\d+\.)\s+(.+)$/);if(item){const ordered=/^\s*\d+\./.test(line);if(!list||list.tagName!==(ordered?'OL':'UL')){list=el(ordered?'ol':'ul');root.append(list);}const li=el('li');inline(li,item[1]);list.append(li);}else{list=null;const p=el(/^\*\*[^*]+\*\*$/.test(line)?'h3':'p');inline(p,line);root.append(p);}}list=null;}return root;
 }
 function picture(m,eager=false){const figure=el('figure',null,'fig-screen');const image=el('img');if(window.CaseMedia)CaseMedia.apply(image,m.src,'(max-width:699px) calc(100vw - 72px), 1168px');else image.src=m.src;image.alt=m.alt;image.loading=eager?'eager':'lazy';image.decoding='async';const canvas=el('div',null,'fig-screen-canvas');canvas.append(image);figure.append(canvas);return figure;}
 async function render(record,data,preview){const normalized=await prepare({version:1,caseStudies:[record]}),c=normalized.caseStudies[0];const article=document.querySelector('#case-study');article.replaceChildren();article.className='fig-case';article.style.setProperty('--project-accent',/^#[a-f0-9]{6}$/i.test(c.accent)?c.accent:'#16263C');
  const hero=el('section',null,'fig-hero');hero.append(el('h1',c.title),prose(c.summary));
  const meta=el('dl',null,'fig-meta');for(const [key,value] of Object.entries(c.metadata)){if(!value.trim())continue;const pair=el('div');pair.append(el('dt',key.replace(/([A-Z])/g,' $1')),el('dd',value));meta.append(pair);}if(meta.children.length)hero.append(meta);if(c.cover.src)hero.append(picture(c.cover,true));article.append(hero);
  c.sections.forEach((s,i)=>{const section=el('section',null,'fig-chapter');section.dataset.chapter=s.id;const head=el('header',null,'fig-chapter-heading');head.append(el('h2',s.heading));section.append(head);if(s.body)section.append(prose(s.body));if(s.cards?.length){const grid=el('div',null,'fig-cards');for(const card of s.cards){const item=el('article',null,'fig-card');const title=el('div',null,'fig-card-title');if(card.image){const avatar=el('img');avatar.src=window.CaseMedia?.resolve(card.image.src)||card.image.src;avatar.alt=card.image.alt;title.append(avatar);}if(card.title)title.append(el('h3',card.title));if(title.children.length)item.append(title);item.append(prose(card.body));grid.append(item);}section.append(grid);}
   if(s.palette?.length){const groups=new Map();for(const color of s.palette){let grid=groups.get(color.group);if(!grid){const panel=el('div',null,'fig-palette');panel.append(el('h3',color.group));grid=el('div',null,'fig-swatches');panel.append(grid);groups.set(color.group,grid);section.append(panel);}const item=el('div',null,'fig-swatch'),chip=el('div',null,'fig-color');chip.style.background=color.color;item.append(chip,el('strong',color.name),el('span',color.color));grid.append(item);}}
   if(s.typography?.length||s.buttons?.length){const grid=el('div',null,'fig-specimens');if(s.typography?.length){const panel=el('div',null,'fig-specimen');panel.append(el('h3','Typography'));for(const sample of s.typography){const text=el('p',sample.label);text.style.fontSize=sample.size+'px';panel.append(text);}grid.append(panel);}if(s.buttons?.length){const panel=el('div',null,'fig-specimen'),row=el('div',null,'fig-sample-buttons');panel.append(el('h3','Components'));s.buttons.forEach((label,i)=>row.append(el('span',label,i?'fig-sample-secondary':'fig-sample-primary')));panel.append(row);grid.append(panel);}section.append(grid);}
   if(s.images?.length){const gallery=el('div',null,'fig-gallery');s.images.forEach(m=>gallery.append(picture(m)));section.append(gallery);}article.append(section);});
  const footer=el('section',null,'fig-next');footer.append(el('h2','Let’s work together'),el('a','Start your project','button button-dark'));footer.lastElementChild.href='contact.html#project-form';const ordered=data.caseStudies.filter(n=>preview||n.status==='published').sort((a,b)=>a.order-b.order),next=ordered[(ordered.findIndex(n=>n.id===c.id)+1)%ordered.length];if(next&&next.id!==c.id){const link=el('a','Next project — '+next.title);link.href=CaseStudiesCMS.detailUrl(next.slug)+(preview?'&preview=1':'');footer.append(link);}article.append(footer);article.setAttribute('aria-busy','false');document.body.classList.remove('case-loading');document.body.classList.add('has-shared-case');document.querySelector('#status').textContent='';document.documentElement.dataset.caseDesignLoaded='true';return true;
 }
 window.CaseTemplate={TEMPLATE,normalize,prepare,prose};window.CaseDesign={render};
})();
