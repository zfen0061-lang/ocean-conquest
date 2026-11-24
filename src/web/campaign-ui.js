const $=id=>document.getElementById(id), board=$('board'), canvas=$('map'), ctx=canvas.getContext('2d');
const base=document.createElement('canvas');base.width=canvas.width;base.height=canvas.height;
const terrain=base.getContext('2d');terrain.scale(2,2);ctx.scale(2,2);
const saveKey='ocean-conquest-tidal-routes-v1';
const legacySaveKey='ocean-conquest-campaign-v1';
const skins=[
  {id:'patrol',name:'巡岛艇',unlock:'初始外观',earned:()=>true},
  {id:'sail',name:'白帆快艇',unlock:'通关白帆海湾',earned:()=>chapterCleared(0)},
  {id:'copper',name:'赤铜巡洋',unlock:'通关赤岩外海',earned:()=>chapterCleared(3)},
  {id:'lantern',name:'长明灯舰',unlock:'通关 12 场',earned:()=>completedBattles()>=12},
];
const sizeNames={small:'小岛',medium:'中岛',large:'大岛'};
function readProfile(){
  const valid=value=>typeof value==='number'&&Number.isFinite(value)&&value>0?value:null;
  try{
    const record=JSON.parse(localStorage.getItem(saveKey)||'null');
    const legacy=record?[]:JSON.parse(localStorage.getItem(legacySaveKey)||'[]');
    return {best:levels.map(level=>valid(record?.best?.[stageId(level)]??legacy?.[level.original])),skin:record?.skin};
  }catch{}
  return {best:Array(levels.length).fill(null)};
}
const profile=readProfile(),best=profile.best;
const unlocked=()=>{
  const first=best.indexOf(null);
  return first===-1?levels.length-1:first;
};
const chapterCleared=chapter=>levels.every((level,i)=>level.chapter!==chapter||best[i]!==null);
const completedBattles=()=>best.filter(time=>time!==null).length;
let skin=skins.find(option=>option.id===profile.skin&&option.earned())?.id??skins[0].id;
let state,selected=new Set(),wind=false,gesture=null,suppressClick=false;
let last=performance.now(),lag=0,dirty=true,lastUi=0;
let infoUntil=0;
function save(){
  const record=Object.fromEntries(levels.flatMap((level,i)=>best[i]===null?[]:[[stageId(level),best[i]]]));
  try{localStorage.setItem(saveKey,JSON.stringify({best:record,skin}));}catch{}
}
function writeText(el,text){if(el.textContent!==text)el.textContent=text;}
function tell(msg){writeText($('status'),msg);}
function setMode(i){
  state=newBattle(i);selected.clear();wind=false;gesture=null;lag=0;last=performance.now();dirty=true;suppressClick=false;infoUntil=0;
  const level=levels[i];
  state.skin=skin;
  state.chartColor=chapters[level.chapter].theme;
  writeText($('progress'),`第 ${i+1} / ${levels.length} 场`);
  document.body.style.backgroundColor=state.chartColor;
  $('end').hidden=true;
  $('islands').replaceChildren(...state.nodes.map((n,id)=>{
    const button=document.createElement('button');button.className='island';button.type='button';button.dataset.id=id;
    button.style.left=n.x/WIDTH*100+'%';button.style.top=n.y/HEIGHT*100+'%';
    const value=document.createElement('span');value.className='number';value.dataset.size=n.size;
    const name=document.createElement('small');name.textContent=n.name;
    button.append(value,name);button.addEventListener('click',e=>{if(e.detail===0||!suppressClick)pick(id);});return button;
  }));
  $('territoryBar').replaceChildren(...[1,...state.enemies.map(e=>e.owner),0].map(side=>{
    const segment=document.createElement('span');
    segment.dataset.owner=side;
    segment.style.setProperty('--side',side===0?'#b5aa93':palette[side]);
    return segment;
  }));
  tell('青色是你的阵营。');refreshProjection();sync();
}
function refreshProjection(){
  const rect=canvas.getBoundingClientRect();
  state.viewAspect=rect.width/rect.height||1;
  paintMap();
  dirty=true;
}
new ResizeObserver(()=>{if(state)refreshProjection();}).observe(board);
function pendingCount(ids,target=null){return dispatchable(state,ids,target,1).reduce((n,id)=>n+Math.floor(state.nodes[id].units/2),0);}
function updateGestureLabel(){
  const bar=$('gestureHint');
  if(!gesture?.drag||gesture.id===null){bar.hidden=true;return;}
  const target=hitAt(gesture.to),sources=dispatchable(state,gesture.sources,target,1);
  let hint=`已串联 ${gesture.sources.size} 岛`;
  if(target!==null&&sources.length){
    const n=state.nodes[target],count=pendingCount(sources,target);
    const arrivals=sources.map(id=>{
      const origin=state.nodes[id];
      return travelTime(levels[state.mission],origin,n,canUseWind(state,origin,1,wind));
    });
    const earliest=Math.min(...arrivals).toFixed(1),latest=Math.max(...arrivals).toFixed(1);
    const eta=(earliest===latest?earliest:earliest+'–'+latest)+' 秒';
    const impact=n.owner===1?count:sources.reduce((sum,source)=>{
      const origin=state.nodes[source];return sum+arrivalStrength(n,origin.kind,Math.floor(origin.units/2));
    },0);
    hint=`${sources.length} 路 · ${impact<count?'攻岸 '+impact:count} 兵 · ${eta}`;
  }
  writeText(bar,hint);bar.hidden=false;
}
function sync(){
  for(const id of selected)if(state.nodes[id].owner!==1)selected.delete(id);
  const playing=state.mode!=='end',level=levels[state.mission];
  const showingInfo=playing&&performance.now()<infoUntil;
  $('islandInfo').hidden=!showingInfo;
  $('tip').hidden=showingInfo||!(state.mission===0&&state.mode==='play'&&state.time<7&&state.nextId===1);
  writeText($('tip'),'从青岛滑向中立岛');
  $('skill').hidden=!level.skill||!playing;
  $('skill').disabled=state.windSpent;
  writeText($('skill'),state.windSpent?'顺风令已用':wind?'顺风令待发':'顺风令');
  $('skill').setAttribute('aria-pressed',String(wind));
  const totals=[0,0,0,0,0];
  for(const node of state.nodes)totals[node.owner]++;
  for(const segment of $('territoryBar').children){
    const total=totals[Number(segment.dataset.owner)];
    segment.hidden=total===0;
    segment.style.flexGrow=total;
  }
  state.nodes.forEach((n,id)=>{
    const el=$('islands').children[id];
    if(el.dataset.side!==String(n.owner)){el.dataset.side=n.owner;el.style.setProperty('--badge',palette[n.owner]);}
    writeText(el.firstElementChild,String(n.units));
    el.setAttribute('aria-pressed',String(Boolean(selected.has(id)||gesture?.sources?.has(id)&&n.owner===1)));
    const label=`${factions[n.owner]} ${n.name}，${n.units} 兵，${islandDescription(n)}`;
    if(el.getAttribute('aria-label')!==label){
      el.setAttribute('aria-label',label);
      el.title=label;
    }
    if(el.disabled===playing)el.disabled=!playing;
  });
  updateGestureLabel();
}
function finishBattle(){
  const i=state.mission,won=state.winner===1;
  const level=levels[i];
  const previousSkins=skins.filter(option=>option.earned()).map(option=>option.id);
  gesture=null;selected.clear();wind=false;
  if(won){
    const seconds=Math.max(.01,state.time);
    best[i]=best[i]===null?seconds:Math.min(best[i],seconds);
    save();
  }
  $('end').hidden=false;
  const campaignEnd=i===levels.length-1;
  const newSkin=skins.find(option=>option.earned()&&!previousSkins.includes(option.id));
  writeText($('resultTitle'),won?(campaignEnd?'航线完成':'夺岛胜利'):'再试一次');
  writeText($('resultBrief'),won?(newSkin?`解锁 ${newSkin.name}`:'') : level.guide);
  $('resultBrief').hidden=won&&!newSkin;
  $('again').hidden=won&&!campaignEnd;
  $('next').hidden=!won||campaignEnd;
  tell(won?'本关已通过。':'重新出航，试试先换一条路线。');sync();
}
function launch(ids,id){
  const result=sendBatch(state,ids,id,1,wind);
  if(!result.sent){tell('选择一座有兵的青岛，再指定其他岛屿。');sync();return;}
  if(result.boosted)wind=false;
  selected.clear();infoUntil=0;tell(`${result.sent} 路，共 ${result.units} 兵，驶向${state.nodes[id].name}。`);dirty=true;sync();
}
function islandDescription(node){
  const type=node.fort?'岸防港':node.kind==='air'?'空港':'海军港';
  const seconds=productionPeriod(node,node.owner||1).toFixed(1);
  return `${sizeNames[node.size]}${type} · ${node.owner===0?'占领后 ':''}${seconds} 秒产 1 兵 · 自产上限 ${productionCap(node)}`;
}
function pick(id){
  if(state.mode==='end')return;
  const node=state.nodes[id];
  if(selected.size&&node.owner!==1){launch(selected,id);return;}
  writeText($('islandInfo'),islandDescription(node));
  infoUntil=performance.now()+3400;
  if(node.owner!==1){tell(`${node.name} · ${islandDescription(node)}`);sync();return;}
  if(selected.has(id))selected.delete(id);else selected.add(id);
  tell(selected.size===1&&selected.has(id)?`${node.name} · ${islandDescription(node)}`:
    selected.size?'点目标出航，或继续点青岛加入。':'已清空选择。');dirty=true;sync();
}
function locate(e){const b=canvas.getBoundingClientRect();return {x:(e.clientX-b.left)*WIDTH/b.width,y:(e.clientY-b.top)*HEIGHT/b.height};}
function hitAt(at){
  let closest=null,radius=42;
  state.nodes.forEach((n,id)=>{const d=Math.hypot(n.x-at.x,n.y-at.y);if(d<radius){radius=d;closest=id;}});return closest;
}
function collectBetween(g,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,hits=[];
  state.nodes.forEach((n,id)=>{
    if(n.owner!==1||g.sources.has(id))return;
    const t=len?Math.max(0,Math.min(1,((n.x-a.x)*dx+(n.y-a.y)*dy)/len)):0;
    if(Math.hypot(n.x-a.x-dx*t,n.y-a.y-dy*t)<=Math.max(22,34*islandScale(n)))hits.push({id,t});
  });
  hits.sort((a,b)=>a.t-b.t).forEach(({id})=>g.sources.add(id));
}
function track(g,to){
  g.drag ||= Math.hypot(to.x-g.from.x,to.y-g.from.y)>10;
  if(g.drag&&g.id!==null)collectBetween(g,g.to,to);
  g.to=to;
}
board.addEventListener('pointerdown',e=>{
  if(state.mode==='end'||gesture||e.button!==0||e.target.closest('.panel,.hud'))return;
  suppressClick=false;
  const hit=e.target.closest('.island'),at=locate(e),id=hit?Number(hit.dataset.id):hitAt(at);
  if(id!==null&&state.nodes[id].owner!==1)return;
  const sources=id===null?new Set():selected.has(id)?new Set(selected):new Set([id]);
  gesture={pointer:e.pointerId,id,from:at,to:at,drag:false,sources};(hit||board).setPointerCapture(e.pointerId);
});
board.addEventListener('pointermove',e=>{
  if(gesture?.pointer!==e.pointerId)return;
  const rect=canvas.getBoundingClientRect();
  for(const sample of [...e.getCoalescedEvents?.()||[],e]){
    track(gesture,{x:(sample.clientX-rect.left)*WIDTH/rect.width,y:(sample.clientY-rect.top)*HEIGHT/rect.height});
  }
  dirty=true;updateGestureLabel();
});
function finishGesture(e,abort){
  if(gesture?.pointer!==e.pointerId)return;
  const g=gesture;
  if(!abort)track(g,locate(e));
  gesture=null;dirty=true;updateGestureLabel();
  if(abort||!g.drag)return;
  suppressClick=true;
  const at=g.to;
  if(g.id!==null){
    const id=hitAt(at);
    if(id!==null)launch(g.sources,id);else {tell('已取消。滑到岛上再松手。');sync();}
  }else{
    const inside=n=>n.x>=Math.min(at.x,g.from.x)&&n.x<=Math.max(at.x,g.from.x)&&n.y>=Math.min(at.y,g.from.y)&&n.y<=Math.max(at.y,g.from.y);
    selected=new Set(state.nodes.flatMap((n,id)=>n.owner===1&&inside(n)?[id]:[]));
    tell(selected.size?'已框选，点目标派兵。':'框内没有青方岛屿。');sync();
  }
}
board.addEventListener('pointerup',e=>finishGesture(e,false));
board.addEventListener('pointercancel',e=>finishGesture(e,true));
board.addEventListener('lostpointercapture',e=>finishGesture(e,true));
$('openMenu').onclick=()=>{
  gesture=null;
  dirty=true;
  sync();
  $('menuDialog').showModal();
};
$('skill').onclick=()=>{
  if(state.mode==='end'||state.windSpent)return;
  wind=!wind;
  tell(wind?'下次派出的舰船将加速 35%。':'未使用顺风令。');
  $('menuDialog').close();
  sync();
};
$('restart').onclick=()=>{$('menuDialog').close();setMode(state.mission);};
$('again').onclick=()=>setMode(state.mission);
$('next').onclick=()=>{if(state.mode==='end'&&state.winner===1&&state.mission+1<levels.length)setMode(state.mission+1);};
function showDock(){
  writeText($('dockProgress'),`已通关 ${completedBattles()} / ${levels.length} 场`);
  $('dockGrid').replaceChildren(...skins.map(option=>{
    const button=document.createElement('button');
    button.type='button';
    button.disabled=!option.earned();
    button.setAttribute('aria-pressed',String(option.id===skin));
    const preview=document.createElement('canvas');
    preview.width=210;preview.height=64;
    preview.setAttribute('aria-hidden','true');
    const sample=preview.getContext('2d');
    sample.translate(114,32);sample.scale(3,3);
    ship(sample,1,true,option.id);
    const name=document.createElement('strong');name.textContent=option.name;
    const info=document.createElement('small');
    info.textContent=option.id===skin?'已装备':button.disabled?option.unlock:'装备';
    button.append(preview,name,info);
    button.onclick=()=>{
      skin=option.id;
      state.skin=skin;
      save();dirty=true;showDock();
      $('dockGrid').querySelector('[aria-pressed="true"]').focus();
    };
    return button;
  }));
}
$('openDock').onclick=()=>{
  $('menuDialog').close();
  showDock();
  $('dock').showModal();
};
document.addEventListener('visibilitychange',()=>{
  gesture=null;last=performance.now();lag=0;dirty=true;
});
function frame(now){
  const seconds=Math.max(0,Math.min((now-last)/1000,.1));last=now;
  if(state.mode==='play'&&!document.hidden&&!$('menuDialog').open&&!$('dock').open){
    lag+=seconds;
    while(lag>=STEP&&state.mode==='play'){step(state,STEP);lag-=STEP;}
    dirty=true;
    if(state.mode==='end')finishBattle();
    else if(now-lastUi>100){lastUi=now;sync();}
  }
  if(dirty){draw();dirty=false;}
  requestAnimationFrame(frame);
}
