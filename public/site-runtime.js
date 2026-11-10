(() => {
 'use strict';
 const defaults={email:'hello@nexora.io',phone:'+1 (555) 000-0000',location:'New York, NY — Global'};
 const valid=value=>{try{return ['https:','http:'].includes(new URL(value).protocol)}catch{return false}};
 const apply=()=>{const config=window.TWO_DIGITALS||{};
  const email=config.email&&config.email!==defaults.email?config.email:null;
  if(email){document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{if(a.getAttribute('href').includes(defaults.email)||a.hasAttribute('data-contact-email'))a.href=a.getAttribute('href').replace(/mailto:[^?]+/,'mailto:'+email)});document.querySelectorAll('[data-contact-email] span,.contact-form-notice a').forEach(n=>{n.textContent=email;if(n.tagName==='A')n.href='mailto:'+email});}
  if(config.phone&&config.phone!==defaults.phone)document.querySelectorAll('[data-contact-phone]').forEach(a=>{a.href='tel:'+config.phone.replace(/[^+\d]/g,'');const text=a.querySelector('span');if(text)text.textContent=config.phone});
  if(config.location&&config.location!==defaults.location)document.querySelectorAll('[data-contact-location] span').forEach(n=>n.textContent=config.location);
  for(const n of document.querySelectorAll('.semantic-text')){for(const key of ['email','phone','location']){const value=config[key];if(value&&value!==defaults[key]&&(n.dataset.configField===key||n.textContent.trim()===defaults[key])){n.dataset.configField=key;n.textContent=value;if(key==='email'){let a=n.closest('a');if(!a){a=document.createElement('a');n.replaceWith(a);a.append(n)}a.href='mailto:'+value;}}}}
  if(valid(config.bookingUrl))document.querySelectorAll('a').forEach(a=>{if(/schedule a discovery call/i.test(a.textContent.replace(/\s+/g,' ').trim()))a.href=config.bookingUrl});
  document.querySelectorAll('[data-social]').forEach(a=>{const url=config.social?.[a.dataset.social];if(valid(url)){a.href=url;a.rel='noopener noreferrer'}});
 };
 window.SiteSettings={apply};apply();document.addEventListener('cms:content-loaded',apply);
})();
