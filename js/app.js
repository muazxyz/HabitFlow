/* ===== APP SHELL: router, theme, profile menu. Pages register in window.Pages = {id:{render(el,user)}} ===== */
const App={
  applyTheme(){const s=store.get('hf_settings',{theme:'midnight',font:'inter'}),R=document.documentElement,V=['bg','panel','tx','a1','a2'];let t=s.theme||'midnight';
    if(t=='rose'&&!store.get('hf_unlocked',{}).rose)t='midnight';                       // Rose Blush needs the activation key
    const c=t.startsWith('c:')&&store.get('hf_customs',[]).find(x=>'c:'+x.id==t);V.forEach(k=>R.style.removeProperty('--'+k));
    if(c){R.dataset.theme='custom';V.forEach(k=>R.style.setProperty('--'+k,c[k]))}else R.dataset.theme=CONFIG.THEMES[t]?t:'midnight';R.dataset.font=s.font||'inter'},
  refreshAvatar(){const u=Auth.current(),p=Social.profile(u.username),a=$('#pav');a.style.backgroundImage=p.avatar?`url(${p.avatar})`:'';a.style.backgroundSize='cover';a.textContent=p.avatar?'':u.username[0].toUpperCase()},
  start(){const u=Auth.current();if(!u)return AuthUI.show();
    $('#auth').hidden=true;$('#app').hidden=false;$('#pname').textContent=u.username;this.refreshAvatar();$('.logo').innerHTML=LOGO+'<span>HabitFlow</span>';$('#gear').innerHTML=IC.gear;$('#gear').onclick=()=>location.hash='settings';
    $('#nav').innerHTML=CONFIG.NAV.filter(n=>n[0]!='admin'||u.role=='admin').map(([id,l,i])=>`<button data-p="${id}"><b>${i}</b><span>${l}</span></button>`).join('');
    $('#nav').onclick=e=>{const b=e.target.closest('button');if(b)location.hash=b.dataset.p};
    const go=()=>{this.applyTheme();this.refreshAvatar();this.route()};
    if(sb&&!Sync.ok){$('#view').innerHTML='<div class="card mu">Loading your data…</div>';Sync.pull(u).finally(go)}else go()},
  /* RULE FOR ALL PAGES: re-draw with App.repaint(el, html) - never el.innerHTML= inside a redraw.
     First paint after navigating plays the entrance animation; later repaints are silent and keep scroll position. */
  repaint(el,html){const v=$('#view');if(v.dataset.fresh)delete v.dataset.fresh;else v.classList.add('still');const y=v.scrollTop;el.innerHTML=html;v.scrollTop=y},
  async route(){const id=location.hash.slice(1)||'home',u=Auth.current();if(!u)return;
    Auth.verify().then(ok=>{if(!ok&&Auth.current())Auth.logout().then(()=>AuthUI.show('login'))});   // runs in the background, never blocks the page
    $('#gear').classList.toggle('on',id=='settings');
    document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.p==id));
    const v=$('#view');['onclick','onpointerdown','onpointermove','onpointerup','onpointercancel','ondragstart','ondragover','ondrop','ondragend','oninput','onchange'].forEach(k=>v[k]=null);v.classList.remove('still');v.dataset.fresh=1;v.style.animation='none';v.offsetHeight;v.style.animation='';
    (Pages[id]||Pages.home).render(v,u)}
};
App.applyTheme();window.onhashchange=()=>App.route();
$('#pbtn').onclick=e=>{e.stopPropagation();$('#pmenu').hidden=!$('#pmenu').hidden};document.onclick=()=>$('#pmenu').hidden=true;
$('#logout').onclick=async()=>{await Sync.flush();await Auth.logout();Sync.clear();App.applyTheme();$('#pmenu').hidden=true;location.hash='';AuthUI.show()};
App.start();
