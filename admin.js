const KEY='hsl-content-v1';
const ICONS=[['user','Personne'],['helmet','Casque'],['column','Poteau'],['beam','Poutre'],['slab','Dalle'],['concrete','Béton armé'],['brick','Brique / maçonnerie'],['roller','Rouleau / peinture'],['bolt','Électricité'],['crane','Grue'],['square','Équerre'],['plan','Plan / dossier'],['clock','Délais'],['shield','Garantie']];
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const merge=(a,b)=>{const o={...a};for(const k in b)o[k]=isObj(a[k])&&isObj(b[k])?merge(a[k],b[k]):b[k];return o};
const clone=o=>JSON.parse(JSON.stringify(o));
const DEFAULT=clone(window.HSL_CONTENT);
let data=clone(DEFAULT);
try{
  const s=localStorage.getItem(KEY);
  if(s){
    data=merge(data,JSON.parse(s));
    if(data.contact&&data.contact.zone==='Dakar, Sénégal'){
      data.contact.zone='Cambéréne / Dakar, Sénégal';
      localStorage.setItem(KEY,JSON.stringify(data));
    }
  }
}catch(_){}
const status=document.getElementById('status');

function save(){
  try{localStorage.setItem(KEY,JSON.stringify(data));status.textContent='Enregistré sur cet appareil à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
  catch(_){status.textContent='Enregistrement impossible : stockage plein (photos trop lourdes ?)'}
}
function el(tag,attrs={},...kids){const n=document.createElement(tag);for(const k in attrs){if(k==='class')n.className=attrs[k];else if(k.startsWith('on'))n[k]=attrs[k];else n.setAttribute(k,attrs[k])}kids.flat().forEach(c=>n.append(c));return n}

/* Champ simple lié à obj[key] */
function field(obj,key,label,type='text',full=false){
  let input;
  if(type==='area')input=el('textarea',{rows:3});
  else if(type==='icon'){input=el('select');ICONS.forEach(([v,l])=>input.append(el('option',{value:v},l)))}
  else if(type==='image'){return imageField(obj,key,label)}
  else input=el('input',{type:'text'});
  input.value=obj[key]??'';
  input.addEventListener(type==='icon'?'change':'input',()=>{obj[key]=input.value;save()});
  return el('label',{class:'f'+(full||type==='area'?' full':'')},label,input);
}
function imageField(obj,key,label){
  const box=el('div',{class:'f full'},label);
  const thumb=el('img',{class:'thumb',alt:''});
  const refresh=()=>{if(obj[key]){thumb.src=obj[key];thumb.hidden=false;rm.hidden=false}else{thumb.hidden=true;rm.hidden=true}};
  const file=el('input',{type:'file',accept:'image/*'});
  const rm=el('button',{type:'button',class:'abtn small danger',onclick:()=>{obj[key]='';save();refresh()}},'Retirer la photo');
  file.addEventListener('change',()=>{
    const f=file.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{const im=new Image();im.onload=()=>{
      const max=900,sc=Math.min(1,max/Math.max(im.width,im.height));
      const c=document.createElement('canvas');c.width=im.width*sc;c.height=im.height*sc;
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      obj[key]=c.toDataURL('image/jpeg',.72);save();refresh();
    };im.src=r.result};r.readAsDataURL(f);
  });
  box.append(thumb,file,rm);refresh();return box;
}
/* Liste d’objets (ajout / suppression) */
function listOf(arr,title,itemLabel,fields,blank){
  const wrap=el('div',{class:'lst'},el('h3',{},title));
  const body=el('div');wrap.append(body);
  function draw(){
    body.innerHTML='';
    arr.forEach((it,i)=>{
      const grid=el('div',{class:'fgrid'});fields.forEach(f=>grid.append(field(it,f[0],f[1],f[2])));
      body.append(el('div',{class:'lst-item'},
        el('div',{class:'row'},el('b',{},itemLabel+' '+(i+1)),el('button',{type:'button',class:'abtn small danger',onclick:()=>{if(confirm('Supprimer cet élément ?')){arr.splice(i,1);save();draw()}}},'Supprimer')),grid));
    });
    if(!arr.length)body.append(el('p',{class:'admin-note'},'Aucun élément. Cette partie ne s’affichera pas sur le site.'));
  }
  draw();
  wrap.append(el('button',{type:'button',class:'abtn small',onclick:()=>{arr.push(clone(blank));save();draw()}},'+ Ajouter'));
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
      field(D.hero,'cta1','Bouton principal'),field(D.hero,'cta2','Bouton secondaire'),field(D.hero,'lead','Texte d’introduction','area'))),

    section('À propos','plan','about','about',grid(
      field(D.about,'tag','Étiquette de section'),field(D.about,'link','Texte du lien'),field(D.about,'title1','Titre — ligne 1'),field(D.about,'title2','Titre — ligne 2 (en or)'),
      field(D.about,'p1','Paragraphe 1','area'),field(D.about,'p2','Paragraphe 2','area')),
      listOf(D.about.principles,'Points forts','Point',[['icon','Icône','icon'],['title','Titre'],['text','Texte','area']],{icon:'shield',title:'',text:''})),

    section('Organigramme','user','orgChart','orgChart',grid(
      field(D.orgChart,'tag','Étiquette de section'),field(D.orgChart,'title','Titre'),field(D.orgChart,'intro','Texte d’introduction','area')),
      listOf(D.orgChart.members,'Membres de l’équipe (du PCA aux équipes)','Membre',[['name','Nom'],['role','Fonction'],['icon','Icône de remplacement','icon'],['photo','Photo (facultative)','image']],{name:'',role:'',icon:'user',photo:''})),

    section('Services','crane','services','services',grid(
      field(D.services,'tag','Étiquette de section'),field(D.services,'title1','Titre — ligne 1'),field(D.services,'title2','Titre — ligne 2 (en or)'),field(D.services,'intro','Texte d’introduction','area'),
      field(D.services,'elementsTitle','Titre du bandeau sombre'),field(D.services,'elementsSub','Sous-titre du bandeau'),field(D.services,'note','Note en bas de section','area')),
      listOf(D.services.cards,'Cartes de services','Service',[['icon','Icône','icon'],['title','Titre'],['text','Description','area']],{icon:'brick',title:'',text:''}),
      listOf(D.services.elements,'Éléments du bandeau sombre (poteau, poutre, dalle…)','Élément',[['icon','Icône','icon'],['title','Nom'],['text','Définition','area']],{icon:'column',title:'',text:''})),

    section('Réalisations','shield','refs','refs',grid(
      field(D.refs,'tag','Étiquette de section'),field(D.refs,'title1','Titre — ligne 1'),field(D.refs,'title2','Titre — ligne 2 (en or)'),field(D.refs,'intro','Texte d’introduction','area'),
      field(D.refs,'noticeTitle','Titre du message « galerie vide »'),field(D.refs,'noticeText','Texte du message « galerie vide »','area')),
      listOf(D.refs.items,'Projets réalisés (ajoutez uniquement des références vérifiées)','Projet',[['title','Nom du projet'],['location','Lieu'],['description','Description','area'],['image','Photo','image']],{title:'',location:'',description:'',image:''})),

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

