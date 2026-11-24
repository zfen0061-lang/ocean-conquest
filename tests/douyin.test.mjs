import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createContext, runInContext} from 'node:vm';

const bundle=await readFile(new URL('../build/douyin/game.js',import.meta.url),'utf8');
const saveKey='ocean-conquest-tidal-routes-v1';
const audioKey='ocean-conquest-audio-v1';
function boot(storage=new Map()){
  const handlers={};
  const frames=[];
  const visited=[];
  const paintCalls=[];
  const audioCalls=[];
  const timers=new Map();
  let now=100,timerId=0;
  const canvasContext=()=>new Proxy({},{
    get(object,key){
      if(key==='measureText')return value=>({width:value.length*11});
      return object[key]??((...args)=>{if(key==='fillText')paintCalls.push(args[0]);});
    },
  });
  const tt={
    createCanvas:()=>({width:0,height:0,getContext:()=>canvasContext()}),
    createInnerAudioContext:()=>({
      play(){audioCalls.push(['play',this.src,this.loop]);},
      stop(){audioCalls.push(['stop',this.src]);},
      pause(){audioCalls.push(['pause',this.src]);},
    }),
    getSystemInfoSync:()=>({windowWidth:390,windowHeight:820,pixelRatio:2,safeArea:{top:14,bottom:801,left:0,right:390}}),
    getStorageSync:key=>storage.get(key),
    setStorageSync:(key,value)=>storage.set(key,structuredClone(value)),
    checkScene:({success})=>success({isExist:true}),
    navigateToScene:({scene})=>visited.push(scene),
  };
  for(const callback of ['Show','Hide','TouchStart','TouchMove','TouchEnd','TouchCancel']){
    tt['on'+callback]=fn=>{handlers[callback]=fn;};
  }
  const context=createContext({tt,requestAnimationFrame:fn=>frames.push(fn),
    setTimeout(fn,delay){const id=++timerId;timers.set(id,{fn,at:now+delay});return id;},
    clearTimeout:id=>timers.delete(id),
  });
  runInContext(bundle,context);
  const read=expression=>runInContext(expression,context);
  const advance=count=>{
    for(let i=0;i<count;i++){
      now+=1000/60;
      frames.shift()(now);
      for(const [id,timer] of timers){
        if(timer.at>now)continue;
        timers.delete(id);
        timer.fn();
      }
    }
  };
  const point=id=>read(`({clientX:state.nodes[${id}].x/620*390,clientY:state.nodes[${id}].y/620*820,identifier:1})`);
  const touch=(kind,item)=>handlers[kind]({touches:[item],changedTouches:[item]});
  function press(id){
    const item=read(`(()=>{const a=actions.find(item=>item.id===${JSON.stringify(id)});return {clientX:a.x+a.w/2,clientY:a.y+a.h/2,identifier:1};})()`);
    touch('TouchStart',item);
    touch('TouchEnd',item);
  }
  advance(1);
  return {read,advance,point,touch,press,handlers,visited,paintCalls,storage,audioCalls};
}

test('native Canvas entry launches, swipes fleet and captures a neutral island',()=>{
  const game=boot();
  assert.ok(game.paintCalls.includes('太平海域 · 第 1 / 200 场'));
  const neutral=game.read('state.nodes[1].units');
  game.touch('TouchStart',game.point(0));
  game.touch('TouchMove',game.point(1));
  game.touch('TouchEnd',game.point(1));
  assert.equal(game.read('state.fleets.length'),1);
  assert.ok(game.read('state.fleets[0].units')>neutral);
  game.advance(100);
  assert.equal(game.read('state.nodes[1].owner'),1);
  assert.deepEqual(game.audioCalls.filter(([kind])=>kind==='play').map(([,src])=>src),
    ['audio/tide.wav','audio/select1.wav','audio/departure.wav','audio/capture.wav']);
});

test('native music waits for user input, pauses in background, and saves separate audio settings',()=>{
  const game=boot();
  assert.deepEqual(game.audioCalls,[]);
  game.press('menu');
  game.advance(1);
  assert.deepEqual(game.audioCalls,[['play','audio/tide.wav',true]]);
  game.handlers.Hide();
  game.handlers.Show({});
  assert.deepEqual(game.audioCalls.slice(1),[['pause','audio/tide.wav'],['play','audio/tide.wav',true]]);
  game.press('music');
  assert.deepEqual(game.storage.get(audioKey),{music:false,effects:true});
  assert.deepEqual(game.audioCalls.at(-1),['pause','audio/tide.wav']);
  game.press('effects');
  assert.deepEqual(game.storage.get(audioKey),{music:false,effects:false});
  const reopened=boot(game.storage);
  reopened.touch('TouchStart',reopened.point(0));
  reopened.touch('TouchMove',reopened.point(1));
  reopened.touch('TouchEnd',reopened.point(1));
  reopened.advance(100);
  assert.equal(reopened.read('state.nodes[1].owner'),1);
  assert.deepEqual(reopened.audioCalls,[]);
});

test('rapid multi-island selections play five ascending clips and stay at the highest pitch afterward',()=>{
  const game=boot(new Map([[audioKey,{music:false,effects:true}]]));
  game.read('battleAudio.start(); for(let count=1;count<=6;count++)battleAudio.selection(count);');
  game.advance(25);
  assert.deepEqual(game.audioCalls.map(([,src])=>src),
    ['audio/select1.wav','audio/select2.wav','audio/select3.wav','audio/select4.wav','audio/select5.wav']);
  game.read('battleAudio.selection(7)');
  assert.deepEqual(game.audioCalls.at(-1),['play','audio/select5.wav',false]);
  game.read('battleAudio.selection(2); battleAudio.selection(3);');
  game.handlers.Hide();
  game.advance(25);
  assert.equal(game.audioCalls.filter(([kind])=>kind==='play').length,6);
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

test('existing 40-stage saves resume in the expanded campaign and can enter the second sea route',()=>{
  const best=Object.fromEntries(Array.from({length:40},(_,i)=>[`${Math.floor(i/8)+1}-${i%8+1}`,15]));
  const game=boot(new Map([[saveKey,{best,skin:'sail'}]]));
  assert.equal(game.read('state.mission'),40);
  assert.equal(game.read('state.skin'),'sail');
  game.read('openStage(49); for(const node of state.nodes)if(node.owner>1)node.owner=1;');
  game.advance(3);
  assert.ok(game.paintCalls.includes('前往云岬群岛'));
  game.press('next');
  game.advance(1);
  assert.equal(game.read('state.mission'),50);
  assert.ok(game.paintCalls.includes('云岬群岛 · 第 51 / 200 场'));
  assert.equal(game.storage.get(saveKey).best['1-1'],15);
  assert.ok(game.storage.get(saveKey).best['route-50']>0);
});
