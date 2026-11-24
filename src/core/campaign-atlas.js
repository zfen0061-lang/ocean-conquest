const harborNames=[
  '青湾 白帆港 贝壳滩 南沙洲 回船屿 北岬 铜锚港 长风湾 东汐岛',
  '雾岬 石牙湾 黑礁港 双桅屿 倒潮湾 青螺台 沉石港 索桥礁 雨帆岬',
  '鸥翼岛 晨光湾 鸣沙港 云门岛 南飞屿 风鸟岬 回雁岛 白鹭港 望云台',
  '赤石港 铜墙堡 金桅湾 铁门岛 赭沙屿 炉火岬 夕照港 枫岩岛 岸炮台',
  '灯影湾 长明岛 望星屿 海铃港 夜渡湾 岬角站 浮灯港 大风屿 三潮湾',
].map(names=>names.split(' '));

function seaBattle(name, rows, options={}){
  return {name,rows, ...options};
}

const chapters=[
  {name:'白帆海湾',theme:'#b8cacc',lesson:'集结与拦截', battles:[
    ...originalBattles.slice(0,3),
    seaBattle('铜锚港',[
      '. r18 . . n7',
      '. . n12 r16 .',
      'p28 . . . .',
      '. p23 . n8 .',
    ],{tip:'先占一个近处的中立岛，让它一边产兵，一边向前线增援。',delay:5}),
    seaBattle('回船线',[
      'r23 . . . n9',
      '. n11 . r20 .',
      '. . n9 . .',
      'p43 . . p23 .',
    ],{tip:'两条航路都能推进。留一座岛在后面存兵，随时接应。',delay:11}),
    seaBattle('孤锚',[
      '. . r23 . .',
      'n7 . . . r17',
      '. n13 . n9 .',
      '. . p46 . .',
    ],{tip:'你只有一个起点。先抢兵少的近岛，开出第二个产兵点。',delay:10}),
    seaBattle('北岬急航',[
      '. n8 . . r18',
      '. . . @n27 .',
      '. p48 n5 . .',
      '. . n10 . r16',
    ],{tip:'从单一港口出发，先抢近处的中立岛，再从短航线向北岬推进。',delay:9}),
    seaBattle('白帆港口战',[
      'r24 . . r22 .',
      '. n11 . . n8',
      '. . @n18 . .',
      'p35 . . p28 .',
    ],{tip:'从两翼调船，中路可以做增援的跳板。',delay:4}),
  ]},
  {name:'碎礁水道',theme:'#a9c1be',lesson:'三方争夺', battles:[
    originalBattles[3],
    seaBattle('雾口交锋',[
      'b19 . . r28 .',
      '. . n16 . r13',
      'n10 . . b12 .',
      '. p42 . . p29',
    ],{tip:'先看哪一家把兵派远，再去打它薄弱的后方。',delay:5}),
    seaBattle('礁门竞速',[
      '. b24 . . r19',
      'n9 . . @n29 .',
      '. . n8 . r12',
      'p35 . p27 . .',
    ],{tip:'对手也会抢中间岛屿。等他们出兵后，再找机会攻打薄弱的后方。',delay:6}),
    seaBattle('双湾截击',[
      'r23 . . b24 .',
      '. r17 . . b18',
      '. . n10 . .',
      'p43 . . p32 .',
    ],{tip:'两侧敌军都有出路。利用海上拦截保护薄弱港口。',delay:4}),
    seaBattle('退潮时分',[
      'b23 . n8 . r24',
      '. . . n14 .',
      'b13 . p39 . .',
      '. p34 . . r18',
    ],{tip:'你从中线起步。先吃掉一侧，再集中转向另一侧。',delay:3}),
    seaBattle('索桥礁',[
      '. r23 . b21 .',
      'n8 . . . r12',
      '. b13 . @n17 .',
      'p37 . p29 . .',
    ],{tip:'夺港后留兵接应，随时防备敌人从另一条航线包抄。',delay:4}),
    seaBattle('两线合围',[
      'r26 . b18 . b20',
      '. n8 . . .',
      '. . n14 . r15',
      'p43 . . p38 .',
    ],{tip:'先抢中间两岛，拓开路线后再从侧面打过去。',delay:4}),
    seaBattle('雨帆关口',[
      'b24 . . . r26',
      '. n12 . r21 .',
      'b13 . @n22 . .',
      '. p43 . . p38',
    ],{tip:'两支舰队可以合兵，也可以一路进攻、一路堵住敌军的来向。',delay:3}),
  ]},
  {name:'飞羽群岛',theme:'#b7cbc6',lesson:'空港与空援', battles:[
    originalBattles[4],
    seaBattle('风鸟接力',[
      '. n7 . . r24',
      'p26a . . n11a .',
      '. . n12 . r18',
      'p30 . . . .',
    ],{tip:'用飞机先抢远处的弱岛，再让近处的舰船推进。',delay:5}),
    seaBattle('鸥翼抢航',[
      'b17 . . . r24a',
      '. . @n27a . .',
      'p30a . . n8 r13',
      '. . p32 . .',
    ],{tip:'可以用飞机抢中间的空港，舰队走另一条航线。',delay:4}),
    seaBattle('对流',[
      '. . b20a . r21',
      'n8 . . r18a .',
      '. p28a . . n12',
      'p35 . . p21 .',
    ],{tip:'敌机和友机迎头相撞会抵消，舰船在下方另外走一路。',delay:4}),
    seaBattle('云门夜行',[
      'p28a . n9 . b20',
      '. . . r20a .',
      'p25 . n12 . r15',
      '. p24 . . .',
    ],{tip:'空港已在你手里。先用快兵打开中间，避免上下两边同时受压。',delay:4}),
    seaBattle('白鹭机场',[
      '. r24 . . b22a',
      'n10 . @n18a . .',
      '. . . b16 .',
      'p29a . . p33 .',
    ],{tip:'舰船夺岛后，飞机能快速补上兵力。',delay:4}),
    seaBattle('长云回旋',[
      'r20a . . b21 .',
      '. . n8 . b14a',
      'p32 . . r17 .',
      '. p32a . . p22',
    ],{tip:'利用两种航速，让距离远的队伍早点出发，一起抵达。',delay:3}),
    seaBattle('望云台',[
      'b22 . . r24a .',
      '. . @n26a . r15',
      '. n9 . b17 .',
      '. p42a . . p36',
    ],{tip:'两家都可能抢空港。留一支预备队，看哪家先露出空档。',delay:3}),
  ]},
  {name:'赤岩外海',theme:'#c7c7ae',lesson:'舰船攻坚', battles:[
    originalBattles[5],
    seaBattle('铜墙',[
      '. r23f . . b19',
      '. . n12 . r15',
      'p31a . . n9 .',
      '. p40 . . .',
    ],{tip:'右侧交给飞机，岸炮堡交给舰队。',delay:5}),
    seaBattle('铁门急攻',[
      'r22 . . b20a .',
      '. . @r39f . .',
      'p33 . . . n8',
      '. . p32 . p25a',
    ],{tip:'从两个海军岛合兵攻打敌方的岸防港。',delay:5}),
    seaBattle('夕照补给',[
      '. b23 . . r24f',
      '. . n12 . n10a',
      'p35 . . r17 .',
      '. p25a . . p26',
    ],{tip:'飞机先抢中立机场。近海的港口交给海军抢。',delay:3}),
    seaBattle('赤潮堵口',[
      'r24a . . b18 .',
      '. n9 . @n21f .',
      'b15 . n10 . r16',
      '. p43 . . p37a',
    ],{tip:'先让舰船攻坚，用飞机给拿下的港口补兵。',delay:4}),
    seaBattle('岬角穿越',[
      'b21 . r20f . n8',
      '. . . b16a .',
      'p38 . . . r19',
      '. p30a . p24 .',
    ],{tip:'你的空军可以飞过海上拦截，优先拿下敌人刚出过兵的岛。',delay:4}),
    seaBattle('炮台海图',[
      'r20f . . b22a .',
      '. . n13 . r17',
      'p33 . . b15 .',
      '. p32a . . p31',
    ],{tip:'把外侧的弱岛连成补给线，再打有岸防的据点。',delay:4}),
    originalBattles[6],
  ]},
  {name:'长明海峡',theme:'#aebdc6',lesson:'多方混战', battles:[
    seaBattle('浮灯航道',[
      'b25 . . r24a .',
      '. n10 . . gold18',
      'p42 . . @n21f .',
      '. p32a . . p27',
    ],{tip:'对手会从侧翼抢港，留意哪一家的舰队已经离岸。',delay:4}),
    seaBattle('望星快线',[
      'b19 . r20 . gold18a',
      '. . n12 . .',
      'p34a . . @n34a r13',
      '. p44 . . p25',
    ],{tip:'中央空港能帮飞机快速转场，也可以沿侧翼寻找兵少的敌岛。',delay:9}),
    seaBattle('岬角争夺',[
      'b20 . . r25f .',
      '. n9 . . gold20',
      'p40 . n14 . b15a',
      '. p32a . . p30',
    ],{tip:'先用最近的舰船清掉一侧。飞机留着补被围的港。',delay:6}),
    seaBattle('夜渡三湾',[
      'gold18 . . b21a .',
      '. r20 . . b16',
      'p33a . . @n22 .',
      '. p37 . . p29',
    ],{tip:'观察敌人之间的交战航线，让自己的舰队从薄弱处切入。',delay:3}),
    seaBattle('铃港突围',[
      'r25a . b22 . gold20',
      '. . . n9 .',
      'p44 . @n37f . r15',
      '. p38 . . n11a',
    ],{tip:'合并两路舰队突破中线。空港在侧翼，可以先抢来牵制敌军。',delay:12}),
    seaBattle('大风渡口',[
      'b22a . . r25f .',
      '. . n11 . b18',
      'p42 . . gold21 .',
      '. p37a . . p32',
    ],{tip:'金方挡着右侧岛，先从它和朱方之间打出一条航路。',delay:6}),
    seaBattle('三潮汇合',[
      'r22 . b24 . gold22a',
      '. n8 . . r19f',
      'p42 . . n13 .',
      '. p37a . p32 .',
    ],{tip:'拿下弱岛再扩张。战线越宽，越需要留一条增援航路。',delay:3}),
    originalBattles[7],
  ]},
];

