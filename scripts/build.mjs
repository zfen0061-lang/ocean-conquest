import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {Script} from 'node:vm';

const file=path=>new URL('../'+path,import.meta.url);
const read=path=>readFile(file(path),'utf8');
const corePaths=['campaign-levels.js','campaign-atlas.js','campaign-engine.js'].map(name=>'src/core/'+name);
const [core,art,html,web,native,template]=await Promise.all([
  Promise.all(corePaths.map(read)),
  read('src/shared/campaign-art.js'),
  read('src/web/index.html'),
  read('src/web/campaign-ui.js'),
  read('src/douyin/runtime.js'),
  read('src/douyin/project.config.json'),
]);
const browser=[...core,web,art,'setMode(unlocked());requestAnimationFrame(frame);'].join('\n\n');
const douyin=[...core,art,native].join('\n\n');
new Script(browser,{filename:'docs/index.html'});
new Script(douyin,{filename:'build/douyin/game.js'});
await Promise.all(['docs/','build/douyin/'].map(path=>mkdir(file(path),{recursive:true})));
const config=JSON.parse(template);
try{
  const existing=JSON.parse(await read('build/douyin/project.config.json'));
  if(typeof existing.appid==='string')config.appid=existing.appid;
}catch(error){
  if(error.code!=='ENOENT')throw error;
}
await Promise.all([
  writeFile(file('docs/index.html'),html.replace('/* GAME_CODE */',()=>browser)),
  writeFile(file('build/douyin/game.js'),douyin),
  writeFile(file('build/douyin/project.config.json'),JSON.stringify(config,null,2)+'\n'),
  copyFile(file('src/douyin/game.json'),file('build/douyin/game.json')),
]);
console.log('Browser: docs/index.html');
console.log('Douyin: build/douyin/');
