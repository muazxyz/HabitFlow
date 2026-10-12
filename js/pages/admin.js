/* ===== PAGE: ADMIN (only visible to role=admin). Approve / Block / Remove users. Logic lives in auth.js ===== */
window.Pages=window.Pages||{};
Pages.admin={async render(el,u){
  if(u.role!='admin'){location.hash='home';return}
  const draw=async()=>{
    let L;try{L=await Auth.listUsers()}catch(e){App.repaint(el,`<div class="card"><p class="err">${e.message}</p></div>`);return}
    const o={pending:0,approved:1,blocked:2};L.sort((a,b)=>o[a.status]-o[b.status]);
    App.repaint(el,`<div class="card" style="max-width:820px"><h3>User access <span class="mu" style="float:right">${L.filter(x=>x.status=='pending').length} waiting for approval</span></h3>
     ${L.map(x=>{const me=x.id==u.id||x.role=='admin';return `<div class="urow"><span class="av">${x.username[0].toUpperCase()}</span><div class="n"><div>${x.username}${x.role=='admin'?' <span class="badge approved">admin</span>':''}</div><div class="mu">${x.email}</div></div><span class="badge ${x.status}">${x.status}</span>
      ${me?'':`${x.status!='approved'?`<button class="sm ok" data-a="approved" data-id="${x.id}">Approve</button>`:''}${x.status!='blocked'?`<button class="sm" data-a="blocked" data-id="${x.id}">Block</button>`:''}<button class="sm bad" data-a="remove" data-id="${x.id}">Remove</button>`}</div>`}).join('')||'<p class="mu">No users yet.</p>'}</div>`);
  };
  el.onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;
    if(b.dataset.a=='remove'){if(!confirm('Remove this user?'))return;await Auth.removeUser(b.dataset.id)}else await Auth.setStatus(b.dataset.id,b.dataset.a);draw()};
  draw()}};
