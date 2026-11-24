'use strict';
const WIDTH=620, HEIGHT=620, STEP=1/60, CONTACT=14, EPS=1e-8;
const factions=['中立','青方','朱方','蓝方','赭方'];
const palette=['#6b5b43','#1a665a','#a94d48','#425e91','#8c602b'];
const wakes=['#ebdcbd','#b8e1c9','#ecc2ab','#c7d7ec','#edcf9f'];
const opponents=[
  {owner:2,first:4.2,interval:4.0,neutralBias:4,raidBias:9},
  {owner:3,first:5.9,interval:4.6,neutralBias:10,raidBias:5},
  {owner:4,first:7.0,interval:4.9,neutralBias:7,raidBias:7},
];
const originalBattles=[
  {name:'试潮', lesson:'海军入门', brief:'先占近处的浅沙洲，再向对岸推进。', guide:'先抢浅沙洲和丰汐大岛。等两个方向都攒够兵，再合力攻下北岬。', rivalDelay:14, nodes:[
    [160,366,'青湾',1,20,'sea',0,false,'medium'],[264,316,'浅沙洲',0,6,'sea',1,false,'small'],
    [464,145,'北岬',2,20,'sea',2,false,'medium'],[119,153,'白螺岛',0,9,'sea',3,false,'small'],
    [314,427,'丰汐大岛',0,9,'sea',0,false,'large'],[505,470,'长风屿',0,11,'sea',3,false,'small'],
  ]},
  {name:'双帆', lesson:'一笔集结', brief:'圆沙洲的守军比单岛能派出的多。把青湾和白帆港连进同一笔。', guide:'青湾 → 白帆港 → 圆沙洲。滑过的己方港口会加入预览，松手才出兵。', rivalDelay:7, nodes:[
    [119,360,'青湾',1,29,'sea',0],[254,409,'白帆港',1,30,'sea',1],[332,235,'圆沙洲',0,22,'sea',3],[473,115,'赤岬港',2,23,'sea',2],[502,359,'豆荚岛',0,10,'sea',1],
  ]},
  {name:'迎浪', lesson:'航中拦截', brief:'朱方开局会直扑青湾。你可以出航迎击，让较强的一队继续前进。', guide:'同类敌军在途中相遇时等量抵消。20 对 12，剩 8 的一方继续航行。', opening:{at:2.3,side:2,source:2,target:0}, rivalDelay:6, nodes:[
    [125,359,'青湾',1,41,'sea',3],[253,427,'回船屿',1,23,'sea',1],[477,115,'赤崖',2,34,'sea',2],[508,333,'灯塔湾',2,14,'sea',0],[271,210,'潮声岛',0,11,'sea',1],
  ]},
  {name:'分水', lesson:'三方争岛', brief:'两家对手会彼此争岛。盯住他们出兵后空下来的港口。', guide:'本关解锁顺风令。每局一次，让下一批舰船加速 35%，可抢在敌人前抵达。', skill:true,rivalDelay:4,nodes:[
    [116,361,'青湾',1,39,'sea',0],[255,431,'白帆港',1,35,'sea',1],[462,110,'朱崖',2,25,'sea',2],[527,272,'烈风港',2,20,'sea',3],[104,111,'雾港',3,26,'sea',1],[233,163,'紫杉岛',3,20,'sea',2],[325,268,'中央沙洲',0,13,'sea',0],[457,403,'半月岛',0,10,'sea',1],[111,230,'砂砾岛',0,9,'sea',3],
  ]},
  {name:'掠海', lesson:'解锁飞机', brief:'夺下中央空港，即可从那里派出飞机，快速争夺远处的岛。', guide:'飞机比舰船飞得快，能飞越船队，也会被敌机拦截。大空港比小空港补充兵力快。', skill:true,rivalDelay:5,nodes:[
    [112,368,'潮汐港',1,35,'sea',0],[266,422,'晨湾',1,27,'sea',2],[485,132,'暮云港',2,31,'sea',1],[532,331,'外礁',2,20,'sea',0],[286,224,'中央空港',0,13,'air',3],[130,111,'比翼岛',0,11,'sea',1],
  ]},
  {name:'岸防', lesson:'舰队攻坚', brief:'赤石堡有岸防。飞机攻击它时只按六成兵力结算，集结舰船攻坚更合适。', guide:'飞机适合抢空港和绕行，舰船能拦截敌舰，并以完整兵力攻击岸防港。', skill:true,nodes:[
    [135,356,'南汐港',1,38,'sea',0],[257,428,'白棠港',1,32,'sea',1],[141,132,'鸥翼机场',1,23,'air',2],[488,152,'赤石堡',2,37,'sea',3,true],[513,350,'飞屿机场',2,25,'air',1],[339,260,'石门岛',0,14,'sea',2],
  ]},
  {name:'四海', lesson:'四方混战', brief:'另外三个阵营各自扩张。你可以先抢空港，也可以吞并离你最近的一家。', guide:'查看地图上的出兵方向。保存核心港的守军，再把几路舰队投向同一个薄弱目标。', skill:true,rivalDelay:4,nodes:[
    [114,367,'松沙港',1,44,'sea',0,false,'large'],[260,434,'晨湾',1,37,'sea',1],[510,116,'朱岬',2,31,'sea',2],[540,253,'红帆港',2,22,'sea',1],[100,110,'蓝石',3,28,'sea',2],[224,165,'云门机场',3,18,'air',0],[510,423,'赭金湾',4,30,'sea',3],[386,400,'金帆港',4,22,'sea',1],[95,238,'碎贝岛',0,10,'sea',3],[321,272,'横风空港',0,14,'air',1],
  ]},
  {name:'长明', lesson:'四方混战', brief:'三家对手在海峡两侧展开。', guide:'舰队攻打岸防港，空军负责快速增援。可以从兵力较薄的一侧开始扩张。', skill:true,rivalDelay:3,neutralReserve:8,nodes:[
    [117,353,'青棠港',1,42,'sea',2],[244,429,'大风港',1,37,'sea',1],[116,122,'回雁机场',1,34,'air',3],[494,113,'朱崖',2,29,'sea',0],[539,237,'咸潮港',2,23,'sea',1],[292,117,'苍蓝港',3,27,'sea',3],[480,394,'金水港',4,30,'sea',0],[387,426,'金岬机场',4,21,'air',2],[320,254,'灯塔港',0,21,'sea',3,true],
  ]},
];
function newBattle(i,random=Math.random){
  const level=levels[i];
  const nodes=level.nodes.map(([x,y,name,owner,units,kind,shape,fort=false,size='medium'])=>
    ({x,y,name,owner,units,kind,shape,fort,size,growth:0,pulseUntil:0}));
  const factionSet=new Set(nodes.map(node=>node.owner));
  const enemies=opponents.filter(plan=>factionSet.has(plan.owner)).map(plan=>({...plan,
    interval:plan.interval*(level.rivalTempo??1),at:plan.first+(level.rivalDelay??0)}));
  let rivalTactics=null;
  if(random&&level.chapter!==undefined){
    varyStartingTroops(level,nodes,random);
    varyIslandPositions(level,nodes,random());
  }
  if(enemies.length>1&&(random||level.routeStage)){
    const roll=random?random():(level.routeStage*43%100)/100;
    const pincerChance=level.pincerChance??.30;
    const mode=roll<pincerChance?'pincer':roll<pincerChance+.37?'rivalry':'mixed';
    const pincerAt=level.pincerAt??18;
    rivalTactics={mode,firstRivalOrder:null,nextPincer:mode==='pincer'?pincerAt:mode==='mixed'?pincerAt+6:Infinity};
  }
  return {mission:i,nodes,enemies,rivalTactics,
    fleets:[],effects:[],time:0,nextId:1,mode:'play',winner:0,windSpent:false,openingSent:false};
}
