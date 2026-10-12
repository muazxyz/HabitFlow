/* ===== PAGE: SETTINGS (opened from the gear in the top bar): profile, theme (+custom, locked Rose), font ===== */
window.Pages=window.Pages||{};
Pages.settings={render(el,u){
  const U=u.username,words=t=>t.trim()?t.trim().split(/\s+/).length:0;let bio=Social.profile(U).bio||'',msg='',mc='err';
  const setS=o=>{store.set('hf_settings',{...store.get('hf_settings',{theme:'midnight',font:'inter'}),...o});App.applyTheme()};
  const draw=()=>{const s=store.get('hf_settings',{theme:'midnight',font:'inter'}),un=store.get('hf_unlocked',{}),C=store.get('hf_customs',[]),P=Social.profile(U);
    App.repaint(el,`<div class="col" style="max-width:720px"><div class="card"><h3>Profile</h3>
      <div class="pfrow"><div class="pfp" id="pfp">${P.avatar?'':esc(U[0].toUpperCase())}</div><div><button class="sm" data-a="up">Upload photo</button> ${P.avatar?'<button class="sm bad" data-a="rm">Remove</button>':''}<div class="mu" style="margin-top:6px">JPG, PNG or WebP, under 200 KB</div></div><input type="file" id="pf" accept="image/png,image/jpeg,image/webp" hidden></div>
      <div class="mu">Username</div><div class="ro">@${esc(U)}</div>
      <div class="mu" style="margin-top:12px">About me <span id="wc" style="float:right;${words(bio)>50?'color:var(--dg)':''}">${words(bio)}/50 words</span></div><textarea id="bio" placeholder="Tell people a little about you...">${esc(bio)}</textarea>
      <button class="btn" data-a="save">Save profile</button><div class="${mc}" id="pm" style="margin-top:6px">${msg}</div></div>
     <div class="card"><h3>Theme</h3><div class="opts">${Object.entries(CONFIG.THEMES).map(([k,t])=>`<button class="opt ${s.theme==k?'on':''}" data-t="${k}">${t.c.map(c=>`<span class="sw" style="background:${c}"></span>`).join('')} ${t.name}${k=='rose'&&!un.rose?' 🔒':''}</button>`).join('')}
      ${C.map(c=>`<button class="opt ${s.theme=='c:'+c.id?'on':''}" data-t="c:${c.id}">${[c.a1,c.a2,c.bg].map(x=>`<span class="sw" style="background:${x}"></span>`).join('')} ${esc(c.name)}<span class="cx" data-del="${c.id}" title="Delete">✕</span></button>`).join('')}
      <button class="opt" data-a="cust">＋ Customize</button></div>
      <h3 style="margin-top:26px">Font</h3><div class="opts">${Object.entries(CONFIG.FONTS).map(([k,n])=>`<button class="opt ${s.font==k?'on':''}" data-f="${k}">${n}</button>`).join('')}</div></div></div>`);
    if(P.avatar)$('#pfp').style.backgroundImage=`url(${P.avatar})`};
  const keyAsk=()=>UI.modal(`<h3>🔒 Rose Blush is locked</h3><p class="mu" style="margin-bottom:8px">Enter the activation key to unlock it.</p><input id="k" placeholder="Activation key" autocomplete="off"><div class="err" id="ke"></div><div class="mrow"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="o">Unlock</button></div>`,(m,c)=>{
    const go=()=>{if(m.querySelector('#k').value==CONFIG.ROSE_KEY){store.set('hf_unlocked',{...store.get('hf_unlocked',{}),rose:true});setS({theme:'rose'});c();draw()}else m.querySelector('#ke').textContent='Wrong key'};
    m.querySelector('#c').onclick=c;m.querySelector('#o').onclick=go;m.querySelector('#k').focus();m.onkeydown=e=>{if(e.key=='Enter')go()}});
  const custom=()=>UI.modal(`<h3>Customize your theme</h3><input id="cn" maxlength="20" placeholder="Name your theme"><div class="cgrid">${[['bg','Background','#0b1020'],['panel','Panels','#141b2d'],['tx','Text','#e8ecf8'],['a1','Accent 1','#8b5cf6'],['a2','Accent 2','#22d3ee']].map(([k,l,d])=>`<label>${l}<input type="color" data-k="${k}" value="${d}"></label>`).join('')}</div>
    <div class="cprev" id="cp"><div><b>Preview</b>Panel text<button class="btn">Button</button></div></div><div class="err" id="ce"></div><div class="mrow" style="margin-top:8px"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="s">Save theme</button></div>`,(m,c)=>{
    const V={},pv=()=>m.querySelectorAll('[data-k]').forEach(i=>{V[i.dataset.k]=i.value;m.querySelector('#cp').style.setProperty('--'+i.dataset.k,i.value)});pv();m.oninput=pv;m.querySelector('#c').onclick=c;
    m.querySelector('#s').onclick=()=>{const n=m.querySelector('#cn').value.trim();if(!n)return m.querySelector('#ce').textContent='Give your theme a name';const id='x'+Date.now();
      store.set('hf_customs',[...store.get('hf_customs',[]),{id,name:n,...V}]);setS({theme:'c:'+id});c();draw()}});
  el.onclick=e=>{const dl=e.target.closest('[data-del]'),t=e.target.closest('[data-t]'),f=e.target.closest('[data-f]'),b=e.target.closest('[data-a]');msg='';mc='err';
    if(dl){store.set('hf_customs',store.get('hf_customs',[]).filter(x=>x.id!=dl.dataset.del));if(store.get('hf_settings',{}).theme=='c:'+dl.dataset.del)setS({theme:'midnight'});return draw()}
    if(t){const k=t.dataset.t;if(k=='rose'&&!store.get('hf_unlocked',{}).rose)return keyAsk();setS({theme:k});return draw()}
    if(f){setS({font:f.dataset.f});return draw()}if(!b)return;const a=b.dataset.a,P=Social.profile(U);
    if(a=='cust')return custom();if(a=='up')return $('#pf').click();
    if(a=='rm'){Social.setProfile(U,{...P,avatar:''});App.refreshAvatar();return draw()}
    if(a=='save'){if(words(bio)>50){msg='Keep your bio within 50 words.';return draw()}Social.setProfile(U,{...P,bio:bio.trim()});msg='Profile saved.';mc='err ok';draw()}};
  el.oninput=e=>{if(e.target.id=='bio'){bio=e.target.value;const n=words(bio),w=$('#wc');w.textContent=n+'/50 words';w.style.color=n>50?'var(--dg)':''}};
  el.onchange=e=>{if(e.target.id!='pf')return;const f=e.target.files[0];if(!f)return;if(f.size>204800){msg='Photo must be under 200 KB.';return draw()}
    const r=new FileReader();r.onload=()=>{Social.setProfile(U,{...Social.profile(U),avatar:r.result});App.refreshAvatar();draw()};r.readAsDataURL(f)};
  draw()}};
