if(!(await window.HSLAuth.isLogged())){
  location.replace('login.html');
  throw new Error('Session administrateur requise.');
}
document.body.style.visibility='visible';
const KEY='hsl-content-v1';
const ICONS=[['user','Personne'],['helmet','Casque'],['column','Poteau'],['beam','Poutre'],['slab','Dalle'],['concrete','Béton armé'],['brick','Brique / maçonnerie'],['roller','Rouleau / peinture'],['bolt','Électricité'],['crane','Grue'],['square','Équerre'],['plan','Plan / dossier'],['clock','Délais'],['shield','Garantie']];
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const merge=(a,b)=>{if(Array.isArray(a)&&Array.isArray(b))return b.map((v,i)=>merge(a[i],v));if(isObj(a)&&isObj(b)){const o={...a};for(const k in b)o[k]=k in a?merge(a[k],b[k]):b[k];return o}return b};
const clone=o=>JSON.parse(JSON.stringify(o));
const canonical=value=>Array.isArray(value)?value.map(canonical):isObj(value)?Object.keys(value).sort().reduce((out,key)=>(out[key]=canonical(value[key]),out),{}):value;
const contentSignature=value=>JSON.stringify(canonical(value));
const stripObsoleteServiceContent=value=>{
  if(isObj(value?.services))for(const key of ['elements','elementsTitle','elementsSub'])delete value.services[key];
  return value;
};
const DEFAULT=stripObsoleteServiceContent(clone(window.HSL_CONTENT));
let data=clone(DEFAULT);
const status=document.getElementById('status');
const {data:remote,error:loadError}=await window.hslSupabase.from('site_content').select('content,updated_at').eq('id',1).maybeSingle();
if(!loadError&&remote&&remote.content){data=stripObsoleteServiceContent(merge(DEFAULT,remote.content));status.textContent='Contenu chargé depuis Supabase';}
else {
  try{const saved=localStorage.getItem(KEY);if(saved)data=stripObsoleteServiceContent(merge(DEFAULT,JSON.parse(saved)));}catch(_){}
  status.textContent='Supabase indisponible : mode local de secours';
  if(loadError)console.error('Chargement Supabase:',loadError.message);
}
let saveTimer=null;
let remoteSignature=remote?.content?contentSignature(remote.content):null;
let saveRevision=0,savedRevision=0,saveInFlight=null,activeUploads=0;
function save(immediate=false){
  saveRevision++;
  stripObsoleteServiceContent(data);
  try{localStorage.setItem(KEY,JSON.stringify(data));}catch(_){}
  status.textContent='Sauvegarde Supabase en attente…';
  clearTimeout(saveTimer);
  if(immediate)return flushSave();
  return new Promise(resolve=>{saveTimer=setTimeout(()=>{saveTimer=null;flushSave().then(resolve);},650);});
}
async function flushSave(){
  if(saveInFlight){await saveInFlight;if(savedRevision<saveRevision)return flushSave();return savedRevision===saveRevision;}
  const revision=saveRevision,snapshot=stripObsoleteServiceContent(clone(data));
  saveInFlight=(async()=>{
    let lastError=null;
    for(let attempt=0;attempt<3;attempt++){
      let written,error;
      try{({data:written,error}=await window.hslSupabase.from('site_content').upsert({id:1,content:snapshot,updated_at:new Date().toISOString()},{onConflict:'id'}).select('updated_at').single());}
      catch(requestError){lastError=requestError;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));continue;}
      if(!error){remoteSignature=contentSignature(snapshot);savedRevision=revision;status.textContent='Enregistré et partagé sur Supabase à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});return true;}
      lastError=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
    }
    status.textContent='Erreur Supabase : '+(lastError?.message||'sauvegarde impossible');console.error('Sauvegarde Supabase:',lastError?.message);return false;
  })();
  const ok=await saveInFlight;saveInFlight=null;
  if(ok&&savedRevision<saveRevision)return flushSave();
  return ok;
}
let checkingRemote=false;
async function checkRemoteContent(){
  if(checkingRemote||document.visibilityState==='hidden')return;
  checkingRemote=true;
  try{
    const {data:latest,error}=await window.hslSupabase.from('site_content').select('content,updated_at').eq('id',1).maybeSingle();
    if(error||!latest?.content)return;
    const signature=contentSignature(latest.content);
    if(remoteSignature&&signature!==remoteSignature){
      if(savedRevision===saveRevision&&!saveTimer&&!saveInFlight&&!activeUploads)location.reload();
      else status.textContent='Modification distante détectée. Vos changements locaux sont conservés; comparez-les avant d’enregistrer ou d’actualiser pour éviter d’écraser une modification faite sur un autre appareil.';
    }
  }catch(error){console.warn('Synchronisation Supabase:',error);}
  finally{checkingRemote=false;}
}
window.setInterval(checkRemoteContent,15000);
window.addEventListener('focus',checkRemoteContent);
function flushPendingSave(){if(saveTimer){clearTimeout(saveTimer);saveTimer=null;void flushSave();}}
window.addEventListener('pagehide',flushPendingSave);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushPendingSave();else checkRemoteContent();});
function el(tag,attrs={},...kids){const n=document.createElement(tag);for(const k in attrs){if(k==='class')n.className=attrs[k];else if(k.startsWith('on'))n[k]=attrs[k];else n.setAttribute(k,attrs[k])}kids.flat().forEach(c=>n.append(c));return n}

