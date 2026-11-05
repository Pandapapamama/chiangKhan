const STOPS=[];DAYS.forEach(d=>d.stops.forEach(s=>{if(!s.info)STOPS.push(s);}));

/* geometry */
function hav(a,b){const R=6371000,t=x=>x*Math.PI/180;
  const dla=t(b.lat-a.lat),dlo=t(b.lng-a.lng);
  const x=Math.sin(dla/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dlo/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));}
function distTxt(m){return m<1000?Math.round(m/10)*10+" ม.":(m/1000).toFixed(1)+" กม.";}
function walkMin(m){return Math.max(1,Math.round(m/78));}

/* bounds of all places, used to project them onto the schematic map */
const lats=[HOME.lat,...STOPS.map(s=>s.lat)],lngs=[HOME.lng,...STOPS.map(s=>s.lng)];
const minLa=Math.min(...lats),maxLa=Math.max(...lats),minLo=Math.min(...lngs),maxLo=Math.max(...lngs);
STOPS.forEach(s=>{s.d=hav(HOME,s);});

/* one pin per place: the walking street is in the plan twice but is one spot on the map */
const PINS=[];
STOPS.forEach(s=>{const p=PINS.find(p=>p.pid===s.pid);
  if(p)p.keys.push(s.key);else PINS.push({pid:s.pid,keys:[s.key],s});});

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

/* MAP render
   Drawn in screen pixels (viewBox = the element's width) so labels are the same size on every screen.
   Pins that sit too close are nudged apart, then each label takes the free spot around its pin
   that overlaps least; when nothing nearby is free it sits further out with a leader line. */
const PIN_R=11, PIN_R_SEL=15, LABEL_FS=11, LABEL_FS_SEL=12.5;
const MAP_FONT='Mitr,"IBM Plex Sans Thai",sans-serif';
const measureCtx=document.createElement('canvas').getContext('2d');
function textW(txt,size,weight){measureCtx.font=weight+' '+size+'px '+MAP_FONT;return measureCtx.measureText(txt).width;}
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function overlapArea(a,b){
  const w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
  return w>0&&h>0?w*h:0;}

