const audioSettingsKey='ocean-conquest-audio-v1';
const soundLevels={departure:.52,capture:.55,tide:.29};
const selectionSounds=['select1','select2','select3','select4','select5'];
const selectionSpacing=55;

function createCampaignAudio(createClip,readSettings,writeSettings){
  let stored;
  try{stored=readSettings();}catch{}
  const settings={music:stored?.music!==false,effects:stored?.effects!==false};
  const clips=new Map();
  let started=false,visible=true,playingMusic=false;
  let musicAttempt=0;
  let lastCapture=-Infinity;
  let selectionTimer=null;
  const pendingSelections=[];

  function getClip(name){
    if(!clips.has(name)){
      try{clips.set(name,createClip(name,soundLevels[name]??.47,name==='tide'));}
      catch{clips.set(name,null);}
    }
    return clips.get(name);
  }
  function syncMusic(){
    const wanted=started&&visible&&settings.music;
    if(wanted===playingMusic)return;
    playingMusic=wanted;
    const attempt=++musicAttempt;
    if(wanted){
      try{getClip('tide')?.play(false)?.catch(()=>{if(attempt===musicAttempt)playingMusic=false;});}
      catch{playingMusic=false;}
    }else clips.get('tide')?.pause();
  }
  function playEffect(name){
    if(!started||!visible||!settings.effects)return false;
    try{getClip(name)?.play(true)?.catch(()=>{});}catch{}
    return true;
  }
  function muteEffects(){
    if(selectionTimer!==null)clearTimeout(selectionTimer);
    selectionTimer=null;
    pendingSelections.length=0;
    for(const [name,clip] of clips)if(name!=='tide')clip?.pause();
  }
  function playSelection(name){
    if(!playEffect(name))return;
    selectionTimer=setTimeout(()=>{
      selectionTimer=null;
      const next=pendingSelections.shift();
      if(next)playSelection(next);
    },selectionSpacing);
  }
  return {
    settings,
    start(){started=true;syncMusic();},
    toggle(key){
      settings[key]=!settings[key];
      try{writeSettings(settings);}catch{}
      if(key==='effects'&&!settings.effects)muteEffects();
      syncMusic();
    },
    visibility(value){visible=value;if(!visible)muteEffects();syncMusic();},
    selection(count){
      const pitch=Math.min(selectionSounds.length,Math.max(1,count));
      const name=selectionSounds[pitch-1];
      if(selectionTimer===null)playSelection(name);
      else if(pendingSelections[pendingSelections.length-1]!==name)pendingSelections.push(name);
    },
    departure(){playEffect('departure');},
    capture(owner){
      const now=Date.now();
      if(owner===1&&now-lastCapture>=200&&playEffect('capture'))lastCapture=now;
    },
  };
}
