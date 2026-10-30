/* ===== Contenu partagé chargé depuis Supabase (content.js sert de secours) ===== */
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=(n,c='')=>`<svg class="icon ${c}"><use href="#i-${e(n)}"/></svg>`;
let C=window.HSL_CONTENT||{};
const $=s=>document.querySelector(s);
const digits=s=>String(s||'').replace(/\D/g,'');

function renderContent(){
  if(!C.hero)return;
  const h=C.hero;
  const hero=$('.hero');let heroImage=hero.querySelector('.hero-background');
  if(h.backgroundImage){if(!heroImage){heroImage=document.createElement('img');heroImage.className='hero-background';heroImage.alt='';heroImage.setAttribute('aria-hidden','true');hero.prepend(heroImage)}heroImage.src=h.backgroundImage}else if(heroImage)heroImage.remove();
  $('.hero-copy').innerHTML=`<p class="eyebrow">${ic('helmet')} ${e(h.eyebrow)}</p><h1>${e(h.title1)}<br><em>${e(h.title2)}</em></h1><p class="hero-lead">${e(h.lead)}</p><div class="hero-actions"><a class="btn btn-gold" href="#devis">${e(h.cta1)} ${ic('arrow','ico-arrow')}</a><a class="btn btn-outline" href="#realisations">${e(h.cta2)}</a></div>`;

  const a=C.about;
  $('#apropos .wrap').innerHTML=`<div class="section-tag">${ic('helmet')} ${e(a.tag)}</div><div class="intro-content"><h2>${e(a.title1)}<br><em>${e(a.title2)}</em></h2><div class="intro-text">${a.p1?`<p>${e(a.p1)}</p>`:''}${a.p2?`<p>${e(a.p2)}</p>`:''}${a.link?`<a class="text-link" href="#services">${e(a.link)} ${ic('arrow-r')}</a>`:''}</div></div>${a.principles.length?`<div class="principles">${a.principles.map(p=>`<article><div class="principle-image" aria-hidden="true">${p.photo?`<img class="principle-photo" src="${e(p.photo)}" alt="">`:''}<div class="ico-tile">${ic(p.icon)}</div></div><div class="principle-content"><h3>${e(p.title)}</h3><p>${e(p.text)}</p>${ic('arrow','principle-arrow')}</div></article>`).join('')}</div>`:''}`;

  const o=C.orgChart;
  const orgCard=(member,lead=false)=>`<article class="org-card${lead?' org-card-lead':''}"><div class="org-avatar">${member.photo?`<img src="${e(member.photo)}" alt="Photo de ${e(member.name||member.role)}">`:ic(member.icon||'user')}</div><div class="org-card-copy"><span class="org-role">${e(member.role)}</span><h3>${e(member.name||'Nom à renseigner')}</h3></div></article>`;
  const orgMembers=o.members||[];
  $('#organigramme .wrap').innerHTML=`<div class="section-tag">${ic('user')} ${e(o.tag)}</div><div class="org-heading"><h2>${e(o.title)}</h2><p>${e(o.intro)}</p></div><div class="org-chart-scroll" role="region" aria-label="Organigramme défilant" tabindex="0"><p class="org-scroll-hint">Faites glisser l’organigramme pour voir toute l’équipe.</p><div class="org-chart" aria-label="Organigramme de l’entreprise">${orgMembers.slice(0,3).map((m,i)=>`<div class="org-tier${i===2?' org-tier-assistant':''}">${orgCard(m,true)}</div>`).join('')}${orgMembers.length>3?`<div class="org-team">${orgMembers.slice(3).map(m=>orgCard(m)).join('')}</div>`:''}</div></div>`;
  const orgScroller=$('#organigramme .org-chart-scroll');
  if(orgScroller&&window.matchMedia('(max-width: 900px)').matches){
    requestAnimationFrame(()=>{orgScroller.scrollLeft=(orgScroller.scrollWidth-orgScroller.clientWidth)/2});
  }

  const s=C.services;
  const bannerImage=s.bannerImage?`<img class="services-banner-photo" src="${e(s.bannerImage)}" alt="" aria-hidden="true">`:'';
  $('#services .wrap').innerHTML=`<div class="section-heading services-banner">${bannerImage}<div><div class="section-tag">${ic('crane')} ${e(s.tag)}</div><h2>${e(s.title1)}<br><em>${e(s.title2)}</em></h2></div><p>${e(s.intro)}</p></div>`
   +(s.cards.length?`<div class="services-layout"><nav class="service-sidebar" aria-label="Catégories de services"><p class="service-sidebar-title">Nos prestations</p><button type="button" class="service-filter active" data-service-index="all" aria-pressed="true">${ic('helmet')} Toutes les prestations</button>${s.cards.map((c,i)=>`<button type="button" class="service-filter" data-service-index="${i}" aria-pressed="false">${ic(c.icon)} ${e(c.title)}</button>`).join('')}<div class="service-elements-panel" id="service-elements" aria-live="polite"></div></nav><div class="service-grid" id="service-cards">${s.cards.map((c,i)=>`<article class="service-card" id="service-item-${i+1}" data-service-index="${i}"><div class="service-image service-image-${i%4+1}" aria-hidden="true">${c.image?`<img src="${e(c.image)}" alt="">`:''}</div><div class="service-card-content"><h3>${e(c.title)}</h3><p>${e(c.text)}</p><a class="service-more" href="#devis">En savoir plus ${ic('arrow-r')}</a></div></article>`).join('')}</div></div>`:'')
   +(s.note?`<p class="small-disclaimer">${e(s.note)}</p>`:'');
  const serviceFilters=[...document.querySelectorAll('#services .service-filter')];
  const serviceCards=[...document.querySelectorAll('#services .service-card')];
  const serviceElements=document.getElementById('service-elements');
  function selectService(index){
    serviceFilters.forEach(button=>{const active=button.dataset.serviceIndex===String(index);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
    const serviceGrid=document.getElementById('service-cards');if(serviceGrid)serviceGrid.classList.toggle('is-filtered',index!=='all');
    serviceCards.forEach(card=>{card.hidden=index!=='all'&&card.dataset.serviceIndex!==String(index)});
    const groups=index==='all'?s.cards.map(card=>card):[s.cards[Number(index)]].filter(Boolean);
    serviceElements.innerHTML=groups.map(card=>`<section class="service-elements-group"><strong>${e(card.title)}</strong>${card.elements&&card.elements.length?`<ul>${card.elements.map(item=>`<li>${e(item)}</li>`).join('')}</ul>`:'<p>Éléments à renseigner dans l’administration.</p>'}</section>`).join('');
  }
  serviceFilters.forEach(button=>button.addEventListener('click',()=>selectService(button.dataset.serviceIndex)));
  if(serviceElements)selectService('all');

  const r=C.refs;
  const slots=r.items.length?r.items.map(it=>`<article class="reference-slot${it.image?' has-photo':''}">${it.image?`<img class="reference-photo" src="${e(it.image)}" alt="Photo du projet ${e(it.title)} à ${e(it.location)}" loading="lazy">`:ic('helmet','slot-ico')}<div class="reference-copy"><span>${e(it.location)}</span><strong>${e(it.title)}</strong>${it.description?`<p>${e(it.description)}</p>`:''}</div></article>`).join('')
   :['helmet','crane','slab'].map((n,i)=>`<article class="reference-slot">${ic(n,'slot-ico')}<div class="reference-copy"><span>Photo à ajouter</span><strong>Projet / chantier 0${i+1}</strong></div></article>`).join('');
  $('#realisations .wrap').innerHTML=`<div class="section-heading"><div><div class="section-tag">${ic('shield')} ${e(r.tag)}</div><h2>${e(r.title1)}<br><em>${e(r.title2)}</em></h2></div><p>${e(r.intro)}</p></div>`
   +(r.items.length?'':`<div class="reference-notice"><div class="ico-tile">${ic('plus')}</div><div><h3>${e(r.noticeTitle)}</h3><p>${e(r.noticeText)}</p><a class="text-link" href="#contact">Envoyer vos références ${ic('arrow-r')}</a></div></div>`)
   +`<div class="reference-slots">${slots}</div>`;

  const q=C.quote;
  $('.quote-copy').innerHTML=`<div class="section-tag">${ic('plan')} ${e(q.tag)}</div><h2>${e(q.title1)}<br><em>${e(q.title2)}</em></h2><p>${e(q.text)}</p>${q.benefits.map(b=>`<div class="quote-benefit">${ic('check')} ${e(b)}</div>`).join('')}`;
  const sel=$('#quote-form select[name="project"]');
  if(sel)sel.innerHTML='<option value="">Choisir une catégorie</option>'+q.types.map(t=>`<option>${e(t)}</option>`).join('');

  const k=C.contact, wa=digits(k.whatsapp), waAdditional=digits(k.whatsappAdditional);
  const waAdditionalLabel=waAdditional.length===12?`+${waAdditional.slice(0,3)} ${waAdditional.slice(3,5)} ${waAdditional.slice(5,8)} ${waAdditional.slice(8,10)} ${waAdditional.slice(10)}`:`+${waAdditional}`;
  $('#contact .wrap').innerHTML=`<div class="section-tag">${ic('phone')} ${e(k.tag)}</div><div class="contact-layout"><div><h2>${e(k.title1)}<br><em>${e(k.title2)}</em></h2><p>${e(k.text)}</p></div><div class="contact-details">`
   +(wa?`<a href="https://wa.me/${wa}" target="_blank" rel="noopener"><div class="ico-tile">${ic('chat')}</div><div><span>WhatsApp</span><strong>${e(k.phoneDisplay||`+${wa}`)}</strong></div>${ic('arrow','c-arrow')}</a>`:'')
   +(waAdditional?`<a href="https://wa.me/${waAdditional}" target="_blank" rel="noopener"><div class="ico-tile">${ic('chat')}</div><div><span>WhatsApp</span><strong>${e(waAdditionalLabel)}</strong></div>${ic('arrow','c-arrow')}</a>`:'')
   +(k.email?`<a href="mailto:${e(k.email)}"><div class="ico-tile">${ic('mail')}</div><div><span>Email</span><strong>${e(k.email)}</strong></div>${ic('arrow','c-arrow')}</a>`:'')
   +(k.zone?`<div class="contact-zone"><div class="ico-tile">${ic('pin')}</div><div><span>Adresse</span><strong>${e(k.zone)}</strong></div></div>`:'')
   +`</div></div>`;
  const wf=$('.whatsapp-float');if(wf&&wa)wf.href=`https://wa.me/${wa}?text=Bonjour%20HSL%20G%C3%A9nie%20Civil%2C%20je%20souhaite%20parler%20d%E2%80%99un%20projet.`;

  const c=C.closing;
  $('.closing').innerHTML=`<div class="closing-mark">${ic('helmet')}</div><div><p>${e(c.label)}</p><h2>${e(c.title1)} <em>${e(c.title2)}</em></h2></div><a class="btn btn-dark" href="#devis">${e(c.button)} ${ic('arrow','ico-arrow')}</a>`;

  /* Sections masquées depuis l’administration */
  const hid=C.hidden||{};
  [['about','#apropos'],['orgChart','#organigramme'],['services','#services'],['refs','#realisations'],['quote','#devis'],['contact','#contact'],['closing','.closing']].forEach(([key,sel])=>{
    const el=$(sel);if(el)el.hidden=!!hid[key];
    if(sel.startsWith('#'))document.querySelectorAll(`.nav a[href="${sel}"]`).forEach(l=>{if(!l.classList.contains('btn'))l.hidden=!!hid[key]});
  });
}
try{renderContent()}catch(err){console.error('Contenu : affichage par défaut conservé',err)}

/* ===== Menu mobile ===== */
const menuToggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
function setMenu(open){
  if(!menuToggle||!nav)return;
  nav.classList.toggle('open',open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
}
if(menuToggle&&nav){
  menuToggle.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!menuToggle.contains(e.target))setMenu(false)});
}

