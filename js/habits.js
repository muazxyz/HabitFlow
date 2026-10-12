/* ===== HABITS DATA SERVICE: all habit storage + maths. Home (and Friends later) use this; nothing else touches habit data.
   Per user: {joined:'YYYY-MM-DD', habits:[{id,n,i,note,vis,created}], log:{'YYYY-MM-DD':[habitId,...]}}
   The day rolls over at 3 AM. SUPABASE: swap load()/save() for table reads/writes (habits, habit_log). ===== */
const Habits={
  fmt:d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),
  today(){return this.fmt(new Date(Date.now()-3*36e5))},
  add(k,n){const[y,m,d]=k.split('-');return this.fmt(new Date(y,m-1,+d+n))},
  dow(k){const[y,m,d]=k.split('-');return new Date(y,m-1,d).getDay()},
  load(u){let D=store.get('hf_hab_'+u);if(!D){const t=this.today();
    D={joined:t,log:{},habits:[['Study','📖','2h 30m'],['Workout','🏋','45m'],['Prayer','💜','5 / 5'],['Sleep schedule','🌙','7h 30m'],['Water intake','💧','2.5L'],['Coding / projects','💻','1h 00m'],['No social media','📵','0h']].map((x,i)=>({id:'h'+i,n:x[0],i:x[1],note:x[2],vis:true,created:t}))};this.save(u,D)}return D},
  save(u,D){store.set('hf_hab_'+u,D)},
  sched(D,k){return D.habits.filter(h=>h.created<=k)},            // only habits scheduled on that day count
  count(D,k){const s=this.sched(D,k).map(h=>h.id);return(D.log[k]||[]).filter(i=>s.includes(i)).length},
  lvl(p){return p<=0?0:p<=25?1:p<=50?2:3},                       // 0 dark, <=25 dim, <=50 medium, <=100 bright
  streak(D){const L=Object.keys(D.log).filter(k=>D.log[k].length).sort();let best=0,run=0,prev=null;
    for(const k of L){run=prev&&this.add(prev,1)==k?run+1:1;best=Math.max(best,run);prev=k}
    let k=this.today();if(!(D.log[k]||[]).length)k=this.add(k,-1);let cur=0;while((D.log[k]||[]).length){cur++;k=this.add(k,-1)}
    return{cur,best:Math.max(best,cur)}}
};
