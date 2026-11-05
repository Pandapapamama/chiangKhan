const STOPS=[];DAYS.forEach(d=>d.stops.forEach(s=>{if(!s.info)STOPS.push(s);}));

/* geometry */
function hav(a,b){const R=6371000,t=x=>x*Math.PI/180;
  const dla=t(b.lat-a.lat),dlo=t(b.lng-a.lng);
  const x=Math.sin(dla/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dlo/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));}
function distTxt(m){return m<1000?Math.round(m/10)*10+" ม.":(m/1000).toFixed(1)+" กม.";}
function walkMin(m){return Math.max(1,Math.round(m/78));}

/* projection for schematic map */
const pts=[HOME,...STOPS];
let la=pts.map(p=>p.lat),lo=pts.map(p=>p.lng);
const minLa=Math.min(...la),maxLa=Math.max(...la),minLo=Math.min(...lo),maxLo=Math.max(...lo);
const PADX=34,TOP=60,BOT=226;
function proj(p){
  const x=PADX+(p.lng-minLo)/(maxLo-minLo)*(360-2*PADX);
  const y=TOP+(maxLa-p.lat)/(maxLa-minLa)*(BOT-TOP);
  return {x,y};
}
STOPS.forEach(s=>{const q=proj(s);s.x=q.x;s.y=q.y;s.d=hav(HOME,s);});
const H=proj(HOME);

let mode="home";          // home | me
let selKey=STOPS[0].key;   // default Banchef
const byKey=k=>STOPS.find(s=>s.key===k);

/* URLs */
function dirUrl(s){const b="https://www.google.com/maps/dir/?api=1";
  const dest="&destination="+s.lat+","+s.lng+(s.pid?"&destination_place_id="+s.pid:"");
  const org=mode==="home"?"&origin="+HOME.lat+","+HOME.lng:"";
  return b+org+dest+"&travelmode=walking";}
function placeUrl(s){return "https://www.google.com/maps/search/?api=1&query="+s.lat+","+s.lng+(s.pid?"&query_place_id="+s.pid:"");}
function streetUrl(s){return "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint="+s.lat+","+s.lng;}

