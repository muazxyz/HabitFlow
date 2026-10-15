/* ===== PAGE: SETTINGS (gear in the top bar): profile preview + edit popup, theme (+custom, locked Rose), font ===== */
window.Pages=window.Pages||{};
Pages.settings={render(el,u){
  const U=u.username,words=t=>t.trim()?t.trim().split(/\s+/).length:0;
  const setS=o=>{store.set('hf_settings',{...store.get('hf_settings',{theme:'midnight',font:'inter'}),...o});App.applyTheme();Sync.settings()};
  const shrink=f=>new Promise(res=>{const im=new Image(),url=URL.createObjectURL(f);im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(im.width,im.height);c.width=c.height=256;c.getContext('2d').drawImage(im,(im.width-k)/2,(im.height-k)/2,k,k,0,0,256,256);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',.85))};im.src=url});   // square 256px copy keeps the community lists light
  const draw=()=>{const s=store.get('hf_settings',{theme:'midnight',font:'inter'}),un=store.get('hf_unlocked',{}),C=store.get('hf_customs',[]),P=Social.profile(U);
    App.repaint(el,`<div class="sgrid"><div class="card"><h3>Profile</h3>
      <div class="pvw"><div class="pfp" id="pfp">${P.avatar?'':esc(U[0].toUpperCase())}</div><div><div class="pn">${esc(P.name||U)}</div><div class="mu">@${esc(U)}</div></div></div>
      ${P.bio?`<p class="bio">${esc(P.bio)}</p>`:''}<button class="btn" data-a="edit">Edit profile</button></div>
     <div class="card"><h3>Theme</h3><div class="opts">${Object.entries(CONFIG.THEMES).map(([k,t])=>`<button class="opt ${s.theme==k?'on':''}" data-t="${k}">${t.c.map(c=>`<span class="sw" style="background:${c}"></span>`).join('')} ${t.name}${k=='rose'&&!un.rose?' 🔒':''}</button>`).join('')}
      ${C.map(c=>`<button class="opt ${s.theme=='c:'+c.id?'on':''}" data-t="c:${c.id}">${[c.a1,c.a2,c.bg].map(x=>`<span class="sw" style="background:${x}"></span>`).join('')} ${esc(c.name)}<span class="cx" data-del="${c.id}" title="Delete">✕</span></button>`).join('')}
      <button class="opt" data-a="cust">＋ Customize</button></div>
      <h3 style="margin-top:26px">Font</h3><div class="opts">${Object.entries(CONFIG.FONTS).map(([k,n])=>`<button class="opt ${s.font==k?'on':''}" data-f="${k}">${n}</button>`).join('')}</div></div></div>`);
    if(P.avatar)$('#pfp').style.backgroundImage=`url(${P.avatar})`};
  const editProfile=()=>{const P=Social.profile(U);let av=P.avatar||'';
    UI.modal(`<h3>Edit profile</h3><div class="pvw"><div class="pfp" id="ep"></div><div><button class="sm" id="up">Upload photo</button> <button class="sm bad" id="rp">Remove</button><div class="mu" style="margin-top:6px">JPG, PNG or WebP, under 200 KB</div></div><input type="file" id="pf" accept="image/png,image/jpeg,image/webp" hidden></div>
      <div class="mu">Name</div><input id="nm" maxlength="30" placeholder="${esc(U)}" value="${esc(P.name||'')}">
      <div class="mu" style="margin-top:8px">About me <span id="wc" style="float:right"></span></div><textarea id="bio" placeholder="Tell people a little about you...">${esc(P.bio||'')}</textarea>
      <div class="err" id="pe"></div><div class="mrow"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="s">Save</button></div>`,(m,c)=>{
      const q=x=>m.querySelector(x),pv=()=>{const e=q('#ep');e.style.backgroundImage=av?`url(${av})`:'';e.textContent=av?'':U[0].toUpperCase()},wc=()=>{const n=words(q('#bio').value),w=q('#wc');w.textContent=n+'/50 words';w.style.color=n>50?'var(--dg)':''};pv();wc();
      q('#bio').oninput=wc;q('#c').onclick=c;q('#up').onclick=()=>q('#pf').click();q('#rp').onclick=()=>{av='';pv()};
      q('#pf').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>204800){q('#pe').textContent='Photo must be under 200 KB.';return}q('#pe').textContent='';shrink(f).then(d=>{av=d;pv()})};
      q('#s').onclick=()=>{if(words(q('#bio').value)>50){q('#pe').textContent='Keep your bio within 50 words.';return}
        Social.setProfile(U,{bio:q('#bio').value.trim(),avatar:av,name:q('#nm').value.trim()});App.refreshAvatar();c();draw()}})};
  const keyAsk=()=>UI.modal(`<h3>🔒 Rose Blush is locked</h3><p class="mu" style="margin-bottom:8px">Enter the activation key to unlock it.</p><input id="k" placeholder="Activation key" autocomplete="off"><div class="err" id="ke"></div><div class="mrow"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="o">Unlock</button></div>`,(m,c)=>{
    const go=()=>{if(m.querySelector('#k').value==CONFIG.ROSE_KEY){store.set('hf_unlocked',{...store.get('hf_unlocked',{}),rose:true});setS({theme:'rose'});c();draw()}else m.querySelector('#ke').textContent='Wrong key'};
    m.querySelector('#c').onclick=c;m.querySelector('#o').onclick=go;m.querySelector('#k').focus();m.onkeydown=e=>{if(e.key=='Enter')go()}});
  const custom=()=>UI.modal(`<h3>Customize your theme</h3><input id="cn" maxlength="20" placeholder="Name your theme"><div class="cgrid">${[['bg','Background','#0b1020'],['panel','Panels','#141b2d'],['tx','Text','#e8ecf8'],['a1','Accent 1','#8b5cf6'],['a2','Accent 2','#22d3ee']].map(([k,l,d])=>`<label>${l}<input type="color" data-k="${k}" value="${d}"></label>`).join('')}</div>
    <div class="cprev" id="cp"><div><b>Preview</b>Panel text<button class="btn">Button</button></div></div><div class="err" id="ce"></div><div class="mrow" style="margin-top:8px"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="s">Save theme</button></div>`,(m,c)=>{
    const V={},pv=()=>m.querySelectorAll('[data-k]').forEach(i=>{V[i.dataset.k]=i.value;m.querySelector('#cp').style.setProperty('--'+i.dataset.k,i.value)});pv();m.oninput=pv;m.querySelector('#c').onclick=c;
    m.querySelector('#s').onclick=()=>{const n=m.querySelector('#cn').value.trim();if(!n)return m.querySelector('#ce').textContent='Give your theme a name';const id='x'+Date.now();
      store.set('hf_customs',[...store.get('hf_customs',[]),{id,name:n,...V}]);setS({theme:'c:'+id});c();draw()}});
  el.onclick=e=>{const dl=e.target.closest('[data-del]'),t=e.target.closest('[data-t]'),f=e.target.closest('[data-f]'),b=e.target.closest('[data-a]');
    if(dl){store.set('hf_customs',store.get('hf_customs',[]).filter(x=>x.id!=dl.dataset.del));Sync.settings();if(store.get('hf_settings',{}).theme=='c:'+dl.dataset.del)setS({theme:'midnight'});return draw()}
    if(t){const k=t.dataset.t;if(k=='rose'&&!store.get('hf_unlocked',{}).rose)return keyAsk();setS({theme:k});return draw()}
    if(f){setS({font:f.dataset.f});return draw()}if(!b)return;
    if(b.dataset.a=='cust')return custom();if(b.dataset.a=='edit')editProfile()};
  draw()}};
