/* ===== SYNC: browser storage stays the fast working copy; Supabase is the permanent, shared copy (table user_data).
   Reads happen once at login (pull). Writes are batched ~1s after a change (push). Does nothing when USE_SUPABASE is false. ===== */
const Sync={ok:false,dirty:{},tid:null,
  async pull(u){this.ok=false;if(!sb)return;
    const{data,error}=await sb.from('user_data').select('*').eq('user_id',u.id).maybeSingle();
    if(error){console.warn('Could not load your data:',error.message);return}          // ok stays false: nothing is pushed, so server data can never be overwritten by a failed load
    if(data){if(data.habits)store.set('hf_hab_'+u.username,data.habits);
      if(data.settings){const{customs,unlocked,...s}=data.settings;store.set('hf_settings',s);store.set('hf_customs',customs||[]);store.set('hf_unlocked',unlocked||{})}
      if('remark' in data)store.set('hf_remark_'+u.username,data.remark)}
    const p=await Auth._profile(u.id);if(p)store.set('hf_profile_'+u.username,{bio:p.bio||'',avatar:p.avatar_url||''});
    this.ok=true},
  push(k,v){if(!sb||!this.ok)return;this.dirty[k]=v;clearTimeout(this.tid);this.tid=setTimeout(()=>this.flush(),800)},
  settings(){this.push('settings',{...store.get('hf_settings',{theme:'midnight',font:'inter'}),customs:store.get('hf_customs',[]),unlocked:store.get('hf_unlocked',{})})},
  async flush(){clearTimeout(this.tid);const d=this.dirty,u=Auth.current();this.dirty={};if(!sb||!u||!Object.keys(d).length)return;
    const{error}=await sb.from('user_data').upsert({user_id:u.id,...d,updated_at:new Date().toISOString()});
    if(error){console.warn('Sync failed:',error.message);this.dirty={...d,...this.dirty}}},   // keep it for the next try
  clear(){if(!sb)return;Object.keys(localStorage).filter(k=>/^hf_(hab|remark|profile)_|^hf_(settings|customs|unlocked|programs|members|friends|fh|community)$/.test(k)).forEach(k=>localStorage.removeItem(k));this.ok=false}   // logout: leave nothing of this account behind
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)Sync.flush()});