/* Champ simple lié à obj[key] */
function field(obj,key,label,type='text',full=false){
  let input;
  if(type==='area')input=el('textarea',{rows:3});
  else if(type==='icon'){input=el('select');ICONS.forEach(([v,l])=>input.append(el('option',{value:v},l)))}
  else if(type==='image'){return imageField(obj,key,label)}
  else if(type==='list'){return stringListField(obj,key,label)}
  else input=el('input',{type:'text'});
  input.value=obj[key]??'';
  input.addEventListener(type==='icon'?'change':'input',()=>{obj[key]=input.value;save()});
  return el('label',{class:'f'+(full||type==='area'?' full':'')},label,input);
}
function imageField(obj,key,label){
  const box=el('div',{class:'f full'},label);
  const thumb=el('img',{class:'thumb',alt:''});
  const file=el('input',{type:'file',accept:'image/*','aria-label':label});
  const hint=el('small',{class:'admin-note'},'Choisissez une photo depuis cet appareil (ordinateur ou téléphone). Elle sera optimisée, enregistrée dans Supabase et publiée pour tous les visiteurs.');
  const rm=el('button',{type:'button',class:'abtn small danger',onclick:async()=>{obj[key]='';refresh();const ok=await save(true);if(ok)status.textContent='Photo retirée et modification partagée sur tous les appareils.'}},'Retirer la photo');
  const refresh=()=>{if(obj[key]){thumb.src=obj[key];thumb.hidden=false;rm.hidden=false}else{thumb.removeAttribute('src');thumb.hidden=true;rm.hidden=true}};
  file.addEventListener('change',async()=>{
    const f=file.files&&file.files[0];if(!f)return;
    if(!f.type.startsWith('image/')){status.textContent='Choisissez un fichier image.';file.value='';return}
    if(f.size>25*1024*1024){status.textContent='Cette image dépasse 25 Mo. Choisissez un fichier plus léger.';file.value='';return}
    activeUploads++;file.disabled=true;status.textContent='Préparation de la photo…';
    try{
      const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Lecture de la photo impossible.'));reader.onload=()=>resolve(reader.result);reader.readAsDataURL(f)});
      const im=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Ce format d’image ne peut pas être ouvert par le navigateur.'));image.src=source});
      const max=1800,scale=Math.min(1,max/Math.max(im.width,im.height));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(im.width*scale));canvas.height=Math.max(1,Math.round(im.height*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Préparation de l’image impossible.');
      ctx.drawImage(im,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.82));if(!blob)throw new Error('Compression de la photo impossible.');
      status.textContent='Téléversement de la photo vers Supabase…';
      const token=crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2),path=`${Date.now()}-${token}.jpg`;
      const {error}=await window.hslSupabase.storage.from('hsl-media').upload(path,blob,{contentType:'image/jpeg',upsert:false});
      if(error)throw new Error('Erreur Storage : '+error.message);
      obj[key]=window.hslSupabase.storage.from('hsl-media').getPublicUrl(path).data.publicUrl;refresh();
      status.textContent='Photo téléversée; enregistrement du contenu partagé…';
      if(!await save(true))throw new Error('La photo est téléversée, mais le contenu n’a pas été enregistré. Cliquez sur « Sauvegarder maintenant » pour réessayer.');
      status.textContent='Photo enregistrée dans Supabase et disponible sur tous les appareils.';
    }catch(error){status.textContent=error.message||'Téléversement de la photo impossible.';console.error('Import photo:',error)}
    finally{activeUploads--;file.disabled=false;file.value=''}
  });
  box.append(thumb,file,hint,rm);refresh();return box;
}
function stringListField(obj,key,label){
  if(!Array.isArray(obj[key]))obj[key]=[];
  const box=el('div',{class:'f full service-elements-editor'},el('strong',{class:'admin-field-title'},label));
  const rows=el('div');
  function draw(){
    rows.innerHTML='';
    obj[key].forEach((value,i)=>{
      const input=el('input',{type:'text','aria-label':`${label} — élément ${i+1}`});input.value=value;
      input.addEventListener('input',()=>{obj[key][i]=input.value;save()});
      const remove=el('button',{type:'button',class:'abtn small danger',onclick:()=>{obj[key].splice(i,1);save();draw()}},'Supprimer');
      rows.append(el('div',{class:'admin-line-row'},input,remove));
    });
  }
  draw();
  box.append(rows,el('button',{type:'button',class:'abtn small',onclick:()=>{obj[key].push('');save();draw()}},'+ Ajouter un élément'));
  return box;
}
/* Liste d’objets (ajout / suppression) */
function listOf(arr,title,itemLabel,fields,blank,options={}){
  const wrap=el('div',{class:'lst'},el('h3',{},title));
  const body=el('div');wrap.append(body);
  function draw(){
    body.innerHTML='';
    arr.forEach((it,i)=>{
      const fallbackLabel=itemLabel+' '+(i+1);
      if(options.titleKey&&!String(it[options.titleKey]||'').trim())it[options.titleKey]=fallbackLabel;
      const heading=el('b',{},options.titleKey?(String(it[options.titleKey]||'').trim()||fallbackLabel):fallbackLabel);
      const grid=el('div',{class:'fgrid'});
      fields.forEach(f=>{
        const control=field(it,f[0],f[1],f[2]);
        if(options.titleKey===f[0]){
          const input=control.querySelector('input,textarea');
          if(input)input.addEventListener('input',()=>{heading.textContent=input.value.trim()||fallbackLabel;});
        }
        grid.append(control);
      });
      body.append(el('div',{class:'lst-item'},
        el('div',{class:'row'},heading,el('button',{type:'button',class:'abtn small danger',onclick:()=>{if(confirm('Supprimer cet élément ?')){arr.splice(i,1);save();draw()}}},'Supprimer')),grid));
    });
    if(!arr.length)body.append(el('p',{class:'admin-note'},'Aucun élément. Cette partie ne s’affichera pas sur le site.'));
  }
  draw();
  wrap.append(el('button',{type:'button',class:'abtn small',onclick:()=>{
    const item=clone(blank);
    if(options.titleKey){
      const prefix=options.defaultTitlePrefix||itemLabel;
      const escapedPrefix=prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const titlePattern=new RegExp('^'+escapedPrefix+'\\s+(\\d+)$','i');
      let nextNumber=arr.length+1;
      arr.forEach(existing=>{
        const match=String(existing[options.titleKey]||'').match(titlePattern);
        if(match)nextNumber=Math.max(nextNumber,Number(match[1])+1);
      });
      item[options.titleKey]=`${prefix} ${nextNumber}`;
    }
    arr.push(item);save();draw();
  }},'+ Ajouter'));
  return wrap;
}
/* Liste de textes simples */
function listStr(arr,title,add){
  const wrap=el('div',{class:'lst'},el('h3',{},title));const body=el('div');wrap.append(body);
  function draw(){
    body.innerHTML='';
    arr.forEach((v,i)=>{
      const inp=el('input',{type:'text'});inp.value=v;inp.addEventListener('input',()=>{arr[i]=inp.value;save()});
      body.append(el('div',{class:'lst-str'},inp,el('button',{type:'button',class:'abtn small danger',onclick:()=>{arr.splice(i,1);save();draw()}},'Supprimer')));
    });
  }
  draw();wrap.append(el('button',{type:'button',class:'abtn small',onclick:()=>{arr.push('');save();draw()}},add));return wrap;
}
function section(title,icon,key,hideKey,...content){
  const d=el('details',{class:'sec'});
  d.append(el('summary',{},title));
  const body=el('div',{class:'sec-body'});
  if(hideKey){
    const cb=el('input',{type:'checkbox'});cb.checked=!data.hidden[hideKey];
    cb.addEventListener('change',()=>{if(cb.checked)delete data.hidden[hideKey];else data.hidden[hideKey]=true;save()});
    body.append(el('label',{class:'vis'},cb,'Afficher cette section sur le site (décochez pour la supprimer du site)'));
  }
  body.append(...content);d.append(body);return d;
}
const grid=(...f)=>el('div',{class:'fgrid'},...f);

