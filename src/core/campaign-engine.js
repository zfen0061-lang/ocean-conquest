function dispatchable(s,sourceIds,targetId,owner){
  return [...new Set(sourceIds)].filter(id=>id!==targetId&&s.nodes[id]?.owner===owner&&s.nodes[id].units>=2);
}
function arrivalStrength(node,kind,units){return node.fort&&kind==='air'?Math.floor(units*.6):units;}
function canUseWind(s,node,owner,boost){
  return Boolean(node.kind==='sea'&&boost&&owner===1&&!s.windSpent&&levels[s.mission].skill);
}
function travelTime(level,from,to,wind=false){
  const campaign=level.pace!==undefined;
  const speed=(from.kind==='air'?(campaign?208:192):(campaign?116:124))*(level.pace??1);
  const minimum=campaign?.85:1.25;
  return Math.max(minimum,Math.hypot(from.x-to.x,from.y-to.y)/speed)/(wind?1.35:1);
}
const productionSize={small:1.13,medium:1,large:.88};
const islandCapacity={small:30,medium:50,large:80};
function productionCap(node){return islandCapacity[node.size]??islandCapacity.medium;}
function productionPeriod(node,owner=node.owner){
  const base=node.kind==='air'?1.6:owner===1?1.05:1.24;
  return base*(productionSize[node.size]??1);
}
function sendBatch(s,sourceIds,targetId,owner,boost=false){
  if(s.mode!=='play'||!s.nodes[targetId])return {sent:0,units:0};
  const target=s.nodes[targetId];
  let sent=0,units=0,boosted=false;
  for(const id of dispatchable(s,sourceIds,targetId,owner)){
    const node=s.nodes[id],amount=Math.floor(node.units/2);
    const wind=canUseWind(s,node,owner,boost);
    const duration=travelTime(levels[s.mission],node,target,wind);
    s.fleets.push({id:s.nextId++,owner,kind:node.kind,units:amount,x:node.x,y:node.y,target:targetId,
      vx:(target.x-node.x)/duration,vy:(target.y-node.y)/duration,remaining:duration,boosted:wind,elapsed:0});
    node.units-=amount;sent++;units+=amount;boosted ||= wind;
  }
  if(boosted)s.windSpent=true;
  return {sent,units,boosted};
}
function firstContact(a,b,span){
  if(a.owner===b.owner||a.kind!==b.kind)return null;
  const x=a.x-b.x,y=a.y-b.y,vx=a.vx-b.vx,vy=a.vy-b.vy;
  const offset=x*x+y*y-CONTACT*CONTACT;
  if(offset<=0)return 0;
  const speed=vx*vx+vy*vy,slope=x*vx+y*vy;
  if(speed<EPS||slope>=0)return null;
  const discriminant=slope*slope-speed*offset;
  if(discriminant<0)return null;
  const t=(-slope-Math.sqrt(discriminant))/speed;
  return t>=0&&t<=span?t:null;
}
function arrive(s,f,at,onCapture){
  const n=s.nodes[f.target];
  if(n.owner===f.owner){n.units+=f.units;return;}
  const impact=arrivalStrength(n,f.kind,f.units);
  if(impact!==f.units)s.effects.push({x:n.x,y:n.y,at,label:'岸防 −'+(f.units-impact),kind:'fort'});
  if(impact>n.units){
    n.units=impact-n.units;n.owner=f.owner;n.growth=0;n.pulseUntil=at+.65;
    onCapture?.(f.owner);
  }
  else n.units-=impact;
}
function moveFleets(s,dt,onCapture){
  const events=[];
  for(let i=0;i<s.fleets.length;i++){
    const a=s.fleets[i];
    if(a.remaining<=dt)events.push({t:a.remaining,a});
    for(let j=i+1;j<s.fleets.length;j++){
      const b=s.fleets[j],t=firstContact(a,b,Math.min(dt,a.remaining,b.remaining));
      if(t!==null)events.push({t,a,b});
    }
  }
  events.sort((p,q)=>p.t-q.t||Number(Boolean(q.b))-Number(Boolean(p.b))||p.a.id-q.a.id||(p.b?.id??0)-(q.b?.id??0));
  for(const {t,a,b} of events){
    if(a.units===0||a.arrived)continue;
    if(!b){arrive(s,a,s.time+t,onCapture);a.arrived=true;continue;}
    if(b.units===0||b.arrived)continue;
    const clash=Math.min(a.units,b.units);
    a.units-=clash;b.units-=clash;
    s.effects.push({x:(a.x+b.x+(a.vx+b.vx)*t)/2,y:(a.y+b.y+(a.vy+b.vy)*t)/2,at:s.time+t,label:`−${clash} / −${clash}`,kind:a.kind});
  }
  s.fleets=s.fleets.filter(f=>f.units>0&&!f.arrived);
  for(const f of s.fleets){f.x+=f.vx*dt;f.y+=f.vy*dt;f.remaining-=dt;f.elapsed+=dt;}
}
function chooseEnemyMove(s,plan){
  const side=plan.owner;
  const reserves=s.nodes.flatMap((n,id)=>n.owner===side&&n.units>=12?[{id,node:n,units:Math.floor(n.units/2)}]:[]);
  const tactics=s.rivalTactics;
  const completedPincer=levels[s.mission].routeStage&&tactics?.nextPincer===Infinity;
  const rivalry=tactics&&(tactics.mode!=='pincer'||completedPincer)&&s.time<52;
  let best=null;
  s.nodes.forEach((to,target)=>{
    if(to.owner===side)return;
    const friendly=s.fleets.reduce((sum,f)=>sum+(f.target===target&&f.owner===side?arrivalStrength(to,f.kind,f.units):0),0);
    if(friendly>to.units+4)return;
    const contested=s.fleets.some(f=>f.target===target&&f.owner!==side);
    const baseScore=(to.owner===0?plan.neutralBias:plan.raidBias)+(to.kind==='air'?3:0)-(contested?2:0);
    const candidates=reserves.map(({id,node,units})=>({id,units:arrivalStrength(to,node.kind,units),distance:Math.hypot(node.x-to.x,node.y-to.y)}));
    const remember=(ids,strength,distance,penalty)=>{
      const advantage=strength+friendly-to.units;
      const rivalBonus=rivalry&&to.owner>1&&advantage>0?8:0;
      const score=baseScore+Math.min(15,advantage)-distance/60-penalty+rivalBonus;
      if(score>0&&(!best||score>best.score))best={ids,target,score};
    };
    candidates.forEach(from=>remember([from.id],from.units,from.distance,0));
    if(to.owner===0||friendly>0||s.mission<3)return;
    const nearby=candidates.filter(from=>from.distance<=305).sort((a,b)=>(b.units-b.distance/25)-(a.units-a.distance/25)).slice(0,2);
    if(nearby.length===2){
      const [a,b]=nearby;
      if(Math.max(a.units,b.units)<=to.units&&a.units+b.units>to.units)remember([a.id,b.id],a.units+b.units,Math.max(a.distance,b.distance),8);
    }
  });
  if(best){
    const targetSide=s.nodes[best.target].owner;
    const result=sendBatch(s,best.ids,best.target,side);
    if(result.sent&&targetSide>1&&tactics&&tactics.firstRivalOrder===null)tactics.firstRivalOrder=s.time;
  }
}

