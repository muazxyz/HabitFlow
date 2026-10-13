/* ===== PEOPLE UI: leaderboard rows, user card (add friend), friend profile popup, shared monthly heatmap/graph. Used by Social and Skill Learning. ===== */
const People={
  fmt:t=>t?new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—',
  av(n,s){const p=Social.prof(n);return `<span class="av" style="${p.avatar?`background-image:url(${p.avatar});background-size:cover;`:''}${s?`width:${s}px;height:${s}px;font-size:${Math.round(s/2.3)}px`:''}">${p.avatar?'':esc(n[0].toUpperCase())}</span>`},
  row(n,i,val,U,F){const c=n==U?'me':F.includes(n)?'fr':'';return `<div class="lbrow ${c}" data-u="${esc(n)}"><span class="rk">${['🥇','🥈','🥉'][i]||i+1}</span>${this.av(n)}<div class="nm">${esc(n)}${n==U?' <i>(you)</i>':c=='fr'?' <i>friend</i>':''}</div><b>${val}</b></div>`},
  /* monthly numbers for a habit dataset D: daily completed counts (null = future) + per-habit counts */
  month(D,y,m){const T=Habits.today(),p=x=>String(x).padStart(2,'0'),per=D.habits.map(h=>({...h,c:0})),daily=[];
    for(let d=1;d<=new Date(y,m,0).getDate();d++){const k=`${y}-${p(m)}-${p(d)}`;if(k>T){daily.push(null);continue}daily.push(Habits.count(D,k));const L=D.log[k]||[];per.forEach(h=>{if(L.includes(h.id)&&h.created<=k)h.c++})}
    return{daily,per,days:daily.filter(x=>x!==null).length}},
  grid(D,y,m){const p=x=>String(x).padStart(2,'0');let c='<i class="e"></i>'.repeat(new Date(y,m-1,1).getDay());
    for(let d=1;d<=new Date(y,m,0).getDate();d++){const k=`${y}-${p(m)}-${p(d)}`,s=Habits.sched(D,k).length,x=Habits.count(D,k),pc=s?x/s*100:0;c+=`<i class="lv${Habits.lvl(pc)}" title="${k}: ${Math.round(pc)}% (${x}/${s})"></i>`}
    return `<div class="mg2">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(x=>`<b>${x}</b>`).join('')}${c}</div>`},
  graph(S){const W=380,H=180,all=S.flatMap(s=>s.v.filter(x=>x!=null)),mx=Math.ceil(Math.max(4,...all)/4)*4,n=S[0].v.length,X=i=>34+i*((W-44)/(n-1||1)),Y=v=>H-24-v/mx*(H-40),rose=document.documentElement.dataset.theme=='rose';
    return `<svg viewBox="0 0 ${W} ${H}" width="100%"><g stroke="var(--bd)" fill="var(--mu)" font-size="10">${[0,1,2,3,4].map(i=>`<line x1="34" x2="${W-10}" y1="${Y(mx*i/4)}" y2="${Y(mx*i/4)}"/><text x="28" y="${Y(mx*i/4)+3}" text-anchor="end" stroke="none">${mx*i/4}</text>`).join('')}</g>
     ${S.map(s=>{const pts=s.v.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);return `<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${s.c}" stroke-width="2.5"/>${pts.map(p=>rose?`<text x="${p[0]}" y="${p[1]+4}" font-size="11" text-anchor="middle" fill="${s.c}">♥</text>`:`<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="${s.c}"/>`).join('')}`}).join('')}
     ${S[0].v.map((_,i)=>i==0||(i+1)%5==0?`<text x="${X(i)}" y="${H-6}" font-size="10" fill="var(--mu)" text-anchor="middle">${i+1}</text>`:'').join('')}</svg>`},
  async dataOf(n){const U=Social.me().username;if(n==U||!sb)return Habits.load(n);const r=await sb.rpc('friend_habits',{fid:Social.I[n]});return r.data||{habits:[],log:{},joined:Habits.today()}},
  /* click on a leaderboard name: friends open the big profile, others get Add as friend */
  open(n,done){const U=Social.me().username;if(n==U)return;const rel=Social.rel(U,n);if(rel=='friend')return this.profile(n,done);
    UI.modal(`<div style="text-align:center">${this.av(n,76)}<h3 style="margin:10px 0 4px">${esc(n)}</h3><div class="mu" style="margin-bottom:14px">${esc(Social.prof(n).bio||'No bio yet.')}</div></div>
      ${rel=='out'?'<button class="btn ghost" disabled>Request sent</button>':`<button class="btn" id="af">${rel=='in'?'Accept friend request':'Add as friend'}</button>`}<div class="err" id="e"></div><button class="btn ghost" id="c">Close</button>`,(m,c)=>{
      m.querySelector('#c').onclick=c;const b=m.querySelector('#af');if(b)b.onclick=async()=>{try{if(rel=='in')Social.respond(n,U,true);else await Social.request(U,n);c();done&&done()}catch(e){m.querySelector('#e').textContent=e.message}}})},
  /* large friend popup: profile on the left, monthly habit stats + heatmap + graph on the right */
  async profile(n,done){const U=Social.me().username;let box;UI.modal('<div class="sub">Loading…</div>',m=>{box=m;m.classList.add('xxl')});
    const D=await this.dataOf(n),T=Habits.today(),y=+T.slice(0,4),mo=+T.slice(5,7),S=this.month(D,y,mo),p=Social.prof(n),vis=S.per.filter(h=>h.vis!==false),S1=Habits.streak(D);
    if(!box.isConnected)return;
    box.innerHTML=`<div class="pp"><div class="sub pl">${this.av(n,92)}<h2>${esc(n)}</h2><p class="bio">${esc(p.bio||'No bio yet.')}</p><div class="mu">Member since<br><b>${this.fmt(p.since)}</b></div><div class="mu">Friends since<br><b>${this.fmt(Social.friendSince(U,n))}</b></div><div class="mu">🔥 ${S1.cur} day streak · best ${S1.best}</div><button class="sm bad" id="rm" style="margin-top:auto">Remove friend</button></div>
      <div class="rt"><div class="sub"><h4>Habit stats · ${UI.MONTHS[mo-1]}</h4>${vis.length?vis.map(h=>`<div class="hs"><span>${h.i} ${esc(h.n)}</span><div class="pbar"><i style="width:${S.days?Math.round(h.c/S.days*100):0}%"></i></div><b>${h.c}/${S.days}</b></div>`).join(''):'<p class="mu">No shared habits.</p>'}</div>
       <div class="bt"><div class="sub"><h4>Heatmap</h4>${this.grid(D,y,mo)}</div><div class="sub"><h4>Graph</h4>${this.graph([{v:S.daily,c:'var(--a1)'}])}</div></div></div></div>`;
    box.querySelector('#rm').onclick=()=>{box.parentNode.click();UI.confirm(`Remove ${esc(n)} from friends?`,'Remove',()=>{Social.remove(U,n);done&&done()})}}
};