const islandCounts=[
  [6,7,7,8,8,9,10,10],
  [10,10,11,11,12,12,13,13],
  [13,13,14,14,15,15,16,16],
  [16,16,17,17,18,18,19,19],
  [19,19,20,20,20,21,21,22],
];
const sailingPace=[1,.96,.90,.84,.78];
const shoalNames='鲛背礁 云杉岛 飞鱼屿 浅葵滩 风盆岛 雨燕礁 雁尾屿 白瓷湾 旋涡岛 绿藻岬 月牙礁 降帆岛 平水湾 三叶岛 沙鸥屿 冷泉岛 竹灯岛 东岬岛 苔岩屿 日晷礁 木棉岛 石楠湾 乌篷岛 雪鸥屿'.split(' ');
const soundingRows=[
  [[80,72],[171,86],[247,68],[335,98],[427,66],[543,88]],
  [[71,157],[208,171],[293,153],[385,174],[485,153],[548,197]],
  [[101,244],[183,225],[269,258],[344,232],[444,256],[525,277]],
  [[73,340],[169,326],[251,346],[341,329],[428,353],[545,355]],
  [[95,426],[192,413],[285,438],[389,426],[485,451],[545,448]],
  [[72,539],[169,522],[247,548],[354,543],[449,533],[541,544]],
];

