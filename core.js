'use strict';
/* =========================================================
   KABBARET · EL JUEGO — núcleo: pantalla, audio, dibujo, público, diálogos
   ========================================================= */
const W = 240, H = 420;
const $ = id => document.getElementById(id);
const cv = $('cv');
let ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
function fit(){ const w = $('wrap').clientWidth, h = $('wrap').clientHeight, s = Math.min(w/W, h/H); cv.style.width = (W*s)+'px'; cv.style.height = (H*s)+'px'; }
addEventListener('resize', fit); fit();

const store = {
  get(){ try { return JSON.parse(localStorage.getItem('kab-rescued') || '[]'); } catch(e){ return []; } },
  set(v){ try { localStorage.setItem('kab-rescued', JSON.stringify(v)); } catch(e){} },
  add(k){ const v = this.get(); if (!v.includes(k)) { v.push(k); this.set(v); } },
  has(k){ return this.get().includes(k); }
};
function vibrate(ms){ try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} }

// imágenes usadas dentro del canvas (jefes)
const IMG = {};
['laca','deadline','ivan','enredo','ricardo','diego'].forEach(k => { const im = new Image(); im.src = 'p_' + k + '.jpg'; IMG[k] = im; });

/* ======================= AUDIO ROCK (sintetizado) ======================= */
let AC = null, master = null, gIn = null, muted = false;
function curve(k){ const n = 2048, c = new Float32Array(n); for (let i=0;i<n;i++){ const x = i*2/n-1; c[i] = (1+k)*x/(1+k*Math.abs(x)); } return c; }
function initAudio(){
  if (AC){ if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted ? 0 : .5;
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(AC.destination);
    gIn = AC.createGain();
    const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
    const sh = AC.createWaveShaper(); sh.curve = curve(90); sh.oversample = '4x';
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = .8;
    const mid = AC.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 800; mid.gain.value = -5;
    const out = AC.createGain(); out.gain.value = .22;
    gIn.connect(hp); hp.connect(sh); sh.connect(mid); mid.connect(lp); lp.connect(out); out.connect(master);
  } catch(e){ AC = null; }
}
const now = () => AC ? AC.currentTime : 0;
function env(g, t, a, v, d){ g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t+a); g.gain.exponentialRampToValueAtTime(.0001, t+d); }
function tone(f, d=.12, type='square', v=.1, at=null, slide=0){
  if (!AC) return; const t = at ?? AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f*slide), t+d);
  env(g, t, .005, v, d); o.connect(g); g.connect(master); o.start(t); o.stop(t+d+.05);
}
let nb = null;
function noise(d=.06, v=.15, at=null, type='highpass', freq=1000, q=.7){
  if (!AC) return;
  if (!nb){ nb = AC.createBuffer(1, AC.sampleRate*2, AC.sampleRate); const c = nb.getChannelData(0); for (let i=0;i<c.length;i++) c[i] = Math.random()*2-1; }
  const t = at ?? AC.currentTime, s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter();
  s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q; env(g, t, .004, v, d);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t+d+.05);
}
function pchord(semi, d=.2, at=null, mute=false, v=.06){
  if (!AC) return; const t = at ?? AC.currentTime, f = 82.41*Math.pow(2, semi/12);
  [1, 1.4983, 2].forEach(m => [-7, 7].forEach(det => {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = f*m; o.detune.value = det;
    env(g, t, .004, v*(m===2?.6:1), mute ? Math.min(d,.11) : d); o.connect(g); g.connect(gIn); o.start(t); o.stop(t+d+.05);
  }));
}
function lead(f, d=.18, v=.05, at=null, bend=0){
  if (!AC) return; const t = at ?? AC.currentTime, o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain();
  o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(bend ? f*Math.pow(2,-bend/12) : f, t); o2.frequency.setValueAtTime(f*2.001, t);
  if (bend) o.frequency.linearRampToValueAtTime(f, t+.08);
  lfo.frequency.value = 6.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f*.012, t+.12); lfo.connect(lg); lg.connect(o.frequency);
  env(g, t, .006, v, d+.12); o.connect(g); const g2 = AC.createGain(); g2.gain.value = .3; o2.connect(g2); g2.connect(g); g.connect(gIn);
  [o,o2,lfo].forEach(x => { x.start(t); x.stop(t+d+.2); });
}
function bass(semi, d=.2, v=.16, at=null){
  if (!AC) return; const t = at ?? AC.currentTime, o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.value = 41.2*Math.pow(2, semi/12); f.type = 'lowpass'; f.frequency.value = 600;
  env(g, t, .004, v, d); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t+d+.05);
}
const DR = {
  kick(t, v=.55){ if (!AC) return; const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t+.13); env(g, t, .002, v, .3); o.connect(g); g.connect(master); o.start(t); o.stop(t+.35); noise(.012, .25, t, 'highpass', 3000); },
  snare(t, v=.28){ noise(.17, v, t, 'bandpass', 1900, .6); tone(190, .09, 'triangle', .14, t, .7); },
  hat(t, open=false, v=.06){ noise(open?.22:.035, v, t, 'highpass', 8500); },
  crash(t, v=.16){ noise(1.4, v, t, 'highpass', 5200); },
  tom(t, f=140){ tone(f, .22, 'sine', .3, t, .55); }
};
const SFX = {
  blip(){ tone(880,.03,'square',.03); },
  ok(){ lead(659.3,.12,.05); lead(987.8,.2,.05,now()+.1); },
  bad(){ pchord(1,.5,null,false,.05); pchord(7,.5,null,false,.04); lead(1975,.5,.025,now()+.05,-3); },
  boo(){ noise(.9,.06,null,'lowpass',450); },
  cheer(){ noise(1.3,.1,null,'bandpass',1400,.3); noise(1,.06,now()+.1,'highpass',3000); },
  life(){ [523,659,1046].forEach((f,i)=>lead(f,.12,.05,now()+i*.08)); },
  beer(){ noise(.35,.08,null,'highpass',2500); tone(400,.25,'triangle',.07,null,2); },
  chili(){ lead(330,.5,.06,null,12); },
  hey(){ const t = now(); DR.crash(t); DR.kick(t); pchord(0,.9,t); pchord(5,.9,t+.45); lead(987.8,.9,.05,t+.2,2); },
  ring(){ for (let i=0;i<6;i++) tone(i%2?1320:1046,.07,'square',.05,now()+i*.08); },
  unlock(){ const t = now(); DR.crash(t); [0,3,5,7,10,12].forEach((s,i)=>pchord(s,.18,t+i*.1,true,.05)); pchord(12,1.2,t+.6,false,.05); lead(1318.5,1,.05,t+.6,2); DR.kick(t+.6); },
  whoosh(){ noise(.35,.1,null,'lowpass',2400); },
  riffStab(){ const t = now(); DR.kick(t); pchord(0,.35,t); },
  quack(){ tone(620,.12,'square',.1,null,.5); tone(560,.14,'square',.1,now()+.16,.5); },
  horn(){ for (let i=0;i<3;i++){ tone(466,.12,'square',.08,now()+i*.15); tone(587,.12,'square',.06,now()+i*.15); } },
  siren(){ tone(600,.7,'sine',.1,null,1.6); tone(900,.6,'sine',.08,now()+.7,.6); },
  pedal(i){ pchord([0,3,5,7][i], .4, null, false, .055); },
  ding(){ tone(1568,.5,'triangle',.12); },
  slap(){ noise(.08,.35,null,'bandpass',900,.8); DR.kick(now(),.4); },
  ball(){ tone(900,.12,'square',.05,null,.4); },
  thud(){ DR.kick(now(),.6); noise(.2,.2,null,'lowpass',600); },
  bell(){ [0,.18,.36].forEach(d => tone(1760,.5,'triangle',.12,now()+d)); },
  punch(){ DR.kick(now(),.5); noise(.06,.3,null,'bandpass',600); },
  mail(){ tone(1200,.05,'square',.04); tone(1600,.05,'square',.04,now()+.05); },
  lowEnd(){ const t = now(); bass(0,1.2,.3,t); bass(-12,1.2,.25,t); DR.kick(t,.7); DR.crash(t); },
  horn2(){ tone(392,.18,'square',.08); tone(392,.25,'square',.08,now()+.22); },
  screech(){ tone(2600,.5,'sawtooth',.04,null,1.3); },
  alarm(){ for (let i=0;i<4;i++) tone(1400,.06,'square',.06,now()+i*.1); }
};
const SCALE = [329.6,392,440,493.9,587.3,659.3,784,880,987.8,1174.7,1318.5];
let si = 4;
function soloNote(){ si = Math.max(0, Math.min(SCALE.length-1, si + [-2,-1,1,1,2][Math.random()*5|0])); lead(SCALE[si], .16, .055, null, Math.random()<.25 ? 2 : 0); }

