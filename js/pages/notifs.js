/* ===== NOTIFICATIONS: data service (Notifs) + page. Events are written by social.js (Social.notify). Live via Supabase realtime + 20s backup poll. ===== */
const Notifs={hook:null,sub:false,
  async list(){const u=Auth.current();if(!u)return[];
    if(sb){const r=await sb.from('notifications').select('*').eq('user_id',u.id).order('created_at',{ascending:false}).limit(60);return(r.data||[]).map(n=>({id:n.id,type:n.type,data:n.data||{},read:n.read,at:Date.parse(n.created_at)}))}
    return store.get('hf_notifs',[]).filter(n=>n.to==u.username).sort((a,b)=>b.at-a.at)},
  async mark(id){const u=Auth.current();if(sb){await sb.from('notifications').update({read:true}).eq('user_id',u.id).eq('id',id)}else store.set('hf_notifs',store.get('hf_notifs',[]).map(n=>n.id==id?{...n,read:true}:n))},
  async markAll(){const u=Auth.current();if(sb){await sb.from('notifications').update({read:true}).eq('user_id',u.id).eq('read',false)}else store.set('hf_notifs',store.get('hf_notifs',[]).map(n=>n.to==u.username?{...n,read:true}:n))},
  async clear(){const u=Auth.current();if(sb){await sb.from('notifications').delete().eq('user_id',u.id)}else store.set('hf_notifs',store.get('hf_notifs',[]).filter(n=>n.to!=u.username))},
  async badge(){const L=await this.list();App.badge(L.filter(n=>!n.read).length)},
  changed(){this.badge();this.hook&&this.hook()},
  subscribe(){const u=Auth.current();if(!sb||this.sub||!u)return;this.sub=true;try{sb.channel('notifs-'+u.id).on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`user_id=eq.${u.id}`},()=>this.changed()).subscribe()}catch(e){console.warn('Realtime unavailable, using polling:',e.message)}}
};
window.Pages=window.Pages||{};
Pages.notifs={render(el,u){
  const U=u.username,ago=t=>{const s=Math.max(1,Math.round((Date.now()-t)/1000));return s<60?'just now':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago'};
  const IC2={friend_request:'🤝',friend_accepted:'✅',program_join:'➕',program_completed:'🏆'};
  const text=n=>{const b=`<b>${esc(Social.dname(n.data.by||'Someone'))}</b>`,p=`“${esc(n.data.program||'')}”`;return{friend_request:`${b} sent you a friend request`,friend_accepted:`${b} accepted your friend request`,program_join:`${b} joined your program ${p}`,program_completed:`${b} completed your program ${p}`}[n.type]||'New activity'};
  let L=[];
  const draw=async()=>{L=await Notifs.list();App.badge(L.filter(n=>!n.read).length);
    App.repaint(el,`<div class="card" style="max-width:820px"><div class="chead"><h3>Notifications</h3><button class="sm" data-a="all">Mark all read</button><button class="sm bad" data-a="clr">Clear</button></div>
      ${L.length?L.map(n=>{const by=n.data.by,rel=n.type=='friend_request'?Social.rel(U,by):'';return `<div class="nrow ${n.read?'':'un'}" data-n="${n.id}" data-t="${n.type}"><span style="font-size:22px">${IC2[n.type]||'🔔'}</span><div style="flex:1">${text(n)}<div class="mu">${ago(n.at)}</div></div>
        ${n.type=='friend_request'?(rel=='in'?`<button class="sm ok" data-a="acc" data-by="${esc(by)}" data-id="${n.id}">Accept</button><button class="sm bad" data-a="dec" data-by="${esc(by)}" data-id="${n.id}">Decline</button>`:rel=='friend'?'<span class="badge approved">Friends</span>':'<span class="mu">Handled</span>'):''}</div>`}).join(''):'<p class="mu">You are all caught up. Friend requests and program activity show up here.</p>'}</div>`)};
  el.onclick=async e=>{const b=e.target.closest('[data-a]'),a=b&&b.dataset.a;
    if(a=='all'){await Notifs.markAll();return draw()}if(a=='clr'){await Notifs.clear();return draw()}
    if(a=='acc'||a=='dec'){Social.respond(b.dataset.by,U,a=='acc');await Notifs.mark(b.dataset.id);return draw()}
    const r=e.target.closest('[data-n]');if(!r)return;await Notifs.mark(r.dataset.n);location.hash=r.dataset.t.startsWith('friend')?'friends':'skills'};
  Notifs.hook=draw;
  (sb?Social.refresh():Promise.resolve()).then(draw)}};
