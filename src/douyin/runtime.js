const saveKey='ocean-conquest-tidal-routes-v1';
let launchInfo={};
let inBackground=false;
let last=0;
let lag=0;
let gesture=null;
let screen='battle';
let state;
let battleAudio;

// Cold and warm entries must both be captured before starting the game.
tt.onShow(options=>{
  launchInfo=options||{};
  inBackground=false;
  battleAudio?.visibility(true);
  last=0;
  lag=0;
});
tt.onHide(()=>{
  gesture=null;
  pressedAction=null;
  inBackground=true;
  battleAudio?.visibility(false);
  last=0;
  lag=0;
});

const canvas=tt.createCanvas();
const base=tt.createCanvas();
const info=tt.getSystemInfoSync();
const width=info.windowWidth||info.screenWidth;
const height=info.windowHeight||info.screenHeight;
const ratio=Math.min(3,info.pixelRatio||1);
canvas.width=Math.round(width*ratio);
canvas.height=Math.round(height*ratio);
base.width=WIDTH;
base.height=HEIGHT;
const ctx=canvas.getContext('2d');
const terrain=base.getContext('2d');
const selected=new Set();
const names=['中立','青方','朱方','蓝方','赭方'];
const islandSizesText={small:'小岛',medium:'中岛',large:'大岛'};
battleAudio=createCampaignAudio((name,volume,loop)=>{
  if(typeof tt.createInnerAudioContext!=='function')return null;
  const audio=tt.createInnerAudioContext();
  audio.src=`audio/${name}.wav`;
  audio.volume=volume;
  audio.loop=loop;
  let played=false;
  return {
    play(restart){if(restart&&played)audio.stop();audio.play();played=true;},
    pause(){audio.pause();},
  };
},()=>tt.getStorageSync(audioSettingsKey),settings=>tt.setStorageSync(audioSettingsKey,settings));
battleAudio.visibility(!inBackground);

let profile={best:{},skin:'patrol'};
try{
  const saved=tt.getStorageSync(saveKey);
  if(saved?.best&&typeof saved.best==='object')profile=saved;
}catch{}
const record=i=>profile.best[stageId(levels[i])];
const firstOpen=()=>{
  const i=levels.findIndex((_,id)=>!(record(id)>0));
  return i===-1?levels.length-1:i;
};
const cleared=()=>levels.filter((_,i)=>record(i)>0).length;
const legacyChapterCleared=chapter=>originalLevels.every((level,i)=>level.chapter!==chapter||record(i)>0);
const skins=[
  ['patrol','巡岛艇',()=>true,'初始外观'],
  ['sail','白帆快艇',()=>legacyChapterCleared(0),'通关第 1–8 场'],
  ['copper','赤铜巡洋',()=>legacyChapterCleared(3),'通关第 25–32 场'],
  ['lantern','长明灯舰',()=>cleared()>=12,'通关 12 场'],
];

let wind=false;
let actions=[];
let pressedAction=null;
let status='';
let statusUntil=0;
let supportsSidebar=false;
let newlyUnlocked='';

if(typeof tt.checkScene==='function'){
  tt.checkScene({scene:'sidebar',success:result=>{supportsSidebar=result.isExist===true;}});
}

