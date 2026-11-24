'use strict';
/* ===================== NIVEL 1 · CHECHO · Rock Express ===================== */
const idle = (cast, more={}) => () => setStage(sceneIdle(Object.assign({ cast, label: curLevel ? 'NIVEL ' + curLevel.n : '' }, more)));

function sceneTune(){
  const names = [['MI','6ª CUERDA'],['RE','4ª CUERDA'],['SI','2ª CUERDA']];  // solo 3 cuerdas
  const S = { idx:0, ph:0, needle:0, wait:0, done:false, zone:.17, ok:[0,0,0] }; if (window.DEV_HOOK) window.__tune = S;  // solo para pruebas
  return { label:'RETO 1/3',
    update(dt){ if (S.wait > 0){ S.wait -= dt; if (S.wait <= 0 && S.idx >= 3 && !S.done){ S.done = true; stepDone(); } return; } S.ph += dt*(1.6+S.idx*.3)*(1+.35*Math.sin(T*1.3)); S.needle = Math.sin(S.ph); },
    draw(){
      drawStage(); CAST.checho(128,{ anim: mood<0 ? 'falla' : mood>0 ? 'celebra' : 'afina' }); drawCrowd(); drawHUD(this.label);
      if (S.idx < 3 && S.wait <= 0 && mood >= 0) txt('?', 140, 120 + Math.sin(T*5)*2, C.gold, 'center', 10);
      drawTunerPedal(S, names);
    },
    tap(){ S.press = .12; if (S.wait > 0 || S.idx >= 3) return;
      if (Math.abs(S.needle) <= S.zone){ S.ok[S.idx] = 1; pchord([0,10,19][S.idx], .6, null, false, .05); S.idx++; S.wait = .8; win('¡AFINADA!'); }
      else { loseLife(); addBubble(S.needle < 0 ? 'MUY BAJA' : 'MUY ALTA', 120, 130, C.neon, 10); } }
  };
}

