/* ===== AUTH SERVICE: the ONLY file that talks to users/Supabase. Works locally (USE_SUPABASE:false) or with Supabase. ===== */
const sb=CONFIG.USE_SUPABASE?supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_KEY):null;
const DENY={pending:'Your account is waiting for admin approval.',blocked:'Your account has been blocked.'};
const Auth={
  _users(){let u=store.get('hf_users2');if(!u){u=[{...CONFIG.DEMO_USER,role:'admin',status:'approved'}];store.set('hf_users2',u)}return u},
  async signUp({email,username,password}){
    if(sb){const{error}=await sb.auth.signUp({email,password,options:{data:{username}}});if(error)throw error;await sb.auth.signOut();return{pending:true}}
    const u=this._users();if(u.find(x=>x.username===username))throw Error('Username already taken');
    if(u.find(x=>x.email===email))throw Error('Email already registered');
    u.push({email,username,password,role:'user',status:'pending',created:Date.now()});store.set('hf_users2',u);return{pending:true};
  },
  async login({username,password}){
    if(sb){
      const{data:em}=await sb.rpc('get_email_by_username',{uname:username});if(!em)throw Error('Wrong username or password');
      const{data,error}=await sb.auth.signInWithPassword({email:em,password});
      if(error){console.warn('Supabase sign-in error:',error.message);throw Error(/confirm/i.test(error.message)?'This account is not confirmed yet. Ask the admin to confirm it.':/invalid/i.test(error.message)?'Wrong username or password':error.message)}   // real reason shown, except for bad credentials
      const p=await this._profile(data.user.id);
      if(!p||p.status!='approved'){await sb.auth.signOut();throw Error(DENY[p&&p.status]||'Access denied.')}
      return this._session(p);
    }
    const m=this._users().find(x=>x.username===username&&x.password===password);if(!m)throw Error('Wrong username or password');
    if(m.status!='approved')throw Error(DENY[m.status]);return this._session({...m,id:m.username});
  },
  async _profile(id){const{data}=await sb.from('profiles').select('*').eq('id',id).maybeSingle();return data},
  async verify(){ // runs on every page change: kicks out users who were blocked or removed
    const s=this.current();if(!s)return false;
    if(sb){if(Date.now()-(this._vt||0)<60000)return true;   // checked within the last minute: skip the network round trip
      const{data}=await sb.auth.getSession();if(!data.session)return false;const p=await this._profile(data.session.user.id);if(!p||p.status!='approved')return false;this._session(p);return true}
    const m=this._users().find(x=>x.username==s.username);return !!m&&m.status=='approved';
  },
  async findUser(name){   // returns the exact username if an approved user exists, else null
    if(sb){const{data}=await sb.rpc('username_exists',{uname:name});return data?name:null}
    const x=this._users().find(u=>u.username.toLowerCase()==name.toLowerCase()&&u.status=='approved');return x?x.username:null;
  },
  async resetPassword(email){
    if(sb){const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin});if(error)throw error;return true}
    if(!this._users().find(x=>x.email===email))throw Error('No account with that email');return true;
  },
  async logout(){this._vt=0;if(sb)await sb.auth.signOut();localStorage.removeItem('hf_session')},
  current(){return store.get('hf_session',null)},
  /* ---- admin actions (Supabase RLS only lets real admins do these) ---- */
  async listUsers(){
    if(sb){const{data,error}=await sb.from('profiles').select('*').order('created_at',{ascending:false});if(error)throw error;return data}
    return this._users().map(u=>({...u,id:u.username}));
  },
  async setStatus(id,status){
    if(sb){const{error}=await sb.from('profiles').update({status}).eq('id',id);if(error)throw error;return}
    const u=this._users();u.find(x=>x.username==id).status=status;store.set('hf_users2',u);
  },
  async removeUser(id){
    if(sb){const{error}=await sb.from('profiles').delete().eq('id',id);if(error)throw error;return}
    store.set('hf_users2',this._users().filter(x=>x.username!=id));
  },
  _session(p){this._vt=Date.now();const s={username:p.username,role:p.role||'user',id:p.id};store.set('hf_session',s);return s}
};
