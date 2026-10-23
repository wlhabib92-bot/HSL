/* Authentification de démonstration (côté navigateur). Voir README : ce n’est PAS une vraie sécurité. */
(function(){
  function sha256(str){
    const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const b=new TextEncoder().encode(str),l=b.length,n=((l+9+63)>>6)<<6,m=new Uint8Array(n);
    m.set(b);m[l]=0x80;const dv=new DataView(m.buffer);dv.setUint32(n-4,l*8>>>0);dv.setUint32(n-8,Math.floor(l*8/4294967296));
    let h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const w=new Uint32Array(64),r=(x,k)=>(x>>>k)|(x<<(32-k));
    for(let o=0;o<n;o+=64){
      for(let i=0;i<16;i++)w[i]=dv.getUint32(o+i*4);
      for(let i=16;i<64;i++){const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3),s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
      let [a,bb,c,d,e,f,g,hh]=h;
      for(let i=0;i<64;i++){const S1=r(e,6)^r(e,11)^r(e,25),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K[i]+w[i])|0,S0=r(a,2)^r(a,13)^r(a,22),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
      h=[(h[0]+a)|0,(h[1]+bb)|0,(h[2]+c)|0,(h[3]+d)|0,(h[4]+e)|0,(h[5]+f)|0,(h[6]+g)|0,(h[7]+hh)|0];
    }
    return h.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
  }
  const AUTH_KEY='hsl-auth-v1',SESSION='hsl-session',LOCK='hsl-lock';
  const DEFAULT={user:'admin',hash:'d1aa426473ed8033ed579c2ba23474a23d806f8a49b10f7d61748c413d713d06'};
  const hash=(u,p)=>sha256(u.trim().toLowerCase()+':'+p+':hsl-genie-civil');
  function creds(){try{const s=JSON.parse(localStorage.getItem(AUTH_KEY));if(s&&s.user&&s.hash)return s}catch(_){}return DEFAULT}
  window.HSLAuth={
    hash,
    isLogged(){try{return sessionStorage.getItem(SESSION)==='ok'}catch(_){return false}},
    logout(){try{sessionStorage.removeItem(SESSION)}catch(_){}},
    lockedFor(){try{const t=+localStorage.getItem(LOCK)||0;return Math.max(0,Math.ceil((t-Date.now())/1000))}catch(_){return 0}},
    login(u,p){
      const left=this.lockedFor();if(left)return{ok:false,msg:`Trop de tentatives. Réessayez dans ${left} s.`};
      const c=creds();
      if(u.trim().toLowerCase()===c.user.toLowerCase()&&hash(u,p)===c.hash){
        try{sessionStorage.setItem(SESSION,'ok');localStorage.removeItem('hsl-fails')}catch(_){}
        return{ok:true};
      }
      let f=0;try{f=(+localStorage.getItem('hsl-fails')||0)+1;localStorage.setItem('hsl-fails',f);if(f>=5){localStorage.setItem(LOCK,Date.now()+30000);localStorage.setItem('hsl-fails',0)}}catch(_){}
      return{ok:false,msg:'Identifiant ou mot de passe incorrect.'};
    },
    change(user,oldPass,newPass){
      const c=creds();
      if(hash(c.user,oldPass)!==c.hash)return{ok:false,msg:'Mot de passe actuel incorrect.'};
      if(newPass.length<8)return{ok:false,msg:'Le nouveau mot de passe doit contenir au moins 8 caractères.'};
      if(!user.trim())return{ok:false,msg:'L’identifiant ne peut pas être vide.'};
      try{localStorage.setItem(AUTH_KEY,JSON.stringify({user:user.trim(),hash:hash(user,newPass)}))}catch(_){return{ok:false,msg:'Enregistrement impossible.'}}
      return{ok:true};
    },
    currentUser(){return creds().user}
  };
})();
