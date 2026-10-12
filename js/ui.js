/* ===== SHARED UI: translucent popups, habit form, date picker, rose heart-click effect. Use these on every page. ===== */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const svg=p=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC={eye:svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),eyeoff:svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>'),
  edit:svg('<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>'),cal:svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>').replace(/18/g,'22')};
IC.gear=svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>').replace(/18/g,'22');
const LOGO='<svg viewBox="0 0 100 100" width="34" height="34"><rect width="100" height="100" rx="22" fill="#1b1b1b"/><g stroke="#d4b8fb" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M26 60L55 32"/><path d="M54 46L72 63"/><path d="M36 67L48 55L60 66"/></g></svg>';
const UI={
  MONTHS:['January','February','March','April','May','June','July','August','September','October','November','December'],
  ICONS:['📖','🏋','💜','🌙','💧','💻','📵','🎯','🏃','🧘','🍎','😴','🎵','✍️','🧹','💊','🚭','☕','🌱','🧠','💰','📚','🔥','🚴'],
  modal(html,mount){const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="mod">${html}</div>`;
    const kd=e=>{if(e.key=='Escape')close()},close=()=>{document.removeEventListener('keydown',kd);o.classList.add('out');setTimeout(()=>o.remove(),160)};
    o.onclick=e=>{if(e.target==o)close()};document.addEventListener('keydown',kd);document.body.appendChild(o);mount&&mount(o.firstChild,close);return close},
  confirm(msg,label,fn){this.modal(`<h3>${msg}</h3><div class="mrow"><button class="btn ghost" id="c">Cancel</button><button class="btn red" id="o">${label}</button></div>`,(m,c)=>{m.querySelector('#c').onclick=c;m.querySelector('#o').onclick=()=>{c();fn()}})},
  habitForm(h,save){let ic=h?h.i:this.ICONS[7];
    this.modal(`<h3>${h?'Edit habit':'New habit'}</h3><input id="hn" placeholder="Habit name" value="${esc(h?h.n:'')}"><input id="ht" placeholder="Note (e.g. 2h 30m)" value="${esc(h?h.note:'')}">
     <div class="icons">${this.ICONS.map(i=>`<button data-i="${i}" class="${i==ic?'on':''}">${i}</button>`).join('')}</div><div class="err" id="he"></div>
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