function layoutMap(W,H){
  const PAD=PIN_R_SEL+12,TOP=84,BOT=H-PIN_R_SEL-26;
  const nodes=[{home:true,keys:[],lat:HOME.lat,lng:HOME.lng,kind:'home',cat:'home',label:'บ้านฮัก'},
    ...PINS.map(p=>({keys:p.keys,lat:p.s.lat,lng:p.s.lng,kind:p.s.kind,cat:p.s.cat,label:shortName(p.s)}))];
  // the map is a sketch, not to scale: pow() stretches the crowded riverside rows
  // so they use the space that the one far-south stop (Flowa) would otherwise leave empty
  nodes.forEach(n=>{
    n.sel=n.keys.includes(selKey);
    n.x=PAD+(n.lng-minLo)/(maxLo-minLo)*(W-2*PAD);
    n.y=TOP+Math.pow((maxLa-n.lat)/(maxLa-minLa),0.6)*(BOT-TOP);});

  // 1. nudge pins apart; spacing allows for one enlarged (selected) pin, so nothing moves on tap
  const minD=PIN_R_SEL+PIN_R+6;
  for(let it=0;it<100;it++){
    let moved=false;
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j];
      let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d>=minD-0.5)continue;
      if(d<0.01){dx=1;dy=0.3;d=Math.hypot(dx,dy);}
      const push=(minD-d)/2;
      a.x-=dx/d*push;a.y-=dy/d*push;b.x+=dx/d*push;b.y+=dy/d*push;moved=true;}
    nodes.forEach(n=>{n.x=clamp(n.x,PAD,W-PAD);n.y=clamp(n.y,TOP-20,H-PIN_R_SEL-6);});
    if(!moved)break;}

  // 2. labels: every label has a list of candidate spots around its pin; each takes the one that
  //    overlaps least, then all labels get a few more turns to move now that they see each other
  const fixed=[{x:6,y:4,w:64,h:22}];   // the "แม่น้ำโขง" title
  nodes.forEach(n=>fixed.push({x:n.x-PIN_R_SEL-2,y:n.y-PIN_R_SEL-2,w:2*PIN_R_SEL+4,h:2*PIN_R_SEL+4,pin:n}));
  nodes.forEach(n=>{
    const w=n.sel?Math.ceil(textW(n.label,LABEL_FS_SEL,600))+18:Math.ceil(textW(n.label,LABEL_FS,n.home?600:500))+6;
    const h=n.sel?24:Math.round(LABEL_FS*1.6);
    const g=PIN_R_SEL+3,f=PIN_R_SEL+22,k=0.72;
    // [x, y, needs leader line]: close spots first (below, above, sides, shifted, diagonals), then further out
    const C=[
      [n.x-w/2,n.y+g],[n.x-w/2,n.y-g-h],[n.x+g,n.y-h/2],[n.x-g-w,n.y-h/2],
      [n.x-w*0.25,n.y+g],[n.x-w*0.75,n.y+g],[n.x-w*0.25,n.y-g-h],[n.x-w*0.75,n.y-g-h],
      [n.x+g*k,n.y+g*k],[n.x-g*k-w,n.y+g*k],[n.x+g*k,n.y-g*k-h],[n.x-g*k-w,n.y-g*k-h],
      [n.x-w/2,n.y+f,1],[n.x-w/2,n.y-f-h,1],[n.x+f,n.y-h/2,1],[n.x-f-w,n.y-h/2,1],
      [n.x+f*k,n.y+f*k,1],[n.x-f*k-w,n.y+f*k,1],[n.x+f*k,n.y-f*k-h,1],[n.x-f*k-w,n.y-f*k-h,1]];
    n.cands=C.map(([x,y,lead],i)=>({x,y,w,h,lead:!!lead,pen:i*0.5+(lead?40:0)+(x<2||y<2||x+w>W-2||y+h>H-2?1e6:0)}));
    n.lb=null;
  });
  const cost=(n,b)=>{let s=b.pen;
    fixed.forEach(o=>{if(o.pin!==n)s+=overlapArea(b,o)*4;});
    nodes.forEach(m=>{if(m!==n&&m.lb)s+=overlapArea(b,m.lb)*4;});
    return s;};
  // the selected pill chooses first, then the most crowded pins
  const crowd=n=>(n.sel?100:0)+nodes.filter(m=>m!==n&&Math.hypot(m.x-n.x,m.y-n.y)<90).length;
  const order=[...nodes].sort((a,b)=>crowd(b)-crowd(a));
  for(let pass=0;pass<8;pass++){
    let changed=false;
    order.forEach(n=>{
      let best=n.lb,bestCost=n.lb?cost(n,n.lb):Infinity;
      n.cands.forEach(c=>{const s=cost(n,c);if(s<bestCost-1e-6){bestCost=s;best=c;}});
      if(best!==n.lb){n.lb=best;changed=true;}});
    if(!changed)break;}
  return nodes;
}

function pinSvg(n,on){
  const col=CAT[n.cat].c,r=on?PIN_R_SEL:PIN_R,sz=on?19:14;
  let shape=n.home
    ? '<rect x="'+(n.x-r)+'" y="'+(n.y-r)+'" width="'+2*r+'" height="'+2*r+'" rx="7" fill="'+col+'" stroke="var(--surface)" stroke-width="2"/>'
    : (on?'<circle cx="'+n.x+'" cy="'+n.y+'" r="'+(r+7)+'" fill="'+col+'" opacity=".22"/>':'')+
      '<circle cx="'+n.x+'" cy="'+n.y+'" r="'+r+'" fill="'+col+'" stroke="var(--surface)" stroke-width="2"/>';
  shape+='<g transform="translate('+(n.x-sz/2)+' '+(n.y-sz/2)+') scale('+sz/24+')" fill="none" stroke="var(--surface)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--surface)">'+ICON[n.kind]+'</g>';
  if(on)shape='<g class="pin-sel">'+shape+'</g>';

  const b=n.lb;let label;
  if(on){
    // the selected name becomes a pill (layoutMap reserved its full size)
    label='<rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="12" fill="var(--surface)" stroke="'+col+'" stroke-width="1.6"/>'+
      '<text class="lbl" x="'+(b.x+b.w/2)+'" y="'+(b.y+b.h/2)+'" text-anchor="middle" dominant-baseline="central" font-size="'+LABEL_FS_SEL+'" font-weight="600" fill="var(--fg)">'+n.label+'</text>';
  }else{
    label='<text class="lbl" x="'+(b.x+b.w/2)+'" y="'+(b.y+b.h/2)+'" text-anchor="middle" dominant-baseline="central" font-size="'+LABEL_FS+'"'+
      ' font-weight="'+(n.home?600:500)+'" fill="'+(n.home?'var(--primary-ink)':'var(--muted)')+'"'+
      ' paint-order="stroke" stroke="var(--surface-2)" stroke-width="3" stroke-linejoin="round">'+n.label+'</text>';
  }
  if(!n.keys.length)return '<g>'+shape+label+'</g>';
  const key=n.keys.includes(selKey)?selKey:n.keys[0];
  return '<g class="pin" data-k="'+key+'"><circle cx="'+n.x+'" cy="'+n.y+'" r="22" fill="transparent"/>'+shape+label+'</g>';
}