// Afinador de pedal magenta (reto 1 de Checho): carcasa metalizada, pantalla negra con arco de LEDs, nota grande,
// flechas ♭/♯, 3 luces tipo joya para las cuerdas afinadas y pisador de goma que se hunde al tocar.
function drawTunerPedal(S, names){
  const X = 52, Y = 276, PW = 136, PH = 132, cx = 120, done = S.wait > 0, inZ = done || Math.abs(S.needle) <= S.zone;
  if (S.press > 0) S.press -= 1/60;
  const dn = S.press > 0 ? 2 : 0;
  const rr = (x,y,w,h,rad,col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x,y,w,h,rad); ctx.fill(); };
  const glow = (x,y,rad,col,a=.35) => { const g = ctx.createRadialGradient(x,y,0,x,y,rad); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x-rad,y-rad,rad*2,rad*2); ctx.globalAlpha = 1; };
  const screw = (x,y) => { ctx.fillStyle = '#8a8f9c'; ctx.beginPath(); ctx.arc(x,y,2.5,0,7); ctx.fill(); r(x-2,y,4,1,'#4a4e58'); };
  r(0, 266, W, H-266, '#0d0820'); r(0, 266, W, 2, '#3b2f66');
  ctx.globalAlpha = .5; rr(X+3, Y+5, PW, PH, 10, '#000'); ctx.globalAlpha = 1;
  rr(X-6, Y+30, 8, 14, 2, '#5a5e68'); rr(X+PW-2, Y+30, 8, 14, 2, '#5a5e68'); r(X-6, Y+36, 3, 2, '#222'); r(X+PW+3, Y+36, 3, 2, '#222');
  rr(X, Y, PW, PH, 10, '#5a0f3a'); rr(X+1, Y+1, PW-2, PH-3, 9, '#c2185b');
  const g = ctx.createLinearGradient(X, Y, X+PW, Y+PH); g.addColorStop(0,'#ff5c9a'); g.addColorStop(.5,'#d81b60'); g.addColorStop(1,'#8e0f43'); rr(X+3, Y+3, PW-6, PH-8, 8, g);
  ctx.globalAlpha = .35; r(X+10, Y+5, PW-20, 2, '#fff'); ctx.globalAlpha = 1;
  // pantalla
  rr(X+12, Y+12, PW-24, 66, 6, '#1a0410'); rr(X+14, Y+14, PW-28, 62, 5, done ? '#04140a' : '#07040c');
  ctx.globalAlpha = .06; r(X+16, Y+16, PW-32, 14, '#fff'); ctx.globalAlpha = 1;
  // arco de LEDs
  const cy = Y+78, N = 17;
  for (let i=0;i<N;i++){ const d = (i-(N-1)/2)/((N-1)/2), a = -Math.PI/2 + d*1.1, x = cx + Math.cos(a)*46, y = cy + Math.sin(a)*46;
    const col = Math.abs(d) <= S.zone ? C.ok : Math.abs(d) < .5 ? C.gold : C.neon, on = done ? Math.abs(d) <= S.zone : Math.abs(d - S.needle) < .07;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI/2); ctx.globalAlpha = on ? 1 : .16; rr(-2,-4,4,8,1.5,col); ctx.restore(); ctx.globalAlpha = 1;
    if (on) glow(x, y, 10, col, .6); }
  // nota y flechas
  const letter = done ? 'OK' : ['E','D','B'][Math.min(S.idx,2)], n = names[Math.min(S.idx,2)];
  if (inZ) glow(cx, Y+46, 22, C.ok, .3); else glow(cx, Y+46, 20, '#ff2e4d', .25);
  txt(letter, cx, Y+38, inZ ? C.ok : '#ff6b8a', 'center', 18, inZ ? '#0a3a1a' : '#3a0012');
  const flat = !done && S.needle < -S.zone, sharp = !done && S.needle > S.zone;
  ctx.fillStyle = flat ? C.neon : '#2a1020'; ctx.beginPath(); ctx.moveTo(cx-30,Y+46); ctx.lineTo(cx-24,Y+42); ctx.lineTo(cx-24,Y+50); ctx.fill();
  ctx.fillStyle = sharp ? C.neon : '#2a1020'; ctx.beginPath(); ctx.moveTo(cx+30,Y+46); ctx.lineTo(cx+24,Y+42); ctx.lineTo(cx+24,Y+50); ctx.fill();
  txt(done ? '¡AFINADA!' : 'CUERDA ' + (6 - 2*Math.min(S.idx,2)) + ' · ' + n[0], cx, Y+62, done ? C.ok : '#c9b8d4', 'center', 6, '#000');
  // logo
  txt('KABBARET', cx, Y+82, '#fff', 'center', 6, '#5a0f3a'); txt('CHROMATIC TUNER', cx, Y+92, '#ffffff', 'center', 5, '#5a0f3a');
  // luces de cuerdas (joyas)
  for (let i=0;i<3;i++){ const x = cx-14+i*14, y = Y+104, on = S.ok[i]; ctx.fillStyle = '#3a0820'; ctx.beginPath(); ctx.arc(x,y,4,0,7); ctx.fill(); ctx.fillStyle = on ? C.ok : '#1d3a26'; ctx.beginPath(); ctx.arc(x,y,3,0,7); ctx.fill(); if (on){ r(x-1,y-2,1,1,'#fff'); glow(x,y,8,C.ok,.6); } }
  // pisador de goma
  rr(X+16, Y+110+dn, PW-32, 16-dn, 5, '#1a1a20'); for (let i=0;i<9;i++) r(X+22+i*11, Y+113+dn, 6, 10-dn, '#2c2c34');
  r(cx-17, Y+113+dn, 34, 10-dn, '#1a1a20'); txt('TOCA', cx, Y+114+dn, '#ffffff', 'center', 7, '#000');
  screw(X+8, Y+8); screw(X+PW-8, Y+8); screw(X+8, Y+PH-12); screw(X+PW-8, Y+PH-12);
  txt('TOCA CUANDO EL LED ESTE EN VERDE', 120, 411, C.cyan, 'center', 6, '#000');
}

function sceneFloyd(){
  const S = { a:0, v:0, f:0, ft:0, prog:0, hold:{}, done:false, zone:.3, inv:0, voice:null }; if (window.DEV_HOOK) window.__floyd = S;  // solo para pruebas
  const input = () => { let i = 0; for (const k in S.hold) i += S.hold[k]; return Math.max(-1, Math.min(1, i)); };
  return { label:'RETO 2/3', start(){ S.voice = holdVoice('sawtooth', true, .05); },
    update(dt){
      if (S.done) return;
      S.ft -= dt; if (S.ft <= 0){ S.ft = .35 + Math.random()*.4; S.f = (Math.random()*2-1)*(1+S.prog*.6); }
      // el puente es inestable: sin tocar, la palanca se va sola hacia un lado (no se gana dejando el juego quieto)
      if (!S.lean || Math.random() < dt*.25) S.lean = Math.random() < .5 ? -1 : 1;
      S.v += (S.f*.89 + S.lean*.68 + S.a*1.36 - input()*2.6)*dt; S.v *= Math.pow(.25, dt); S.a += S.v*dt;   // empujes y deriva un 15 % más suaves que la versión original
      if (S.inv > 0) S.inv -= dt;
      if (input() !== 0) S.touch = T;
      if (Math.abs(S.a) < S.zone && T - (S.touch ?? -9) < 2.5){ S.prog += dt/8; /* solo avanza si el jugador está calibrando */ if (Math.random() < dt*1.2) fans = Math.min(1, fans + .01); }
      if (Math.abs(S.a) >= 1 && S.inv <= 0){ loseLife(); addBubble('¡PLIIING!', 120, 126, C.neon, 10); S.a = 0; S.v = 0; S.inv = 1; S.hold = {}; }
      S.a = Math.max(-1, Math.min(1, S.a)); S.voice && S.voice.set(196*Math.pow(2, S.a*.9), true);
      if (S.prog >= 1){ S.done = true; this.stop(); win('¡CALIBRADO!'); setTimeout(stepDone, 900); }
    },
    draw(){
      drawStage(); CAST.checho(128,{ anim: mood<0 ? 'falla' : mood>0 ? 'celebra' : 'calibra' }); drawCrowd(); drawHUD(this.label);
      drawFloydRose(S, input());
    },
    down(x,y,id){ if (y > 270) S.hold[id] = x < 120 ? -1 : 1; }, up(id){ delete S.hold[id]; },
    stop(){ S.voice && S.voice.stop(); S.voice = null; }
  };
}

