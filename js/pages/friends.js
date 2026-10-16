/* ===== PAGE: SOCIAL (route id stays "friends"). Friends, requests, community leaderboard, Equate and Collate. Popups/charts: people.js ===== */
window.Pages=window.Pages||{};
Pages.friends={render(el,u){
  const U=u.username,TABS=[['habits','Habits'],['graph','Graph'],['heat','Heatmap'],['skills','Skills']];let msg='',mc='err',cmp=null,tab='habits',dd=false,ft='friends',anim=false;
  const stat=n=>{const D=(n==U||!sb)?Habits.load(n):(Social.fhOf(n)||{habits:[],log:{},joined:Habits.today()}),T=Habits.today(),vis=Habits.sched(D,T).filter(h=>h.vis),dn=D.log[T]||[];return{n,D,vis,done:vis.filter(h=>dn.includes(h.id)).length,S:Habits.streak(D)}};
  const sk=x=>{const P=Social.progs(),st=p=>(Social.mem(p.id)[x]||{}).status;return{done:P.filter(p=>p.creator!=x&&st(p)=='completed'),prog:P.filter(p=>p.creator!=x&&st(p)=='joined'),made:P.filter(p=>p.creator==x)}};
  const cmpBody=(f,A,B,an)=>{const T=Habits.today(),y=+T.slice(0,4),mo=+T.slice(5,7),a=People.month(A.D,y,mo),b=People.month(B.D,y,mo);
    if(tab=='graph')return People.lines([{n:U,v:People.week(A.D),c:'var(--a1)'},{n:f,v:People.week(B.D),c:'var(--a2)'}],an);
    if(tab=='heat')return `<div class="two2"><div class="sub"><h4>${esc(U)}</h4>${People.grid(A.D,y,mo)}</div><div class="sub"><h4>${esc(f)}</h4>${People.grid(B.D,y,mo)}</div></div>`;
    if(tab=='skills'){const s=sk(U),t=sk(f),list=x=>[...x.done.map(p=>`✓ ${esc(p.name)}`),...x.prog.map(p=>`… ${esc(p.name)}`)].map(l=>`<div class="mu">${l}</div>`).join('')||'<div class="mu">Nothing yet</div>';
      return `<div class="two2">${[[U,s],[f,t]].map(([n,x])=>`<div class="sub"><h4>${esc(n)}</h4><div class="cmpn">${x.done.length}</div><div class="mu">completed · ${x.prog.length} in progress · ${x.made.length} created</div><div style="margin-top:8px">${list(x)}</div></div>`).join('')}</div>`}
    const common=a.per.filter(h=>b.per.some(x=>x.n.toLowerCase()==h.n.toLowerCase()));   // only habits you both have, matched by name
    return `<table class="ct"><tr><th>This month</th><th>${esc(U)}</th><th>${esc(f)}</th></tr><tr><td>🔥 Streak (best)</td><td>${A.S.cur} (${A.S.best})</td><td>${B.S.cur} (${B.S.best})</td></tr>${common.map(h=>`<tr><td>${UI.hicon(h.i,16)} ${esc(h.n)}</td><td>${h.c}</td><td>${b.per.find(x=>x.n.toLowerCase()==h.n.toLowerCase()).c}</td></tr>`).join('')}
      <tr class="mu"><td colspan="3">${common.length?`Days completed out of ${a.days} so far, for habits you both have.`:'You have no habits in common yet. Habits are matched by name, and you only see the ones your friend shares.'}</td></tr></table>`};
  const draw=()=>{const A0=anim;anim=false;const F=Social.friends(U).map(stat),inc=Social.incoming(U),out=Social.outgoing(U),R=Social.rankStreak(),Fn=F.map(s=>s.n),f=cmp&&Fn.includes(cmp)?cmp:Fn[0],av=n=>People.av(n);
    App.repaint(el,`<div class="col"><div class="grid"><div class="col"><div class="card"><h3>Add a friend</h3><div style="display:flex;gap:10px"><input id="fu" placeholder="Username" style="margin:0"><button class="btn add" data-a="req">Send request</button></div><div class="${mc}" id="fm" style="margin-top:8px">${msg}</div></div>
     <div class="card"><div class="chead"><h3>Friends</h3>${UI.seg('ft','ft',[['friends','Friends'],['requests','Requests',inc.length?`<em class="nb">${inc.length}</em>`:'']],ft)}</div>
      <div class="${UI.sw('ft').trim()}">${ft=='friends'?(F.length?F.map(s=>`<div class="urow frow" data-f="${esc(s.n)}">${av(s.n)}<div class="n"><div>${esc(Social.dname(s.n))}</div><div class="mu">🔥 ${s.S.cur} day streak · today ${s.done}/${s.vis.length}</div></div><span class="mu">View ›</span></div>`).join(''):'<p class="mu">No friends yet. Send a request, or click a name on the leaderboard.</p>')
       :(inc.length||out.length?inc.map(n=>`<div class="urow">${av(n)}<div class="n">${esc(n)} <span class="mu">wants to be friends</span></div><button class="sm ok" data-a="acc" data-v="${esc(n)}">Accept</button><button class="sm bad" data-a="dec" data-v="${esc(n)}">Decline</button></div>`).join('')+out.map(n=>`<div class="urow">${av(n)}<div class="n">${esc(n)} <span class="mu">request sent</span></div><span class="badge pending">pending</span></div>`).join(''):'<p class="mu">No pending requests.</p>')}</div></div></div>
     <div class="card"><h3>🔥 Community leaderboard</h3><div class="lbl">${R.map(([n,s],i)=>People.row(n,i,s,U,Fn)).join('')}</div><div class="mu" style="margin-top:8px">Current streak · you and your friends are highlighted · click a name</div></div></div>
     <div class="card"><div class="chead"><h3>Equate and Collate</h3>${F.length?`<div class="dd"><button class="fsel" data-a="cd">${esc(f)} <span>▾</span></button>${dd?`<div class="dmenu">${Fn.map(n=>`<button class="${n==f?'on':''}" data-a="cs" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}</div>`:''}</div>
      ${F.length?`<div style="margin-bottom:12px">${UI.seg('ec','ct',TABS,tab)}</div><div class="ecb${UI.sw('ec')}">${cmpBody(f,stat(U),F.find(s=>s.n==f),A0)}</div>`:'<p class="mu">Add a friend to compare your month with theirs.</p>'}</div></div>`)};
  const send=async()=>{const v=$('#fu').value.trim(),m=$('#fm');if(!v)return;try{await Social.request(U,v);msg='Request sent.';mc='err ok';draw()}catch(e){m.className='err';m.textContent=e.message}};
  el.onclick=e=>{const b=e.target.closest('[data-a]'),a=b&&b.dataset.a,v=b&&b.dataset.v;
    if(a=='cd'){dd=!dd;return draw()}if(a=='cs'){cmp=v;dd=false;anim=tab=='graph';UI.swap.ec=1;return draw()}if(a=='ct'){tab=v;anim=v=='graph';UI.swap.ec=1;return draw()}if(a=='ft'){ft=v;UI.swap.ft=1;return draw()}
    if(dd){dd=false;draw()}msg='';mc='err';
    if(a=='req')return send();if(a=='acc'||a=='dec'){Social.respond(v,U,a=='acc');return draw()}
    const ur=e.target.closest('[data-u]'),fr=e.target.closest('[data-f]');if(ur)return People.open(ur.dataset.u,draw);if(fr)People.profile(fr.dataset.f,draw)};
  el.onkeydown=e=>{if(e.key=='Enter'&&e.target.id=='fu')send()};
  Social.hook=draw;Social.wantFH=true;
  const T0=App.tok,cold=sb&&store.get('hf_friends',null)===null;   // show cached data at once, refresh quietly
  if(cold)el.innerHTML='<div class="card mu">Loading…</div>';else draw();
  if(sb)Social.refresh().then(ch=>{if(App.tok==T0&&(ch||cold))draw()})}};
