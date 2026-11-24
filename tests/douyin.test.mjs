import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createContext, runInContext} from 'node:vm';

const bundle=await readFile(new URL('../build/douyin/game.js',import.meta.url),'utf8');
const saveKey='ocean-conquest-tidal-routes-v1';
function boot(storage=new Map()){
  const handlers={};
  const frames=[];
  const visited=[];
  const paintCalls=[];
  const canvasContext=()=>new Proxy({},{
    get(object,key){
      if(key==='measureText')return value=>({width:value.length*11});
      return object[key]??((...args)=>{if(key==='fillText')paintCalls.push(args[0]);});
    },
  });
  const tt={
    createCanvas:()=>({width:0,height:0,getContext:()=>canvasContext()}),
    getSystemInfoSync:()=>({windowWidth:390,windowHeight:820,pixelRatio:2,safeArea:{top:14,bottom:801,left:0,right:390}}),
    getStorageSync:key=>storage.get(key),
    setStorageSync:(key,value)=>storage.set(key,structuredClone(value)),
    checkScene:({success})=>success({isExist:true}),
    navigateToScene:({scene})=>visited.push(scene),
  };
  for(const callback of ['Show','Hide','TouchStart','TouchMove','TouchEnd','TouchCancel']){
    tt['on'+callback]=fn=>{handlers[callback]=fn;};
  }
  const context=createContext({tt,requestAnimationFrame:fn=>frames.push(fn)});
  runInContext(bundle,context);
  const read=expression=>runInContext(expression,context);
  let now=100;
  const advance=count=>{
    for(let i=0;i<count;i++)frames.shift()(now+=1000/60);
  };
  const point=id=>read(`({clientX:state.nodes[${id}].x/620*390,clientY:state.nodes[${id}].y/620*820,identifier:1})`);
  const touch=(kind,item)=>handlers[kind]({touches:[item],changedTouches:[item]});
  function press(id){
    const item=read(`(()=>{const a=actions.find(item=>item.id===${JSON.stringify(id)});return {clientX:a.x+a.w/2,clientY:a.y+a.h/2,identifier:1};})()`);
    touch('TouchStart',item);
    touch('TouchEnd',item);
  }
  advance(1);
  return {read,advance,point,touch,press,handlers,visited,paintCalls,storage};
}

test('native Canvas entry launches, swipes fleet and captures a neutral island',()=>{
  const game=boot();
  assert.ok(game.paintCalls.includes('第 1 / 40 场'));
  const neutral=game.read('state.nodes[1].units');
  game.touch('TouchStart',game.point(0));
  game.touch('TouchMove',game.point(1));
  game.touch('TouchEnd',game.point(1));
  assert.equal(game.read('state.fleets.length'),1);
  assert.ok(game.read('state.fleets[0].units')>neutral);
  game.advance(100);
  assert.equal(game.read('state.nodes[1].owner'),1);
});

test('native progression saves, resumes, and handles sidebar and background events',()=>{
  const game=boot();
  game.advance(18);
  game.handlers.Hide();
  const time=game.read('state.time');
  game.advance(100);
  assert.equal(game.read('state.time'),time);
  game.handlers.Show({});
  game.advance(3);
  assert.ok(game.read('state.time')>time);
  game.press('sidebar');
  game.advance(1);
  game.press('jump');
  assert.deepEqual(game.visited,['sidebar']);
  game.handlers.Show({launch_from:'homepage',location:'sidebar_card'});
  game.advance(1);
  assert.ok(game.paintCalls.includes('已从侧边栏进入游戏'));
  game.press('back');
  game.read('for(const node of state.nodes)if(node.owner>1)node.owner=1');
  game.advance(3);
  assert.equal(game.read('screen'),'result');
  assert.ok(game.storage.get(saveKey).best['1-1']>0);
  game.press('next');
  assert.equal(game.read('state.mission'),1);
  assert.equal(boot(game.storage).read('state.mission'),1);
});
