/* ===== CONFIG: single place for settings. Edit freely. ===== */
const CONFIG={
  START_YEAR:2026,                          // heatmap never goes before this year
  USE_SUPABASE:true,                       // flip to true after adding keys below + the supabase-js <script> in index.html
  SUPABASE_URL:'https://gvkvmcomkykeajvovppu.supabase.co', SUPABASE_KEY:'sb_publishable_0rzpDsSQvhvgkGTKjeJSsw_xgzrSTFx',   // sb_publishable_... (safe to be public)
  DEMO_USER:{username:'admin',email:'admin@habitflow.app',password:'admin1234'}, // prototype login
  NAV:[['home','Home','⌂'],['skills','Skill Learning','✦'],['friends','Friends','☺'],['calendar','Calendar','▦'],['finance','Finance','$'],['admin','Admin','🛡']],
  ROSE_KEY:'#onlyforsam<3',                // soft lock only (visible in code). Real enforcement needs Supabase.
  THEMES:{midnight:{name:'Midnight Indigo',c:['#6d6bf5','#38bdf8','#070b16']},spider:{name:'Spider-Man',c:['#e11d2e','#2a6df4','#07080f']},sunset:{name:'Sunset Amber',c:['#f97316','#fbbf24','#120a07']},rose:{name:'Rose Blush',c:['#FF788D','#FFDADA','#E11A45']}},
  FONTS:{inter:'Inter (default)',mono:'Mono',angelina:'Angelina Beauty'}
};
const $=(s,r=document)=>r.querySelector(s);
const store={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