function limitStartPositions(nodes,battle){
  const {chapter,index,original}=battle;
  const training=original===1||original===2;
  const mustKeep=new Set([battle.neutralReserve,battle.opening?.source]);
  for(let owner=1;owner<=4;owner++){
    const owned=nodes.flatMap((node,id)=>node[3]===owner?[id]:[]).sort((a,b)=>nodes[b][4]-nodes[a][4]);
    if(!owned.length)continue;
    mustKeep.add(owned[0]);
    if(owner===1&&owned.length>1&&(training||chapter>=1||index===7)){
      mustKeep.add(owned.find(id=>nodes[id][5]!==nodes[owned[0]][5])??owned[1]);
    }
    if(owner>1){
      const count=opponentPortCount(battle,owned.length);
      for(const id of owned.slice(1,count))mustKeep.add(id);
    }
  }
  return nodes.map((node,id)=>{
    if(node[3]===0||mustKeep.has(id))return node;
    const neutral=node.slice();
    neutral[3]=0;
    neutral[4]=Math.max(7,Math.floor(node[4]*.52));
    return neutral;
  });
}

function opponentPortCount(level,authored){
  if(level.chapter===0)return level.index===6?2:1;
  if(level.chapter===1)return level.index>=6?Math.min(2,authored):1;
  if(level.chapter===2)return level.index%3===1?2:1;
  if(level.chapter===3)return level.index===2?3:2;
  return 2;
}

