/* ===== ADMIN POPUP (admin icon in the top bar, role=admin only): Users tab + Programs tab (review, approve/reject, delete requests) ===== */
const AdminUI={tab:'users',
  open(t){const me=Auth.current();if(!me||me.role!='admin')return;this.tab=t||'users';
    UI.modal('<div class="sub">Loading…</div>',m=>{m.classList.add('xxl','adm');this.m=m;this.draw(me);
      m.onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,id=b.dataset.id,v=b.dataset.v;
        if(a=='at'){this.tab=v;UI.swap.adm=1;return this.draw(me)}
        const redo=async()=>{if(sb)await Social.refresh();this.draw(me)};
        if(a=='remove')return UI.confirm('Remove this user?','Remove',async()=>{await Auth.removeUser(id);redo()});
        if(a=='approved'||a=='blocked'){await Auth.setStatus(id,a);return redo()}
        if(a=='papprove'){Social.review(id,'approve','');return redo()}
        if(a=='preject')return UI.modal('<h3>Reject program</h3><p class="mu" style="margin-bottom:8px">Tell the creator why. They will get this message.</p><textarea id="rn" placeholder="Reason (shown to the creator)"></textarea><div class="mrow" style="margin-top:8px"><button class="btn ghost" id="c">Cancel</button><button class="btn red" id="o">Reject</button></div>',(m2,c)=>{m2.querySelector('#c').onclick=c;m2.querySelector('#o').onclick=()=>{Social.review(id,'reject',m2.querySelector('#rn').value.trim());c();redo()}});
        if(a=='dapprove'){Social.resolveDelete(id,true);return redo()}if(a=='ddeny'){Social.resolveDelete(id,false);return redo()}}})},
  async draw(me){const m=this.m;if(!m||!m.isConnected)return;let L=[];
    try{L=await Auth.listUsers();if(sb&&!Social.progs().length)await Social.refresh()}catch(e){m.innerHTML=`<p class="err">${esc(e.message)}</p>`;return}
    const P=Social.progs(),pend=P.filter(p=>p.status=='pending'),dels=P.filter(p=>p.status=='delete_requested'),waiting=L.filter(x=>x.status=='pending').length,y=m.scrollTop;
    const o={pending:0,approved:1,blocked:2};L.sort((a,b)=>(a.role=='admin'?-1:0)-(b.role=='admin'?-1:0)||o[a.status]-o[b.status]);
    const users=`<h3>User access <span class="mu" style="float:right">${waiting} waiting for approval</span></h3>${L.map(x=>{const adm=x.role=='admin',self=x.id==me.id||adm;return `<div class="urow"><span class="av">${esc(x.username[0].toUpperCase())}</span><div class="n"><div>${esc(x.username)}</div><div class="mu">${esc(x.email)}</div></div><span class="badge ${adm?'admin':x.status}">${adm?'Admin':x.status}</span>
      ${self?'':`${x.status!='approved'?`<button class="sm ok" data-a="approved" data-id="${x.id}">Approve</button>`:''}${x.status!='blocked'?`<button class="sm" data-a="blocked" data-id="${x.id}">Block</button>`:''}<button class="sm bad" data-a="remove" data-id="${x.id}">Remove</button>`}</div>`}).join('')||'<p class="mu">No users yet.</p>'}`;
    const prog=p=>`<div class="sub" style="margin:10px 0"><div class="chead" style="border:0;padding:0;margin-bottom:6px"><h4 style="flex:1;margin:0">${esc(p.name)}</h4><span class="mu">by ${esc(p.creator)}</span></div><p class="mu" style="margin-bottom:8px;white-space:pre-wrap">${esc(p.desc||'')}</p>
      ${p.tasks.map((t,i)=>`<div class="mu">${i+1}. ${esc(t.t)} · <a href="${esc(t.url)}" target="_blank" rel="noopener" style="color:var(--a2)">${esc(t.url.slice(0,60))}</a></div>`).join('')}`;
    const programs=`<h3>Waiting for review <span class="mu" style="float:right">${pend.length}</span></h3>${pend.map(p=>prog(p)+`<div class="prow"><button class="sm ok" data-a="papprove" data-id="${p.id}">Approve</button><button class="sm bad" data-a="preject" data-id="${p.id}">Reject</button></div></div>`).join('')||'<p class="mu">Nothing waiting for review.</p>'}
      <h3 style="margin-top:22px">Delete requests <span class="mu" style="float:right">${dels.length}</span></h3>${dels.map(p=>prog(p)+`<div class="rej" style="margin:8px 0">Reason: ${esc(p.delReason||'none given')}</div><div class="prow"><button class="sm bad" data-a="dapprove" data-id="${p.id}">Approve delete</button><button class="sm" data-a="ddeny" data-id="${p.id}">Deny</button></div></div>`).join('')||'<p class="mu">No delete requests.</p>'}`;
    m.innerHTML=`<div style="margin-bottom:14px">${UI.seg('admtab','at',[['users','Users'],['programs','Programs',pend.length+dels.length?`<em class="nb">${pend.length+dels.length}</em>`:'']],this.tab)}</div><div class="${UI.sw('adm').trim()}">${this.tab=='users'?users:programs}</div>`;m.scrollTop=y}
};
