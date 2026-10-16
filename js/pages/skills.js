/* ===== PAGE: SKILL LEARNING. Data: social.js. Popups: ui.js. Redraw only via App.repaint.
   New programs start Pending (admin approves them). 100% of tasks = completed. Deleting an approved program needs a reason + admin approval. ===== */
window.Pages=window.Pages||{};
Pages.skills={render(el,u){
  const U=u.username,isAdmin=u.role=='admin',T0=App.tok,FL=[['all','All programs'],['joined','Joined'],['done','Completed'],['created','Created by me']];
  let openId=null,box=null,filter='all',menuId=null,fopen=false;
  const live=p=>['approved','delete_requested'].includes(p.status||'approved');
  const nm=p=>Object.keys(Social.mem(p.id)).filter(x=>x!=p.creator).length;   // members, not counting the creator
  const pct=p=>{const m=Social.mem(p.id)[U];return m?Math.round(m.done.filter(d=>p.tasks.some(t=>t.id==d)).length/p.tasks.length*100):0};
  const stars=p=>{const r=Social.ratingOf(p.id,U),m=Social.mem(p.id)[U],can=m&&p.creator!=U,sh=can?r.mine:Math.round(r.avg);
    return `<div class="rate"><div class="stars ${can?'can':''}">${[5,4,3,2,1].map(i=>`<button class="${i<=sh?'on':''}" ${can?`data-a="rate" data-v="${i}" data-id="${p.id}"`:'disabled'} title="${i} star${i>1?'s':''}">★</button>`).join('')}</div><span class="mu">${r.n?`${r.avg.toFixed(1)} (${r.n})`:'No ratings yet'}${can?' · tap to rate':''}</span></div>`};
  const tag=p=>p.creator!=U?'':p.status=='pending'?'<span class="badge pending">Pending approval</span>':p.status=='rejected'?'<span class="badge blocked">Rejected</span>':p.status=='delete_requested'?'<span class="badge pending">Deletion requested</span>':'';
  const btns=p=>{const m=Social.mem(p.id)[U];if(p.creator==U)return '';
    if(!m)return `<button class="joinb" data-a="join" data-id="${p.id}">Join</button>`;
    return `${m.status=='completed'?'<span class="badge approved">Completed ✓</span>':'<button class="joinb on" disabled>Joined</button>'}<button class="sm bad" data-a="leave" data-id="${p.id}">Give up</button>`};
  const card=p=>{const m=Social.mem(p.id)[U],n=nm(p),mine=p.creator==U,r=Social.ratingOf(p.id,U);
    const foot=mine?(p.status=='rejected'?`<div class="two"><button class="sm bad" data-a="del" data-id="${p.id}">Delete</button><button class="resume" data-a="open" data-id="${p.id}">Resume</button></div>`:`<button class="resume" data-a="open" data-id="${p.id}">Resume</button>`)
      :!m?btns(p):`<button class="resume" data-a="open" data-id="${p.id}">Resume</button><div class="prow">${btns(p)}</div>`;
    return `<div class="pc"><div class="ph"><b>${esc(p.name)}</b>${mine?`<button class="kebab" data-a="menu" data-id="${p.id}" title="Settings">⋯</button>`:''}
      ${menuId==p.id?`<div class="pmenu"><button data-a="edit" data-id="${p.id}">⚙ Creator controls</button>${p.status=='delete_requested'?'<button disabled>Deletion requested</button>':`<button class="bad" data-a="del" data-id="${p.id}">🗑 Delete</button>`}</div>`:''}</div>
      ${tag(p)}<p class="mu pd">${esc(p.desc||'')}</p>${p.status=='rejected'?`<div class="rej">${p.reject?esc(p.reject):'Rejected by an admin.'}</div>`:''}
      <div class="mu">Created by <b>${mine?'you':esc(p.creator)}</b> · ${n} member${n==1?'':'s'} · ${p.tasks.length} task${p.tasks.length==1?'':'s'}${r.n?` · ★ ${r.avg.toFixed(1)}`:''}</div>
      ${m?`<div class="prg"><span>Progress</span><span>${pct(p)}%</span></div><div class="pbar"><i style="width:${pct(p)}%"></i></div>`:''}${foot}</div>`};
  const draw=()=>{const P=Social.progs().filter(p=>live(p)||p.creator==U),BA=Social.boardAll(),Fr=Social.friends(U),st=p=>(Social.mem(p.id)[U]||{}).status,act0=P.filter(p=>st(p)=='joined'),
      goal=[...act0].sort((a,b)=>pct(b)-pct(a))[0],doneN=P.filter(p=>st(p)=='completed').length,   /* finishing your own program counts */
      L=P.filter(p=>filter=='all'||(filter=='joined'&&st(p)=='joined'&&p.creator!=U)||(filter=='done'&&st(p)=='completed')||(filter=='created'&&p.creator==U));
    App.repaint(el,`<div class="col"><div class="card hero shead"><div><h1>Skill Learning</h1><div class="mu">Create learning programs, join others and track your progress.</div></div>
      <div class="sact"><div class="dd"><button class="fsel" data-a="fd">${FL.find(x=>x[0]==filter)[1]} <span>▾</span></button>${fopen?`<div class="dmenu">${FL.map(([v,l])=>`<button class="${v==filter?'on':''}" data-a="fo" data-v="${v}">${l}</button>`).join('')}</div>`:''}</div><button class="btn add" data-a="new">+ Add program</button></div></div>
     <div class="stats"><div class="card stat"><div class="sl">Skills Tracked</div><div class="sv">${act0.length}</div><div class="mu">Active skills</div></div>
      <div class="card stat"><div class="sl">Completed</div><div class="sv">${doneN}</div><div class="mu">Programs you completed</div></div>
      <div class="card stat"><div class="sl">Current Progress</div><div class="sv sg">${goal?`${esc(goal.name)}: ${pct(goal)}%`:'None yet'}</div><div class="mu">${goal?'Your top program in progress':'Join a program to get started'}</div></div></div>
     <div class="stats"><div class="card span2"><h3>Courses &amp; Skill Paths</h3><div class="pgrid">${L.length?L.map(card).join(''):'<p class="mu">Nothing here yet. Add a program or change the filter.</p>'}</div></div>
      <div class="card"><h3>🏆 Leaderboard</h3><div class="lbl">${BA.map(([n,c],i)=>People.row(n,i,c,U,Fr)).join('')}</div><div class="mu" style="margin-top:8px">Completed programs · you and your friends are highlighted · click a name</div></div></div></div>`)};
  /* checkbox popup */
  const detail=()=>{const p=Social.progs().find(x=>x.id==openId);if(!p){box.parentNode.remove();openId=null;return}
    const m=Social.mem(p.id)[U],mine=p.creator==U,y=box.scrollTop;
    box.innerHTML=`<h2>${esc(p.name)}</h2><div class="mu">Created by <b>${mine?'you':esc(p.creator)}</b> · ${nm(p)} member${nm(p)==1?'':'s'} ${tag(p)}</div><p style="margin:12px 0;white-space:pre-wrap">${esc(p.desc||'')}</p>${stars(p)}
     ${m?`<div class="pbar"><i style="width:${pct(p)}%"></i></div><div class="mu">${pct(p)}% complete${m.status=='completed'?' · Completed ✓':''}</div>`:''}
     <div class="prow" style="margin:12px 0">${btns(p)}</div><div class="err" id="dm"></div>
     ${p.tasks.map((t,i)=>`<div class="habit task ${m&&m.done.includes(t.id)?'done':''}" data-t="${t.id}"><span class="mu">${i+1}</span><span class="n">${esc(t.t)}</span><a class="sm" href="${esc(t.url)}" target="_blank" rel="noopener">Open ↗</a><span class="cb"></span></div>`).join('')}`;box.scrollTop=y};
  const refresh=()=>{draw();if(openId&&box.isConnected)detail();else openId=null};
  const open=id=>UI.modal('',m=>{box=m;m.classList.add('xl');openId=id;detail();
    m.onclick=e=>{const b=e.target.closest('[data-a]');if(b)return act(b.dataset.a,b.dataset.id,b.dataset.v);const r=e.target.closest('.task');if(!r||e.target.closest('a'))return;
      if(!Social.mem(openId)[U]){if(Social.progs().find(x=>x.id==openId).creator!=U){$('#dm',m).textContent='Join this program to track your tasks.';return}Social.join(openId,U)}
      Social.toggle(openId,U,r.dataset.t);refresh()}});
  /* creator controls / new program */
  const form=p=>{let T=p?p.tasks.map(t=>({...t})):[{id:uuid(),t:'',url:''}];
    UI.modal('',m=>{m.classList.add('xl');const q=s=>m.querySelector(s),rows=()=>q('#tl').innerHTML=T.map((t,i)=>`<div class="trow"><span class="tn">${i+1}</span><input data-k="t" data-i="${i}" placeholder="Task title" value="${esc(t.t)}"><input data-k="url" data-i="${i}" placeholder="https://link" value="${esc(t.url)}"><button class="ib" data-x="${i}" title="Remove">✕</button></div>`).join('');
      m.innerHTML=`<h3>${p?'Creator controls':'New skill program'}</h3><div class="mu" style="margin-bottom:12px">${p?`Edit the details and tasks of “${esc(p.name)}”.`:isAdmin?'Name it, describe it, and add the tasks learners will follow.':'An admin reviews new programs before others can see them. You can keep editing while it is pending.'}</div>
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
        Social.saveProg({id:p?p.id:uuid(),name:n,desc:q('#pd').value.trim(),creator:p?p.creator:U,status:p?p.status:(isAdmin?'approved':'pending'),reject:p?p.reject:'',delReason:p?p.delReason:'',created:p?p.created:Date.now(),
          tasks:R.map(x=>({id:x.id,t:x.t.trim()||x.url.trim(),url:/^https?:\/\//i.test(x.url.trim())?x.url.trim():'https://'+x.url.trim()}))});
        m.parentNode.click();refresh()}})};
  /* delete: pending/rejected = delete now (type DELETE). approved = reason, then type DELETE, then wait for an admin */
  const typeDel=(p,intro,then)=>UI.modal(`<h3>Delete “${esc(p.name)}”?</h3><p class="mu" style="margin-bottom:10px">${intro} Type <b>DELETE</b> to confirm.</p><input id="dc" placeholder="DELETE" autocomplete="off"><div class="mrow" style="margin-top:8px"><button class="btn ghost" id="c">Cancel</button><button class="btn red" id="o" disabled>Delete</button></div>`,
    (m,c)=>{const i=m.querySelector('#dc'),o=m.querySelector('#o');i.focus();i.oninput=()=>o.disabled=i.value!='DELETE';m.querySelector('#c').onclick=c;o.onclick=()=>{c();then()}});
  const delFlow=p=>{if(p.status!='approved')return typeDel(p,"This removes the program and everyone's progress.",()=>{Social.delProg(p.id);refresh()});
    UI.modal(`<h3>Delete “${esc(p.name)}”?</h3><p class="mu" style="margin-bottom:10px">An admin has to approve deleting a published program. Tell them why.</p><textarea id="rs" placeholder="Reason for deleting"></textarea><div class="mrow" style="margin-top:8px"><button class="btn ghost" id="c">Cancel</button><button class="btn" id="o" disabled>Continue</button></div>`,(m,c)=>{
      const rs=m.querySelector('#rs'),o=m.querySelector('#o');rs.focus();rs.oninput=()=>o.disabled=!rs.value.trim();m.querySelector('#c').onclick=c;
      o.onclick=()=>{const reason=rs.value.trim();c();setTimeout(()=>typeDel(p,'Your request goes to an admin.',()=>{Social.requestDelete(p.id,reason);refresh();
        UI.modal('<h3>Request sent</h3><p style="margin:8px 0 14px">Your program will be deleted once an admin approves it.</p><button class="btn" id="k">OK</button>',(m2,c2)=>m2.querySelector('#k').onclick=c2)}),230)}})};
  const act=(a,id,v)=>{const p=id&&Social.progs().find(x=>x.id==id);
    if(a=='open')return open(id);if(a=='new')return form();if(a=='edit')return form(p);if(a=='del')return delFlow(p);
    if(a=='rate'){Social.rate(id,U,+v);return refresh()}
    if(a=='leave')return UI.confirm('Give up this program? Your progress will be lost.','Give up',()=>{Social.leave(id,U);refresh()});
    if(a=='join')Social.join(id,U);refresh()};
  /* the card itself does nothing; only its buttons act */
  el.onclick=e=>{const b=e.target.closest('[data-a]'),a=b&&b.dataset.a;
    const ur=e.target.closest('[data-u]');if(ur&&!b){menuId=null;fopen=false;return People.open(ur.dataset.u,refresh)}
    if(a=='menu'){menuId=menuId==b.dataset.id?null:b.dataset.id;fopen=false;return draw()}
    if(a=='fd'){fopen=!fopen;menuId=null;return draw()}
    if(a=='fo'){filter=b.dataset.v;fopen=false;return draw()}
    if(menuId||fopen){menuId=null;fopen=false;draw()}
    if(b)act(a,b.dataset.id,b.dataset.v)};
  Social.hook=refresh;Social.wantFH=false;
  /* show what we already have instantly, refresh quietly in the background */
  const cold=sb&&store.get('hf_programs',null)===null;
  if(cold)el.innerHTML='<div class="card mu">Loading…</div>';else draw();
  if(sb)Social.refresh().then(ch=>{if(App.tok==T0&&(ch||cold))refresh()})}};