/* Google Maps Embed API: the map tabs appear only when js/config.js has a key */
const MAPS_KEY=GOOGLE_MAPS_API_KEY.trim();
let view="sketch";        // sketch | map | street
let frameUrl="";
function embedUrl(s){
  const b="https://www.google.com/maps/embed/v1/";
  const common="?key="+encodeURIComponent(MAPS_KEY)+"&language=th&region=TH";
  if(view==="street")return b+"streetview"+common+"&location="+s.lat+","+s.lng;
  if(mode==="home")return b+"directions"+common+"&origin=place_id:"+HOME.pid+"&destination=place_id:"+s.pid+"&mode=walking";
  return b+"place"+common+"&q=place_id:"+s.pid+"&zoom=17";
}
function renderView(){
  const showFrame=view!=="sketch";
  const box=document.getElementById('gframe');
  // toggleAttribute, not .hidden: the map is an <svg>, which has no .hidden property
  document.getElementById('map').toggleAttribute('hidden',showFrame);
  document.getElementById('legend').toggleAttribute('hidden',showFrame);
  box.toggleAttribute('hidden',!showFrame);
  document.querySelectorAll('#viewTabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));
  if(!showFrame)return;
  const url=embedUrl(byKey(selKey));
  if(url===frameUrl)return;
  frameUrl=url;
  // A new iframe each time keeps the phone's back button from stepping through old maps
  const f=document.createElement('iframe');
  f.title=view==="street"?"Street View":"แผนที่ Google";
  f.allowFullscreen=true;
  f.referrerPolicy="strict-origin-when-cross-origin";
  f.src=url;
  box.replaceChildren(f);
}

/* MAP render */
function renderMap(){
  const m=document.getElementById('map');
  const sel=byKey(selKey);
  let s='';
  // river band (north / top)
  s+='<path d="M0 0 H360 V40 Q300 56 240 42 Q150 24 70 46 Q30 54 0 44 Z" fill="var(--river)" opacity=".9"/>';
  s+='<path d="M20 30 Q70 22 120 30 T220 30 T320 28" stroke="var(--surface)" stroke-width="1.4" fill="none" opacity=".55"/>';
  s+='<path d="M40 48 Q90 42 140 48 T250 46" stroke="var(--surface)" stroke-width="1.2" fill="none" opacity=".4"/>';
  s+='<text x="12" y="20" font-family="Itim,cursive" font-size="12" fill="var(--c-cafe)" opacity=".85">แม่น้ำโขง</text>';
  // route (home mode only)
  if(mode==="home"){
    const mx=(H.x+sel.x)/2, my=(H.y+sel.y)/2-18;
    s+='<path d="M'+H.x+' '+H.y+' Q'+mx+' '+my+' '+sel.x+' '+sel.y+'" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round" class="routeline" opacity=".9"/>';
  }
  // stop pins
  STOPS.forEach(st=>{
    const on=st.key===selKey;const col=CAT[st.cat].c;
    s+='<g style="cursor:pointer" data-k="'+st.key+'">';
    s+='<circle cx="'+st.x+'" cy="'+st.y+'" r="20" fill="transparent"/>'; // invisible tap area, big enough for a finger
    if(on){s+='<circle cx="'+st.x+'" cy="'+st.y+'" r="8.5" fill="'+col+'" class="pin-sel"/><circle cx="'+st.x+'" cy="'+st.y+'" r="8.5" fill="none" stroke="var(--surface)" stroke-width="2"/>';}
    else{s+='<circle cx="'+st.x+'" cy="'+st.y+'" r="5" fill="'+col+'" opacity=".92"/><circle cx="'+st.x+'" cy="'+st.y+'" r="5" fill="none" stroke="var(--surface)" stroke-width="1.5"/>';}
    s+='</g>';
  });
  // home marker
  s+='<g><path d="M'+H.x+' '+(H.y-14)+' C'+(H.x-8)+' '+(H.y-14)+' '+(H.x-8)+' '+(H.y-3)+' '+H.x+' '+(H.y+3)+' C'+(H.x+8)+' '+(H.y-3)+' '+(H.x+8)+' '+(H.y-14)+' '+H.x+' '+(H.y-14)+'Z" fill="var(--primary)"/>';
  s+='<path d="M'+(H.x-3.3)+' '+(H.y-8)+' L'+H.x+' '+(H.y-10.6)+' L'+(H.x+3.3)+' '+(H.y-8)+' M'+(H.x-2.4)+' '+(H.y-8.4)+' V'+(H.y-5)+' H'+(H.x+2.4)+' V'+(H.y-8.4)+'" stroke="#fff" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>';
  // labels: home + selected
  function label(p,txt,dy,anchor){
    const a=anchor||'middle';let tx=p.x;
    if(a==='start')tx=p.x+11;if(a==='end')tx=p.x-11;
    return '<text x="'+tx+'" y="'+(p.y+dy)+'" text-anchor="'+a+'" font-family="Mitr,sans-serif" font-size="10.5" fill="var(--fg)" paint-order="stroke" stroke="var(--surface)" stroke-width="3" stroke-linejoin="round">'+txt+'</text>';}
  s+=label(H,'บ้านฮัก',-18);
  const anc=sel.x>300?'end':(sel.x<60?'start':'middle');
  s+=label(sel,shortName(sel),22,anc);
  m.innerHTML=s;
  m.querySelectorAll('g[data-k]').forEach(g=>g.addEventListener('click',()=>{selKey=g.getAttribute('data-k');renderAll();}));
}
function shortName(s){return s.name.replace("Chiangkhan","").replace(" Cafe’","").replace("’","’").trim().slice(0,16);}

/* readout */
function renderReadout(){
  const sel=byKey(selKey);
  document.getElementById('roDest').textContent=sel.name;
  document.getElementById('roFrom').textContent=mode==="home"?"บ้านฮัก":"ตำแหน่งปัจจุบัน";
  const meta=document.getElementById('roMeta');
  if(mode==="home"){
    meta.innerHTML='<span class="chip">'+SVG_WALK+distTxt(sel.d)+'</span><span class="chip">'+SVG_CLOCK+'เดิน ~'+walkMin(sel.d)+' นาที</span>';
  }else{
    meta.innerHTML='<span class="chip">'+SVG_GO+'ใช้ GPS ของเครื่องคุณ</span>';
  }
  const b=document.getElementById('roBtn');
  b.href=dirUrl(sel);
  b.innerHTML=SVG_GO+(mode==="home"?'เปิดเส้นทางจากบ้านฮัก':'นำทางจากตำแหน่งปัจจุบัน');
}

/* dest chips */
function renderChips(){
  const el=document.getElementById('destScroll');
  el.innerHTML=STOPS.map(s=>{const col=CAT[s.cat];
    return '<button class="dchip" data-k="'+s.key+'" aria-pressed="'+(s.key===selKey)+'">'+
      '<span class="mini" style="background:'+col.s+';color:'+col.c+'">'+ic(s.kind,col.c)+'</span>'+
      '<span class="dt"><b>'+shortName(s)+'</b><span>'+s.tag+'</span></span></button>';}).join('');
  el.querySelectorAll('.dchip').forEach(c=>c.addEventListener('click',()=>{selKey=c.getAttribute('data-k');renderAll();
    c.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});}));
}

