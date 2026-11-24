function act(s,neutral=23,raid=30,distanceWeight=3){
  
  let best=null;
  s.nodes.forEach((target,to)=>{
    const own=target.owner===1;
    const hostileIncoming=s.fleets.filter(f=>f.target===to&&f.owner!==1);
    const friendlyIncoming=s.fleets.filter(f=>f.target===to&&f.owner===1);
    const reinforcements=friendlyIncoming.reduce((n,f)=>n+(own?f.units:arrivalStrength(target,f.kind,f.units)),0);
    const threat=hostileIncoming.reduce((n,f)=>n+(own?arrivalStrength(target,f.kind,f.units):f.owner===target.owner?f.units:0),0);
    const defense=own?Math.max(0,threat-target.units+2):target.units+threat+1+(target.owner===0?0:2);
    if(defense<=reinforcements)return;
    const sources=s.nodes.flatMap((source,id)=>{
      if(source.owner!==1||id===to||source.units<9)return [];
      const incoming=s.fleets.filter(f=>f.owner!==1&&f.target===id).reduce((n,f)=>n+arrivalStrength(source,f.kind,f.units),0);
      const count=Math.floor(source.units/2);
      if(source.units-count+1<=incoming)return [];
      const power=own?count:arrivalStrength(target,source.kind,count);
      const distance=Math.hypot(source.x-target.x,source.y-target.y)/(source.kind==='air'?192:124);
      return [{id,power,distance,air:source.kind==='air'}];
    }).sort((a,b)=>b.power-b.distance*3-(a.power-a.distance*3));
    let power=reinforcements,delay=0;
    const ids=[];
    for(const source of sources){
      ids.push(source.id);power+=source.power;delay=Math.max(delay,source.distance);
      if(power>defense)break;
    }
    if(!ids.length||power<=defense)return;
    const value=(own?4:target.owner===0?neutral:raid)+(target.kind==='air'?4:0)-delay*distanceWeight-ids.length*2;
    if(!best||value>best.value)best={ids,to,value};
  });
  if(best)sendBatch(s,best.ids,best.to,1);
}