function tryPincer(s,activeOpponents){
  const tactics=s.rivalTactics;
  if(!tactics||s.time<tactics.nextPincer||activeOpponents.length<2)return;
  if(tactics.mode==='mixed'&&(tactics.firstRivalOrder===null||s.time-tactics.firstRivalOrder<7))return;
  if(levels[s.mission].routeStage&&s.time<38&&s.nodes.filter(n=>n.owner===1).length<3)return;
  tactics.nextPincer=s.time+1;
  const level=levels[s.mission];
  const player=s.nodes.flatMap((node,id)=>node.owner===1?[{node,id}]:[]);
  const ready=activeOpponents.filter(plan=>plan.at<=s.time+plan.interval*.82);
  const orders=ready.flatMap(plan=>s.nodes.flatMap((from,source)=>{
    if(from.owner!==plan.owner||from.units<14)return [];
    const units=Math.floor(from.units/2);
    return player.flatMap(({node:to,id:target})=>{
      const impact=arrivalStrength(to,from.kind,units);
      const eta=travelTime(level,from,to);
      if(eta>5.8||impact<Math.max(7,to.units*.4))return [];
      return [{plan,source,target,impact,eta}];
    });
  }));
  let best=null;
  for(let i=0;i<orders.length;i++){
    const a=orders[i],target=s.nodes[a.target];
    for(let j=i+1;j<orders.length;j++){
      const b=orders[j];
      if(a.plan===b.plan||Math.abs(a.eta-b.eta)>2.5)continue;
      const sameTarget=a.target===b.target;
      if(sameTarget&&(a.impact+b.impact<=target.units||!oppositeApproach(s.nodes[a.source],s.nodes[b.source],target)))continue;
      const score=a.impact+b.impact-(a.eta+b.eta)*2+(sameTarget?0:6);
      if(!best||score>best.score)best={a,b,score};
    }
  }
  if(!best)return;
  const firstFleet=s.nextId;
  for(const order of [best.a,best.b]){
    sendBatch(s,[order.source],order.target,order.plan.owner);
    order.plan.at=s.time+order.plan.interval;
  }
  for(const fleet of s.fleets)if(fleet.id>=firstFleet)fleet.pincer=true;
  tactics.nextPincer=Infinity;
}

function oppositeApproach(a,b,to){
  const ax=a.x-to.x,ay=a.y-to.y,bx=b.x-to.x,by=b.y-to.y;
  return ax*bx+ay*by<.35*Math.hypot(ax,ay)*Math.hypot(bx,by);
}
function step(s,dt,onCapture){
  if(s.mode!=='play')return;
  const level=levels[s.mission];
  for(const n of s.nodes){
    if(n.owner===0||n.units>=productionCap(n)){n.growth=0;continue;}
    n.growth+=dt;
    const period=productionPeriod(n);
    if(n.growth>=period){n.units++;n.growth-=period;}
  }
  moveFleets(s,dt,onCapture);s.time+=dt;
  s.effects=s.effects.filter(e=>s.time-e.at<1.1);
  const alive=new Set([...s.nodes.map(n=>n.owner),...s.fleets.map(f=>f.owner)]);
  const activeOpponents=s.enemies.filter(plan=>alive.has(plan.owner));
  const conquered=!s.nodes.some(node=>node.owner>1);
  if(!alive.has(1)||conquered){
    s.winner=Number(alive.has(1)&&conquered);
    s.mode='end';
    return;
  }
  if(level.opening&&!s.openingSent&&s.time>=level.opening.at){
    const {side,source,target}=level.opening;sendBatch(s,[source],target,side);s.openingSent=true;
  }
  tryPincer(s,activeOpponents);
  for(const plan of activeOpponents)if(s.time>=plan.at){chooseEnemyMove(s,plan);plan.at=s.time+plan.interval;}
}
