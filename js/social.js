/* ===== SOCIAL DATA SERVICE: skill programs, members, progress, friendships, leaderboard.
   Local mode: browser storage only. Supabase mode: the server tables are the truth; refresh() copies them into a local cache
   (usernames instead of ids) so pages stay synchronous and fast, and writes go to the server right after the local update. ===== */
const uuid=()=>(self.crypto&&crypto.randomUUID)?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c=='x'?r:r&3|8).toString(16)});
const Social={
  hook:null,wantFH:false,N:{},I:{},                       // N: id->username, I: username->id
  me(){return Auth.current()},
  w(p){return Promise.resolve(p).then(r=>{if(r&&r.error)throw r.error}).catch(e=>{console.warn('Save failed:',e.message||e);return this.refresh().then(()=>this.hook&&this.hook())})},   // on failure, re-read the server so the screen never lies
  /* ---- community ---- */
  community(){if(sb)return store.get('hf_community',[]).map(u=>({username:u.username,name:u.display_name||'',bio:u.bio||'',avatar:u.avatar_url||'',since:Date.parse(u.created_at)||0}));
    return Auth._users().filter(u=>u.status=='approved').map(u=>({username:u.username,name:this.profile(u.username).name||'',bio:this.profile(u.username).bio,avatar:this.profile(u.username).avatar,since:u.created||0}))},
  prof(u){const c=this.community().find(x=>x.username==u)||{since:0},me=this.me();if(me&&u==me.username){const p=this.profile(u);return{bio:p.bio,avatar:p.avatar,name:p.name||'',since:c.since}}return{bio:'',avatar:'',name:'',...c}},
  dname(u){return this.prof(u).name||u},
  stat(u){if(!sb||u==this.me().username){const D=Habits.load(u),S=Habits.streak(D);return{streak:S.cur,best:S.best,month_done:Habits.monthDone(D)}}return store.get('hf_stats',{})[u]||{streak:0,best:0,month_done:0}},
  rankStreak(){return this.community().map(u=>[u.username,this.stat(u.username).streak]).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))},
  boardAll(){const c=Object.fromEntries(this.board());return this.community().map(u=>[u.username,c[u.username]||0]).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))},
  rel(a,b){const f=this._f().find(x=>(x.a==a&&x.b==b)||(x.a==b&&x.b==a));return !f?'none':f.s=='ok'?'friend':f.a==a?'out':'in'},
  friendSince(a,b){return(this._f().find(x=>(x.a==a&&x.b==b)||(x.a==b&&x.b==a))||{}).since||0},
  /* ---- profile ---- */
  profile(u){return store.get('hf_profile_'+u,{bio:'',avatar:'',name:''})},
  setProfile(u,v){store.set('hf_profile_'+u,v);if(sb)sb.rpc('set_my_profile',{p_bio:v.bio||'',p_avatar:v.avatar||'',p_name:v.name||''}).then(r=>r.error&&console.warn(r.error.message))},
  notify(to,type,data){if(sb){const id=this.I[to];if(id)this.w(sb.from('notifications').insert({user_id:id,type,data}));return}
    const N=store.get('hf_notifs',[]);N.push({id:'n'+Date.now()+N.length,to,type,data,read:false,at:Date.now()});store.set('hf_notifs',N)},
  /* ---- reading the server into the cache. Returns true when something changed ---- */
  async refresh(){if(!sb||!this.me())return false;const K=()=>JSON.stringify([store.get('hf_programs'),store.get('hf_members'),store.get('hf_friends'),store.get('hf_fh'),store.get('hf_stats'),store.get('hf_community'),store.get('hf_ratings')]),before=K(),me=this.me().id;
    const R=await Promise.all([sb.rpc('community'),sb.from('programs').select('*'),sb.from('program_tasks').select('*').order('position'),sb.from('program_members').select('*'),sb.from('task_progress').select('task_id').eq('user_id',me),sb.from('friendships').select('*'),sb.from('public_stats').select('*'),sb.from('program_ratings').select('*')]);
    if(R.some(r=>r.error)){console.warn('Refresh failed:',(R.find(r=>r.error).error||{}).message);return false}
    const[c,pr,tk,mb,tp,fr,ps,rt]=R.map(r=>r.data||[]);this.N={};this.I={};c.forEach(u=>{this.N[u.id]=u.username;this.I[u.username]=u.id});store.set('hf_community',c);
    const nm=id=>this.N[id]||'former member',mine=new Set(tp.map(x=>x.task_id));
    const P=pr.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).map(p=>({id:p.id,name:p.name,desc:p.description||'',creator:nm(p.creator),status:p.status||'approved',reject:p.reject_note||'',delReason:p.delete_reason||'',created:Date.parse(p.created_at),tasks:tk.filter(t=>t.program_id==p.id).map(t=>({id:t.id,t:t.title,url:t.url}))}));store.set('hf_programs',P);
    const M={};mb.forEach(m=>{const p=P.find(x=>x.id==m.program_id);if(!p)return;(M[m.program_id]=M[m.program_id]||{})[nm(m.user_id)]={status:m.status,done:m.user_id==me?p.tasks.filter(t=>mine.has(t.id)).map(t=>t.id):[]}});
    P.forEach(p=>{const m=(M[p.id]||{})[this.me().username];if(!m)return;const want=p.tasks.length&&p.tasks.every(t=>m.done.includes(t.id))?'completed':'joined';   // tasks were edited: fix my own status
      if(m.status!=want){m.status=want;this.w(sb.from('program_members').update({status:want}).eq('program_id',p.id).eq('user_id',me))}});
    store.set('hf_members',M);store.set('hf_stats',Object.fromEntries(ps.map(s=>[nm(s.user_id),s])));const RT={};rt.forEach(r=>{(RT[r.program_id]=RT[r.program_id]||{})[nm(r.user_id)]=r.stars});store.set('hf_ratings',RT);
    store.set('hf_friends',fr.map(f=>({a:nm(f.requester),b:nm(f.addressee),s:f.status=='accepted'?'ok':'pending',since:f.accepted_at?Date.parse(f.accepted_at):0})));
    if(this.wantFH){const F={};await Promise.all(this.friends(this.me().username).map(async n=>{const r=await sb.rpc('friend_habits',{fid:this.I[n]});F[n]=r.data||null}));store.set('hf_fh',F)}   // friends' habits, already filtered to eye-ON by the database
    return before!==K()},
  fhOf(n){return store.get('hf_fh',{})[n]||null},
  /* ---- programs ---- */
  progs(){return store.get('hf_programs',[])},
  saveProg(p){const P=this.progs(),i=P.findIndex(x=>x.id==p.id);i<0?P.unshift(p):P[i]=p;store.set('hf_programs',P);this.recalc(p);if(!sb){if(i<0&&p.status=='pending')this.notifyAdmins('program_submitted',{program:p.name,by:p.creator});return}const ids=p.tasks.map(t=>t.id);
    this.w((async()=>{let r=await sb.from('programs').upsert({id:p.id,name:p.name,description:p.desc});if(r.error)return r;
      r=await sb.from('program_tasks').delete().eq('program_id',p.id).not('id','in','('+ids.join(',')+')');if(r.error)return r;
      return sb.from('program_tasks').upsert(p.tasks.map((t,j)=>({id:t.id,program_id:p.id,position:j,title:t.t,url:t.url})))})())},
  recalc(p){const M=store.get('hf_members',{});Object.values(M[p.id]||{}).forEach(m=>{m.status=p.tasks.length&&p.tasks.every(t=>m.done.includes(t.id))?'completed':'joined'});store.set('hf_members',M)},
  /* ---- approval, delete requests, ratings. Server mode: the database functions do the real checks (schema8.sql) ---- */
  notifyAdmins(type,data){if(!sb)Auth._users().filter(u=>u.role=='admin').forEach(u=>this.notify(u.username,type,data))},
  _set(id,f){const P=this.progs(),p=P.find(x=>x.id==id);if(p){f(p);store.set('hf_programs',P)}return p},
  review(id,decision,note){const ok=decision=='approve',p=this._set(id,p=>{p.status=ok?'approved':'rejected';p.reject=ok?'':note||''});if(!p)return;
    if(sb)this.w(sb.rpc('review_program',{pid:id,decision,note:note||''}));else this.notify(p.creator,ok?'program_approved':'program_rejected',{program:p.name,note:note||''})},
  requestDelete(id,reason){const p=this._set(id,p=>{p.status='delete_requested';p.delReason=reason});if(!p)return;if(sb)this.w(sb.rpc('request_program_delete',{pid:id,reason}));else this.notifyAdmins('program_delete_request',{program:p.name,by:p.creator,reason})},
  resolveDelete(id,approve){const p=this.progs().find(x=>x.id==id);if(!p)return;
    if(approve){store.set('hf_programs',this.progs().filter(x=>x.id!=id))}else this._set(id,x=>{x.status='approved';x.delReason=''});
    if(sb)this.w(sb.rpc('resolve_delete',{pid:id,approve}));else this.notify(p.creator,approve?'program_deleted':'program_delete_denied',{program:p.name})},
  ratingOf(id,u){const R=store.get('hf_ratings',{})[id]||{},v=Object.values(R);return{avg:v.length?v.reduce((a,b)=>a+b,0)/v.length:0,n:v.length,mine:R[u]||0}},
  rate(id,u,s){const R=store.get('hf_ratings',{});(R[id]=R[id]||{})[u]=s;store.set('hf_ratings',R);if(sb)this.w(sb.from('program_ratings').upsert({program_id:id,user_id:this.me().id,stars:s}))},
  delProg(id){store.set('hf_programs',this.progs().filter(p=>p.id!=id));const M=store.get('hf_members',{});delete M[id];store.set('hf_members',M);if(sb)this.w(sb.from('programs').delete().eq('id',id))},
  mem(id){return store.get('hf_members',{})[id]||{}},                            // {username:{done:[taskIds (own only on the server),status}}
  setMem(id,u,v){const M=store.get('hf_members',{});M[id]=M[id]||{};v?M[id][u]=v:delete M[id][u];store.set('hf_members',M)},
  join(id,u){const p=this.progs().find(x=>x.id==id);this.setMem(id,u,{done:[],status:'joined'});if(p&&p.creator!=u)this.notify(p.creator,'program_join',{by:u,program:p.name});if(sb)this.w(sb.from('program_members').insert({program_id:id}))},
  leave(id,u){const p=this.progs().find(x=>x.id==id);this.setMem(id,u,null);if(!sb||!p)return;const ids=p.tasks.map(t=>t.id);
    this.w((async()=>{if(ids.length){const r=await sb.from('task_progress').delete().eq('user_id',this.me().id).in('task_id',ids);if(r.error)return r}return sb.from('program_members').delete().eq('program_id',id).eq('user_id',this.me().id)})())},
  toggle(id,u,t){const p=this.progs().find(x=>x.id==id),m=this.mem(id)[u];if(!p||!m)return;const i=m.done.indexOf(t),adding=i<0;adding?m.done.push(t):m.done.splice(i,1);
    const was=m.status;m.status=p.tasks.every(x=>m.done.includes(x.id))?'completed':'joined';this.setMem(id,u,m);
    if(was!='completed'&&m.status=='completed'&&p.creator!=u)this.notify(p.creator,'program_completed',{by:u,program:p.name});
    if(sb)this.w((async()=>{const me=this.me().id,r=adding?await sb.from('task_progress').insert({task_id:t}):await sb.from('task_progress').delete().eq('task_id',t).eq('user_id',me);if(r.error)return r;
      if(was!=m.status)return sb.from('program_members').update({status:m.status}).eq('program_id',id).eq('user_id',me)})())},   // 100% of tasks = completed automatically
  board(){const c={},P=this.progs();Object.entries(store.get('hf_members',{})).forEach(([id,M])=>{const p=P.find(x=>x.id==id);Object.entries(M).forEach(([u,m])=>{if(m.status=='completed'&&p&&['approved','delete_requested'].includes(p.status||'approved'))c[u]=(c[u]||0)+1})});return Object.entries(c).sort((a,b)=>b[1]-a[1])},   // approved programs only; finishing your own counts too
  /* ---- friends: {a:requester,b:addressee,s:'pending'|'ok',since} ---- */
  _f(){return store.get('hf_friends',[])},
  friends(u){return this._f().filter(f=>f.s=='ok'&&(f.a==u||f.b==u)).map(f=>f.a==u?f.b:f.a)},
  incoming(u){return this._f().filter(f=>f.s=='pending'&&f.b==u).map(f=>f.a)},
  outgoing(u){return this._f().filter(f=>f.s=='pending'&&f.a==u).map(f=>f.b)},
  async request(a,b){if(sb&&!Object.keys(this.I).length)await this.refresh();const t=await Auth.findUser(b);if(!t)throw Error('No user with that username');if(t==a)throw Error("That's you");
    const F=this._f();if(F.find(f=>(f.a==a&&f.b==t)||(f.a==t&&f.b==a)))throw Error('Already friends, or a request is pending');
    if(sb){const r=await sb.from('friendships').insert({addressee:this.I[t]});if(r.error)throw Error(/duplicate|unique/i.test(r.error.message)?'Already friends, or a request is pending':r.error.message)}
    F.push({a,b:t,s:'pending',since:0});store.set('hf_friends',F);this.notify(t,'friend_request',{by:a})},
  respond(a,b,ok){const F=this._f();store.set('hf_friends',ok?F.map(f=>f.a==a&&f.b==b?{...f,s:'ok',since:Date.now()}:f):F.filter(f=>!(f.a==a&&f.b==b)));if(ok)this.notify(a,'friend_accepted',{by:b});
    if(sb){const q=sb.from('friendships'),f=ok?q.update({status:'accepted',accepted_at:new Date().toISOString()}):q.delete();this.w(f.eq('requester',this.I[a]).eq('addressee',this.me().id))}},
  remove(u,v){store.set('hf_friends',this._f().filter(f=>!((f.a==u&&f.b==v)||(f.a==v&&f.b==u))));
    if(sb){const x=this.I[u],y=this.I[v];this.w(sb.from('friendships').delete().or(`and(requester.eq.${x},addressee.eq.${y}),and(requester.eq.${y},addressee.eq.${x})`))}}
};