/* ===== En-tête : réduction au défilement + barre de progression ===== */
const header=document.querySelector('.site-header');
let ticking=false;
function onScroll(){
  const y=window.scrollY;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  if(header){
    header.classList.toggle('scrolled',y>40);
    header.style.setProperty('--p',max>0?Math.min(y/max,1).toFixed(4):0);
  }
  ticking=false;
}
window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
onScroll();

/* ===== Lien actif selon la section visible ===== */
const links=[...document.querySelectorAll('.nav a[href^="#"]:not(.btn)')];
const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const l=map.get(en.target.id);if(l)l.classList.add('active');
      }
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  map.forEach((_,id)=>{const s=document.getElementById(id);if(s)io.observe(s)});
}

/* ===== Année du pied de page ===== */

/* ===== Demande de devis : insertion Supabase puis ouverture WhatsApp ===== */
const form=document.getElementById('quote-form');
if(form){
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const data=new FormData(form),errorNode=document.getElementById('quote-error'),button=form.querySelector('button[type="submit"]');
    const request={name:String(data.get('name')||'').trim(),phone:String(data.get('phone')||'').trim(),project:String(data.get('project')||'').trim(),location:String(data.get('location')||'').trim(),details:String(data.get('details')||'').trim()};
    if(request.phone.replace(/\D/g,'').length<6){errorNode.textContent='Veuillez saisir un numéro de téléphone valide.';return}
    const whatsapp=digits((C.contact||{}).whatsapp)||'221778762082';
    const message=`Bonjour HSL Génie Civil, je souhaite demander un devis.\n\nNom : ${request.name}\nTéléphone : ${request.phone}\nType de projet : ${request.project}\nLocalisation : ${request.location}\nDescription : ${request.details}`;
    const whatsappUrl=`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;
    button.disabled=true;errorNode.classList.remove('is-success');errorNode.textContent='Enregistrement de votre demande…';
    let saveError=null;
    try{if(!window.hslSupabase)throw new Error('Connexion Supabase indisponible.');({error:saveError}=await window.hslSupabase.from('quote_requests').insert(request));}
    catch(error){saveError=error}
    if(saveError){console.error('Enregistrement du devis impossible:',saveError.message||saveError);errorNode.textContent='La demande n’a pas pu être enregistrée dans la base. WhatsApp va tout de même s’ouvrir pour transmettre votre message.';}
    else{errorNode.classList.add('is-success');errorNode.textContent='Demande enregistrée. WhatsApp va s’ouvrir ; appuyez sur Envoyer pour la transmettre à HSL.';form.reset();}
    button.disabled=false;
    if(popup)popup.location.href=whatsappUrl;else window.location.href=whatsappUrl;
  });
}
