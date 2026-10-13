/* ===== PAGE: SKILL LEARNING. Data: social.js. Popups: ui.js. Redraw only via App.repaint. =====
   100% of tasks ticked = skill completed automatically. Creator controls (edit/delete) live in the card's ⋯ menu. */
window.Pages=window.Pages||{};
Pages.skills={render(el,u){
  const U=u.username,FL=[['all','All programs'],['joined','Joined'],['done','Completed'],['created','Created by me']];
  let openId=null,box=null,filter='all',menuId=null,fopen=false;
  const nm=p=>Object.keys(Social.mem(p.id)).filter(x=>x!=p.creator).length;   // members, not counting the creator
  const pct=p=>{const m=Social.mem(p.id)[U];return m?Math.round(m.done.filter(d=>p.tasks.some(t=>t.id==d)).length/p.tasks.length*100):0};
  const btns=p=>{const m=Social.mem(p.id)[U];if(p.creator==U)return '';
    if(!m)return `<button class="joinb" data-a="join" data-id="${p.id}">Join</button>`;
    return `${m.status=='completed'?'<span class="badge approved">Completed ✓</span>':'<button class="joinb on" disabled>Joined</button>'}<button class="sm bad" data-a="leave" data-id="${p.id}">Give up</button>`};
  const card=p=>{const m=Social.mem(p.id)[U],n=nm(p),mine=p.creator==U;
    return `<div class="pc"><div class="ph"><b>${esc(p.name)}</b>${mine?`<button class="kebab" data-a="menu" data-id="${p.id}" title="Settings">⋯</button>`:''}
      ${menuId==p.id?`<div class="pmenu"><button data-a="edit" data-id="${p.id}">⚙ Creator controls</button><button class="bad" data-a="del" data-id="${p.id}">🗑 Delete</button></div>`:''}</div>
      <p class="mu pd">${esc(p.desc||'')}</p><div class="mu">Created by <b>${mine?'you':esc(p.creator)}</b> · ${n} member${n==1?'':'s'} · ${p.tasks.length} task${p.tasks.length==1?'':'s'}</div>
      ${m?`<div class="prg"><span>Progress</span><span>${pct(p)}%</span></div><div class="pbar"><i style="width:${pct(p)}%"></i></div>`:''}
      ${!m&&!mine?btns(p):`<button class="resume" data-a="open" data-id="${p.id}">Resume</button>${mine?'':`<div class="prow">${btns(p)}</div>`}`}</div>`};
  const draw=()=>{const P=Social.progs(),B=Social.board(),st=p=>(Social.mem(p.id)[U]||{}).status,act0=P.filter(p=>st(p)=='joined'),
      goal=[...act0].sort((a,b)=>pct(b)-pct(a))[0],doneN=P.filter(p=>p.creator!=U&&st(p)=='completed').length,
      L=P.filter(p=>filter=='all'||(filter=='joined'&&st(p)=='joined'&&p.creator!=U)||(filter=='done'&&st(p)=='completed')||(filter=='created'&&p.creator==U));
    App.repaint(el,`<div class="col"><div class="card hero shead"><div><h1>Skill Learning</h1><div class="mu">Create learning programs, join others and track your progress.</div></div>
      <div class="sact"><div class="dd"><button class="fsel" data-a="fd">${FL.find(x=>x[0]==filter)[1]} <span>▾</span></button>${fopen?`<div class="dmenu">${FL.map(([v,l])=>`<button class="${v==filter?'on':''}" data-a="fo" data-v="${v}">${l}</button>`).join('')}</div>`:''}</div><button class="btn add" data-a="new">+ Add program</button></div></div>
     <div class="stats"><div class="card stat"><div class="sl">Skills Tracked</div><div class="sv">${act0.length}</div><div class="mu">Active skills</div></div>
      <div class="card stat"><div class="sl">Completed</div><div class="sv">${doneN}</div><div class="mu">Programs you completed</div></div>
      <div class="card stat"><div class="sl">Current Progress</div><div class="sv sg">${goal?`${esc(goal.name)}: ${pct(goal)}%`:'None yet'}</div><div class="mu">${goal?'Your top program in progress':'Join a program to get started'}</div></div></div>
     <div class="stats"><div class="card span2"><h3>Courses &amp; Skill Paths</h3><div class="pgrid">${L.length?L.map(card).join(''):'<p class="mu">Nothing here yet. Add a program or change the filter.</p>'}</div></div>
      <div class="card"><h3>🏆 Leaderboard</h3>${B.length?B.slice(0,10).map(([n,c],i)=>`<div class="fa"><span style="width:24px">${['🥇','🥈','🥉'][i]||i+1}</span><span class="av">${esc(n[0].toUpperCase())}</span><div style="flex:1">${esc(n)}${n==U?' (you)':''}</div><b>${c}</b></div>`).join(''):'<p class="mu">No completed programs yet.</p>'}<div class="mu" style="margin-top:8px">Completed programs</div></div></div></div>`)};
  /* checkbox popup */
  const detail=()=>{const p=Social.progs().find(x=>x.id==openId);if(!p){box.parentNode.remove();openId=null;return}
    const m=Social.mem(p.id)[U],mine=p.creator==U,y=box.scrollTop;
    box.innerHTML=`<h2>${esc(p.name)}</h2><div class="mu">Created by <b>${mine?'you':esc(p.creator)}</b> · ${nm(p)} member${nm(p)==1?'':'s'}</div><p style="margin:12px 0;white-space:pre-wrap">${esc(p.desc||'')}</p>
     ${m?`<div class="pbar"><i style="width:${pct(p)}%"></i></div><div class="mu">${pct(p)}% complete${m.status=='completed'?' · Completed ✓':''}</div>`:''}
     <div class="prow" style="margin:12px 0">${btns(p)}</div><div class="mu">${mine?'Your own programs do not count on the leaderboard.':''}</div><div class="err" id="dm"></div>
     ${p.tasks.map((t,i)=>`<div class="habit task ${m&&m.done.includes(t.id)?'done':''}" data-t="${t.id}"><span class="mu">${i+1}</span><span class="n">${esc(t.t)}</span><a class="sm" href="${esc(t.url)}" target="_blank" rel="noopener">Open ↗</a><span class="cb"></span></div>`).join('')}`;box.scrollTop=y};
  const refresh=()=>{draw();if(openId&&box.isConnected)detail();else openId=null};
  const open=id=>UI.modal('',m=>{box=m;m.classList.add('xl');openId=id;detail();
    m.onclick=e=>{const b=e.target.closest('[data-a]');if(b)return act(b.dataset.a,b.dataset.id);const r=e.target.closest('.task');if(!r||e.target.closest('a'))return;
      if(!Social.mem(openId)[U]){if(Social.progs().find(x=>x.id==openId).creator!=U){$('#dm',m).textContent='Join this program to track your tasks.';return}Social.join(openId,U)}
      Social.toggle(openId,U,r.dataset.t);refresh()}});
  /* creator controls / new program */
  const form=p=>{let T=p?p.tasks.map(t=>({...t})):[{id:uuid(),t:'',url:''}];
    UI.modal('',m=>{m.classList.add('xl');const q=s=>m.querySelector(s),rows=()=>q('#tl').innerHTML=T.map((t,i)=>`<div class="trow"><span class="tn">${i+1}</span><input data-k="t" data-i="${i}" placeholder="Task title" value="${esc(t.t)}"><input data-k="url" data-i="${i}" placeholder="https://link" value="${esc(t.url)}"><button class="ib" data-x="${i}" title="Remove">✕</button></div>`).join('');
      m.innerHTML=`<h3>${p?'Creator controls':'New skill program'}</h3><div class="mu" style="margin-bottom:12px">${p?`Edit the details and tasks of “${esc(p.name)}”.`:'Name it, describe it, and add the tasks learners will follow.'}</div>
       <input id="pn" placeholder="Program name" value="${esc(p?p.name:'')}"><textarea id="pd" placeholder="Description" style="min-height:64px">${esc(p?p.desc||'':'')}</textarea>
       <div class="sec">Tasks</div><div id="tl"></div><div class="mrow" style="margin-top:8px"><button class="btn ghost" id="ta">+ Add task</button><button class="btn ghost" id="tg">Paste links</button></div>
       <div id="tbw" hidden><textarea id="tb" placeholder="One link per line"></textarea><button class="btn ghost" id="tp">Add as tasks</button></div>
       <div class="err" id="pe"></div><div class="mrow"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="s">Save</button></div>`;
      rows();m.oninput=e=>{const i=e.target.dataset.i;if(i!=null)T[i][e.target.dataset.k]=e.target.value};
      m.onclick=e=>{const x=e.target.closest('[data-x]');if(x){T.splice(+x.dataset.x,1);rows()}};
      q('#c').onclick=()=>m.parentNode.click();q('#ta').onclick=()=>{T.push({id:uuid(),t:'',url:''});rows()};q('#tg').onclick=()=>q('#tbw').hidden=!q('#tbw').hidden;
      q('#tp').onclick=()=>{T=T.filter(x=>x.t||x.url);q('#tb').value.split('\n').map(s=>s.trim()).filter(Boolean).forEach(l=>T.push({id:uuid(),t:'Task '+(T.length+1),url:l}));q('#tb').value='';q('#tbw').hidden=true;rows()};
      q('#s').onclick=()=>{const err=s=>q('#pe').textContent=s,n=q('#pn').value.trim(),R=T.filter(x=>x.t.trim()||x.url.trim());
        if(!n)return err('Give the program a name');if(!R.length)return err('Add at least one task');if(R.some(x=>!x.url.trim()))return err('Every task needs a link');
        Social.saveProg({id:p?p.id:uuid(),name:n,desc:q('#pd').value.trim(),creator:p?p.creator:U,created:p?p.created:Date.now(),
          tasks:R.map(x=>({id:x.id,t:x.t.trim()||x.url.trim(),url:/^https?:\/\//i.test(x.url.trim())?x.url.trim():'https://'+x.url.trim()}))});
        m.parentNode.click();refresh()}})};
  const delFlow=p=>UI.modal(`<h3>Delete “${esc(p.name)}”?</h3><p class="mu" style="margin-bottom:10px">This removes the program and everyone's progress. Type <b>DELETE</b> to confirm.</p><input id="dc" placeholder="DELETE" autocomplete="off"><div class="mrow" style="margin-top:8px"><button class="btn ghost" id="c">Cancel</button><button class="btn red" id="o" disabled>Delete</button></div>`,
    (m,c)=>{const i=m.querySelector('#dc'),o=m.querySelector('#o');i.focus();i.oninput=()=>o.disabled=i.value!='DELETE';m.querySelector('#c').onclick=c;o.onclick=()=>{c();Social.delProg(p.id);refresh()}});
  const act=(a,id)=>{const p=id&&Social.progs().find(x=>x.id==id);
    if(a=='open')return open(id);if(a=='new')return form();if(a=='edit')return form(p);if(a=='del')return delFlow(p);
    if(a=='leave')return UI.confirm('Give up this program? Your progress will be lost.','Give up',()=>{Social.leave(id,U);refresh()});
    if(a=='join')Social.join(id,U);refresh()};
  /* the card itself does nothing; only its buttons act */
  el.onclick=e=>{const b=e.target.closest('[data-a]'),a=b&&b.dataset.a;
    if(a=='menu'){menuId=menuId==b.dataset.id?null:b.dataset.id;fopen=false;return draw()}
    if(a=='fd'){fopen=!fopen;menuId=null;return draw()}
    if(a=='fo'){filter=b.dataset.v;fopen=false;return draw()}
    if(menuId||fopen){menuId=null;fopen=false;draw()}
    if(b)act(a,b.dataset.id)};
  Social.hook=refresh;Social.wantFH=false;
  if(sb){el.innerHTML='<div class="card mu">Loading…</div>';Social.refresh().then(()=>refresh())}else draw()}};
