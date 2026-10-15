/* ===== ADMIN POPUP (admin icon in the top bar, role=admin only). Approve / Block / Remove users. Logic lives in auth.js ===== */
const AdminUI={
  open(){const me=Auth.current();if(!me||me.role!='admin')return;
    UI.modal('<div class="sub">Loading…</div>',m=>{m.classList.add('xl');this.draw(m,me);
      m.onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,id=b.dataset.id;
        if(a=='remove')return UI.confirm('Remove this user?','Remove',async()=>{await Auth.removeUser(id);this.draw(m,me)});
        await Auth.setStatus(id,a);this.draw(m,me)}})},
  async draw(m,me){let L;try{L=await Auth.listUsers()}catch(e){m.innerHTML=`<p class="err">${esc(e.message)}</p>`;return}
    const o={pending:0,approved:1,blocked:2},y=m.scrollTop;L.sort((a,b)=>(a.role=='admin'?-1:0)-(b.role=='admin'?-1:0)||o[a.status]-o[b.status]);
    m.innerHTML=`<h3>User access <span class="mu" style="float:right">${L.filter(x=>x.status=='pending').length} waiting for approval</span></h3>
     ${L.map(x=>{const adm=x.role=='admin',self=x.id==me.id||adm;return `<div class="urow"><span class="av">${esc(x.username[0].toUpperCase())}</span><div class="n"><div>${esc(x.username)}</div><div class="mu">${esc(x.email)}</div></div><span class="badge ${adm?'admin':x.status}">${adm?'Admin':x.status}</span>
      ${self?'':`${x.status!='approved'?`<button class="sm ok" data-a="approved" data-id="${x.id}">Approve</button>`:''}${x.status!='blocked'?`<button class="sm" data-a="blocked" data-id="${x.id}">Block</button>`:''}<button class="sm bad" data-a="remove" data-id="${x.id}">Remove</button>`}</div>`}).join('')||'<p class="mu">No users yet.</p>'}`;m.scrollTop=y}
};
