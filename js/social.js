/* ===== SOCIAL DATA SERVICE: skill programs, members, progress, friendships, leaderboard.
   Browser-local for now (shared between accounts in the same browser, for testing).
   SUPABASE: replace the bodies with queries on supabase/schema2.sql (programs, program_tasks, program_members, task_progress, friendships). ===== */
const Social={
  /* profile (bio <=50 words, avatar <200KB). SUPABASE: profiles.bio / profiles.avatar_url via set_my_profile() (schema3.sql) */
  profile(u){return store.get('hf_profile_'+u,{bio:'',avatar:''})},setProfile(u,v){store.set('hf_profile_'+u,v);if(sb)sb.rpc('set_my_profile',{p_bio:v.bio||'',p_avatar:v.avatar||''}).then(r=>r.error&&console.warn(r.error.message))},
  /* notification groundwork: events are recorded now, the bell UI comes later. SUPABASE: insert into public.notifications */
  notify(to,type,data){const N=store.get('hf_notifs',[]);N.push({id:'n'+Date.now()+N.length,to,type,data,read:false,at:Date.now()});store.set('hf_notifs',N)},
  progs(){return store.get('hf_programs',[])},                                   // {id,name,desc,creator,tasks:[{id,t,url}],created}
  saveProg(p){const P=this.progs(),i=P.findIndex(x=>x.id==p.id);i<0?P.unshift(p):P[i]=p;store.set('hf_programs',P);this.recalc(p)},
  recalc(p){const M=store.get('hf_members',{});Object.values(M[p.id]||{}).forEach(m=>{m.status=p.tasks.length&&p.tasks.every(t=>m.done.includes(t.id))?'completed':'joined'});store.set('hf_members',M)},   // tasks changed: re-check who is at 100%
  delProg(id){store.set('hf_programs',this.progs().filter(p=>p.id!=id));const M=store.get('hf_members',{});delete M[id];store.set('hf_members',M)},
  mem(id){return store.get('hf_members',{})[id]||{}},                            // {username:{done:[taskIds],status:'joined'|'completed'}}
  setMem(id,u,v){const M=store.get('hf_members',{});M[id]=M[id]||{};v?M[id][u]=v:delete M[id][u];store.set('hf_members',M)},
  join(id,u){const p=this.progs().find(x=>x.id==id);this.setMem(id,u,{done:[],status:'joined'});if(p&&p.creator!=u)this.notify(p.creator,'program_join',{by:u,program:p.name})},leave(id,u){this.setMem(id,u,null)},
  toggle(id,u,t){const p=this.progs().find(x=>x.id==id),m=this.mem(id)[u];if(!p||!m)return;const i=m.done.indexOf(t);i<0?m.done.push(t):m.done.splice(i,1);
    const was=m.status;m.status=p.tasks.every(x=>m.done.includes(x.id))?'completed':'joined';this.setMem(id,u,m);if(was!='completed'&&m.status=='completed'&&p.creator!=u)this.notify(p.creator,'program_completed',{by:u,program:p.name})},   // 100% of tasks = completed automatically
  board(){const c={},P=this.progs();Object.entries(store.get('hf_members',{})).forEach(([id,M])=>{const p=P.find(x=>x.id==id);Object.entries(M).forEach(([u,m])=>{if(m.status=='completed'&&p&&p.creator!=u)c[u]=(c[u]||0)+1})});return Object.entries(c).sort((a,b)=>b[1]-a[1])},   // your own programs never score
  /* friends: {a:requester,b:addressee,s:'pending'|'ok'} */
  _f(){return store.get('hf_friends',[])},
  friends(u){return this._f().filter(f=>f.s=='ok'&&(f.a==u||f.b==u)).map(f=>f.a==u?f.b:f.a)},
  incoming(u){return this._f().filter(f=>f.s=='pending'&&f.b==u).map(f=>f.a)},
  outgoing(u){return this._f().filter(f=>f.s=='pending'&&f.a==u).map(f=>f.b)},
  async request(a,b){const t=await Auth.findUser(b);if(!t)throw Error('No user with that username');if(t==a)throw Error("That's you");
    const F=this._f();if(F.find(f=>(f.a==a&&f.b==t)||(f.a==t&&f.b==a)))throw Error('Already friends, or a request is pending');F.push({a,b:t,s:'pending',at:Date.now()});store.set('hf_friends',F);this.notify(t,'friend_request',{by:a})},
  respond(a,b,ok){const F=this._f();store.set('hf_friends',ok?F.map(f=>f.a==a&&f.b==b?{...f,s:'ok',since:Date.now()}:f):F.filter(f=>!(f.a==a&&f.b==b)));if(ok)this.notify(a,'friend_accepted',{by:b})},
  remove(u,v){store.set('hf_friends',this._f().filter(f=>!((f.a==u&&f.b==v)||(f.a==v&&f.b==u))))}
};