const RIFF = {
  rock:  [[0,1,1],[0,1,1],[0,1,1],[0,1,1],[3,2,0],0,[5,2,0],0,[0,1,1],[0,1,1],[0,1,1],[0,1,1],[-2,2,0],0,[-4,2,0],0],
  metal: [[0,1,1],[0,1,1],[0,1,1],[0,1,1],[0,1,1],[0,1,1],[1,2,0],0,[0,1,1],[0,1,1],[0,1,1],[0,1,1],[3,1,0],[5,1,0],[6,2,0],0],
  boss:  [[0,1,1],[0,1,1],[7,1,0],[0,1,1],[0,1,1],[6,1,0],[0,1,1],[0,1,1],[5,1,0],[0,1,1],[3,1,0],[0,1,1],[1,2,0],0,[0,2,0],0],
  anthem:[[0,2,0],0,[0,1,1],[0,1,1],[5,2,0],0,[7,2,0],0,[3,2,0],0,[3,1,1],[3,1,1],[5,2,0],0,[-2,2,0],0],
  funk:  [[0,1,1],0,[0,1,1],[12,1,1],0,[10,1,1],[0,1,1],0,[3,1,1],0,[5,1,1],[0,1,1],0,[7,1,1],[5,1,1],[3,1,1]],
};
const MODES = {
  calm:{ bpm:96, riff:null }, rock:{ bpm:134, riff:'rock' }, party:{ bpm:140, riff:'rock', crash:true },
  metal:{ bpm:150, riff:'metal' }, boss:{ bpm:168, riff:'boss', dbl:true }, anthem:{ bpm:126, riff:'anthem', crash:true },
  funk:{ bpm:112, riff:'funk' }, silence:{ bpm:96, riff:null, mute:true },
  credits:{ bpm:66, riff:null, soft:true }   // créditos: piano y colchón suaves, sin batería
};
const music = { on:false, step:0, next:0, mode:'calm' };
function spb(){ return 60/MODES[music.mode].bpm/4; }
setInterval(() => {
  if (!AC || !music.on) return;
  while (music.next < AC.currentTime + .12){
    const M = MODES[music.mode], s = music.step % 16, t = music.next, d = spb();
    if (M.mute){} else if (M.soft){   // I–V–vi–IV en Mi mayor, un compás por acorde: colchón, bajo y arpegio lento
      const CH = [[52,56,59,64],[47,54,59,63],[49,56,61,64],[45,52,57,61]][(music.step/16|0) % 4], mf = m => 440*Math.pow(2, (m - 69)/12);
      if (s === 0){ CH.slice(0, 3).forEach(m => tone(mf(m), d*15, 'sine', .018, t)); tone(mf(CH[0] - 12), d*7, 'triangle', .04, t); }
      if (s === 8) tone(mf(CH[0] - 12), d*7, 'triangle', .03, t);
      if (s % 2 === 0){ const ar = [0, 1, 2, 3, 2, 1, 2, 3][s/2]; tone(mf(CH[ar] + 12), d*3, 'triangle', s % 8 === 0 ? .026 : .018, t); }
    } else if (!M.riff){
      if (s % 8 === 0) tone(82.41, .9, 'triangle', .07, t);
      if (s % 4 === 2) DR.hat(t, false, .03);
      if (s === 0){ tone(329.6, .6, 'triangle', .03, t); tone(493.9, .6, 'triangle', .02, t+d*2); }
    } else {
      const n = RIFF[M.riff][s];
      if (n){ if (M.riff === 'funk') bass(n[0], d*.9, .14, t); else { pchord(n[0], d*n[1]*.95, t, !!n[2], n[2] ? .045 : .055); tone(41.2*Math.pow(2,n[0]/12), d*n[1]*.9, 'square', .06, t); } }
      if (M.dbl){ if (s % 2 === 0) DR.kick(t, .4); }
      else if (s===0 || s===8 || s===10 || (music.mode==='metal' && (s===3||s===11))) DR.kick(t);
      if (s===4 || s===12) DR.snare(t);
      DR.hat(t, s===14, s%2 ? .03 : .055);
      if (M.crash && s===0 && (music.step/16|0)%2===0) DR.crash(t);
    }
    music.next += d; music.step++;
  }
}, 25);
function setMusic(m){ if (music.mode !== m && music.on && AC && !MODES[m].mute && !MODES[m].soft) DR.crash(AC.currentTime+.02, .1); music.mode = m; if (AC && !music.on){ music.on = true; music.next = AC.currentTime + .05; } }
function beatTimes(n){ const d = spb(), first = music.next + ((4 - music.step % 4) % 4) * d, out = []; for (let i=-1;i<n;i++) out.push(first + i*4*d); return out; }

// voces sostenidas (palanca Floyd, voz de Cami)
function holdVoice(type='sawtooth', toGuitar=true, v=.05){
  if (!AC) return null; const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = 196; g.gain.value = 0;
  const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 4; lfo.connect(lg); lg.connect(o.frequency); lfo.start();
  o.connect(g); g.connect(toGuitar ? gIn : master); o.start();
  return { set(f, on){ o.frequency.setTargetAtTime(f, AC.currentTime, .03); g.gain.setTargetAtTime(on ? v : 0, AC.currentTime, .04); },
           stop(){ try { g.gain.setTargetAtTime(0, AC.currentTime, .05); o.stop(AC.currentTime+.3); lfo.stop(AC.currentTime+.3); } catch(e){} } };
}