document.getElementById('dl').addEventListener('click',()=>{
  const txt='/* Contenu du site HSL Génie Civil — généré depuis admin.html */\nwindow.HSL_CONTENT = '+JSON.stringify(data,null,2)+';\n';
  const a=el('a',{href:URL.createObjectURL(new Blob([txt],{type:'text/javascript'})),download:'content.js'});
  document.body.append(a);a.click();a.remove();
  status.textContent='content.js téléchargé : remplacez-le sur l’hébergement pour publier';
});
document.getElementById('reset').addEventListener('click',()=>{
  if(confirm('Effacer toutes vos modifications et revenir au contenu du fichier content.js ?')){
    try{localStorage.removeItem(KEY)}catch(_){}
    data=clone(DEFAULT);build();status.textContent='Contenu réinitialisé';
  }
});

/* Section 1 ouverte par défaut + outils */
const first=document.querySelector('#editor .sec');if(first)first.open=true;
document.getElementById('expand').addEventListener('click',function(){
  const all=[...document.querySelectorAll('#editor .sec')],open=all.some(d=>!d.open);
  all.forEach(d=>d.open=open);this.textContent=open?'Tout replier':'Tout déplier';
});
document.getElementById('logout').addEventListener('click',()=>{HSLAuth.logout();location.href='login.html'});
document.getElementById('pw-user').value=HSLAuth.currentUser();
document.getElementById('pw-form').addEventListener('submit',e=>{
  e.preventDefault();
  const msg=document.getElementById('pw-msg'),n=document.getElementById('pw-new').value;
  if(n!==document.getElementById('pw-new2').value){msg.textContent='Les deux mots de passe ne correspondent pas.';return}
  const r=HSLAuth.change(document.getElementById('pw-user').value,document.getElementById('pw-old').value,n);
  msg.textContent=r.ok?'Identifiants mis à jour. Notez-les bien : ils sont propres à ce navigateur.':r.msg;
  if(r.ok)['pw-old','pw-new','pw-new2'].forEach(id=>document.getElementById(id).value='');
});