function build(){
  const ed=document.getElementById('editor');ed.innerHTML='';
  const D=data;
  ed.append(
    section('Accueil — bandeau principal','helmet','hero',null,grid(
      field(D.hero,'eyebrow','Petit texte au-dessus du titre'),field(D.hero,'title1','Titre — ligne 1'),field(D.hero,'title2','Titre — ligne 2 (en or)'),
      field(D.hero,'cta1','Bouton principal'),field(D.hero,'cta2','Bouton secondaire'),field(D.hero,'lead','Texte d’introduction','area'),field(D.hero,'backgroundImage','Photo de fond de l’accueil','image'))),

    section('À propos','plan','about','about',grid(
      field(D.about,'tag','Étiquette de section'),field(D.about,'link','Texte du lien'),field(D.about,'title1','Titre — ligne 1'),field(D.about,'title2','Titre — ligne 2 (en or)'),
      field(D.about,'p1','Paragraphe 1','area'),field(D.about,'p2','Paragraphe 2','area')),
      listOf(D.about.principles,'Points forts','Point',[['icon','Icône','icon'],['title','Titre'],['text','Texte','area'],['photo','Photo de la carte','image']],{icon:'shield',title:'',text:'',photo:''})),

    section('Organigramme','user','orgChart','orgChart',grid(
      field(D.orgChart,'tag','Étiquette de section'),field(D.orgChart,'title','Titre'),field(D.orgChart,'intro','Texte d’introduction','area')),
      listOf(D.orgChart.members,'Membres de l’équipe (du PCA aux équipes)','Membre',[['name','Nom'],['role','Fonction'],['icon','Icône de remplacement','icon'],['photo','Photo (facultative)','image']],{name:'',role:'',icon:'user',photo:''})),

    section('Services','crane','services','services',grid(
      field(D.services,'tag','Étiquette de section'),field(D.services,'title1','Titre — ligne 1'),field(D.services,'title2','Titre — ligne 2 (en or)'),field(D.services,'intro','Texte d’introduction','area'),
      field(D.services,'note','Note en bas de section','area'),field(D.services,'bannerImage','Photo de fond du bandeau Services','image')),
      listOf(D.services.cards,'Cartes de services','Service',[['icon','Icône','icon'],['title','Titre'],['text','Description','area'],['image','Photo de cette prestation','image'],['elements','Éléments affichés dans « Nos prestations »','list']],{icon:'brick',title:'',text:'',image:'',elements:[]})),

    section('Réalisations','shield','refs','refs',grid(
      field(D.refs,'tag','Étiquette de section'),field(D.refs,'title1','Titre — ligne 1'),field(D.refs,'title2','Titre — ligne 2 (en or)'),field(D.refs,'intro','Texte d’introduction','area'),
      field(D.refs,'noticeTitle','Titre du message « galerie vide »'),field(D.refs,'noticeText','Texte du message « galerie vide »','area')),
      listOf(D.refs.items,'Projets réalisés (ajoutez uniquement des références vérifiées)','Projet',[['title','Nom / numéro affiché sur la carte (modifiable)'],['location','Lieu'],['description','Description','area'],['image','Photo','image']],{title:'',location:'',description:'',image:''},{titleKey:'title',defaultTitlePrefix:'Projet'})),

    section('Demande de devis','plan','quote','quote',grid(
      field(D.quote,'tag','Étiquette de section'),field(D.quote,'title1','Titre — ligne 1'),field(D.quote,'title2','Titre — ligne 2 (en or)'),field(D.quote,'text','Texte d’introduction','area')),
      listStr(D.quote.benefits,'Avantages (liste à cocher)','+ Ajouter un avantage'),
      listStr(D.quote.types,'Types de projet proposés dans le formulaire','+ Ajouter un type')),

    section('Contact','phone','contact','contact',grid(
      field(D.contact,'tag','Étiquette de section'),field(D.contact,'title1','Titre — ligne 1'),field(D.contact,'title2','Titre — ligne 2 (en or)'),field(D.contact,'text','Texte d’introduction','area'),
      field(D.contact,'phoneDisplay','Téléphone affiché (laisser vide pour masquer)'),field(D.contact,'whatsapp','Numéro WhatsApp principal (chiffres, avec indicatif : 221…)'),
      field(D.contact,'whatsappAdditional','Deuxième numéro WhatsApp (chiffres, avec indicatif : 221…)'),
      field(D.contact,'email','Email (laisser vide pour masquer)'),field(D.contact,'zone','Zone d’intervention (laisser vide pour masquer)'))),

    section('Bandeau final doré','helmet','closing','closing',grid(
      field(D.closing,'label','Petit texte'),field(D.closing,'button','Texte du bouton'),field(D.closing,'title1','Titre — début'),field(D.closing,'title2','Titre — fin (en blanc)')))
  );
}
build();
const saveNow=document.getElementById('save-now');
if(saveNow)saveNow.addEventListener('click',async()=>{saveNow.disabled=true;status.textContent='Sauvegarde du contenu partagé…';const ok=await save(true);saveNow.disabled=false;if(ok)status.textContent='Toutes les modifications sont enregistrées et partagées sur Supabase.'});
const first=document.querySelector('#editor .sec');if(first)first.open=true;

