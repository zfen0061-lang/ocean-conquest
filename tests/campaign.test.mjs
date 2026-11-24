import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const files=['../src/core/campaign-levels.js','../src/core/campaign-atlas.js',
  '../src/core/campaign-engine.js','campaign-pilot.js'];
const source=(await Promise.all(files.map(file=>readFile(new URL(file,import.meta.url),'utf8')))).join('\n');
const evaluate=expression=>JSON.parse(runInNewContext(source+'\nJSON.stringify('+expression+')',{}, {timeout:30000}));

test('every campaign map is beatable under the shared rules',()=>{
  const reports=evaluate(`levels.map((level,index)=>{
    let game;
    for(const [neutral,raid,distance,pace] of [[23,30,3,45],[32,25,7,42],[39,30,4,42],[20,35,5,35],[29,35,8,33]]){
      game=newBattle(index,null);
      for(let frame=0;frame<18000&&game.mode==='play';frame++){
        if(frame%pace===10)act(game,neutral,raid,distance);
        step(game,STEP);
      }
      if(game.winner===1)break;
    }
    return {name:level.name,count:game.nodes.length,won:game.winner===1};
  })`);
  assert.equal(reports.length,40);
  assert.equal(reports[0].count,6);
  assert.equal(reports.at(-1).count,22);
  assert.deepEqual(reports.filter(report=>!report.won),[]);
});

test('random starts vary positions without moving island ownership or overlap',()=>{
  const results=evaluate(`levels.map((_,i)=>{
    let seed=17+i;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const before=newBattle(i,null);
    const layouts=new Set();
    let valid=true;
    for(let repeat=0;repeat<100;repeat++){
      const {nodes}=newBattle(i,random);
      layouts.add(nodes.map(n=>n.x+':'+n.y).join(','));
      valid&&=nodes.every((node,id)=>node.owner===before.nodes[id].owner&&node.kind===before.nodes[id].kind&&
        (node.owner!==0||node.units===before.nodes[id].units)&&
        nodes.slice(id+1).every(other=>Math.hypot(node.x-other.x,node.y-other.y)>=73));
    }
    return valid&&layouts.size>=95;
  })`);
  assert.ok(results.every(Boolean));
});

test('neutral garrisons are static, production stops at its cap, and transfers can overstack',()=>{
  const outcome=evaluate(`(()=>{
    const game=newBattle(0,null);
    game.nodes[4].owner=1;
    game.nodes[4].units=79;
    game.nodes[0].units=50;
    for(let i=0;i<120;i++)step(game,STEP);
    const before=[game.nodes[0].units,game.nodes[4].units,game.nodes[1].units];
    sendBatch(game,[4],0,1);
    for(let i=0;i<180;i++)step(game,STEP);
    return [before,game.nodes[0].units,game.nodes[4].units>40];
  })()`);
  assert.deepEqual(outcome,[[50,80,6],90,true]);
});
