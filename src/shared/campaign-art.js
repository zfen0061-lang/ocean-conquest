const shapes=[
  [[-44,-3],[-39,-14],[-27,-19],[-24,-28],[-6,-32],[9,-25],[23,-23],[31,-14],[43,-8],[38,4],[26,9],[24,20],[11,24],[-5,20],[-21,24],[-31,15],[-43,12]],
  [[-40,1],[-33,-13],[-17,-22],[-3,-28],[13,-25],[31,-14],[42,-3],[29,-1],[19,6],[26,17],[13,21],[-6,17],[-22,21],[-37,12]],
  [[-39,-7],[-26,-18],[-21,-26],[-6,-23],[7,-31],[22,-23],[39,-12],[36,-2],[24,9],[29,22],[12,26],[-6,22],[-18,29],[-32,19],[-45,9]],
  [[-46,-2],[-33,-14],[-16,-16],[-7,-25],[8,-25],[25,-19],[43,-8],[47,4],[30,11],[18,9],[3,23],[-13,18],[-23,11],[-39,13]],
];
function fillPath(c,points,color,outline=null){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  if(color){c.fillStyle=color;c.fill();}
  if(outline){c.strokeStyle=outline;c.stroke();}
}
function coast(c,shape,scale,offsetX,offsetY,fill,stroke=null){
  fillPath(c,shape.map(([x,y])=>[x*scale+offsetX,y*scale+offsetY]),fill,stroke);
}
function trace(c,x,y,xx,yy,color,width=1){
  c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();
}
function ellipse(c,x,y,xr,yr,fill,stroke=null){
  c.beginPath();c.ellipse(x,y,xr,yr,0,0,Math.PI*2);
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.stroke();}
}
const islandSizes={small:.64,medium:.88,large:1.12};
function islandScale(n){
  const density=state.nodes.length>=15?.83:1;
  return (islandSizes[n.size]??1)*density;
}
function paintIsland(c,n){
  const scale=islandScale(n);
  c.save();c.translate(n.x,n.y);c.scale(scale,scale*(state.viewAspect??1));c.lineJoin='round';
  const shape=shapes[n.shape];
  c.lineWidth=.8;coast(c,shape,1.28,0,2,null,'#527e8069');
  coast(c,shape,1.17,1,2,'#c7d5b0','#557e7c88');
  c.lineWidth=1.3;coast(c,shape,1,0,0,'#e5d4a7','#344a44');
  c.lineWidth=.8;coast(c,shape,.78,-1,-2,'#a0a57d','#637455');
  coast(c,shape,.59,-3,-7,'#b6b894','#738160');
  for(let j=0;j<shape.length;j+=2){
    const [x,y]=shape[j];trace(c,x*.84,y*.84,x*.98,y*.98,'#655f4c88',.8);
  }
  if(n.kind==='air'){
    c.save();c.rotate(n.shape%2?-.55:.28);c.fillStyle='#4d5b59';c.fillRect(-31,-7,62,14);
    c.strokeStyle='#e5dcc3';c.lineWidth=1;c.strokeRect(-28,-5,56,10);
    for(let j=-22;j<=21;j+=9)trace(c,j,0,j+4,0,'#f5e6bf',1);
    c.fillStyle='#d0bf90';c.fillRect(14,-14,12,6);c.strokeStyle='#455749';c.strokeRect(14,-14,12,6);c.restore();
  }else{
    const sign=n.shape%2?-1:1;c.scale(sign,1);
    c.fillStyle='#725e48';c.fillRect(19,10,7,20);c.fillRect(14,25,19,6);
    c.fillStyle='#ac9371';for(let j=0;j<4;j++)c.fillRect(20,11+j*5,5,2);c.fillRect(15,26,17,3);
    for(const [x,y] of [[-22,-9],[-13,-19],[21,-13]]){
      fillPath(c,[[x-4,y+3],[x,y-5],[x+4,y+3]],'#6d805f','#4d6456');trace(c,x,y+3,x,y+7,'#695742');
    }
    if(n.fort){
      const x=-22,y=13;c.fillStyle='#e9d3b2';c.fillRect(x-6,y-3,13,10);c.strokeStyle='#684938';c.strokeRect(x-6,y-3,13,10);
      for(let j=-5;j<=5;j+=5)c.fillRect(x+j,y-6,2,4);
      trace(c,x+2,y-1,x+5,y-9,'#684938',2);
    }
  }
  c.restore();
}
function paintMap(){
  const c=terrain;
  c.fillStyle=state.chartColor??'#b8cacc';c.fillRect(0,0,WIDTH,HEIGHT);
  for(let n=0;n<1500;n++){
    const x=(n*97.313+n*n*.011)%WIDTH,y=(n*57.609+n*n*.022)%HEIGHT;
    c.fillStyle=n%3?'#31585815':'#f8f3d63b';c.fillRect(x,y,n%11===0?2:1,n%11===0?1.2:.7);
  }
  for(let x=26;x<WIDTH;x+=45)trace(c,x,10,x,HEIGHT-10,'#3a646b2e',.6);
  for(let y=26;y<HEIGHT;y+=45)trace(c,10,y,WIDTH-10,y,'#3a646b2e',.6);
  c.strokeStyle='#4f6d72a3';c.lineWidth=1;c.strokeRect(11,11,WIDTH-22,HEIGHT-22);
  c.font='10px Georgia';c.fillStyle='#365d61';c.textAlign='center';
  const offsets=[48,130,214,296,378,460,542];
  offsets.forEach((x,i)=>{c.fillText(`${114+i}°`,x,24);trace(c,x,11,x,16,'#4d7074');});
  const depths=[[75,298,12],[303,83,27],[169,278,18],[409,324,36],[552,72,43],[34,159,21],[353,454,16],[570,450,18],[263,351,25],[425,66,33]];
  c.fillStyle='#4e757b';for(const [x,y,n] of depths){if(state.nodes.every(a=>Math.hypot(a.x-x,a.y-y)>53))c.fillText(n,x,y);}
  c.save();c.translate(47,HEIGHT-41);c.scale(1,state.viewAspect??1);c.lineWidth=.8;ellipse(c,0,0,20,20,null,'#3d676a');
  for(let i=0;i<8;i++){c.save();c.rotate(Math.PI*i/4);trace(c,0,-19,0,-24,'#3d676a');c.restore();}
  fillPath(c,[[0,-20],[6,6],[0,2],[-6,6]],'#254b51','#254b51');
  fillPath(c,[[0,18],[5,-5],[0,1],[-5,-5]],'#e8e2c5','#254b51');c.fillStyle='#254b51';c.fillText('N',0,-27);c.restore();
  c.fillStyle='#345c60';c.font='10px SimSun, serif';c.textAlign='right';c.fillText('水深标记 · 米',601,HEIGHT-24);
  state.nodes.forEach(n=>paintIsland(c,n));
}
function ship(c,side,front,skin='patrol'){
  const color=palette[side];
  trace(c,-8,-2.4,-24,-4.4,wakes[side],1.75);trace(c,-8,2.4,-24,4.4,wakes[side],1.75);
  c.lineWidth=1.15;
  if(skin==='sail'){
    fillPath(c,[[-10,-2],[-2,-4],[7,-2],[12,0],[6,3],[-7,3]],color,'#203d42');
    fillPath(c,[[-5,5],[-1,-8],[5,5]],'#fff1d4','#574c38');
    trace(c,-1,-8,-1,6,'#674e35',.75);
    return;
  }
  if(skin==='copper'){
    fillPath(c,[[-12,-3],[-9,-6],[3,-5],[12,0],[3,5],[-9,6],[-12,3]],color,'#203d42');
    trace(c,-9,-3,5,-2,'#e7b475',1.25);trace(c,-9,3,5,2,'#e7b475',1.25);
    ellipse(c,-4,0,2.6,2.2,'#eddabd','#584532');
    ellipse(c,3,0,2,1.8,'#eddabd','#584532');
    return;
  }
  if(skin==='lantern'){
    fillPath(c,[[-12,-3],[-4,-5],[5,-5],[11,-2],[11,2],[5,5],[-4,5],[-12,3]],color,'#203d42');
    c.fillStyle='#e4c87d';c.fillRect(-5,-3,6,6);
    ellipse(c,-2,0,1.7,1.7,'#fff5b6');
    trace(c,5,-2,8,-2,'#faf1ca',1.4);trace(c,5,2,8,2,'#faf1ca',1.4);
    return;
  }
  fillPath(c,[[-10,-4],[2,-4],[10,0],[2,4],[-10,4]],color,'#203d42');
  c.fillStyle='#f3e6c8';c.fillRect(-5,-2.5,4.3,5);
  if(front)trace(c,1,0,5,0,'#efe2bb',1.2);
}
function airplane(c,side){
  trace(c,-10,-1.4,-25,-1.4,'#f4ede2',1.2);
  c.lineWidth=1.1;fillPath(c,[[-12,0],[-8,-3],[-4,-2],[-6,-8],[-2,-8],[2,-2],[8,-2],[11,0],[8,2],[2,2],[-2,8],[-6,8],[-4,2],[-8,3]],palette[side],'#263e49');
  trace(c,-6,0,7,0,'#fff1cd',1);
}
function aimLine(c,from,to){
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);
  if(length<6)return;
  const angle=Math.atan2(dy,dx),end=Math.max(3,length-26);
  c.save();c.translate(from.x,from.y);c.rotate(angle);
  c.beginPath();c.moveTo(21,0);c.lineTo(end,0);c.stroke();
  c.setLineDash([]);c.beginPath();c.moveTo(end-7,-4);c.lineTo(end,0);c.lineTo(end-7,4);c.stroke();c.restore();
}
function draw(){
  const c=ctx;c.drawImage(base,0,0,WIDTH,HEIGHT);
  const aspect=state.viewAspect??1;
  state.nodes.forEach((n,id)=>{
    const active=selected.has(id)||gesture?.sources?.has(id)&&n.owner===1;
    const scale=islandScale(n);
    c.save();c.translate(n.x,n.y);c.scale(scale,scale*aspect);c.lineWidth=active?2.4:1.15;
    if(active)coast(c,shapes[n.shape],1.38,0,1,null,'#184e54');
    c.setLineDash([]);
    if(n.owner!==0){
      c.globalAlpha=.22;
      coast(c,shapes[n.shape],.97,0,0,palette[n.owner]);
      c.globalAlpha=1;
    }
    c.lineWidth=1.1;coast(c,shapes[n.shape],1.13,0,0,null,palette[n.owner]);
    if(n.pulseUntil>state.time){c.globalAlpha=(n.pulseUntil-state.time)/.65;c.lineWidth=2;ellipse(c,0,0,69-(n.pulseUntil-state.time)*36,50-(n.pulseUntil-state.time)*26,null,palette[n.owner]);c.globalAlpha=1;}
    c.restore();
  });
  for(const fleet of state.fleets){
    if(!fleet.pincer)continue;
    const target=state.nodes[fleet.target];
    c.save();
    c.globalAlpha=.36;
    c.setLineDash([4,5]);
    trace(c,fleet.x,fleet.y,target.x,target.y,palette[fleet.owner],1.45);
    c.restore();
  }
  for(const f of state.fleets){
    const angle=Math.atan2(f.vy/aspect,f.vx);
    for(let i=Math.min(3,Math.floor(f.units/6));i>=0;i--){
      c.save();c.translate(f.x,f.y);c.scale(1,aspect);c.rotate(angle);c.translate(-Math.min(f.elapsed*57,i*10),(i%2?1:-1)*i*4);
      c.scale(i===0?1:.68,i===0?1:.68);
      if(f.kind==='air')airplane(c,f.owner);else ship(c,f.owner,i===0,f.owner===1?state.skin:undefined);
      c.restore();
    }
    c.save();c.translate(f.x,f.y);c.scale(1,aspect);
    c.font='700 14px system-ui';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#faf1da';c.strokeText(f.units,0,-12);
    c.fillStyle=f.boosted?'#775426':palette[f.owner];c.fillText(f.units,0,-12);c.restore();
  }
  for(const effect of state.effects){
    const age=Math.max(0,state.time-effect.at);
    c.save();c.translate(effect.x,effect.y);c.scale(1,aspect);c.globalAlpha=1-age/1.1;
    c.lineWidth=1.4;ellipse(c,0,0,8+age*23,8+age*23,null,'#8b4b37');
    c.font='bold 15px system-ui';c.textAlign='center';c.fillStyle='#653c31';c.fillText(effect.label,0,-15-age*12);c.restore();
  }
  if(gesture?.drag){
    const {from,to,id}=gesture;c.strokeStyle='#183e44';c.lineWidth=2;c.setLineDash([5,4]);
    if(id===null){c.fillStyle='#f8f1d56b';c.fillRect(from.x,from.y,to.x-from.x,to.y-from.y);c.strokeRect(from.x,from.y,to.x-from.x,to.y-from.y);}
    else {
      const target=hitAt(to),aims=dispatchable(state,gesture.sources,target,1);
      if(target!==null&&aims.length){
        const node=state.nodes[target];aims.forEach(source=>aimLine(c,state.nodes[source],node));
        const scale=islandScale(node);
        c.save();c.translate(node.x,node.y);c.scale(scale,scale*aspect);c.setLineDash([]);c.lineWidth=2.2;coast(c,shapes[node.shape],1.45,0,0,null,'#1c5057');c.restore();
      }else{
        c.beginPath();[...gesture.sources].forEach((source,i)=>{const n=state.nodes[source];if(i)c.lineTo(n.x,n.y);else c.moveTo(n.x,n.y);});
        c.lineTo(to.x,to.y);c.stroke();
      }
    }
    c.setLineDash([]);
  }
}