document.getElementById('dl').addEventListener('click',()=>{
  const txt='/* Sauvegarde du contenu HSL — exportée depuis Supabase */\nwindow.HSL_CONTENT = '+JSON.stringify(data,null,2)+';\n';
  const a=el('a',{href:URL.createObjectURL(new Blob([txt],{type:'text/javascript'})),download:'content-backup.js'});
  document.body.append(a);a.click();a.remove();
  status.textContent='Sauvegarde JSON téléchargée';
});
document.getElementById('reset').addEventListener('click',()=>{
  if(confirm('Remplacer le contenu Supabase par les valeurs initiales du site ?')){data=clone(DEFAULT);build();save()}
});
document.getElementById('expand').addEventListener('click',function(){
  const all=[...document.querySelectorAll('#editor .sec')],open=all.some(d=>!d.open);
  all.forEach(d=>d.open=open);this.textContent=open?'Tout replier':'Tout déplier';
});
document.getElementById('logout').addEventListener('click',async()=>{await window.HSLAuth.logout();location.href='login.html'});
window.HSLAuth.currentUser().then(email=>{document.getElementById('pw-user').value=email});
document.getElementById('pw-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const msg=document.getElementById('pw-msg'),n=document.getElementById('pw-new').value,button=e.currentTarget.querySelector('button[type="submit"]');
  if(n.length<8){msg.textContent='Le nouveau mot de passe doit contenir au moins 8 caractères.';return}
  if(n!==document.getElementById('pw-new2').value){msg.textContent='Les deux mots de passe ne correspondent pas.';return}
  button.disabled=true;msg.textContent='Mise à jour…';
  const result=await window.HSLAuth.changePassword(document.getElementById('pw-old').value,n);
  msg.textContent=result.ok?'Mot de passe Supabase mis à jour.':result.msg;
  if(result.ok)['pw-old','pw-new','pw-new2'].forEach(id=>document.getElementById(id).value='');
  button.disabled=false;
});