let mapW=0;   // width the map was last drawn at; 0 = needs drawing
function renderMap(){
  const m=document.getElementById('map');
  const W=Math.round(m.getBoundingClientRect().width);
  if(!W){mapW=0;return;}   // hidden behind a Google tab: drawn when it shows again
  mapW=W;
  const H=Math.round(clamp(W*0.92,280,400));
  m.setAttribute('viewBox','0 0 '+W+' '+H);
  const nodes=layoutMap(W,H),home=nodes[0],sel=nodes.find(n=>n.keys.includes(selKey));
  let s='';
  // river band (north / top), stretched to the width
  s+='<g transform="scale('+W/360+' 1)">'+
    '<path d="M0 0 H360 V40 Q300 56 240 42 Q150 24 70 46 Q30 54 0 44 Z" fill="var(--river)" opacity=".9"/>'+
    '<path d="M20 30 Q70 22 120 30 T220 30 T320 28" stroke="var(--surface)" stroke-width="1.4" fill="none" opacity=".55" vector-effect="non-scaling-stroke"/>'+
    '<path d="M40 48 Q90 42 140 48 T250 46" stroke="var(--surface)" stroke-width="1.2" fill="none" opacity=".4" vector-effect="non-scaling-stroke"/></g>';
  s+='<text x="12" y="20" font-family="Itim,cursive" font-size="12" fill="var(--c-cafe)" opacity=".85">แม่น้ำโขง</text>';
  // route (home mode only)
  if(mode==="home"){
    const mx=(home.x+sel.x)/2,my=(home.y+sel.y)/2-18;
    s+='<path d="M'+home.x+' '+home.y+' Q'+mx+' '+my+' '+sel.x+' '+sel.y+'" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round" class="routeline" opacity=".9"/>';
  }
  // leader lines for labels that had to sit further out
  nodes.forEach(n=>{if(!n.lb.lead)return;
    const b=n.lb,px=clamp(n.x,b.x,b.x+b.w),py=clamp(n.y,b.y,b.y+b.h),d=Math.hypot(px-n.x,py-n.y)||1;
    s+='<line x1="'+(n.x+(px-n.x)/d*(PIN_R+2))+'" y1="'+(n.y+(py-n.y)/d*(PIN_R+2))+'" x2="'+px+'" y2="'+py+'" stroke="var(--faint)" stroke-width="1"/>';});
  // pins: selected last so it sits on top
  nodes.filter(n=>n!==sel).forEach(n=>{s+=pinSvg(n,false);});
  s+=pinSvg(sel,true);
  m.innerHTML=s;
  m.querySelectorAll('g[data-k]').forEach(g=>g.addEventListener('click',()=>{selKey=g.getAttribute('data-k');renderAll();}));
}
function shortName(s){return s.short||s.name;}

// redraw when the map's width changes (rotate phone, resize window, return from a Google tab)
new ResizeObserver(()=>{
  const w=Math.round(document.getElementById('map').getBoundingClientRect().width);
  if(w&&w!==mapW)renderMap();
}).observe(document.getElementById('map'));
// label sizes are measured with the Mitr font, so measure again once it has loaded
if(document.fonts)Promise.all([document.fonts.load('500 11px Mitr','บ้านฮัก Banchef'),document.fonts.load('600 12.5px Mitr','บ้านฮัก Banchef')])
  .then(()=>{mapW=0;renderMap();}).catch(()=>{});

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
