/* ===== PAGE: CALENDAR (working: month nav, today highlight, per-user events) ===== */
window.Pages=window.Pages||{};
Pages.calendar={render(el,u){
  const key='hf_events_'+u.username,E=store.get(key,{});let d=new Date(),sel=null;d.setDate(1);
  const iso=(y,m,dd)=>`${y}-${String(m+1).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  const draw=()=>{const y=d.getFullYear(),m=d.getMonth(),first=d.getDay(),n=new Date(y,m+1,0).getDate(),t=new Date(),ti=iso(t.getFullYear(),t.getMonth(),t.getDate());
   let cells=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="h">${x}</div>`).join('')+'<div></div>'.repeat(first);
   for(let i=1;i<=n;i++){const k=iso(y,m,i),ev=E[k]||[];cells+=`<button class="day ${k==ti?'today':''} ${k==sel?'sel':''}" data-k="${k}">${i}<div>${ev.map(()=>'<span class="dot"></span>').join('')}</div></button>`}
   const ev=sel?E[sel]||[]:[];
   App.repaint(el,`<div class="grid"><div class="card"><div class="cal-h"><button id="pv">‹</button><h3 style="margin:0">${d.toLocaleString('default',{month:'long'})} ${y}</h3><button id="nx">›</button></div><div class="cal">${cells}</div></div>
    <div class="card"><h3>${sel||'Pick a day'}</h3>${sel?`<input id="ei" placeholder="Add an event or reminder"><button class="btn" id="ea">Add event</button>${ev.map((x,i)=>`<div class="ev">${x}<button data-d="${i}" style="color:var(--dg)">✕</button></div>`).join('')||'<p class="mu" style="margin-top:10px">No events yet.</p>'}`:'<p class="mu">Select a date to see or add events.</p>'}</div></div>`);
   $('#pv').onclick=()=>{d.setMonth(m-1);draw()};$('#nx').onclick=()=>{d.setMonth(m+1);draw()};
   el.querySelectorAll('.day').forEach(b=>b.onclick=()=>{sel=b.dataset.k;draw()});
   if(sel){$('#ea').onclick=()=>{const v=$('#ei').value.trim();if(!v)return;(E[sel]=E[sel]||[]).push(v);store.set(key,E);draw()};
    el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{E[sel].splice(b.dataset.d,1);store.set(key,E);draw()})}};
  draw()}};