const requestStatus=document.getElementById('requests-status'),requestWrap=document.getElementById('quote-requests');
async function loadQuoteRequests(){
  requestStatus.textContent='Chargement des demandes…';requestWrap.innerHTML='';
  const {data:requests,error}=await window.hslSupabase.from('quote_requests').select('id,created_at,name,phone,project,location,details,status').order('created_at',{ascending:false}).limit(100);
  if(error){requestStatus.textContent='Erreur de lecture : '+error.message;return}
  if(!requests.length){requestStatus.textContent='Aucune demande enregistrée pour le moment.';return}
  requestStatus.textContent=`${requests.length} demande(s) récente(s) (100 maximum affichées).`;
  requests.forEach(r=>{
    const date=new Date(r.created_at).toLocaleString('fr-FR');
    const card=el('div',{class:'lst-item'});
    const select=el('select');[['new','Nouvelle'],['in_progress','En cours'],['closed','Clôturée']].forEach(([v,label])=>select.append(el('option',{value:v},label)));
    select.value=r.status;select.addEventListener('change',async()=>{
      const {error}=await window.hslSupabase.from('quote_requests').update({status:select.value}).eq('id',r.id);
      if(error){requestStatus.textContent='Erreur de mise à jour : '+error.message;select.value=r.status;}
      else{r.status=select.value;requestStatus.textContent='Statut de la demande mis à jour.';}
    });
    const row=el('div',{class:'row'},el('b',{},`${date} — ${r.name}`),select);
    card.append(row,el('p',{},`Téléphone : ${r.phone} | Projet : ${r.project} | Lieu : ${r.location}`),el('p',{},r.details));
    requestWrap.append(card);
  });
}
document.getElementById('refresh-requests').addEventListener('click',loadQuoteRequests);
loadQuoteRequests();
