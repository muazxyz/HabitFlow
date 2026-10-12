/* ===== PAGE: FRIENDS. Friends only see habits whose eye icon is ON (h.vis). Data: social.js + habits.js ===== */
window.Pages=window.Pages||{};
Pages.friends={render(el,u){
  const U=u.username,av=n=>`<span class="av">${esc(n[0].toUpperCase())}</span>`;let msg='',mc='err';
  const stat=n=>{const D=Habits.load(n),T=Habits.today(),vis=Habits.sched(D,T).filter(h=>h.vis),dn=D.log[T]||[];return{n,vis,dn,done:vis.filter(h=>dn.includes(h.id)).length,S:Habits.streak(D)}};
  const draw=()=>{const F=Social.friends(U).map(stat),inc=Social.incoming(U),out=Social.outgoing(U),all=[stat(U),...F].sort((a,b)=>b.S.cur-a.S.cur);
    App.repaint(el,`<div class="grid"><div class="col"><div class="card"><h3>Add a friend</h3><div style="display:flex;gap:10px"><input id="fu" placeholder="Username" style="margin:0"><button class="btn add" data-a="req">Send request</button></div><div class="${mc}" id="fm" style="margin-top:8px">${msg}</div></div>
     ${inc.length||out.length?`<div class="card"><h3>Requests</h3>${inc.map(n=>`<div class="urow">${av(n)}<div class="n">${esc(n)} <span class="mu">wants to be friends</span></div><button class="sm ok" data-a="acc" data-v="${esc(n)}">Accept</button><button class="sm bad" data-a="dec" data-v="${esc(n)}">Decline</button></div>`).join('')}${out.map(n=>`<div class="urow">${av(n)}<div class="n">${esc(n)} <span class="mu">request sent</span></div><span class="badge pending">pending</span></div>`).join('')}</div>`:''}
     <div class="card"><h3>Friends <span class="mu" style="float:right">${F.length}</span></h3>${F.length?F.map(s=>`<div class="urow">${av(s.n)}<div class="n"><div>${esc(s.n)}</div><div class="mu">🔥 ${s.S.cur} day streak · today ${s.done}/${s.vis.length}</div></div><button class="sm" data-a="view" data-v="${esc(s.n)}">View</button></div>`).join(''):'<p class="mu">No friends yet. Send a request using their username.</p>'}</div></div>
     <div class="col"><div class="card"><h3>🔥 Streak leaderboard</h3>${all.map((s,i)=>`<div class="fa"><span style="width:24px">${['🥇','🥈','🥉'][i]||i+1}</span>${av(s.n)}<div style="flex:1">${esc(s.n)}${s.n==U?' (you)':''}</div><b>${s.S.cur}</b></div>`).join('')}<div class="mu" style="margin-top:8px">You and your friends, by current streak</div></div></div></div>`)};
  const view=n=>{const s=stat(n);UI.modal(`<h3>${esc(n)}</h3><div class="mu" style="margin-bottom:10px">🔥 ${s.S.cur} day streak · best ${s.S.best} · today ${s.done}/${s.vis.length}</div>
    ${s.vis.length?s.vis.map(h=>`<div class="habit ${s.dn.includes(h.id)?'done':''}" style="cursor:default"><span class="hi">${h.i}</span><span class="n">${esc(h.n)}</span><span class="mu nt">${esc(h.note||'')}</span><span class="cb"></span></div>`).join(''):'<p class="mu">No shared habits.</p>'}
    <div class="mrow" style="margin-top:14px"><button class="btn ghost" id="c">Close</button><button class="btn red" id="r">Remove friend</button></div>`,(m,c)=>{m.querySelector('#c').onclick=c;m.querySelector('#r').onclick=()=>{c();UI.confirm(`Remove ${esc(n)} from friends?`,'Remove',()=>{Social.remove(U,n);draw()})}})};
  const send=async()=>{const v=$('#fu').value.trim(),m=$('#fm');if(!v)return;try{await Social.request(U,v);msg='Request sent.';mc='err ok';draw()}catch(e){m.className='err';m.textContent=e.message}};
  el.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v;msg='';mc='err';
    if(a=='req')return send();if(a=='acc'||a=='dec'){Social.respond(v,U,a=='acc');return draw()}if(a=='view')view(v)};
  el.onkeydown=e=>{if(e.key=='Enter'&&e.target.id=='fu')send()};
  draw()}};