function storeProgress(){
  try{tt.setStorageSync(saveKey,profile);}catch{}
}
function openStage(mission){
  state=newBattle(mission);
  state.chartColor=seaRoutes[levels[mission].route].theme;
  state.viewAspect=width/height;
  state.skin=skins.some(([id, ,earned])=>id===profile.skin&&earned())?profile.skin:'patrol';
  selected.clear();
  gesture=null;
  pressedAction=null;
  status='';
  statusUntil=0;
  wind=false;
  newlyUnlocked='';
  lag=0;
  last=0;
  screen='battle';
  paintMap();
}
function finishBattle(){
  selected.clear();
  gesture=null;
  if(state.winner===1){
    const before=skins.map(([, ,earned])=>earned());
    const key=stageId(levels[state.mission]);
    profile.best[key]=Math.min(record(state.mission)||Infinity,Math.max(.01,state.time));
    newlyUnlocked=skins.find(([, ,earned],i)=>!before[i]&&earned())?.[1]||'';
    storeProgress();
  }
  screen='result';
}
function notify(text){
  status=text;
  statusUntil=Date.now()+3200;
}
function label(text,x,y,size=13,color='#183c3d',align='center'){
  ctx.textAlign=align;
  ctx.textBaseline='middle';
  ctx.font=`600 ${size}px sans-serif`;
  ctx.fillStyle=color;
  ctx.fillText(text,x,y);
}
function card(x,y,w,h,fill='#f6eed9',stroke='#658581'){
  ctx.fillStyle=fill;
  ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=stroke;
  ctx.lineWidth=1;
  ctx.strokeRect(x+.5,y+.5,w-1,h-1);
}
function button(id,text,x,y,w,h,run,primary=false){
  card(x,y,w,h,primary?'#24534e':'#eef0dc',primary?'#24534e':'#678781');
  label(text,x+w/2,y+h/2,14,primary?'#fff8dd':'#1d4847');
  if(run)actions.push({id,x,y,w,h,run});
}
function around(text,x,y){
  ctx.font='600 12px sans-serif';
  const w=Math.min(width-16,Math.ceil(ctx.measureText(text).width)+16);
  card(x-w/2,y-13,w,26);
  label(text,x,y,12);
}
function paintHud(){
  const safe=info.safeArea||{};
  const top=Math.max(8,(safe.top||0)+6);
  const bottom=Math.min(height-10,(safe.bottom||height)-10);
  const menuX=Math.min(width-48,(safe.right||width)-46);
  const totals=[0,0,0,0,0];
  for(const n of state.nodes)totals[n.owner]++;
  const w=Math.min(width*.48,240);
  let offset=(width-w)/2;
  card(offset-1,top+13,w+2,8,'#f5ecd8');
  for(const side of [1,2,3,4,0]){
    const length=w*totals[side]/state.nodes.length;
    ctx.fillStyle=side===0?'#b5aa93':palette[side];
    ctx.fillRect(offset,top+14,length,6);
    offset+=length;
  }
  around(progressText(state.mission),width/2,top+37);
  button('menu','菜单',menuX,top,44,36,()=>{gesture=null;screen='menu';});
  if(supportsSidebar){
    const left=Math.max(8,(safe.left||0)+6);
    button('sidebar','侧边栏',left,top,60,34,()=>{gesture=null;screen='sidebar';});
  }
  state.nodes.forEach((n,id)=>{
    const active=selected.has(id)||gesture?.sources.has(id);
    const x=n.x/WIDTH*width,y=n.y/HEIGHT*height;
    const chip=n.size==='large'?30:26;
    card(x-chip/2,y-11,chip,22,palette[n.owner],active?'#fff':'#fff0d2');
    label(String(n.units),x,y,14,'#fff8e2');
  });
  let hint=Date.now()<statusUntil?status:'';
  if(!hint&&state.mission===0&&state.time<7&&state.nextId===1)hint='从青岛滑向中立岛';
  if(gesture?.drag){
    const id=hitAt(gesture.to);
    const sources=id===null?[]:dispatchable(state,gesture.sources,id,1);
    if(sources.length){
      const target=state.nodes[id];
      const eta=Math.max(...sources.map(source=>travelTime(levels[state.mission],state.nodes[source],target,
        canUseWind(state,state.nodes[source],1,wind))));
      hint=`${sources.length} 路 · 约 ${eta.toFixed(1)} 秒抵达`;
    }
  }
  if(hint)around(hint,width/2,bottom-14);
}
function modal(title,rows,body=[]){
  const w=Math.min(width-28,320);
  const x=(width-w)/2;
  const h=64+body.length*21+rows.length*46;
  const y=Math.max(14,(height-h)/2);
  ctx.fillStyle='#16363966';
  ctx.fillRect(0,0,width,height);
  card(x,y,w,h);
  label(title,width/2,y+26,20);
  body.forEach((line,i)=>label(line,width/2,y+52+i*21,12,'#3c5856'));
  rows.forEach(([id,text,callback,primary=false],i)=>button(id,text,x+18,y+48+body.length*21+i*46,w-36,38,callback,primary));
}
function drawMenu(){
  const close=['back','返回',()=>{screen=state.mode==='end'?'result':'battle';}];
  if(screen==='menu'){
    const rows=[close,['restart','重开',()=>openStage(state.mission)],['dock','舰队外观',()=>{screen='dock';}],
      ['music',`音乐：${battleAudio.settings.music?'开':'关'}`,()=>battleAudio.toggle('music')],
      ['effects',`音效：${battleAudio.settings.effects?'开':'关'}`,()=>battleAudio.toggle('effects')]];
    if(levels[state.mission].skill&&state.mode==='play'&&!state.windSpent){
      rows.push(['wind',wind?'取消顺风令':'启用顺风令',()=>{wind=!wind;screen='battle';}]);
    }
    modal('海岛战争',rows);
  }else if(screen==='dock'){
    const rows=skins.map(([id,name,earned,condition])=>[id,
      state.skin===id?`${name} · 已装备`:earned()?name:`${name} · ${condition}`,
      earned()?()=>{profile.skin=id;state.skin=id;storeProgress();}:null,state.skin===id]);
    rows.push(['close','返回',()=>{screen='menu';}]);
    modal('舰队外观',rows,[`已通关 ${cleared()} / ${levels.length} 场`]);
  }else if(screen==='sidebar'){
    const returned=launchInfo.launch_from==='homepage'&&launchInfo.location==='sidebar_card';
    const rows=[close];
    if(supportsSidebar)rows.unshift(['jump','打开抖音侧边栏',()=>tt.navigateToScene({
      scene:'sidebar',fail:()=>{screen='battle';notify('请从抖音首页打开侧边栏');},
    }),true]);
    modal('从侧边栏继续玩',rows,returned?['已从侧边栏进入游戏']:['抖音首页 → 侧边栏 → 海岛战争']);
  }else if(screen==='result'){
    const win=state.winner===1,next=state.mission+1;
    const nextRoute=levels[next]?.route;
    const continueLabel=next<levels.length&&nextRoute!==levels[state.mission].route?`前往${seaRoutes[nextRoute].name}`:'继续';
    const rows=win&&next<levels.length?
      [['next',continueLabel,()=>openStage(next),true]]:
      [['again','再打一局',()=>openStage(state.mission),true],['menu','菜单',()=>{screen='menu';}]];
    modal(win?(next===levels.length?'航线完成':'夺岛胜利'):'再试一次',rows,
      newlyUnlocked?[`解锁 ${newlyUnlocked}`]:[]);
  }
}
function hitAt(point){
  let found=null,radius=42;
  state.nodes.forEach((node,id)=>{
    const distance=Math.hypot(node.x-point.x,node.y-point.y);
    if(distance<radius){radius=distance;found=id;}
  });
  return found;
}
function world(touch){
  return {x:touch.clientX/width*WIDTH,y:touch.clientY/height*HEIGHT};
}
function hitButton(touch){
  return actions.find(a=>touch.clientX>=a.x&&touch.clientX<=a.x+a.w&&touch.clientY>=a.y&&touch.clientY<=a.y+a.h);
}
function launch(sources,target){
  const result=sendBatch(state,sources,target,1,wind);
  if(result.sent){
    battleAudio.departure();
    selected.clear();
    if(result.boosted)wind=false;
  }
}
function moveGesture(to){
  const from=gesture.to,dx=to.x-from.x,dy=to.y-from.y,length=dx*dx+dy*dy;
  const wasDragging=gesture.drag;
  gesture.drag ||= Math.hypot(to.x-gesture.from.x,to.y-gesture.from.y)>10;
  if(gesture.drag&&gesture.id!==null){
    if(!wasDragging&&!selected.has(gesture.id))battleAudio.selection(gesture.sources.size);
    const hits=[];
    for(const [id,node] of state.nodes.entries()){
      if(node.owner!==1||gesture.sources.has(id))continue;
      const t=length?Math.min(1,Math.max(0,((node.x-from.x)*dx+(node.y-from.y)*dy)/length)):0;
      if(Math.hypot(node.x-from.x-t*dx,node.y-from.y-t*dy)<=Math.max(22,34*islandScale(node)))hits.push({id,t});
    }
    hits.sort((a,b)=>a.t-b.t).forEach(({id})=>{gesture.sources.add(id);battleAudio.selection(gesture.sources.size);});
  }
  gesture.to=to;
}
tt.onTouchStart(event=>{
  if(gesture||pressedAction)return;
  const touch=event.changedTouches?.[0]??event.touches?.[0];
  if(!touch)return;
  battleAudio.start();
  const action=hitButton(touch);
  if(action){pressedAction={id:action.id,touch:touch.identifier};return;}
  if(screen!=='battle')return;
  const from=world(touch),id=hitAt(from);
  const own=id!==null&&state.nodes[id].owner===1;
  gesture={touch:touch.identifier,from,to:from,id,drag:false,own,
    sources:own?(selected.has(id)?new Set(selected):new Set([id])):new Set()};
});
tt.onTouchMove(event=>{
  if(!gesture||(gesture.id!==null&&!gesture.own))return;
  const touch=Array.from(event.touches||[]).find(item=>item.identifier===gesture.touch);
  if(touch)moveGesture(world(touch));
});
tt.onTouchEnd(event=>{
  const touches=Array.from(event.changedTouches||[]);
  if(pressedAction){
    const touch=touches.find(item=>item.identifier===pressedAction.touch);
    if(!touch)return;
    const id=pressedAction.id;
    pressedAction=null;
    const action=hitButton(touch);
    if(action?.id===id)action.run();
    return;
  }
  if(!gesture)return;
  const touch=touches.find(item=>item.identifier===gesture.touch);
  if(!touch)return;
  if(gesture.own||gesture.id===null)moveGesture(world(touch));
  const move=gesture;
  gesture=null;
  const target=hitAt(move.to);
  if(move.id===null){
    if(move.drag){
      selected.clear();
      const {from,to}=move;
      state.nodes.forEach((node,id)=>{
        if(node.owner===1&&node.x>=Math.min(from.x,to.x)&&node.x<=Math.max(from.x,to.x)&&
          node.y>=Math.min(from.y,to.y)&&node.y<=Math.max(from.y,to.y))selected.add(id);
      });
      if(selected.size)battleAudio.selection(selected.size);
    }
    return;
  }
  if(move.drag){
    if(target!==null)launch(move.sources,target);
    return;
  }
  const node=state.nodes[move.id];
  if(node.owner!==1&&selected.size){launch(selected,move.id);return;}
  if(node.owner===1){
    if(selected.has(move.id))selected.delete(move.id);
    else {selected.add(move.id);battleAudio.selection(selected.size);}
  }
  notify(`${names[node.owner]} ${islandSizesText[node.size]} · ${productionPeriod(node,node.owner||1).toFixed(1)} 秒/兵 · 上限 ${productionCap(node)}`);
});
tt.onTouchCancel(()=>{gesture=null;pressedAction=null;});

const nextFrame=typeof requestAnimationFrame==='function'?requestAnimationFrame:callback=>setTimeout(()=>callback(Date.now()),16);
function drawFrame(timestamp){
  const now=Number.isFinite(timestamp)?timestamp:Date.now();
  const delta=last?Math.min(.1,Math.max(0,(now-last)/1000)):0;
  last=now;
  if(!inBackground&&screen==='battle'&&state.mode==='play'){
    lag+=delta;
    while(lag>=STEP&&state.mode==='play'){step(state,STEP,battleAudio.capture);lag-=STEP;}
    for(const id of selected)if(state.nodes[id].owner!==1)selected.delete(id);
    if(state.mode==='end')finishBattle();
  }
  if(!inBackground){
    actions=[];
    ctx.save();
    ctx.scale(ratio,ratio);
    ctx.save();
    ctx.scale(width/WIDTH,height/HEIGHT);
    draw();
    ctx.restore();
    paintHud();
    if(screen!=='battle'){actions=[];drawMenu();}
    ctx.restore();
  }
  nextFrame(drawFrame);
}
openStage(firstOpen());
nextFrame(drawFrame);