// Reto 2 de Checho: puente Floyd Rose de perfil (como la referencia de Sergio). Gira sobre el filo de apoyo;
// la palanca sube corta, hace un codo y se va larga hacia la izquierda. Meta: dejar la placa paralela a la guía.
function drawFloydRose(S, inp){
  const ok = Math.abs(S.a) < S.zone, danger = Math.abs(S.a) > .75;
  const rr = (x,y,w,h,rad,col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x,y,w,h,rad); ctx.fill(); };
  const glow = (x,y,rad,col,a=.35) => { const g = ctx.createRadialGradient(x,y,0,x,y,rad); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x-rad,y-rad,rad*2,rad*2); ctx.globalAlpha = 1; };
  const chrome = (x,y,w,h) => { r(x,y,w,h,'#2a2a33'); r(x+1,y+1,w-2,h-2,'#a8a8b6'); r(x+1,y+1,w-2,Math.max(1,(h-2)*.35),'#eeeef6'); r(x+1,y+h-2,w-2,1,'#6a6a78'); };
  r(0, 266, W, H-266, '#0d0820'); r(0, 266, W, 2, '#3b2f66');
  rr(8, 272, 224, 98, 8, '#120a20');
  if (ok) glow(120, 300, 70, C.ok, .12); else if (danger) glow(120, 300, 70, C.neon, .14 + .08*Math.sin(T*20));
  // cuerpo de la guitarra en corte
  const BY = 340, PX = 128, PY = BY - 6;
  const g = ctx.createLinearGradient(0, BY, 0, 368); g.addColorStop(0, '#3a1030'); g.addColorStop(1, '#14060f'); ctx.fillStyle = g; ctx.fillRect(10, BY, 220, 28);
  r(10, BY, 220, 2, '#ff5c9a'); r(10, BY+2, 220, 1, '#8a1a4a');
  r(PX+22, BY, 40, 28, '#07030a'); r(PX+22, BY, 1, 28, '#2a0a1a'); r(PX+61, BY, 1, 28, '#2a0a1a');
  txt('FLOYD ROSE', 44, 354, '#ff9cc4', 'center', 5, '#000');
  // guía de paralelo
  const gcol = ok ? C.ok : danger ? C.neon : '#6a5a8a';
  ctx.globalAlpha = .8; for (let x = 14; x < 226; x += 6) r(x, BY-17, 3, 1, gcol); ctx.globalAlpha = 1;
  // puente
  ctx.save(); ctx.beginPath(); ctx.roundRect(8, 272, 224, 98, 8); ctx.clip(); ctx.translate(PX, PY); ctx.rotate(S.a*.2 + Math.sin(T*40)*.004*Math.abs(S.v));
   ctx.strokeStyle = '#d8d4e6'; ctx.lineWidth = 1; for (let i=0;i<2;i++){ ctx.beginPath(); ctx.moveTo(44, -13+i*2); ctx.lineTo(-240, -13+i*2); ctx.stroke(); }
   chrome(28, 3, 24, 24); r(30, 6, 20, 1, '#ffffff');
   chrome(-10, -3, 108, 6); r(-10, -3, 108, 1, '#ffffff');
   r(8, -15, 9, 12, '#0d0d12'); for (let y=-14;y<-4;y+=2) r(9, y, 7, 1, '#4a4a56'); r(8, -15, 9, 1, '#6a6a78');
   chrome(20, -11, 30, 8); chrome(38, -19, 12, 8); r(40, -18, 8, 1, '#fff'); r(43, -16, 2, 3, '#2a2a33');
   ctx.strokeStyle = '#e8e8f2'; ctx.lineWidth = 1; ctx.beginPath(); const sq = 1 + S.a*.25; for (let k=0;k<=8;k++){ const x = 52 + k*2*sq, y = -7 + (k%2 ? -3 : 3); k ? ctx.lineTo(x,y) : ctx.moveTo(x,y); } ctx.stroke();
   for (let i=0;i<2;i++){ const x = 72 + i*11; chrome(x, -15, 7, 12); r(x-2, -20, 11, 5, '#0d0d12'); for (let k=0;k<5;k++) r(x-1+k*2, -19, 1, 3, '#4a4a56'); }
   chrome(94, -8, 8, 8);
   chrome(-6, -9, 9, 8); r(-6, -9, 9, 1, '#fff');
   const arm = (w,col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-2,-6); ctx.lineTo(-2,-20); ctx.quadraticCurveTo(-2,-27,-9,-28); ctx.lineTo(-118,-46); ctx.stroke(); };
   arm(6, '#1e1e26'); arm(4, '#c9c9d6');
   ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3,-8); ctx.lineTo(-3,-20); ctx.quadraticCurveTo(-3,-26,-9,-27.5); ctx.lineTo(-117,-45.5); ctx.stroke();
   ctx.strokeStyle = '#7a7a88'; ctx.beginPath(); ctx.moveTo(-1,-8); ctx.lineTo(-1,-20); ctx.quadraticCurveTo(-1,-28,-9,-29); ctx.lineTo(-117,-47); ctx.stroke();
  ctx.restore();
  chrome(PX-6, BY-4, 12, 6); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.moveTo(PX-3,BY-3); ctx.lineTo(PX,BY-8); ctx.lineTo(PX+3,BY-3); ctx.fill();
  // estado
  if (ok) txt('¡PARALELO!', 186, 280, C.ok, 'center', 6, '#000');
  else txt(S.a > 0 ? 'ÑIIIIU ▲' : 'UUUUÑ ▼', 186 + Math.sin(T*20)*(danger ? 2 : 0), 280, danger ? C.neon : C.gold, 'center', 6, '#000');
  // progreso
  txt('CALIBRANDO ' + Math.floor(S.prog*100) + '%', 120, 374, C.cyan, 'center', 5, '#000');
  for (let i=0;i<20;i++){ const on = i < S.prog*20; r(22+i*10, 382, 8, 5, on ? C.cyan : '#1a2a3a'); if (on){ ctx.globalAlpha = .25; r(21+i*10, 381, 10, 7, C.cyan); ctx.globalAlpha = 1; } }
  // botones
  const btn = (x, label, col, on) => { const y = 394 + (on ? 2 : 0); r(x, 396, 100, 22, '#000'); rr(x, y, 100, 22, 4, on ? '#ffffff' : col); rr(x+1, y+1, 98, 20, 3, col); r(x+3, y+2, 94, 2, '#ffffff55'); if (on) glow(x+50, y+11, 40, col, .4); txt(label, x+50, y+7, '#fff', 'center', 6, '#000'); };
  btn(16, '◀ AFLOJA', '#7a3bd6', inp < 0); btn(124, 'TENSA ▶', '#d81b60', inp > 0);
}