function balanceOpening(level,nodes){
  const own=nodes.filter(node=>node[3]===1);
  const sides=[...new Set(nodes.filter(node=>node[3]>1).map(node=>node[3]))];
  const neutralReserve=level.neutralReserve;
  const playerBudget=[[20,30,28,23,26,26,28,30],[30,30,32,32,32,34,34,34],
    [34,36,36,38,38,38,40,40],[38,40,40,42,42,42,44,44],[42,42,44,44,44,46,46,46]][level.chapter][level.index];
  const home=own.reduce((main,node)=>node[4]>main[4]?node:main);
  if(own.length===1)home[4]=playerBudget;
  else {
    home[4]=Math.ceil(playerBudget*.59);
    own.find(node=>node!==home)[4]=playerBudget-home[4];
    if(level.chapter>=2){
      home[8]='large';
      own.find(node=>node!==home)[8]='small';
    }
  }

  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const nearestNeutral=nodes
    .filter((node,id)=>node[3]===0&&id!==neutralReserve)
    .reduce((nearest,node)=>distance(home,node)<distance(home,nearest)?node:nearest);
  nearestNeutral[4]=Math.min(nearestNeutral[4],Math.max(3,Math.floor(home[4]/2)-2));
  const openingSalvo=own.reduce((sum,node)=>sum+Math.floor(node[4]/2),0);
  const singleRatio=[1,1.05,1.10,1.16,1.19][level.chapter];
  const rivalRatio=sides.length===1?singleRatio:(sides.length===2?.70:.66)+level.chapter*.026;

  for(const side of sides){
    const ports=nodes.filter(node=>node[3]===side);
    const capital=ports.reduce((main,node)=>node[4]>main[4]?node:main);
    const need=opponentPortCount(level,ports.length);
    const candidates=nodes.filter((node,id)=>node[3]===0&&node!==nearestNeutral&&id!==neutralReserve)
      .sort((a,b)=>distance(capital,a)-distance(capital,b));
    for(const outpost of candidates.slice(0,Math.max(0,need-ports.length))){
      outpost[3]=side;
      ports.push(outpost);
    }
    const budget=Math.round(playerBudget*rivalRatio);
    capital[4]=Math.max(openingSalvo+1,Math.round(budget*(ports.length===1?1:.71)));
    const outposts=ports.filter(node=>node!==capital);
    if(outposts.length){
      const reserves=Math.max(outposts.length*5,budget-capital[4]);
      const share=Math.floor(reserves/outposts.length);
      outposts.forEach((node,index)=>{node[4]=share+(index<reserves%outposts.length?1:0);});
    }
  }
  if(neutralReserve!==undefined&&nodes[neutralReserve][3]===0){
    nodes[neutralReserve][4]=Math.max(openingSalvo,Math.min(nodes[neutralReserve][4],openingSalvo+5));
  }
}

function varyStartingTroops(level,nodes,random){
  const groups=[1,2,3,4].map(side=>nodes.filter(node=>node.owner===side).sort((a,b)=>b.units-a.units));
  const [player,...enemies]=groups.filter(ports=>ports.length);
  const total=ports=>ports.reduce((sum,node)=>sum+node.units,0);
  const integer=(low,high)=>low+Math.floor(random()*(high-low+1));
  const spread=level.chapter<2?2:3;
  const playerBudget=total(player)+integer(-spread,spread);
  distributeStartingTroops(player,playerBudget);
  const firstWave=player.reduce((sum,node)=>sum+Math.floor(node.units/2),0);

  if(enemies.length===1){
    const [enemy]=enemies;
    const localSize={small:0,medium:1,large:2};
    const sizeDifference=localSize[enemy[0].size]-localSize[player[0].size];
    const roll=random();
    const favorEnemy=.72+sizeDifference*.035;
    const lead=integer(1,level.chapter<2?3:5);
    const budget=playerBudget+(roll<favorEnemy?lead:roll<favorEnemy+.17?0:-lead);
    distributeStartingTroops(enemy,budget,firstWave+1);
  }else{
    const perFactionLimit=Math.floor(playerBudget*2.5/enemies.length);
    for(const enemy of enemies){
      const budget=Math.min(perFactionLimit,total(enemy)+integer(-spread,spread));
      distributeStartingTroops(enemy,budget,firstWave+1);
    }
  }
}

function distributeStartingTroops(ports,budget,minimum=0){
  const [capital,...outposts]=ports;
  const guard=4;
  budget=Math.max(budget,minimum+outposts.length*guard);
  if(!outposts.length){capital.units=budget;return;}
  const base=ports.reduce((sum,node)=>sum+node.units,0);
  capital.units=Math.max(minimum,Math.min(budget-outposts.length*guard,Math.round(budget*capital.units/base)));
  const reserves=budget-capital.units;
  const share=Math.floor(reserves/outposts.length);
  outposts.forEach((node,i)=>{node.units=share+(i<reserves%outposts.length?1:0);});
}

