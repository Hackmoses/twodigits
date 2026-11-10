/* Contact page only. Source copy and art are retained from frame 292:583. */
(()=>{
  const page=document.getElementById('contact-page'),viewport=document.getElementById('page-viewport');
  function fit(){const scale=Math.min(1,innerWidth/1440);document.documentElement.style.setProperty('--contact-scale',scale);viewport.style.height=`${4033*scale}px`;page.style.marginInline=innerWidth>1440?'auto':'0';}
  fit();addEventListener('resize',fit);
  const status=document.getElementById('contact-status');
  function announce(message){status.textContent=message;status.hidden=false;}
  for(const input of document.querySelectorAll('.field>input,.description>textarea'))input.addEventListener('input',()=>input.parentElement.classList.toggle('has-value',!!input.value));
  const file=document.querySelector('input[type=file]');
  file.addEventListener('change',()=>{if(file.files[0]?.size>25*1024*1024){file.value='';announce('Please select a file up to 25MB.');}else if(file.files[0])announce(`Selected: ${file.files[0].name}`);});
  const upload=file.parentElement;
  upload.addEventListener('dragover',e=>{e.preventDefault();upload.style.outline='3px solid #1ed760';});
  upload.addEventListener('dragleave',()=>upload.style.outline='');
  upload.addEventListener('drop',e=>{e.preventDefault();upload.style.outline='';if(e.dataTransfer.files.length){file.files=e.dataTransfer.files;file.dispatchEvent(new Event('change'));}});
  document.getElementById('project-form').addEventListener('submit',e=>{e.preventDefault();announce('Your message has not been sent. A submission destination has not been configured for this form.');});
  // The source contains the collapsed questions only; it supplies no answer copy.

  document.addEventListener('keydown',e=>{if(e.key==='Escape')status.hidden=true;});
})();

// Keep the source artwork on desktop and reflow content for mobile or edited copy.
(()=>{
 const page=document.getElementById('contact-page');
 const reflow=()=>{const flow=true;document.body.classList.toggle('contact-flow',flow);if(flow)page.querySelectorAll('.semantic-text').forEach(n=>{for(const c of n.childNodes)if(c.nodeType===3)c.nodeValue=c.nodeValue.replace(/\u00a0/g,' ');});if(flow){document.getElementById('page-viewport').style.height='auto';page.style.transform='none';}else page.style.transform='';};
 const logo=document.createElement('img');logo.className='contact-logo';logo.src='assets/f1a41cef-80e0-47cd-9f32-ef1ed44f1dd8.svg';logo.alt='';page.querySelector('[data-node-id="455:47646"]').append(logo);
 const footerLogo=logo.cloneNode();footerLogo.className='contact-footer-logo';footerLogo.src='assets/571752cb-f608-4d13-aefe-047a80cf65f2.svg';page.querySelector('[data-node-id="455:47970"]').prepend(footerLogo);
 const form=document.getElementById('project-form');const note=document.createElement('p');note.className='contact-form-notice';note.id='form-availability';note.append('Online submission is not available yet. Please email ');const email=document.createElement('a');email.href='mailto:hello@nexora.io';email.textContent='hello@nexora.io';note.append(email,' to discuss your project.');form.prepend(note);form.setAttribute('aria-describedby',note.id);
 for(const input of form.querySelectorAll('.field>input,.description>textarea')){const label=document.createElement('label');label.className='contact-field-label';input.id='contact-field-'+[...form.querySelectorAll('input,textarea')].indexOf(input);label.htmlFor=input.id;label.textContent=input.getAttribute('aria-label');input.before(label);}
 for(const faq of page.querySelectorAll('.faq-item')){faq.removeAttribute('aria-disabled');faq.tabIndex=0;const panel=document.getElementById(faq.getAttribute('aria-controls'));if(!panel)continue;faq.setAttribute('aria-expanded','false');faq.querySelector('[data-name="Plus"]')?.setAttribute('aria-hidden','true');faq.addEventListener('click',()=>{const open=faq.getAttribute('aria-expanded')!=='true';faq.setAttribute('aria-expanded',String(open));panel.hidden=!open;});}

 reflow();addEventListener('resize',reflow);document.addEventListener('cms:content-loaded',reflow);
})();