// JEFE 1: duelo de guitarras contra Mr. Dirty (Afrodita), estilo Guitar Hero: 4 botones, notas largas y acordes, 3 fases
function sceneDuel(){
  const LC = [C.ok, C.neon, C.gold, C.cyan];                         // verde, rojo, amarillo, azul (colores Guitar Hero)
  const TOP = 96, HIT = 352, BW = 34;
  const PH = [ { D:1.9, gap:.55, dmg:.55, name:'FASE 1 · NOTAS SUELTAS' }, { D:1.65, gap:.45, dmg:.45, name:'FASE 2 · NOTAS LARGAS' }, { D:1.4, gap:.42, dmg:.38, name:'FASE 3 · ACORDES' } ];
  const S = { hp:100, phase:0, notes:[], spawn:1.2, item:7, meter:.6, press:[0,0,0,0], holdId:{}, spicy:0, done:false, moon:false, moonT:0, cx:44,
              hitFlash:0, rate:'', rateT:0, rateC:C.ok, attack:8, fog:0, shred:[], last:-1, fx:[] };
  if (window.DEV_HOOK) window.__duel = S;  // solo para pruebas automáticas
  const yOf = k => k <= 1 ? TOP + (HIT-TOP)*Math.pow(Math.max(0,k), 1.25) : HIT + (k-1)*(HIT-TOP)*1.25;
  // misma geometría que la pista dibujada: ancho 70 arriba (TOP) y 150 en la base (HIT+28)
  const BOT = HIT + 28, wAt = y => 70 + 80*(Math.min(y, BOT) - TOP)/(BOT - TOP);
  const lx = (lane, y) => { const w = wAt(y); return 120 - w/2 + w*(lane+.5)/4; };
  const BY = HIT + 13, bx = i => lx(i, BY);   // centro de cada botón, alineado con su carril
  const laneOf = x => { const w = wAt(BY); return Math.max(0, Math.min(3, Math.floor((x - (120 - w/2))/(w/4)))); };
  const mult = () => Math.min(4, 1 + Math.floor(stats.combo/10));
  const pickLane = (not=[]) => { let l; do { l = Math.random()*4|0; } while ((l === S.last && Math.random() < .7) || not.includes(l)); return l; };
  const add = (lane, extra={}) => { const n = Object.assign({ lane, k:0, kind:'note', len:0 }, extra); S.notes.push(n); S.last = lane; return n; };
  const rate = (t, c) => { S.rate = t; S.rateT = .6; S.rateC = c; };
  function damage(v, flat){ S.hp -= flat ? v : v * mult() * (S.spicy > 0 ? 1.5 : 1); S.hitFlash = .12; }
  function hitNote(n, dk){
    const D = PH[S.phase].D;
    if (n.kind === 'note'){
      soloNote(); noteHit(); damage(PH[S.phase].dmg); S.meter = Math.min(1, S.meter + .035);
      S.fx.push({ lane:n.lane, t:0 }); rate(Math.abs(dk)*D < .06 ? '¡PERFECTO!' : '¡BIEN!', Math.abs(dk)*D < .06 ? C.ok : C.cyan);
      if (n.len > 0) n.held = true; else n.dead = true; n.hit = true;
    } else {
      n.dead = true; S.fx.push({ lane:n.lane, t:0 });
      if (n.kind === 'beer'){ SFX.beer(); damage(5, true); addBubble('¡SALUD!', 120, 150, C.gold); }
      else if (n.kind === 'chili'){ SFX.chili(); S.spicy = 4.5; addBubble('¡MODO PICANTE!', 120, 150, C.neon, 10); }
      else { SFX.life(); lives = Math.min(3, lives+1); addBubble('+1 VIDA', 120, 150, C.ok, 10); }
    }
  }
  function miss(){ stats.combo = 0; S.meter -= .09; rate('¡FALLASTE!', C.muted);
    if (S.meter <= 0){ S.meter = .5; loseLife(); } }
  return { label:'JEFE',
    update(dt){
      if (S.done) return;
      S.press = S.press.map(v => Math.max(0, v - dt)); S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < .3);
      if (S.spicy > 0) S.spicy -= dt; if (S.hitFlash > 0) S.hitFlash -= dt; if (S.rateT > 0) S.rateT -= dt; if (S.fog > 0) S.fog -= dt;
      const want = S.hp > 66 ? 0 : S.hp > 33 ? 1 : 2;
      if (want !== S.phase){ S.phase = want; addBubble(want === 1 ? 'FASE 2' : 'FASE 3', 120, 90, C.gold, 12); SFX.riffStab(); S.attack = 5;
        if (want === 2 && !S.moon){ S.moon = true; S.moonT = 2.6; S.notes = []; S.shred = []; showCameo(['p_cami.jpg','CAMI','¡Checho, Moonwalk!'], 1.4); } }
      if (S.moonT > 0){ S.moonT -= dt; if (S.moonT <= 0){ S.cx = 20; S.spawn = .8; } return; }
      if (S.cx < 44) S.cx = Math.min(44, S.cx + 26*dt);   // tras el moonwalk vuelve caminando a su puesto
      const p = PH[S.phase];
      // ataques de Mr. Dirty: fase 2 «Shred de spandex» (ráfaga), fase 3 «Nube de laca» (tapa la parte alta de la pista)
      S.attack -= dt;
      if (S.attack <= 0 && S.phase >= 1){
        if (S.phase === 1){ const up = Math.random() < .5; for (let i=0;i<6;i++) S.shred.push({ t:i*.17, lane: up ? i%4 : 3 - i%4 }); addBubble('¡SHRED DE SPANDEX!', 150, 110, C.magenta, 8); S.spawn = 1.3; }
        else { S.fog = 3; addBubble('¡NUBE DE LACA!', 120, 80, C.gold, 9); SFX.whoosh(); }
        S.attack = 9 + Math.random()*3;
      }
      S.shred.forEach(r => { r.t -= dt; if (r.t <= 0){ add(r.lane); r.gone = true; } }); S.shred = S.shred.filter(r => !r.gone);
      // partitura
      S.spawn -= dt;
      if (S.spawn <= 0 && !S.shred.length){
        const roll = Math.random();
        if (S.phase === 2 && roll < .3){ const a = pickLane(), b2 = pickLane([a]); add(a, { chord:true }); add(b2, { chord:true }); S.spawn = p.gap + .12; }
        else if (S.phase >= 1 && roll < .55 && roll >= (S.phase === 2 ? .3 : .3)){ const len = .3 + Math.random()*.3; add(pickLane(), { len }); S.spawn = p.gap + len*p.D*.8; }
        else { add(pickLane()); S.spawn = p.gap; }
      }
      S.item -= dt; if (S.item <= 0){ let kd = Math.random() < .45 ? 'beer' : (Math.random() < .6 ? 'chili' : 'skull'); if (kd === 'skull' && lives >= 3) kd = 'beer'; add(pickLane(), { kind:kd }); S.item = 9 + Math.random()*4; }
      const w = .13 / p.D;
      S.notes.forEach(n => {
        n.k += dt / p.D;
        if (S.spicy > 0 && !n.hit && n.kind === 'note' && n.k >= 1){ hitNote(n, 0); if (n.len > 0) n.auto = true; }
        if (n.held){
          if (n.holding === undefined && !n.auto){ n.held = false; n.dead = true; }          // soltó el botón: la nota larga termina ahí
          else { S.press[n.lane] = .08; n.tick = (n.tick || 0) + dt; if (n.tick > .1){ n.tick = 0; damage(.07); stats.combo >= 0 && fans < 1 && (fans += .001); }
            if (n.k - n.len >= 1){ n.dead = true; S.fx.push({ lane:n.lane, t:0 }); } }
        } else if (!n.hit && n.k > 1 + w){ n.dead = true; if (n.kind === 'note') miss(); }
      });
      S.notes = S.notes.filter(n => !n.dead);
      if (S.hp <= 0){ S.done = true; S.notes = []; win('¡GANASTE EL DUELO!'); setTimeout(stepDone, 2600); }
    },
    draw(){
      drawStage({ dim:true, party:S.phase === 2 });
      CAST.laca(196, { strum:true, flash: S.hitFlash > 0, sad: S.done });
      const back = S.moonT <= 0 && S.cx < 44;
      CAST.checho(S.moonT > 0 ? 44 - (1 - S.moonT/2.6)*24 : S.cx, back ? { walk:true } : { strum:true, fast:true, bang:true, moon: S.moonT > 0, jump: S.done });
      drawCrowd();
      if (S.moonT > 0){ txt('¡MOONWALK!', 120, 100, C.gold, 'center', 14, '#5a3a00'); drawHUD('JEFE'); return; }
      // pista en perspectiva
      ctx.globalAlpha = .82; ctx.fillStyle = '#0b0718'; ctx.beginPath(); ctx.moveTo(85,TOP); ctx.lineTo(155,TOP); ctx.lineTo(195,HIT+28); ctx.lineTo(45,HIT+28); ctx.fill(); ctx.globalAlpha = 1;
      for (let i=0;i<=4;i++){ ctx.strokeStyle = i%4 ? '#3b2f66' : '#9b6bff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(85+70*i/4,TOP); ctx.lineTo(45+150*i/4,HIT+28); ctx.stroke(); }
      const off = (T*1.6) % 1;
      for (let j=0;j<9;j++){ const y = yOf((j + off)/9), ww = wAt(y); r(120-ww/2, y, ww, 1, '#3b2f66'); }
      for (let i=0;i<4;i++) if (S.press[i] > 0){ ctx.globalAlpha = .18; ctx.fillStyle = LC[i]; ctx.beginPath(); ctx.moveTo(85+70*i/4,TOP); ctx.lineTo(85+70*(i+1)/4,TOP); ctx.lineTo(45+150*(i+1)/4,HIT+28); ctx.lineTo(45+150*i/4,HIT+28); ctx.fill(); ctx.globalAlpha = 1; }
      // notas (las más lejanas primero)
      S.notes.slice().sort((a,b) => a.k - b.k).forEach(n => {
        if (n.len > 0){ const k0 = Math.min(n.k, 1), k1 = Math.max(0, n.k - n.len); if (k1 < k0) for (let y = yOf(k1); y < yOf(k0); y += 2){ const sc = .45 + .55*(y-TOP)/(HIT-TOP); r(lx(n.lane,y) - 3*sc, y, 6*sc, 2, n.held ? '#ffffff' : LC[n.lane]); } }
        if (n.held) return;
        const y = yOf(n.k), sc = .45 + .55*Math.min(1,(y-TOP)/(HIT-TOP)), x = lx(n.lane, y);
        if (n.kind === 'note'){ const ww = 28*sc, hh = 9*sc; r(x-ww/2, y-hh/2, ww, hh, LC[n.lane]); r(x-ww/2+2, y-hh/2, ww*.45, hh*.35, '#ffffffaa'); r(x-ww/2, y+hh/2-1, ww, 1, '#0008'); }
        else if (ITEM[n.kind]) ITEM[n.kind](x, y);
      });
      // nube de laca: tapa la parte alta de la pista
      if (S.fog > 0){ ctx.globalAlpha = Math.min(1, S.fog) * .92; for (let i=0;i<22;i++){ const sz = 8 + (i*7 % 9), x = 66 + ((i*47 + T*(6 + i%3*4)) % 108), y = TOP - 4 + ((i*29 + i*i*3) % 138) + Math.sin(T*1.5 + i)*3; r(x-sz, y-sz*.5, sz*2, sz, i%2 ? '#e9e0ff' : '#d9cff5'); r(x-sz*.6, y-sz*.8, sz*1.2, sz*1.6, '#efe9ff'); } ctx.globalAlpha = 1; }
      // botones
      const BWl = Math.floor(wAt(BY)/4) - 4;
      for (let i=0;i<4;i++){ const x = bx(i), on = S.press[i] > 0, BW = BWl;
        r(x-BW/2-1, HIT+2, BW+2, 22, '#000'); r(x-BW/2, HIT+3, BW, 20, on ? '#ffffff' : LC[i]); r(x-BW/2+2, HIT+5, BW-4, 16, LC[i]); r(x-BW/2+2, HIT+5, BW-4, 3, '#ffffff66'); r(x-BW/2+2, HIT+18, BW-4, 3, '#0005');
        if (on){ ctx.globalAlpha = .5; r(x-BW/2-4, HIT-6, BW+8, 4, LC[i]); ctx.globalAlpha = 1; } }
      S.fx.forEach(f => { const k = f.t/.3, x = bx(f.lane); ctx.globalAlpha = 1-k; r(x-20-k*10, HIT-3, 40+k*20, 6, LC[f.lane]); ctx.globalAlpha = 1; });
      if (S.spicy > 0) for (let x=0;x<W;x+=6){ const h = 8 + Math.abs(Math.sin(T*12+x))*10; r(x, H-h, 5, h, x%12 ? C.orange : C.neon); }
      txt(S.spicy > 0 ? '¡MODO PICANTE! TOCA SOLO' : 'TOCA LOS 4 BOTONES · MANTÉN EN LAS LARGAS', 120, 398, S.spicy > 0 ? C.orange : C.muted, 'center', 5, null);
      if (S.rateT > 0) txt(S.rate, 120, 316, S.rateC, 'center', 7);
      // medidor de rock y multiplicador
      r(8,110,10,120,'#160f2b'); r(9,111,8,40,'#3dff8a'); r(9,151,8,40,'#ffd34d'); r(9,191,8,38,'#ff2e4d'); r(5, 228 - S.meter*116, 16, 3, '#fff'); txt('ROCK', 13, 234, C.muted, 'center', 4, null);
      if (mult() > 1) txt('x' + mult(), 226, 112, C.gold, 'right', 12, '#5a3a00'); if (stats.combo >= 5) txt('COMBO ' + stats.combo, 226, 128, C.gold, 'right', 5, null);
      drawHUD('JEFE'); r(0,30,W,24,'#0b0718cc');
      txt('MR. DIRTY', 16, 34, C.neon, 'left', 6); bar(84, 33, 140, 8, S.hp/100, C.neon); txt(PH[S.phase].name, 120, 44, C.muted, 'center', 5, null);
    },
    down(x, y, id){ if (S.done || S.moonT > 0 || y < 200) return;
      const lane = laneOf(x), p = PH[S.phase], w = .13 / p.D; S.press[lane] = .12;
      let best = null, bd = 99; S.notes.forEach(n => { if (n.lane === lane && !n.hit){ const d = Math.abs(n.k - 1); if (d < bd){ bd = d; best = n; } } });
      if (best && bd <= w * (best.kind === 'note' ? 1 : 1.3)){ hitNote(best, best.k - 1); if (best.held) best.holding = id; S.holdId[id] = best; }
      else { stats.combo = 0; S.meter = Math.max(.02, S.meter - .02); pchord(0,.06,null,true,.02); }
    },
    up(id){ const n = S.holdId[id]; if (n){ if (n.held && !n.auto) n.holding = undefined; delete S.holdId[id]; } }
  };
}