function varyIslandPositions(level,nodes,seed){
  let state=(Math.floor(seed*4294967296)>>>0)||0x6d2b79f5;
  const random=()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const home=nodes.find(node=>node.owner===1);
  const nearby=nodes.filter(node=>node.owner===0).sort((a,b)=>distance(home,a)-distance(home,b))[0];
  const originalDistance=distance(home,nearby);
  const minSpacing=73;
  const mirror=level.chapter>0&&random()<.45;
  for(const node of nodes){
    const radius=node.owner===0&&node!==nearby?(level.chapter===0?24:39):level.chapter===0?8:16;
    for(let attempt=0;attempt<6;attempt++){
      const angle=random()*Math.PI*2, offset=radius*(.4+.6*random());
      const candidate={x:Math.round(node.x+Math.cos(angle)*offset),y:Math.round(node.y+Math.sin(angle)*offset)};
      if(candidate.x<60||candidate.x>WIDTH-60||candidate.y<59||candidate.y>HEIGHT-57)continue;
      if(nodes.some(other=>other!==node&&distance(candidate,other)<minSpacing))continue;
      if(node===home&&distance(candidate,nearby)>originalDistance+17)continue;
      if(node===nearby&&distance(candidate,home)>originalDistance+17)continue;
      node.x=candidate.x;node.y=candidate.y;
      break;
    }
  }
  if(mirror)for(const node of nodes)node.x=WIDTH-node.x;
}

function chartBattle(battle){
  const {chapter,index,original}=battle;
  const desired=islandCounts[chapter][index];
  const seed=chapter*19+index*7;
  const nodes=limitStartPositions(battle.nodes,battle).map((node,id)=>{
    const [x,y,name,owner,units,kind,shape,fort=false,size]=node;
    const tier=size??(fort?'large':owner===0?(units>=15?'large':id%3===0?'medium':'small'):'medium');
    const north=original===0?y:Math.round(y*1.06)+18;
    return [x,north,name,owner,units,kind,shape,fort,tier];
  });
  const points=soundingRows.flat().map(([x,y],id)=>[
    x+((id*29+seed*13)%19)-9,
    y+((id*17+seed*11)%23)-11,
  ]);
  const ordered=points.map((point,id)=>points[(id*17+seed)%points.length]);
  while(nodes.length<desired&&ordered.length){
    const distances=ordered.map(([x,y])=>Math.min(...nodes.map(node=>Math.hypot(node[0]-x,node[1]-y))));
    const gap=desired<13?81:74;
    const preferred=distances.findIndex(d=>d>=gap);
    const chosen=preferred<0?distances.indexOf(Math.max(...distances)):preferred;
    const [x,y]=ordered.splice(chosen,1)[0];
    const id=nodes.length,variant=(seed+id*13)%8;
    const size=variant<=3?'small':variant<=5?'medium':'large';
    const kind=chapter>=2&&variant===5?'air':'sea';
    const name=shoalNames[(id+seed)%shoalNames.length]+(kind==='air'?'机场':'');
    const baseGuard=size==='large'?(chapter>=2&&variant===7?21:12):size==='medium'?8:5;
    const units=baseGuard+(seed+id)%4;
    nodes.push([x,y,name,0,units,kind,(id+seed)%4,false,size]);
  }
  balanceOpening(battle,nodes);
  return {...battle,nodes,pace:sailingPace[chapter]};
}

function expandBattle(battle,chapter,index){
  const {rows,tip,delay}=battle;
  if(!rows)return chartBattle({...battle,chapter,index,original:originalBattles.indexOf(battle)});
  const sides={p:1,r:2,b:3,gold:4,n:0};
  const names=harborNames[chapter];
  const nodes=[];
  let neutralReserve;
  rows.forEach((row,y)=>row.split(' ').forEach((cell,x)=>{
    if(cell==='.')return;
    const [,mark,side,count,kind]=/^(@?)(p|r|b|gold|n)(\d+)(a|f)?$/.exec(cell);
    const id=nodes.length;
    if(mark&&side==='n')neutralReserve=id;
    const name=names[(id+index)%names.length]+(kind==='a'?'机场':'');
    const stagger=y%2===0?-7:7;
    nodes.push([94+x*108+stagger+((index+3*x+chapter*7)%19)-9,
      100+y*107+((x*11+index*5+chapter*3)%31)-15,name,sides[side],Number(count),kind==='a'?'air':'sea',(x+y+chapter)%4,kind==='f']);
  }));
  return chartBattle({name:battle.name,guide:tip,rivalDelay:delay,skill:chapter>0,nodes,chapter,index,neutralReserve});
}

const levels=chapters.flatMap((chapter,id)=>chapter.battles.map((battle,index)=>expandBattle(battle,id,index)));
const stageId=level=>`${level.chapter+1}-${level.index+1}`;