/* day cards */
function renderDays(){
  const root=document.getElementById('days');
  root.innerHTML=DAYS.map(d=>{
    const cards=d.stops.map(s=>{
      const col=CAT[s.cat];
      if(s.info){
        return '<div class="stop info"><div class="thumb" style="background:'+col.s+';color:'+col.c+'">'+ic(s.kind,col.c)+'</div>'+
          '<div class="sbody"><div class="srow1"><span class="stime">'+s.time+'</span><span class="stag">'+s.tag+'</span></div>'+
          '<div class="sname">'+s.name+'</div><div class="sblurb">'+s.blurb+'</div></div></div>';
      }
      const warn=s.warn?'<div class="swarn">'+SVG_WARN+s.warn+'</div>':'';
      return '<div class="stop'+(s.key===selKey?' sel':'')+'" data-k="'+s.key+'">'+
        '<div class="thumb" style="background:'+col.s+';color:'+col.c+'">'+ic(s.kind,col.c)+'</div>'+
        '<div class="sbody"><div class="srow1"><span class="stime">'+s.time+'</span><span class="stag">'+s.tag+'</span>'+
          '<span class="sdist" data-dist="'+s.key+'"></span></div>'+
        '<div class="sname">'+s.name+'</div><div class="sblurb">'+s.blurb+'</div>'+warn+'</div>'+
        '<div class="sactions">'+
          '<a class="sbtn go" data-go="'+s.key+'" target="_blank" rel="noopener">'+SVG_GO+'นำทาง</a>'+
          '<a class="sbtn ghost" href="'+placeUrl(s)+'" target="_blank" rel="noopener">'+SVG_PHOTO+'ดูรูป & รีวิว</a>'+
          '<a class="sbtn ghost" href="'+streetUrl(s)+'" target="_blank" rel="noopener">'+SVG_WALK+'Street View</a>'+
        '</div></div>';
    }).join('');
    return '<div class="day"><div class="dayhead"><span class="daynum">'+d.n+'</span>'+
      '<h2>'+d.label+'</h2><span class="dsub">'+d.sub+'</span></div>'+cards+'</div>';
  }).join('');
  // wire
  root.querySelectorAll('.stop[data-k]').forEach(c=>c.addEventListener('click',e=>{
    if(e.target.closest('a'))return;
    selKey=c.getAttribute('data-k');renderAll();
    document.querySelector('.mapcard').scrollIntoView({block:'start',behavior:'smooth'});
  }));
  updateDayDynamic();
}
function updateDayDynamic(){
  document.querySelectorAll('.stop[data-k]').forEach(c=>{
    c.classList.toggle('sel',c.getAttribute('data-k')===selKey);});
  document.querySelectorAll('[data-go]').forEach(a=>{a.href=dirUrl(byKey(a.getAttribute('data-go')));});
  document.querySelectorAll('[data-dist]').forEach(el=>{
    const s=byKey(el.getAttribute('data-dist'));
    el.textContent=mode==="home"?(distTxt(s.d)+' · ~'+walkMin(s.d)+' น.'):'';
  });
}

function renderAll(){
  renderMap();renderReadout();renderView();
  document.querySelectorAll('.dchip').forEach(c=>c.setAttribute('aria-pressed',c.getAttribute('data-k')===selKey));
  updateDayDynamic();
}

/* mode toggle */
function setMode(m){
  mode=m;
  document.getElementById('mHome').setAttribute('aria-pressed',m==="home");
  document.getElementById('mMe').setAttribute('aria-pressed',m==="me");
  document.getElementById('modeHint').innerHTML=(m==="home"
    ? SVG_WALK+'<span>แผนที่แสดงเส้นทาง <b>เดินจากบ้านฮัก</b> ไปจุดที่เลือก พร้อมระยะทางโดยประมาณ</span>'
    : SVG_GO+'<span>ปุ่มนำทางจะใช้ <b>ตำแหน่ง GPS ปัจจุบัน</b> ของคุณเปิดใน Google Maps (เหมาะตอนเดินอยู่จริง)</span>');
  renderAll();
}
document.getElementById('mHome').addEventListener('click',()=>setMode('home'));
document.getElementById('mMe').addEventListener('click',()=>setMode('me'));


/* theme toggle */
function sysDark(){return matchMedia('(prefers-color-scheme:dark)').matches;}
function curDark(){const t=document.documentElement.getAttribute('data-theme');return t?t==='dark':sysDark();}
function paintTheme(){document.getElementById('themeBtn').innerHTML=curDark()?SUN:MOON;}
document.getElementById('themeBtn').addEventListener('click',()=>{
  document.documentElement.setAttribute('data-theme',curDark()?'light':'dark');
  try{localStorage.setItem('ck-theme',curDark()?'dark':'light');}catch(e){}
  paintTheme();renderAll();
});
try{const sv=localStorage.getItem('ck-theme');if(sv)document.documentElement.setAttribute('data-theme',sv);}catch(e){}
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(!document.documentElement.getAttribute('data-theme')){paintTheme();renderAll();}});

/* schedule table */
function renderSchedule(){
  document.getElementById('schedule').innerHTML=DAYS.map(d=>{
    const rows=d.stops.map(s=>'<div class="srw'+(s.info?' is-info':'')+'"><span class="t">'+s.time+'</span>'+
      '<span class="a"><b>'+s.name+'</b><span class="tg">'+s.tag+'</span></span></div>').join('');
    return '<div class="card schedcard"><div class="schead"><span class="daynum">'+d.n+'</span>'+
      '<h3>'+d.label+'</h3><span class="sc-sub">'+d.sub+'</span></div>'+rows+'</div>';
  }).join('');
}

/* init */
if(MAPS_KEY){
  const tabs=document.getElementById('viewTabs');
  tabs.hidden=false;
  tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;renderView();}));
}
renderSchedule();renderChips();renderDays();setMode('home');paintTheme();