/* ======================= DIBUJO ======================= */
const C = { night:'#0b0718', ink:'#f1ecff', muted:'#a99dd0', neon:'#ff2e4d', violet:'#9b6bff', cyan:'#36d6ff', gold:'#ffd34d', ok:'#3dff8a', panel:'#160f2b', edge:'#3b2f66', magenta:'#ff4fd8', orange:'#ff7a1f' };
function r(x,y,w,h,c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
function txt(s, x, y, col=C.ink, align='left', size=8, shadow='#000'){
  ctx.font = size + 'px "Press Start 2P", monospace'; ctx.textAlign = align; ctx.textBaseline = 'top';
  if (shadow){ ctx.fillStyle = shadow; ctx.fillText(s, Math.round(x)+1, Math.round(y)+1); }
  ctx.fillStyle = col; ctx.fillText(s, Math.round(x), Math.round(y));
}
// Fuente pixel grande 5×7 con minúsculas y tildes (dibujada a mano, nítida y sin depender de fuentes web): textos de minijuegos
const PXB = {"A":[".###.","#...#","#...#","#####","#...#","#...#","#...#",".....","....."],"B":["####.","#...#","#...#","####.","#...#","#...#","####.",".....","....."],"C":[".###.","#...#","#....","#....","#....","#...#",".###.",".....","....."],"D":["####.","#...#","#...#","#...#","#...#","#...#","####.",".....","....."],"E":["#####","#....","#....","####.","#....","#....","#####",".....","....."],"F":["#####","#....","#....","####.","#....","#....","#....",".....","....."],"G":[".###.","#...#","#....","#.###","#...#","#...#",".####",".....","....."],"H":["#...#","#...#","#...#","#####","#...#","#...#","#...#",".....","....."],"I":["###",".#.",".#.",".#.",".#.",".#.","###","...","..."],"J":["..###","...#.","...#.","...#.","#..#.","#..#.",".##..",".....","....."],"K":["#...#","#..#.","#.#..","##...","#.#..","#..#.","#...#",".....","....."],"L":["#....","#....","#....","#....","#....","#....","#####",".....","....."],"M":["#...#","##.##","#.#.#","#.#.#","#...#","#...#","#...#",".....","....."],"N":["#...#","##..#","##..#","#.#.#","#..##","#..##","#...#",".....","....."],"O":[".###.","#...#","#...#","#...#","#...#","#...#",".###.",".....","....."],"P":["####.","#...#","#...#","####.","#....","#....","#....",".....","....."],"Q":[".###.","#...#","#...#","#...#","#.#.#","#..#.",".##.#",".....","....."],"R":["####.","#...#","#...#","####.","#.#..","#..#.","#...#",".....","....."],"S":[".####","#....","#....",".###.","....#","....#","####.",".....","....."],"T":["#####","..#..","..#..","..#..","..#..","..#..","..#..",".....","....."],"U":["#...#","#...#","#...#","#...#","#...#","#...#",".###.",".....","....."],"V":["#...#","#...#","#...#","#...#","#...#",".#.#.","..#..",".....","....."],"W":["#...#","#...#","#...#","#.#.#","#.#.#","##.##","#...#",".....","....."],"X":["#...#","#...#",".#.#.","..#..",".#.#.","#...#","#...#",".....","....."],"Y":["#...#","#...#",".#.#.","..#..","..#..","..#..","..#..",".....","....."],"Z":["#####","....#","...#.","..#..",".#...","#....","#####",".....","....."],"0":[".###.","#...#","#..##","#.#.#","##..#","#...#",".###.",".....","....."],"1":[".#.","##.",".#.",".#.",".#.",".#.","###","...","..."],"2":[".###.","#...#","....#","...#.","..#..",".#...","#####",".....","....."],"3":["####.","....#","....#",".###.","....#","....#","####.",".....","....."],"4":["...#.","..##.",".#.#.","#..#.","#####","...#.","...#.",".....","....."],"5":["#####","#....","####.","....#","....#","#...#",".###.",".....","....."],"6":[".###.","#....","#....","####.","#...#","#...#",".###.",".....","....."],"7":["#####","....#","...#.","..#..",".#...",".#...",".#...",".....","....."],"8":[".###.","#...#","#...#",".###.","#...#","#...#",".###.",".....","....."],"9":[".###.","#...#","#...#",".####","....#","....#",".###.",".....","....."],"♪":["..##.","..#.#","..#..","..#..",".##..","###..",".#...",".....","....."],"@":[".###.","#...#","#.###","#.#.#","#.###","#....",".####",".....","....."],"?":[".###.","#...#","....#","...#.","..#..",".....","..#..",".....","....."],"¿":["..#..",".....","..#..",".#...","#....","#...#",".###.",".....","....."],"!":["#","#","#","#","#",".","#",".","."],"¡":[".",".","#",".","#","#","#","#","#"],"(":[".#","#.","#.","#.","#.","#.",".#","..",".."],")":["#.",".#",".#",".#",".#",".#","#.","..",".."],"/":["..#","..#",".#.",".#.",".#.","#..","#..","...","..."],"%":["##..#","##.#.","...#.","..#..",".#...",".#.##","#..##",".....","....."],"a":[".....",".....",".###.","....#",".####","#...#",".####",".....","....."],"b":["#....","#....","####.","#...#","#...#","#...#","####.",".....","....."],"c":["....","....",".###","#...","#...","#...",".###","....","...."],"d":["....#","....#",".####","#...#","#...#","#...#",".####",".....","....."],"e":[".....",".....",".###.","#...#","#####","#....",".###.",".....","....."],"f":["..##",".#..","###.",".#..",".#..",".#..",".#..","....","...."],"g":[".....",".....",".####","#...#","#...#","#...#",".####","....#",".###."],"h":["#....","#....","####.","#...#","#...#","#...#","#...#",".....","....."],"i":["#",".","#","#","#","#","#",".","."],"j":["..#","...","..#","..#","..#","..#","..#","..#","##."],"k":["#...","#...","#..#","#.#.","##..","#.#.","#..#","....","...."],"l":["#.","#.","#.","#.","#.","#.",".#","..",".."],"m":[".....",".....","##.#.","#.#.#","#.#.#","#.#.#","#.#.#",".....","....."],"n":[".....",".....","####.","#...#","#...#","#...#","#...#",".....","....."],"o":[".....",".....",".###.","#...#","#...#","#...#",".###.",".....","....."],"p":[".....",".....","####.","#...#","#...#","#...#","####.","#....","#...."],"q":[".....",".....",".####","#...#","#...#","#...#",".####","....#","....#"],"r":["....","....","#.##","##..","#...","#...","#...","....","...."],"s":["....","....",".###","#...",".##.","...#","###.","....","...."],"t":[".#.",".#.","###",".#.",".#.",".#.","..#","...","..."],"u":[".....",".....","#...#","#...#","#...#","#..##",".##.#",".....","....."],"v":[".....",".....","#...#","#...#","#...#",".#.#.","..#..",".....","....."],"w":[".....",".....","#...#","#...#","#.#.#","#.#.#",".#.#.",".....","....."],"x":[".....",".....","#...#",".#.#.","..#..",".#.#.","#...#",".....","....."],"y":[".....",".....","#...#","#...#","#...#","#...#",".####","....#",".###."],"z":[".....",".....","#####","...#.","..#..",".#...","#####",".....","....."],".":[".",".",".",".",".",".","#",".","."],",":["..","..","..","..","..","..",".#","#.",".."],":":[".",".",".","#",".",".","#",".","."],";":["..","..","..",".#","..","..",".#","#.",".."],"-":["...","...","...","###","...","...","...","...","..."],"…":[".....",".....",".....",".....",".....",".....","#.#.#",".....","....."],"·":[".",".",".","#",".",".",".",".","."],"'":["#","#",".",".",".",".",".",".","."],"\"":["#.#","#.#","...","...","...","...","...","...","..."],"+":["...","...",".#.","###",".#.","...","...","...","..."],"*":["...","...","#.#",".#.","#.#","...","...","...","..."],"<":["..#",".#.","#..",".#.","..#","...","...","...","..."],">":["#..",".#.","..#",".#.","#..","...","...","...","..."],"á":["...#.","..#..",".###.","....#",".####","#...#",".####",".....","....."],"é":["...#.","..#..",".###.","#...#","#####","#....",".###.",".....","....."],"í":[".#","#.","#.","#.","#.","#.","#.","..",".."],"ó":["...#.","..#..",".###.","#...#","#...#","#...#",".###.",".....","....."],"ú":["...#.","..#..","#...#","#...#","#...#","#..##",".##.#",".....","....."],"ñ":[".##.#","#..#.","####.","#...#","#...#","#...#","#...#",".....","....."],"ü":[".....",".#.#.","#...#","#...#","#...#","#..##",".##.#",".....","....."],"©":[".###.","#...#","#.###","#.#.#","#.###","#...#",".###.",".....","....."],"«":[".....",".....","..#.#",".#.#.","..#.#",".....",".....",".....","....."],"»":[".....",".....","#.#..",".#.#.","#.#..",".....",".....",".....","....."]};
const pxbG = ch => PXB[ch] || PXB[ch.normalize('NFD')[0]] || PXB[ch.toLowerCase()] || (ch === ' ' ? null : PXB['?']);
function vWidth(s){ let w = 0; for (const ch of s){ const g = pxbG(ch); w += (g ? g[0].length : 3) + 1; } return Math.max(0, w - 1); }
function vtxt(s, x, y, col='#fff', align='left', shadow=null){
  let cx = Math.round(x - (align === 'center' ? vWidth(s)/2 : align === 'right' ? vWidth(s) : 0)); y = Math.round(y); const x0 = cx;
  for (const pass of shadow ? [0, 1] : [1]){ cx = x0; ctx.fillStyle = pass ? col : shadow; const o = pass ? 0 : 1;
    for (const ch of s){ const g = pxbG(ch); if (!g){ cx += 4; continue; }
      if (!PXB[ch] && ch.normalize('NFD').length > 1 && /\u0301/.test(ch.normalize('NFD'))){ ctx.fillRect(cx + 3 + o, y - 2 + o, 1, 1); ctx.fillRect(cx + 2 + o, y - 1 + o, 1, 1); }   // tilde en mayúsculas
      if (ch === 'Ñ'){ ctx.fillRect(cx + 1 + o, y - 1 + o, 1, 1); ctx.fillRect(cx + 2 + o, y - 2 + o, 1, 1); ctx.fillRect(cx + 3 + o, y - 1 + o, 1, 1); ctx.fillRect(cx + 4 + o, y - 2 + o, 1, 1); }   // virgulilla de la Ñ
      for (let j=0;j<g.length;j++){ const row = g[j]; let i = 0; while (i < row.length){ if (row[i] === '#'){ let k = i; while (k < row.length && row[k] === '#') k++; ctx.fillRect(cx+i+o, y+j+o, k-i, 1); i = k; } else i++; } }
      cx += g[0].length + 1; } }
}
// parte un texto en líneas que caben en maxW (salto de línea automático)
function vwrap(s, maxW){ const out = ['']; String(s).split(' ').forEach(w => { const c = out[out.length-1], t = c ? c + ' ' + w : w; if (c && vWidth(t) > maxW) out.push(w); else out[out.length-1] = t; }); return out; }
// texto con salto de línea; devuelve cuántas líneas usó
function vtxtw(s, x, y, maxW, col='#fff', align='left', shadow=null, lh=11){ const ls = vwrap(s, maxW); ls.forEach((ln, i) => vtxt(ln, x, y + i*lh, col, align, shadow)); return ls.length; }
// Fuente pixel 4×5 en mayúsculas (nítida a cualquier escala): se usa en el mapa del reto del camión
const PXF = {
 A:['.##.','#..#','####','#..#','#..#'], B:['###.','#..#','###.','#..#','###.'], C:['.###','#...','#...','#...','.###'], D:['###.','#..#','#..#','#..#','###.'],
 E:['####','#...','###.','#...','####'], F:['####','#...','###.','#...','#...'], G:['.###','#...','#.##','#..#','.###'], H:['#..#','#..#','####','#..#','#..#'],
 I:['###','.#.','.#.','.#.','###'], J:['..##','...#','...#','#..#','.##.'], K:['#..#','#.#.','##..','#.#.','#..#'], L:['#...','#...','#...','#...','####'],
 M:['#...#','##.##','#.#.#','#...#','#...#'], N:['#..#','##.#','#.##','#..#','#..#'], O:['.##.','#..#','#..#','#..#','.##.'], P:['###.','#..#','###.','#...','#...'],
 Q:['.##.','#..#','#..#','#.#.','.#.#'], R:['###.','#..#','###.','#.#.','#..#'], S:['.###','#...','.##.','...#','###.'], T:['###','.#.','.#.','.#.','.#.'],
 U:['#..#','#..#','#..#','#..#','.##.'], V:['#..#','#..#','#..#','.##.','.##.'], W:['#...#','#...#','#.#.#','##.##','#...#'], X:['#..#','#..#','.##.','#..#','#..#'],
 Y:['#.#','#.#','.#.','.#.','.#.'], Z:['####','..#.','.#..','#...','####'],
 '0':['.##.','#.##','##.#','#..#','.##.'], '1':['.#.','##.','.#.','.#.','###'], '2':['###.','...#','.##.','#...','####'], '3':['###.','...#','.##.','...#','###.'],
 '4':['#..#','#..#','####','...#','...#'], '5':['####','#...','###.','...#','###.'], '6':['.##.','#...','###.','#..#','.##.'], '7':['####','...#','..#.','.#..','.#..'],
 '8':['.##.','#..#','.##.','#..#','.##.'], '9':['.##.','#..#','.###','...#','.##.'],
 '.':['.','.','.','.','#'], ',':['..','..','..','.#','#.'], ':':['.','#','.','#','.'], '!':['#','#','#','.','#'], '?':['###','..#','.#.','...','.#.'],
 '¡':['#','.','#','#','#'], '¿':['.#.','...','.#.','#..','###'], "'":['#','#','.','.','.'], '-':['...','...','###','...','...'], '/':['..#','..#','.#.','#..','#..'],
 '(':['.#','#.','#.','#.','.#'], ')':['#.','.#','.#','.#','#.'], '·':['.','.','#','.','.'], '«':['....','.#.#','#.#.','.#.#','....'], '»':['....','#.#.','.#.#','#.#.','....'],
 '+':['...','.#.','###','.#.','...'], '*':['#.#','.#.','#.#','...','...'], '<':['..#','.#.','#..','.#.','..#'], '>':['#..','.#.','..#','.#.','#..'], '%':['#..#','..#.','.#..','#...','#..#'], ' ':['..']
};
const PXF_MAP = { 'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','Ü':'U','Ñ':'N','’':"'",'…':'...','"':"'" };
function pxNorm(s){ return [...String(s).toUpperCase()].map(c => PXF_MAP[c] ?? c).join(''); }
function pxWidth(s){ let w = 0; for (const c of pxNorm(s)){ const g = PXF[c] || PXF['?']; w += g[0].length + 1; } return Math.max(0, w - 1); }
function ptxt(s, x, y, col='#fff', align='left', shadow='#000', g2=ctx){
  s = pxNorm(s); let cx = Math.round(x - (align === 'center' ? pxWidth(s)/2 : align === 'right' ? pxWidth(s) : 0)); y = Math.round(y);
  const x0 = cx;
  for (const pass of shadow ? [0, 1] : [1]){ cx = x0; g2.fillStyle = pass ? col : shadow; const o = pass ? 0 : 1;
    for (const c of s){ const g = PXF[c] || PXF['?'];
      for (let j=0;j<g.length;j++) for (let i=0;i<g[j].length;i++) if (g[j][i] === '#') g2.fillRect(cx+i+o, y+j+o, 1, 1);
      cx += g[0].length + 1; } }
}
function spr(map, x, y, pal, s=1){ for (let j=0;j<map.length;j++) for (let i=0;i<map[j].length;i++){ const c = pal[map[j][i]]; if (c) r(x+i*s, y+j*s, s, s, c); } }
function panel(y0=272){ r(8,y0,224,H-y0-8,C.panel); r(8,y0,224,2,C.edge); r(8,H-10,224,2,C.edge); r(8,y0,2,H-y0-8,C.edge); r(230,y0,2,H-y0-8,C.edge); }
function bar(x,y,w,h,v,col,bg='#2a2240'){ r(x,y,w,h,bg); r(x,y,w*Math.max(0,Math.min(1,v)),h,col); }

const SP = {
  SKULL:['.WWWWW.','WWWWWWW','WbWpWbW','WbbWbbW','WWWbWWW','.WcWcW.','.W.W.W.'],
  BEER:['.fffff..','faaaaaHH','aAaaaa.H','aaAaaa.H','aaaaaaHH','aaaaaa..','gggggg..'],
  CHILI:['....gg.','...g...','..rrr..','.rrRr..','.rrr...','rrr....','rr.....'],
  CAP:['...RRRRRR...','..RRRRRRRR..','.RRRRwwRRRR.','.RRRRRRRRRR.','RRRRRRRRRRRR','kkkkkkkkk...'],
  THERMO:['.ss.','tttt','tTtt','tTtt','tttt','tttt','tttt'],
  TACO:['...yyyy...','.yyGGRRyy.','yyGRRGGRyy','yMMMMMMMMy','.yyyyyyyy.'],
  BALL:['.ww.','wrww','wwrw','.ww.'],
  POLLO:['..bbbb..','.bBBBBb.','bBBbBBBb','bBBBBbBb','.bBBBBb.','..bbww..','....ww..','....wWw.'],
  MAIL:['wwwwwwwwww','wbwwwwwwbw','wwbwwwwbww','wwwbwwbwww','wwwwbbwwww','wwwwwwwwww'],
  URGENT:['rrrrrrrrrr','rwrrrrrrwr','rrwrrrrwrr','rrrwrrwrrr','rrrrwwrrrr','rrrrrrrrrr'],
  PHONES:['.rrrrrr.','r......r','r......r','rr....rr','rr....rr'],
  MICP:['.gggg.','gGgggg','gggggg','.gggg.','..kk..','..kk..','..kk..','..kk..'],
  GERM:['.gggg..','gGgggg.','gggggg.','.gggg..','..kk...','.ekk.e.','e.kk..e','..kk.e.'],
  CONE:['...oo...','...ww...','..oooo..','..wwww..','.oooooo.','oooooooo'],
  HAIR:['.yyy.','yyyyy','yy.yy','y...y'],
  HAIR_S:['..yyy..','.yyyyy.','yyyyyyy','yy...yy','yy...yy','y.....y','y.....y']   // vida de Cami, del mismo tamaño que la calavera
};
const PAL = {
  SKULL:{ W:'#f4efe6', b:'#1a0f1f', p:'#ff4fd8', c:'#36d6ff' }, SKULL_OFF:{ W:'#3a2f55', b:'#1a0f1f', p:'#3a2f55', c:'#3a2f55' },
  BEER:{ f:'#fffbe8', a:'#ffb52e', A:'#ffe08a', H:'#d8d2e8', g:'#8a7a9e' }, CHILI:{ g:'#3dff8a', r:'#ff2e4d', R:'#ff9aa8' },
  THERMO:{ s:'#d8d2e8', t:'#5a5f78', T:'#9aa0bb' }, TACO:{ y:'#f2c14e', G:'#3dff8a', R:'#ff2e4d', M:'#8a4b2a' },
  BALL:{ w:'#f4efe6', r:'#e0263f' },
  POLLO:{ b:'#8a4b1a', B:'#d98a2e', w:'#f4efe6', W:'#d8d2e8' }, MAIL:{ w:'#f4efe6', b:'#5a5f78' }, URGENT:{ r:'#ff2e4d', w:'#ffffff' },
  PHONES:{ r:'#d0102a' }, MICP:{ g:'#c9c4d6', G:'#ffffff', k:'#2a2533' },
  GERM:{ g:'#7a7f8f', G:'#c9c4d6', k:'#2a2533', e:'#3dff8a' }, CONE:{ o:'#ff7a1f', w:'#f4efe6' }
};
const capPal = c => ({ R:c, w:'#ffffff', k:'#00000088' });
const CAP_COLORS = ['#e0263f','#1b1b22','#2f6bff','#f1eef5','#2fbf5f','#7a3bd6','#ffd34d']; // roja, negra, azul, blanca, verde, morada, dorada
const NOCAP = '#00000000';
const POLLO_IMG = Object.assign(new Image(), { src:'pollo.png' });   // presa de pollo (dibujo de Sergio): 20×21 y versión pequeña 16×17 para el mapa
const ITEM = {
  beer:(x,y)=>spr(SP.BEER,x-8,y-7,PAL.BEER,2), chili:(x,y)=>spr(SP.CHILI,x-7,y-7,PAL.CHILI,2), skull:(x,y)=>spr(SP.SKULL,x-7,y-7,PAL.SKULL,2),
  cafe:(x,y)=>spr(SP.THERMO,x-4,y-7,PAL.THERMO,2), taco:(x,y)=>spr(SP.TACO,x-10,y-5,PAL.TACO,2),
  pollo:(x,y,small)=>{ if (POLLO_IMG.complete && POLLO_IMG.naturalWidth){ ctx.imageSmoothingEnabled = false; if (small) ctx.drawImage(POLLO_IMG, 20, 0, 16, 17, x-8, y-8, 16, 17); else ctx.drawImage(POLLO_IMG, 0, 0, 20, 21, x-10, y-10, 20, 21); } else spr(SP.POLLO,x-8,y-8,PAL.POLLO,2); },   // pollito: dibujo de Sergio
  mail:(x,y)=>spr(SP.MAIL,x-10,y-6,PAL.MAIL,2), urgent:(x,y)=>spr(SP.URGENT,x-10,y-6,PAL.URGENT,2),
  phones:(x,y)=>spr(SP.PHONES,x-8,y-5,PAL.PHONES,2),
  meet:(x,y)=>{ r(x-10,y-8,20,17,'#1a1a22'); r(x-9,y-7,18,15,'#f4efe6'); r(x-9,y-7,18,5,'#2f6bff'); r(x-6,y-10,2,4,'#1a1a22'); r(x+4,y-10,2,4,'#1a1a22'); for (let i=0;i<3;i++) for (let j=0;j<2;j++) r(x-7+i*5,y+j*4,3,2,i===1&&j===0?'#ff2e4d':'#9a9aa8'); }, chorro:(x,y)=>spr(SP.BEER,x-8,y-7,PAL.BEER,2),
  mic:(x,y)=>spr(SP.MICP,x-6,y-8,PAL.MICP,2), germ:(x,y)=>spr(SP.GERM,x-7,y-8,PAL.GERM,2)
};

/* ======================= ESCENARIOS ======================= */
const STAGE_Y = 236;
let VENUE = 'sotano', T = 0;
const BG = {};
['far','sotano','embudo','cowork','casa','teatro','arena','festival','hogar'].forEach(k => { const c = document.createElement('canvas'); c.width = k === 'far' ? W + 40 : W; c.height = k === 'far' ? 170 : 270; BG[k] = c; });
function painter(c){ const b = c.getContext('2d'); b.clearRect(0,0,c.width,c.height); const R = (x,y,w,h,col) => { b.fillStyle = col; b.fillRect(x|0,y|0,w,h); }; const TX = (s,x,y,col,size=8) => { b.font = size+'px "Press Start 2P", monospace'; b.textBaseline = 'top'; b.textAlign = 'center'; b.fillStyle = '#000'; b.fillText(s,x+1,y+1); b.fillStyle = col; b.fillText(s,x,y); }; return { b, R, TX }; }
function paintBG(){
  let seed = 11; const rnd = () => (seed = (seed*9301+49297)%233280)/233280;
  // capa lejana: noche bogotana
  { const { b, R } = painter(BG.far), gw = W + 40;
    for (let y=0;y<170;y++){ const k = y/170; b.fillStyle = `rgb(${12+k*22|0},${7+k*8|0},${28+k*40|0})`; b.fillRect(0,y,gw,1); }
    for (let i=0;i<80;i++){ const c = rnd(); R(rnd()*gw, rnd()*110, 1, 1, c>.85?'#ffffff':c>.6?'#c9b8ff':'#6f5fa8'); }
    R(34,26,10,10,'#ede7ff'); R(32,28,14,6,'#ede7ff'); R(37,29,3,3,'#cfc6f2');
    for (let x=0;x<gw;x++){ const h = 62 + Math.sin(x*.035)*18 + Math.sin(x*.11+1)*6; R(x,160-h,1,h,'#251651'); if (Math.sin(x*.035) > .6) R(x,160-h,1,2,'#4b3a8a'); }
    for (let x=0;x<gw;x++){ const h = 34 + Math.sin(x*.07+2)*10; R(x,160-h,1,h,'#2f1d63'); }
    for (let x=0;x<gw;x+=11){ const h = 12 + ((x*13)%23); R(x,160-h,10,h,'#160d30'); for (let wy=160-h+3; wy<158; wy+=4) for (let wx=x+2; wx<x+9; wx+=3) if (rnd()>.45) R(wx,wy,1,1, rnd()>.5?'#ffd34d99':'#36d6ff88'); }
    R(196,70,13,90,'#1a1140'); R(199,60,7,10,'#1a1140'); R(201,52,3,8,'#1a1140'); R(202,46,1,6,'#ff2e4d');
    for (let wy=74; wy<158; wy+=4){ R(198,wy,2,1,'#36d6ff'); R(205,wy,2,1,'#ffd34d'); } }
  const truss = R => { R(0,6,W,4,'#4a3f6b'); R(0,18,W,4,'#4a3f6b'); for (let x=0;x<W;x+=12) for (let k=0;k<8;k++){ R(x+k,10+k,1,1,'#4a3f6b'); R(x+11-k,10+k,1,1,'#4a3f6b'); } };
  const floor = (R, c1, c2) => { R(0,206,W,30,c1); for (let y=210;y<236;y+=6) R(0,y,W,1,c2); for (let x=9;x<W;x+=27) R(x,206,1,30,c2); R(0,206,W,1,'#ffffff22'); };
  // El Sótano
  { const { R, TX } = painter(BG.sotano);
    R(0,0,28,170,'#2a1520'); R(212,0,28,170,'#2a1520');
    for (let y=0;y<170;y+=6) for (let x=(y%12?0:6);x<28;x+=12){ R(x,y,11,5,'#3a1c2a'); R(212+x,y,11,5,'#3a1c2a'); }
    R(0,150,W,90,'#1c1028'); for (let y=152;y<236;y+=7) for (let x=(y%14?0:8);x<W;x+=16) R(x,y,15,6,'#24142f');
    R(4,40,20,26,'#4a2d6b'); R(6,42,16,10,'#9b6bff'); R(216,48,20,26,'#5a1a2a'); R(218,50,16,8,'#ff2e4d');
    truss(R);
    R(8,150,44,86,'#141018'); R(10,152,40,14,'#26202e'); R(10,168,40,32,'#1c1824'); R(10,202,40,32,'#1c1824'); for (let y=170;y<232;y+=3) R(12,y,36,1,'#2a2536');
    TX('SCR', 30, 155, '#b98bff');
    R(60,226,30,8,'#20202a'); ['#ff2e4d','#3dff8a','#36d6ff','#ffd34d','#ff4fd8'].forEach((c,i)=>R(62+i*5.5,227,3,3,c));
    R(190,196,46,40,'#141018'); R(192,198,42,6,'#2b2536'); for (let i=0;i<9;i++) R(194+i*4.5,206,2,10,'#3b3356');
    floor(R,'#2a1822','#1d1018');
    R(96,222,32,14,'#0f0c14'); R(98,224,28,8,'#1c1824'); R(150,224,24,12,'#0f0c14'); }
  // Casa de Checho (prólogo, de día)
  { const { R } = painter(BG.hogar);
    R(0,0,W,206,'#2b2140'); for (let y=0;y<206;y+=14) R(0,y,W,1,'#33284c');
    R(150,40,74,64,'#4a3a6b'); R(154,44,66,56,'#8fd3ff'); for (let i=0;i<9;i++){ const h = 10 + ((i*17)%22); R(154+i*7.4,100-h,7,h,'#5d6fa8'); } R(185,44,2,56,'#4a3a6b'); R(154,70,66,2,'#4a3a6b'); R(162,52,10,4,'#ffffff'); R(166,50,12,4,'#ffffff');
    R(20,60,8,52,'#c9c4d6'); R(16,56,16,8,'#efe9ff'); R(22,112,4,20,'#ffffff'); R(46,64,8,48,'#d0102a'); R(42,60,16,8,'#ff3b3b'); R(48,112,4,18,'#2a2240');
    R(90,130,64,40,'#5a1a2a'); R(86,124,72,12,'#7a2a3a'); R(86,124,8,46,'#7a2a3a'); R(150,124,8,46,'#7a2a3a'); R(96,170,6,8,'#1b1b22'); R(142,170,6,8,'#1b1b22');
    R(176,150,40,44,'#141018'); R(178,152,36,10,'#2b2536'); for (let i=0;i<7;i++) R(181+i*5,165,2,22,'#3b3356'); R(178,154,6,4,'#ffd34d');
    R(0,194,W,12,'#3a2d24'); floor(R,'#5a4030','#43301f'); }
  // Coliseo Mexa (lucha libre, Chapinero)
  { const { b, R, TX } = painter(BG.embudo);
    R(0,60,W,150,'#1a0f2e'); for (let y=64;y<150;y+=10) for (let x=(y%20?0:10);x<W;x+=20) R(x,y,18,8,'#22143a');
    for (let row=0; row<4; row++) for (let x=(row%2)*5; x<W; x+=10){ const yy = 100 + row*12; R(x, yy, 8, 10, ['#2a1846','#24143e','#1f1136','#1a0e2e'][row]); R(x+2, yy-4, 4, 4, ['#3a2560','#30204f','#281a44','#22163a'][row]); }
    const pp = ['#ff2e4d','#ffd34d','#3dff8a','#36d6ff','#ff4fd8','#ff7a1f'];
    [30, 46].forEach((yy, li) => { for (let x=0;x<W;x+=12){ const sag = Math.round(Math.sin((x/W)*Math.PI)*6); R(x, yy+sag, 12, 1, '#bbb'); R(x+2, yy+sag+1, 8, 9, pp[((x/12|0)+li)%6]); b.clearRect(x+4, yy+sag+4, 2, 2); b.clearRect(x+7, yy+sag+7, 1, 1); } });
    R(52,64,136,22,'#120a22'); R(52,64,136,2,'#ffd34d'); R(52,84,136,2,'#ffd34d');
    TX('LUCHA LIBRE', 120, 67, '#ffd34d'); TX('COLISEO MEXA · CHAPINERO', 120, 77, '#ff4fd8', 6);
    R(0,206,W,30,'#22305e'); R(0,206,W,2,'#5a6fb0'); for (let x=0;x<W;x+=24) R(x,208,1,28,'#1b264c'); R(0,230,W,6,'#7a1f3a');
    R(4,140,8,96,'#c0c0d0'); R(228,140,8,96,'#c0c0d0'); R(3,138,10,4,'#ff2e4d'); R(227,138,10,4,'#2f6bff');
    [150,170,190].forEach((yy,i) => R(12,yy,216,2,['#ff2e4d','#f1eef5','#2f6bff'][i])); }
  // Coworking nocturno (Dave)
  { const { R, TX } = painter(BG.cowork);
    R(0,0,W,40,'#14102a'); R(0,0,W,8,'#1d1838'); for (let x=10;x<W;x+=40){ R(x,8,20,3,'#e9f5ff'); }
    R(0,40,20,170,'#1b1630'); R(220,40,20,170,'#1b1630'); R(20,40,200,4,'#2b2548'); R(20,120,200,4,'#2b2548'); R(118,40,4,84,'#2b2548');
    R(30,128,180,80,'#1e1934');
    TX('COWORK 24H', 120, 18, '#36d6ff', 8);
    for (let i=0;i<3;i++){ const x = 30 + i*64; R(x,170,48,6,'#4a3f6b'); R(x+4,176,3,30,'#2b2548'); R(x+41,176,3,30,'#2b2548'); R(x+12,150,24,18,'#0c0a18'); R(x+14,152,20,13,i===1?'#36d6ff':'#3dff8a'); R(x+22,168,4,2,'#4a3f6b'); }
    R(196,150,16,24,'#2f6b3a'); R(198,144,12,8,'#3dff8a'); R(200,174,8,30,'#5a3a2a');
    R(8,150,12,40,'#141018'); R(9,152,10,8,'#3a2f55'); R(11,164,6,5,'#f4efe6'); R(17,165,2,3,'#f4efe6');
    floor(R,'#2a2f45','#1f2335'); }
  // Bar de comedia "La Carcajada" (Mao)
  { const { R, TX } = painter(BG.casa);
    R(0,0,W,236,'#1c0f18'); for (let y=30;y<206;y+=7) for (let x=(y%14?0:8);x<W;x+=16) R(x,y,15,6,'#2a1520');
    R(0,0,W,26,'#5a0a1f'); for (let x=0;x<W;x+=8) R(x,22,6,8,'#5a0a1f');
    R(70,34,100,26,'#120a12'); R(70,34,100,2,'#ff4fd8'); R(70,58,100,2,'#ff4fd8'); TX('LA CARCAJADA', 120, 38, '#ff4fd8', 8); TX('NOCHE DE STAND-UP', 120, 50, '#ffd34d', 5);
    R(10,70,40,52,'#0f0a14'); R(12,72,36,48,'#ffd34d'); TX('HA', 30, 82, '#5a0a1f', 10); TX('HA', 30, 100, '#5a0a1f', 10);
    R(190,70,40,52,'#0f0a14'); R(192,72,36,48,'#36d6ff'); TX('JA', 210, 82, '#120a22', 10); TX('JA', 210, 100, '#120a22', 10);
    R(118,150,4,56,'#8d8aa0'); R(112,204,16,3,'#8d8aa0'); R(116,144,8,8,'#c9c4d6');
    R(176,170,20,36,'#3a2418'); R(172,166,28,6,'#5a3a22'); for (let i=0;i<3;i++) R(178+i*6,158,3,8,['#3dff8a','#ffb52e','#ff2e4d'][i]);
    R(0,206,W,30,'#2a1818'); for (let y=210;y<236;y+=6) R(0,y,W,1,'#1d1010'); for (let x=9;x<W;x+=27) R(x,206,1,30,'#1d1010'); R(0,206,W,1,'#ffffff22'); }
  // Teatro (Cami)
  { const { R, TX } = painter(BG.teatro);
    R(0,0,W,236,'#1a0a14');
    for (let x=0;x<W;x+=6) R(x,0,4,206,x<36||x>200 ? '#7a0a1f' : '#2a0a14');
    for (let x=0;x<36;x+=6) R(x+4,0,2,206,'#5a0716'); for (let x=204;x<W;x+=6) R(x+4,0,2,206,'#5a0716');
    R(0,0,W,22,'#7a0a1f'); for (let x=0;x<W;x+=12) R(x,18,8,8,'#7a0a1f');
    R(36,22,168,4,'#d8a84a'); R(36,22,4,184,'#d8a84a'); R(200,22,4,184,'#d8a84a'); TX('TEATRO LIBERTAD', 120, 30, '#d8a84a', 6);
    R(112,40,16,10,'#d8a84a'); for (let i=0;i<5;i++) R(106+i*7,50,2,6,'#ffe9a8');
    for (let i=0;i<4;i++){ const x = 54 + i*36; R(x,170,14,2,'#c9c4d6'); R(x+6,172,2,34,'#8d8aa0'); R(x+2,164,10,6,'#f4efe6'); }
    floor(R,'#5a3a22','#3f2816'); }
  // Arena Capital / festival
  ['arena','festival'].forEach(k => { const { R, TX } = painter(BG[k]);
    if (k === 'arena'){ R(0,0,W,206,'#0b0718'); for (let i=0;i<500;i++) R(rnd()*W, 60 + rnd()*120, 1, 1, ['#ffd34d','#36d6ff','#ff4fd8','#ffffff'][i%4]); }
    else { for (let i=0;i<500;i++) R(rnd()*W, 120 + rnd()*70, 1, 1, ['#ffd34d','#36d6ff','#ff4fd8','#ffffff'][i%4]); }
    R(10,40,52,34,'#141022'); R(12,42,48,30,'#2a1f55'); R(178,40,52,34,'#141022'); R(180,42,48,30,'#2a1f55');
    R(70,30,100,40,'#141022'); R(72,32,96,36,k==='arena'?'#3a0a1f':'#0a2a3a');
    TX(k==='arena' ? 'ARENA' : 'FESTIVAL', 120, 38, '#ffd34d', 10); TX(k==='arena' ? 'CAPITAL' : 'ROCK DE LOS CERROS', 120, 54, '#ff4fd8', k==='arena'?8:5);
    R(0,4,W,6,'#5a5070'); R(0,20,W,6,'#5a5070'); for (let x=0;x<W;x+=14) for (let kk=0;kk<10;kk++){ R(x+kk,10+kk,1,1,'#5a5070'); }
    R(0,180,W,30,'#141018'); for (let x=4;x<W;x+=24){ R(x,184,18,22,'#1c1824'); R(x+2,186,14,18,'#2a2536'); }
    floor(R,'#1a1626','#100c1a'); });
}
paintBG();

const smoke = Array.from({length:22}, () => ({ x: Math.random()*W, y: 200 + Math.random()*36, s: 10+Math.random()*16, v: 4+Math.random()*8 }));
const sparks = [];
function burst(x, y, n=14, cols=[C.gold,C.neon,C.cyan,C.magenta]){ if (RM) n = Math.min(n,4); for (let i=0;i<n;i++){ const a = Math.random()*Math.PI*2, sp = 40+Math.random()*80; sparks.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-30, t:0, c:cols[i%cols.length] }); } }
// V2: fondos pintados. Regla general: todo fondo lleva un velo oscuro para que no opaque a los personajes.
const BG_VEIL = 'rgba(8,5,24,.38)';
const BG_IMG = { arena: Object.assign(new Image(), { src:'esc_arena.png' }), camerino: Object.assign(new Image(), { src:'esc_camerino.png' }), festival: Object.assign(new Image(), { src:'esc_festival.png' }), sotano: Object.assign(new Image(), { src:'esc_rock_express.png' }), hogar: Object.assign(new Image(), { src:'esc_casa_checho.png' }), embudo: Object.assign(new Image(), { src:'esc_coliseo_mexa.png' }), ring: Object.assign(new Image(), { src:'esc_ring_mexa.png' }), cowork: Object.assign(new Image(), { src:'esc_cowork_pano.png' }), casa: Object.assign(new Image(), { src:'esc_carcajada.png' }), teatro: Object.assign(new Image(), { src:'esc_teatro.png' }), rxfinal: Object.assign(new Image(), { src:'esc_rock_final.png' }) };   // rxfinal: Rock Express con la tarima vacía (solo el final: Mao sube con su batería)   // teatro = auditorio de la Wind Orchestra Region (nivel 5), panorámico 825 px: a la izquierda el backstage   // casa = bar La Carcajada (nivel 4)   // cowork panorámico (738 px de ancho): la vista normal muestra el letrero y las pantallas; la puerta SALIDA queda a la derecha
// desplazamiento vertical de cada fondo para que el piso de los personajes (STAGE_Y) caiga donde corresponde en la imagen
let COWORK_DOOR = false;   // tras Luz roja, el resto del nivel 3 transcurre junto a la puerta SALIDA
function teatroBeam(x, cam, wx, a){   // un haz de luz del techo del teatro (wx: x del foco en el fondo) que cae sobre x
  if (!(a > 0)) return; const ox = Math.round(wx - cam), top = 30;
  ctx.globalAlpha = .12 * a; ctx.fillStyle = '#ffd59a'; ctx.beginPath(); ctx.moveTo(ox - 5, top); ctx.lineTo(ox + 5, top); ctx.lineTo(x + 28, 226); ctx.lineTo(x - 28, 226); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = .55 * a; r(ox - 4, top - 2, 9, 3, '#ffe9c4'); ctx.globalAlpha = 1;
}
const TEATRO_CENTER = 520, TEATRO_CAM = 384, TEATRO_SPOT = 82;   // toma por defecto del teatro: el centro del escenario (Cami junto al director)   // centro del escenario del teatro (coordenada del fondo)
const BG_Y = { embudo: 43, ring: -6, cowork: -8, casa: 27, teatro: 4, rxfinal: 0, arena: 22, camerino: 0, festival: 56 }; const BG_X = { cowork: -30, casa: -292, teatro: 0, rxfinal: -120, arena: -120, camerino: -93, festival: -60 };   // La Carcajada al 38 %: la tarima queda a la altura de los pies // cowork: se ve el letrero, la mesa y las pantallas; // ring: la pelea se juega sobre la lona // Coliseo Mexa a ancho completo: los personajes pisan el piso del bar, frente al ring
const bgReady = v => { const im = BG_IMG[v]; return im && im.complete && im.naturalWidth; };
function drawStage(o={}){
  let v = o.venue || VENUE; if (!bgReady(v) && !BG[v]) v = 'embudo';  // fondos solo pintados (p. ej. ring) mientras cargan
  if (bgReady(v)){ drawStageImg(v, o); return; }
  if (v !== 'teatro' && v !== 'casa' && v !== 'arena' && v !== 'hogar') ctx.drawImage(BG.far, -20 + Math.sin(T*.15)*20, v === 'festival' ? 30 : 6);
  else r(0,0,W,STAGE_Y,'#0b0718');
  if (v === 'cowork') { ctx.save(); ctx.beginPath(); ctx.rect(20,44,200,76); ctx.clip(); ctx.drawImage(BG.far, -40 + Math.sin(T*.15)*10, -20); ctx.restore(); }
  ctx.drawImage(BG[v], 0, 0);
  if (v === 'sotano'){ ctx.globalAlpha = (Math.sin(T*9) > -.94) ? 1 : .35; txt('ROCK EXPRESS', 120, 32, C.neon, 'center', 11, '#5a0a1c'); ctx.globalAlpha = 1; txt('BAR · AUDICIONES', 120, 50, C.muted, 'center', 6, null); txt('ROCK', 225, 120, (T*2|0)%6 ? C.magenta : '#5a1a50', 'center', 6, null); }
  if (v === 'festival' && o.party){ for (let i=0;i<3;i++){ const ph = (T*.7 + i*.33) % 1, fx = 40 + i*80, fy = 120 - ph*90; if (ph > .6){ for (let k=0;k<10;k++){ const a = k/10*Math.PI*2, rr = (ph-.6)*80; r(fx+Math.cos(a)*rr, 30+Math.sin(a)*rr, 2, 2, [C.gold,C.magenta,C.cyan][i]); } } else r(fx, fy, 2, 4, '#fff'); } }
  const lights = { embudo:[[40,C.gold],[120,'#ffffff'],[200,C.magenta]], cowork:[], teatro:[[80,'#ffe9a8'],[160,'#ffe9a8']], casa:[[120,C.violet]], hogar:[[190,'#fff3c4']] }[v] || [[24,C.neon],[78,C.magenta],[132,C.cyan],[186,C.violet],[226,C.gold]];
  lights.forEach(([x,c],i) => {
    const sw = Math.sin(T*(.7+i*.23)+i*2)*(o.party?44:26);
    ctx.globalAlpha = o.dim ? .05 : (o.party ? .2 : .1); ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(x, 4); ctx.lineTo(x+sw-22,STAGE_Y); ctx.lineTo(x+sw+22,STAGE_Y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  });
  if (v !== 'cowork' && v !== 'teatro' && v !== 'hogar'){ smoke.forEach(p => { p.x += p.v/60; if (p.x > W+20) p.x = -20; ctx.globalAlpha = .07; r(p.x, p.y + Math.sin(T+p.s)*2, p.s*2, p.s*.6, '#c9b8ff'); }); ctx.globalAlpha = 1; }
  if (v === 'sotano' || v === 'arena' || v === 'festival') for (let x=0;x<W;x+=4) r(x, STAGE_Y, 2, 2, ((x/4|0) + Math.floor(T*8)) % 4 ? '#2f6bff' : '#bcd4ff');
  if (v === 'sotano'){
    const sx = 212, sy = 178;
    r(sx-5,sy,11,11,'#c98a5e'); r(sx-6,sy-3,13,4,'#2b2b44'); r(sx-8,sy-1,4,2,'#2b2b44'); r(sx-7,sy+11,15,8,'#3b3356');
    r(sx-7,sy+3,2,5,'#111'); r(sx+5,sy+3,2,5,'#111'); r(sx-6,sy-4,13,1,'#111');
    if (o.asleep){ r(sx-3,sy+5,7,1,'#3a2a20'); const z = (T*2)%3; txt('z', sx+10, sy-8-z*4, C.cyan, 'left', 8, null); txt('Z', sx+16, sy-18-z*3, C.cyan, 'left', 8, null); }
    else { r(sx-3,sy+5,2,2,'#1a1010'); r(sx+2,sy+5,2,2,'#1a1010'); }
  }
  if (v === 'embudo' || v === 'arena') for (let x=0;x<W;x+=6) if (((x/6|0) + Math.floor(T*5)) % 9 === 0) r(x, 100 + (x*7)%40, 2, 2, '#ffffffcc');
}

// Rock Express pintado: imagen al 25 % centrada, el borde de la tarima cae justo en STAGE_Y; sin textos encima (la imagen ya los trae)
const FW_IMG = ['azul','naranja','morado','verde','rosa'].map(k => Object.assign(new Image(), { src:'fx_fuego_' + k + '.png' })), FW = { list:[], next:0 };
function drawStageImg(v, o){
  const im = BG_IMG[v]; ctx.imageSmoothingEnabled = false;
  r(0, 0, W, H, '#07040f'); ctx.drawImage(im, Math.round((BG_X[v] ?? (W - im.naturalWidth)/2) - (o.cam ?? (v === 'cowork' && COWORK_DOOR ? 468 : v === 'teatro' ? TEATRO_CAM : 0))), BG_Y[v] || 0);   // o.cam: cámara que se desplaza por fondos panorámicos
  if (v === 'festival'){   // plano abierto: el cielo nocturno sigue por encima del fondo y se funde con él
    r(0, 0, W, 56, '#090720'); for (let i = 0; i < 18; i++) r((i*53) % 240, 32 + (i*17) % 22, 1, 1, i % 3 ? '#8a80c8' : '#ffffff');
    const g = ctx.createLinearGradient(0, 56, 0, 80); g.addColorStop(0, 'rgba(9,7,32,1)'); g.addColorStop(1, 'rgba(9,7,32,0)'); ctx.fillStyle = g; ctx.fillRect(0, 56, W, 24); }
  r(0, 0, W, STAGE_Y + 2, o.dim ? 'rgba(8,5,24,.55)' : BG_VEIL);
  if (v === 'hogar'){ ctx.globalAlpha = .06 + .02*Math.sin(T*2); ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.moveTo(108, 44); ctx.lineTo(132, 44); ctx.lineTo(170, STAGE_Y); ctx.lineTo(70, STAGE_Y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; if (typeof drawPerla === 'function'){ drawPerla(); drawPerlaDash(); } return; } // luz cálida de la lámpara
  if (v === 'festival'){   // festival: la misma luna del nivel de Checho en el cielo y, cuando la banda toca, reflectores que barren la tarima como en Rock Express
    const mx = 198, my = 36, g = ctx.createRadialGradient(mx, my, 4, mx, my, 30); g.addColorStop(0, 'rgba(120,170,255,.5)'); g.addColorStop(.45, 'rgba(60,100,230,.2)'); g.addColorStop(1, 'rgba(20,30,120,0)');
    ctx.fillStyle = g; ctx.fillRect(mx - 30, my - 30, 60, 60);
    if (typeof LUNA !== 'undefined' && LUNA.complete && LUNA.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(LUNA, mx - 11, my - 11); }
    if (o.party){
      // fuegos artificiales al azar en el cielo, por encima de la carpa (azul, naranja, morado, verde o rosa; 17 cuadros a 12 por segundo)
      if (T >= (FW.next || 0)){ FW.list.push({ k: Math.random()*5|0, x: 4 + Math.random()*176, y: -6 + Math.random()*22, t0: T }); FW.next = T + .65 + Math.random()*.9; }   // un poco más espaciados
      FW.list = FW.list.filter(f => (T - f.t0)*12 < 17);
      FW.list.forEach(f => { const im = FW_IMG[f.k]; if (im.complete && im.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, Math.floor((T - f.t0)*12)*56, 0, 56, 56, Math.round(f.x), Math.round(f.y), 56, 56); } });
      // los haces nacen justo debajo de los 5 reflectores naranjas de la barra del techo (y = 89) y no tocan el arco del techo
      [[31,C.magenta],[79,C.cyan],[120,C.orange],[160,C.cyan],[208,C.magenta]].forEach(([x,c],i) => {
        const sw = Math.sin(T*(.9+i*.27)+i*2)*46; ctx.globalAlpha = .2 + .06*Math.sin(T*4+i); ctx.fillStyle = c;
        ctx.beginPath(); ctx.moveTo(x-3, 89); ctx.lineTo(x+3, 89); ctx.lineTo(x+sw+24, 186); ctx.lineTo(x+sw-24, 186); ctx.closePath(); ctx.fill(); });
      for (let i=0;i<3;i++){ ctx.globalAlpha = .05 + .04*Math.sin(T*3+i*2); r(0, 92, W, 94, [C.magenta,C.cyan,C.gold][i]); }   // brillo de colores solo sobre la tarima, debajo del techo
      ctx.globalAlpha = 1; }
    return; }
  if (v === 'cowork' || v === 'rxfinal' || v === 'arena' || v === 'camerino') return;   // la Arena (fondo de Sergio) también trae sus reflectores   // rxfinal ya trae sus reflectores pintados   // el cowork es un lugar de trabajo: sin reflectores ni humo de escenario
  if (v === 'teatro'){   // teatro: sin reflectores del techo; solo una luz cálida de seguimiento (o.spot = x en pantalla)
    const spot = o.spot !== undefined ? o.spot : (o.cam == null ? TEATRO_SPOT : null);   // escenas sin cámara propia: la toma del centro, con la luz sobre Cami
    if (spot != null){   // los haces salen del techo del escenario y apuntan a Cami: el central siempre; el izquierdo y el derecho se encienden cuando llega junto al director
      const x = Math.round(spot), top = 30, beams = o.beams || (o.cam == null ? [1, 1, 1] : [1, 0, 0]);
      [[TEATRO_CENTER, beams[0]], [TEATRO_CENTER - 170, beams[1]], [TEATRO_CENTER + 170, o.lateRight ? 0 : beams[2]]].forEach(([wx, a]) => teatroBeam(x, o.cam || 0, wx, a));   // lateRight: el haz derecho se dibuja después del director (pasa por delante de él)
      const sum = beams.reduce((s, a) => s + Math.max(0, Math.min(1, a || 0)), 0);
      ctx.globalAlpha = (.14 + .06 * sum) * Math.min(1, sum); ctx.fillStyle = '#ffd59a'; ctx.beginPath(); ctx.ellipse(x, 226, 32, 6, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
    return; }
  // haces de luz que barren desde los reflectores del truss (posición de cada reflector en la imagen)
  const SPOTS = { casa:[[12,C.magenta],[52,C.magenta],[120,C.gold],[187,C.magenta],[227,C.magenta]] }[v] || [[27,C.magenta],[58,C.cyan],[120,C.orange],[177,C.cyan],[210,C.magenta]], SY = { casa:66 }[v] || 42;   // reflectores del techo de cada escenario
  SPOTS.forEach(([x,c],i) => {
    const sw = Math.sin(T*(.7+i*.23)+i*2)*(o.party?44:26);
    ctx.globalAlpha = o.dim ? .05 : (o.party ? .18 : .1); ctx.fillStyle = c;
    x -= (o.cam || 0);   // los reflectores se mueven con la cámara
    ctx.beginPath(); ctx.moveTo(x-3, SY); ctx.lineTo(x+3, SY); ctx.lineTo(x+sw+22, STAGE_Y); ctx.lineTo(x+sw-22, STAGE_Y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  });
  if (o.party) for (let i=0;i<3;i++){ ctx.globalAlpha = .08 + .06*Math.sin(T*3+i*2); r(0, 0, W, STAGE_Y, [C.magenta,C.cyan,C.gold][i]); } ctx.globalAlpha = 1;
  smoke.forEach(p => { p.x += p.v/60; if (p.x > W+20) p.x = -20; ctx.globalAlpha = .05; r(p.x, p.y + Math.sin(T+p.s)*2, p.s*2, p.s*.6, '#c9b8ff'); }); ctx.globalAlpha = 1;
  if (v === 'sotano' && o.asleep){ const z = (T*2)%3; txt('z', 222, 170-z*4, C.cyan, 'left', 8, null); txt('Z', 228, 160-z*3, C.cyan, 'left', 8, null); }
}

/* ======================= PÚBLICO ======================= */
const people = [];
for (let row=0; row<3; row++) for (let i=0; i<14; i++) people.push({ row, x: i*17 + (row%2?8:0) + (Math.random()*4|0), ph: Math.random()*6, phone: Math.random()<.18, hair: ['#120a22','#1a0e2c','#160b26'][i%3], tall: Math.random()*4|0, order: Math.random(), mx: Math.random()<.22 });
let fans = .35, mood = 0, moodT = 0;
// cada nivel puede fijar cuánta gente cabe (fansMin/fansMax); p. ej. en las audiciones del Nivel 1 hay poca gente todo el capítulo
const shownCount = () => people.filter(p => p.order < crowdLevel() + .02).length;
const crowdLevel = () => { const L = typeof curLevel !== 'undefined' && curLevel; if (!L || fans < 0) return fans; return Math.max(L.fansMin ?? -1, Math.min(L.fansMax ?? 1, fans)); };
function setMood(m, t=1.4){ mood = m; moodT = t; }
// Público visto de espaldas, a contraluz (capa propia del juego).
// Cada persona: cabeza, nuca, hombros según contextura, peinado (7 estilos), ropa (chaqueta, capota, camiseta);
// cabecea al ritmo, y cuando se prende levanta los brazos (cuernos, puño, palmas) o saca el celular.
const CROWD_ROW = [ { hr:5, sw:9, col:'#0d0716', lit:.75, len:34 }, { hr:4, sw:8, col:'#130b22', lit:.62, len:26 }, { hr:4, sw:7, col:'#1a112e', lit:.5, len:20 } ];
function crowdArm(x0, y0, dir, up, col, rim, hand){
  // brazo con codo: hombro → codo → mano
  const ex = x0 + dir*3, ey = y0 - up*.45, hx = x0 + dir*1, hy = y0 - up;
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  if (hand === 'horns'){ r(hx-2, hy-4, 1, 3, col); r(hx+1, hy-4, 1, 3, col); }
  else if (hand === 'open'){ r(hx-2, hy-3, 4, 2, col); }
  ctx.globalAlpha = .55; ctx.strokeStyle = rim; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ex + dir*1.5, ey); ctx.lineTo(hx + dir*1.5, hy); ctx.stroke(); ctx.globalAlpha = 1;
}
function drawCrowd(){
  if (VENUE === 'cowork') return;   // el cowork no tiene público
  r(0, STAGE_Y+2, W, H-STAGE_Y, '#07040f');
  if (VENUE === 'camerino') return;   // en el camerino tampoco
  const shown = people.filter(p => p.order < crowdLevel() + .02);
  [2,1,0].forEach(row => shown.filter(p => p.row === row).forEach(p => {
    const R = CROWD_ROW[row], seed = (p.x*13 + row*7) | 0;
    const style = seed % 7, cloth = (seed >> 2) % 3, build = (seed >> 1) % 3 - 1;
    const hype = mood > 0 || Math.sin(T*2+p.ph) > .8;
    const jumpy = mood > 0 ? Math.abs(Math.sin(T*9+p.ph))*5 : (hype ? Math.abs(Math.sin(T*6+p.ph))*2 : 0);
    const bob = mood >= 0 ? Math.round(Math.max(0, Math.sin(T*6.3 + p.ph))*1.4) : 0;          // cabeceo al ritmo
    const lean = Math.round(Math.sin(T*.8 + p.ph)*1);                                           // vaivén lento
    const cx = p.x + 5 + ((seed % 5) - 2) + lean;
    const y = Math.round(STAGE_Y + 42 - row*9 - p.tall - jumpy + (mood<0 ? 3 : 0));             // línea de hombros
    const sw = R.sw + build, hr = R.hr, hy = y - hr - 3 + bob, col = R.col;
    // el color del contorno sigue al haz de luz más cercano
    const rim = [C.magenta, C.cyan, C.orange, C.cyan, C.magenta][Math.max(0, Math.min(4, Math.round((cx + Math.sin(T*.9 + p.x)*20 - 27) / 46)))];
    const raised = hype && mood >= 0, gesture = (seed >> 3) % 3; // 0 cuernos · 1 puño · 2 palmas arriba (dos brazos)
    const up = 15 + (p.tall % 2)*3 + (gesture === 1 ? Math.abs(Math.sin(T*8 + p.ph))*5 : 0);
    if (raised){ crowdArm(cx + sw - 2, y + 2, 1, up, col, rim, gesture === 0 ? 'horns' : gesture === 2 ? 'open' : 'fist');
      if (gesture === 2 || mood > 0 && gesture !== 1) crowdArm(cx - sw + 2, y + 2, -1, up - 2, col, rim, gesture === 0 ? 'horns' : 'open'); }
    // torso con hombros redondeados
    r(cx - sw + 2, y - 1, sw*2 - 4, 1, col); r(cx - sw + 1, y, sw*2 - 2, 1, col); r(cx - sw, y + 1, sw*2, R.len, col); ctx.globalAlpha = .5; r(cx - sw, y + 1 + R.len, sw*2, 4, col); ctx.globalAlpha = 1;
    // ropa: 0 chaqueta (cuello levantado) · 1 capota · 2 camiseta
    ctx.globalAlpha = .5; if (!raised) r(cx + sw - 4, y + 4, 1, 22, '#000'); if (!(raised && (gesture === 2 || mood > 0 && gesture !== 1))) r(cx - sw + 3, y + 4, 1, 22, '#000'); ctx.globalAlpha = 1; // brazos caídos
    if (cloth === 0){ r(cx - 4, y - 2, 8, 3, col); ctx.globalAlpha = .25; r(cx, y + 3, 1, 30, '#000'); ctx.globalAlpha = 1; }
    else if (cloth === 1){ ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(cx, y + 2, 6, 4, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = .3; r(cx - 4, y + 1, 8, 1, rim); ctx.globalAlpha = 1; }
    // nuca y cabeza
    r(cx - 2, hy + hr - 2, 4, y - (hy + hr) + 3, col);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(cx, hy, hr, hr + .5, 0, 0, Math.PI*2); ctx.fill();
    r(cx - hr - 1, hy, 1, 2, col); r(cx + hr, hy, 1, 2, col); // orejas
    // peinados: 0 corto · 1 melena · 2 gorra al revés · 3 moño · 4 crespo · 5 cresta · 6 gorro de lana
    const hc = p.hair;
    if (style === 1){ r(cx - hr - 1, hy - hr + 1, hr*2 + 2, hr + 9, hc); r(cx - hr, hy - hr - 1, hr*2, 2, hc); }
    else if (style === 2){ r(cx - hr, hy - hr - 1, hr*2, 3, hc); r(cx - 2, hy - 1, 4, 2, hc); ctx.globalAlpha = .5; r(cx - 1, hy - 1, 2, 1, rim); ctx.globalAlpha = 1; }
    else if (style === 3){ ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(cx, hy - hr - 2, 2.5, 0, Math.PI*2); ctx.fill(); }
    else if (style === 4){ ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(cx, hy - 1, hr + 2, Math.PI, 0); ctx.fill(); r(cx - hr - 2, hy - 1, hr*2 + 4, 3, hc); }
    else if (style === 5){ r(cx - 1, hy - hr - 4, 2, 5, hc); ctx.globalAlpha = .7; r(cx - 1, hy - hr - 4, 2, 1, rim); ctx.globalAlpha = 1; }
    else if (style === 6){ r(cx - hr, hy - hr - 1, hr*2, hr + 1, hc); r(cx - hr - 1, hy - 1, hr*2 + 2, 2, hc); r(cx - 1, hy - hr - 3, 2, 2, hc); }
    // luz de tarima que recorta cabeza y hombros
    ctx.globalAlpha = R.lit; ctx.strokeStyle = rim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, hy, hr + .5, Math.PI*1.12, Math.PI*1.88); ctx.stroke();
    r(cx - sw + 1, y, 4, 1, rim); r(cx + sw - 5, y, 4, 1, rim);
    ctx.globalAlpha = R.lit*.6; r(cx - sw, y + 1, 1, 10, rim); r(cx + sw - 1, y + 1, 1, 10, rim);
    ctx.globalAlpha = R.lit*.35; r(cx - 1, hy + hr, 2, 1, '#e8b49a'); ctx.globalAlpha = 1; // un toque de piel en la nuca
    if (mood < 0 && row === 0){ r(cx - sw + 2, y + 6, sw*2 - 4, 3, '#2a1e40'); }
    if (raised && p.phone){ const px = cx + sw - 1, py = y + 2 - up - 6; r(px - 1, py, 3, 5, '#e9f5ff'); ctx.globalAlpha = .16; r(px - 6, py - 5, 13, 13, '#e9f5ff'); ctx.globalAlpha = 1; }
    // Coliseo Mexa: una que otra bandera mexicana ondeando sobre el público (sin sombreros)
    if ((VENUE === 'embudo' || VENUE === 'ring') && p.mx && p.order < .55 && row < 2){ const fx = cx + sw, fy = y - up - 14, wv = Math.sin(T*4 + p.ph) > 0 ? 1 : 0; r(fx, fy, 1, 15, '#ddd'); r(fx+1, fy+wv, 3, 6, '#0a8a3a'); r(fx+4, fy, 3, 6, '#f1eef5'); r(fx+5, fy+2, 1, 2, '#8a5a2a'); r(fx+7, fy+wv, 3, 6, '#d0102a'); }
  }));
  const fg = ctx.createLinearGradient(0, STAGE_Y+44, 0, H); fg.addColorStop(0, 'rgba(7,4,15,0)'); fg.addColorStop(1, 'rgba(7,4,15,1)'); ctx.fillStyle = fg; ctx.fillRect(0, STAGE_Y+44, W, H-STAGE_Y-44);
  if (mood < 0) txt('¡BUUU!', 60 + Math.sin(T*5)*4, STAGE_Y+4, C.muted, 'center', 8);
}

/* ======================= ESTADO ======================= */
let lives = 3, lostTotal = 0, stage = null, shake = 0, flash = 0, flashCol = '#fff', bubbles = [], frozen = 0, clock = '9:44', lifeStyle = 'skull';
const stats = { notes:0, combo:0, best:0, perfectPedal:true, caps:new Set(['#e0263f']), capsLost:false, balls:0, pit:99, extra:{}, trucks:0, eggs:0, caught:0, mails:0 };
function resetStats(){ stats.notes = 0; stats.combo = 0; stats.best = 0; stats.perfectPedal = true; stats.pit = 99; stats.extra = {}; stats.trucks = 0; stats.eggs = 0; stats.caught = 0; stats.mails = 0; lostTotal = 0; }
function addBubble(s, x, y, col=C.ink, size=8, life=1.3){ bubbles.push({ s, x, y, col, t:0, size, life }); }   // «\n» parte el letrero en varias líneas
const HAIRS = ['#ffd34d','#3dff8a','#2f6bff'];
function drawHUD(label){
  r(0,0,W,30,'#0b0718cc');
  // textos con la fuente nítida; el reto termina antes del botón de opciones (esquina superior derecha)
  if (lifeStyle === 'skull') for (let i=0;i<3;i++) spr(SP.SKULL, 6+i*13, 9, i<lives ? PAL.SKULL : PAL.SKULL_OFF, 1);
  else if (lifeStyle === 'hair'){ const cur = HAIRS[Math.max(0, Math.min(2, lives - 1))]; for (let i=0;i<3;i++) spr(SP.HAIR_S, 6+i*13, 9, { y: i<lives ? cur : '#3a2f55' }, 1); }   // vidas = color actual del pelo de Cami: azul, luego verde, luego amarillo
  vtxt(/m\.$/.test(clock) ? clock : clock + ' p.m.', 112, 10, C.neon, 'center', '#000');   // la hora puede traer su «a.m.»
  if (label) vtxt(label, 202, 10, C.gold, 'right', '#000');
}

/* ======================= DIÁLOGOS Y CAMEOS ======================= */
// precarga de imágenes: se descargan y decodifican al inicio para que retratos y fichas aparezcan al instante
const IMG_CACHE = {};
function preloadImgs(list){ list.forEach(src => { if (!src || IMG_CACHE[src]) return; const im = new Image(); im.src = src; if (im.decode) im.decode().catch(() => {}); IMG_CACHE[src] = im; }); }
// cambia la imagen de un <img> sin que se vea la anterior mientras carga la nueva
function setImgClean(el, src, onShow){
  if (el.getAttribute('src') === src && el.complete){ el.style.visibility = ''; onShow && onShow(); return; }
  el.style.visibility = 'hidden';
  el.onload = () => { el.style.visibility = ''; onShow && onShow(); }; el.onerror = () => { el.style.visibility = ''; onShow && onShow(); };
  el.src = src; if (el.complete && el.naturalWidth){ el.style.visibility = ''; onShow && onShow(); el.onload = null; }
}
const WHO = {
  checho:{ name:'CHECHO', img:'p_checho.jpg' }, maito:{ name:'MAITO', img:'p_maito.jpg' }, dave:{ name:'DAVE', img:'p_dave.jpg' },
  mao:{ name:'MAO', img:'p_mao.jpg' }, cami:{ name:'CAMI', img:'p_cami.jpg' }, camiTel:{ name:'CAMI (AL CELULAR)', img:'p_cami.jpg' },
  ricardo:{ name:'RICARDO · PROMOTOR', img:'p_ricardo.jpg' }, diego:{ name:'DIEGO RODRÍGUEZ · RED SPOT STUDIO', img:'p_diego.jpg' }, banda:{ name:'TODOS', img:'logo.jpg' }, productor:{ name:'NÚMERO DESCONOCIDO', img:'p_productor.jpg' },
  laca:{ name:'MR. DIRTY · AFRODITA', img:'p_laca.jpg' }, deadline:{ name:'MR. DEADLINE', img:'p_deadline.jpg' },
  ivan:{ name:'IVÁN DRUM-MACHINE', img:'p_ivan.jpg' }, enredo:{ name:'EL ENREDO', img:'p_enredo.jpg' },
  narr:{ name:'NARRADOR', img:'logo.jpg' }, todos:{ name:'LOS TRES', img:'logo.jpg' },
  presentador:{ name:'PRESENTADOR', img:'logo.jpg' }, director:{ name:'MAESTRO DIEGO RIVERA\nWIND ORCHESTRA REGION', img:'p_director.jpg' }, chkdav:{ name:'CHECHO Y DAVE', img:'p_checho.jpg' }, feedback:{ name:'MR. FEEDBACK', img:'p_feedback.jpg' }
};
preloadImgs(Object.values(WHO).map(w => w.img));
const dlg = $('dlg'), dlgImg = $('dlgImg'), dlgName = $('dlgName'), dlgText = $('dlgText');
let dq = [], di = 0, typing = null, full = '', dDone = null;
function talk(lines, done){ if (!lines || !lines.length){ done && done(); return; } dq = lines; di = 0; dDone = done; dlg.hidden = false; showLine(); }
// La hora del marcador siempre coincide con la que dicen los diálogos:
// el narrador («7:50 p.m.»), una línea que empieza con la hora («7:50. Llegué…», «(Mensaje) 10:59.») o «son las 8:20».
// Las horas límite («a las 10:00») no cuentan.
function lineClock(L){
  const t = L.text || '';
  let m = t.match(/^(?:\(Mensaje\)\s*)?(\d{1,2}:\d{2})\b/) || t.match(/son las (\d{1,2}:\d{2})/i);
  if (!m && L.who === 'narr') m = t.match(/(\d{1,2}:\d{2})\s*p\.\s?m\./);
  return m ? m[1] : null;
}
function showLine(){
  const L = dq[di], w = WHO[L.who];
  const lc = lineClock(L); if (lc) clock = lc;
  dlg.classList.toggle('narr', L.who === 'narr'); setImgClean(dlgImg, w.img); dlgName.textContent = w.name; full = L.text; dlgText.textContent = '';
  let k = 0; clearInterval(typing); if (L.fx) L.fx();
  typing = setInterval(() => { k++; dlgText.textContent = full.slice(0,k); if (k%3===0) SFX.blip(); if (k >= full.length){ clearInterval(typing); typing = null; } }, 22);
}
let dlgLock = false, dlgLockTap = null, fadeIn = 0;
function advance(){ if (dlgLock){ dlgLockTap && dlgLockTap(); return; } if (typing){ clearInterval(typing); typing = null; dlgText.textContent = full; return; } di++; if (di < dq.length) showLine(); else { dlg.hidden = true; const d = dDone; dDone = null; d && d(); } }
dlg.addEventListener('click', advance);
dlg.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); advance(); } });

