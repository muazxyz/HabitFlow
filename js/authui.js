/* ===== LOGIN / SIGNUP / FORGOT SCREEN (UI only; logic lives in auth.js) =====
   The card is built once; switching modes only swaps the fields, so it feels instant. */
const AuthUI={
  M:{
    login:{t:'Welcome back',b:'Log in',f:[['username','Username'],['password','Password','password']]},
    signup:{t:'Create account',b:'Create account',f:[['email','Email','email'],['username','Username'],['password','Password','password']]},
    forgot:{t:'Reset password',b:'Send reset link',f:[['email','Email','email']]}
  },
  mount(){
    $('#auth').innerHTML=`<div class="box"><div class="alogo">${LOGO.replace('width="34" height="34"','width="58" height="58"')}</div><h2 id="ttl"></h2><div class="mu">Small steps. Big changes.</div>
      <div class="tabs" id="tabs"><i></i><button data-m="login">Login</button><button data-m="signup">Sign up</button></div>
      <div id="fields"></div><div class="err" id="msg"></div><button class="btn" id="go"></button><div id="lnk"></div></div>`;
    $('#auth').onclick=e=>{const b=e.target.closest('[data-m]');if(b)this.show(b.dataset.m)};
    $('#auth').addEventListener('keydown',e=>{if(e.key==='Enter')this.submit()});
    $('#go').onclick=()=>this.submit();
  },
  show(mode='login'){
    $('#auth').hidden=false;$('#app').hidden=true;
    if(!$('#auth .box'))this.mount();
    this.mode=mode;const m=this.M[mode];
    $('#ttl').textContent=m.t;$('#go').textContent=m.b;
    const tabs=$('#tabs');tabs.hidden=mode=='forgot';tabs.dataset.i=mode=='signup'?1:0;
    tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.m==mode));
    const F=$('#fields');F.innerHTML=m.f.map(([n,p,ty='text'])=>`<input name="${n}" type="${ty}" placeholder="${p}" autocomplete="off">`).join('');
    F.classList.remove('swap');F.offsetWidth;F.classList.add('swap');
    $('#msg').textContent='';$('#msg').className='err';
    $('#lnk').innerHTML=mode=='login'?'<button class="lnk" data-m="forgot">Forgot password?</button>':mode=='forgot'?'<button class="lnk" data-m="login">Back to login</button>':'';
  },
  async submit(){
    const mode=this.mode,v={},m=$('#msg');$('#fields').querySelectorAll('input').forEach(i=>v[i.name]=i.value.trim());m.className='err';
    try{
      if(Object.values(v).some(x=>!x))throw Error('Fill in every field');
      if(mode=='signup'&&v.password.length<6)throw Error('Password needs 6+ characters');
      if(mode=='forgot'){await Auth.resetPassword(v.email);m.className='err ok';m.textContent='Reset link sent. Check your email.';return}
      const r=await Auth[mode=='signup'?'signUp':'login'](v);
      if(r&&r.pending){this.show('login');$('#msg').className='err ok';$('#msg').textContent='Account created. You can log in once the admin approves it.';return}
      App.start();
    }catch(e){m.textContent=e.message}
  }
};
