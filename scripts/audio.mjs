const SAMPLE_RATE=16000;
const TAU=2*Math.PI;
const frequency=note=>440*2**((note-69)/12);

function wave(seconds){return new Float32Array(Math.round(seconds*SAMPLE_RATE));}

function add(samples,start,duration,voice){
  const first=Math.round(start*SAMPLE_RATE);
  for(let i=0;i<Math.round(duration*SAMPLE_RATE);i++){
    samples[(first+i)%samples.length]+=voice(i/SAMPLE_RATE);
  }
}

function encodeWav(samples){
  const bytes=Buffer.alloc(44+samples.length*2);
  bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);
  bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);
  bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
  bytes.writeUInt32LE(SAMPLE_RATE,24);bytes.writeUInt32LE(SAMPLE_RATE*2,28);
  bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);
  bytes.write('data',36);bytes.writeUInt32LE(samples.length*2,40);
  for(let i=0;i<samples.length;i++){
    bytes.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);
  }
  return bytes;
}

function selection(note){
  const samples=wave(.1), pitch=frequency(note);
  add(samples,0,.1,t=>Math.min(1,t/.004)*Math.exp(-t/.021)*
    (.43*Math.sin(TAU*pitch*t)+.16*Math.sin(TAU*pitch*2.71*t)));
  return samples;
}

function departure(){
  const samples=wave(.34);
  let seed=70411, low=0;
  add(samples,0,.34,t=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    low+=(seed/2147483648-1-low)*.20;
    const envelope=Math.sin(Math.PI*t/.34)**1.6;
    return envelope*(.67*low+.20*Math.sin(TAU*(102*t+460*t*t)));
  });
  return samples;
}

function pluck(samples,at,note,volume,duration=.54){
  const pitch=frequency(note);
  add(samples,at,duration,t=>{
    const edge=Math.min(1,t/.012,(duration-t)/.055);
    const phase=TAU*pitch*t;
    return volume*edge*Math.exp(-t/.19)*
      (Math.sin(phase)+.29*Math.sin(phase*2)+.08*Math.sin(phase*3));
  });
}

function capture(){
  const samples=wave(.62);
  pluck(samples,0,72,.36,.48);
  pluck(samples,.10,79,.39,.51);
  return samples;
}

function tidalMusic(){
  const beat=.75, bar=beat*4;
  const chords=[[50,57,60,64],[46,53,57,60],[53,57,60,67],[48,55,62,67]];
  const motifs=[[69,72,76],[69,72,74],[72,76,79],[74,72,67]];
  const samples=wave(bar*16);
  for(let measure=0;measure<16;measure++){
    const start=measure*bar, chord=chords[measure%4], melody=motifs[measure%4];
    chord.forEach((note,index)=>{
      const pitch=frequency(note);
      add(samples,start,bar+.55,t=>{
        const fade=Math.min(1,t/.65,(bar+.55-t)/.86);
        const phase=TAU*pitch*t+.13*Math.sin(TAU*.47*t);
        return fade*(index===0?.050:.029)*(Math.sin(phase)+.19*Math.sin(phase*2));
      });
    });
    const variations=measure%8<4?[.5,2,3.25]:[.75,1.75,3];
    variations.forEach((offset,index)=>{
      pluck(samples,start+beat*offset,melody[index],index===0?.126:.090,.72);
      pluck(samples,start+beat*(offset+.5),melody[index],.022,.48);
    });
    for(const offset of [0,2.5]){
      add(samples,start+beat*offset,.12,t=>.076*Math.min(1,t/.008)*Math.exp(-t/.034)*
        Math.sin(TAU*(82*t-125*t*t)));
    }
  }
  return samples;
}

export function renderGameAudio(){
  const clips={select1:selection(78),select2:selection(81),select3:selection(84),
    select4:selection(86),select5:selection(88),
    departure:departure(),capture:capture(),tide:tidalMusic()};
  return Object.fromEntries(Object.entries(clips).map(([name,samples])=>[name,encodeWav(samples)]));
}