const L1 = {
  key:'checho', n:1, venue:'sotano', fans:.12, fansMin:.12, fansMax:.17, ficha:true, // audiciones: poca gente (≈6) y como mucho 1 o 2 más
  barks:[['p_maito.jpg','MAITO','¡Noooooo, Mónicaaaa!'],['p_mao.jpg','MAO','Eso no es así madre'],['p_cami.jpg','CAMI','¡Still Loving You! jajaja'],['p_dave.jpg','DAVE','¿Vamos por pollito?']],
  intro:[
    { who:'narr', text:'7:50 p.m. Checho corre por las calles de Bogotá con la esperanza de llegar temprano a Rock Express.', fx(){ setStage(sceneStreet({ label:'NIVEL 1' })); } },
    { who:'checho', text:'7:50 p.m. Llegué primero. Esto tiene que salir perfecto.', fx: idle([['checho',72],['ricardo',184]]) },
    { who:'ricardo', text:'Llegué antes. Ya escuché a dos bandas. ¿Y los otros cuatro?' },
    { who:'checho', text:'Vienen en camino, ya casi llegan.', fx: idle([['checho',72],['ricardo',184,{ anim:'preocupado' }]]) },
    { who:'checho', text:'Probando sonido… Heeeeeey… heeeeey… ¿Me escuchan?', fx(){ setStage(sceneChechoToCenter()); setMood(1,1.5); addBubble('JAJAJA', 50, 200, C.gold); addBubble('JAJA', 160, 200, C.gold); } }
  ],
  idle:[['checho',128]],
  steps:[
    { id:'tune', clock:'7:52', music:'calm', scene:sceneTune, hint:'Tip: espera a que la aguja vaya lento antes de tocar.',
      before:[{ who:'narr', text:'RETO 1 · Tres cuerdas, cero paciencia. Después de la carrera por la ciudad, la guitarra llegó desafinada. Toca cuando la aguja pase por la zona verde. Son 3 cuerdas.', fx: idle([['checho',128]]) }] },
    { id:'floyd', clock:'7:58', music:'rock', scene:sceneFloyd, hint:'Tip: toques cortos funcionan mejor que mantener presionado mucho tiempo.',
      before:[
        { who:'checho', text:'Afinada… Pero al tensar, el puente quedó torcido. Así no puedo tocar ni chimba.' },
        { who:'ricardo', text:'(Mensaje) Estoy en la barra mirando. Tic tac, Kabbaret.' },
        { who:'narr', text:'RETO 2 · Calibra el Floyd Rose. El puente se inclina solo: mantén presionado AFLOJA o TENSA para dejarlo paralelo a la línea punteada hasta llenar la barra.' } ] },
    { id:'duel', clock:'8:05', music:'metal', scene:sceneDuel, hint:'Tip: no toques de más, cada toque al aire baja tu medidor. El ají toca por ti.',
      vs:{ boss:'laca', flip:true, desc:'Duelo de guitarras: toca las notas en el momento justo y gánale el solo a Mr. Dirty.', name:'MR. DIRTY', cls:'GUITARRISTA DE AFRODITA', moves:['NUBE DE LACA','SHRED DE SPANDEX','POSE ETERNA','PEINADO DE ESTADIO'] },
      before:[
        { who:'ricardo', text:'Llegó temprano, le reconozco. Antes de ustedes tocó Afrodita. Rock de los ochenta, muy profesional.', fx: idle([['checho',72],['ricardo',184]]) },
        { who:'ricardo', text:'Si quiere que los tenga en cuenta, gánele a su guitarrista.', fx(){ setStage(sceneDirtyEnter()); } },
        { who:'laca', text:'Nunca los he escuchado. Claro, yo solo escucho bandas de nivel, jajajaja.', fx: idle([['checho',72],['laca',176,{anim:'rie'}]]) },
        { who:'checho', text:'Debería llamarse Mr. Blower con ese peinado… ¿o Mr. Poser? Jajaja.', fx: idle([['checho',72],['laca',176]]) },
        { who:'laca', text:'Se llama estilo. Duelo de solos: el que suene más duro se queda con el escenario.' },
        { who:'checho', text:'Entonces que se oiga hasta el Arena Capital.', fx: idle([['checho',72,{strum:true}],['laca',176,{strum:true}]]) },
        { who:'narr', text:'JEFE · Toca cada botón cuando su nota llegue abajo y mantén presionado en las notas largas. Si el medidor de ROCK llega al rojo, pierdes una vida. Son 3 fases.' } ] }
  ],
  outro:[
    { who:'checho', text:'¡¡Heeeeeey!!… ¡Ahora sí me escuchan!', fx(){ setStage(sceneIdle({ cast:[['checho',100,{jump:true}]], party:true, label:'¡LISTO!' })); SFX.hey(); } },
    { who:'laca', text:'Esto no se queda así. Nos vemos en el Arena Capital… desde primera fila.' },
    { who:'ricardo', text:'Nada mal. Para ser uno. Si a las 11:00 p.m. no están los cinco, se olvidan de Mötley Brüe.', fx(){ setStage(sceneRicardoEnter()); } },
    { who:'checho', text:'Ya vuelvo. Con todo Kabbaret. ¿El Coliseo Mexa queda en Chapinero, no?', fx(){ setStage(sceneChechoExit()); } }
  ],
  mapSub:'¡CHECHO EN TARIMA! FALTAN 4 · SIGUIENTE: COLISEO MEXA'
};

