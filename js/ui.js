/* ===== SHARED UI: translucent popups, habit form, date picker, rose heart-click effect. Use these on every page. ===== */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const svg=p=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC={eye:svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),eyeoff:svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>'),
  edit:svg('<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>'),cal:svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>').replace(/18/g,'22')};
IC.gear=svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>').replace(/18/g,'22');
IC.shield=svg('<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>').replace(/18/g,'22');
const LOGO='<svg viewBox="0 0 100 100" width="34" height="34"><rect width="100" height="100" rx="22" fill="#1b1b1b"/><g stroke="#d4b8fb" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M26 60L55 32"/><path d="M54 46L72 63"/><path d="M36 67L48 55L60 66"/></g></svg>';
const svgS=(p,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
IC.nav={home:svgS('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',20),skills:svgS('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',20),
  friends:svgS('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M19 8v6M16 11h6"/>',20),calendar:svgS('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',20),
  finance:svgS('<path d="M3 8h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 8l12-4v4"/><circle cx="16.5" cy="14" r="1.2"/>',20),notifs:svgS('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',20)};
const HI={book:'<path d="M12 6c-2-1.5-5-2-9-2v14c4 0 7 .5 9 2 2-1.5 5-2 9-2V4c-4 0-7 .5-9 2z"/><path d="M12 6v14"/>',dumbbell:'<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',heart:'<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',code:'<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
  phoneoff:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2M3 3l18 18"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  run:'<circle cx="12" cy="14" r="7"/><path d="M12 14v-4M9 3h6M12 7V3"/>',lotus:'<path d="M12 20c-4 0-8-3-8-8 4 0 7 2 8 5 1-3 4-5 8-5 0 5-4 8-8 8z"/><path d="M12 17c-2-3-2-8 0-12 2 4 2 9 0 12z"/>',
  apple:'<path d="M12 7c-2-2-6-1-6 4 0 5 3 9 6 9s6-4 6-9c0-5-4-6-6-4z"/><path d="M12 7c0-2 1-3 3-4"/>',sleep:'<path d="M4 7h6L4 15h6M14 4h5l-5 6h5M13 14h4l-4 5h4"/>',
  music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',pen:'<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',broom:'<path d="M14 3l-3 8M8 11h10l-1 10H6zM9 21l1-6M13 21l1-6"/>',
  pill:'<path d="M10.5 20.5a5 5 0 0 1-7-7l9-9a5 5 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/>',nosmoke:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8M8 14h8"/>',
  coffee:'<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2"/>',sprout:'<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6v1.5M12 16.5V18"/>',
  books:'<path d="M5 3v18M10 3v18M15 5l4 .8-3 16-4-.8z"/>',flame:'<path d="M12 3c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>',bike:'<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8H8M13 8l-2 8"/>'};
const HLEGACY={'📖':'book','🏋':'dumbbell','💜':'heart','🌙':'moon','💧':'drop','💻':'code','📵':'phoneoff','🎯':'target','🏃':'run','🧘':'lotus','🍎':'apple','😴':'sleep','🎵':'music','✍️':'pen','🧹':'broom','💊':'pill','🚭':'nosmoke','☕':'coffee','🌱':'sprout','🧠':'brain','💰':'coin','📚':'books','🔥':'flame','🚴':'bike'};   // habits saved with old emoji icons still show
const UI={
  hkey(v){return HI[v]?v:HLEGACY[v]||null},hicon(v,s){const k=this.hkey(v);return k?svgS(HI[k],s||20):esc(v||'')},
  MONTHS:['January','February','March','April','May','June','July','August','September','October','November','December'],
  ICONS:Object.keys(HI),
  modal(html,mount){const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="mod">${html}</div>`;
    const kd=e=>{if(e.key=='Escape')close()},close=()=>{document.removeEventListener('keydown',kd);o.classList.add('out');setTimeout(()=>o.remove(),200)};
    o.onclick=e=>{if(e.target==o)close()};document.addEventListener('keydown',kd);document.body.appendChild(o);mount&&mount(o.firstChild,close);return close},
  /* sliding switch (pill glides from the old option to the new one) + one-shot content swap animation */
  segPrev:{},swap:{},
  seg(id,a,items,cur){const i=Math.max(0,items.findIndex(x=>x[0]==cur)),p=this.segPrev[id]??i;this.segPrev[id]=i;return `<div class="seg" style="--n:${items.length};--i:${i};--from:${p}"><i class="pill"></i>${items.map(([v,l,x])=>`<button data-a="${a}" data-v="${v}" class="${v==cur?'on':''}">${l}${x||''}</button>`).join('')}</div>`},
  sw(k){if(this.swap[k]){delete this.swap[k];return ' swap'}return ''},
  confirm(msg,label,fn){this.modal(`<h3>${msg}</h3><div class="mrow"><button class="btn ghost" id="c">Cancel</button><button class="btn red" id="o">${label}</button></div>`,(m,c)=>{m.querySelector('#c').onclick=c;m.querySelector('#o').onclick=()=>{c();fn()}})},
  habitForm(h,save){let ic=h?(this.hkey(h.i)||h.i):'target';
    this.modal(`<h3>${h?'Edit habit':'New habit'}</h3><input id="hn" placeholder="Habit name" value="${esc(h?h.n:'')}"><input id="ht" placeholder="Note (e.g. 2h 30m)" value="${esc(h?h.note:'')}">
     <div class="icons">${this.ICONS.map(i=>`<button data-i="${i}" class="${i==ic?'on':''}" title="${i}">${this.hicon(i,22)}</button>`).join('')}</div><div class="err" id="he"></div>
     <div class="mrow"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="s">Save</button></div>`,(m,c)=>{
      m.querySelector('.icons').onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;ic=b.dataset.i;m.querySelectorAll('.icons button').forEach(x=>x.classList.toggle('on',x==b))};
      m.querySelector('#c').onclick=c;m.querySelector('#hn').focus();
      m.querySelector('#s').onclick=()=>{const n=m.querySelector('#hn').value.trim();if(!n){m.querySelector('#he').textContent='Give the habit a name';return}save(n,m.querySelector('#ht').value.trim(),ic);c()}})},
  datePick(min,max,cur,pick){const[mn,mx]=[min,max].map(k=>k.split('-').map(Number));let[y,m]=cur.split('-').map(Number),p=n=>String(n).padStart(2,'0');
    this.modal('<div></div>',(box,close)=>{const draw=()=>{
      if(y==mn[0]&&m<mn[1])m=mn[1];if(y==mx[0]&&m>mx[1])m=mx[1];
      const f=new Date(y,m-1,1).getDay(),n=new Date(y,m,0).getDate(),ys=[];for(let i=mn[0];i<=mx[0];i++)ys.push(i);
      const ms=this.MONTHS.map((x,i)=>[x,i+1]).filter(([,i])=>(y>mn[0]||i>=mn[1])&&(y<mx[0]||i<=mx[1]));
      let d='';for(let i=1;i<=n;i++){const k=`${y}-${p(m)}-${p(i)}`;d+=`<button class="day ${k==cur?'sel':''}" data-k="${k}" ${k<min||k>max?'disabled':''}>${i}</button>`}
      box.firstChild.innerHTML=`<div class="dph"><select id="dm">${ms.map(([x,i])=>`<option value="${i}" ${i==m?'selected':''}>${x}</option>`).join('')}</select><select id="dy">${ys.map(i=>`<option ${i==y?'selected':''}>${i}</option>`).join('')}</select></div>
       <div class="cal dpc">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(x=>`<div class="h">${x}</div>`).join('')}${'<div></div>'.repeat(f)}${d}</div>`;
      box.querySelector('#dm').onchange=e=>{m=+e.target.value;draw()};box.querySelector('#dy').onchange=e=>{y=+e.target.value;draw()};
      box.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{pick(b.dataset.k);close()})};draw()})}
};
/* rose blush: every click emits a heart */
document.addEventListener('click',e=>{if(document.documentElement.dataset.theme!=='rose')return;const s=document.createElement('span');s.className='heart';s.textContent='♥';
  s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';s.style.setProperty('--dx',(Math.random()*70-35)+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),900)},true);
