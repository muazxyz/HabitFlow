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
  /* this week (Sun-Sat): completed habits per day, null for days still to come (same numbers as the Home graph) */
  week(D){const T=Habits.today(),s=Habits.add(T,-Habits.dow(T));return Array.from({length:7},(_,i)=>{const k=Habits.add(s,i);return k>T?null:Habits.count(D,k)})},
  bars(v){const W=380,H=270,L=34,B=28,mx=Math.ceil(Math.max(4,...v.filter(x=>x!=null))/4)*4,bw=(W-L-8)/7,Y=x=>H-B-x/mx*(H-B-14),D=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return `<svg viewBox="0 0 ${W} ${H}" class="bars"><defs><linearGradient id="bgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--a2)"/><stop offset="1" style="stop-color:var(--a1)"/></linearGradient></defs>
     <g stroke="var(--bd)" fill="var(--mu)" font-size="10">${[0,1,2,3,4].map(i=>`<line x1="${L}" x2="${W-4}" y1="${Y(mx*i/4)}" y2="${Y(mx*i/4)}"/><text x="${L-6}" y="${Y(mx*i/4)+3}" text-anchor="end" stroke="none">${mx*i/4}</text>`).join('')}</g>
     ${v.map((x,i)=>{const h=x==null?0:x?Math.max(5,(H-B-14)*x/mx):0;return `<rect class="bar" x="${L+i*bw+bw*.17}" y="${H-B-h}" width="${bw*.66}" height="${h}" rx="${Math.min(9,bw*.3)}" fill="url(#bgr)" style="animation-delay:${i*70}ms"/>`}).join('')}
     ${D.map((d,i)=>`<text x="${L+i*bw+bw/2}" y="${H-9}" font-size="11" fill="var(--mu)" text-anchor="middle">${d}</text>`).join('')}</svg>`},
  /* two weekly lines on one chart with a legend (Equate and Collate); the lines draw themselves when anim is true */
  lines(S,anim){const W=460,H=280,L=42,R=16,T0=46,B=30,all=S.flatMap(s=>s.v.filter(x=>x!=null)),mx=Math.ceil(Math.max(4,...all)/4)*4,X=i=>L+i*((W-L-R)/6),Y=v=>H-B-v/mx*(H-B-T0),rose=document.documentElement.dataset.theme=='rose',D=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return `<svg viewBox="0 0 ${W} ${H}" class="lines"><g stroke="var(--bd)" fill="var(--mu)" font-size="10">${[0,1,2,3,4].map(i=>`<line x1="${L}" x2="${W-R}" y1="${Y(mx*i/4)}" y2="${Y(mx*i/4)}"/><text x="${L-7}" y="${Y(mx*i/4)+3}" text-anchor="end" stroke="none">${mx*i/4}</text>`).join('')}${D.map((d,i)=>`<line x1="${X(i)}" x2="${X(i)}" y1="${T0}" y2="${H-B}"/><text x="${X(i)}" y="${H-10}" text-anchor="middle" font-size="11" stroke="none">${d}</text>`).join('')}</g>
     <rect x="${L+6}" y="8" width="${30+S.reduce((a,s)=>a+s.n.length*7+44,0)}" height="26" rx="8" fill="var(--panel)" stroke="var(--bd)"/>${S.map((s,j)=>{const x0=L+16+S.slice(0,j).reduce((a,t)=>a+t.n.length*7+44,0);return `<line x1="${x0}" x2="${x0+18}" y1="21" y2="21" stroke="${s.c}" stroke-width="3"/><text x="${x0+24}" y="25" font-size="11" fill="var(--tx)">${esc(s.n)}</text>`}).join('')}
     ${S.map((s,j)=>{const pts=s.v.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);return `<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${s.c}" stroke-width="2.6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${anim?1:0}">${anim?`<animate attributeName="stroke-dashoffset" to="0" begin="${j*.25}s" dur="1s" fill="freeze"/>`:''}</polyline>
       <g ${anim?'opacity="0"':''}>${anim?`<animate attributeName="opacity" to="1" begin="${j*.25+.8}s" dur=".3s" fill="freeze"/>`:''}${pts.map(p=>rose?`<text x="${p[0]}" y="${p[1]+5}" font-size="14" text-anchor="middle" fill="${s.c}">♥</text>`:`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${s.c}"/>`).join('')}</g>`}).join('')}</svg>`},
  async dataOf(n){const U=Social.me().username;if(n==U||!sb)return Habits.load(n);const r=await sb.rpc('friend_habits',{fid:Social.I[n]});return r.data||{habits:[],log:{},joined:Habits.today()}},
  /* click on a leaderboard name: friends open the big profile, others get Add as friend */
  open(n,done){const U=Social.me().username;if(n==U)return;const rel=Social.rel(U,n);if(rel=='friend')return this.profile(n,done);
    UI.modal(`<div style="text-align:center">${this.av(n,76)}<h3 style="margin:10px 0 4px">${esc(n)}</h3><div class="mu" style="margin-bottom:14px">${esc(Social.prof(n).bio||'No bio yet.')}</div></div>
      ${rel=='out'?'<button class="btn ghost" disabled>Request sent</button>':`<button class="btn" id="af">${rel=='in'?'Accept friend request':'Add as friend'}</button>`}<div class="err" id="e"></div><button class="btn ghost" id="c">Close</button>`,(m,c)=>{
      m.querySelector('#c').onclick=c;const b=m.querySelector('#af');if(b)b.onclick=async()=>{try{if(rel=='in')Social.respond(n,U,true);else await Social.request(U,n);c();done&&done()}catch(e){m.querySelector('#e').textContent=e.message}}})},
  /* large friend popup: renders at full size on the very first frame (cached data), so the open animation is smooth; fresh data swaps in quietly */
  profile(n,done){const U=Social.me().username;let box;
    const html=D=>{const T=Habits.today(),y=+T.slice(0,4),mo=+T.slice(5,7),S=this.month(D,y,mo),p=Social.prof(n),vis=S.per.filter(h=>h.vis!==false),S1=Habits.streak(D);
      return `<div class="pp"><div class="sub pl">${this.av(n,92)}<div><h2>${esc(Social.dname(n))}</h2><div class="mu">@${esc(n)}</div></div>${p.bio?`<p class="bio">${esc(p.bio)}</p>`:''}<div class="mu">Member since<br><b>${this.fmt(p.since)}</b></div><div class="mu">Friends since<br><b>${this.fmt(Social.friendSince(U,n))}</b></div><div class="mu">🔥 ${S1.cur} day streak · best ${S1.best}</div><button class="sm bad wide" id="rm" style="margin-top:auto">Remove friend</button></div>
      <div class="rt"><div class="sub"><h4>Habit stats · ${UI.MONTHS[mo-1]}</h4>${vis.length?vis.map(h=>`<div class="hs"><span>${UI.hicon(h.i,16)} ${esc(h.n)}</span><div class="pbar"><i style="width:${S.days?Math.round(h.c/S.days*100):0}%"></i></div><b>${h.c}/${S.days}</b></div>`).join(''):'<p class="mu">No shared habits.</p>'}</div>
       <div class="bt"><div class="sub"><h4>Heatmap</h4>${this.grid(D,y,mo)}</div><div class="sub gsub"><h4>This week</h4>${this.bars(this.week(D))}</div></div></div></div>`};
    const wire=()=>{box.querySelector('#rm').onclick=()=>{box.parentNode.click();UI.confirm(`Remove ${esc(n)} from friends?`,'Remove',()=>{Social.remove(U,n);done&&done()})}};
    const D0=(n==U||!sb)?Habits.load(n):Social.fhOf(n);
    UI.modal(html(D0||{habits:[],log:{},joined:Habits.today()}),m=>{box=m;m.classList.add('xxl');wire()});
    if(sb&&n!=U)this.dataOf(n).then(D=>{if(box.isConnected&&JSON.stringify(D)!==JSON.stringify(D0)){box.innerHTML=html(D);wire()}})}
};