const cameo = $('cameo');
let cameoT = null, barkI = 0;
function showCameo(b, freeze=1.6){
  cameo.querySelector('img').src = b[0]; cameo.querySelector('b').textContent = b[1]; cameo.querySelector('span').textContent = b[2];
  const card = cameo.querySelector('.card'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
  cameo.hidden = false; frozen = freeze; SFX.whoosh(); clearTimeout(cameoT); cameoT = setTimeout(() => cameo.hidden = true, freeze*1000);
}
let BARKS = [];
function loseLife(bark){
  lives--; lostTotal++; shake = RM ? 0 : .35; flash = .25; flashCol = C.neon; SFX.bad(); SFX.boo(); vibrate(120);
  stats.combo = 0; fans = Math.max(.15, fans - .06); setMood(-1, 1.8);
  const bk = bark || (BARKS.length ? BARKS[barkI++ % BARKS.length] : null); if (bk) showCameo(bk, 2.6);  // un segundo más, arriba, sin tapar a los personajes
  if (lives <= 0) setTimeout(gameOver, 2650);
}
function win(msg, x=120, y=130){ SFX.ok(); SFX.cheer(); fans = Math.min(1, fans + .1); setMood(1, 1.6); flash = .12; flashCol = C.ok; addBubble(msg, x, y, C.ok, 10, 2.8); burst(x, y+10, 18); }   // los letreros verdes de victoria duran más

/* ======================= MOTOR DE CARRILES ======================= */
// Nota tocada con éxito (común a varios retos)
function noteHit(){ stats.notes++; stats.combo++; stats.best = Math.max(stats.best, stats.combo); fans = Math.min(1, fans + .005);
  if (stats.combo % 10 === 0){ setMood(1,1); addBubble('¡COMBO x' + stats.combo + '!', 120, 120, C.gold, 10); burst(120,140,10); } }

/* ======================= PANTALLAS ======================= */
const screens = ['sTitle','sAviso','sChat','sMap','sIntro','sVS','sOver','sFicha','sEnd','sConfirm','sPase'];
function setBlackBg(on){ document.documentElement.classList.toggle('bgBlack', on); const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = '#000000'; }   // también la barra del navegador
function show(id){ screens.forEach(s => $(s).hidden = s !== id); setBlackBg(['sIntro','sAviso','sFicha','sMap','sOver','sEnd','sVS'].includes(id)); }   // la presentación de capítulo es negra hasta los bordes (zonas seguras incluidas)
function hideAll(){ screens.forEach(s => $(s).hidden = true); setBlackBg(false); }
function setStage(s){ if (stage && stage.stop) stage.stop(); stage = s; if (s.start) s.start(); }

// Sonido al salir y volver de otra app: al irse se pausa; al volver se reanuda. En iPhone el navegador solo deja
// reanudar con un toque, así que también se reanuda con el primer toque después de volver. Si el sistema cerró el audio, se rehace.
function wakeAudio(){
  if (!AC) return;
  if (AC.state === 'closed'){ const mode = music.mode; AC = null; music.on = false; initAudio(); if (mode) setMusic(mode); return; }
  if (AC.state !== 'running') AC.resume().then(() => { if (music.on && music.next < AC.currentTime - .5) music.next = AC.currentTime + .05; }).catch(() => {});
}
document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend().catch(() => {}); else wakeAudio(); });
addEventListener('pageshow', wakeAudio); addEventListener('focus', wakeAudio);
['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, () => { if (AC && AC.state !== 'running' && !document.hidden) wakeAudio(); }, { passive:true, capture:true }));
