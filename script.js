/* ===== Contenu modifiable : content.js + modifications faites dans admin.html ===== */
const STORE_KEY='hsl-content-v1';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=(n,c='')=>`<svg class="icon ${c}"><use href="#i-${e(n)}"/></svg>`;
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
function merge(a,b){const o={...a};for(const k in b){o[k]=isObj(a[k])&&isObj(b[k])?merge(a[k],b[k]):b[k]}return o}
let C=window.HSL_CONTENT||{};
try{
  const st=localStorage.getItem(STORE_KEY);
  if(st){
    C=merge(C,JSON.parse(st));
    if(C.contact&&C.contact.zone==='Dakar, Sénégal'){
      C.contact.zone='Cambéréne / Dakar, Sénégal';
      localStorage.setItem(STORE_KEY,JSON.stringify(C));
    }
  }
}catch(_){}
const $=s=>document.querySelector(s);
const digits=s=>String(s||'').replace(/\D/g,'');

function renderContent(){
  if(!C.hero)return;
  const h=C.hero;
  $('.hero-copy').innerHTML=`<p class="eyebrow">${ic('helmet')} ${e(h.eyebrow)}</p><h1>${e(h.title1)}<br><em>${e(h.title2)}</em></h1><p class="hero-lead">${e(h.lead)}</p><div class="hero-actions"><a class="btn btn-gold" href="#devis">${e(h.cta1)} ${ic('arrow','ico-arrow')}</a><a class="btn btn-outline" href="#realisations">${e(h.cta2)}</a></div>`;

  const a=C.about;
  $('#apropos .wrap').innerHTML=`<div class="section-tag">${ic('helmet')} ${e(a.tag)}</div><div class="intro-content"><h2>${e(a.title1)}<br><em>${e(a.title2)}</em></h2><div class="intro-text">${a.p1?`<p>${e(a.p1)}</p>`:''}${a.p2?`<p>${e(a.p2)}</p>`:''}${a.link?`<a class="text-link" href="#services">${e(a.link)} ${ic('arrow-r')}</a>`:''}</div></div>${a.principles.length?`<div class="principles">${a.principles.map(p=>`<article><div class="principle-image" aria-hidden="true"><div class="ico-tile">${ic(p.icon)}</div></div><div class="principle-content"><h3>${e(p.title)}</h3><p>${e(p.text)}</p>${ic('arrow','principle-arrow')}</div></article>`).join('')}</div>`:''}`;

  const o=C.orgChart;
  const orgCard=(member,lead=false)=>`<article class="org-card${lead?' org-card-lead':''}"><div class="org-avatar">${member.photo?`<img src="${e(member.photo)}" alt="Photo de ${e(member.name||member.role)}">`:ic(member.icon||'user')}</div><div class="org-card-copy"><span class="org-role">${e(member.role)}</span><h3>${e(member.name||'Nom à renseigner')}</h3></div></article>`;
  const orgMembers=o.members||[];
  $('#organigramme .wrap').innerHTML=`<div class="section-tag">${ic('user')} ${e(o.tag)}</div><div class="org-heading"><h2>${e(o.title)}</h2><p>${e(o.intro)}</p></div><div class="org-chart-scroll" role="region" aria-label="Organigramme défilant" tabindex="0"><p class="org-scroll-hint">Faites glisser l’organigramme pour voir toute l’équipe.</p><div class="org-chart" aria-label="Organigramme de l’entreprise">${orgMembers.slice(0,3).map((m,i)=>`<div class="org-tier${i===2?' org-tier-assistant':''}">${orgCard(m,true)}</div>`).join('')}${orgMembers.length>3?`<div class="org-team">${orgMembers.slice(3).map(m=>orgCard(m)).join('')}</div>`:''}</div></div>`;
  const orgScroller=$('#organigramme .org-chart-scroll');
  if(orgScroller&&window.matchMedia('(max-width: 900px)').matches){
    requestAnimationFrame(()=>{orgScroller.scrollLeft=(orgScroller.scrollWidth-orgScroller.clientWidth)/2});
  }

  const s=C.services;
  $('#services .wrap').innerHTML=`<div class="section-heading services-banner"><div><div class="section-tag">${ic('crane')} ${e(s.tag)}</div><h2>${e(s.title1)}<br><em>${e(s.title2)}</em></h2></div><p>${e(s.intro)}</p></div>`
   +(s.cards.length?`<div class="services-layout"><nav class="service-sidebar" aria-label="Catégories de services"><p class="service-sidebar-title">Nos prestations</p><a class="service-filter active" href="#service-cards">${ic('helmet')} Tous les services ${ic('arrow-r','service-filter-arrow')}</a>${s.cards.map((c,i)=>`<a class="service-filter" href="#service-item-${i+1}">${ic(c.icon)} ${e(c.title)}</a>`).join('')}</nav><div class="service-grid" id="service-cards">${s.cards.map((c,i)=>`<article class="service-card" id="service-item-${i+1}"><div class="service-image service-image-${i%4+1}" aria-hidden="true"></div><div class="service-card-content"><h3>${e(c.title)}</h3><p>${e(c.text)}</p><a class="service-more" href="#devis">En savoir plus ${ic('arrow-r')}</a></div></article>`).join('')}</div></div>`:'')
   +(s.note?`<p class="small-disclaimer">${e(s.note)}</p>`:'');
  document.querySelectorAll('#services .service-filter').forEach(filter=>filter.addEventListener('click',()=>{
    document.querySelectorAll('#services .service-filter').forEach(item=>item.classList.remove('active'));
    filter.classList.add('active');
  }));

  const r=C.refs;
  const slots=r.items.length?r.items.map(it=>{
    const photo=it.image?` has-photo" style="background-image:linear-gradient(180deg,rgba(16,21,28,.05) 35%,rgba(16,21,28,.92)),url('${e(it.image)}')`:'';
    return `<div class="reference-slot${photo}">${it.image?'':ic('helmet','slot-ico')}<span>${e(it.location)}</span><strong>${e(it.title)}</strong>${it.description?`<p>${e(it.description)}</p>`:''}</div>`}).join('')
   :['helmet','crane','slab'].map((n,i)=>`<div class="reference-slot">${ic(n,'slot-ico')}<span>Photo à ajouter</span><strong>Projet / chantier 0${i+1}</strong></div>`).join('');
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

/* ===== Formulaire de devis → message WhatsApp ===== */
const form=document.getElementById('quote-form');
if(form){
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);
    const err=document.getElementById('quote-error');
    const phone=String(d.get('phone')||'').trim();
    if(phone.length<6){err.textContent='Veuillez saisir un numéro de téléphone valide.';return}
    const msg=`Bonjour HSL Génie Civil, je souhaite demander un devis.%0A%0A*Nom :* ${encodeURIComponent(d.get('name'))}%0A*Tél. :* ${encodeURIComponent(phone)}%0A*Type de projet :* ${encodeURIComponent(d.get('project'))}%0A*Localisation :* ${encodeURIComponent(d.get('location'))}%0A*Description :* ${encodeURIComponent(d.get('details'))}`;
    err.textContent='';
    window.open(`https://wa.me/${digits((C.contact||{}).whatsapp)||'221778762082'}?text=${msg}`,'_blank','noopener');
  });
}
