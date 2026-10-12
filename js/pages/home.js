/* ===== PAGE: HOME (personal per user). Data/maths: habits.js. Popups/date picker: ui.js. Redraw only via App.repaint. ===== */
window.Pages=window.Pages||{};
Pages.home={render(el,u){
  const U=u.username,D=Habits.load(U),T=Habits.today(),M=UI.MONTHS,p=n=>String(n).padStart(2,'0'),rose=()=>document.documentElement.dataset.theme=='rose',rk='hf_remark_'+U;
  let view=T,cv='month',cm=new Date(+T.slice(0,4),+T.slice(5,7)-1,1),act='week',shown=0,first=true,ypos=null;
  const save=()=>{Habits.save(U,D);draw()};
  const sq=k=>{const n=Habits.sched(D,k).length,c=Habits.count(D,k),pc=n?c/n*100:0;return `<i class="lv${Habits.lvl(pc)}" title="${k}: ${Math.round(pc)}% (${c}/${n})"></i>`};
  /* ---- habit calendar: year (GitHub style) or two months, weeks Sun-Sat ---- */
  /* year view: ONE strip (Sun-Sat rows). ~6 months fit on screen (VIS columns); the slider pans through the rest of the year */
  const VIS=26,ygeo=y=>{const o=new Date(y,0,1).getDay(),n=Math.round((new Date(y+1,0,1)-new Date(y,0,1))/864e5);return{o,n,W:Math.ceil((o+n)/7)}},mcol=(y,o,mi)=>Math.floor((o+Math.round((new Date(y,mi,1)-new Date(y,0,1))/864e5))/7);
  const yv=()=>{const y=cm.getFullYear(),{o,n,W}=ygeo(y);let c='<i class="e"></i>'.repeat(o),ad=0,pf=0;
    for(let i=0;i<n;i++){const k=Habits.add(y+'-01-01',i),sc=Habits.sched(D,k).length,dd=Habits.count(D,k);c+=sq(k);if(dd)ad++;if(sc&&dd==sc)pf++}
    if(ypos==null)ypos=y==+T.slice(0,4)?+T.slice(5,7)-1:0;   // slider = month to bring into view (12 snap points)
    const lb=M.map((m,i)=>`<span style="grid-column:${mcol(y,o,i)+1}">${m.slice(0,3)}</span>`).join(''),g=`grid-template-columns:repeat(${W},minmax(0,1fr))`;
    return `<div class="yw"><div class="yl">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<span>${x}</span>`).join('')}</div><div class="yview" id="yv"><div class="ypan" style="width:${W/VIS*100}%"><div class="ym" style="${g}">${lb}</div><div class="yg" style="${g}">${c}</div></div></div></div>
     <input type="range" class="ys" id="ys" min="0" max="11" step="1" value="${ypos}" aria-label="Slide through months"><div class="mu ystat">${ad} active day${ad==1?"":"s"} · ${pf} perfect day${pf==1?"":"s"} in ${y}</div>`};
  const mv=d=>{const y=d.getFullYear(),m=d.getMonth(),f=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();let c='<i class="e"></i>'.repeat(f);for(let i=1;i<=n;i++)c+=sq(`${y}-${p(m+1)}-${p(i)}`);
    return `<div class="mcard"><div class="mh">${M[m]} ${y}</div><div class="mg">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<b>${x}</b>`).join('')}${c}</div></div>`};
  /* ---- activity graph: completed habits per day, week (Sun-Sat) or month ---- */
  const series=()=>{if(act=='week'){const s=Habits.add(T,-Habits.dow(T));return Array.from({length:7},(_,i)=>{const k=Habits.add(s,i);return[Habits.count(D,k),'Sun Mon Tue Wed Thu Fri Sat'.split(' ')[i],k]})}
    const y=+T.slice(0,4),m=+T.slice(5,7);return Array.from({length:new Date(y,m,0).getDate()},(_,i)=>{const k=`${y}-${p(m)}-${p(i+1)}`;return[Habits.count(D,k),(i+1)%5==0||i==0?String(i+1):'',k]})};
  const draw=()=>{const A=first;first=false;
    const L=Habits.sched(D,view),dn=D.log[view]||[],d=L.filter(h=>dn.includes(h.id)).length,fr=L.length?d/L.length:0,C=2*Math.PI*80,S=Habits.streak(D),all=series(),pts=all.filter(q=>q[2]<=T),
      mx=Math.ceil(Math.max(4,...pts.map(q=>q[0]))/4)*4,X=i=>40+i*(510/(all.length-1)),Y=v=>210-v/mx*170,P=pts.map((q,i)=>X(i)+','+Y(q[0])).join(' '),R=store.get(rk,null),pend=R&&!R.shown,S0=CONFIG.START_YEAR,atMin=cv=='year'?cm.getFullYear()<=S0:(cm.getFullYear()<=S0&&cm.getMonth()<=1);
    App.repaint(el,`<div class="grid"><div class="col">
     <div class="card hero"><div class="mu" style="float:right">${new Date(T+'T12:00').toDateString()}</div><div>Hello,</div><h1>${esc(U)} 👋</h1><div class="mu">Small steps. Big changes.</div></div>
     <div class="row2"><div class="card"><div class="mu">● ${view==T?'Today':view}</div><svg class="ring" width="220" height="220" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="none" stroke="var(--bd)" stroke-width="16"/><circle cx="100" cy="100" r="80" fill="none" stroke="var(--a1)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-shown)}" transform="rotate(-90 100 100)" id="rg"/><text x="100" y="105" text-anchor="middle" fill="var(--tx)" font-size="30" font-weight="700">${d} / ${L.length}</text><text x="100" y="128" text-anchor="middle" fill="var(--mu)" font-size="12">habits completed · ${Math.round(fr*100)}%</text></svg></div>
      <div class="card"><h3 style="display:flex;align-items:center;gap:10px"><button class="cbtn" data-a="pick" title="Pick a date">${IC.cal}</button>Daily Habits<span class="mu" style="margin-left:auto">${view==T?'Daily Checklist':view}</span></h3>
       ${L.map(h=>`<div class="habit ${dn.includes(h.id)?'done':''}" draggable="true" data-id="${h.id}"><span class="hi">${h.i}</span><span class="n">${esc(h.n)}</span><span class="mu nt">${esc(h.note||'—')}</span><button class="ib ${h.vis?'':'off'}" data-a="eye" title="${h.vis?'Visible to friends':'Hidden from friends'}">${h.vis?IC.eye:IC.eyeoff}</button><button class="ib" data-a="edit" title="Edit">${IC.edit}</button><span class="cb"></span></div>`).join('')}
       <div class="habit add" data-a="add"><span class="hi">+</span><span class="n">Custom habit</span></div></div></div>
     <div class="card"><div class="chead"><h3>Habit Heatmap</h3><div class="seg"><button data-a="cv" data-v="year" class="${cv=='year'?'on':''}">Year</button><button data-a="cv" data-v="month" class="${cv=='month'?'on':''}">Month</button></div>${cv=='year'?`<b>${cm.getFullYear()}</b>`:''}<button class="arr" data-a="cn" data-v="-1" ${atMin?'disabled':''}>‹</button><button class="arr" data-a="cn" data-v="1">›</button></div>
      <div class="hbody ${cv=='year'?'y':''}">${cv=='year'?yv():`<div class="months">${mv(new Date(cm.getFullYear(),cm.getMonth()-1,1))}${mv(cm)}</div>`}</div>
      <div class="leg">Less ${[0,1,2,3].map(i=>`<i class="lv${i}"></i>`).join('')} More</div></div></div>
    <div class="col"><div class="card"><div class="chead"><h3>Activity</h3><div class="seg"><button data-a="ac" data-v="week" class="${act=='week'?'on':''}">Week</button><button data-a="ac" data-v="month" class="${act=='month'?'on':''}">Month</button></div></div>
      <svg viewBox="0 0 600 245" width="100%"><g stroke="var(--bd)" fill="var(--mu)" font-size="11">${[0,1,2,3,4].map(i=>`<line x1="40" x2="590" y1="${Y(mx*i/4)}" y2="${Y(mx*i/4)}"/><text x="30" y="${Y(mx*i/4)+4}" text-anchor="end" stroke="none">${mx*i/4}</text>`).join('')}</g>
       <polygon points="40,210 ${P} ${X(pts.length-1)},210" fill="var(--a1)" opacity=".15"/><polyline points="${P}" fill="none" stroke="var(--a2)" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${A?1:0}">${A?'<animate attributeName="stroke-dashoffset" to="0" dur="1.2s" fill="freeze"/>':''}</polyline>
       ${pts.map((q,i)=>rose()?`<text x="${X(i)}" y="${Y(q[0])+6}" font-size="18" text-anchor="middle" fill="var(--a2)">♥</text>`:`<circle cx="${X(i)}" cy="${Y(q[0])}" r="5" fill="var(--a2)"/>`).join('')}
       ${all.map((q,i)=>`<text x="${X(i)}" y="232" fill="var(--mu)" font-size="12" text-anchor="middle">${q[1]}</text>`).join('')}</svg>
      <div class="streak"><span style="font-size:34px">🔥</span><div style="flex:1"><div class="mu">Current Streak</div><b>${S.cur} DAY${S.cur==1?"":"S"} STREAK</b></div><span class="mu">👑 Best: ${S.best} day${S.best==1?"":"s"}</span></div></div>
     <div class="card"><h3>Remarks</h3><textarea id="rm" placeholder="Write a note to your future self...">${pend?esc(R.text):''}</textarea><button class="btn" data-a="rs">Save remark</button><div class="mu" style="margin-top:8px">${pend?'Saved. It pops up the next day you log in.':'It pops up once, the next day you log in.'}</div></div></div></div>`);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const r=$('#rg');if(r){r.style.strokeDashoffset=C*(1-fr);shown=fr}pan()}))};
  const pan=smooth=>{const v=$('#yv');if(!v)return;const y=cm.getFullYear(),g=ygeo(y),cw=v.scrollWidth/g.W;v.scrollTo({left:Math.min(Math.max(0,(mcol(y,g.o,ypos)+2-VIS/2)*cw),v.scrollWidth-v.clientWidth),behavior:smooth?'smooth':'auto'})};
  el.oninput=e=>{if(e.target.id=='ys'){ypos=+e.target.value;pan(true)}};
  /* ---- interactions (delegated, set once) ---- */
  /* long-press: bar only appears after 180ms; a hold that is cancelled after that never counts as a click; a quick tap still ticks */
  let t1,t2,bar=false,down=false,blk=false,fired=false,sx=0,sy=0,dr=null;const stop=()=>{clearTimeout(t1);clearTimeout(t2);if(bar){blk=true;setTimeout(()=>blk=false,150)}bar=false;down=false;el.querySelectorAll('.lp').forEach(x=>x.classList.remove('lp'))};
  const byId=id=>D.habits.find(h=>h.id==id),del=id=>UI.confirm(`Delete “${esc(byId(id).n)}”?`,'Delete',()=>{D.habits=D.habits.filter(h=>h.id!=id);save()});
  el.onclick=e=>{const b=e.target.closest('[data-a]'),r=e.target.closest('.habit[data-id]'),a=b&&b.dataset.a,id=r&&r.dataset.id;
    if(a=='eye'){const h=byId(id);h.vis=!h.vis;return save()}
    if(a=='edit')return UI.habitForm(byId(id),(n,note,i)=>{Object.assign(byId(id),{n,note,i});save()});
    if(a=='add')return UI.habitForm(null,(n,note,i)=>{D.habits.push({id:'h'+Date.now(),n,note,i,vis:true,created:T});save()});
    if(a=='pick')return UI.datePick(D.joined,T,view,k=>{view=k;draw()});
    if(a=='cv'){cv=b.dataset.v;ypos=null;return draw()}if(a=='ac'){act=b.dataset.v;return draw()}
    if(a=='cn'){const n=+b.dataset.v,nd=cv=='year'?new Date(cm.getFullYear()+n,cm.getMonth(),1):new Date(cm.getFullYear(),cm.getMonth()+n,1);if(nd<new Date(CONFIG.START_YEAR,cv=='year'?0:1,1))return;cm=nd;ypos=null;return draw()}
    if(a=='rs'){const v=$('#rm').value.trim();const nv=v?{text:v,saved:T,shown:false}:null;store.set(rk,nv);Sync.push('remark',nv);return draw()}
    if(r&&!fired&&!blk&&view<=T){const t=D.log[view]=D.log[view]||[],i=t.indexOf(id);i<0?t.push(id):t.splice(i,1);save()}fired=false};
  el.onpointerdown=e=>{const r=e.target.closest('.habit[data-id]');if(!r||e.target.closest('button'))return;fired=false;down=true;sx=e.clientX;sy=e.clientY;t1=setTimeout(()=>{bar=true;r.classList.add('lp')},180);t2=setTimeout(()=>{bar=false;down=false;fired=true;r.classList.remove('lp');del(r.dataset.id)},650)};
  el.onpointermove=e=>{if(down&&Math.hypot(e.clientX-sx,e.clientY-sy)>8)stop()};el.onpointerup=el.onpointercancel=stop;
  el.ondragstart=e=>{const r=e.target.closest('.habit[data-id]');if(!r)return;stop();dr=r.dataset.id;r.classList.add('drag')};
  el.ondragover=e=>{if(dr&&e.target.closest('.habit[data-id]'))e.preventDefault()};
  el.ondrop=e=>{const r=e.target.closest('.habit[data-id]');if(!dr||!r||r.dataset.id==dr)return;const ia=D.habits.findIndex(h=>h.id==dr),ib=D.habits.findIndex(h=>h.id==r.dataset.id),[x]=D.habits.splice(ia,1);D.habits.splice(ib,0,x);dr=null;save()};
  el.ondragend=()=>{dr=null;el.querySelectorAll('.drag').forEach(x=>x.classList.remove('drag'))};
  /* remark saved yesterday or earlier pops up once */
  const R0=store.get(rk,null);if(R0&&!R0.shown&&R0.saved<T){R0.shown=true;store.set(rk,R0);Sync.push('remark',R0);UI.modal(`<h3>💌 Your remark</h3><p style="margin:12px 0 18px;white-space:pre-wrap">${esc(R0.text)}</p><button class="btn" id="o">Got it</button>`,(m,c)=>m.querySelector('#o').onclick=c)}
  draw()}};
